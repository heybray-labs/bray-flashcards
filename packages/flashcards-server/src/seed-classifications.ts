/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import {
  classificationDimensions,
  classificationOptions,
  slugifyLabel,
  FALLBACK_OPTION_DISPLAY,
} from "@heybray/taxonomy/schema";
import { and, eq } from "drizzle-orm";
import { db, createLogger } from "@heybray/server-kit";

const log = createLogger("seed-classifications");

export const TOPIC_DIMENSION = {
  slug: "topic",
  name: "Topic",
  cardinality: "single" as const,
  sortOrder: 0,
};

export const TOPIC_OPTIONS = [
  { label: "Languages", slug: "languages", color: "#0891b2", icon: "languages" },
  { label: "Science", slug: "science", color: "#7c3aed", icon: "flask-conical" },
  { label: "History", slug: "history", color: "#b45309", icon: "landmark" },
  { label: "Technology", slug: "technology", color: "#2563eb", icon: "cpu" },
] as const;

export async function seedClassifications() {
  const [existingDim] = await db
    .select()
    .from(classificationDimensions)
    .where(eq(classificationDimensions.slug, TOPIC_DIMENSION.slug))
    .limit(1);

  let dimensionId = existingDim?.id;
  if (!dimensionId) {
    const [created] = await db.insert(classificationDimensions).values(TOPIC_DIMENSION).returning();
    dimensionId = created.id;
    log.info("Created classification dimension", { slug: TOPIC_DIMENSION.slug });
  }

  for (let i = 0; i < TOPIC_OPTIONS.length; i++) {
    const opt = TOPIC_OPTIONS[i];
    const [existing] = await db
      .select()
      .from(classificationOptions)
      .where(
        and(
          eq(classificationOptions.dimensionId, dimensionId),
          eq(classificationOptions.slug, opt.slug),
        ),
      )
      .limit(1);

    if (existing) continue;

    await db.insert(classificationOptions).values({
      dimensionId,
      slug: opt.slug,
      label: opt.label,
      sortOrder: i,
      isActive: true,
      color: opt.color ?? FALLBACK_OPTION_DISPLAY.color,
      icon: opt.icon ?? FALLBACK_OPTION_DISPLAY.icon,
    });
  }

  log.info("Topic taxonomy seeded");
}

export function topicLabelToSlug(label: string): string {
  const match = TOPIC_OPTIONS.find((opt) => opt.label.toLowerCase() === label.toLowerCase());
  return match?.slug ?? slugifyLabel(label);
}
