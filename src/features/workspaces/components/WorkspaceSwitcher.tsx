"use client";

import { CheckOutlined, PlusOutlined, SwapOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, type MenuProps } from "antd";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useSwitchWorkspace } from "@/hooks/use-switch-workspace";
import { useRouter } from "@/i18n/navigation";

import { useMe } from "../api/get-me";

const CREATE_KEY = "__create__";

/** Active workspace + switch menu, styled for the indigo shell. */
export default function WorkspaceSwitcher() {
  const t = useTranslations("workspaces.switcher");
  const active = useSession().data?.activeWorkspace;
  const { data } = useMe();
  const { switchTo, switchingTo } = useSwitchWorkspace();
  const router = useRouter();

  const items: MenuProps["items"] = [
    ...(data?.workspaces ?? []).map((workspace) => ({
      key: workspace.slug,
      label: workspace.name,
      icon:
        workspace.slug === active?.slug ? (
          <CheckOutlined />
        ) : (
          <span className="inline-block w-3.5" />
        ),
    })),
    { type: "divider" as const },
    { key: CREATE_KEY, label: t("create"), icon: <PlusOutlined /> },
  ];

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === CREATE_KEY) {
      router.push(routes.workspaces.create);
    } else if (key !== active?.slug) {
      void switchTo(key);
    }
  };

  return (
    <Dropdown menu={{ items, onClick }} trigger={["click"]}>
      <Button
        type="text"
        loading={switchingTo !== null}
        aria-label={t("label")}
        className="shell-control flex! h-auto! w-full! items-center! gap-3! border! border-shell-border! bg-shell-surface/40! px-3! py-2!"
      >
        <Avatar
          shape="square"
          src={active?.logoUrl ?? undefined}
          className="shrink-0 bg-growth!"
        >
          {active?.name.charAt(0).toUpperCase()}
        </Avatar>
        <span className="min-w-0 flex-1 text-start">
          <span className="block truncate text-sm font-semibold">
            {active?.name}
          </span>
          <span className="block truncate text-xs text-shell-text-muted">
            {t("current")}
          </span>
        </span>
        <SwapOutlined className="text-shell-text-muted" />
      </Button>
    </Dropdown>
  );
}
