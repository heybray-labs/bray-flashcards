/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { db } from "../db.ts";
import { decks, studySessions } from "../schema/decks.ts";
import { pointTransactions, starLevelFromTierName } from "@heybray/gamification";
import type { UserWithRole } from "@heybray/identity/schema";
import { assertMemberTeamAccess } from "@heybray/identity";
import { and, desc, eq, inArray } from "drizzle-orm";
import { teamStarMap } from "../gamification.ts";
import type { MemberContentHistoryResponse } from "@heybray/gamification";

export const teamStarMapController = {
  async getStarMap(user: UserWithRole, teamId: number | "all") {
    return teamStarMap.getStarMap(user, teamId);
  },

  async getMemberProgress(user: UserWithRole, teamId: number | "all", memberUserId: number) {
    return teamStarMap.getMemberProgress(user, teamId, memberUserId);
  },

  async getMemberContentHistory(
    user: UserWithRole,
    teamId: number | "all",
    memberUserId: number,
  ) {
    const generic: MemberContentHistoryResponse = await teamStarMap.getMemberContentHistory(
      user,
      teamId,
      memberUserId,
    );

    const contentIds = generic.categories.flatMap((c) => c.contents.map((s) => s.contentId));
    const coverByDeck = new Map<number, number | null>();
    if (contentIds.length) {
      const coverRows = await db
        .select({ id: decks.id, coverImageMediaId: decks.coverImageMediaId })
        .from(decks)
        .where(inArray(decks.id, contentIds));
      for (const row of coverRows) coverByDeck.set(row.id, row.coverImageMediaId);
    }

    return {
      userId: generic.userId,
      name: generic.name,
      avatarInitials: generic.avatarInitials,
      teamName: generic.teamName,
      totalPoints: generic.totalPoints,
      passRate: generic.passRate,
      categories: generic.categories.map((category) => ({
        slug: category.slug,
        label: category.label,
        total: category.total,
        starCounts: category.starCounts,
        contents: category.contents.map((content) => ({
          contentId: content.contentId,
          title: content.title,
          coverImageMediaId: coverByDeck.get(content.contentId) ?? null,
          starLevel: content.starLevel,
          bestScore: content.bestScore,
          lastAttemptAt: content.lastAttemptAt,
          attemptCount: content.attemptCount,
        })),
      })),
    };
  },

  async getMemberContentAttempts(
    user: UserWithRole,
    teamId: number | "all",
    memberUserId: number,
    contentId: number,
  ) {
    await assertMemberTeamAccess(user, teamId, memberUserId);

    const rows = await db
      .select({
        id: studySessions.id,
        scorePercent: studySessions.scorePercent,
        status: studySessions.status,
        completedAt: studySessions.completedAt,
        tierName: pointTransactions.tierName,
      })
      .from(studySessions)
      .leftJoin(pointTransactions, eq(pointTransactions.activityId, studySessions.id))
      .where(
        and(
          eq(studySessions.userId, memberUserId),
          eq(studySessions.deckId, contentId),
          eq(studySessions.status, "completed"),
        ),
      )
      .orderBy(desc(studySessions.completedAt));

    return rows.map((row, index) => {
      const starLevel = row.tierName ? starLevelFromTierName(row.tierName) : 0;
      const score = row.scorePercent != null ? Number(row.scorePercent) : null;
      return {
        id: row.id,
        attemptNumber: rows.length - index,
        score,
        isPassed: score != null ? score >= 70 : null,
        status: row.status,
        completedAt: row.completedAt ? new Date(row.completedAt).toISOString() : null,
        tierName: row.tierName ?? null,
        starLevel: Math.min(3, Math.max(0, starLevel)) as 0 | 1 | 2 | 3,
      };
    });
  },
};
