import { NS } from "@ns";
import {
  allocate_runners,
  allocate_targets,
  get_hosts,
  kill_any_other_copies,
  logf,
  parse_target_ratios,
  run_targets_on_remotes,
  tlogf,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  const flags = ns.flags([["sleep-minutes", 0.1]]);
  const sleep_minutes = flags["sleep-minutes"] as number;
  const args = ns.args;
  const servers = get_hosts(ns, 10);

  const target_ratios = parse_target_ratios(ns, "target_ratios.txt");
  const targets = allocate_targets(ns, servers);
  logf(ns, "targets: %j", targets);

  target_ratios.weaken *= targets.weaken.length * targets.weaken.length;
  target_ratios.grow *= targets.grow.length * targets.grow.length;
  target_ratios.hack *= targets.hack.length * targets.hack.length;

  logf(ns, "target_ratios: %j", target_ratios);

  const runners = allocate_runners(ns, servers, target_ratios);
  logf(ns, "runners: %j", runners);

  run_targets_on_remotes(ns, runners, targets);

  await ns.sleep(sleep_minutes * 60 * 1000);
  ns.run("crack_all.js");
  ns.run("auto_get_servers.js");
  ns.spawn(ns.getScriptName(), 1, ...args);
}
