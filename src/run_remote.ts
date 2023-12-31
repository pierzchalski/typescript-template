import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([
    ["run-weaken-on", ""],
    ["run-grow-on", ""],
  ]);
  const run_weaken_on = flags["run-weaken-on"] as string;
  const run_grow_on = flags["run-grow-on"] as string;
  while (true) {
    if (run_weaken_on !== "") {
      ns.run("weaken_hosts_run_remote.js", 1, "--run-on", run_weaken_on);
      while (ns.scriptRunning("weaken_hosts_run_remote.js", ns.getHostname())) {
        await ns.sleep(100);
      }
    }
    if (run_grow_on !== "") {
      ns.run("grow_hosts_run_remote.js", 1, "--run-on", run_grow_on);
      while (ns.scriptRunning("grow_hosts_run_remote.js", ns.getHostname())) {
        await ns.sleep(100);
      }
    }
    await ns.sleep(10 * 60 * 1000 /* 10 minutes */);
  }
}
