"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";
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
import { createAntdTheme } from "@/lib/antd-theme";
import { type ColorScheme, persistColorScheme } from "@/lib/color-scheme";

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

  const antdTheme = useMemo(() => createAntdTheme(colorScheme), [colorScheme]);
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
          theme={antdTheme}
        >
          <App>{children}</App>
        </ConfigProvider>
      </AntdRegistry>
    </ColorSchemeContext.Provider>
  );
}
