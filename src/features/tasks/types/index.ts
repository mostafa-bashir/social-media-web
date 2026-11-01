import { z } from "zod";

import { TASK_PRIORITIES, type TaskPriority } from "@/config/task-priorities";

export { TASK_PRIORITIES, type TaskPriority };

export const STATUS_TONES = [
  "neutral",
  "brand",
  "growth",
  "accent",
  "danger",
] as const;
export const STATUS_CATEGORIES = ["todo", "in_progress", "done"] as const;
export const TASK_TYPES = [
  "campaign",
  "content",
  "task",
  "bug",
  "subtask",
] as const;
export const DUE_FILTERS = ["overdue", "week"] as const;
/** In workflow order; mirrors the API's `WorkflowStage`. */
export const WORKFLOW_STAGES = [
  "no_post",
  "draft",
  "changes_requested",
  "in_review",
  "scheduled",
  "publishing",
  "published",
  "measuring",
  "goal_reached",
  "goal_missed",
  "failed",
] as const;
/** Stages that can move a task to a column. */
export const AUTOMATION_STAGES = [
  "draft",
  "in_review",
  "changes_requested",
  "scheduled",
  "published",
  "measuring",
  "goal_reached",
  "goal_missed",
  "failed",
] as const;
export const GOAL_METRICS = [
  "views",
  "reach",
  "likes",
  "comments",
  "shares",
  "saves",
  "engagements",
  "watch_time_minutes",
] as const;
export const TASK_VIEWS = [
  "board",
  "list",
  "backlog",
  "timeline",
  "reports",
] as const;

export type StatusTone = (typeof STATUS_TONES)[number];
export type StatusCategory = (typeof STATUS_CATEGORIES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type DueFilter = (typeof DUE_FILTERS)[number];
export type WorkflowStage = (typeof WORKFLOW_STAGES)[number];
export type AutomationStage = (typeof AUTOMATION_STAGES)[number];
export type GoalMetric = (typeof GOAL_METRICS)[number];
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

export const taskLabelSchema = z.object({
  id: z.string(),
  name: z.string(),
  tone: z.enum(STATUS_TONES),
});
export type TaskLabel = z.infer<typeof taskLabelSchema>;

export const taskLabelWithCountSchema = taskLabelSchema.extend({
  taskCount: z.number(),
});
export type TaskLabelWithCount = z.infer<typeof taskLabelWithCountSchema>;

export const taskGoalSchema = z.object({
  id: z.string(),
  metric: z.enum(GOAL_METRICS),
  target: z.number(),
  actual: z.number(),
  dueAt: z.string().nullable(),
  achievedAt: z.string().nullable(),
  missedAt: z.string().nullable(),
});
export type TaskGoal = z.infer<typeof taskGoalSchema>;

export const taskPostSchema = z.object({
  id: z.string(),
  captionExcerpt: z.string(),
  status: z.string(),
  scheduledAt: z.string().nullable(),
  clientId: z.string(),
});
export type TaskPost = z.infer<typeof taskPostSchema>;

const progressSchema = z.object({ total: z.number(), done: z.number() });
export type TaskProgress = z.infer<typeof progressSchema>;

export const taskSchema = z.object({
  id: z.string(),
  key: z.string(),
  type: z.enum(TASK_TYPES),
  title: z.string(),
  description: z.string().nullable(),
  statusId: z.string(),
  position: z.number(),
  priority: z.enum(TASK_PRIORITIES),
  parent: z
    .object({
      id: z.string(),
      key: z.string(),
      title: z.string(),
      type: z.enum(TASK_TYPES),
    })
    .nullable(),
  children: progressSchema,
  checklist: progressSchema,
  labels: z.array(taskLabelSchema),
  storyPoints: z.number().nullable(),
  estimateMinutes: z.number().nullable(),
  loggedMinutes: z.number(),
  /** Open tasks that block this one. */
  blockedBy: z.number(),
  client: z.object({ id: z.string(), name: z.string() }).nullable(),
  sprint: z
    .object({ id: z.string(), name: z.string(), state: z.string() })
    .nullable(),
  posts: z.array(taskPostSchema),
  workflowStage: z.enum(WORKFLOW_STAGES).nullable(),
  goals: z.array(taskGoalSchema),
  assignees: z.array(taskPersonSchema),
  startAt: z.string().nullable(),
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

export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
  position: z.number(),
  doneBy: z.string().nullable(),
  doneAt: z.string().nullable(),
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const automationRuleSchema = z.object({
  stage: z.enum(AUTOMATION_STAGES),
  targetStatusId: z.string().nullable(),
  enabled: z.boolean(),
});
export type AutomationRule = z.infer<typeof automationRuleSchema>;

export const LINK_KINDS = ["blocks", "relates", "duplicates"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

export const taskActivitySchema = z.object({
  id: z.string(),
  kind: z.string(),
  actor: taskPersonSchema.nullable(),
  data: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});
export type TaskActivity = z.infer<typeof taskActivitySchema>;

export const taskLinkSchema = z.object({
  id: z.string(),
  kind: z.enum(LINK_KINDS),
  direction: z.enum(["outgoing", "incoming"]),
  task: z.object({
    id: z.string(),
    key: z.string(),
    title: z.string(),
    type: z.enum(TASK_TYPES),
    statusId: z.string(),
    completedAt: z.string().nullable(),
  }),
});
export type TaskLink = z.infer<typeof taskLinkSchema>;

export const taskAttachmentSchema = z.object({
  id: z.string(),
  kind: z.enum(["image", "video", "document"]),
  mimeType: z.string(),
  sizeBytes: z.number(),
  originalFilename: z.string(),
  url: z.string(),
  uploadedBy: taskPersonSchema.nullable(),
  createdAt: z.string(),
});
export type TaskAttachment = z.infer<typeof taskAttachmentSchema>;

export const taskWorklogSchema = z.object({
  id: z.string(),
  person: taskPersonSchema.nullable(),
  minutes: z.number(),
  note: z.string().nullable(),
  startedAt: z.string(),
  createdAt: z.string(),
});
export type TaskWorklog = z.infer<typeof taskWorklogSchema>;

export interface WorklogInput {
  minutes: number;
  note: string | null;
  startedAt: string;
}

export const SPRINT_STATES = ["planned", "active", "completed"] as const;

export const sprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  goal: z.string().nullable(),
  state: z.enum(SPRINT_STATES),
  startAt: z.string().nullable(),
  endAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  taskCount: z.number(),
  doneCount: z.number(),
  points: z.number(),
  donePoints: z.number(),
  committedPoints: z.number().nullable(),
});
export type Sprint = z.infer<typeof sprintSchema>;

export interface SprintInput {
  name: string;
  goal: string | null;
  startAt: string | null;
  endAt: string | null;
}

export const burndownSchema = z.object({
  sprintId: z.string(),
  committedPoints: z.number(),
  committedTasks: z.number(),
  days: z.array(
    z.object({
      date: z.string(),
      remainingPoints: z.number().nullable(),
      remainingTasks: z.number().nullable(),
    }),
  ),
});
export type Burndown = z.infer<typeof burndownSchema>;

export const velocitySchema = z.object({
  sprintId: z.string(),
  name: z.string(),
  committedPoints: z.number(),
  completedPoints: z.number(),
  completedTasks: z.number(),
});
export type Velocity = z.infer<typeof velocitySchema>;

export const taskSettingsSchema = z.object({
  keyPrefix: z.string(),
  customKeyPrefix: z.string().nullable(),
});
export type TaskSettings = z.infer<typeof taskSettingsSchema>;

/** Filters shared by the board and the list (all kept in the URL). */
export interface TaskFilters {
  /** A sprint id, "active" or "backlog". */
  sprintId?: string;
  type?: TaskType;
  labelId?: string;
  clientId?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  due?: DueFilter;
  search?: string;
}

export interface TaskInput {
  title: string;
  type?: TaskType;
  parentId?: string | null;
  storyPoints?: number | null;
  estimateMinutes?: number | null;
  startAt?: string | null;
  labelIds?: string[];
  description?: string | null;
  statusId?: string;
  priority?: TaskPriority;
  clientId?: string | null;
  sprintId?: string | null;
  postIds?: string[];
  dueAt?: string | null;
  assigneeIds?: string[];
}

export interface TaskStatusInput {
  name: string;
  tone: StatusTone;
  category: StatusCategory;
}

export interface TaskGoalInput {
  metric: GoalMetric;
  target: number;
  dueAt: string | null;
}

export interface TaskLabelInput {
  name: string;
  tone: StatusTone;
}

export interface CommentInput {
  body: string;
  mentionedUserIds: string[];
}
