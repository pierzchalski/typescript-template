import { NS } from "@ns";
import {
  get_hosts,
  grow_hosts_run_remote,
  hack_hosts_run_remote,
  tlogf,
  weaken_hosts_run_remote,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");

  for (const proc of ns.ps()) {
    if (proc.filename === ns.getScriptName() && proc.pid !== ns.pid) {
      tlogf(ns, "Killing %s (pid %d)", proc.filename, proc.pid);
      ns.kill(proc.pid);
    }
  }

  const flags = ns.flags([
    ["weaken-threads", 50],
    ["grow-threads", 50],
    ["hack-threads", 50],
    ["sleep-minutes", 30],
  ]);
  const target_weaken_threads = flags["weaken-threads"] as number;
  const target_grow_threads = flags["grow-threads"] as number;
  const target_hack_threads = flags["hack-threads"] as number;
  const sleep_minutes = flags["sleep-minutes"] as number;
  const args = ns.args;

  const targets = get_hosts(ns, 10);
  const runners = new Map(targets);

  for (const weaken_runner of weaken_hosts_run_remote(
    ns,
    target_weaken_threads,
    runners,
    targets
  )) {
    runners.delete(weaken_runner);
  }

  for (const grow_runner of await grow_hosts_run_remote(
    ns,
    target_grow_threads,
    runners,
    targets
  )) {
    runners.delete(grow_runner);
  }

  for (const hack_runner of hack_hosts_run_remote(
    ns,
    target_hack_threads,
    runners,
    targets
  )) {
    runners.delete(hack_runner);
  }

  await ns.sleep(sleep_minutes * 60 * 1000);
  ns.spawn(ns.getScriptName(), 1, ...args);
}
