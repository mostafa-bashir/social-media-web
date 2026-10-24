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

## Structure

```
src/
  app/[locale]/(centered)/   auth pages, workspace picker/create, invite landing
  app/[locale]/[slug]/       the workspace app (dashboard, members, roles, settings)
  features/<name>/           api/ components/ hooks/ — import other features only via their index.ts
  components/                shared UI (shell, layout)
  config/                    env (zod-validated), routes, sidebar navigation
  lib/                       api client, auth helpers, forms, react-query
  locales/{en,ar}/           messages — every key must exist in both
  proxy.ts                   locale routing + sign-in / workspace gates
  auth.ts                    Auth.js config
```

## Conventions

- **URLs** always carry the locale: `/{locale}/{workspaceSlug}/...`.
- **Data fetching**: client components through TanStack Query hooks in `features/*/api`. Responses are validated with zod (`parseData` / `parsePaginated`). Workspace-scoped query keys start with `["workspace", slug]`.
- **Errors**: the API returns `error.code`; show `useErrorMessage()(error)`, which translates via the `errors` namespace.
- **Forms**: antd `Form` + `zodRule(schema, t)`; schema messages are `validation.*` keys.
- **antd in route files**: not allowed (lint rule). `src/app` files are Server Components, where dot-components such as `Typography.Title` are undefined. Render antd inside a `"use client"` component.
- **Permissions**: `usePermissions().can(Permission.X)` hides UI only; the API enforces every check.
- **Sidebar**: add items in `src/config/navigation.tsx`.

## Auth & sessions

- Sign-in (password or email code) goes through the Auth.js credentials provider, which calls the API. Tokens live in the encrypted session cookie; the refresh token never reaches the browser.
- Tokens are refreshed **only** via `useSession().update()` (a POST that persists the cookie), driven by `AuthSessionProvider` shortly before expiry and on a 401. Server Components never refresh, so a rotated refresh token can't be lost.
- Switching workspace calls `update({ action: "switch-workspace", slug })`; the API re-checks membership.
