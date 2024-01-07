import { NS } from "@ns";
import { kill_any_other_copies, tlogf } from "./utils";
import {
  algorithmic_stock_trader_iii,
  array_jumping_game,
  array_jumping_game_ii,
  encryption_i_caesar_cipher,
  find_largest_prime_factor,
  generate_ip_addresses,
  merge_overlapping_intervals,
  sanitize_parentheses_in_expression,
  subarray_with_maximum_sum,
  total_ways_to_sum_ii,
  unique_paths_in_a_grid_i,
} from "./contracts";

async function loop(ns: NS): Promise<void> {
  for (const f of ns.ls("home", ".cct")) {
    ns.rm(f, "home");
  }

  ns.codingcontract.createDummyContract("Subarray with Maximum Sum");

  for (const f of ns.ls("home", ".cct")) {
    const data = ns.codingcontract.getData(f, "home");
    const answer = subarray_with_maximum_sum(ns, data);
    const result = ns.codingcontract.attempt(answer, f, "home");
    if (result !== "No reward for this contract") {
      tlogf(ns, "%s: failure with data: %j", f, data);
      tlogf(ns, "%s:        and answer: %j", f, answer);
    }
  }
}

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (var sample = 0; sample < 100; sample += 1) {
    await loop(ns);
    await ns.sleep(1);
  }
  ns.tprintf("done");
}
