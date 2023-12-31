import { NS } from "@ns";
import { tlogf } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([
    ["threads", 1],
    ["host", []],
  ]);
  const threads = flags.threads as number;
  const hosts = flags.host as string[];

  if (hosts.length === 0) {
    tlogf(ns, "No hosts specified.");
    throw new Error("No hosts specified.");
  }

  while (true) {
    for (const host of hosts) {
      await ns.hack(host, { threads });
    }
  }
}
