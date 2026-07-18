/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import type { ReactNode } from "react";
import { Link } from "wouter";
import { MainLayout } from "@heybray/react/components/MainLayout";
import { AppBrandTitle } from "@heybray/react/components/AppBrandTitle";
import { getAdminPanels } from "@heybray/react/extensions/admin-registry";
import { useAppConfig } from "@heybray/react/config";
import { GamificationNavActions } from "@heybray/gamification-react";
import logoSrc from "@/assets/logo.svg";
import { usePackageLayoutEnabled } from "@/layout-context";

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

export function AppLayout({ children }: { children: ReactNode }) {
  const usePackageLayout = usePackageLayoutEnabled();
  if (!usePackageLayout) {
    return <>{children}</>;
  }

  return (
    <MainLayout
      brand={<AppBrand />}
      actions={<GamificationNavActions />}
      settingsPanels={getAdminPanels()}
      managePermission={MANAGE_PERMISSION}
    >
      {children}
    </MainLayout>
  );
}
