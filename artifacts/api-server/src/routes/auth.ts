import crypto from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { and, eq, isNull, gt } from "drizzle-orm";
import { db, usersTable, passwordResetTokensTable } from "@workspace/db";
import {
  GetCurrentAuthUserResponse,
  RegisterUserBody,
  LoginUserBody,
  LoginUserResponse,
  LogoutSessionResponse,
  RequestPasswordResetBody,
  RequestPasswordResetResponse,
  ResetPasswordBody,
  ResetPasswordResponse,
} from "@workspace/api-zod";
import {
  clearSession,
  createSession,
  getSessionId,
  SESSION_COOKIE,
  SESSION_TTL,
} from "../lib/auth";
import { buildPasswordResetEmail, sendEmail } from "../lib/email";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getAppOrigin(req: Request): string {
  const envOrigin = process.env.APP_ORIGIN?.replace(/\/$/, "");
  if (envOrigin) return envOrigin;
  const proto =
    (req.headers["x-forwarded-proto"]?.toString().split(",")[0] ?? "") ||
    req.protocol;
  const host = req.headers["x-forwarded-host"]?.toString() || req.get("host") || "";
  return `${proto}://${host}`;
}

const router: IRouter = Router();

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function publicUser(u: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
  };
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

router.post("/auth/register", async (req: Request, res: Response) => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error:
        parsed.error.issues[0]?.message ?? "Invalid registration details",
    });
    return;
  }
  const { email, password, firstName, lastName } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  if (existing) {
    res
      .status(409)
      .json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(usersTable)
    .values({
      email: normalizedEmail,
      passwordHash,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
    })
    .returning();
  if (!user) {
    res.status(500).json({ error: "Failed to create account" });
    return;
  }

  const u = publicUser(user);
  const sid = await createSession({ user: u });
  setSessionCookie(res, sid);
  res.status(201).json(LoginUserResponse.parse({ user: u }));
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid login details" });
    return;
  }
  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail))
    .limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const u = publicUser(user);
  const sid = await createSession({ user: u });
  setSessionCookie(res, sid);
  res.json(LoginUserResponse.parse({ user: u }));
});

router.post("/auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.json(LogoutSessionResponse.parse({ success: true }));
});

router.post(
  "/auth/request-password-reset",
  async (req: Request, res: Response) => {
    const parsed = RequestPasswordResetBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Please enter a valid email address" });
      return;
    }
    const normalizedEmail = parsed.data.email.toLowerCase().trim();

    // Always respond success to prevent account enumeration.
    const success = RequestPasswordResetResponse.parse({ success: true });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalizedEmail))
      .limit(1);

    if (!user) {
      res.json(success);
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const origin = getAppOrigin(req);
    const resetUrl = `${origin}/reset-password?token=${token}`;
    const email = buildPasswordResetEmail({ resetUrl, email: normalizedEmail });

    try {
      await sendEmail({ to: normalizedEmail, ...email });
    } catch (err) {
      console.error("[auth] Failed to send password reset email", err);
    }

    res.json(success);
  },
);

router.post("/auth/reset-password", async (req: Request, res: Response) => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error:
        parsed.error.issues[0]?.message ?? "Invalid token or password",
    });
    return;
  }
  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const [row] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(
      and(
        eq(passwordResetTokensTable.tokenHash, tokenHash),
        isNull(passwordResetTokensTable.usedAt),
        gt(passwordResetTokensTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!row) {
    res.status(400).json({
      error: "This reset link is invalid or has expired. Please request a new one.",
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .update(usersTable)
    .set({ passwordHash })
    .where(eq(usersTable.id, row.userId));

  await db
    .update(passwordResetTokensTable)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokensTable.id, row.id));

  res.json(ResetPasswordResponse.parse({ success: true }));
});

export default router;
