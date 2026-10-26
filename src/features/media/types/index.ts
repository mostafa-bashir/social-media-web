import type { MediaKind } from "@/lib/media";

export interface MediaQuery {
  page: number;
  pageSize: number;
  clientId?: string;
  kind?: MediaKind;
}
