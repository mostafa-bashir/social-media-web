"use client";

import { Alert, App, Button, Form, Input } from "antd";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { routes } from "@/config/routes";
import { useErrorMessage } from "@/hooks/use-error-message";
import { Link } from "@/i18n/navigation";
import { verificationCodeSchema } from "@/lib/forms/common-schemas";
import { zodRule } from "@/lib/forms/zod-rule";

import { useResendVerification } from "../api/auth-api";
import { safeCallbackUrl } from "../utils/safe-callback-url";
import { AuthHeader } from "./AuthHeader";

export function VerifyEmailForm() {
  const t = useTranslations("auth.verifyEmail");
  const tValidation = useTranslations("validation");
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resend = useResendVerification();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const autoResent = useRef(false);

  // Arriving from a login attempt with an unverified email: send a fresh code once.
  useEffect(() => {
    if (searchParams.get("resend") === "1" && email && !autoResent.current) {
      autoResent.current = true;
      resend.mutate(email);
    }
  }, [email, resend, searchParams]);

  if (!email) {
    return (
      <Alert
        type="warning"
        showIcon
        title={t("missingEmail")}
        action={<Link href={routes.auth.register}>{t("backToRegister")}</Link>}
      />
    );
  }

  const onFinish = async ({ code }: { code: string }) => {
    setSubmitting(true);
    setError(null);
    const result = await signIn("credentials", {
      method: "email-code",
      email,
      code,
      redirect: false,
    });
    setSubmitting(false);
    if (!result || result.error) {
      setError(errorMessage(result?.code ?? "UNKNOWN_ERROR"));
      return;
    }
    window.location.assign(
      safeCallbackUrl(
        searchParams.get("callbackUrl"),
        `/${locale}${routes.workspaces.picker}`,
      ),
    );
  };

  const onResend = () =>
    resend.mutate(email, {
      onSuccess: () => message.success(t("resent")),
      onError: (resendError) => setError(errorMessage(resendError)),
    });

  return (
    <>
      <AuthHeader title={t("title")} subtitle={t("subtitle", { email })} />
      {error ? (
        <Alert type="error" showIcon title={error} className="!mb-4" />
      ) : null}
      <Form<{ code: string }>
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
      >
        <Form.Item
          name="code"
          label={t("code")}
          rules={[zodRule(verificationCodeSchema, tValidation)]}
        >
          <Input.OTP length={6} autoFocus />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={submitting}>
          {t("submit")}
        </Button>
      </Form>
      <div className="mt-4 text-center">
        <Button type="link" onClick={onResend} loading={resend.isPending}>
          {t("resend")}
        </Button>
      </div>
    </>
  );
}
