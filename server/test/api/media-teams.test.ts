/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { describe, it, expect, beforeAll } from "vitest";
import { api, authHeader } from "../helpers/request.ts";
import { expectNotServerError } from "../helpers/assertions.ts";
import { setupAdmin, createLearner, type TestUser } from "../helpers/auth.ts";
import { completePassingSession, seedFixtures } from "../helpers/fixtures.ts";

describe("Media & teams API", () => {
  let admin: TestUser;
  let learner: TestUser;
  let manager: TestUser;
  let teamId: number;
  let deckId: number;
  let mediaId: number;

  beforeAll(async () => {
    admin = await setupAdmin();
    learner = await createLearner(admin.token);
    const fixtures = await seedFixtures(admin, learner);
    deckId = fixtures.deckId;
    mediaId = fixtures.mediaId;

    const managerRes = await api()
      .post("/api/users")
      .set(authHeader(admin.token))
      .send({
        email: "manager@test.example.com",
        password: "ManagerPass123!",
        firstName: "Team",
        role: "user",
      })
      .expect(201);

    const login = await api()
      .post("/api/auth/login")
      .send({ email: "manager@test.example.com", password: "ManagerPass123!" })
      .expect(200);
    await api()
      .post("/api/auth/change-password")
      .set(authHeader(login.body.token))
      .send({ currentPassword: "ManagerPass123!", newPassword: "ManagerPass123!X" })
      .expect(200);
    const final = await api()
      .post("/api/auth/login")
      .send({ email: "manager@test.example.com", password: "ManagerPass123!X" })
      .expect(200);

    manager = {
      email: "manager@test.example.com",
      password: "ManagerPass123!X",
      token: final.body.token,
      id: managerRes.body.user.id,
    };

    const teamRes = await api()
      .post("/api/teams")
      .set(authHeader(admin.token))
      .send({ name: "Test Team", managerId: manager.id })
      .expect(201);
    teamId = teamRes.body.team.id;

    await api()
      .put(`/api/teams/${teamId}/members`)
      .set(authHeader(admin.token))
      .send({ memberIds: [learner.id] })
      .expect(200);

    await completePassingSession(learner.token, deckId, 2);
  });

  describe("Media API", () => {
    it("GET /api/media requires auth", async () => {
      await api().get("/api/media").expect(401);
    });

    it("GET /api/media requires deck:manage", async () => {
      const res = await api().get("/api/media").set(authHeader(learner.token));
      expect(res.status).toBe(403);
    });

    it("POST /api/media and usage count on deck cover", async () => {
      const list = await api().get("/api/media").set(authHeader(admin.token)).expect(200);
      const row = list.body.find((m: { id: number }) => m.id === mediaId);
      expect(row).toBeDefined();
      expect(row.usageCount).toBeGreaterThanOrEqual(1);
      expectNotServerError(list.status);
    });
  });

  describe("Teams / star map API", () => {
    it("GET /api/teams rejects learner", async () => {
      const res = await api().get("/api/teams").set(authHeader(learner.token));
      expect(res.status).toBe(403);
    });

    it("GET /api/teams/:id/star-map allows manager", async () => {
      const res = await api()
        .get(`/api/teams/${teamId}/star-map`)
        .set(authHeader(manager.token))
        .expect(200);
      expectNotServerError(res.status);
      expect(res.body.members).toHaveLength(1);
      expect(res.body.members[0].userId).toBe(learner.id);
    });

    it("GET /api/teams/:id/star-map rejects learner", async () => {
      const res = await api()
        .get(`/api/teams/${teamId}/star-map`)
        .set(authHeader(learner.token));
      expect(res.status).toBe(403);
    });

    it("GET /api/teams/:id/members/:userId/scenario-history allows manager", async () => {
      const res = await api()
        .get(`/api/teams/${teamId}/members/${learner.id}/scenario-history`)
        .set(authHeader(manager.token))
        .expect(200);
      expect(res.body.userId).toBe(learner.id);
      expect(Array.isArray(res.body.categories)).toBe(true);
      if (res.body.categories.length > 0 && res.body.categories[0].scenarios.length > 0) {
        expect(res.body.categories[0].scenarios[0]).toMatchObject({
          contentId: expect.any(Number),
          title: expect.any(String),
          attemptCount: expect.any(Number),
        });
      }
    });

    it("GET /api/teams/:id/members/:userId/roleplays/:id/attempts allows manager", async () => {
      const res = await api()
        .get(`/api/teams/${teamId}/members/${learner.id}/roleplays/${deckId}/attempts`)
        .set(authHeader(manager.token))
        .expect(200);
      expect(res.body.attempts.length).toBeGreaterThan(0);
      expect(res.body.attempts[0]).toHaveProperty("starLevel");
    });
  });
});
