/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { describe, it, expect, beforeAll } from "vitest";
import { api, authHeader } from "../helpers/request.ts";
import { expectNotServerError } from "../helpers/assertions.ts";
import { setupAdmin, createLearner, type TestUser } from "../helpers/auth.ts";
import { seedFixtures } from "../helpers/fixtures.ts";

describe("Points API", () => {
  let admin: TestUser;
  let learner: TestUser;

  beforeAll(async () => {
    admin = await setupAdmin();
    learner = await createLearner(admin.token);
    await seedFixtures(admin, learner);
  });

  it("GET /api/points/me/stats requires auth", async () => {
    await api().get("/api/points/me/stats").expect(401);
  });

  it("GET /api/points/me/stats returns progress shape", async () => {
    const res = await api()
      .get("/api/points/me/stats")
      .set(authHeader(learner.token))
      .expect(200);
    expectNotServerError(res.status);
    expect(res.body).toHaveProperty("totalPoints");
    expect(res.body).toHaveProperty("categoryMastery");
    expect(Array.isArray(res.body.categoryMastery)).toBe(true);
  });

  it("GET /api/points/leaderboard global", async () => {
    const res = await api()
      .get("/api/points/leaderboard?period=all_time")
      .set(authHeader(learner.token))
      .expect(200);
    expectNotServerError(res.status);
    expect(Array.isArray(res.body.entries)).toBe(true);
  });

  it("GET /api/points/leaderboard topic scope", async () => {
    const res = await api()
      .get("/api/points/leaderboard?scope=category&category=science&period=all_time")
      .set(authHeader(learner.token))
      .expect(200);
    expectNotServerError(res.status);
    expect(Array.isArray(res.body.entries)).toBe(true);
  });

  it("GET /api/points/recent-stars returns items", async () => {
    const res = await api()
      .get("/api/points/recent-stars?limit=5")
      .set(authHeader(learner.token))
      .expect(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
