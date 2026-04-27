import { writeFileSync } from "node:fs";
import {
  db,
  reportsTable,
  documentTypesTable,
  activityTable,
  messagesTable,
  usersTable,
} from "@workspace/db";

function escapeLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  if (typeof value === "object") {
    const json = JSON.stringify(value).replace(/'/g, "''");
    return `'${json}'::jsonb`;
  }
  const str = String(value).replace(/'/g, "''");
  return `'${str}'`;
}

function buildInsert(
  tableName: string,
  rows: Record<string, unknown>[],
): string {
  if (rows.length === 0) {
    return `-- ${tableName}: no rows\n`;
  }
  const columns = Object.keys(rows[0]!);
  const colList = columns.map((c) => `"${camelToSnake(c)}"`).join(", ");
  const lines: string[] = [
    `-- ${tableName}: ${rows.length} rows`,
    `INSERT INTO "${tableName}" (${colList}) VALUES`,
  ];
  rows.forEach((row, i) => {
    const values = columns.map((c) => escapeLiteral(row[c])).join(", ");
    lines.push(`  (${values})${i === rows.length - 1 ? ";" : ","}`);
  });
  lines.push("");
  return lines.join("\n");
}

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

async function exportData() {
  console.log("Exporting database to database-export.sql ...");

  const [users, docTypes, reports, messages, activity] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(documentTypesTable),
    db.select().from(reportsTable),
    db.select().from(messagesTable),
    db.select().from(activityTable),
  ]);

  const parts: string[] = [
    "-- namFindz database export",
    `-- Generated at ${new Date().toISOString()}`,
    "-- ",
    "-- Run this AFTER `pnpm --filter @workspace/db run push` has created the tables.",
    "-- Wipes existing rows in each table before inserting.",
    "",
    "BEGIN;",
    "",
    "TRUNCATE TABLE messages, activity, reports, document_types, users RESTART IDENTITY CASCADE;",
    "",
    buildInsert("users", users as Record<string, unknown>[]),
    buildInsert("document_types", docTypes as Record<string, unknown>[]),
    buildInsert("reports", reports as Record<string, unknown>[]),
    buildInsert("messages", messages as Record<string, unknown>[]),
    buildInsert("activity", activity as Record<string, unknown>[]),
    "",
    "-- Reset sequences so future inserts don't collide with imported IDs",
    "SELECT setval(pg_get_serial_sequence('reports', 'id'), COALESCE((SELECT MAX(id) FROM reports), 0) + 1, false);",
    "SELECT setval(pg_get_serial_sequence('messages', 'id'), COALESCE((SELECT MAX(id) FROM messages), 0) + 1, false);",
    "SELECT setval(pg_get_serial_sequence('activity', 'id'), COALESCE((SELECT MAX(id) FROM activity), 0) + 1, false);",
    "",
    "COMMIT;",
    "",
  ];

  writeFileSync("database-export.sql", parts.join("\n"), "utf8");

  console.log(
    `Done. Wrote database-export.sql (${users.length} users, ${docTypes.length} document types, ${reports.length} reports, ${messages.length} messages, ${activity.length} activity items).`,
  );
  process.exit(0);
}

exportData().catch((err) => {
  console.error(err);
  process.exit(1);
});
