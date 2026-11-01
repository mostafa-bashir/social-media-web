import { z } from "zod";

/** Mirrors the API's `TaskPriority` enum; shared so every feature parses the same set. */
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
