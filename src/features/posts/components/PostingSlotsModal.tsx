"use client";

import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Modal, Spin, TimePicker } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useErrorMessage } from "@/hooks/use-error-message";
import type { Dayjs } from "@/lib/dayjs";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { usePostingSlots, useSavePostingSlots } from "../api/smart-schedule";
import type { PostingSlot } from "../types";

const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;
const TIME_FORMAT = "HH:mm";
const MINUTE_STEP = 5;

const sortSlots = (slots: PostingSlot[]) =>
  [...slots].sort(
    (a, b) => a.weekday - b.weekday || a.localTime.localeCompare(b.localTime),
  );

/** The client's weekly posting times, in its own time zone; "Add to queue" fills them in order. */
export default function PostingSlotsModal({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const t = useTranslations("posts.postingSlots");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const query = usePostingSlots(clientId);
  const save = useSavePostingSlots();
  const [edited, setEdited] = useState<PostingSlot[] | null>(null);
  const [adding, setAdding] = useState<Record<number, Dayjs | null>>({});
  const slots = edited ?? query.data?.slots ?? [];

  const add = (weekday: number) => {
    const time = adding[weekday];
    if (!time) return;
    const localTime = time.format(TIME_FORMAT);
    if (
      !slots.some((s) => s.weekday === weekday && s.localTime === localTime)
    ) {
      setEdited(sortSlots([...slots, { weekday, localTime }]));
    }
    setAdding({ ...adding, [weekday]: null });
  };

  return (
    <Modal
      open
      title={t("title")}
      width={640}
      okText={t("save")}
      okButtonProps={{
        loading: save.isPending,
        disabled: edited === null,
        className: PRIMARY_PILL_BUTTON_CLASS,
      }}
      cancelButtonProps={{ className: "rounded-full!" }}
      onCancel={onClose}
      onOk={() =>
        save.mutate(
          { clientId, slots },
          {
            onSuccess: () => {
              message.success(t("saved"));
              onClose();
            },
            onError: (error) => message.error(errorMessage(error)),
          },
        )
      }
    >
      <div className="surface-card-form">
        <div className="surface-panel flex flex-col gap-3">
          <p className="text-sm text-text-secondary">
            {t("description")} <span dir="ltr">{query.data?.timezone}</span>
          </p>
          {query.isLoading ? (
            <Spin className="self-center" />
          ) : (
            <ul className="flex flex-col divide-y divide-border-default">
              {WEEKDAYS.map((weekday) => (
                <li
                  key={weekday}
                  className="flex flex-wrap items-center gap-2 py-2"
                >
                  <span className="w-24 text-sm font-medium text-text-primary">
                    {t(`weekdays.${weekday}`)}
                  </span>
                  {slots
                    .filter((slot) => slot.weekday === weekday)
                    .map((slot) => (
                      <span
                        key={slot.localTime}
                        dir="ltr"
                        className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 text-sm text-primary-text"
                      >
                        {slot.localTime}
                        <button
                          type="button"
                          aria-label={t("remove", {
                            day: t(`weekdays.${weekday}`),
                            time: slot.localTime,
                          })}
                          className="flex text-xs"
                          onClick={() =>
                            setEdited(slots.filter((item) => item !== slot))
                          }
                        >
                          <CloseOutlined aria-hidden />
                        </button>
                      </span>
                    ))}
                  <span className="ms-auto inline-flex items-center gap-1">
                    <TimePicker
                      size="small"
                      format={TIME_FORMAT}
                      minuteStep={MINUTE_STEP}
                      needConfirm={false}
                      aria-label={t("timeFor", {
                        day: t(`weekdays.${weekday}`),
                      })}
                      value={adding[weekday] ?? null}
                      onChange={(time) =>
                        setAdding({ ...adding, [weekday]: time })
                      }
                      className="w-24!"
                    />
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      aria-label={t("add", { day: t(`weekdays.${weekday}`) })}
                      disabled={!adding[weekday]}
                      onClick={() => add(weekday)}
                    />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
