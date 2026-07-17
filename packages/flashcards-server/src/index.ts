/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { decks, cards, studySessions } from "./schema/decks.ts";
import { registerRoutes } from "./register-routes.ts";
import { registerDomainRoutes, type FlashcardsServerDeps } from "./register-domain-routes.ts";
import {
  reconcileGamificationProjection,
  gamification,
  teamStarMap,
  DECK_CONTENT_TYPE,
  MASTERY_DIMENSION_SLUG,
  MANAGE_PERMISSION,
} from "./gamification.ts";
import { deckMediaUsage } from "./media-usage.ts";
import { seedDatabase } from "./seed.ts";
import { seedClassifications } from "./seed-classifications.ts";

export const flashcardsSchema = { decks, cards, studySessions };

export const flashcardsModule = {
  schema: flashcardsSchema,
  // Historical migrations (0000–0002) stay in the shell; premium generates its own 0000.
  migrationsDir: null as string | null,
  registerRoutes,
  gamification: {
    contentTypes: [
      {
        type: DECK_CONTENT_TYPE,
        label: "Deck",
        masteryDimensionSlug: MASTERY_DIMENSION_SLUG,
      },
    ],
  },
  managePermission: MANAGE_PERMISSION,
  reconcileProjection: reconcileGamificationProjection,
  seedDatabase,
  seedClassifications,
};

export {
  registerRoutes,
  registerDomainRoutes,
  type FlashcardsServerDeps,
  reconcileGamificationProjection,
  gamification,
  teamStarMap,
  deckMediaUsage,
  seedDatabase,
  seedClassifications,
  DECK_CONTENT_TYPE,
  MASTERY_DIMENSION_SLUG,
  MANAGE_PERMISSION,
};
export {
  getDeckStarMap,
  getDeckMemberProgress,
  getDeckMemberContentHistory,
  getDeckMemberContentAttempts,
} from "./team-star-map-handlers.ts";
