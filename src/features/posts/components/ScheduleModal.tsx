"use client";

import { Alert, DatePicker, Modal } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  type Dayjs,
  isoToPickerValue,
  nowAsPickerValue,
  pickerValueToIso,
} from "@/lib/dayjs";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

/** Mirrors the API's minimum lead, plus a minute for the user to click. */
const MIN_LEAD_MINUTES = 2;
const PICKER_FORMAT = "YYYY-MM-DD HH:mm";

export interface ScheduleModalProps {
  open: boolean;
  timezone: string;
  /** Current schedule (UTC ISO), when rescheduling. */
  scheduledAt?: string | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: (scheduledAtIso: string) => void;
  /** Overrides for reuse when submitting for review or approving. */
  title?: string;
  confirmLabel?: string;
}

/** Date and time are picked in the client's timezone, which the label names. */
export default function ScheduleModal({
  open,
  timezone,
  scheduledAt,
  loading,
  onCancel,
  onConfirm,
  title,
  confirmLabel,
}: ScheduleModalProps) {
  const t = useTranslations("posts.schedule");
  // Mounted only while open (see the composer), so this starts fresh each time.
  const [value, setValue] = useState<Dayjs | null>(() =>
    scheduledAt ? isoToPickerValue(scheduledAt, timezone) : null,
  );
  const [tooSoon, setTooSoon] = useState(false);

  const confirm = () => {
    if (!value) return;
    const earliest = nowAsPickerValue(timezone).add(MIN_LEAD_MINUTES, "minute");
    if (value.isBefore(earliest)) {
      setTooSoon(true);
      return;
    }
    onConfirm(pickerValueToIso(value, timezone));
  };

  return (
    <Modal
      open={open}
      title={title ?? t("title")}
      okText={confirmLabel ?? t("confirm")}
      onOk={confirm}
      okButtonProps={{
        disabled: !value,
        loading,
        className: PRIMARY_PILL_BUTTON_CLASS,
      }}
      cancelButtonProps={{ className: "h-11! rounded-full! px-6!" }}
      onCancel={onCancel}
      destroyOnHidden
    >
      <div className="surface-card-form">
        <div className="surface-panel flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-text-primary">
              {t("when")}
            </span>
            <DatePicker
              showTime={{ format: "HH:mm", minuteStep: 5 }}
              format={PICKER_FORMAT}
              value={value}
              onChange={(next) => {
                setValue(next);
                setTooSoon(false);
              }}
              disabledDate={(date) =>
                date.isBefore(nowAsPickerValue(timezone), "day")
              }
              className="w-full"
            />
          </label>
          <span className="text-xs text-text-tertiary">
            {t("timezoneHint")} <span dir="ltr">{timezone}</span>
          </span>
          {tooSoon ? (
            <Alert type="error" showIcon title={t("tooSoon")} />
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
