import { NS } from "@ns";
import { tlogf } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([
    ["buy-host", ""],
    ["ram-p2", 0],
    ["list", false],
  ]);
  const buy_host = flags["buy-host"] as string;
  const list = flags.list as boolean;
  const ram_p2 = flags["ram-p2"] as number;
  const ram = 1 << ram_p2;

  const servers = ns.getPurchasedServers();
  if (list) {
    ns.tprint(servers);
    return;
  }

  if (buy_host !== "") {
    const result = ns.purchaseServer(buy_host, ram);
    tlogf(ns, "purchaseServer(%s, %d) = %s", buy_host, ram, result);
    return;
  }

  for (const server of servers) {
    const result = ns.upgradePurchasedServer(server, ram);
    tlogf(ns, "upgradePurchasedServer(%s, %d) = %t", server, ram, result);
  }
}
