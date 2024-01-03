import { NS } from "@ns";
import { kill_any_other_copies, sleep_and_spawn_self, tlogf } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  const flags = ns.flags([["sleep-seconds", 60]]);
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
    if (
      ns.getPurchasedServerUpgradeCost(host, target_ram) >
      ns.getServerMoneyAvailable("home") / ns.getPurchasedServerLimit()
    ) {
      continue;
    }
    if (ns.upgradePurchasedServer(host, target_ram)) {
      tlogf(ns, "upgradePurchasedServer(%s, %d)", host, target_ram);
    }
  }

  await sleep_and_spawn_self(ns, sleep_seconds);
}
