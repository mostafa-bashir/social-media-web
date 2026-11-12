"use client";

import { YoutubeFilled } from "@ant-design/icons";
import { Alert, App, Button, Form, Input, Modal } from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import {
  useClearPublicYoutube,
  useSetPublicYoutube,
} from "../api/client-mutations";
import type { Client } from "../types";

const MAX_CHANNEL_INPUT = 200;

export interface PublicYoutubeModalProps {
  client: Client | null;
  onClose: () => void;
  onSaved: (client: Client) => void;
}

/**
 * A prospect's public YouTube channel: the audit rates it from public data
 * before they connect anything. Looked up on YouTube when saved.
 */
export default function PublicYoutubeModal({
  client,
  onClose,
  onSaved,
}: PublicYoutubeModalProps) {
  const t = useTranslations("clients.publicYoutube");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [form] = Form.useForm<{ channel: string }>();
  const save = useSetPublicYoutube();
  const clear = useClearPublicYoutube();
  const error = save.error ?? clear.error;

  return (
    <Modal
      open={client !== null}
      title={t("title")}
      okText={t("save")}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={save.isPending}
      okButtonProps={{ className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text-secondary">{t("description")}</p>
        {error ? (
          <Alert type="error" showIcon title={errorMessage(error)} />
        ) : null}
        {client?.publicYoutube ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-default p-3">
            <span className="flex items-center gap-2 text-text-primary">
              <YoutubeFilled aria-hidden />
              {t("current", { title: client.publicYoutube.title })}
            </span>
            <Button
              size="small"
              danger
              className="rounded-full!"
              loading={clear.isPending}
              onClick={() =>
                clear.mutate(client.id, {
                  onSuccess: (updated) => {
                    message.success(t("removed"));
                    onSaved(updated);
                  },
                })
              }
            >
              {t("remove")}
            </Button>
          </div>
        ) : null}
        <Form<{ channel: string }>
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={{ channel: "" }}
          onFinish={({ channel }) =>
            client &&
            save.mutate(
              { clientId: client.id, channel: channel.trim() },
              {
                onSuccess: (updated) => {
                  message.success(
                    t("saved", { title: updated.publicYoutube?.title ?? "" }),
                  );
                  onSaved(updated);
                },
              },
            )
          }
        >
          <Form.Item
            name="channel"
            label={t("channel")}
            extra={t("channelHint")}
            rules={[
              { required: true, whitespace: true, message: t("required") },
            ]}
            className="mb-0!"
          >
            <Input
              autoFocus
              dir="ltr"
              placeholder="@yourbrand"
              maxLength={MAX_CHANNEL_INPUT}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
