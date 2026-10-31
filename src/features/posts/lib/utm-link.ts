import { z } from "zod";

export const utmFormSchema = z.object({
  url: z.url({ protocol: /^https?$/ }),
  source: z.string().trim().min(1),
  medium: z.string().trim().min(1),
  campaign: z.string().trim(),
});
export type UtmForm = z.infer<typeof utmFormSchema>;

/** `url` with the UTM tags set; tags it already carries are replaced. */
export function buildUtmLink(form: UtmForm): string {
  const url = new URL(form.url);
  url.searchParams.set("utm_source", form.source.trim());
  url.searchParams.set("utm_medium", form.medium.trim());
  if (form.campaign.trim()) {
    url.searchParams.set("utm_campaign", form.campaign.trim());
  } else {
    url.searchParams.delete("utm_campaign");
  }
  return url.toString();
}
