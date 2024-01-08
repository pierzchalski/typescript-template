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
} from "./contracts";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  const contract_type_counts = new Map<string, number>();
  for (const [host, _] of get_hosts(ns, 10)) {
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
      var answer: string | number | any[] = 0;
      if (type === "Total Ways to Sum") {
        answer = total_ways_to_sum(ns, data);
      } else if (type === "Sanitize Parentheses in Expression") {
        answer = await sanitize_parentheses_in_expression(ns, data);
      } else if (type === "Subarray with Maximum Sum") {
        answer = subarray_with_maximum_sum(ns, data);
      } else if (type === "Proper 2-Coloring of a Graph") {
        answer = proper_2_coloring_of_a_graph(ns, data);
      } else if (type === "Find Largest Prime Factor") {
        answer = find_largest_prime_factor(ns, data);
      } else if (type === "Encryption I: Caesar Cipher") {
        answer = encryption_i_caesar_cipher(ns, data);
      } else if (type === "Encryption II: Vigenère Cipher") {
        answer = encryption_ii_vigenere_cipher(ns, data);
      } else if (type === "Algorithmic Stock Trader II") {
        answer = algorithmic_stock_trader_ii(ns, data);
      } else if (type === "Algorithmic Stock Trader III") {
        answer = algorithmic_stock_trader_iii(ns, data);
      } else if (type === "Compression II: LZ Decompression") {
        answer = compression_ii_lz_decompression(ns, data);
      } else if (type === "Array Jumping Game") {
        answer = array_jumping_game(ns, data);
      } else if (type === "Array Jumping Game II") {
        answer = array_jumping_game_ii(ns, data);
      } else if (type === "Unique Paths in a Grid I") {
        answer = unique_paths_in_a_grid_i(ns, data);
      } else if (type === "Merge Overlapping Intervals") {
        answer = merge_overlapping_intervals(ns, data);
      } else if (type === "Find All Valid Math Expressions") {
        answer = await find_all_valid_math_expressions(ns, data);
      } else if (type === "Generate IP Addresses") {
        answer = generate_ip_addresses(ns, data);
      } else {
        continue;
      }
      tlogf(ns, "answer: %j", answer);
      const result = ns.codingcontract.attempt(answer, file, host);
      if (result === "") {
        throw new Error("incorrect answer!");
      }
      tlogf(ns, "result: %s", result);
    }
  }
  const counts = Array.from(contract_type_counts.entries());
  counts.sort((a, b) => b[1] - a[1]);
  tlogf(ns, "counts: %j", counts);
}
