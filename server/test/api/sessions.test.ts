/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { describe, it, expect, beforeAll } from "vitest";
import { api, authHeader } from "../helpers/request.ts";
import { expectNotServerError } from "../helpers/assertions.ts";
import { setupAdmin, createLearner, type TestUser } from "../helpers/auth.ts";
import { completePassingSession, createPublishedDeck } from "../helpers/fixtures.ts";

describe("Study sessions API", () => {
  let admin: TestUser;
  let learner: TestUser;
  let deckId: number;

  beforeAll(async () => {
    admin = await setupAdmin();
    learner = await createLearner(admin.token);
    deckId = await createPublishedDeck(admin.token, { topic: "science" });
  });

  it("POST /api/decks/:id/sessions/start", async () => {
    const res = await api()
      .post(`/api/decks/${deckId}/sessions/start`)
      .set(authHeader(learner.token))
      .expect(201);
    expect(res.body.session).toHaveProperty("id");
    expect(res.body.cards.length).toBe(2);
  });

  it("completing session awards points and logs activity", async () => {
    const { sessionId, pointsAwarded } = await completePassingSession(learner.token, deckId, 2);
    expect(sessionId).toBeGreaterThan(0);
    expect(pointsAwarded).toBeGreaterThan(0);

    const progress = await api()
      .get(`/api/decks/${deckId}/my-progress`)
      .set(authHeader(learner.token))
      .expect(200);
    expectNotServerError(progress.status);
    expect(progress.body.bestScore).toBe(100);
    expect(progress.body.pointsEarned).toBeGreaterThan(0);
  });
});
