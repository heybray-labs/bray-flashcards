/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { DeckCover } from "@/components/DeckCover";
import { TopicChip } from "@/components/TopicChip";
import { FeatureGate } from "@heybray/react/extensions/use-feature";
import { LeaderboardPanel } from "@heybray/gamification-react/points/LeaderboardPanel";
import { RecentStarsPanel } from "@heybray/gamification-react/points/RecentStarsPanel";
import { YourProgressPanel, ALL_CATEGORIES_SLUG } from "@heybray/gamification-react/points/YourProgressPanel";
import { useAuth } from "@heybray/react/hooks/use-auth";
import { Layers } from "lucide-react";

type TopicRef = { slug: string; label: string; color: string; icon: string };

type DeckItem = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  coverImageMediaId: number | null;
  cardCount: number;
  classifications: Record<string, TopicRef | TopicRef[] | undefined>;
};

export default function HomePage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("deck:manage");

  const { data: decksData, isLoading } = useQuery<{ items: DeckItem[] }>({
    queryKey: ["/api/decks"],
  });

  const { data: taxonomy } = useQuery<{
    dimensions: Array<{
      slug: string;
      options: Array<{ slug: string; label: string; color: string; icon: string; usageCount?: number }>;
    }>;
  }>({
    queryKey: ["/api/classifications"],
  });

  const topicOptions = useMemo(() => {
    return (
      taxonomy?.dimensions
        .find((d) => d.slug === "topic")
        ?.options.map((option) => ({
          slug: option.slug,
          label: option.label,
          icon: option.icon,
          color: option.color,
        })) ?? []
    );
  }, [taxonomy]);

  const items = decksData?.items ?? [];

  return (
    <AppLayout>
      <div className="w-full px-4 lg:px-6 py-6 flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-3.5rem)]">
        <div className="min-w-0 lg:w-[70%] flex flex-col gap-4 overflow-auto">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Study decks</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Flip cards, self-grade, and earn stars on published decks.
              </p>
            </div>
          </header>

          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading decks…</p>
          ) : !items.length ? (
            <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
              <Layers className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {canManage
                  ? "No decks yet — create one via the API or add a manage UI in a later step."
                  : "No published decks yet."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((deck) => {
                const topic = deck.classifications?.topic;
                const topicRef = topic && !Array.isArray(topic) ? topic : null;
                return (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.id}`}
                    className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow no-underline text-inherit"
                  >
                    <DeckCover
                      mediaId={deck.coverImageMediaId}
                      className="w-full rounded-none"
                      aspectClassName="aspect-[16/9]"
                    />
                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-semibold group-hover:text-primary transition-colors">
                          {deck.title}
                        </h2>
                        {deck.status === "draft" && canManage && (
                          <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground border rounded px-1.5 py-0.5">
                            Draft
                          </span>
                        )}
                      </div>
                      {deck.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{deck.cardCount} card{deck.cardCount === 1 ? "" : "s"}</span>
                        {topicRef && <TopicChip topic={topicRef} />}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <aside className="w-full lg:w-[30%] shrink-0 flex flex-col gap-4 min-h-[20rem]">
          <YourProgressPanel
            onCategorySelect={(slug) => {
              if (slug === ALL_CATEGORIES_SLUG) return;
            }}
          />
          <FeatureGate featureKey="leaderboard">
            <LeaderboardPanel categoryOptions={topicOptions} />
          </FeatureGate>
          <RecentStarsPanel />
        </aside>
      </div>
    </AppLayout>
  );
}
