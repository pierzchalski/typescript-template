import { NS } from "@ns";
import {
  allocate_runners,
  allocate_targets,
  get_servers,
  kill_any_other_copies,
  logf,
  parse_target_ratios,
  run_targets_on_remotes,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  const flags = ns.flags([["sleep-seconds", 0.001]]);
  const sleep_seconds = flags["sleep-seconds"] as number;

  while (true) {
    const servers = get_servers(ns);
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
    await ns.asleep(sleep_seconds * 1000);
  }
}
