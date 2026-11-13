"use client";

import { Alert, Button, Form, Input } from "antd";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import {
  emailSchema,
  verificationCodeSchema,
} from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { finishAdminLogin, startAdminLogin } from "../api/admin-session";

interface CredentialValues {
  email: string;
  password: string;
}

/** Only console paths are accepted as a return target. */
function safeAdminTarget(raw: string | null, locale: string): string {
  const fallback = `/${locale}${routes.admin.home}`;
  if (!raw || !raw.startsWith(`/${locale}${routes.admin.home}`)) {
    return fallback;
  }
  return raw.startsWith("//") ? fallback : raw;
}

/** Password, then the 6-digit code emailed to the admin. */
export default function AdminLoginForm() {
  const t = useTranslations("admin.login");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const run = async (action: () => Promise<void>) => {
    setSubmitting(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const submitCredentials = (values: CredentialValues) =>
    run(async () => {
      setChallengeToken(await startAdminLogin(values.email, values.password));
      setEmail(values.email);
    });

  const submitCode = ({ code }: { code: string }) =>
    run(async () => {
      await finishAdminLogin(challengeToken ?? "", code);
      // Full navigation so the console loads with the new session cookie.
      window.location.assign(
        safeAdminTarget(searchParams.get("callbackUrl"), locale),
      );
    });

  return (
    <>
      <h1 className="mb-1 text-xl font-semibold text-text-primary">
        {challengeToken ? t("codeTitle") : t("title")}
      </h1>
      <p className="mb-5 text-sm text-text-secondary">
        {challengeToken ? t("codeSubtitle", { email }) : t("subtitle")}
      </p>
      {error ? (
        <Alert type="error" showIcon title={error} className="mb-4!" />
      ) : null}
      {challengeToken ? (
        <Form<{ code: string }>
          key="code"
          layout="vertical"
          requiredMark={false}
          onFinish={submitCode}
        >
          <Form.Item
            name="code"
            label={t("code")}
            rules={[zodRule(verificationCodeSchema, tValidation)]}
          >
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              dir="ltr"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className={PRIMARY_PILL_BUTTON_CLASS}
            block
            loading={submitting}
          >
            {t("verify")}
          </Button>
          <Button
            type="link"
            block
            className="mt-2!"
            onClick={() => {
              setChallengeToken(null);
              setError(null);
            }}
          >
            {t("startOver")}
          </Button>
        </Form>
      ) : (
        <Form<CredentialValues>
          key="credentials"
          layout="vertical"
          requiredMark={false}
          onFinish={submitCredentials}
        >
          <Form.Item
            name="email"
            label={t("email")}
            rules={[zodRule(emailSchema, tValidation)]}
          >
            <Input type="email" autoComplete="username" autoFocus />
          </Form.Item>
          <Form.Item
            name="password"
            label={t("password")}
            rules={[{ required: true, message: tValidation("required") }]}
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
      )}
    </>
  );
}
