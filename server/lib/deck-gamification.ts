/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { rewardTierInputSchema, type RewardTierInput } from "@heybray/gamification";
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
  await gamification.ensureDefaultRewardTiers(DECK_CONTENT_TYPE, deckId);
}

export async function replaceDeckRewardTiers(
  deckId: number,
  tiersInput: RewardTierInput[],
): Promise<void> {
  const parsed = rewardTierInputSchema.array().parse(tiersInput);
  await gamification.setRewardTiers(DECK_CONTENT_TYPE, deckId, parsed);
}
