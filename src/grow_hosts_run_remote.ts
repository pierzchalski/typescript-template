import { NS } from "@ns";
import { get_hosts, growth_for_n_threads, max_script_threads } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([["run-on", ""]]);
  const host = flags["run-on"] as string;
  if (host === "") {
    throw new Error("No host specified.");
  }
  const script = "grow_hosts.js";
  const threads = max_script_threads(ns, host, script);
  let args = flags._ as (string | number | boolean)[];
  args = args.concat(["--threads", threads]);
  for (const [host, server] of get_hosts(ns, 10)) {
    const grow_effect = growth_for_n_threads(ns, host, threads);
    if (
      !server.hasAdminRights ||
      server.purchasedByPlayer ||
      ns.getGrowTime(host) > 120 * 1000 /* 2 minutes */ ||
      server.moneyAvailable === undefined ||
      server.moneyMax === undefined ||
      server.moneyAvailable * (1 + grow_effect) > server.moneyMax
    ) {
      continue;
    }
    args = args.concat(["--host", host]);
  }
  ns.scp("utils.js", host);
  ns.scp(script, host);
  ns.killall(host);
  ns.exec(script, host, threads, ...args);
}
