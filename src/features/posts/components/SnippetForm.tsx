"use client";

import { Button, Form, Input, Radio } from "antd";
import { useTranslations } from "next-intl";

import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import {
  type CaptionSnippet,
  type CaptionSnippetInput,
  SNIPPET_KINDS,
  type SnippetKind,
} from "../types";

const MAX_NAME = 60;
const MAX_BODY = 2_200;

type Scope = "client" | "workspace";

interface FormValues {
  kind: SnippetKind;
  name: string;
  body: string;
  scope: Scope;
}

/** Create or edit a snippet; the client/workspace choice is fixed after creation. */
export default function SnippetForm({
  clientId,
  snippet,
  saving,
  onCancel,
  onSave,
}: {
  clientId: string;
  snippet?: CaptionSnippet;
  saving: boolean;
  onCancel: () => void;
  onSave: (input: CaptionSnippetInput) => void;
}) {
  const t = useTranslations("posts.composer.snippets");

  return (
    <Form<FormValues>
      name="caption-snippet"
      layout="vertical"
      requiredMark={false}
      initialValues={{
        kind: snippet?.kind ?? "hashtags",
        name: snippet?.name ?? "",
        body: snippet?.body ?? "",
        scope: snippet && snippet.clientId === null ? "workspace" : "client",
      }}
      onFinish={(values) =>
        onSave({
          kind: values.kind,
          name: values.name.trim(),
          body: values.body.trim(),
          clientId: values.scope === "client" ? clientId : undefined,
        })
      }
    >
      <Form.Item name="kind" label={t("kind")}>
        <Radio.Group
          optionType="button"
          options={SNIPPET_KINDS.map((kind) => ({
            value: kind,
            label: t(`kinds.${kind}`),
          }))}
        />
      </Form.Item>
      <Form.Item
        name="name"
        label={t("name")}
        rules={[
          { required: true, whitespace: true, message: t("nameRequired") },
        ]}
      >
        <Input maxLength={MAX_NAME} />
      </Form.Item>
      <Form.Item
        name="body"
        label={t("body")}
        rules={[
          { required: true, whitespace: true, message: t("bodyRequired") },
        ]}
      >
        <Input.TextArea
          maxLength={MAX_BODY}
          showCount
          autoSize={{ minRows: 3, maxRows: 8 }}
          placeholder={t("bodyPlaceholder")}
        />
      </Form.Item>
      {snippet ? null : (
        <Form.Item name="scope" label={t("scope")}>
          <Radio.Group
            options={[
              { value: "client", label: t("scopeClient") },
              { value: "workspace", label: t("scopeWorkspace") },
            ]}
          />
        </Form.Item>
      )}
      <div className="flex justify-end gap-2">
        <Button className="rounded-full!" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={saving}
          className={PRIMARY_PILL_BUTTON_CLASS}
        >
          {t("save")}
        </Button>
      </div>
    </Form>
  );
}
