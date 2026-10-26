"use client";

import {
  BookOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FireOutlined,
  HeartOutlined,
  IdcardOutlined,
  PercentageOutlined,
  SendOutlined,
  ShareAltOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import StatCard from "@/components/ui/StatCard";

import { useMetricFormat } from "../hooks/use-metric-format";
import type { CompareMode, KpiTotals } from "../types";

type TileKey = Exclude<
  keyof KpiTotals,
  "followerChange" | "postsMeasured" | "postEngagements"
>;
type Formatter = "count" | "exact" | "percent";

interface Tile {
  key: TileKey;
  icon: ReactNode;
  format: Formatter;
}

/** Always shown: the figures every platform reports. */
const CORE_TILES: Tile[] = [
  { key: "followers", icon: <TeamOutlined />, format: "count" },
  { key: "views", icon: <EyeOutlined />, format: "count" },
  { key: "engagements", icon: <HeartOutlined />, format: "count" },
  { key: "engagementRate", icon: <PercentageOutlined />, format: "percent" },
  { key: "postsPublished", icon: <SendOutlined />, format: "exact" },
];
/** Two full rows of five at most. */
const MAX_TILES = 10;
/** Shown only when some account in scope reports them, in this order of importance. */
const EXTRA_TILES: Tile[] = [
  { key: "followersGained", icon: <UserAddOutlined />, format: "count" },
  { key: "avgEngagementPerPost", icon: <FireOutlined />, format: "count" },
  { key: "watchTimeMinutes", icon: <ClockCircleOutlined />, format: "count" },
  { key: "profileViews", icon: <IdcardOutlined />, format: "count" },
  { key: "shares", icon: <ShareAltOutlined />, format: "count" },
  { key: "saves", icon: <BookOutlined />, format: "count" },
];

export interface KpiGridProps {
  totals?: KpiTotals;
  comparison?: KpiTotals | null;
  compare: CompareMode;
  loading: boolean;
}

/** Headline figures for the range, each against the comparison range. */
export default function KpiGrid({
  totals,
  comparison,
  compare,
  loading,
}: KpiGridProps) {
  const t = useTranslations("analytics.kpis");
  const fmt = useMetricFormat();
  const tiles = [
    ...CORE_TILES,
    ...EXTRA_TILES.filter((tile) => totals?.[tile.key] != null),
  ].slice(0, MAX_TILES);

  const trendOf = (key: TileKey) => {
    if (key === "followers") {
      const net = totals?.followerChange ?? null;
      return net
        ? {
            trend: fmt.signed(net),
            trendTone: net > 0 ? ("growth" as const) : ("danger" as const),
          }
        : {};
    }
    const change =
      compare === "none"
        ? null
        : fmt.change(totals?.[key] ?? null, comparison?.[key] ?? null);
    return change
      ? {
          trend: t(compare === "year" ? "vsYear" : "vsPrevious", {
            change: change.label,
          }),
          trendTone: change.tone,
        }
      : {};
  };

  return (
    <div className="surface-card">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {tiles.map((tile) => (
          <StatCard
            key={tile.key}
            label={t(tile.key)}
            value={fmt[tile.format](totals?.[tile.key] ?? null)}
            loading={loading}
            icon={tile.icon}
            {...trendOf(tile.key)}
          />
        ))}
      </div>
    </div>
  );
}
