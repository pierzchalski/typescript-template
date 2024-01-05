import { NS } from "@ns";
import { parse_target_hosts, pick_random } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([["threads", 1]]);
  const threads = flags.threads as number;

  while (true) {
    const mode = ns.read("mode.txt");
    const target_hosts = parse_target_hosts(ns, "target_hosts.txt");
    var targets;
    if (mode === "hack") {
      targets = target_hosts.hack;
    } else if (mode === "grow") {
      targets = target_hosts.grow;
    } else {
      targets = target_hosts.weaken;
    }

    ns.setTitle(`[${mode}] on_remote.js ${ns.args}`);

    const host = pick_random(targets);
    if (host === undefined) {
      await ns.sleep(1000);
      continue;
    }

    if (mode === "hack") {
      await ns.hack(host, { threads });
    } else if (mode === "grow") {
      await ns.grow(host, { threads });
    } else {
      await ns.weaken(host, { threads });
    }
  }
}
