/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "@heybray/identity/schema";
import { mediaAssets } from "@heybray/media/schema";

export const decks = pgTable("decks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"),
  passThreshold: integer("pass_threshold").notNull().default(70),
  coverImageMediaId: integer("cover_image_media_id").references(() => mediaAssets.id, {
    onDelete: "set null",
  }),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  front: text("front").notNull(),
  back: text("back").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id")
    .notNull()
    .references(() => decks.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cardsTotal: integer("cards_total").notNull().default(0),
  cardsCorrect: integer("cards_correct").notNull().default(0),
  scorePercent: numeric("score_percent", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("in_progress"),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type Deck = typeof decks.$inferSelect;
export type Card = typeof cards.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
