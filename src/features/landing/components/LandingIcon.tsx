"use client";

import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CheckOutlined,
  CheckSquareOutlined,
  EditOutlined,
  FileTextOutlined,
  LineChartOutlined,
  LinkOutlined,
  PictureOutlined,
  ProjectOutlined,
  RiseOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";

import { PLATFORM_ICONS } from "@/components/ui/platform-icons";

import type { LandingIconName } from "../lib/icon-names";

const ICONS: Record<LandingIconName, ReactNode> = {
  ...PLATFORM_ICONS,
  check: <CheckOutlined />,
  checkCircle: <CheckCircleFilled />,
  rise: <RiseOutlined />,
  composer: <EditOutlined />,
  scheduling: <CalendarOutlined />,
  approvals: <CheckCircleOutlined />,
  media: <PictureOutlined />,
  analytics: <BarChartOutlined />,
  reports: <FileTextOutlined />,
  tasks: <ProjectOutlined />,
  team: <TeamOutlined />,
  connect: <LinkOutlined />,
  plan: <CheckSquareOutlined />,
  measure: <LineChartOutlined />,
};

/**
 * The landing page's only client leaf for icons: antd icons can't render in
 * server components, so the sections stay server-rendered and pass a name.
 */
export default function LandingIcon({
  name,
  className,
}: {
  name: LandingIconName;
  className?: string;
}) {
  return (
    <span aria-hidden className={className}>
      {ICONS[name]}
    </span>
  );
}
