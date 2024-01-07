import { NS } from "@ns";
import { WorkerActions, TargetActions, worker_actions_file } from "./common";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([
    ["threads", 1],
    ["localhost", ""],
  ]);
  const threads = flags.threads as number;
  const localhost = flags.localhost as string;

  var version: number = -1;

  while (true) {
    ns.setTitle(`[t=${threads}] worker@${localhost}`);

    const content = ns.read(worker_actions_file(localhost));
    if (content === "") {
      ns.print("WARN: no worker actions file available");

      await ns.asleep(1000);
      continue;
    }

    const worker_actions = JSON.parse(content) as WorkerActions;
    if (version === worker_actions.version) {
      // We've already completed this version of the actions; wait for a new
      // batch.
      ns.printf("INFO: waiting for new actions (current version: %d)", version);
      await ns.asleep(1000);
      continue;
    }
    version = worker_actions.version;

    for (const action of worker_actions.actions) {
      ns.setTitle(
        `[${action.action} ${action.target}, t=${threads}] worker@${localhost}`
      );
      if (action.action === TargetActions.Hack) {
        await ns.hack(action.target, { threads });
      } else if (action.action === TargetActions.Grow) {
        await ns.grow(action.target, { threads });
      } else if (action.action === TargetActions.Weaken) {
        await ns.weaken(action.target, { threads });
      } else {
        throw new Error(`unknown action: ${action.action}`);
      }
    }
  }
}
