import { NS } from "@ns";
import {
  get_hosts,
  kill_any_other_copies,
  tlogf,
  total_ways_to_sum,
  two_coloring,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (const [host, _] of get_hosts(ns, 10)) {
    for (const file of ns.ls(host, ".cct")) {
      const type = ns.codingcontract.getContractType(file, host);
      const data = ns.codingcontract.getData(file, host);
      tlogf(ns, "\n%s@%s", file, host);
      tlogf(ns, "type: %s", type);
      tlogf(
        ns,
        "description: %s",
        ns.codingcontract.getDescription(file, host)
      );
      tlogf(ns, "data: %j", data);
      tlogf(
        ns,
        "attempts remaining: %d",
        ns.codingcontract.getNumTriesRemaining(file, host)
      );
      var answer: string | number | any[] = 0;
      if (type === "Total Ways to Sum") {
        answer = total_ways_to_sum(ns, data);
      } else if (type === "Proper 2-Coloring of a Graph") {
        answer = two_coloring(ns, data);
      } else {
        continue;
      }
      tlogf(ns, "answer: %j", answer);
      const result = ns.codingcontract.attempt(answer, file, host);
      tlogf(ns, "result: %s", result);
    }
  }
}
