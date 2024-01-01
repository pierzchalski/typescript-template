import { NS } from "@ns";
import {
  allocate_runners,
  allocate_targets,
  get_hosts,
  parse_target_ratios,
  run_targets_on_remotes,
  tlogf,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");

  for (const proc of ns.ps()) {
    if (proc.filename === ns.getScriptName() && proc.pid !== ns.pid) {
      tlogf(ns, "Killing %s (pid %d)", proc.filename, proc.pid);
      ns.kill(proc.pid);
    }
  }

  const flags = ns.flags([["sleep-minutes", 5]]);
  const sleep_minutes = flags["sleep-minutes"] as number;
  const args = ns.args;
  const servers = get_hosts(ns, 10);

  const target_ratios = parse_target_ratios(ns, "target_ratios.txt");
  const targets = allocate_targets(ns, servers);
  tlogf(ns, "targets: %j", targets);

  target_ratios.weaken *= targets.weaken.length;
  target_ratios.grow *= targets.grow.length;
  target_ratios.hack *= targets.hack.length;

  tlogf(ns, "target_ratios: %j", target_ratios);

  const runners = allocate_runners(ns, servers, target_ratios);
  tlogf(ns, "runners: %j", runners);

  run_targets_on_remotes(ns, runners, targets);

  await ns.sleep(sleep_minutes * 60 * 1000);
  ns.spawn(ns.getScriptName(), 1, ...args);
}
