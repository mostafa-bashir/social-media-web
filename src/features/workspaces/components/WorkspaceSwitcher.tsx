"use client";

import { CheckOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, type MenuProps } from "antd";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { routes } from "@/config/routes";
import { useRouter } from "@/i18n/navigation";

import { useMe } from "../api/workspaces-api";
import { useSwitchWorkspace } from "../hooks/use-switch-workspace";

const CREATE_KEY = "__create__";

export function WorkspaceSwitcher() {
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
        className="!flex !h-auto max-w-full !items-center !gap-2 !px-2 !py-1"
      >
        <Avatar shape="square" size="small" src={active?.logoUrl ?? undefined}>
          {active?.name.charAt(0).toUpperCase()}
        </Avatar>
        <span className="truncate font-medium">{active?.name}</span>
        <DownOutlined className="text-xs" />
      </Button>
    </Dropdown>
  );
}
