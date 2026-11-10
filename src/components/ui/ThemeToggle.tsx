"use client";

import { Button } from "antd";

import { useColorSchemeToggle } from "@/hooks/use-color-scheme-toggle";

/** Icon button that flips light/dark. */
export default function ThemeToggle() {
  const { label, icon, toggle } = useColorSchemeToggle();
  return (
    <Button
      type="text"
      shape="circle"
      aria-label={label}
      icon={icon}
      onClick={toggle}
    />
  );
}
