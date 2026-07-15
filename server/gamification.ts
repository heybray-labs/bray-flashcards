/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { GamificationService, TeamStarMapService, type ReconcileReport } from "@heybray/gamification";
import { db } from "./db.ts";
import { decks } from "./schema/decks.ts";
import { createLogger } from "@heybray/server-kit";

const log = createLogger("gamification");

export const DECK_CONTENT_TYPE = "deck";
export const MASTERY_DIMENSION_SLUG = "topic";
export const MANAGE_PERMISSION = "deck:manage";

export const gamification = new GamificationService({
  contentTypes: [{ type: DECK_CONTENT_TYPE, label: "Deck" }],
  masteryDimensionSlug: MASTERY_DIMENSION_SLUG,
  managePermission: MANAGE_PERMISSION,
});

export const teamStarMap = new TeamStarMapService(gamification, {
  contentType: DECK_CONTENT_TYPE,
  masteryDimensionSlug: MASTERY_DIMENSION_SLUG,
});

export async function reconcileGamificationProjection(): Promise<ReconcileReport> {
  const rows = await db
    .select({
      id: decks.id,
      title: decks.title,
      status: decks.status,
    })
    .from(decks);

  const report = await gamification.reconcile(
    rows.map((r) => ({
      contentType: DECK_CONTENT_TYPE,
      contentId: r.id,
      title: r.title,
      isActive: r.status === "published",
    })),
  );

  if (report.inserted > 0 || report.updated > 0 || report.deactivated > 0) {
    log.warn("Gamification content projection drift reconciled", report);
  }

  return report;
}
