/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Star, LayoutGrid } from "lucide-react";
import { MainLayout } from "@heybray/react/components/MainLayout";
import { AppBrandTitle } from "@heybray/react/components/AppBrandTitle";
import { getAdminPanels } from "@heybray/react/extensions/admin-registry";
import { useAuth } from "@heybray/react/hooks/use-auth";
import { apiRequest } from "@heybray/react/lib/queryClient";
import { HttpError } from "@heybray/react/lib/http-error";
import { useAppConfig } from "@heybray/react/config";
import { Button } from "@heybray/ui/components/button";
import { NoticeBannerButton, noticeLabelClassName } from "@heybray/ui/components/NoticeBanner";
import { PointsHistoryDialog } from "@heybray/gamification-react/points/PointsHistoryDialog";
import logoSrc from "@/logo.svg";

const MANAGE_PERMISSION = "deck:manage";

function AppBrand() {
  const { displayName } = useAppConfig();
  return (
    <Link href="/" className="flex items-end gap-2 no-underline">
      <img src={logoSrc} alt="" className="h-8 w-8" />
      <AppBrandTitle appName={displayName} />
    </Link>
  );
}

function AppNavActions() {
  const { user, hasRole } = useAuth();
  const [, navigate] = useLocation();
  const [pointsHistoryOpen, setPointsHistoryOpen] = useState(false);
  const isAdmin = hasRole("admin");

  const { data: teamsAccess } = useQuery<{ teams: unknown[] }>({
    queryKey: ["/api/teams"],
    queryFn: async () => {
      try {
        return await apiRequest("GET", "/api/teams");
      } catch (error) {
        if (error instanceof HttpError && error.status === 403) {
          return { teams: [] };
        }
        throw error;
      }
    },
    enabled: !!user,
    retry: false,
    throwOnError: false,
  });

  const showStarMapNav = (teamsAccess?.teams?.length ?? 0) > 0 || isAdmin;

  const { data: pointsData } = useQuery<{ total: number; monthTotal: number }>({
    queryKey: ["/api/points/me"],
    queryFn: () => apiRequest("GET", "/api/points/me"),
    enabled: !!user,
  });

  return (
    <>
      {showStarMapNav && (
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1.5 hidden sm:inline-flex"
          onClick={() => navigate("/team-star-map")}
        >
          <LayoutGrid className="h-4 w-4" />
          Star Map
        </Button>
      )}

      <NoticeBannerButton
        variant="rewards"
        layout="rewards"
        onClick={() => setPointsHistoryOpen(true)}
        title="View points history"
      >
        <Star className="h-4 w-4 fill-[var(--featured-star-fill)] text-[var(--featured-star)] shrink-0" />
        <span className="flex items-center gap-3">
          <span className="flex flex-col items-start leading-tight">
            <span className={noticeLabelClassName()}>This month</span>
            <span className="font-bold tabular-nums">{pointsData?.monthTotal ?? 0}</span>
          </span>
          <span className="h-8 w-px bg-[var(--rewards-banner-border)]" aria-hidden />
          <span className="flex flex-col items-start leading-tight">
            <span className={noticeLabelClassName()}>All time</span>
            <span className="font-bold tabular-nums">{pointsData?.total ?? 0}</span>
          </span>
        </span>
      </NoticeBannerButton>

      <PointsHistoryDialog open={pointsHistoryOpen} onOpenChange={setPointsHistoryOpen} />
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <MainLayout
      brand={<AppBrand />}
      actions={<AppNavActions />}
      settingsPanels={getAdminPanels()}
      managePermission={MANAGE_PERMISSION}
    >
      {children}
    </MainLayout>
  );
}
