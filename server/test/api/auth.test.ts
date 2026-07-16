/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { describe, it, expect, beforeAll } from "vitest";
import { api, authHeader } from "../helpers/request.ts";
import { setupAdmin, type TestUser } from "../helpers/auth.ts";

describe("Auth API", () => {
  let admin: TestUser;

  beforeAll(async () => {
    admin = await setupAdmin();
  });

  it("GET /api/auth/setup-status", async () => {
    const res = await api().get("/api/auth/setup-status").expect(200);
    expect(res.body.needsSetup).toBe(false);
  });

  it("POST /api/auth/login", async () => {
    const res = await api()
      .post("/api/auth/login")
      .send({ email: admin.email, password: admin.password })
      .expect(200);
    expect(res.body).toHaveProperty("token");
  });

  it("GET /api/auth/me requires auth", async () => {
    await api().get("/api/auth/me").expect(401);
  });

  it("GET /api/auth/me with token", async () => {
    const res = await api().get("/api/auth/me").set(authHeader(admin.token)).expect(200);
    expect(res.body.user.email).toBe(admin.email);
  });

  it("POST /api/auth/setup-admin rejects duplicate", async () => {
    const res = await api()
      .post("/api/auth/setup-admin")
      .send({ name: "Other", email: "other@test.example.com", password: "OtherPass123!" });
    expect(res.status).toBe(403);
  });
});
