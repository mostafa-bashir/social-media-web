import type { FormRule } from "antd";
import type { z } from "zod";

/**
 * Adapts a zod schema into an antd Form rule. Schema messages are keys in the
 * `validation` namespace, translated with the `t` passed in.
 */
export function zodRule(
  schema: z.ZodType,
  t: (key: string) => string,
): FormRule {
  return {
    validator: async (_rule, value: unknown) => {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new Error(t(result.error.issues[0]?.message ?? "invalid"));
      }
    },
  };
}
