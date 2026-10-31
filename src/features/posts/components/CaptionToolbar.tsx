"use client";

import {
  LinkOutlined,
  SmileOutlined,
  SnippetsOutlined,
} from "@ant-design/icons";
import { Button, Popover } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Permission } from "@/config/permissions";
import { usePermissions } from "@/hooks/use-permissions";

import EmojiPickerPanel from "./EmojiPickerPanel";
import SnippetPicker from "./SnippetPicker";
import SnippetsModal from "./SnippetsModal";
import UtmLinkModal from "./UtmLinkModal";

/** Emoji, saved snippets and tracked links, inserted at the caption's cursor. */
export default function CaptionToolbar({
  clientId,
  utmSource,
  onInsert,
}: {
  clientId: string;
  utmSource: string;
  onInsert: (text: string) => void;
}) {
  const t = useTranslations("posts.composer.toolbar");
  const { can } = usePermissions();
  const [open, setOpen] = useState<"emoji" | "snippets" | null>(null);
  const [managing, setManaging] = useState(false);
  const [buildingLink, setBuildingLink] = useState(false);
  const toggle = (panel: "emoji" | "snippets") => (visible: boolean) =>
    setOpen(visible ? panel : null);

  return (
    <div className="flex flex-wrap gap-2">
      <Popover
        trigger="click"
        open={open === "emoji"}
        onOpenChange={toggle("emoji")}
        placement="bottomLeft"
        content={
          <EmojiPickerPanel
            onPick={(emoji) => {
              onInsert(emoji);
              setOpen(null);
            }}
          />
        }
      >
        <Button size="small" icon={<SmileOutlined />} className="rounded-full!">
          {t("emoji")}
        </Button>
      </Popover>
      <Popover
        trigger="click"
        open={open === "snippets"}
        onOpenChange={toggle("snippets")}
        placement="bottomLeft"
        content={
          <SnippetPicker
            clientId={clientId}
            canManage={can(Permission.PostsManage)}
            onPick={(body) => {
              onInsert(body);
              setOpen(null);
            }}
            onManage={() => {
              setOpen(null);
              setManaging(true);
            }}
          />
        }
      >
        <Button
          size="small"
          icon={<SnippetsOutlined />}
          className="rounded-full!"
        >
          {t("snippets")}
        </Button>
      </Popover>
      <Button
        size="small"
        icon={<LinkOutlined />}
        className="rounded-full!"
        onClick={() => setBuildingLink(true)}
      >
        {t("utm")}
      </Button>
      <SnippetsModal
        open={managing}
        clientId={clientId}
        onClose={() => setManaging(false)}
      />
      {buildingLink ? (
        // Mounted per use, so each link starts from the current platform.
        <UtmLinkModal
          open
          defaultSource={utmSource}
          onClose={() => setBuildingLink(false)}
          onInsert={onInsert}
        />
      ) : null}
    </div>
  );
}
