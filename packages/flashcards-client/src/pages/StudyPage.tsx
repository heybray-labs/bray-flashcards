/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@heybray/ui/components/button";
import { Progress } from "@heybray/ui/components/progress";
import { apiRequest } from "@heybray/react/lib/queryClient";
import { NotFoundScreen } from "@heybray/react/errors";
import { RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { storeSessionResult, type CompleteResult } from "@/pages/SessionResultsPage";

type Card = { id: number; front: string; back: string; orderIndex: number };

export default function StudyPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const deckId = params.id ? Number(params.id) : null;
  const sessionId = params.sessionId ? Number(params.sessionId) : null;

  const { data, isLoading } = useQuery<{
    cards: Card[];
  }>({
    queryKey: [`/api/decks/${deckId}`],
    queryFn: () => apiRequest("GET", `/api/decks/${deckId}`),
    enabled: !!deckId && !Number.isNaN(deckId),
    select: (response: { cards: Card[] }) => ({ cards: response.cards }),
  });

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const cards = data?.cards ?? [];
  const current = cards[index];
  const progressPct = cards.length ? ((index + (flipped ? 0.5 : 0)) / cards.length) * 100 : 0;

  const completeMutation = useMutation({
    mutationFn: async (cardsCorrect: number) => {
      return apiRequest("POST", `/api/decks/${deckId}/sessions/${sessionId}/complete`, {
        cardsCorrect,
      }) as Promise<CompleteResult>;
    },
    onSuccess: (result) => {
      storeSessionResult(deckId!, sessionId!, result);
      navigate(`/decks/${deckId}/results/${sessionId}`);
    },
  });

  function grade(knewIt: boolean) {
    const nextCorrect = correctCount + (knewIt ? 1 : 0);
    const nextIndex = index + 1;
    if (nextIndex >= cards.length) {
      completeMutation.mutate(nextCorrect);
      return;
    }
    setCorrectCount(nextCorrect);
    setIndex(nextIndex);
    setFlipped(false);
  }

  if (!deckId || !sessionId || Number.isNaN(deckId) || Number.isNaN(sessionId)) {
    return <NotFoundScreen />;
  }

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading cards…</p>
        ) : !current ? (
          <p className="text-center text-muted-foreground">No cards in this deck.</p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Card {index + 1} of {cards.length}
                </span>
                <span>{correctCount} correct so far</span>
              </div>
              <Progress value={progressPct} className="h-2" />
            </div>

            <button
              type="button"
              className="w-full min-h-[220px] rounded-2xl border bg-card p-8 text-left shadow-sm transition-shadow hover:shadow-md"
              onClick={() => setFlipped((f) => !f)}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {flipped ? "Back" : "Front"}
              </p>
              <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap">
                {flipped ? current.back : current.front}
              </p>
              <p className="text-xs text-muted-foreground mt-6 flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                Tap to flip
              </p>
            </button>

            {flipped && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  disabled={completeMutation.isPending}
                  onClick={() => grade(false)}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Didn&apos;t know
                </Button>
                <Button
                  size="lg"
                  className="gap-2"
                  disabled={completeMutation.isPending}
                  onClick={() => grade(true)}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Knew it
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
