/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { ClassificationOptionLabel } from "@heybray/react/classifications/ClassificationOptionLabel";

type TopicRef = {
  slug: string;
  label: string;
  color: string;
  icon: string;
};

export function TopicChip({ topic }: { topic: TopicRef }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-background">
      <ClassificationOptionLabel label={topic.label} icon={topic.icon} color={topic.color} />
    </span>
  );
}
