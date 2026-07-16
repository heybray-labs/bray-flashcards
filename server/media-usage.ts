/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { eq, inArray } from "drizzle-orm";
import type { MediaUsageHook } from "@heybray/media";
import { db } from "./db.ts";
import { decks } from "./schema/decks.ts";

export const deckMediaUsage: MediaUsageHook = {
  async countUsages(mediaIds: number[]): Promise<Map<number, number>> {
    const result = new Map<number, number>();
    if (!mediaIds.length) return result;

    const rows = await db
      .select({ mediaId: decks.coverImageMediaId })
      .from(decks)
      .where(inArray(decks.coverImageMediaId, mediaIds));

    for (const row of rows) {
      if (row.mediaId == null) continue;
      result.set(row.mediaId, (result.get(row.mediaId) ?? 0) + 1);
    }
    return result;
  },

  async onMediaDeleted(mediaId: number): Promise<void> {
    await db
      .update(decks)
      .set({ coverImageMediaId: null, updatedAt: new Date() })
      .where(eq(decks.coverImageMediaId, mediaId));
  },
};
