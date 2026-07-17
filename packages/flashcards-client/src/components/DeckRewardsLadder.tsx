/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { Award } from "lucide-react";
import { RewardTierLabel } from "@heybray/gamification-react/points/RewardTierLabel";
import { TierStars } from "@heybray/gamification-react/points/TierStars";
import { resolveRewardTierDisplay } from "@heybray/gamification/schema";
import { classificationChipStyle } from "@heybray/react/lib/classification-display";

type RewardTierRow = {
  id?: number;
  tierName: string;
  minScorePercent: number;
  rewardPoints: number;
  starLevel: number;
  color?: string | null;
};

type DeckRewardsLadderProps = {
  tiers: RewardTierRow[];
  bestScore: number | null;
  passThreshold: number;
};

export function DeckRewardsLadder({ tiers, bestScore, passThreshold }: DeckRewardsLadderProps) {
  if (!tiers.length) return null;

  const sorted = [...tiers].sort(
    (a, b) => a.starLevel - b.starLevel || a.minScorePercent - b.minScorePercent,
  );
  const hasAttempt = bestScore != null;
  const nextTier = hasAttempt
    ? sorted.find((t) => bestScore! < t.minScorePercent) ?? null
    : sorted[0] ?? null;

  return (
    <section className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Reward tiers</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Pass threshold: {passThreshold}% ·{" "}
        {hasAttempt ? `Your best: ${Math.round(bestScore!)}%` : "No completed sessions yet"}
      </p>
      <ul className="space-y-2">
        {sorted.map((tier) => {
          const achieved = hasAttempt && bestScore! >= tier.minScorePercent;
          const isNext = nextTier?.starLevel === tier.starLevel;
          const display = resolveRewardTierDisplay(tier);
          return (
            <li
              key={tier.id ?? tier.starLevel}
              className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              style={isNext ? classificationChipStyle(display.color) : undefined}
            >
              <div className="flex items-center gap-2 min-w-0">
                <TierStars level={tier.starLevel as 1 | 2 | 3} size="sm" />
                <RewardTierLabel tierName={tier.tierName} color={display.color} />
                <span className="text-sm text-muted-foreground truncate">
                  ≥ {tier.minScorePercent}% · {tier.rewardPoints} pts
                </span>
              </div>
              {achieved ? (
                <span className="text-xs font-semibold text-success">Achieved</span>
              ) : isNext ? (
                <span className="text-xs font-semibold text-primary">Next</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
