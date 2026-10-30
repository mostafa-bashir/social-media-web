import { z } from "zod";

export const STATUS_TONES = [
  "neutral",
  "brand",
  "growth",
  "accent",
  "danger",
] as const;
export const STATUS_CATEGORIES = ["todo", "in_progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const DUE_FILTERS = ["overdue", "week"] as const;
export const TASK_VIEWS = ["board", "list"] as const;

export type StatusTone = (typeof STATUS_TONES)[number];
export type StatusCategory = (typeof STATUS_CATEGORIES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type DueFilter = (typeof DUE_FILTERS)[number];
export type TaskView = (typeof TASK_VIEWS)[number];

export const taskStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  tone: z.enum(STATUS_TONES),
  category: z.enum(STATUS_CATEGORIES),
  position: z.number(),
  taskCount: z.number(),
});
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPersonSchema = z.object({
  userId: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type TaskPerson = z.infer<typeof taskPersonSchema>;

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  statusId: z.string(),
  position: z.number(),
  priority: z.enum(TASK_PRIORITIES),
  client: z.object({ id: z.string(), name: z.string() }).nullable(),
  post: z
    .object({
      id: z.string(),
      captionExcerpt: z.string(),
      status: z.string(),
      scheduledAt: z.string().nullable(),
    })
    .nullable(),
  assignees: z.array(taskPersonSchema),
  dueAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  commentCount: z.number(),
  createdBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Task = z.infer<typeof taskSchema>;

export const boardColumnSchema = z.object({
  status: taskStatusSchema.pick({
    id: true,
    name: true,
    tone: true,
    category: true,
  }),
  total: z.number(),
  tasks: z.array(taskSchema),
});
export type BoardColumn = z.infer<typeof boardColumnSchema>;

export const taskCommentSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  author: taskPersonSchema.nullable(),
  body: z.string(),
  mentionedUserIds: z.array(z.string()),
  createdAt: z.string(),
  editedAt: z.string().nullable(),
});
export type TaskComment = z.infer<typeof taskCommentSchema>;

/** Filters shared by the board and the list (all kept in the URL). */
export interface TaskFilters {
  clientId?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  due?: DueFilter;
  search?: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  statusId?: string;
  priority?: TaskPriority;
  clientId?: string | null;
  postId?: string | null;
  dueAt?: string | null;
  assigneeIds?: string[];
}

export interface TaskStatusInput {
  name: string;
  tone: StatusTone;
  category: StatusCategory;
}

export interface CommentInput {
  body: string;
  mentionedUserIds: string[];
}
