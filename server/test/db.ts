/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { sql } from "drizzle-orm";
import { db, pool } from "../db.ts";

const TABLES_TO_TRUNCATE = [
  "point_transactions",
  "user_content_tier_awards",
  "reward_tiers",
  "activity_log",
  "gamification_content",
  "content_classification_links",
  "study_sessions",
  "cards",
  "decks",
  "media_assets",
  "auth_exchange_codes",
  "user_identities",
  "teams",
  "users",
];

export async function resetMutableData(): Promise<void> {
  const tableList = TABLES_TO_TRUNCATE.join(", ");
  await db.execute(sql.raw(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`));
}

export async function closeTestPool(): Promise<void> {
  await pool.end();
}
