import { NS } from "@ns";
import {
  clean_nbsp,
  get_hosts,
  kill_any_other_copies,
  sleep_and_spawn_self,
  tlogf,
} from "./utils";
import { contractSolvers } from "./contracts/solvers";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  const contract_type_counts = new Map<string, number>();
  const results: string[] = [];
  for (const [host, _] of get_hosts(ns)) {
    for (const file of ns.ls(host, ".cct")) {
      const type = ns.codingcontract.getContractType(file, host);
      if (contract_type_counts.has(type)) {
        contract_type_counts.set(
          type,
          (contract_type_counts.get(type) as number) + 1
        );
      } else {
        contract_type_counts.set(type, 1);
      }
      const data = ns.codingcontract.getData(file, host);
      var solver: ((_: any) => any) | undefined = undefined;
      for (const s of contractSolvers) {
        if (s.name === type) {
          solver = s.solver;
          break;
        }
      }
      if (solver === undefined) {
        continue;
      }
      const answer = solver(data);
      const result = ns.codingcontract.attempt(answer, file, host);
      if (result === "") {
        tlogf(ns, "answer: %j", answer);
        tlogf(
          ns,
          "\n########################################################################################################\n%s@%s",
          file,
          host
        );
        tlogf(ns, "type: %s", type);
        tlogf(
          ns,
          "description: %s",
          clean_nbsp(ns.codingcontract.getDescription(file, host))
        );
        tlogf(ns, "data: %j", data);
        tlogf(
          ns,
          "attempts remaining: %d",
          ns.codingcontract.getNumTriesRemaining(file, host)
        );

        throw new Error("incorrect answer!");
      }
      results.push(result);
    }
  }
  const counts = Array.from(contract_type_counts.entries());
  counts.sort((a, b) => b[1] - a[1]);
  if (results.length > 0) {
    tlogf(ns, "results: %j", results);
  }

  sleep_and_spawn_self(ns, 600);
}
