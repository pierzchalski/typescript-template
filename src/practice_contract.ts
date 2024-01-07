import { NS } from "@ns";
import { kill_any_other_copies, tlogf } from "./utils";
import {
  array_jumping_game,
  array_jumping_game_ii,
  encryption_i_caesar_cipher,
  generate_ip_addresses,
  merge_overlapping_intervals,
  total_ways_to_sum_ii,
} from "./contracts";

function loop(ns: NS): void {
  for (const f of ns.ls("home", ".cct")) {
    ns.rm(f, "home");
  }

  ns.codingcontract.createDummyContract("Array Jumping Game");

  for (const f of ns.ls("home", ".cct")) {
    const data = ns.codingcontract.getData(f, "home");
    const answer = array_jumping_game(ns, data);
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
    loop(ns);
  }
}
