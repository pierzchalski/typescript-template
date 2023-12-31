import { NS, Server as NsServer } from "@ns";

export interface Server extends NsServer {}

export function get_hosts(ns: NS, depth: number = 1): Map<string, Server> {
  const hosts = new Map<string, Server>([[ns.getHostname(), ns.getServer()]]);
  const scanned = new Set<string>();
  while (depth > 0) {
    for (const host of new Set(hosts.keys())) {
      if (!scanned.has(host)) {
        scanned.add(host);
        for (const link of ns.scan(host)) {
          hosts.set(link, ns.getServer(link));
        }
      }
    }
    depth--;
  }
  return hosts;
}

export function get_host_paths(
  ns: NS,
  depth: number = 1
): Map<string, string[]> {
  const hosts = new Map<string, string[]>([
    [ns.getHostname(), [ns.getHostname()]],
  ]);
  const scanned = new Set<string>();
  while (depth > 0) {
    for (const [host, path] of new Map(hosts)) {
      if (scanned.has(host)) {
        continue;
      }
      scanned.add(host);
      for (const link of ns.scan(host)) {
        if (hosts.has(link)) {
          continue;
        }
        hosts.set(link, path.concat(link));
      }
    }
    depth--;
  }
  return hosts;
}

/**
 *
 * @param ns
 * @param host
 * @param threads
 * @param accuracy
 * @returns the fraction of growth from given number of threads.
 */
export function growth_for_n_threads(
  ns: NS,
  host: string,
  threads: number = 1,
  accuracy: number = 1e-5
): number {
  let lo = 1;
  let hi = 2;
  while (ns.growthAnalyze(host, hi) <= threads) {
    hi++;
  }
  // `lo` is currently the rate of growth for 0 threads.
  // `hi` is the smallest integer rate of growth which rquires at least
  // `threads`.
  while (lo + accuracy < hi) {
    const mid = (lo + hi) / 2;
    if (ns.growthAnalyze(host, mid) <= threads) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2 - 1;
}

export function max_script_threads(
  ns: NS,
  host: string,
  script: string
): number {
  const script_ram = ns.getScriptRam(script);
  if (script_ram === 0) {
    const message = `Script ${script} doesn't exist.`;
    tlogf(ns, "%s", message);
    throw new Error(message);
  }
  const server_ram = ns.getServer(host).maxRam;
  if (server_ram === 0) {
    const message = `Server ${host} doesn't exist.`;
    tlogf(ns, "%s", message);
    throw new Error(message);
  }
  const threads = Math.floor(server_ram / script_ram);
  tlogf(ns, "%s@%s can run with %d threads", script, host, threads);
  return threads;
}

export function tlogf(ns: NS, fmt: string, ...args: any[]): void {
  ns.tprintf(`${ns.getScriptName()}@${ns.getHostname()}: ${fmt}`, ...args);
}

export function logf(ns: NS, fmt: string, ...args: any[]): void {
  ns.printf(`${ns.getScriptName()}@${ns.getHostname()}: ${fmt}`, ...args);
}

export function analyze_host(ns: NS, host: string): void {
  ns.tprintf("P(hack):       %v", ns.hackAnalyzeChance(host));
  ns.tprintf("Hack frac:     %v", ns.hackAnalyze(host));
  ns.tprintf("Hack seconds:  %v", ns.getHackTime(host) / 1000);
  ns.tprintf("Hack security (t=1):  %v", ns.hackAnalyzeSecurity(1, host));
  ns.tprintf("Hack security (t=10): %v", ns.hackAnalyzeSecurity(10, host));
  ns.tprintf("Grow frac (t=1):  %v", growth_for_n_threads(ns, host, 1));
  ns.tprintf("Grow frac (t=10): %v", growth_for_n_threads(ns, host, 10));
  ns.tprintf("Grow seconds:  %v", ns.getGrowTime(host) / 1000);
  ns.tprintf("Grow security (t=1):  %v", ns.growthAnalyzeSecurity(1, host));
  ns.tprintf("Grow security (t=10): %v", ns.growthAnalyzeSecurity(10, host));
  ns.tprintf("Weak seconds:  %v", ns.getWeakenTime(host) / 1000);
  ns.tprintf("Weak security (t=1):  %v", ns.weakenAnalyze(1));
  ns.tprintf("Weak security (t=10): %v", ns.weakenAnalyze(10));
}

export function candidate_runners(
  ns: NS,
  script: string,
  target_thread_count: number,
  servers: Map<string, Server>
): Map<string, number> {
  var run_on = new Map<string, number>();
  for (const [host, server] of servers) {
    if (!server.hasAdminRights || server.hostname == ns.getHostname()) {
      continue;
    }
    const threads = max_script_threads(ns, host, script);
    if (threads > 0) {
      run_on.set(host, threads);
    }
    target_thread_count -= threads;
    if (target_thread_count <= 0) {
      break;
    }
  }
  return run_on;
}

export function cleanup_runners(ns: NS, runners: Map<string, Server>): void {
  for (const [host, server] of runners) {
    if (!server.hasAdminRights || server.hostname == ns.getHostname()) {
      continue;
    }
  }
}

export function run_on_remotes(
  ns: NS,
  script: string,
  host_to_threads: Map<string, number>,
  args: (string | number | boolean)[]
): void {
  for (const [host, threads] of host_to_threads) {
    const remote_args = args.concat(["--threads", threads]);
    ns.scp("utils.js", host);
    ns.scp(script, host);
    for (const proc of ns.ps(host)) {
      if (proc.filename === script && proc.args === remote_args) {
        tlogf(
          ns,
          "%s@%s is already running with args %j",
          script,
          host,
          remote_args
        );
        return;
      }
    }
    ns.killall(host);
    ns.exec(script, host, threads, ...remote_args);
  }
}

export function weaken_hosts_run_remote(
  ns: NS,
  target_thread_count: number,
  runners: Map<string, Server>,
  targets: Map<string, Server>
): string[] {
  const script = "weaken_hosts.js";
  const run_on = candidate_runners(ns, script, target_thread_count, runners);

  var weaken_effect = 0;
  for (const [_, threads] of run_on) {
    weaken_effect += ns.weakenAnalyze(threads);
  }

  var target_host_args: (string | number | boolean)[] = [];
  for (const [target_host, server] of targets) {
    if (
      !server.hasAdminRights ||
      server.purchasedByPlayer ||
      ns.getWeakenTime(target_host) > 5 * 60 * 1000 /* 5 minutes */ ||
      server.minDifficulty === undefined ||
      server.hackDifficulty === undefined ||
      server.hackDifficulty - weaken_effect < server.minDifficulty
    ) {
      continue;
    }
    target_host_args = target_host_args.concat(["--host", target_host]);
  }

  if (target_host_args.length === 0) {
    return [];
  }

  run_on_remotes(ns, script, run_on, target_host_args);

  return Array(...run_on.keys());
}

export function grow_hosts_run_remote(
  ns: NS,
  target_thread_count: number,
  runners: Map<string, Server>,
  targets: Map<string, Server>
): string[] {
  const script = "grow_hosts.js";
  const run_on = candidate_runners(ns, script, target_thread_count, runners);

  var target_host_args: (string | number | boolean)[] = [];
  for (const [target_host, server] of targets) {
    var grow_effect = 1;
    for (const [_, threads] of run_on) {
      grow_effect *= 1 + growth_for_n_threads(ns, target_host, threads);
    }
    if (
      !server.hasAdminRights ||
      server.purchasedByPlayer ||
      ns.getGrowTime(target_host) > 5 * 60 * 1000 /* 5 minutes */ ||
      server.moneyAvailable === undefined ||
      server.moneyMax === undefined ||
      server.moneyAvailable * grow_effect > server.moneyMax
    ) {
      continue;
    }
    target_host_args = target_host_args.concat(["--host", target_host]);
  }

  if (target_host_args.length === 0) {
    return [];
  }

  run_on_remotes(ns, script, run_on, target_host_args);

  return Array(...run_on.keys());
}

export function hack_hosts_run_remote(
  ns: NS,
  target_thread_count: number,
  runners: Map<string, Server>,
  targets: Map<string, Server>
): string[] {
  const script = "hack_hosts.js";
  const run_on = candidate_runners(ns, script, target_thread_count, runners);

  var total_threads = 0;
  for (const t of run_on.values()) {
    total_threads += t;
  }

  var target_host_args: (string | number | boolean)[] = [];
  for (const [target_host, server] of targets) {
    const hack_effect =
      total_threads *
      ns.hackAnalyze(target_host) *
      ns.hackAnalyzeChance(target_host);
    if (
      !server.hasAdminRights ||
      server.purchasedByPlayer ||
      ns.getHackTime(target_host) > 5 * 60 * 1000 /* 5 minutes */ ||
      server.moneyAvailable === undefined ||
      server.moneyMax === undefined ||
      server.moneyAvailable <= 1 ||
      server.moneyAvailable * (1 - hack_effect) <= 0.9 * server.moneyMax
    ) {
      continue;
    }
    target_host_args = target_host_args.concat(["--host", target_host]);
  }

  if (target_host_args.length === 0) {
    return [];
  }

  run_on_remotes(ns, script, run_on, target_host_args);

  return Array(...run_on.keys());
}
