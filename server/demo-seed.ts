/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 *
 * Seeds demo users and published flashcard decks.
 * Run: npm run db:demo-seed
 */

import { pathToFileURL } from "node:url";
import bcrypt from "bcrypt";
import { eq, like } from "drizzle-orm";
import { roles, users } from "@heybray/identity/schema";
import { classificationService } from "@heybray/taxonomy";
import { createLogger } from "@heybray/server-kit";
import {
  DECK_CONTENT_TYPE,
  gamification as deckGamification,
  seedDatabase,
} from "@heybray/flashcards-server";
import { cards, decks } from "@heybray/flashcards-server/schema/decks";
import { db, pool } from "./db.ts";
import { DEMO_EMAIL_DOMAIN, DEMO_TITLE_PREFIX, wipeDemoDecks } from "./demo-wipe.ts";

const log = createLogger("demo-seed");

const DEMO_PASSWORD = "Demo1234!";
const DEMO_DECK_COUNT = 8;
const DECK_TOPICS = ["languages", "science", "history", "technology"] as const;

const DECK_TITLES = [
  "Spanish Essentials",
  "French Conversation",
  "Medical Terminology",
  "Anatomy Basics",
  "World War II Timeline",
  "Ancient Rome",
  "JavaScript Fundamentals",
  "Cloud Architecture",
] as const;

const DEMO_USERS = [
  { email: "admin@demo.local", firstName: "Admin", role: "admin" as const },
  { email: "sarah.chen@demo.local", firstName: "Sarah", role: "user" as const },
  { email: "james.wilson@demo.local", firstName: "James", role: "user" as const },
  { email: "maria.garcia@demo.local", firstName: "Maria", role: "user" as const },
];

function cardPairsForDeck(title: string): { front: string; back: string }[] {
  const topic = title.replace(/^\[Demo\]\s*/, "");
  return Array.from({ length: 8 }, (_, i) => ({
    front: `${topic} — question ${i + 1}`,
    back: `${topic} — answer ${i + 1}`,
  }));
}

async function seedDemoUsers() {
  const [adminRole] = await db.select().from(roles).where(eq(roles.name, "admin")).limit(1);
  const [userRole] = await db.select().from(roles).where(eq(roles.name, "user")).limit(1);
  if (!adminRole || !userRole) {
    throw new Error("Required roles not found — run db:init first.");
  }

  await db.delete(users).where(like(users.email, `%@${DEMO_EMAIL_DOMAIN}`));

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let adminId = 0;

  for (const def of DEMO_USERS) {
    const [created] = await db
      .insert(users)
      .values({
        email: def.email.toLowerCase(),
        firstName: def.firstName,
        password: passwordHash,
        roleId: def.role === "admin" ? adminRole.id : userRole.id,
        isEmailVerified: true,
        approvalStatus: "approved",
        mustChangePassword: false,
        isActive: true,
      })
      .returning({ id: users.id, email: users.email });
    if (def.role === "admin") adminId = created.id;
  }

  return adminId;
}

async function seedDecks(adminUserId: number) {
  await wipeDemoDecks();

  const created: { id: number; title: string }[] = [];

  for (let i = 0; i < DEMO_DECK_COUNT; i++) {
    const baseTitle = DECK_TITLES[i % DECK_TITLES.length] ?? `Deck ${i + 1}`;
    const title = `${DEMO_TITLE_PREFIX}${baseTitle}`;

    const [deck] = await db
      .insert(decks)
      .values({
        title,
        description: `Demo flashcard deck for ${baseTitle.toLowerCase()}.`,
        status: "published",
        passThreshold: 70,
        createdBy: adminUserId,
      })
      .returning();

    const pairs = cardPairsForDeck(title);
    for (let orderIndex = 0; orderIndex < pairs.length; orderIndex++) {
      const pair = pairs[orderIndex]!;
      await db.insert(cards).values({
        deckId: deck.id,
        front: pair.front,
        back: pair.back,
        orderIndex,
      });
    }

    try {
      await classificationService.setContentClassifications(DECK_CONTENT_TYPE, deck.id, {
        topic: DECK_TOPICS[i % DECK_TOPICS.length] ?? "technology",
      });
    } catch (error) {
      log.warn("Classification skipped for deck", {
        title: deck.title,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    await deckGamification.ensureDefaultRewardTiers(DECK_CONTENT_TYPE, deck.id);
    await deckGamification.syncContent([
      {
        contentType: DECK_CONTENT_TYPE,
        contentId: deck.id,
        title: deck.title,
        isActive: true,
      },
    ]);

    created.push({ id: deck.id, title: deck.title });
  }

  return created;
}

export async function demoSeedDatabase() {
  await seedDatabase();
  const adminId = await seedDemoUsers();
  const seededDecks = await seedDecks(adminId);

  console.log("\n========================================");
  console.log("  Demo data seeded");
  console.log("========================================\n");
  console.log(`Decks: ${seededDecks.length} published with 8 cards each`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("  Admin:  admin@demo.local");
  console.log("  Users:  sarah.chen@demo.local, james.wilson@demo.local, maria.garcia@demo.local\n");
}

const isDirectRun =
  process.argv[1] != null && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  demoSeedDatabase()
    .then(() => pool.end())
    .catch((err) => {
      log.error("Demo seed failed", err instanceof Error ? err : undefined);
      console.error(err);
      pool.end().finally(() => process.exit(1));
    });
}
