/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { createDb, setDatabase } from "@heybray/server-kit";
import { mediaSchema } from "@heybray/media/schema";
import { identitySchema } from "@heybray/identity/schema";
import { taxonomySchema } from "@heybray/taxonomy";
import { gamificationSchema } from "@heybray/gamification";
import { decks, cards, studySessions } from "./schema/decks.ts";

const appSchema = { decks, cards, studySessions };

const schema = {
  ...mediaSchema,
  ...identitySchema,
  ...taxonomySchema,
  ...gamificationSchema,
  ...appSchema,
};

const { db, pool } = createDb(schema);
setDatabase(db);

export { db, pool };
