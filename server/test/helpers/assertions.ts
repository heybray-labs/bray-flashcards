/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

export function expectNotServerError(status: number): void {
  expect(status).toBeLessThan(500);
}

export function expectJsonKeys(body: Record<string, unknown>, keys: string[]): void {
  for (const key of keys) {
    expect(body).toHaveProperty(key);
  }
}
