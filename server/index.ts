/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { createApp } from "./app.ts";
import { createLogger } from "@heybray/server-kit";

const log = createLogger("server");
const port = Number(process.env.PORT ?? 3102);

const app = createApp();
app.listen(port, () => {
  log.info(`bray-flashcards listening on :${port}`);
});
