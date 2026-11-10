import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { useColorScheme } from "@/providers/ThemeProvider";

/** Label and icon name the scheme the toggle switches *to*. */
export function useColorSchemeToggle(): {
  label: string;
  icon: ReactNode;
  toggle: () => void;
} {
  const t = useTranslations("common.userMenu");
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return {
    label: isDark ? t("lightMode") : t("darkMode"),
    icon: isDark ? <SunOutlined /> : <MoonOutlined />,
    toggle: toggleColorScheme,
  };
}
