import { NS } from "@ns";
import { kill_any_other_copies, tlogf } from "./utils";
import { array_jumping_game_ii, total_ways_to_sum_ii } from "./contracts";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (const f of ns.ls("home", ".cct")) {
    ns.rm(f, "home");
  }

  ns.codingcontract.createDummyContract("Total Ways to Sum II");

  for (const f of ns.ls("home", ".cct")) {
    const data = ns.codingcontract.getData(f, "home");
    tlogf(ns, "%s: %j", f, data);
    const answer = total_ways_to_sum_ii(ns, data);
    const result = ns.codingcontract.attempt(answer, f, "home");
    tlogf(ns, "%s: %j: '%s'", f, answer, result);
  }
}
