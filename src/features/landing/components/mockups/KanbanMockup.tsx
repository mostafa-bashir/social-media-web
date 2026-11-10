import { useTranslations } from "next-intl";

import { type LandingTone, TONE_CHIP_CLASS } from "../../lib/tones";

type LabelKey = "content" | "design" | "client";

const LABEL_TONE: Record<LabelKey, LandingTone> = {
  content: "primary",
  design: "accent",
  client: "growth",
};

const COLUMNS: readonly {
  key: "todo" | "doing" | "done";
  dotClass: string;
  tasks: readonly { key: string; label: LabelKey; progressClass: string }[];
}[] = [
  {
    key: "todo",
    dotClass: "bg-text-tertiary",
    tasks: [
      { key: "brief", label: "content", progressClass: "w-1/6" },
      { key: "captions", label: "content", progressClass: "w-1/4" },
    ],
  },
  {
    key: "doing",
    dotClass: "bg-primary",
    tasks: [
      { key: "shoot", label: "design", progressClass: "w-1/2" },
      { key: "edit", label: "design", progressClass: "w-2/3" },
    ],
  },
  {
    key: "done",
    dotClass: "bg-growth",
    tasks: [{ key: "report", label: "client", progressClass: "w-full" }],
  },
];

export default function KanbanMockup() {
  const t = useTranslations("landing.mockups");
  return (
    <figure>
      <figcaption className="sr-only">{t("kanbanCaption")}</figcaption>
      <div aria-hidden className="surface-card-raised">
        <div className="surface-panel p-3! sm:p-5!">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {COLUMNS.map((column) => (
              <div
                key={column.key}
                className="min-w-0 rounded-lg bg-background-subtle p-1.5 sm:p-2"
              >
                <p className="flex items-center gap-1.5 px-1 pb-2 text-[11px] font-semibold text-text-secondary sm:text-xs">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${column.dotClass}`}
                  />
                  <span className="truncate">{t(`columns.${column.key}`)}</span>
                  <span className="ms-auto text-text-tertiary">
                    {column.tasks.length}
                  </span>
                </p>
                <div className="flex min-h-40 flex-col gap-2">
                  {column.tasks.map((task) => (
                    <div
                      key={task.key}
                      className="rounded-md border border-border-secondary bg-surface p-2"
                    >
                      <span
                        className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${TONE_CHIP_CLASS[LABEL_TONE[task.label]]}`}
                      >
                        {t(`labels.${task.label}`)}
                      </span>
                      <p className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-snug text-text-primary sm:text-xs">
                        {t(`tasks.${task.key}`)}
                      </p>
                      <div className="mt-2 h-1 rounded-full bg-background-tertiary">
                        <div
                          className={`h-full rounded-full bg-primary ${task.progressClass}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
