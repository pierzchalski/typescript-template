import { NS } from "@ns";
import { clean_nbsp, kill_any_other_copies, tlogf } from "./utils";
import {
  algorithmic_stock_trader_iii,
  array_jumping_game,
  array_jumping_game_ii,
  compression_ii_lz_decompression,
  compression_iii_lz_compression,
  encryption_i_caesar_cipher,
  find_all_valid_math_expressions,
  find_largest_prime_factor,
  generate_ip_addresses,
  merge_overlapping_intervals,
  sanitize_parentheses_in_expression,
  subarray_with_maximum_sum,
  total_ways_to_sum_ii,
  unique_paths_in_a_grid_i,
} from "./contracts";

var description: string = "";

async function loop(ns: NS): Promise<boolean> {
  for (const f of ns.ls("home", ".cct")) {
    ns.rm(f, "home");
  }

  ns.codingcontract.createDummyContract("Compression III: LZ Compression");

  for (const f of ns.ls("home", ".cct")) {
    description = ns.codingcontract.getDescription(f, "home");
    const data = ns.codingcontract.getData(f, "home");
    const answer = await compression_iii_lz_compression(ns, data);
    const result = ns.codingcontract.attempt(answer, f, "home");
    if (result !== "No reward for this contract") {
      tlogf(ns, "%s: failure with data: %j", f, data);
      tlogf(ns, "%s:        and answer: %j", f, answer);
      return false;
    }
  }
  return true;
}

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (var sample = 0; sample < 10; sample += 1) {
    if (!(await loop(ns))) {
      ns.tprint(clean_nbsp(description));
      break;
    }
    await ns.sleep(1);
  }
  // ns.tprintf("%j", await find_all_valid_math_expressions(ns, ["123", 6]));
  ns.tprintf("done");
}
