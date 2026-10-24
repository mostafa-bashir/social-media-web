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
    },
  },
  {
    // Features talk to each other only through their public index.
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message: "Import from the feature's index (@/features/<name>).",
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
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
