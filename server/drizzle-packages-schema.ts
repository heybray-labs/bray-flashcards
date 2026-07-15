/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

// Re-exports published @heybray package tables for drizzle-kit (Step 1 generates 0000).
export { mediaAssets } from "@heybray/media/schema";
export { users, roles, teams, userIdentities, authExchangeCodes } from "@heybray/identity/schema";
export { classificationDimensions, classificationOptions, contentClassificationLinks } from "@heybray/taxonomy/schema";
export { rewardTiers, userContentTierAwards, activityLog, gamificationContent, pointTransactions } from "@heybray/gamification/schema";
