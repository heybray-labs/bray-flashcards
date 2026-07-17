/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { createDb, setDatabase } from "@heybray/server-kit";
import { setMediaUsageHook } from "@heybray/media";
import { mediaSchema } from "@heybray/media/schema";
import { identitySchema } from "@heybray/identity/schema";
import { taxonomySchema } from "@heybray/taxonomy";
import { gamificationSchema } from "@heybray/gamification";
import { flashcardsSchema, deckMediaUsage } from "@heybray/flashcards-server";

const schema = {
  ...mediaSchema,
  ...identitySchema,
  ...taxonomySchema,
  ...gamificationSchema,
  ...flashcardsSchema,
};

const { db, pool } = createDb(schema);
setDatabase(db);
setMediaUsageHook(deckMediaUsage);

export { db, pool };
