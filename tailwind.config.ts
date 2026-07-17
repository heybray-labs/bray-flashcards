/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import type { Config } from "tailwindcss";
import { uiPreset } from "@heybray/ui/tailwind-preset";

export default {
  presets: [uiPreset],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./packages/flashcards-client/src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@heybray/ui/dist/**/*.{js,js.map}",
    "./node_modules/@heybray/react/dist/**/*.{js,js.map}",
    "./node_modules/@heybray/gamification-react/dist/**/*.{js,js.map}",
  ],
} satisfies Config;
