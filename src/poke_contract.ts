import { NS } from "@ns";
import { get_hosts, kill_any_other_copies, tlogf } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (const [host, _] of get_hosts(ns, 10)) {
    for (const file of ns.ls(host, ".cct")) {
      tlogf(ns, "\n%s@%s", file, host);
      tlogf(ns, "type: %s", ns.codingcontract.getContractType(file, host));
      tlogf(
        ns,
        "description: %s",
        ns.codingcontract.getDescription(file, host)
      );
      tlogf(ns, "data: %j", ns.codingcontract.getData(file, host));
      tlogf(
        ns,
        "attempts remaining: %d",
        ns.codingcontract.getNumTriesRemaining(file, host)
      );
    }
  }
}
