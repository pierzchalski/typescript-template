import { NS } from "@ns";
import { tlogf } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");

  while (
    ns.getPurchasedServers().length < ns.getPurchasedServerLimit() &&
    ns.purchaseServer("runner", 4) != ""
  ) {}

  for (const host of ns.getPurchasedServers()) {
    const target_ram = ns.getServerMaxRam(host) * 2;
    if (target_ram > ns.getPurchasedServerMaxRam()) {
      continue;
    }
    if (ns.upgradePurchasedServer(host, target_ram)) {
      tlogf(ns, "upgradePurchasedServer(%s, %d)", host, target_ram);
    }
  }
}
