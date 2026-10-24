"use client";

import { Alert, Button, Form, Input, Result } from "antd";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";
import { emailSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { useForgotPassword } from "../api/auth-api";
import AuthHeader from "./AuthHeader";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const forgot = useForgotPassword();

  if (forgot.isSuccess) {
    return (
      <Result
        status="success"
        title={t("sentTitle")}
        subTitle={t("sentDescription")}
        extra={<Link href={routes.auth.login}>{t("backToLogin")}</Link>}
      />
    );
  }

  return (
    <>
      <AuthHeader title={t("title")} subtitle={t("subtitle")} />
      {forgot.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(forgot.error)}
          className="mb-4!"
        />
      ) : null}
      <Form<{ email: string }>
        layout="vertical"
        requiredMark={false}
        onFinish={({ email }) => forgot.mutate(email)}
      >
        <Form.Item
          name="email"
          label={t("email")}
          rules={[zodRule(emailSchema, tValidation)]}
        >
          <Input type="email" autoComplete="email" autoFocus />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className={PRIMARY_PILL_BUTTON_CLASS}
          block
          loading={forgot.isPending}
        >
          {t("submit")}
        </Button>
      </Form>
      <p className="mt-6 text-center text-sm">
        <Link href={routes.auth.login}>{t("backToLogin")}</Link>
      </p>
    </>
  );
}
