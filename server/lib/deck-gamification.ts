/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { and, eq, inArray } from "drizzle-orm";
import {
  DEFAULT_REWARD_TIERS,
  normalizeRewardTiers,
  resolveRewardTierDisplay,
  rewardTierInputSchema,
  rewardTiers,
  tierNameFromStarLevel,
  type RewardTierInput,
} from "@heybray/gamification";
import { db } from "../db.ts";
import { DECK_CONTENT_TYPE, gamification } from "../gamification.ts";

export async function syncDeckContent(deck: {
  id: number;
  title: string;
  status: string;
}): Promise<void> {
  await gamification.syncContent([
    {
      contentType: DECK_CONTENT_TYPE,
      contentId: deck.id,
      title: deck.title,
      isActive: deck.status === "published",
    },
  ]);
}

export async function seedDefaultRewardTiers(deckId: number): Promise<void> {
  const existing = await gamification.getRewardTiers(DECK_CONTENT_TYPE, deckId);
  if (existing.length > 0) return;

  const normalized = normalizeRewardTiers(DEFAULT_REWARD_TIERS);
  for (let i = 0; i < normalized.length; i++) {
    const tier = normalized[i];
    const starLevel = tier.starLevel ?? i + 1;
    const display = resolveRewardTierDisplay({ starLevel });
    await db.insert(rewardTiers).values({
      contentType: DECK_CONTENT_TYPE,
      contentId: deckId,
      tierName: tierNameFromStarLevel(starLevel),
      minScorePercent: tier.minScorePercent,
      rewardPoints: tier.rewardPoints,
      orderIndex: tier.orderIndex ?? i,
      starLevel,
      color: display.color,
      icon: null,
    });
  }
}

export async function replaceDeckRewardTiers(
  deckId: number,
  tiersInput: RewardTierInput[],
): Promise<void> {
  const parsed = rewardTierInputSchema.array().parse(tiersInput);
  if (!parsed.length) {
    await db
      .delete(rewardTiers)
      .where(
        and(eq(rewardTiers.contentType, DECK_CONTENT_TYPE), eq(rewardTiers.contentId, deckId)),
      );
    return;
  }

  const normalized = normalizeRewardTiers(parsed);
  const existingTiers = await db
    .select()
    .from(rewardTiers)
    .where(
      and(eq(rewardTiers.contentType, DECK_CONTENT_TYPE), eq(rewardTiers.contentId, deckId)),
    );

  const keptTierIds: number[] = [];
  let tierOrderIndex = 0;
  for (const tier of normalized) {
    const starLevel = tier.starLevel ?? tierOrderIndex + 1;
    const display = resolveRewardTierDisplay({ starLevel });
    const data = {
      contentType: DECK_CONTENT_TYPE,
      contentId: deckId,
      tierName: tierNameFromStarLevel(starLevel),
      minScorePercent: tier.minScorePercent,
      rewardPoints: tier.rewardPoints,
      orderIndex: tier.orderIndex ?? tierOrderIndex++,
      starLevel,
      color: display.color,
      icon: null,
    };
    const existingMatch = tier.id
      ? existingTiers.find((e) => e.id === tier.id)
      : existingTiers.find((e) => e.starLevel === starLevel);
    if (existingMatch) {
      await db.update(rewardTiers).set(data).where(eq(rewardTiers.id, existingMatch.id));
      keptTierIds.push(existingMatch.id);
    } else {
      const [inserted] = await db.insert(rewardTiers).values(data).returning();
      keptTierIds.push(inserted.id);
    }
  }

  const tiersToDelete = existingTiers
    .filter((e) => !keptTierIds.includes(e.id))
    .map((e) => e.id);
  if (tiersToDelete.length) {
    await db.delete(rewardTiers).where(inArray(rewardTiers.id, tiersToDelete));
  }
}
