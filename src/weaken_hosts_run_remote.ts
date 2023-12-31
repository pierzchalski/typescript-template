import { NS } from "@ns";
import { get_hosts, max_script_threads } from "./utils";

export async function main(ns: NS): Promise<void> {
  const flags = ns.flags([["run-on", ""]]);
  const host = flags["run-on"] as string;
  if (host === "") {
    throw new Error("No host specified.");
  }
  const script = "weaken_hosts.js";
  const threads = max_script_threads(ns, host, script);
  let args = flags._ as (string | number | boolean)[];
  args = args.concat(["--threads", threads]);
  const weaken_effect = ns.weakenAnalyze(threads);
  for (const [host, server] of get_hosts(ns, 10)) {
    if (
      !server.hasAdminRights ||
      server.purchasedByPlayer ||
      ns.getWeakenTime(host) > 120 * 1000 /* 2 minutes */ ||
      server.minDifficulty === undefined ||
      server.hackDifficulty === undefined ||
      server.hackDifficulty - weaken_effect < server.minDifficulty
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
