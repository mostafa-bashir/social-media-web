"use client";

import { Modal, Tabs } from "antd";
import { useTranslations } from "next-intl";

import AutomationRulesForm from "./AutomationRulesForm";
import KeyPrefixForm from "./KeyPrefixForm";
import LabelsManager from "./LabelsManager";

export interface BoardSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

/** Workspace-wide task settings for people with `tasks.configure`. */
export default function BoardSettingsModal({
  open,
  onClose,
}: BoardSettingsModalProps) {
  const t = useTranslations("tasks.settings");
  return (
    <Modal
      open={open}
      title={t("title")}
      footer={null}
      onCancel={onClose}
      width={600}
      destroyOnHidden
    >
      <Tabs
        items={[
          {
            key: "automation",
            label: t("automation"),
            children: <AutomationRulesForm />,
          },
          { key: "labels", label: t("labels"), children: <LabelsManager /> },
          { key: "keys", label: t("keys"), children: <KeyPrefixForm /> },
        ]}
      />
    </Modal>
  );
}
