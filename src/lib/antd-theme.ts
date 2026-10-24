import { theme as antdTheme, type ThemeConfig } from "antd";

import tokens from "@/design-system/colors.tokens.json";
import type { ColorScheme } from "@/lib/color-scheme";

type TokenName = keyof typeof tokens.light;

const RADIUS = 10;
const CONTROL_HEIGHT = 40;

/**
 * antd needs literal colours for its seed algorithm (it can't read CSS vars),
 * so it reads the same JSON the CSS tokens are generated from — one source.
 */
export function createAntdTheme(scheme: ColorScheme): ThemeConfig {
  const t = (name: TokenName) => tokens[scheme][name];

  return {
    algorithm:
      scheme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      fontFamily: "var(--font-sans)",
      colorPrimary: t("brand-primary"),
      colorSuccess: t("growth"),
      colorWarning: t("accent"),
      colorError: t("danger"),
      colorInfo: t("brand-primary"),
      colorLink: t("brand-primary-text"),
      colorTextBase: t("text-primary"),
      colorText: t("text-primary"),
      colorTextSecondary: t("text-secondary"),
      colorTextTertiary: t("text-tertiary"),
      colorTextPlaceholder: t("text-placeholder"),
      colorBgBase: t("bg-surface"),
      colorBgLayout: t("bg-canvas"),
      colorBgContainer: t("bg-surface"),
      colorBgElevated: t("bg-surface"),
      colorBorder: t("border-default"),
      colorBorderSecondary: t("border-secondary"),
      colorFillAlter: t("bg-subtle"),
      borderRadius: RADIUS,
      controlHeight: CONTROL_HEIGHT,
    },
    components: {
      Button: {
        primaryShadow: "none",
        defaultShadow: "none",
        dangerShadow: "none",
        fontWeight: 600,
      },
      Menu: {
        darkItemBg: t("shell-bg"),
        darkSubMenuItemBg: t("shell-bg"),
        darkPopupBg: t("shell-bg"),
        darkItemColor: t("shell-text-muted"),
        darkItemHoverColor: t("shell-text"),
        darkItemHoverBg: t("shell-surface"),
        darkItemSelectedBg: t("shell-active"),
        darkItemSelectedColor: t("text-on-color"),
        itemBorderRadius: RADIUS,
        itemHeight: 42,
        iconSize: 16,
      },
      Layout: {
        siderBg: t("shell-bg"),
        bodyBg: t("bg-canvas"),
        headerBg: t("bg-canvas"),
      },
      Card: {
        borderRadiusLG: 14,
      },
      Modal: {
        borderRadiusLG: 18,
      },
      Table: {
        headerBg: t("bg-subtle"),
        rowHoverBg: t("bg-subtle"),
      },
      Tag: {
        borderRadiusSM: 999,
      },
    },
  };
}
