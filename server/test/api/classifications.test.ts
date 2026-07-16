/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { describe, it, expect, beforeAll } from "vitest";
import { api, authHeader } from "../helpers/request.ts";
import { expectNotServerError } from "../helpers/assertions.ts";
import { setupAdmin, createLearner, type TestUser } from "../helpers/auth.ts";

describe("Classifications API", () => {
  let admin: TestUser;
  let learner: TestUser;
  let optionId: number;

  beforeAll(async () => {
    admin = await setupAdmin();
    learner = await createLearner(admin.token);

    const list = await api()
      .get("/api/classifications")
      .set(authHeader(admin.token))
      .expect(200);
    const topic = list.body.dimensions.find((d: { slug: string }) => d.slug === "topic");
    optionId = topic.options[0].id;
  });

  it("GET /api/classifications requires auth", async () => {
    await api().get("/api/classifications").expect(401);
  });

  it("GET /api/classifications includes topic dimension", async () => {
    const res = await api()
      .get("/api/classifications")
      .set(authHeader(learner.token))
      .expect(200);
    expect(res.body).toHaveProperty("dimensions");
    const topic = res.body.dimensions.find((d: { slug: string }) => d.slug === "topic");
    expect(topic).toBeDefined();
    expect(topic.options.length).toBeGreaterThan(0);
    expectNotServerError(res.status);
  });

  it("POST /api/classifications/options", async () => {
    const uniqueSlug = `smoke-topic-${Date.now()}`;
    const res = await api()
      .post("/api/classifications/options")
      .set(authHeader(admin.token))
      .send({
        dimensionSlug: "topic",
        label: "Smoke Test Topic",
        slug: uniqueSlug,
      })
      .expect(201);
    expect(res.body).toHaveProperty("option");
    optionId = res.body.option.id;
  });

  it("POST /api/classifications/options forbidden for learner", async () => {
    const res = await api()
      .post("/api/classifications/options")
      .set(authHeader(learner.token))
      .send({ dimensionSlug: "topic", label: "Nope" });
    expect(res.status).toBe(403);
  });

  it("PATCH /api/classifications/options/:id", async () => {
    const res = await api()
      .patch(`/api/classifications/options/${optionId}`)
      .set(authHeader(admin.token))
      .send({ label: "Updated Topic Label" })
      .expect(200);
    expect(res.body.option.label).toBe("Updated Topic Label");
  });
});
