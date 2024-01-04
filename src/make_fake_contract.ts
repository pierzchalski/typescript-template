import { NS } from "@ns";
import { kill_any_other_copies, tlogf, total_ways_to_sum } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (const f of ns.ls("home", ".cct")) {
    ns.rm(f, "home");
  }

  ns.codingcontract.createDummyContract("Total Ways to Sum");

  for (const f of ns.ls("home", ".cct")) {
    const data = ns.codingcontract.getData(f, "home") as number;
    const answer = total_ways_to_sum(ns, data);
    const result = ns.codingcontract.attempt(answer, f, "home");
    tlogf(ns, "%s: %d -> %d: %s", f, data, answer, result);
  }
}
