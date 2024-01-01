import { NS } from "@ns";
import { parse_target_hosts, shuffle } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([["threads", 1]]);
  const threads = flags.threads as number;

  while (true) {
    const targets = parse_target_hosts(ns, "target_hosts.txt").weaken;
    if (targets.length === 0) {
      await ns.sleep(1000);
      continue;
    }
    shuffle(targets);
    for (const host of targets) {
      await ns.weaken(host, { threads });
    }
  }
}
