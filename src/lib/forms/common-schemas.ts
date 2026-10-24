import { z } from "zod";

/** Messages are `validation.*` keys. Mirrors the API's DTO rules. */
export const emailSchema = z.email("email");

export const passwordSchema = z
  .string("required")
  .min(8, "passwordMin")
  .max(128, "passwordMax")
  .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "passwordPattern");

export const nameSchema = z
  .string("required")
  .trim()
  .min(2, "nameMin")
  .max(120, "nameMax");

export const verificationCodeSchema = z
  .string("required")
  .regex(/^\d{6}$/, "codeFormat");

export const workspaceSlugSchema = z
  .string("required")
  .min(3, "slugLength")
  .max(48, "slugLength")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slugFormat");
