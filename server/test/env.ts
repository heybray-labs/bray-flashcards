/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

/** Test environment — must not import modules that load db.ts before DATABASE_URL is set. */
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.AUTH_PROTOCOL = process.env.AUTH_PROTOCOL || "local";
process.env.APP_URL = process.env.APP_URL || "http://localhost:5175";
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || "10000";
process.env.AUTH_RATE_LIMIT_MAX = process.env.AUTH_RATE_LIMIT_MAX || "10000";
process.env.MEDIA_DIR = process.env.MEDIA_DIR || "/tmp/bray-flashcards-test-media";
process.env.LOG_LEVEL = process.env.LOG_LEVEL || "ERROR";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5435/flashcards_test";
}
