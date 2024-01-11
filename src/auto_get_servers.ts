import { NS } from "@ns";
import {
  available_funds,
  kill_any_other_copies,
  sleep_and_spawn_self,
  tlogf,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  const flags = ns.flags([["sleep-seconds", 1]]);
  const sleep_seconds = flags["sleep-seconds"] as number;

  while (
    ns.getPurchasedServers().length < ns.getPurchasedServerLimit() &&
    ns.purchaseServer("runner", 4) != ""
  ) {}

  for (const host of ns.getPurchasedServers()) {
    const target_ram = ns.getServerMaxRam(host) * 2;
    if (target_ram > ns.getPurchasedServerMaxRam()) {
      continue;
    }
    const cost = ns.getPurchasedServerUpgradeCost(host, target_ram);
    if (cost > available_funds(ns)) {
      continue;
    }
    if (ns.upgradePurchasedServer(host, target_ram)) {
      tlogf(
        ns,
        "upgradePurchasedServer(%s, %d) for %s",
        host,
        target_ram,
        ns.formatNumber(cost)
      );
    }
  }

  await sleep_and_spawn_self(ns, sleep_seconds);
}
