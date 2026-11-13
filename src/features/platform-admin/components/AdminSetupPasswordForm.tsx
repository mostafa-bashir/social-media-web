"use client";

import { Alert, Button, Form, Input, Result } from "antd";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { z } from "zod";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";
import { zodRule } from "@/lib/forms/zod-rule";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { setAdminPassword } from "../api/admin-session";

/** Mirrors the API's admin password rule (longer than agency passwords). */
const adminPasswordSchema = z
  .string("required")
  .min(12, "adminPasswordMin")
  .max(128, "passwordMax")
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "passwordPattern");

interface SetupValues {
  password: string;
  confirm: string;
}

/** Invited admins choose their first password from the emailed link. */
export default function AdminSetupPasswordForm() {
  const t = useTranslations("admin.setupPassword");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const token = useSearchParams().get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <Result
        status="success"
        title={t("doneTitle")}
        subTitle={t("doneSubtitle")}
        extra={<Link href={routes.admin.login}>{t("goToLogin")}</Link>}
      />
    );
  }

  const onFinish = async ({ password }: SetupValues) => {
    setSubmitting(true);
    setError(null);
    try {
      await setAdminPassword(token, password);
      setDone(true);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="mb-1 text-xl font-semibold text-text-primary">
        {t("title")}
      </h1>
      <p className="mb-5 text-sm text-text-secondary">{t("subtitle")}</p>
      {!token ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage("INVALID_OR_EXPIRED_LINK")}
        />
      ) : (
        <>
          {error ? (
            <Alert type="error" showIcon title={error} className="mb-4!" />
          ) : null}
          <Form<SetupValues>
            layout="vertical"
            requiredMark={false}
            onFinish={onFinish}
          >
            <Form.Item
              name="password"
              label={t("password")}
              rules={[zodRule(adminPasswordSchema, tValidation)]}
            >
              <Input.Password autoComplete="new-password" autoFocus />
            </Form.Item>
            <Form.Item
              name="confirm"
              label={t("confirm")}
              dependencies={["password"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    value === getFieldValue("password")
                      ? Promise.resolve()
                      : Promise.reject(new Error(t("mismatch"))),
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className={PRIMARY_PILL_BUTTON_CLASS}
              block
              loading={submitting}
            >
              {t("submit")}
            </Button>
          </Form>
        </>
      )}
    </>
  );
}
