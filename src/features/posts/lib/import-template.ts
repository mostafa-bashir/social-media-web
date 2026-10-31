/** The CSV columns the import reads (mirrors the API), with one example row. */
export const IMPORT_TEMPLATE_HEADER = [
  "date",
  "time",
  "accounts",
  "format",
  "caption",
  "first_comment",
  "media",
  "title",
];

const EXAMPLE_LEAD_DAYS = 3;
const DAY_MS = 24 * 60 * 60_000;

/** A ready-to-fill CSV, with a BOM so spreadsheets open Arabic text correctly. */
export function importTemplateCsv(now: Date = new Date()): string {
  const day = new Date(now.getTime() + EXAMPLE_LEAD_DAYS * DAY_MS)
    .toISOString()
    .slice(0, 10);
  const example = [
    day,
    "18:30",
    "facebook;instagram",
    "feed",
    '"New menu is here! Come try it this week."',
    "#food #newmenu",
    "photo.jpg",
    "",
  ];
  return `﻿${IMPORT_TEMPLATE_HEADER.join(",")}\r\n${example.join(",")}\r\n`;
}
