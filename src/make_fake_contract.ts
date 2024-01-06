import { NS } from "@ns";
import {
  kill_any_other_copies,
  tlogf,
  encryption_ii_vigenere_cipher,
  algorithmic_stock_trader_ii,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  for (const f of ns.ls("home", ".cct")) {
    ns.rm(f, "home");
  }

  ns.codingcontract.createDummyContract("Algorithmic Stock Trader II");

  for (const f of ns.ls("home", ".cct")) {
    const data = ns.codingcontract.getData(f, "home");
    tlogf(ns, "%s: %j", f, data);
    const answer = algorithmic_stock_trader_ii(ns, data);
    const result = ns.codingcontract.attempt(answer, f, "home");
    tlogf(ns, "%s: %j: '%s'", f, answer, result);
  }
}
