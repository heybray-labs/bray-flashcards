/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runMigrations, createLogger } from "@heybray/server-kit";
import { db, pool } from "./db.ts";
import { seedDatabase } from "./seed.ts";

const log = createLogger("init-db");

const serverRoot = path.dirname(fileURLToPath(import.meta.url));

export async function initializeDatabase() {
  log.info("Running database init (migrate + seed)");

  await runMigrations(db, pool, [
    {
      name: "app",
      folder: path.join(serverRoot, "..", "drizzle"),
      migrationsTable: "__drizzle_migrations",
    },
  ]);

  await seedDatabase();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      log.info("Database init complete");
      return pool.end();
    })
    .catch((err) => {
      log.error("Database init failed", err instanceof Error ? err : undefined);
      process.exit(1);
    });
}
