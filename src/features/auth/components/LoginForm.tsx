"use client";

import { Alert, Button, Form, Input } from "antd";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link, useRouter } from "@/i18n/navigation";
import { emailSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { safeCallbackUrl } from "../utils/safe-callback-url";
import AuthHeader from "./AuthHeader";

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async ({ email, password }: LoginValues) => {
    setSubmitting(true);
    setError(null);
    const result = await signIn("credentials", {
      method: "password",
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);

    if (result?.code === "EMAIL_NOT_VERIFIED") {
      router.push(
        `${routes.auth.verifyEmail}?email=${encodeURIComponent(email)}&resend=1`,
      );
      return;
    }
    if (!result || result.error) {
      setError(errorMessage(result?.code ?? "UNKNOWN_ERROR"));
      return;
    }
    // Full navigation so server components render with the new session cookie.
    window.location.assign(
      safeCallbackUrl(searchParams.get("callbackUrl"), `/${locale}`),
    );
  };

  return (
    <>
      <AuthHeader title={t("title")} subtitle={t("subtitle")} />
      {error ? (
        <Alert type="error" showIcon title={error} className="mb-4!" />
      ) : null}
      <Form<LoginValues>
        layout="vertical"
        requiredMark={false}
        initialValues={{ email: searchParams.get("email") ?? undefined }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          label={t("email")}
          rules={[zodRule(emailSchema, tValidation)]}
        >
          <Input type="email" autoComplete="email" autoFocus />
        </Form.Item>
        <Form.Item
          name="password"
          label={t("password")}
          rules={[{ required: true, message: tValidation("required") }]}
          extra={
            <Link href={routes.auth.forgotPassword}>{t("forgotPassword")}</Link>
          }
        >
          <Input.Password autoComplete="current-password" />
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
      <p className="mt-6 text-center text-sm text-app-muted">
        {t("noAccount")}{" "}
        <Link href={routes.auth.register}>{t("register")}</Link>
      </p>
    </>
  );
}
