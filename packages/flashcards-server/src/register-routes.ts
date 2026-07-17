/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import express, { Router } from "express";
import { registerDomainRoutes, type FlashcardsServerDeps } from "./register-domain-routes.ts";
import teamStarMapRoutes from "./routes/team-star-map.ts";
import {
  DECK_CONTENT_TYPE,
  MANAGE_PERMISSION,
  MASTERY_DIMENSION_SLUG,
} from "./gamification.ts";
import { createTaxonomyRouter } from "@heybray/taxonomy";
import { createGamificationRouter } from "@heybray/gamification";
import { requireFeature } from "@heybray/server-kit";
import { createMediaRouter } from "@heybray/media";
import {
  teamsRouter,
  authenticateToken,
  requirePasswordChanged,
  requirePermission,
  setManagePermission,
} from "@heybray/identity";

export type { FlashcardsServerDeps };

export function registerRoutes(
  app: express.Application,
  _deps: FlashcardsServerDeps = {},
): void {
  setManagePermission(MANAGE_PERMISSION);

  registerDomainRoutes(app, _deps);

  app.use(
    "/api/media",
    createMediaRouter({
      authenticateToken,
      requirePasswordChanged,
      requireManage: requirePermission(MANAGE_PERMISSION),
    }),
  );
  app.use(
    "/api/classifications",
    createTaxonomyRouter({ managePermission: MANAGE_PERMISSION }),
  );
  app.use(
    "/api/points",
    createGamificationRouter(
      {
        contentTypes: [{ type: DECK_CONTENT_TYPE, label: "Deck" }],
        masteryDimensionSlug: MASTERY_DIMENSION_SLUG,
        managePermission: MANAGE_PERMISSION,
      },
      {
        leaderboardMiddleware: [requireFeature("leaderboard")],
      },
    ),
  );

  const teamsRoot = Router();
  teamsRoot.use(authenticateToken);
  teamsRoot.use(requirePasswordChanged);
  teamsRoot.use(teamsRouter);
  teamsRoot.use(teamStarMapRoutes);
  app.use("/api/teams", teamsRoot);
}
