"use client";

import { Alert, Button, Form, Input, Result } from "antd";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";
import { passwordSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { useResetPassword } from "../api/auth-api";
import AuthHeader from "./AuthHeader";

export default function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const token = useSearchParams().get("token");
  const reset = useResetPassword();

  if (!token) {
    return (
      <Alert
        type="error"
        showIcon
        title={errorMessage("INVALID_OR_EXPIRED_LINK")}
        action={
          <Link href={routes.auth.forgotPassword}>{t("requestNew")}</Link>
        }
      />
    );
  }

  if (reset.isSuccess) {
    return (
      <Result
        status="success"
        title={t("doneTitle")}
        extra={<Link href={routes.auth.login}>{t("goToLogin")}</Link>}
      />
    );
  }

  return (
    <>
      <AuthHeader title={t("title")} />
      {reset.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(reset.error)}
          className="mb-4!"
        />
      ) : null}
      <Form<{ password: string }>
        layout="vertical"
        requiredMark={false}
        onFinish={({ password }) => reset.mutate({ token, password })}
      >
        <Form.Item
          name="password"
          label={t("password")}
          extra={t("passwordHint")}
          rules={[zodRule(passwordSchema, tValidation)]}
        >
          <Input.Password autoComplete="new-password" autoFocus />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className={PRIMARY_PILL_BUTTON_CLASS}
          block
          loading={reset.isPending}
        >
          {t("submit")}
        </Button>
      </Form>
    </>
  );
}
