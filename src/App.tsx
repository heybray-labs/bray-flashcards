/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@heybray/react/lib/queryClient";
import { AuthProvider } from "@heybray/react/hooks/use-auth";
import { AppConfigProvider, type AppConfig } from "@heybray/react/config";
import { ProtectedRoute } from "@heybray/react/components/ProtectedRoute";
import { Toaster } from "@heybray/ui/components/toaster";
import { AppErrorBoundary, PageNotFoundScreen } from "@heybray/react/errors";
import LoginPage from "@heybray/react/pages/LoginPage";
import RegisterPage from "@heybray/react/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import DeckDetailPage from "@/pages/DeckDetailPage";
import StudyPage from "@/pages/StudyPage";
import SessionResultsPage from "@/pages/SessionResultsPage";
import TeamStarMapPage from "@/pages/TeamStarMapPage";
import "@/admin-panels";
import logoSrc from "./logo.svg";
import heroImageSrc from "./hero.svg";

const GITHUB_REPO_URL = "https://github.com/heybray-labs/bray-flashcards";

const appConfig: AppConfig = {
  displayName: "Bray Flashcards",
  tagline: "Study decks, earn stars, master topics",
  urls: {
    repo: GITHUB_REPO_URL,
    docs: `${GITHUB_REPO_URL}/tree/main/docs`,
    issues: `${GITHUB_REPO_URL}/issues`,
  },
  routes: {
    contentPath: (_contentType, contentId) => `/decks/${contentId}`,
  },
};

const authBranding = { logoSrc, heroImageSrc };

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppConfigProvider value={appConfig}>
        <AuthProvider>
          <AppErrorBoundary>
            <Switch>
              <Route path="/login">{() => <LoginPage {...authBranding} />}</Route>
              <Route path="/register">{() => <RegisterPage {...authBranding} />}</Route>
              <Route path="/">
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              </Route>
              <Route path="/decks/:id">
                <ProtectedRoute>
                  <DeckDetailPage />
                </ProtectedRoute>
              </Route>
              <Route path="/decks/:id/study/:sessionId">
                <ProtectedRoute>
                  <StudyPage />
                </ProtectedRoute>
              </Route>
              <Route path="/decks/:id/results/:sessionId">
                <ProtectedRoute>
                  <SessionResultsPage />
                </ProtectedRoute>
              </Route>
              <Route path="/team-star-map">
                <ProtectedRoute>
                  <TeamStarMapPage />
                </ProtectedRoute>
              </Route>
              <Route>
                <PageNotFoundScreen />
              </Route>
            </Switch>
          </AppErrorBoundary>
          <Toaster />
        </AuthProvider>
      </AppConfigProvider>
    </QueryClientProvider>
  );
}
