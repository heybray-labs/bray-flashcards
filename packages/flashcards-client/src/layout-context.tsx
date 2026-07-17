/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { createContext, useContext, type ReactNode } from "react";

type LayoutContextValue = {
  usePackageLayout: boolean;
};

const LayoutContext = createContext<LayoutContextValue>({ usePackageLayout: true });

export function PackageLayoutProvider({
  usePackageLayout = true,
  children,
}: {
  usePackageLayout?: boolean;
  children: ReactNode;
}) {
  return (
    <LayoutContext.Provider value={{ usePackageLayout }}>{children}</LayoutContext.Provider>
  );
}

export function usePackageLayoutEnabled(): boolean {
  return useContext(LayoutContext).usePackageLayout;
}
