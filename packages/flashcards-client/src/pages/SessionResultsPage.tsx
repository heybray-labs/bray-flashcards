/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpen, Target } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@heybray/ui/components/button";
import { StagePanel } from "@heybray/gamification-react/reveal/StagePanel";
import { FieldBlock } from "@heybray/gamification-react/reveal/FieldBlock";
import { TierStars } from "@heybray/gamification-react/points/TierStars";
import { apiRequest, queryClient } from "@heybray/react/lib/queryClient";
import { NotFoundScreen } from "@heybray/react/errors";
import { starLevelFromTierName } from "@heybray/gamification/schema";

export type CompleteResult = {
  session: {
    id: number;
    cardsTotal: number;
    cardsCorrect: number;
    scorePercent: string | null;
  };
  passed: boolean;
  scorePercent: number;
  pointsAward: {
    pointsAwarded: number;
    tierName: string | null;
    totalPoints: number | null;
  } | null;
};

export default function SessionResultsPage() {
  const params = useParams();
  const deckId = params.id ? Number(params.id) : null;
  const sessionId = params.sessionId ? Number(params.sessionId) : null;

  const { data: deckData } = useQuery<{ deck: { title: string; passThreshold: number } }>({
    queryKey: [`/api/decks/${deckId}`],
    enabled: !!deckId,
  });

  const { data: result, isLoading } = useQuery<CompleteResult>({
    queryKey: [`session-result-${deckId}-${sessionId}`],
    queryFn: async () => {
      const stored = sessionStorage.getItem(`session-result-${deckId}-${sessionId}`);
      if (stored) return JSON.parse(stored) as CompleteResult;
      throw new Error("Missing session result");
    },
    enabled: !!deckId && !!sessionId,
    retry: false,
  });

  if (!deckId || !sessionId) return <NotFoundScreen />;

  const title = deckData?.deck.title ?? "Deck";
  const tierName = result?.pointsAward?.tierName;
  const starLevel = tierName
    ? (Math.min(3, Math.max(0, starLevelFromTierName(tierName))) as 1 | 2 | 3)
    : 0;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {isLoading || !result ? (
          <p className="text-muted-foreground text-center">Loading results…</p>
        ) : (
          <>
            <StagePanel
              step={1}
              label="Your deck"
              description="What you studied"
              icon={BookOpen}
            >
              <FieldBlock icon={BookOpen} label="Deck">
                {title}
              </FieldBlock>
              <FieldBlock icon={Target} label="Cards">
                {result.session.cardsCorrect} of {result.session.cardsTotal} marked &quot;knew it&quot;
              </FieldBlock>
            </StagePanel>

            <StagePanel
              step={2}
              label="Your score"
              description="Self-graded session result"
              icon={Target}
            >
              <p className="text-4xl font-bold tabular-nums">{Math.round(result.scorePercent)}%</p>
              <p className="text-sm text-muted-foreground mt-2">
                {result.passed ? "Passed this deck's threshold." : "Below the pass threshold this time."}
              </p>
            </StagePanel>

            <StagePanel
              step={3}
              label="Rewards"
              description="Points and star earned"
              icon={Award}
            >
              {result.pointsAward?.pointsAwarded ? (
                <div className="flex items-center gap-3">
                  {starLevel > 0 && <TierStars level={starLevel} />}
                  <div>
                    <p className="font-semibold">
                      +{result.pointsAward.pointsAwarded} points
                      {tierName ? ` · ${tierName}` : ""}
                    </p>
                    {result.pointsAward.totalPoints != null && (
                      <p className="text-sm text-muted-foreground">
                        Total on this deck: {result.pointsAward.totalPoints}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No new tier award this session.</p>
              )}
            </StagePanel>

            <div className="flex gap-3 pt-2">
              <Button asChild variant="outline">
                <Link href="/">Home</Link>
              </Button>
              <Button asChild>
                <Link href={`/decks/${deckId}`}>Back to deck</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

// Persist completion payload for the results page (StudyPage navigates here immediately).
export function storeSessionResult(deckId: number, sessionId: number, result: CompleteResult) {
  sessionStorage.setItem(`session-result-${deckId}-${sessionId}`, JSON.stringify(result));
  queryClient.setQueryData([`session-result-${deckId}-${sessionId}`], result);
}
