/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useAuthenticatedImage } from "@heybray/react/hooks/use-authenticated-image";
import { cn } from "@heybray/ui/utils";

type DeckCoverProps = {
  mediaId?: number | null;
  className?: string;
  aspectClassName?: string;
};

export function DeckCover({
  mediaId,
  className,
  aspectClassName = "aspect-[4/3]",
}: DeckCoverProps) {
  const { src } = useAuthenticatedImage(mediaId);
  return (
    <div
      className={cn(
        "rounded-lg bg-muted bg-cover bg-center",
        aspectClassName,
        className,
      )}
      style={src ? { backgroundImage: `url(${src})` } : undefined}
    />
  );
}
