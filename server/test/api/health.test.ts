/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { describe, it, expect } from "vitest";
import { api } from "../helpers/request.ts";
import { expectJsonKeys } from "../helpers/assertions.ts";

describe("Health & about", () => {
  it("GET /api/health returns ok", async () => {
    const res = await api().get("/api/health").expect(200);
    expectJsonKeys(res.body, ["status"]);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api/about returns version info", async () => {
    const res = await api().get("/api/about").expect(200);
    expectJsonKeys(res.body, ["version", "authProtocol", "authProtocolLabel"]);
    expect(res.body.authProtocol).toBe("local");
    expect(res.body.authProtocolLabel).toBe("Local sign-in");
  });
});
