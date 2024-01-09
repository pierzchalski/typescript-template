import { NS } from "@ns";
import { clean_nbsp, get_hosts, kill_any_other_copies, tlogf } from "./utils";
import {
  total_ways_to_sum,
  proper_2_coloring_of_a_graph,
  encryption_ii_vigenere_cipher,
  algorithmic_stock_trader_ii,
  array_jumping_game_ii,
  total_ways_to_sum_ii,
  merge_overlapping_intervals,
  generate_ip_addresses,
  encryption_i_caesar_cipher,
  array_jumping_game,
  algorithmic_stock_trader_iii,
  find_largest_prime_factor,
  unique_paths_in_a_grid_i,
  sanitize_parentheses_in_expression,
  subarray_with_maximum_sum,
  compression_ii_lz_decompression,
  find_all_valid_math_expressions,
  compression_iii_lz_compression,
} from "./contracts";
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
      tlogf(ns, "answer: %j", answer);
      const result = ns.codingcontract.attempt(answer, file, host);
      if (result === "") {
        throw new Error("incorrect answer!");
      }
      results.push(result);
      tlogf(ns, "result: %s", result);
    }
  }
  const counts = Array.from(contract_type_counts.entries());
  counts.sort((a, b) => b[1] - a[1]);
  tlogf(ns, "counts: %j", counts);
  if (results.length > 0) {
    tlogf(ns, "results: %j", results);
  }
}
