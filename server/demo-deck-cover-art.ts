/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 *
 * Pastel Lucide cover art for demo flashcard decks.
 */

import {
  BookOpen,
  Cloud,
  Code,
  Landmark,
  Languages,
  MessageCircle,
  Stethoscope,
} from "lucide";
import type { DemoCoverArt } from "./demo-cover-render.ts";

export const DEMO_DECK_COVER_PREFIX = "demo-deck-cover-";

export const DEMO_DECK_COVER_ART: Record<string, DemoCoverArt> = {
  "spanish-essentials": {
    icon: Languages,
    background: "#FEF3C7",
    foreground: "#B45309",
  },
  "french-conversation": {
    icon: MessageCircle,
    background: "#DBEAFE",
    foreground: "#1D4ED8",
  },
  "medical-terminology": {
    icon: Stethoscope,
    background: "#CCFBF1",
    foreground: "#0F766E",
  },
  "anatomy-basics": {
    icon: BookOpen,
    background: "#FFE4E6",
    foreground: "#BE123C",
  },
  "world-war-ii-timeline": {
    icon: Landmark,
    background: "#F1F5F9",
    foreground: "#475569",
  },
  "ancient-rome": {
    icon: Landmark,
    background: "#FFEDD5",
    foreground: "#C2410C",
  },
  "javascript-fundamentals": {
    icon: Code,
    background: "#FEF9C3",
    foreground: "#A16207",
  },
  "cloud-architecture": {
    icon: Cloud,
    background: "#E0F2FE",
    foreground: "#0369A1",
  },
};

export function deckTitleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveDemoDeckCoverArt(title: string): DemoCoverArt {
  const slug = deckTitleToSlug(title);
  const art = DEMO_DECK_COVER_ART[slug];
  if (!art) {
    throw new Error(`No demo deck cover art configured for title: ${title}`);
  }
  return art;
}
