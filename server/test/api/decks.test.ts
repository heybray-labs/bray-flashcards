/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { describe, it, expect, beforeAll } from "vitest";
import { api, authHeader } from "../helpers/request.ts";
import { expectNotServerError } from "../helpers/assertions.ts";
import { setupAdmin, createLearner, type TestUser } from "../helpers/auth.ts";
import { createPublishedDeck } from "../helpers/fixtures.ts";

describe("Decks API", () => {
  let admin: TestUser;
  let learner: TestUser;
  let deckId: number;

  beforeAll(async () => {
    admin = await setupAdmin();
    learner = await createLearner(admin.token);
  });

  it("GET /api/decks requires auth", async () => {
    await api().get("/api/decks").expect(401);
  });

  it("POST /api/decks requires deck:manage", async () => {
    const res = await api()
      .post("/api/decks")
      .set(authHeader(learner.token))
      .send({ title: "Blocked" });
    expect(res.status).toBe(403);
  });

  it("POST /api/decks creates draft deck", async () => {
    const res = await api()
      .post("/api/decks")
      .set(authHeader(admin.token))
      .send({ title: "Draft Deck", topic: "history" })
      .expect(201);
    expect(res.body.deck.title).toBe("Draft Deck");
    expect(res.body.deck.status).toBe("draft");
    deckId = res.body.deck.id;
  });

  it("POST /api/decks/:id/cards", async () => {
    const res = await api()
      .post(`/api/decks/${deckId}/cards`)
      .set(authHeader(admin.token))
      .send({ front: "Front", back: "Back" })
      .expect(201);
    expect(res.body.card.front).toBe("Front");
  });

  it("POST /api/decks/:id/publish", async () => {
    const res = await api()
      .post(`/api/decks/${deckId}/publish`)
      .set(authHeader(admin.token))
      .expect(200);
    expect(res.body.deck.status).toBe("published");
  });

  it("GET /api/decks lists published deck for learner", async () => {
    const res = await api().get("/api/decks").set(authHeader(learner.token)).expect(200);
    expectNotServerError(res.status);
    expect(res.body.items.some((d: { id: number }) => d.id === deckId)).toBe(true);
  });

  it("GET /api/decks/:id includes cards", async () => {
    const res = await api()
      .get(`/api/decks/${deckId}`)
      .set(authHeader(learner.token))
      .expect(200);
    expect(res.body.cards.length).toBeGreaterThan(0);
    expect(res.body.deck.classifications.topic).toBeDefined();
  });

  it("PATCH /api/decks/:id forbidden for learner", async () => {
    const res = await api()
      .patch(`/api/decks/${deckId}`)
      .set(authHeader(learner.token))
      .send({ title: "Hijack" });
    expect(res.status).toBe(403);
  });

  it("GET /api/decks/:id/reward-tiers returns defaults", async () => {
    const publishedId = await createPublishedDeck(admin.token);
    const res = await api()
      .get(`/api/decks/${publishedId}/reward-tiers`)
      .set(authHeader(learner.token))
      .expect(200);
    expect(res.body.tiers.length).toBe(3);
  });
});
