import { Avatar } from "antd";

import type { Client } from "../types";

/** Logo when uploaded, otherwise the initial on the client's label colour. */
export default function ClientAvatar({
  client,
  size = 40,
}: {
  client: Pick<Client, "name" | "logoUrl" | "color">;
  size?: number;
}) {
  return (
    <Avatar
      shape="square"
      size={size}
      src={client.logoUrl ?? undefined}
      alt={client.name}
      // The colour is user data, not a design token.
      style={client.color ? { backgroundColor: client.color } : undefined}
      className={`rounded-lg! ${client.color ? "" : "bg-primary!"}`}
    >
      {client.name.charAt(0).toUpperCase()}
    </Avatar>
  );
}
