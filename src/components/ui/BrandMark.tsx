import { useTranslations } from "next-intl";

/** Logo mark + wordmark. `onDark` for the indigo shell / auth panel. */
export default function BrandMark({
  onDark = false,
  showName = true,
}: {
  onDark?: boolean;
  showName?: boolean;
}) {
  const t = useTranslations("common");
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <circle cx="7" cy="12" r="2.5" className="fill-text-on-color" />
          <circle cx="17" cy="6.5" r="2.5" className="fill-growth" />
          <circle cx="17" cy="17.5" r="2.5" className="fill-accent" />
          <path
            d="M9.2 10.9 14.8 7.6M9.2 13.1l5.6 3.3"
            className="stroke-text-on-color"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showName ? (
        <span
          className={`text-base font-semibold tracking-tight ${
            onDark ? "text-shell-text" : "text-text-primary"
          }`}
        >
          {t("appName")}
        </span>
      ) : null}
    </span>
  );
}
