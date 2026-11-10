"use client";

import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { Suspense, useEffect, useRef, useState } from "react";

import BrandMark from "@/components/ui/BrandMark";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { routes } from "@/config/routes";
import { Link } from "@/i18n/navigation";

import {
  LANDING_NAV_KEYS,
  LANDING_SECTION_IDS,
  type LandingNavKey,
} from "../lib/sections";
import PillLink from "./PillLink";

const MOBILE_MENU_ID = "landing-mobile-menu";
/**
 * Tailwind's `lg` breakpoint, where the inline nav and locale switcher replace
 * the menu; below it the menu is the header's only route to the switcher.
 */
const DESKTOP_NAV_QUERY = "(min-width: 64rem)";
const NAV_LINK_CLASS =
  "text-sm font-medium text-text-secondary! transition-colors hover:text-text-primary!";

/** Translated by the server parent, so landing copy never ships to the client bundle. */
export type LandingHeaderLabels = Record<
  LandingNavKey | "label" | "login" | "getStarted" | "openMenu" | "closeMenu",
  string
>;

export default function LandingHeader({
  labels,
}: {
  labels: LandingHeaderLabels;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const desktopNav = window.matchMedia(DESKTOP_NAV_QUERY);
    const onViewportChange = () => {
      if (desktopNav.matches) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    desktopNav.addEventListener("change", onViewportChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktopNav.removeEventListener("change", onViewportChange);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-border-secondary bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
        <Link href={routes.home} className="shrink-0">
          <BrandMark />
        </Link>
        <nav aria-label={labels.label} className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {LANDING_NAV_KEYS.map((key) => (
              <li key={key}>
                <a
                  href={`#${LANDING_SECTION_IDS[key]}`}
                  className={NAV_LINK_CLASS}
                >
                  {labels[key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <div className="hidden lg:block">
            <Suspense>
              <LocaleSwitcher />
            </Suspense>
          </div>
          <ThemeToggle />
          <Link
            href={routes.auth.login}
            className={`hidden px-3 lg:inline ${NAV_LINK_CLASS}`}
          >
            {labels.login}
          </Link>
          <PillLink href={routes.auth.register} className="max-md:hidden">
            {labels.getStarted}
          </PillLink>
          <button
            ref={menuButtonRef}
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-lg text-text-primary hover:bg-background-subtle focus-visible:outline-2 focus-visible:outline-primary lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div
          id={MOBILE_MENU_ID}
          className="border-t border-border-secondary bg-surface px-4 pb-6 pt-2 sm:px-6 lg:hidden"
        >
          <nav aria-label={labels.label}>
            <ul>
              {LANDING_NAV_KEYS.map((key) => (
                <li key={key}>
                  <a
                    href={`#${LANDING_SECTION_IDS[key]}`}
                    onClick={closeMenu}
                    className="block py-3 text-base font-medium text-text-primary!"
                  >
                    {labels[key]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <PillLink href={routes.auth.register} size="lg">
              {labels.getStarted}
            </PillLink>
            <PillLink href={routes.auth.login} variant="secondary" size="lg">
              {labels.login}
            </PillLink>
            <div className="flex justify-center pt-2">
              <Suspense>
                <LocaleSwitcher />
              </Suspense>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
