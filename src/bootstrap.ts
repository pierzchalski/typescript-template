import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  ns.run("run_remote.js");
  ns.run("auto_get_servers.js");
  ns.run("crack_all.js");
  ns.run("stockbot.js");
  ns.run("attempt_contracts.js");
}
