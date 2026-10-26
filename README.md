# Social Media Manager — Web

Next.js 16 (App Router) · Auth.js v5 · Ant Design 6 + Tailwind 4 · TanStack Query · next-intl (en / ar, RTL)

## Quick start

Start the API first (see `../social-media-backend/README.md`), then:

```bash
cp .env.example .env.local      # set AUTH_SECRET
pnpm install
pnpm dev                        # http://localhost:3000
```

| Task | Command |
| --- | --- |
| Dev server | `pnpm dev` |
| Lint / typecheck / format | `pnpm lint` · `pnpm type-check` · `pnpm format:check` |
| Production build | `pnpm build` |

## Structure (fana / Bulletproof React)

```
src/
  app/[locale]/(auth-shell)/ auth pages, workspace picker/create, invite landing
  app/[locale]/[slug]/       the workspace app (dashboard, members, roles, settings)
  features/<name>/           api/ (get-*.ts, *-mutations.ts) components/ types/ utils/ index.ts
  components/ui/             shared primitives: AppShell, ListingShell/Toolbar/Table/EmptyState,
                             DeleteConfirmModal, RowActions, StatCard, StatusBadge, PageHeader…
  hooks/                     shared hooks (permissions, active workspace, switch workspace…)
  config/                    env (zod), routes, navigation, permissions
  lib/                       api client, auth, forms, query keys, antd theme, listing classes
  design-system/             colors.tokens.json — the brand palette (source of truth)
  styles/                    design-tokens.css (generated), surfaces.css, shell.css, globals.css
  locales/{en,ar}/           messages — every key must exist in both
```

## Brand identity — Indigo & Teal

| Role | Token | Light |
| --- | --- | --- |
| Primary (actions, active nav) | `brand-primary` | #4F46E5 |
| Growth (positive trends, success) | `growth` | #14B8A6 |
| Accent (pending, attention) | `accent` | #F59E0B |
| Sidebar / shell canvas | `shell-bg` | #1E1B4B |
| Page background | `bg-canvas` | #F8FAFC |

Edit colours only in `src/design-system/colors.tokens.json` (light + dark), then run `pnpm tokens`.
The antd theme (`lib/antd-theme.ts`) reads the same JSON, so CSS and components never drift.

## UI rules (adapted from the fana reference)

- **No hex in components** (ESLint-enforced). Use token utilities — `bg-primary`, `text-text-secondary`,
  `bg-growth-subtle`, `border-border-default`, `bg-shell` … — or `var(--ds-*)`.
- **Two-layer surfaces** for every page section, form and modal body:
  `.surface-card` (gray) › `.surface-panel` (surface). Modal forms use `.surface-card-form`.
- **Listings** use `ListingShell` + `ListingToolbar` (filters start, pill CTA end) + `ListingTable`
  (shared skin + `ListingEmptyState`). Grids use `contentLayout="grid"`. No `scroll.x` unless required.
- **Row actions**: `RowActions` (MoreOutlined + popover). **Destructive actions**: shared
  `DeleteConfirmModal` only — never a per-feature confirm.
- **Statuses**: `StatusBadge` tones — brand, growth, accent, danger, neutral. **KPIs**: `StatCard`.
- **CTAs** are pills: `PRIMARY_PILL_BUTTON_CLASS` / `TOOLBAR_CREATE_BUTTON_CLASS` (`lib/listing-ui.ts`).
- **Features never import other features** (ESLint-enforced). Shared code lives in
  `hooks/`, `lib/`, `config/`, `components/ui/`. Data two features read shares a key in `lib/query-keys.ts`.
- **Component files** default-export one component, stay under ~150 lines; barrels re-export.
- **Route files are Server Components**: no `antd` or `@ant-design/icons` imports there (ESLint-enforced).
- **Tailwind v4** important modifier is a suffix: `rounded-full!`, not `!rounded-full`.
- **URLs** always carry the locale: `/{locale}/{workspaceSlug}/...`.
- **Data**: TanStack Query hooks in `features/*/api`, responses validated with zod (`parseData`).
- **Errors**: show `useErrorMessage()(error)` — translated from the API's `error.code`.
- **Forms**: antd `Form` + `zodRule(schema, t)`; messages are `validation.*` keys.
- **Permissions**: `usePermissions().can(Permission.X)` hides UI only; the API enforces every check.
- **Sidebar**: add items in `src/config/navigation.tsx`.

## Auth & sessions

- Sign-in (password or email code) goes through the Auth.js credentials provider, which calls the API. Tokens live in the encrypted session cookie; the refresh token never reaches the browser.
- Tokens are refreshed **only** via `useSession().update()` (a POST that persists the cookie), driven by `AuthSessionProvider` shortly before expiry and on a 401. Server Components never refresh, so a rotated refresh token can't be lost.
- Switching workspace calls `update({ action: "switch-workspace", slug })`; the API re-checks membership.

## Analytics hub

`features/analytics` renders `/[slug]/analytics` as tabs (Overview, Accounts → account
drill-down, Posts) under one layout with a shared filters bar. Filters (client, platform,
account, range, compare-to, granularity) live in the URL, so every report can be bookmarked or
shared, and tab links keep them. The post drawer opens from `?post=<source>:<id>`.

Charts use Recharts with colours only from the `--ds-chart-*` tokens. Platforms keep fixed
slots (Facebook 1, Instagram 2, YouTube 3) so a series never changes colour with filters; the
slots were checked for colour-blind separation with the dataviz palette validator. Figures a
platform doesn't report show as "—", never 0.
