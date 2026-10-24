"use client";

import {
  GlobalOutlined,
  LogoutOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Dropdown, type MenuProps } from "antd";
import { signOut, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES } from "@/i18n/routing";
import { useColorScheme } from "@/providers/ThemeProvider";

export function UserMenu() {
  const t = useTranslations("common.userMenu");
  const tLocales = useTranslations("common.locales");
  const user = useSession().data?.user;
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const items: MenuProps["items"] = [
    {
      key: "identity",
      type: "group",
      label: (
        <div className="max-w-56 truncate" dir="ltr">
          {user?.email}
        </div>
      ),
    },
    {
      key: "theme",
      icon: colorScheme === "dark" ? <SunOutlined /> : <MoonOutlined />,
      label: colorScheme === "dark" ? t("lightMode") : t("darkMode"),
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
      toggleColorScheme();
    } else if (key.startsWith("locale:")) {
      router.replace(pathname, { locale: key.slice("locale:".length) });
    } else if (key === "signOut") {
      void signOut({ callbackUrl: `/${locale}${routes.auth.login}` });
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
          <Avatar size="small" src={user?.avatarUrl ?? undefined}>
            {user?.name.charAt(0).toUpperCase()}
          </Avatar>
        }
      />
    </Dropdown>
  );
}
