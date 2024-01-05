import { NS } from "@ns";
import { kill_any_other_copies, tlogf, two_coloring } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (const f of ns.ls("home", ".cct")) {
    ns.rm(f, "home");
  }

  ns.codingcontract.createDummyContract("Proper 2-Coloring of a Graph");

  for (const f of ns.ls("home", ".cct")) {
    const data = ns.codingcontract.getData(f, "home") as [
      number,
      [number, number][]
    ];
    tlogf(ns, "%s: %j", f, data);
    const answer = two_coloring(ns, data);
    const result = ns.codingcontract.attempt(answer, f, "home");
    tlogf(ns, "%s: %j: '%s'", f, answer, result);
  }
}
