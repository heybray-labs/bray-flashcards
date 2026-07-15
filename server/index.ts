/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { createApp } from "./app.ts";
import { initStorage } from "@heybray/media";
import { initializeDatabase } from "./init-db.ts";
import { logger, wireAuditLogging } from "@heybray/server-kit";
import { reconcileGamificationProjection } from "./gamification.ts";

const app = createApp();
const PORT = Number(process.env.PORT ?? 3102);

async function start() {
  try {
    await initializeDatabase();
    await reconcileGamificationProjection();
    await initStorage();
    wireAuditLogging();
    app.listen(PORT, () => {
      logger.info(`bray-flashcards listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error instanceof Error ? error : undefined);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, createApp };
