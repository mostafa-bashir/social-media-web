"use client";

import { DatePicker, InputNumber, Radio, Select } from "antd";
import { useTranslations } from "next-intl";
import { useId } from "react";

import { dayjs } from "@/lib/dayjs";

import {
  REPEAT_FREQUENCIES,
  type RepeatFrequency,
  type RepeatRule,
} from "../types";

/** Mirrors the API's limits. */
const MAX_INTERVAL = 12;
const MIN_OCCURRENCES = 2;
const MAX_OCCURRENCES = 100;
const DEFAULT_OCCURRENCES = 4;
const DAY_FORMAT = "YYYY-MM-DD";

type Ending = "never" | "after" | "on";

/**
 * Repeats the post: each time is its own post, created when the previous
 * one has gone out, at the same local time.
 */
export default function RepeatField({
  value,
  onChange,
}: {
  value: RepeatRule | null;
  onChange: (rule: RepeatRule | null) => void;
}) {
  const t = useTranslations("posts.composer.repeat");
  const frequencyId = useId();
  const ending: Ending = value?.endsAfter
    ? "after"
    : value?.until
      ? "on"
      : "never";

  const setEnding = (next: Ending) => {
    if (!value) return;
    const { frequency, interval } = value;
    onChange(
      next === "after"
        ? { frequency, interval, endsAfter: DEFAULT_OCCURRENCES }
        : next === "on"
          ? {
              frequency,
              interval,
              until: dayjs().add(1, "month").format(DAY_FORMAT),
            }
          : { frequency, interval },
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={frequencyId} className="sr-only">
          {t("frequency")}
        </label>
        <Select<RepeatFrequency | "never">
          id={frequencyId}
          className="w-40!"
          value={value?.frequency ?? "never"}
          options={[
            { value: "never", label: t("never") },
            ...REPEAT_FREQUENCIES.map((frequency) => ({
              value: frequency,
              label: t(`frequencies.${frequency}`),
            })),
          ]}
          onChange={(frequency) =>
            onChange(
              frequency === "never"
                ? null
                : { ...(value ?? { interval: 1 }), frequency },
            )
          }
        />
        {value ? (
          <>
            <span className="text-sm text-text-secondary">{t("every")}</span>
            <InputNumber
              aria-label={t("interval")}
              min={1}
              max={MAX_INTERVAL}
              value={value.interval}
              onChange={(interval) =>
                onChange({ ...value, interval: interval ?? 1 })
              }
              className="w-20!"
            />
            <span className="text-sm text-text-secondary">
              {t(`units.${value.frequency}`, { count: value.interval })}
            </span>
          </>
        ) : null}
      </div>
      {value ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-text-primary">
            {t("ends")}
          </legend>
          <Radio.Group
            value={ending}
            onChange={(event) => setEnding(event.target.value as Ending)}
            className="flex! flex-col! gap-2"
          >
            <Radio value="never">{t("endsNever")}</Radio>
            <Radio value="after">
              <span className="inline-flex items-center gap-2">
                {t("endsAfter")}
                <InputNumber
                  size="small"
                  aria-label={t("occurrences")}
                  min={MIN_OCCURRENCES}
                  max={MAX_OCCURRENCES}
                  disabled={ending !== "after"}
                  value={value.endsAfter ?? DEFAULT_OCCURRENCES}
                  onChange={(endsAfter) =>
                    onChange({
                      frequency: value.frequency,
                      interval: value.interval,
                      endsAfter: endsAfter ?? DEFAULT_OCCURRENCES,
                    })
                  }
                  className="w-20!"
                />
                {t("times")}
              </span>
            </Radio>
            <Radio value="on">
              <span className="inline-flex items-center gap-2">
                {t("endsOn")}
                <DatePicker
                  size="small"
                  aria-label={t("lastDay")}
                  disabled={ending !== "on"}
                  value={value.until ? dayjs(value.until) : null}
                  allowClear={false}
                  disabledDate={(date) => date.isBefore(dayjs(), "day")}
                  onChange={(date) =>
                    date &&
                    onChange({
                      frequency: value.frequency,
                      interval: value.interval,
                      until: date.format(DAY_FORMAT),
                    })
                  }
                />
              </span>
            </Radio>
          </Radio.Group>
          <p className="text-xs text-text-tertiary">{t("hint")}</p>
        </fieldset>
      ) : null}
    </div>
  );
}
