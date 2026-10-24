import { z } from "zod";

/** Browser-safe values. Inlined at build time, so read each var explicitly. */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

const serverEnvSchema = z.object({
  API_URL: z.url(),
  AUTH_SECRET: z.string().min(16),
});

/** Server-only values. Call lazily so client bundles never evaluate it. */
export function getServerEnv(): z.infer<typeof serverEnvSchema> {
  return serverEnvSchema.parse({
    API_URL: process.env.API_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
  });
}
