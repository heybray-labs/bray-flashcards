/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 *
 * Removes demo-prefixed decks, demo users, and related gamification data.
 * Run: npm run db:demo-wipe
 */

import { pathToFileURL } from "node:url";
import { and, eq, inArray, like } from "drizzle-orm";
import { users } from "@heybray/identity/schema";
import { contentClassificationLinks } from "@heybray/taxonomy/schema";
import {
  activityLog,
  gamificationContent,
  pointTransactions,
  rewardTiers,
  userContentTierAwards,
} from "@heybray/gamification/schema";
import { getStorageProvider, initStorage } from "@heybray/media";
import { mediaAssets } from "@heybray/media/schema";
import { createLogger } from "@heybray/server-kit";
import { DECK_CONTENT_TYPE, gamification as deckGamification } from "@heybray/flashcards-server";
import { decks } from "@heybray/flashcards-server/schema/decks";
import { db, pool } from "./db.ts";
import { DEMO_DECK_COVER_PREFIX } from "./demo-deck-cover-art.ts";

const log = createLogger("demo-wipe");

export const DEMO_TITLE_PREFIX = "[Demo] ";
export const DEMO_EMAIL_DOMAIN = "demo.local";

async function wipeDemoDeckGamification(demoDeckIds: number[]) {
  if (!demoDeckIds.length) return;

  await db
    .delete(pointTransactions)
    .where(
      and(
        eq(pointTransactions.contentType, DECK_CONTENT_TYPE),
        inArray(pointTransactions.contentId, demoDeckIds),
      ),
    );
  await db
    .delete(activityLog)
    .where(
      and(
        eq(activityLog.contentType, DECK_CONTENT_TYPE),
        inArray(activityLog.contentId, demoDeckIds),
      ),
    );
  await db
    .delete(userContentTierAwards)
    .where(
      and(
        eq(userContentTierAwards.contentType, DECK_CONTENT_TYPE),
        inArray(userContentTierAwards.contentId, demoDeckIds),
      ),
    );
  await db
    .delete(rewardTiers)
    .where(
      and(
        eq(rewardTiers.contentType, DECK_CONTENT_TYPE),
        inArray(rewardTiers.contentId, demoDeckIds),
      ),
    );
  await db
    .delete(contentClassificationLinks)
    .where(
      and(
        eq(contentClassificationLinks.contentType, DECK_CONTENT_TYPE),
        inArray(contentClassificationLinks.contentId, demoDeckIds),
      ),
    );
  await db
    .delete(gamificationContent)
    .where(
      and(
        eq(gamificationContent.contentType, DECK_CONTENT_TYPE),
        inArray(gamificationContent.contentId, demoDeckIds),
      ),
    );
}

async function wipeDemoDeckCovers() {
  const demoMedia = await db
    .select()
    .from(mediaAssets)
    .where(like(mediaAssets.storageKey, `${DEMO_DECK_COVER_PREFIX}%`));

  for (const asset of demoMedia) {
    await getStorageProvider()
      .delete(asset.storageKey)
      .catch(() => undefined);
  }

  if (demoMedia.length) {
    await db.delete(mediaAssets).where(like(mediaAssets.storageKey, `${DEMO_DECK_COVER_PREFIX}%`));
    log.info("Removed demo deck cover media", { count: demoMedia.length });
  }
}

export async function wipeDemoDecks() {
  await initStorage();

  const existing = await db
    .select({ id: decks.id })
    .from(decks)
    .where(like(decks.title, `${DEMO_TITLE_PREFIX}%`));

  const demoDeckIds = existing.map((row) => row.id);
  if (!demoDeckIds.length) {
    await wipeDemoDeckCovers();
    return 0;
  }

  await wipeDemoDeckGamification(demoDeckIds);
  await db.delete(decks).where(like(decks.title, `${DEMO_TITLE_PREFIX}%`));
  for (const deckId of demoDeckIds) {
    await deckGamification.onContentDeleted(DECK_CONTENT_TYPE, deckId);
  }
  await wipeDemoDeckCovers();
  log.info("Removed demo decks", { count: demoDeckIds.length });
  return demoDeckIds.length;
}

/** Remove demo decks (and cover media) then demo users. Safe to call before re-seeding. */
export async function wipeDemo(): Promise<{ deckCount: number; userCount: number }> {
  const deckCount = await wipeDemoDecks();
  const deletedUsers = await db
    .delete(users)
    .where(like(users.email, `%@${DEMO_EMAIL_DOMAIN}`))
    .returning({ id: users.id });

  if (deletedUsers.length) {
    log.info("Removed demo users", { count: deletedUsers.length });
  }

  return { deckCount, userCount: deletedUsers.length };
}

export async function demoWipeDatabase() {
  const { deckCount, userCount } = await wipeDemo();

  console.log("\n========================================");
  console.log("  Demo data removed");
  console.log("========================================\n");
  console.log(`Decks removed: ${deckCount}`);
  console.log(`Users removed: ${userCount}`);
  console.log("Non-demo content, settings, and other users are unchanged.\n");
}

const isDirectRun =
  process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  demoWipeDatabase()
    .then(() => pool.end())
    .catch((err) => {
      log.error("Demo wipe failed", err instanceof Error ? err : undefined);
      console.error(err);
      pool.end().finally(() => process.exit(1));
    });
}
