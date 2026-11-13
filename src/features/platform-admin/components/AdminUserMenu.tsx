"use client";

import { GlobalOutlined, LogoutOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Dropdown, type MenuProps } from "antd";
import { useLocale, useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useColorSchemeToggle } from "@/hooks/use-color-scheme-toggle";
import { useErrorMessage } from "@/hooks/use-error-message";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/routing";

import { endAdminSession, useAdminSessionQuery } from "../api/admin-session";

/** Console account menu: who is signed in, theme, language, sign out. */
export default function AdminUserMenu() {
  const t = useTranslations("admin.userMenu");
  const tRoles = useTranslations("admin.roles");
  const tLocales = useTranslations("common.locales");
  const admin = useAdminSessionQuery().data?.admin;
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const colorSchemeToggle = useColorSchemeToggle();
  const errorMessage = useErrorMessage();
  const { message } = App.useApp();

  const items: MenuProps["items"] = [
    {
      key: "identity",
      type: "group",
      label: (
        <div className="max-w-56">
          <div className="truncate" dir="ltr">
            {admin?.email}
          </div>
          {admin ? (
            <div className="text-xs text-text-tertiary">
              {tRoles(admin.role)}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "theme",
      icon: colorSchemeToggle.icon,
      label: colorSchemeToggle.label,
    },
    {
      key: "language",
      icon: <GlobalOutlined />,
      label: t("language"),
      children: LOCALES.map((value) => ({
        key: `locale:${value}`,
        label: tLocales(value),
        disabled: value === locale,
      })),
    },
    { type: "divider" },
    {
      key: "signOut",
      icon: <LogoutOutlined />,
      label: t("signOut"),
      danger: true,
    },
  ];

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "theme") {
      colorSchemeToggle.toggle();
    } else if (key.startsWith("locale:")) {
      router.replace(pathname, { locale: key.slice("locale:".length) });
    } else if (key === "signOut") {
      endAdminSession().then(
        () => window.location.assign(`/${locale}${routes.admin.login}`),
        (error: unknown) => message.error(errorMessage(error)),
      );
    }
  };

  return (
    <Dropdown
      menu={{ items, onClick }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="text"
        shape="circle"
        aria-label={t("label")}
        icon={
          <Avatar size="small" className="bg-accent!">
            {admin?.name.charAt(0).toUpperCase()}
          </Avatar>
        }
      />
    </Dropdown>
  );
}
