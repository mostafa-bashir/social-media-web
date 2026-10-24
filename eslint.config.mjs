import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
      "no-console": ["error", { allow: ["error"] }],
      // Colours come from design tokens only (src/design-system/colors.tokens.json).
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "No hex colours in components — use token utilities (bg-primary, text-text-secondary…) or var(--ds-*).",
        },
        {
          selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/]",
          message:
            "No hex colours in components — use token utilities (bg-primary, text-text-secondary…) or var(--ds-*).",
        },
      ],
    },
  },
  {
    // Inside a feature use relative imports; other features are off-limits.
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/**"],
              message:
                "Features never import other features (fana golden rule). Move shared code to src/hooks, src/lib, src/config or src/components/ui.",
            },
          ],
        },
      ],
    },
  },
  {
    // Route files are Server Components; antd's dot-components (Typography.Title…)
    // are undefined across the client boundary. Render antd inside a "use client" file.
    files: ["src/app/**/*.{ts,tsx}"],
    ignores: ["src/app/**/not-found.tsx", "src/app/**/error.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "antd",
              message:
                "Wrap antd in a client component under src/components or a feature.",
            },
            {
              name: "@ant-design/icons",
              message:
                "Icons use React context — render them inside a client component.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
