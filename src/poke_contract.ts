import { NS } from "@ns";
import {
  get_hosts,
  kill_any_other_copies,
  tlogf,
  total_ways_to_sum,
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
      if (type === "Total Ways to Sum") {
        const answer = total_ways_to_sum(ns, data);
        tlogf(ns, "answer: %d", answer);
        const result = ns.codingcontract.attempt(answer, file, host);
        tlogf(ns, "result: %s", result);
      }
    }
  }
}
