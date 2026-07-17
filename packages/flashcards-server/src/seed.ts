/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { eq } from "drizzle-orm";
import { roles } from "@heybray/identity/schema";
import { db, createLogger } from "@heybray/server-kit";
import { MANAGE_PERMISSION } from "./gamification.ts";
import { seedClassifications } from "./seed-classifications.ts";

const log = createLogger("seed");

const ROLE_DEFS = [
  { name: "admin", description: "Administrator", permissions: [MANAGE_PERMISSION] },
  { name: "user", description: "Regular user", permissions: [] },
];

async function seedRoles() {
  for (const def of ROLE_DEFS) {
    const [existing] = await db.select().from(roles).where(eq(roles.name, def.name)).limit(1);
    if (existing) continue;
    await db.insert(roles).values({ ...def, isGlobal: false });
    log.info("Created role", { name: def.name });
  }
}

export async function seedDatabase() {
  await seedRoles();
  try {
    await seedClassifications();
  } catch (error) {
    log.warn("Classification seed failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  log.info("Seed complete");
}
