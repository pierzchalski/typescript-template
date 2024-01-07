const TargetActionsO = {
  Hack: "hack",
  Grow: "grow",
  Weaken: "weaken",
} as const;

export const TargetActions = TargetActionsO;

export type TargetAction = (typeof TargetActions)[keyof typeof TargetActions];

export interface TargetWithAction {
  target: string;
  action: TargetAction;
}

export interface WorkerActions {
  version: number;
  actions: TargetWithAction[];
}

export function worker_actions_file(worker_host: string): string {
  return `worker_actions_${worker_host}.txt`;
}
