import path from "node:path";

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // A stray lockfile higher up the tree would otherwise be picked as the root.
  turbopack: { root: path.join(__dirname) },
  experimental: {
    optimizePackageImports: [
      "antd",
      "@ant-design/icons",
      "@tanstack/react-query",
      "next-intl",
      "dayjs",
    ],
  },
};

export default withNextIntl(nextConfig);
