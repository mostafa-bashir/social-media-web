"use client";

import {
  AuditOutlined,
  CheckCircleOutlined,
  EditOutlined,
  InboxOutlined,
  SendOutlined,
  UndoOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { useTranslations } from "next-intl";

import type { RowAction } from "@/components/ui/RowActions";
import { Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { useActiveWorkspaceSlug } from "@/hooks/use-active-workspace";
import { usePermissions } from "@/hooks/use-permissions";
import { useRouter } from "@/i18n/navigation";

import type { Client } from "../types";

/** The audit covers 90 days, so the report opens on the same range. */
const AUDIT_RANGE_DAYS = "90";

export interface ClientRowHandlers {
  onEdit: (client: Client) => void;
  onArchive: (client: Client) => void;
  onRestore: (client: Client) => void;
  onConvert: (client: Client) => void;
  onPublicYoutube: (client: Client) => void;
}

/**
 * Row menu: restore when archived; otherwise audit, public YouTube channel,
 * connect link (for account managers), convert (prospects), edit, archive.
 */
export function useClientRowActions(
  archived: boolean,
  {
    onEdit,
    onArchive,
    onRestore,
    onConvert,
    onPublicYoutube,
  }: ClientRowHandlers,
) {
  const t = useTranslations("clients");
  const router = useRouter();
  const slug = useActiveWorkspaceSlug() ?? "";
  const { can } = usePermissions();
  const canSendLink = can(Permission.AccountsManage);

  const sendConnectLink = (client: Client) =>
    router.push({
      pathname: routes.workspace(slug).accounts,
      query: { clientId: client.id, connectLink: "1" },
    });

  const viewAudit = (client: Client) =>
    router.push({
      pathname: routes.workspace(slug).analyticsReports,
      query: {
        clientId: client.id,
        range: AUDIT_RANGE_DAYS,
        sections: "audit",
      },
    });

  return (client: Client): RowAction[] => {
    if (archived) {
      return [
        {
          key: "restore",
          label: t("restore"),
          icon: <UndoOutlined />,
          onClick: () => onRestore(client),
        },
      ];
    }
    return [
      {
        key: "audit",
        label: t("viewAudit"),
        icon: <AuditOutlined />,
        onClick: () => viewAudit(client),
      },
      {
        key: "public-youtube",
        label: t("publicYoutube.action"),
        icon: <YoutubeOutlined />,
        onClick: () => onPublicYoutube(client),
      },
      ...(canSendLink
        ? [
            {
              key: "connect-link",
              label: t("sendConnectLink"),
              icon: <SendOutlined />,
              onClick: () => sendConnectLink(client),
            },
          ]
        : []),
      ...(client.isProspect
        ? [
            {
              key: "convert",
              label: t("convert"),
              icon: <CheckCircleOutlined />,
              onClick: () => onConvert(client),
            },
          ]
        : []),
      {
        key: "edit",
        label: t("edit"),
        icon: <EditOutlined />,
        onClick: () => onEdit(client),
      },
      {
        key: "archive",
        label: t("archive"),
        icon: <InboxOutlined />,
        danger: true,
        onClick: () => onArchive(client),
      },
    ];
  };
}
