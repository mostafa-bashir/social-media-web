"use client";

import { Card, Col, Row } from "antd";
import { useTranslations } from "next-intl";

const UPCOMING_MODULES = ["social", "analytics", "tasks"] as const;

/** Dashboard placeholder until the social, analytics and task modules land. */
export function UpcomingModules() {
  const t = useTranslations("common.dashboard.modules");
  return (
    <Row gutter={[16, 16]}>
      {UPCOMING_MODULES.map((module) => (
        <Col key={module} xs={24} md={8}>
          <Card title={t(`${module}.title`)}>{t(`${module}.description`)}</Card>
        </Col>
      ))}
    </Row>
  );
}
