/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useAuthenticatedImage } from "@heybray/react/hooks/use-authenticated-image";
import { useAppConfig } from "@heybray/react/config";
import { TierStars } from "@heybray/gamification-react/points/TierStars";
import { drawerPink } from "@heybray/gamification-react/teams/drawer-pink-styles";
import type { ContentHistoryItem } from "@heybray/gamification-react/teams/star-map-types";
import { apiRequest } from "@heybray/react/lib/queryClient";
import { cn } from "@heybray/ui/utils";

type SessionAttempt = {
  id: number;
  attemptNumber: number;
  score: number | null;
  isPassed: boolean | null;
  status: string;
  completedAt: string | null;
  tierName: string | null;
  starLevel: 0 | 1 | 2 | 3;
};

function formatAttemptDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ListCover({ mediaId }: { mediaId?: number | null }) {
  const { src } = useAuthenticatedImage(mediaId);
  return (
    <div
      className="h-12 w-16 shrink-0 rounded-md bg-muted bg-cover bg-center"
      style={src ? { backgroundImage: `url(${src})` } : undefined}
    />
  );
}

type DeckListRowProps = {
  item: ContentHistoryItem;
  teamId: number | "all";
  memberUserId: number;
};

export function DeckListRow({ item, teamId, memberUserId }: DeckListRowProps) {
  const { routes } = useAppConfig();
  const [, navigate] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const starLevel = (item.starLevel ?? 0) as 0 | 1 | 2 | 3;

  const attemptsPath = `/api/teams/${teamId}/members/${memberUserId}/contents/${item.contentId}/attempts`;

  const { data, isLoading } = useQuery<{ attempts: SessionAttempt[] }>({
    queryKey: [attemptsPath],
    queryFn: () => apiRequest("GET", attemptsPath),
    enabled: expanded,
  });

  return (
    <div className={cn("rounded-lg border bg-card", drawerPink.contentRow)}>
      <button
        type="button"
        className="flex w-full items-center gap-3 p-2 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <ListCover mediaId={item.coverImageMediaId} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.attemptCount ?? 0} session{(item.attemptCount ?? 0) === 1 ? "" : "s"}
            {item.bestScore != null ? ` · Best ${Math.round(item.bestScore)}%` : ""}
          </p>
        </div>
        <TierStars level={starLevel} size="sm" />
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t px-3 py-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading sessions…
            </div>
          ) : !data?.attempts.length ? (
            <p className="text-xs text-muted-foreground py-1">No completed sessions yet.</p>
          ) : (
            data.attempts.map((attempt) => (
              <button
                key={attempt.id}
                type="button"
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs hover:bg-muted/60"
                onClick={() => navigate(routes.contentPath("deck", item.contentId))}
              >
                <span>
                  Session {attempt.attemptNumber} · {formatAttemptDate(attempt.completedAt)}
                </span>
                <span className="tabular-nums">
                  {attempt.score != null ? `${Math.round(attempt.score)}%` : "—"}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
