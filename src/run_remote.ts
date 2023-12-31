import { NS } from "@ns";
import {
  get_hosts,
  grow_hosts_run_remote,
  hack_hosts_run_remote,
  weaken_hosts_run_remote,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([
    ["weaken-threads", 50],
    ["grow-threads", 50],
    ["hack-threads", 50],
  ]);
  const target_weaken_threads = flags["weaken-threads"] as number;
  const target_grow_threads = flags["grow-threads"] as number;
  const target_hack_threads = flags["hack-threads"] as number;
  while (true) {
    var runners = get_hosts(ns, 10);
    const targets = new Map(runners);

    for (const weaken_runner of weaken_hosts_run_remote(
      ns,
      target_weaken_threads,
      runners,
      targets
    )) {
      runners.delete(weaken_runner);
    }

    for (const grow_runner of grow_hosts_run_remote(
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

    await ns.sleep(10 * 60 * 1000 /* 10 minutes */);
  }
}
