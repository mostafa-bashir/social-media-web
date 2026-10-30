import { Avatar, Tooltip } from "antd";

export interface MemberAvatarProps {
  name: string;
  avatarUrl: string | null;
  size?: number;
  /** Shows the name on hover; off when the name is already printed beside it. */
  showTooltip?: boolean;
}

/** A member's photo, or their initial on the brand colour. */
export default function MemberAvatar({
  name,
  avatarUrl,
  size = 24,
  showTooltip = true,
}: MemberAvatarProps) {
  const avatar = (
    <Avatar
      size={size}
      src={avatarUrl ?? undefined}
      alt={name}
      className="shrink-0 bg-primary!"
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );
  return showTooltip ? <Tooltip title={name}>{avatar}</Tooltip> : avatar;
}
