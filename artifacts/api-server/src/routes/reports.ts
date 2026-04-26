import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  reportsTable,
  messagesTable,
  activityTable,
  documentTypesTable,
} from "@workspace/db";
import {
  ListReportsQueryParams,
  CreateReportBody,
  GetReportParams,
  UpdateReportStatusParams,
  UpdateReportStatusBody,
  GetMatchSuggestionsParams,
  FlagReportParams,
  FlagReportBody,
  ListMessagesParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";
import { and, desc, eq, gte, lte, ilike, or, sql, ne } from "drizzle-orm";

const router: IRouter = Router();

type ReportRow = typeof reportsTable.$inferSelect;

function serializeReport(r: ReportRow) {
  return {
    id: r.id,
    kind: r.kind,
    status: r.status,
    documentType: r.documentType,
    title: r.title,
    nameOnDocument: r.nameOnDocument,
    description: r.description,
    location: r.location,
    eventDate: r.eventDate,
    contactName: r.contactName,
    contactPhone: r.contactPhone,
    contactEmail: r.contactEmail,
    photoUrl: r.photoUrl,
    reward: r.reward,
    createdAt:
      r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

function tokenize(s: string | null | undefined) {
  if (!s) return new Set<string>();
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1),
  );
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function similarityScore(a: ReportRow, b: ReportRow) {
  const docMatch = a.documentType === b.documentType ? 0.4 : 0;
  const locTokensA = tokenize(a.location);
  const locTokensB = tokenize(b.location);
  const locScore = jaccard(locTokensA, locTokensB) * 0.25;
  const nameTokensA = tokenize(`${a.nameOnDocument ?? ""} ${a.title}`);
  const nameTokensB = tokenize(`${b.nameOnDocument ?? ""} ${b.title}`);
  const nameScore = jaccard(nameTokensA, nameTokensB) * 0.25;
  const descTokensA = tokenize(a.description);
  const descTokensB = tokenize(b.description);
  const descScore = jaccard(descTokensA, descTokensB) * 0.1;
  return Math.min(1, docMatch + locScore + nameScore + descScore);
}

function matchReason(a: ReportRow, b: ReportRow) {
  const reasons: string[] = [];
  if (a.documentType === b.documentType) reasons.push("same document type");
  const locA = tokenize(a.location);
  const locB = tokenize(b.location);
  for (const t of locA) {
    if (locB.has(t)) {
      reasons.push(`location mentions "${t}"`);
      break;
    }
  }
  const nameA = tokenize(`${a.nameOnDocument ?? ""} ${a.title}`);
  const nameB = tokenize(`${b.nameOnDocument ?? ""} ${b.title}`);
  for (const t of nameA) {
    if (nameB.has(t)) {
      reasons.push(`shared keyword "${t}"`);
      break;
    }
  }
  if (reasons.length === 0) return "general similarity";
  return reasons.join(" • ");
}

router.get("/reports", async (req, res, next) => {
  try {
    const params = ListReportsQueryParams.parse(req.query);
    const conditions = [];
    if (params.kind) conditions.push(eq(reportsTable.kind, params.kind));
    if (params.status) conditions.push(eq(reportsTable.status, params.status));
    if (params.documentType)
      conditions.push(eq(reportsTable.documentType, params.documentType));
    if (params.location)
      conditions.push(ilike(reportsTable.location, `%${params.location}%`));
    if (params.dateFrom)
      conditions.push(
        gte(reportsTable.eventDate, params.dateFrom.toISOString().slice(0, 10)),
      );
    if (params.dateTo)
      conditions.push(
        lte(reportsTable.eventDate, params.dateTo.toISOString().slice(0, 10)),
      );
    if (params.query) {
      const q = `%${params.query}%`;
      const queryCondition = or(
        ilike(reportsTable.title, q),
        ilike(reportsTable.description, q),
        ilike(reportsTable.location, q),
        ilike(reportsTable.nameOnDocument, q),
      );
      if (queryCondition) conditions.push(queryCondition);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const rows = await db
      .select()
      .from(reportsTable)
      .where(where)
      .orderBy(desc(reportsTable.createdAt))
      .limit(200);
    res.json(rows.map(serializeReport));
  } catch (err) {
    next(err);
  }
});

router.post("/reports", async (req, res, next) => {
  try {
    const body = CreateReportBody.parse(req.body);
    const eventDateString =
      body.eventDate instanceof Date
        ? body.eventDate.toISOString().slice(0, 10)
        : String(body.eventDate);
    const [inserted] = await db
      .insert(reportsTable)
      .values({
        kind: body.kind,
        documentType: body.documentType,
        title: body.title,
        nameOnDocument: body.nameOnDocument ?? null,
        description: body.description,
        location: body.location,
        eventDate: eventDateString,
        contactName: body.contactName,
        contactPhone: body.contactPhone ?? null,
        contactEmail: body.contactEmail ?? null,
        photoUrl: body.photoUrl ?? null,
        reward: body.reward ?? null,
      })
      .returning();

    if (!inserted) {
      res.status(500).json({ error: "Failed to create report" });
      return;
    }

    await db.insert(activityTable).values({
      kind: "new_report",
      title: `New ${body.kind} report: ${body.title}`,
      documentType: body.documentType,
      location: body.location,
    });

    res.status(201).json(serializeReport(inserted));
  } catch (err) {
    next(err);
  }
});

router.get("/reports/:id", async (req, res, next) => {
  try {
    const { id } = GetReportParams.parse(req.params);
    const [row] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    const [{ count: messageCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messagesTable)
      .where(eq(messagesTable.reportId, id));

    const oppositeKind = row.kind === "lost" ? "found" : "lost";
    const others = await db
      .select()
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.kind, oppositeKind),
          ne(reportsTable.id, row.id),
          ne(reportsTable.status, "closed"),
        ),
      )
      .limit(50);

    const suggestedMatches = others
      .map((o) => ({
        report: serializeReport(o),
        score: Number(similarityScore(row, o).toFixed(2)),
        reason: matchReason(row, o),
      }))
      .filter((m) => m.score > 0.15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json({
      ...serializeReport(row),
      messageCount: messageCount ?? 0,
      suggestedMatches,
    });
  } catch (err) {
    next(err);
  }
});

router.patch("/reports/:id", async (req, res, next) => {
  try {
    const { id } = UpdateReportStatusParams.parse(req.params);
    const body = UpdateReportStatusBody.parse(req.body);

    const [updated] = await db
      .update(reportsTable)
      .set({ status: body.status })
      .where(eq(reportsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    if (body.status === "claimed" || body.status === "matched") {
      await db.insert(activityTable).values({
        kind: body.status === "claimed" ? "recovery" : "match",
        title:
          body.status === "claimed"
            ? `Recovered: ${updated.title}`
            : `Match found: ${updated.title}`,
        documentType: updated.documentType,
        location: updated.location,
      });
    }

    res.json(serializeReport(updated));
  } catch (err) {
    next(err);
  }
});

router.get("/reports/:id/matches", async (req, res, next) => {
  try {
    const { id } = GetMatchSuggestionsParams.parse(req.params);
    const [row] = await db
      .select()
      .from(reportsTable)
      .where(eq(reportsTable.id, id))
      .limit(1);
    if (!row) {
      res.json([]);
      return;
    }
    const oppositeKind = row.kind === "lost" ? "found" : "lost";
    const others = await db
      .select()
      .from(reportsTable)
      .where(
        and(
          eq(reportsTable.kind, oppositeKind),
          ne(reportsTable.id, row.id),
          ne(reportsTable.status, "closed"),
        ),
      )
      .limit(100);
    const suggestions = others
      .map((o) => ({
        report: serializeReport(o),
        score: Number(similarityScore(row, o).toFixed(2)),
        reason: matchReason(row, o),
      }))
      .filter((m) => m.score > 0.15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    res.json(suggestions);
  } catch (err) {
    next(err);
  }
});

router.post("/reports/:id/flag", async (req, res, next) => {
  try {
    const { id } = FlagReportParams.parse(req.params);
    FlagReportBody.parse(req.body);
    const [updated] = await db
      .update(reportsTable)
      .set({
        flagCount: sql`${reportsTable.flagCount} + 1`,
      })
      .where(eq(reportsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Report not found" });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get("/reports/:id/messages", async (req, res, next) => {
  try {
    const { id } = ListMessagesParams.parse(req.params);
    const rows = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.reportId, id))
      .orderBy(messagesTable.createdAt);
    res.json(
      rows.map((m) => ({
        id: m.id,
        reportId: m.reportId,
        authorName: m.authorName,
        body: m.body,
        createdAt:
          m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/reports/:id/messages", async (req, res, next) => {
  try {
    const { id } = SendMessageParams.parse(req.params);
    const body = SendMessageBody.parse(req.body);
    const [inserted] = await db
      .insert(messagesTable)
      .values({
        reportId: id,
        authorName: body.authorName,
        body: body.body,
      })
      .returning();
    if (!inserted) {
      res.status(500).json({ error: "Failed to send message" });
      return;
    }
    res.status(201).json({
      id: inserted.id,
      reportId: inserted.reportId,
      authorName: inserted.authorName,
      body: inserted.body,
      createdAt:
        inserted.createdAt instanceof Date
          ? inserted.createdAt.toISOString()
          : inserted.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/stats/summary", async (_req, res, next) => {
  try {
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(reportsTable);
    const [{ activeLost }] = await db
      .select({ activeLost: sql<number>`count(*)::int` })
      .from(reportsTable)
      .where(and(eq(reportsTable.kind, "lost"), eq(reportsTable.status, "active")));
    const [{ activeFound }] = await db
      .select({ activeFound: sql<number>`count(*)::int` })
      .from(reportsTable)
      .where(and(eq(reportsTable.kind, "found"), eq(reportsTable.status, "active")));
    const [{ recoveries }] = await db
      .select({ recoveries: sql<number>`count(*)::int` })
      .from(reportsTable)
      .where(eq(reportsTable.status, "claimed"));
    const totalNum = total ?? 0;
    const recoveryRate =
      totalNum === 0 ? 0 : Number((((recoveries ?? 0) / totalNum) * 100).toFixed(1));
    res.json({
      totalReports: totalNum,
      activeLost: activeLost ?? 0,
      activeFound: activeFound ?? 0,
      successfulRecoveries: recoveries ?? 0,
      recoveryRate,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/stats/recent", async (_req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(activityTable)
      .orderBy(desc(activityTable.timestamp))
      .limit(20);
    res.json(
      rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        title: r.title,
        documentType: r.documentType,
        location: r.location,
        timestamp:
          r.timestamp instanceof Date
            ? r.timestamp.toISOString()
            : r.timestamp,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/stats/by-document-type", async (_req, res, next) => {
  try {
    const docs = await db.select().from(documentTypesTable);
    const labels = new Map(docs.map((d) => [d.slug, d.label]));
    const rows = await db
      .select({
        documentType: reportsTable.documentType,
        kind: reportsTable.kind,
        count: sql<number>`count(*)::int`,
      })
      .from(reportsTable)
      .where(eq(reportsTable.status, "active"))
      .groupBy(reportsTable.documentType, reportsTable.kind);

    const grouped = new Map<string, { lostCount: number; foundCount: number }>();
    for (const r of rows) {
      const cur = grouped.get(r.documentType) ?? { lostCount: 0, foundCount: 0 };
      if (r.kind === "lost") cur.lostCount = r.count;
      if (r.kind === "found") cur.foundCount = r.count;
      grouped.set(r.documentType, cur);
    }

    const result = Array.from(grouped.entries()).map(([slug, counts]) => ({
      documentType: slug,
      label: labels.get(slug) ?? slug,
      lostCount: counts.lostCount,
      foundCount: counts.foundCount,
    }));

    result.sort((a, b) => b.lostCount + b.foundCount - (a.lostCount + a.foundCount));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/meta/document-types", async (_req, res, next) => {
  try {
    const rows = await db.select().from(documentTypesTable).orderBy(documentTypesTable.label);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/meta/locations", async (_req, res, next) => {
  try {
    const rows = await db
      .selectDistinct({ location: reportsTable.location })
      .from(reportsTable)
      .orderBy(reportsTable.location);
    res.json(rows.map((r) => r.location).filter(Boolean));
  } catch (err) {
    next(err);
  }
});

export default router;
