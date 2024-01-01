import { NS, Server as NsServer } from "@ns";

export interface Server extends NsServer {
  path: string[];
  moneyFraction?: number;
  remainingSecurity?: number;
}

export function enhance_server(
  ns: NS,
  server: NsServer,
  path: string[]
): Server {
  var moneyFraction: number | undefined;
  if (
    server.moneyAvailable !== undefined &&
    server.moneyMax !== undefined &&
    server.moneyMax > 0
  ) {
    moneyFraction = server.moneyAvailable / server.moneyMax;
  }
  var remainingSecurity: number | undefined;
  if (
    server.hackDifficulty !== undefined &&
    server.minDifficulty !== undefined
  ) {
    remainingSecurity = server.hackDifficulty - server.minDifficulty;
  }
  return { ...server, path, moneyFraction, remainingSecurity };
}

export function get_hosts(ns: NS, depth: number = 1): Map<string, Server> {
  const starting_server = enhance_server(ns, ns.getServer(), [
    ns.getHostname(),
  ]);
  const paths = get_host_paths(ns, depth);
  const hosts = new Map<string, Server>([[ns.getHostname(), starting_server]]);
  const scanned = new Set<string>();
  while (depth > 0) {
    for (const host of new Set(hosts.keys())) {
      if (!scanned.has(host)) {
        scanned.add(host);
        for (const link of ns.scan(host)) {
          if (hosts.has(link)) {
            continue;
          }
          const path = paths.get(link);
          if (path === undefined) {
            throw new Error(`Path for ${link} is undefined.`);
          }
          hosts.set(link, enhance_server(ns, ns.getServer(link), path));
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
export async function growth_for_n_threads(
  ns: NS,
  host: string,
  threads: number = 1
): Promise<number> {
  let lo = 1;
  let hi = 1000;
  var mid = 0;
  for (var iter = 0; iter < 50 && lo < hi; iter += 1) {
    const new_mid = (lo + hi) / 2;
    if (Math.abs(mid - new_mid) < 0.0001) {
      break;
    }
    mid = new_mid;
    if (ns.growthAnalyze(host, mid) <= threads) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return mid;
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
    return 0;
  }
  const threads = Math.floor(server_ram / script_ram);
  return threads;
}

export function tlogf(ns: NS, fmt: string, ...args: any[]): void {
  ns.tprintf(`${ns.getScriptName()}@${ns.getHostname()}: ${fmt}`, ...args);
}

export function logf(ns: NS, fmt: string, ...args: any[]): void {
  ns.printf(`${ns.getScriptName()}@${ns.getHostname()}: ${fmt}`, ...args);
}

export function candidate_runners(
  ns: NS,
  script: string,
  target_thread_count: number,
  servers: Map<string, Server>
): Map<string, number> {
  const run_on = new Map<string, number>();
  for (const [host, server] of servers) {
    if (target_thread_count <= 0) {
      break;
    }
    if (!server.hasAdminRights || server.hostname == ns.getHostname()) {
      continue;
    }
    const threads = max_script_threads(ns, host, script);
    if (threads > 0) {
      run_on.set(host, threads);
    }
    target_thread_count -= threads;
  }
  tlogf(ns, "%s: candidate runners: %j", script, Array(...run_on));
  return run_on;
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

export async function grow_hosts_run_remote(
  ns: NS,
  target_thread_count: number,
  runners: Map<string, Server>,
  targets: Map<string, Server>
): Promise<string[]> {
  const script = "grow_hosts.js";
  const run_on = candidate_runners(ns, script, target_thread_count, runners);

  var target_host_args: (string | number | boolean)[] = [];
  for (const [target_host, server] of targets) {
    if (
      !server.hasAdminRights ||
      server.purchasedByPlayer ||
      ns.getGrowTime(target_host) > 5 * 60 * 1000 /* 5 minutes */ ||
      server.moneyAvailable === undefined ||
      server.moneyMax === undefined ||
      server.moneyMax <= 1 ||
      server.moneyAvailable >= 0.99 * server.moneyMax
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
    const hack_chance = ns.hackAnalyzeChance(target_host);
    if (
      !server.hasAdminRights ||
      server.purchasedByPlayer ||
      ns.getHackTime(target_host) > 5 * 60 * 1000 /* 5 minutes */ ||
      server.moneyAvailable === undefined ||
      server.moneyMax === undefined ||
      server.moneyAvailable <= 1 ||
      hack_chance <= 0.1 ||
      server.moneyAvailable <= 0.95 * server.moneyMax
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
