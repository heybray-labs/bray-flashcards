/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import type { UserWithRole } from "@heybray/identity/schema";
import { teamStarMapController } from "./controllers/team-star-map.controller.ts";

export async function getDeckStarMap(user: UserWithRole, teamId: number | "all") {
  return teamStarMapController.getStarMap(user, teamId);
}

export async function getDeckMemberProgress(
  user: UserWithRole,
  teamId: number | "all",
  memberUserId: number,
) {
  return teamStarMapController.getMemberProgress(user, teamId, memberUserId);
}

export async function getDeckMemberContentHistory(
  user: UserWithRole,
  teamId: number | "all",
  memberUserId: number,
) {
  return teamStarMapController.getMemberContentHistory(user, teamId, memberUserId);
}

export async function getDeckMemberContentAttempts(
  user: UserWithRole,
  teamId: number | "all",
  memberUserId: number,
  contentId: number,
) {
  return teamStarMapController.getMemberContentAttempts(user, teamId, memberUserId, contentId);
}
