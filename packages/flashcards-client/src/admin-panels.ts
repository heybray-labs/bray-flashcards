/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { createElement } from "react";
import { registerAdminPanel } from "@heybray/react/extensions/admin-registry";
import { UsersManagementPanel } from "@heybray/react/admin/UsersManagementPanel";
import { TeamsManagementPanel } from "@heybray/react/admin/TeamsManagementPanel";
import { MediaManagementPanel } from "@heybray/react/admin/MediaManagementPanel";
import { ClassificationManagementPanel } from "@heybray/react/admin/ClassificationManagementPanel";
import { AboutPanel } from "@heybray/react/components/AboutPanel";
import { DeckCover } from "@/components/DeckCover";
import logoSrc from "./assets/logo.svg";

let registered = false;

const DECK_MANAGE = "deck:manage";

export function registerAdminPanels(): void {
  if (registered) return;
  registered = true;

  registerAdminPanel({
    value: "users",
    label: "Users",
    requiresRole: "admin",
    render: () => createElement(UsersManagementPanel),
  });

  registerAdminPanel({
    value: "teams",
    label: "Teams",
    requiresRole: "admin",
    render: () => createElement(TeamsManagementPanel),
  });

  registerAdminPanel({
    value: "media",
    label: "Media",
    requiresManage: true,
    managePermission: DECK_MANAGE,
    render: () =>
      createElement(MediaManagementPanel, {
        contentNoun: "deck",
        contentInvalidateKey: "/api/decks",
        renderCover: (id: number) =>
          createElement(DeckCover, { mediaId: id, className: "h-12 w-16" }),
      }),
  });

  registerAdminPanel({
    value: "classifications",
    label: "Classifications",
    requiresManage: true,
    managePermission: DECK_MANAGE,
    render: () =>
      createElement(ClassificationManagementPanel, {
        contentNoun: "deck",
        taxonomyEndpoint: "/api/classifications",
      }),
  });

  registerAdminPanel({
    value: "about",
    label: "About",
    render: () => createElement(AboutPanel, { logoSrc }),
  });
}
