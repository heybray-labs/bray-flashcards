/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { Router, type Response } from "express";
import { and, asc, count, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { z } from "zod";
import {
  authenticateToken,
  requirePasswordChanged,
  requirePermission,
  type AuthRequest,
} from "@heybray/identity";
import { classificationService } from "@heybray/taxonomy";
import { createLogger } from "@heybray/server-kit";
import { db } from "../db.ts";
import {
  cards,
  decks,
  insertCardSchema,
  insertDeckSchema,
  studySessions,
  updateCardSchema,
  updateDeckSchema,
} from "../schema/decks.ts";
import { DECK_CONTENT_TYPE, MANAGE_PERMISSION, gamification } from "../gamification.ts";
import {
  replaceDeckRewardTiers,
  seedDefaultRewardTiers,
  syncDeckContent,
} from "../lib/deck-gamification.ts";
import { rewardTierInputSchema } from "@heybray/gamification";

const log = createLogger("decks");

const deckBodySchema = insertDeckSchema
  .extend({
    topic: z.string().nullable().optional(),
  })
  .partial({ passThreshold: true, coverImageMediaId: true, description: true });

const updateDeckBodySchema = updateDeckSchema.extend({
  topic: z.string().nullable().optional(),
});

const completeSessionSchema = z.object({
  cardsCorrect: z.number().int().min(0),
});

const rewardTiersBodySchema = z.object({
  tiers: z.array(rewardTierInputSchema),
});

function canManageDecks(user: AuthRequest["user"]): boolean {
  return user?.role?.permissions?.includes(MANAGE_PERMISSION) ?? false;
}

async function getDeckOr404(
  req: AuthRequest,
  res: Response,
  deckId: number,
): Promise<typeof decks.$inferSelect | null> {
  const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
  if (!deck) {
    res.status(404).json({ error: "Deck not found" });
    return null;
  }
  if (!canManageDecks(req.user) && deck.status !== "published") {
    res.status(404).json({ error: "Deck not found" });
    return null;
  }
  return deck;
}

async function enrichDecks(deckRows: (typeof decks.$inferSelect)[]) {
  if (!deckRows.length) return [];

  const deckIds = deckRows.map((d) => d.id);
  const [cardCounts, classifications] = await Promise.all([
    db
      .select({ deckId: cards.deckId, total: count() })
      .from(cards)
      .where(inArray(cards.deckId, deckIds))
      .groupBy(cards.deckId),
    classificationService.getContentClassifications(DECK_CONTENT_TYPE, deckIds),
  ]);

  const countByDeck = new Map(cardCounts.map((row) => [row.deckId, Number(row.total)]));

  return deckRows.map((deck) => ({
    ...deck,
    cardCount: countByDeck.get(deck.id) ?? 0,
    classifications: classifications.get(deck.id) ?? {},
  }));
}

const router = Router();

router.use(authenticateToken);
router.use(requirePasswordChanged);

router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const filters = [];
    if (!canManageDecks(req.user)) {
      filters.push(eq(decks.status, "published"));
    }
    if (search) {
      filters.push(or(ilike(decks.title, `%${search}%`), ilike(decks.description, `%${search}%`)));
    }

    const rows = await db
      .select()
      .from(decks)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(decks.updatedAt));

    res.json({ items: await enrichDecks(rows) });
  } catch (error) {
    log.error("list decks failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to list decks" });
  }
});

router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.id);
    if (Number.isNaN(deckId)) {
      res.status(400).json({ error: "Invalid deck id" });
      return;
    }

    const deck = await getDeckOr404(req, res, deckId);
    if (!deck) return;

    const [deckCards, classifications] = await Promise.all([
      db.select().from(cards).where(eq(cards.deckId, deckId)).orderBy(asc(cards.orderIndex), asc(cards.id)),
      classificationService.getContentClassification(DECK_CONTENT_TYPE, deckId),
    ]);

    res.json({
      deck: {
        ...deck,
        cardCount: deckCards.length,
        classifications,
      },
      cards: deckCards,
    });
  } catch (error) {
    log.error("get deck failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to get deck" });
  }
});

router.post("/", requirePermission(MANAGE_PERMISSION), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = deckBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      return;
    }

    const { topic, ...deckFields } = parsed.data;
    const [deck] = await db
      .insert(decks)
      .values({
        ...deckFields,
        createdBy: req.user!.id,
      })
      .returning();

    if (topic !== undefined) {
      await classificationService.setContentClassifications(DECK_CONTENT_TYPE, deck.id, {
        topic: topic ?? null,
      });
    }

    await seedDefaultRewardTiers(deck.id);
    await syncDeckContent(deck);

    const [enriched] = await enrichDecks([deck]);
    res.status(201).json({ deck: enriched });
  } catch (error) {
    log.error("create deck failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to create deck" });
  }
});

router.patch("/:id", requirePermission(MANAGE_PERMISSION), async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.id);
    if (Number.isNaN(deckId)) {
      res.status(400).json({ error: "Invalid deck id" });
      return;
    }

    const parsed = updateDeckBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      return;
    }

    const [existing] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }

    const { topic, ...deckFields } = parsed.data;
    const [deck] = await db
      .update(decks)
      .set({ ...deckFields, updatedAt: new Date() })
      .where(eq(decks.id, deckId))
      .returning();

    if (topic !== undefined) {
      await classificationService.setContentClassifications(DECK_CONTENT_TYPE, deckId, {
        topic: topic ?? null,
      });
    }

    await syncDeckContent(deck);

    const [enriched] = await enrichDecks([deck]);
    res.json({ deck: enriched });
  } catch (error) {
    log.error("update deck failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to update deck" });
  }
});

router.post("/:id/publish", requirePermission(MANAGE_PERMISSION), async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.id);
    const [deck] = await db
      .update(decks)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(decks.id, deckId))
      .returning();
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    await syncDeckContent(deck);
    const [enriched] = await enrichDecks([deck]);
    res.json({ deck: enriched });
  } catch (error) {
    log.error("publish deck failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to publish deck" });
  }
});

router.post("/:id/unpublish", requirePermission(MANAGE_PERMISSION), async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.id);
    const [deck] = await db
      .update(decks)
      .set({ status: "draft", updatedAt: new Date() })
      .where(eq(decks.id, deckId))
      .returning();
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    await syncDeckContent(deck);
    const [enriched] = await enrichDecks([deck]);
    res.json({ deck: enriched });
  } catch (error) {
    log.error("unpublish deck failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to unpublish deck" });
  }
});

router.delete("/:id", requirePermission(MANAGE_PERMISSION), async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.id);
    const [deck] = await db.delete(decks).where(eq(decks.id, deckId)).returning();
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    await gamification.onContentDeleted(DECK_CONTENT_TYPE, deckId);
    res.status(204).send();
  } catch (error) {
    log.error("delete deck failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to delete deck" });
  }
});

router.get("/:deckId/cards", async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.deckId);
    const deck = await getDeckOr404(req, res, deckId);
    if (!deck) return;

    const deckCards = await db
      .select()
      .from(cards)
      .where(eq(cards.deckId, deckId))
      .orderBy(asc(cards.orderIndex), asc(cards.id));

    res.json({ cards: deckCards });
  } catch (error) {
    log.error("list cards failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to list cards" });
  }
});

router.post("/:deckId/cards", requirePermission(MANAGE_PERMISSION), async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.deckId);
    const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }

    const parsed = insertCardSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      return;
    }

    const [card] = await db
      .insert(cards)
      .values({ ...parsed.data, deckId })
      .returning();

    res.status(201).json({ card });
  } catch (error) {
    log.error("create card failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to create card" });
  }
});

router.patch(
  "/:deckId/cards/:cardId",
  requirePermission(MANAGE_PERMISSION),
  async (req: AuthRequest, res: Response) => {
    try {
      const deckId = Number(req.params.deckId);
      const cardId = Number(req.params.cardId);
      const parsed = updateCardSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
        return;
      }

      const [card] = await db
        .update(cards)
        .set(parsed.data)
        .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)))
        .returning();

      if (!card) {
        res.status(404).json({ error: "Card not found" });
        return;
      }

      res.json({ card });
    } catch (error) {
      log.error("update card failed", error instanceof Error ? error : undefined);
      res.status(500).json({ error: "Failed to update card" });
    }
  },
);

router.delete(
  "/:deckId/cards/:cardId",
  requirePermission(MANAGE_PERMISSION),
  async (req: AuthRequest, res: Response) => {
    try {
      const deckId = Number(req.params.deckId);
      const cardId = Number(req.params.cardId);
      const [card] = await db
        .delete(cards)
        .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)))
        .returning();

      if (!card) {
        res.status(404).json({ error: "Card not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      log.error("delete card failed", error instanceof Error ? error : undefined);
      res.status(500).json({ error: "Failed to delete card" });
    }
  },
);

router.get("/:deckId/reward-tiers", async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.deckId);
    const deck = await getDeckOr404(req, res, deckId);
    if (!deck) return;

    const tiers = await gamification.getRewardTiers(DECK_CONTENT_TYPE, deckId);
    res.json({ tiers });
  } catch (error) {
    log.error("get reward tiers failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to get reward tiers" });
  }
});

router.put(
  "/:deckId/reward-tiers",
  requirePermission(MANAGE_PERMISSION),
  async (req: AuthRequest, res: Response) => {
    try {
      const deckId = Number(req.params.deckId);
      const [deck] = await db.select().from(decks).where(eq(decks.id, deckId)).limit(1);
      if (!deck) {
        res.status(404).json({ error: "Deck not found" });
        return;
      }

      const parsed = rewardTiersBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
        return;
      }

      await replaceDeckRewardTiers(deckId, parsed.data.tiers);
      const tiers = await gamification.getRewardTiers(DECK_CONTENT_TYPE, deckId);
      res.json({ tiers });
    } catch (error) {
      log.error("update reward tiers failed", error instanceof Error ? error : undefined);
      res.status(500).json({ error: "Failed to update reward tiers" });
    }
  },
);

router.post("/:deckId/sessions/start", async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.deckId);
    const deck = await getDeckOr404(req, res, deckId);
    if (!deck) return;

    const deckCards = await db.select().from(cards).where(eq(cards.deckId, deckId));
    if (!deckCards.length) {
      res.status(400).json({ error: "Deck has no cards" });
      return;
    }

    const [session] = await db
      .insert(studySessions)
      .values({
        deckId,
        userId: req.user!.id,
        cardsTotal: deckCards.length,
      })
      .returning();

    res.status(201).json({
      session,
      cards: deckCards.sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id),
    });
  } catch (error) {
    log.error("start session failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to start study session" });
  }
});

router.post("/:deckId/sessions/:sessionId/complete", async (req: AuthRequest, res: Response) => {
  try {
    const deckId = Number(req.params.deckId);
    const sessionId = Number(req.params.sessionId);
    const parsed = completeSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      return;
    }

    const deck = await getDeckOr404(req, res, deckId);
    if (!deck) return;

    const [session] = await db
      .select()
      .from(studySessions)
      .where(
        and(
          eq(studySessions.id, sessionId),
          eq(studySessions.deckId, deckId),
          eq(studySessions.userId, req.user!.id),
        ),
      )
      .limit(1);

    if (!session) {
      res.status(404).json({ error: "Study session not found" });
      return;
    }
    if (session.status === "completed") {
      res.status(400).json({ error: "Study session already completed" });
      return;
    }

    const cardsCorrect = Math.min(parsed.data.cardsCorrect, session.cardsTotal);
    const scorePercent =
      session.cardsTotal > 0
        ? Math.round((cardsCorrect / session.cardsTotal) * 10000) / 100
        : 0;
    const passed = scorePercent >= deck.passThreshold;
    const completedAt = new Date();

    const [completed] = await db
      .update(studySessions)
      .set({
        cardsCorrect,
        scorePercent: String(scorePercent),
        status: "completed",
        completedAt,
      })
      .where(eq(studySessions.id, sessionId))
      .returning();

    const pointsAward = await gamification.recordResult({
      userId: req.user!.id,
      contentType: DECK_CONTENT_TYPE,
      contentId: deckId,
      activityId: sessionId,
      scorePercent,
      passed,
      occurredAt: completedAt,
      eligibleForAward: true,
    });

    res.json({
      session: completed,
      passed,
      scorePercent,
      pointsAward,
    });
  } catch (error) {
    log.error("complete session failed", error instanceof Error ? error : undefined);
    res.status(500).json({ error: "Failed to complete study session" });
  }
});

export default router;
