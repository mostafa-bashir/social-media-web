import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { LandingTone } from "../lib/tones";
import AnalyticsMockup from "./mockups/AnalyticsMockup";
import CalendarMockup from "./mockups/CalendarMockup";
import KanbanMockup from "./mockups/KanbanMockup";
import ShowcaseRow from "./ShowcaseRow";

const POINT_KEYS = ["first", "second", "third"] as const;

const SHOWCASE_ROWS: readonly {
  key: "publishing" | "analytics" | "tasks";
  tone: LandingTone;
  mockup: ReactNode;
}[] = [
  { key: "publishing", tone: "primary", mockup: <CalendarMockup /> },
  { key: "analytics", tone: "growth", mockup: <AnalyticsMockup /> },
  { key: "tasks", tone: "accent", mockup: <KanbanMockup /> },
];

export default function FeatureShowcase() {
  const t = useTranslations("landing.showcase");
  return (
    <div className="bg-background-subtle px-4 py-8 sm:px-6 lg:py-12">
      {SHOWCASE_ROWS.map(({ key, tone, mockup }, index) => (
        <ShowcaseRow
          key={key}
          id={`showcase-${key}-title`}
          eyebrow={t(`${key}.eyebrow`)}
          title={t(`${key}.title`)}
          body={t(`${key}.body`)}
          points={POINT_KEYS.map((point) => t(`${key}.points.${point}`))}
          tone={tone}
          reversed={index % 2 === 1}
        >
          {mockup}
        </ShowcaseRow>
      ))}
    </div>
  );
}
