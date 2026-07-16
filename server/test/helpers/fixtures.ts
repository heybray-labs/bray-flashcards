/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { api, authHeader } from "./request.ts";
import type { TestUser } from "./auth.ts";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export async function uploadTestImage(adminToken: string): Promise<number> {
  const res = await api()
    .post("/api/media")
    .set(authHeader(adminToken))
    .attach("file", PNG_1X1, "test.png")
    .expect(201);
  return res.body.id as number;
}

export async function createPublishedDeck(
  adminToken: string,
  options?: { topic?: string; coverImageMediaId?: number },
): Promise<number> {
  const created = await api()
    .post("/api/decks")
    .set(authHeader(adminToken))
    .send({
      title: "Smoke Test Deck",
      description: "API smoke test deck",
      topic: options?.topic ?? "science",
      coverImageMediaId: options?.coverImageMediaId ?? null,
    })
    .expect(201);

  const deckId = created.body.deck.id as number;

  await api()
    .post(`/api/decks/${deckId}/cards`)
    .set(authHeader(adminToken))
    .send({ front: "Question", back: "Answer", orderIndex: 0 })
    .expect(201);

  await api()
    .post(`/api/decks/${deckId}/cards`)
    .set(authHeader(adminToken))
    .send({ front: "Q2", back: "A2", orderIndex: 1 })
    .expect(201);

  await api()
    .post(`/api/decks/${deckId}/publish`)
    .set(authHeader(adminToken))
    .expect(200);

  return deckId;
}

export async function completePassingSession(
  learnerToken: string,
  deckId: number,
  cardsCorrect = 2,
): Promise<{ sessionId: number; pointsAwarded: number }> {
  const started = await api()
    .post(`/api/decks/${deckId}/sessions/start`)
    .set(authHeader(learnerToken))
    .expect(201);

  const sessionId = started.body.session.id as number;

  const completed = await api()
    .post(`/api/decks/${deckId}/sessions/${sessionId}/complete`)
    .set(authHeader(learnerToken))
    .send({ cardsCorrect })
    .expect(200);

  return {
    sessionId,
    pointsAwarded: completed.body.pointsAward?.pointsAwarded ?? 0,
  };
}

export interface TestFixtures {
  admin: TestUser;
  learner: TestUser;
  deckId: number;
  mediaId: number;
}

export async function seedFixtures(admin: TestUser, learner: TestUser): Promise<TestFixtures> {
  const mediaId = await uploadTestImage(admin.token);
  const deckId = await createPublishedDeck(admin.token, {
    topic: "science",
    coverImageMediaId: mediaId,
  });
  return { admin, learner, deckId, mediaId };
}
