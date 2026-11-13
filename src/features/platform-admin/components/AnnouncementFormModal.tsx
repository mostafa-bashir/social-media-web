"use client";

import {
  Alert,
  App,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Select,
} from "antd";
import { useTranslations } from "next-intl";

import { useErrorMessage } from "@/hooks/use-error-message";

import { useSaveAnnouncement } from "../api/announcements";
import {
  ANNOUNCEMENT_BODY_MAX,
  ANNOUNCEMENT_TITLE_MAX,
  type AnnouncementFormValues,
  toFormValues,
  toInput,
} from "../lib/announcement-form";
import {
  type AdminAnnouncement,
  ANNOUNCEMENT_SEVERITIES,
} from "../types/announcements";
import TenantPicker from "./TenantPicker";

/** Create or edit an announcement; `editing` null = new one. */
export default function AnnouncementFormModal({
  open,
  editing,
  onClose,
}: {
  open: boolean;
  editing: AdminAnnouncement | null;
  onClose: () => void;
}) {
  const t = useTranslations("admin.announcements.form");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const [form] = Form.useForm<AnnouncementFormValues>();
  const save = useSaveAnnouncement();
  const audience = Form.useWatch("audience", form);

  const initialValues = toFormValues(editing);

  const close = () => {
    save.reset();
    onClose();
  };

  const onFinish = (values: AnnouncementFormValues) =>
    save.mutate(
      { id: editing?.id, ...toInput(values) },
      {
        onSuccess: () => {
          message.success(t(editing ? "updated" : "created"));
          close();
        },
      },
    );

  const required = { required: true, message: tValidation("required") };

  return (
    <Modal
      open={open}
      title={t(editing ? "editTitle" : "createTitle")}
      okText={t("save")}
      onOk={() => form.submit()}
      onCancel={close}
      confirmLoading={save.isPending}
      okButtonProps={{ className: "rounded-full!" }}
      cancelButtonProps={{ className: "rounded-full!" }}
      destroyOnHidden
    >
      <div className="surface-card-form">
        <div className="surface-panel">
          {save.error ? (
            <Alert
              type="error"
              showIcon
              title={errorMessage(save.error)}
              className="mb-4!"
            />
          ) : null}
          <Form<AnnouncementFormValues>
            form={form}
            layout="vertical"
            requiredMark={false}
            initialValues={initialValues}
            onFinish={onFinish}
          >
            <Form.Item name="title" label={t("title")} rules={[required]}>
              <Input maxLength={ANNOUNCEMENT_TITLE_MAX} showCount autoFocus />
            </Form.Item>
            <Form.Item name="body" label={t("body")} rules={[required]}>
              <Input.TextArea
                rows={3}
                maxLength={ANNOUNCEMENT_BODY_MAX}
                showCount
              />
            </Form.Item>
            <Form.Item name="severity" label={t("severity")}>
              <Select
                options={ANNOUNCEMENT_SEVERITIES.map((value) => ({
                  value,
                  label: t(`severities.${value}`),
                }))}
              />
            </Form.Item>
            <Form.Item name="audience" label={t("audience")}>
              <Radio.Group
                options={[
                  { value: "all", label: t("audienceAll") },
                  { value: "selected", label: t("audienceSelected") },
                ]}
              />
            </Form.Item>
            {audience === "selected" ? (
              <Form.Item
                name="tenantIds"
                label={t("tenants")}
                rules={[required]}
              >
                <TenantPicker initialTenants={editing?.tenants} />
              </Form.Item>
            ) : null}
            <Form.Item
              name="window"
              label={t("window")}
              extra={t("windowHint")}
              className="mb-0!"
            >
              <DatePicker.RangePicker
                showTime
                allowEmpty={[true, true]}
                className="w-full"
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
