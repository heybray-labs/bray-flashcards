/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL not found. Set it in .env or the environment.");
}

export default defineConfig({
  out: "./drizzle",
  schema: ["./server/schema/**/*.ts", "./server/drizzle-packages-schema.ts"],
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
});
