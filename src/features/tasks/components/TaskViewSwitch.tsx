"use client";

import type { Task, TaskFilters, TaskStatus, TaskView } from "../types";
import BacklogView from "./BacklogView";
import CampaignTimeline from "./CampaignTimeline";
import SprintReportsView from "./SprintReportsView";
import TaskBoardView from "./TaskBoardView";
import TaskListView from "./TaskListView";

export interface TaskViewSwitchProps {
  view: TaskView;
  filters: TaskFilters;
  statuses: TaskStatus[];
  canManage: boolean;
  canConfigure: boolean;
  onOpen: (task: Task) => void;
  onAdd: (statusId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/** Board · List · Backlog · Timeline · Reports — all over the same tasks. */
export default function TaskViewSwitch({
  view,
  filters,
  statuses,
  canManage,
  canConfigure,
  onOpen,
  onAdd,
  onEdit,
  onDelete,
}: TaskViewSwitchProps) {
  switch (view) {
    case "board":
      return (
        <TaskBoardView
          filters={filters}
          statuses={statuses}
          canManage={canManage}
          canConfigure={canConfigure}
          onOpen={onOpen}
          onAdd={onAdd}
        />
      );
    case "backlog":
      return (
        <BacklogView
          statuses={statuses}
          canManage={canManage}
          onOpen={onOpen}
        />
      );
    case "timeline":
      return <CampaignTimeline onOpen={onOpen} />;
    case "reports":
      return <SprintReportsView />;
    case "list":
      return (
        <TaskListView
          // New filters start again from the first page.
          key={JSON.stringify(filters)}
          filters={filters}
          statuses={statuses}
          canManage={canManage}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
  }
}
