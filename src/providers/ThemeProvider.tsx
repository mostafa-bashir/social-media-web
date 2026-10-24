"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme as antdTheme } from "antd";
import arEG from "antd/locale/ar_EG";
import enUS from "antd/locale/en_US";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { directionFor } from "@/i18n/routing";
import { type ColorScheme, persistColorScheme } from "@/lib/color-scheme";

/** Brand seed — antd derives hover/active/background shades from it. */
const BRAND_PRIMARY = "#4f46e5";

interface ColorSchemeContextValue {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

export function useColorScheme(): ColorSchemeContextValue {
  const value = useContext(ColorSchemeContext);
  if (!value) {
    throw new Error("useColorScheme must be used inside ThemeProvider");
  }
  return value;
}

export function ThemeProvider({
  locale,
  initialColorScheme,
  children,
}: {
  locale: string;
  initialColorScheme: ColorScheme;
  children: ReactNode;
}) {
  const [colorScheme, setColorScheme] = useState(initialColorScheme);

  const toggleColorScheme = useCallback(() => {
    setColorScheme((previous) => {
      const next = previous === "dark" ? "light" : "dark";
      persistColorScheme(next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ colorScheme, toggleColorScheme }),
    [colorScheme, toggleColorScheme],
  );

  return (
    <ColorSchemeContext.Provider value={contextValue}>
      <AntdRegistry>
        <ConfigProvider
          direction={directionFor(locale)}
          locale={locale === "ar" ? arEG : enUS}
          theme={{
            algorithm:
              colorScheme === "dark"
                ? antdTheme.darkAlgorithm
                : antdTheme.defaultAlgorithm,
            token: {
              colorPrimary: BRAND_PRIMARY,
              borderRadius: 8,
              fontFamily: "var(--font-sans)",
            },
          }}
        >
          <App>{children}</App>
        </ConfigProvider>
      </AntdRegistry>
    </ColorSchemeContext.Provider>
  );
}
