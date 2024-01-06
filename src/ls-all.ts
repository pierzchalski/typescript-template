import { NS } from "@ns";
import { get_hosts, tlogf } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");

  const servers = get_hosts(ns, 10);
  for (const server of servers.values()) {
    if (server.purchasedByPlayer) {
      continue;
    }
    var files = ns.ls(server.hostname);
    files = files.filter(
      (f) =>
        f !== "mode.txt" &&
        f !== "target_hosts.txt" &&
        f !== "utils.js" &&
        f !== "on_remote.js"
    );
    if (files.length === 0) {
      continue;
    }
    ns.tprintf("# %s (%j):\n", server.hostname, server.path);
    for (const file of files) {
      ns.tprintf("  %s", file);
    }
    ns.tprintf("\n");
  }
}
