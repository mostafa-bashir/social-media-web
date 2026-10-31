"use client";

import { FieldTimeOutlined, ImportOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import ImportPostsModal from "./ImportPostsModal";
import PostingSlotsModal from "./PostingSlotsModal";

/** Posting times (for the filtered client) and CSV import, next to "New post". */
export default function PostsToolbarExtras({
  clientId,
}: {
  clientId?: string;
}) {
  const t = useTranslations("posts.toolbar");
  const [open, setOpen] = useState<"slots" | "import" | null>(null);

  return (
    <>
      <Tooltip title={clientId ? undefined : t("pickClientForSlots")}>
        <Button
          icon={<FieldTimeOutlined />}
          disabled={!clientId}
          className="rounded-full!"
          onClick={() => setOpen("slots")}
        >
          {t("postingTimes")}
        </Button>
      </Tooltip>
      <Button
        icon={<ImportOutlined />}
        className="rounded-full!"
        onClick={() => setOpen("import")}
      >
        {t("import")}
      </Button>
      {open === "slots" && clientId ? (
        <PostingSlotsModal clientId={clientId} onClose={() => setOpen(null)} />
      ) : null}
      {open === "import" ? (
        <ImportPostsModal
          initialClientId={clientId}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
}
