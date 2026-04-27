import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  GetCurrentAuthUserResponse,
  RegisterUserBody,
  LoginUserBody,
  LoginUserResponse,
  LogoutSessionResponse,
} from "@workspace/api-zod";
import {
  clearSession,
  createSession,
  getSessionId,
  SESSION_COOKIE,
  SESSION_TTL,
} from "../lib/auth";

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

export default router;
