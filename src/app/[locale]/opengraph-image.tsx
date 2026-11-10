import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";

import { SOCIAL_PLATFORMS } from "@/config/platforms";
import tokens from "@/design-system/colors.tokens.json";
import { directionFor, routing } from "@/i18n/routing";
import common from "@/locales/en/common.json";
import landing from "@/locales/en/landing.json";

// The brand name is the same in every locale, so it doubles as a neutral alt.
export const alt = common.appName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const color = tokens.light;
/** Decorative growth chart for the language-neutral card (% of chart height). */
const CHART_BARS = [34, 48, 42, 60, 56, 72, 68, 86, 80, 100];

const dotStyle = (fill: string) => ({
  width: 14,
  height: 14,
  borderRadius: 7,
  background: fill,
});

/**
 * Link-preview card built from the brand tokens (ImageResponse can't read CSS
 * vars). Satori can't shape Arabic script, so RTL locales get a card with no
 * sentences (brand, chart, platform names) instead of broken glyphs.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Layout `notFound()` doesn't cover image routes; reject unknown locales here.
  if (!hasLocale(routing.locales, locale)) {
    return new Response(null, { status: 404 });
  }
  const showCopy = directionFor(locale) === "ltr";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: `linear-gradient(135deg, ${color["shell-bg"]} 0%, ${color["shell-surface"]} 60%, ${color["brand-primary"]} 100%)`,
        color: color["shell-text"],
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: color["brand-primary"],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <div style={dotStyle(color["text-on-color"])} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={dotStyle(color.growth)} />
            <div style={dotStyle(color.accent)} />
          </div>
        </div>
        <div style={{ fontSize: 34, fontWeight: 700 }}>{common.appName}</div>
      </div>
      {showCopy ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, lineHeight: 1.1, maxWidth: 960 }}>
            {common.authShell.headline}
          </div>
          <div style={{ fontSize: 30, color: color["shell-text-muted"] }}>
            {landing.footer.tagline}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 18,
            height: 260,
          }}
        >
          {CHART_BARS.map((height, index) => (
            <div
              key={index}
              style={{
                width: 64,
                height: `${height}%`,
                borderRadius: 10,
                background:
                  index >= CHART_BARS.length - 2
                    ? color.growth
                    : color["chart-1"],
              }}
            />
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 16 }}>
        {SOCIAL_PLATFORMS.map((platform) => (
          <div
            key={platform}
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              border: `2px solid ${color["shell-border"]}`,
              background: color["shell-surface"],
              fontSize: 24,
            }}
          >
            {common.platforms[platform]}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
