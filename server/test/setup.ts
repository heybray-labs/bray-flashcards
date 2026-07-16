/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { beforeAll } from "vitest";
import { initializeDatabase } from "../init-db.ts";
import { initStorage } from "@heybray/media";
import { wireAuditLogging } from "@heybray/server-kit";
import { resetMutableData } from "./db.ts";

let databaseReady = false;

export async function ensureTestDatabase(): Promise<void> {
  if (!databaseReady) {
    await initializeDatabase();
    await initStorage();
    wireAuditLogging();
    databaseReady = true;
  }
  await resetMutableData();
}

beforeAll(async () => {
  await ensureTestDatabase();
});
