import { NS } from "@ns";
import { tlogf } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([
    ["host", ""],
    ["ram-p2", 0],
    ["list", false],
  ]);
  const host = flags.host as string;
  const list = flags.list as boolean;
  const ram_p2 = flags["ram-p2"] as number;
  const ram = 1 << ram_p2;

  const servers = ns.getPurchasedServers();
  if (list) {
    ns.tprint(servers);
    return;
  }

  var found = false;
  for (const server of servers) {
    if (host !== "" && server !== host) {
      continue;
    }
    const result = ns.upgradePurchasedServer(server, ram);
    tlogf(ns, "upgradePurchasedServer(%s, %d) = %t", server, ram, result);
    found = true;
  }
  if (!found) {
    const result = ns.purchaseServer(host, ram) !== "";
    tlogf(ns, "purchaseServer(%s, %d) = %t", host, ram, result);
  }
}
