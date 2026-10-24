/**
 * Shared class strings for listing pages and CTAs (fana listing pattern).
 * Colours are token utilities only — see src/styles/globals.css `@theme`.
 */

/** Page root under the app shell — grows to fill the viewport below the header. */
export const LISTING_PAGE_CLASS = "flex min-h-0 flex-1 flex-col";

/** Pill primary CTA (forms, empty states, toolbars). */
export const PRIMARY_PILL_BUTTON_CLASS =
  "h-11! rounded-full! px-6! font-semibold";

/** Pill create CTA on listing toolbars — icon-only below `sm`. */
export const TOOLBAR_CREATE_BUTTON_CLASS =
  "h-11! rounded-full! max-sm:w-11! max-sm:px-0! sm:px-6! font-semibold";

/** Pill inputs/selects inside listing toolbars. */
export const TOOLBAR_SURFACE_CLASS =
  "[&_.ant-input-affix-wrapper]:rounded-full! [&_.ant-input-affix-wrapper]:bg-background-subtle! [&_.ant-input-affix-wrapper_.ant-input]:bg-transparent! [&_.ant-select-selector]:rounded-full!";
