/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import type { Application } from "express";
import supertest from "supertest";
import { createApp } from "../../app.ts";

let cachedApp: Application | null = null;

export function getApp(): Application {
  if (!cachedApp) {
    cachedApp = createApp();
  }
  return cachedApp;
}

export function api() {
  return supertest(getApp());
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
