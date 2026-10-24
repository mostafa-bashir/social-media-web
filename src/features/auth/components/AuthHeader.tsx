import { Typography } from "antd";

export default function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <Typography.Title level={3} className="mb-1!">
        {title}
      </Typography.Title>
      {subtitle ? (
        <Typography.Text type="secondary">{subtitle}</Typography.Text>
      ) : null}
    </div>
  );
}
