"use client";

import { CheckSquareOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useTranslations } from "next-intl";

import ClientSelect from "@/components/ui/ClientSelect";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "@/i18n/navigation";
import { PRIMARY_PILL_BUTTON_CLASS } from "@/lib/listing-ui";

import { useDashboardClient } from "../hooks/use-dashboard-client";

/** Client scope for the whole page, plus the main call to action. */
export default function DashboardHeaderActions() {
  const t = useTranslations("dashboard");
  const slug = useActiveWorkspaceSlug() ?? "";
  const router = useRouter();
  const { can } = usePermissions();
  const { clientId, setClientId } = useDashboardClient();

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      {can(Permission.ClientsView) ? (
        <ClientSelect
          allowClear
          className="w-full sm:w-56!"
          placeholder={t("allClients")}
          aria-label={t("clientFilter")}
          value={clientId}
          onChange={setClientId}
        />
      ) : null}
      {can(Permission.TasksManage) ? (
        <Button
          icon={<CheckSquareOutlined />}
          className={PRIMARY_PILL_BUTTON_CLASS}
          onClick={() =>
            router.push({
              pathname: routes.workspace(slug).tasks,
              // The form picks up the client from the tasks page filter.
              query: { create: "1", ...(clientId ? { clientId } : {}) },
            })
          }
        >
          {t("newTask")}
        </Button>
      ) : null}
      {can(Permission.PostsManage) ? (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={PRIMARY_PILL_BUTTON_CLASS}
          onClick={() => router.push(routes.workspace(slug).newPost)}
        >
          {t("createPost")}
        </Button>
      ) : null}
    </div>
  );
}
