/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import express from "express";
import deckRoutes from "./routes/decks.ts";

export type FlashcardsServerDeps = Record<string, unknown>;

/** Mounts Flashcards domain routers only (no platform surfaces). */
export function registerDomainRoutes(
  app: express.Application,
  _deps: FlashcardsServerDeps = {},
): void {
  app.use("/api/decks", deckRoutes);
}
