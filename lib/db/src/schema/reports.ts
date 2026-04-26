import {
  pgTable,
  serial,
  text,
  timestamp,
  date,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  status: text("status").notNull().default("active"),
  documentType: text("document_type").notNull(),
  title: text("title").notNull(),
  nameOnDocument: text("name_on_document"),
  description: text("description").notNull(),
  location: text("location").notNull(),
  eventDate: date("event_date").notNull(),
  contactName: text("contact_name").notNull(),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  photoUrl: text("photo_url"),
  reward: text("reward"),
  flagCount: integer("flag_count").notNull().default(0),
  userId: varchar("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .notNull()
    .references(() => reportsTable.id, { onDelete: "cascade" }),
  authorName: text("author_name").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentTypesTable = pgTable("document_types", {
  slug: text("slug").primaryKey(),
  label: text("label").notNull(),
});

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  documentType: text("document_type").notNull(),
  location: text("location").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Report = typeof reportsTable.$inferSelect;
export type InsertReport = typeof reportsTable.$inferInsert;
export type Message = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
export type DocumentTypeRow = typeof documentTypesTable.$inferSelect;
export type ActivityRow = typeof activityTable.$inferSelect;
