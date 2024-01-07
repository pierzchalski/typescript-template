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
} from "./contracts";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (const [host, _] of get_hosts(ns, 10)) {
    for (const file of ns.ls(host, ".cct")) {
      const type = ns.codingcontract.getContractType(file, host);
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
      } else if (type === "Proper 2-Coloring of a Graph") {
        answer = proper_2_coloring_of_a_graph(ns, data);
      } else if (type === "Encryption I: Caesar Cipher") {
        answer = encryption_i_caesar_cipher(ns, data);
      } else if (type === "Encryption II: Vigenère Cipher") {
        answer = encryption_ii_vigenere_cipher(ns, data);
      } else if (type === "Algorithmic Stock Trader II") {
        answer = algorithmic_stock_trader_ii(ns, data);
      } else if (type === "Array Jumping Game") {
        answer = array_jumping_game(ns, data);
      } else if (type === "Array Jumping Game II") {
        answer = array_jumping_game_ii(ns, data);
      } else if (type === "Merge Overlapping Intervals") {
        answer = merge_overlapping_intervals(ns, data);
        // } else if (type === "Total Ways to Sum II") {
        //   answer = total_ways_to_sum_ii(ns, data);
      } else if (type === "Generate IP Addresses") {
        answer = generate_ip_addresses(ns, data);
      } else {
        continue;
      }
      tlogf(ns, "answer: %j", answer);
      const result = ns.codingcontract.attempt(answer, file, host);
      tlogf(ns, "result: %s", result);
    }
  }
}
