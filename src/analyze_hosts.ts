import { NS } from "@ns";
import { get_hosts } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([
    ["root-only", false],
    ["nonplayer-only", false],
    ["hackable-only", false],
  ]);
  const root_only = flags["root-only"] as boolean;
  const nonplayer_only = flags["nonplayer-only"] as boolean;
  const hackable_only = flags["hackable-only"] as boolean;

  for (const [_, server] of get_hosts(ns, 10)) {
    if (root_only && !server.hasAdminRights) {
      continue;
    }
    if (nonplayer_only && server.purchasedByPlayer) {
      continue;
    }
    if (
      hackable_only &&
      (server.requiredHackingSkill === undefined ||
        ns.getHackingLevel() < server.requiredHackingSkill)
    ) {
      continue;
    }
    ns.tprintf("%j", server);
  }
}
