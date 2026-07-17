/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import type { ComponentType } from "react";
import HomePage from "./pages/HomePage";
import DeckDetailPage from "./pages/DeckDetailPage";
import StudyPage from "./pages/StudyPage";
import SessionResultsPage from "./pages/SessionResultsPage";
import TeamStarMapPage from "./pages/TeamStarMapPage";
import { registerAdminPanels } from "./admin-panels";

export interface FlashcardsRoute {
  path: string;
  component: ComponentType;
}

const routes: FlashcardsRoute[] = [
  { path: "/", component: HomePage },
  { path: "/decks/:id", component: DeckDetailPage },
  { path: "/decks/:id/study/:sessionId", component: StudyPage },
  { path: "/decks/:id/results/:sessionId", component: SessionResultsPage },
  { path: "/team-star-map", component: TeamStarMapPage },
];

export const flashcardsApp = {
  routes,
  registerAdminPanels,
  contentPath: (_contentType: string, contentId: number): string => `/decks/${contentId}`,
};

export { registerAdminPanels };
