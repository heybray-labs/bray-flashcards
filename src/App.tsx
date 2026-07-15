/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "@heybray/react/lib/queryClient";
import { AuthProvider } from "@heybray/react/hooks/use-auth";
import { AppConfigProvider } from "@heybray/react/config";
import { ProtectedRoute } from "@heybray/react/components/ProtectedRoute";
import { Toaster } from "@heybray/ui/components/toaster";
import LoginPage from "@heybray/react/pages/LoginPage";
import RegisterPage from "@heybray/react/pages/RegisterPage";
import logoSrc from "./logo.svg";
import heroImageSrc from "./hero.svg";

const appConfig = {
  displayName: "Bray Flashcards",
  tagline: "Study decks, earn stars",
  urls: { repo: "https://github.com/heybray-labs/bray-flashcards" },
  routes: {
    contentPath: (_contentType: string, contentId: number) => `/decks/${contentId}`,
  },
};

function PlaceholderHome() {
  return (
    <main className="mx-auto max-w-lg p-8 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Bray Flashcards</h1>
      <p className="mt-2 text-muted-foreground">Scaffold ready — app pages land in Step 4.</p>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppConfigProvider value={appConfig}>
        <AuthProvider>
          <Switch>
            <Route path="/login">
              <LoginPage logoSrc={logoSrc} heroImageSrc={heroImageSrc} />
            </Route>
            <Route path="/register">
              <RegisterPage logoSrc={logoSrc} heroImageSrc={heroImageSrc} />
            </Route>
            <Route path="/">
              <ProtectedRoute>
                <PlaceholderHome />
              </ProtectedRoute>
            </Route>
          </Switch>
          <Toaster />
        </AuthProvider>
      </AppConfigProvider>
    </QueryClientProvider>
  );
}
