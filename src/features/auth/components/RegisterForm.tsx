"use client";

import { Alert, Button, Form, Input } from "antd";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link, useRouter } from "@/i18n/navigation";
import {
  emailSchema,
  nameSchema,
  passwordSchema,
} from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";

import { type RegisterInput, useRegister } from "../api/auth-api";
import { AuthHeader } from "./AuthHeader";

export function RegisterForm() {
  const t = useTranslations("auth.register");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useRegister();
  // Invite links pre-fill the email and send the user back to the invite afterwards.
  const invitedEmail = searchParams.get("email") ?? undefined;
  const callbackUrl = searchParams.get("callbackUrl");

  const onFinish = (values: RegisterInput) => {
    register.mutate(values, {
      onSuccess: () => {
        const query = new URLSearchParams({ email: values.email });
        if (callbackUrl) query.set("callbackUrl", callbackUrl);
        router.push(`${routes.auth.verifyEmail}?${query.toString()}`);
      },
    });
  };

  return (
    <>
      <AuthHeader title={t("title")} subtitle={t("subtitle")} />
      {register.error ? (
        <Alert
          type="error"
          showIcon
          title={errorMessage(register.error)}
          className="!mb-4"
        />
      ) : null}
      <Form<RegisterInput>
        layout="vertical"
        requiredMark={false}
        initialValues={{ email: invitedEmail }}
        onFinish={onFinish}
      >
        <Form.Item
          name="name"
          label={t("name")}
          rules={[zodRule(nameSchema, tValidation)]}
        >
          <Input autoComplete="name" autoFocus />
        </Form.Item>
        <Form.Item
          name="email"
          label={t("email")}
          rules={[zodRule(emailSchema, tValidation)]}
        >
          <Input type="email" autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label={t("password")}
          extra={t("passwordHint")}
          rules={[zodRule(passwordSchema, tValidation)]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={register.isPending}
        >
          {t("submit")}
        </Button>
      </Form>
      <p className="mt-6 text-center text-sm text-app-muted">
        {t("haveAccount")} <Link href={routes.auth.login}>{t("login")}</Link>
      </p>
    </>
  );
}
