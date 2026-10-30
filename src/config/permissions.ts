/** Mirrors the API's permission catalog (`permission-catalog.ts`). */
export const Permission = {
  WorkspaceUpdate: "workspace.update",
  WorkspaceDelete: "workspace.delete",
  MembersView: "members.view",
  MembersInvite: "members.invite",
  MembersUpdate: "members.update",
  MembersRemove: "members.remove",
  RolesView: "roles.view",
  RolesCreate: "roles.create",
  RolesUpdate: "roles.update",
  RolesDelete: "roles.delete",
  AuditLogsView: "audit_logs.view",
  ClientsView: "clients.view",
  ClientsManage: "clients.manage",
  AccountsView: "accounts.view",
  AccountsManage: "accounts.manage",
  PostsView: "posts.view",
  PostsManage: "posts.manage",
  PostsApprove: "posts.approve",
  AnalyticsView: "analytics.view",
  AnalyticsExport: "analytics.export",
  AnalyticsManage: "analytics.manage",
  TasksView: "tasks.view",
  TasksManage: "tasks.manage",
  TasksConfigure: "tasks.configure",
} as const;

export type PermissionSlug = (typeof Permission)[keyof typeof Permission];
