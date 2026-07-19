/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 *
 * Pastel Lucide PNG cover renderer for demo deck seeding.
 */

import type { IconNode } from "lucide";
import sharp from "sharp";

const COVER_WIDTH = 1200;
const COVER_HEIGHT = 675;
const ICON_VIEWBOX = 24;
const ICON_SCALE = 6;

export type DemoCoverArt = {
  icon: IconNode;
  background: string;
  foreground: string;
};

function serializeAttrs(attrs: Record<string, string | number | undefined>): string {
  return Object.entries(attrs)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const kebab = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
      return `${kebab}="${String(value).replace(/"/g, "&quot;")}"`;
    })
    .join(" ");
}

function iconNodesToSvg(nodes: IconNode): string {
  return nodes
    .map(([tag, attrs]) => `<${tag} ${serializeAttrs(attrs)} />`)
    .join("\n    ");
}

export function renderCoverSvgFromArt({ icon, background, foreground }: DemoCoverArt): string {
  const tx = COVER_WIDTH / 2 - (ICON_VIEWBOX / 2) * ICON_SCALE;
  const ty = COVER_HEIGHT / 2 - (ICON_VIEWBOX / 2) * ICON_SCALE;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" role="img" aria-hidden="true">
  <rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="${background}" />
  <g transform="translate(${tx} ${ty}) scale(${ICON_SCALE})" fill="none" stroke="${foreground}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${iconNodesToSvg(icon)}
  </g>
</svg>`;
}

export async function renderCoverImageFromArt(art: DemoCoverArt): Promise<Buffer> {
  const svg = renderCoverSvgFromArt(art);
  return sharp(Buffer.from(svg)).png().toBuffer();
}
