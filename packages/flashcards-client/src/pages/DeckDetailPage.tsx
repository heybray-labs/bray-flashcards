/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useParams, useLocation, Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Play } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { DeckCover } from "@/components/DeckCover";
import { DeckRewardsLadder } from "@/components/DeckRewardsLadder";
import { TopicChip } from "@/components/TopicChip";
import { NotFoundScreen } from "@heybray/react/errors";
import { Button } from "@heybray/ui/components/button";
import { Skeleton } from "@heybray/ui/components/skeleton";
import { apiRequest } from "@heybray/react/lib/queryClient";
import { useAuth } from "@heybray/react/hooks/use-auth";

type TopicRef = { slug: string; label: string; color: string; icon: string };

export default function DeckDetailPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { hasPermission } = useAuth();
  const deckId = params.id ? Number(params.id) : null;
  const canManage = hasPermission("deck:manage");

  const { data, isLoading } = useQuery<{
    deck: {
      id: number;
      title: string;
      description: string | null;
      status: string;
      passThreshold: number;
      coverImageMediaId: number | null;
      cardCount: number;
      classifications: Record<string, TopicRef | undefined>;
    };
    cards: Array<{ id: number }>;
  }>({
    queryKey: [`/api/decks/${deckId}`],
    enabled: !!deckId && !Number.isNaN(deckId),
  });

  const { data: tiersData } = useQuery<{ tiers: Array<{
    id: number;
    tierName: string;
    minScorePercent: number;
    rewardPoints: number;
    starLevel: number;
    color: string | null;
  }> }>({
    queryKey: [`/api/decks/${deckId}/reward-tiers`],
    enabled: !!deckId,
  });

  const { data: progress, isLoading: progressLoading } = useQuery<{
    bestScore: number | null;
    pointsEarned: number;
    attemptCount: number;
  }>({
    queryKey: [`/api/decks/${deckId}/my-progress`],
    enabled: !!deckId,
  });

  const startMutation = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("POST", `/api/decks/${deckId}/sessions/start`);
      return result as { session: { id: number } };
    },
    onSuccess: (result) => {
      navigate(`/decks/${deckId}/study/${result.session.id}`);
    },
  });

  if (!deckId || Number.isNaN(deckId)) return <NotFoundScreen />;
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }
  if (!data?.deck) return <NotFoundScreen />;

  const deck = data.deck;
  const topic = deck.classifications?.topic;
  const canStudy = deck.cardCount > 0 && (deck.status === "published" || canManage);

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-16 space-y-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground no-underline">
          <ArrowLeft className="h-4 w-4" />
          All decks
        </Link>

        <DeckCover mediaId={deck.coverImageMediaId} className="w-full" aspectClassName="aspect-[21/9]" />

        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{deck.title}</h1>
            {deck.status === "draft" && canManage && (
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border rounded px-2 py-0.5">
                Draft
              </span>
            )}
            {topic && <TopicChip topic={topic} />}
          </div>
          {deck.description && <p className="text-muted-foreground">{deck.description}</p>}
          <p className="text-sm text-muted-foreground">
            {deck.cardCount} card{deck.cardCount === 1 ? "" : "s"} · Pass at {deck.passThreshold}%
          </p>
        </header>

        <DeckRewardsLadder
          tiers={tiersData?.tiers ?? []}
          bestScore={progress?.bestScore ?? null}
          passThreshold={deck.passThreshold}
        />

        <section className="rounded-xl border bg-card p-4 space-y-3">
          <h2 className="font-semibold">Your progress</h2>
          {progressLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {progress?.attemptCount
                ? `${progress.attemptCount} session${progress.attemptCount === 1 ? "" : "s"} · ${progress.pointsEarned} points earned`
                : "No completed sessions yet — start studying to earn your first star."}
            </p>
          )}
          <Button
            size="lg"
            className="gap-2"
            disabled={!canStudy || startMutation.isPending}
            onClick={() => startMutation.mutate()}
          >
            <Play className="h-4 w-4" />
            {startMutation.isPending ? "Starting…" : "Start study session"}
          </Button>
          {!canStudy && (
            <p className="text-xs text-muted-foreground">
              {deck.cardCount === 0 ? "This deck has no cards yet." : "This deck is not published."}
            </p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
