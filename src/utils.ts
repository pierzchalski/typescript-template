import { NS, Server as NsServer } from "@ns";

export interface Server extends NsServer {
  path: string[];
  moneyFraction?: number;
  remainingSecurity?: number;
}

export function array_equals<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (var i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
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

export interface TargetKinds<T> {
  weaken: T;
  grow: T;
  hack: T;
}

export function default_target_kinds<T>(value: T): TargetKinds<T> {
  return { weaken: value, grow: value, hack: value };
}

export function default_target_arrays<T>(): TargetKinds<T[]> {
  return { weaken: [], grow: [], hack: [] };
}

export interface TargetNumbers extends TargetKinds<number> {}

function target_ratios_denominator(target_ratios: TargetNumbers): number {
  return target_ratios.weaken + target_ratios.grow + target_ratios.hack;
}

export function weaken_frac(target_ratios: TargetNumbers): number {
  return target_ratios.weaken / target_ratios_denominator(target_ratios);
}

export function grow_frac(target_ratios: TargetNumbers): number {
  return target_ratios.grow / target_ratios_denominator(target_ratios);
}

export function hack_frac(target_ratios: TargetNumbers): number {
  return target_ratios.hack / target_ratios_denominator(target_ratios);
}

export function copy_target_kinds<T>(
  target_kinds: TargetKinds<T>
): TargetKinds<T> {
  return {
    weaken: target_kinds.weaken,
    grow: target_kinds.grow,
    hack: target_kinds.hack,
  };
}

export interface TargetHosts extends TargetKinds<string[]> {}

export function parse_target_hosts(
  ns: NS,
  filename: string = "target_hosts.txt"
): TargetHosts {
  const contents = ns.read(filename);
  const result = JSON.parse(contents);
  logf(ns, "Parsed %s: %j", filename, result);
  return result;
}

export function parse_target_ratios(
  ns: NS,
  filename: string = "target_ratios.txt"
): TargetNumbers {
  const contents = ns.read(filename);
  const result = JSON.parse(contents);
  logf(ns, "Parsed %s: %j", filename, result);
  return result;
}

export function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = array[i];
    array[i] = array[j];
    array[j] = t;
  }
}

export function shuffled<T>(array: T[]): T[] {
  const result = array.slice();
  shuffle(result);
  return result;
}

export function take_random<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * array.length);
  return array.splice(index, 1)[0];
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
  var server_ram = ns.getServer(host).maxRam;
  if (server_ram === 0) {
    return 0;
  }
  if (host === "home") {
    server_ram = 0.9 * server_ram;
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

function valid_runner(ns: NS, server: Server): boolean {
  return server.hasAdminRights && server.maxRam > 0;
}

function valid_weaken_target(ns: NS, server: Server): boolean {
  return (
    server.hasAdminRights &&
    !server.purchasedByPlayer &&
    ns.getWeakenTime(server.hostname) <= 5 * 60 * 1000 /* 5 minutes */ &&
    server.minDifficulty !== undefined &&
    server.hackDifficulty !== undefined &&
    server.hackDifficulty > server.minDifficulty
  );
}

function valid_grow_target(ns: NS, server: Server): boolean {
  return (
    server.hasAdminRights &&
    !server.purchasedByPlayer &&
    ns.getGrowTime(server.hostname) <= 5 * 60 * 1000 /* 5 minutes */ &&
    server.moneyAvailable !== undefined &&
    server.moneyMax !== undefined &&
    server.moneyMax > 0 &&
    server.moneyAvailable < server.moneyMax
  );
}

function valid_hack_target(ns: NS, server: Server): boolean {
  return (
    server.hasAdminRights &&
    !server.purchasedByPlayer &&
    ns.getHackTime(server.hostname) <= 5 * 60 * 1000 /* 5 minutes */ &&
    ns.hackAnalyzeChance(server.hostname) > 0.5 &&
    server.moneyAvailable !== undefined &&
    server.moneyMax !== undefined &&
    server.moneyMax > 0 &&
    server.moneyAvailable > 0.95 * server.moneyMax
  );
}

export function allocate_targets(
  ns: NS,
  servers: Map<string, Server>
): TargetHosts {
  const result = default_target_arrays<string>();
  for (const [host, server] of servers) {
    if (valid_weaken_target(ns, server)) {
      result.weaken.push(host);
    }
    if (valid_grow_target(ns, server)) {
      result.grow.push(host);
    }
    if (valid_hack_target(ns, server)) {
      result.hack.push(host);
    }
  }
  return result;
}

export function allocate_runners(
  ns: NS,
  servers: Map<string, Server>,
  target_ratios: TargetNumbers
): TargetHosts {
  const runner_hosts = new Array<string>();
  var total_memory = 0;
  for (const [host, server] of servers) {
    if (valid_runner(ns, server)) {
      runner_hosts.push(host);
      total_memory += server.maxRam;
    }
  }

  const target_memory_allocations = default_target_kinds(0);
  target_memory_allocations.weaken = weaken_frac(target_ratios) * total_memory;
  target_memory_allocations.grow = grow_frac(target_ratios) * total_memory;
  target_memory_allocations.hack = hack_frac(target_ratios) * total_memory;

  const actual_memory_allocations = default_target_kinds(0);
  const result = default_target_arrays<string>();

  runner_hosts.sort((a, b) => {
    const server_a = servers.get(a) as Server;
    const server_b = servers.get(b) as Server;
    return server_b.maxRam - server_a.maxRam;
  });

  for (const host of runner_hosts) {
    const server = servers.get(host) as Server;
    const post_allocation_distance = default_target_kinds(0);
    post_allocation_distance.weaken =
      Math.log(actual_memory_allocations.weaken + server.maxRam) -
      Math.log(target_memory_allocations.weaken);
    post_allocation_distance.grow =
      Math.log(actual_memory_allocations.grow + server.maxRam) -
      Math.log(target_memory_allocations.grow);
    post_allocation_distance.hack =
      Math.log(actual_memory_allocations.hack + server.maxRam) -
      Math.log(target_memory_allocations.hack);
    const min_distance = Math.min(
      post_allocation_distance.weaken,
      post_allocation_distance.grow,
      post_allocation_distance.hack
    );
    if (min_distance === post_allocation_distance.weaken) {
      actual_memory_allocations.weaken += server.maxRam;
      result.weaken.push(host);
    } else if (min_distance === post_allocation_distance.grow) {
      actual_memory_allocations.grow += server.maxRam;
      result.grow.push(host);
    } else {
      actual_memory_allocations.hack += server.maxRam;
      result.hack.push(host);
    }
  }
  const allocation_distance = default_target_kinds(0);
  allocation_distance.weaken =
    Math.log(actual_memory_allocations.weaken + 1) -
    Math.log(target_memory_allocations.weaken + 1);
  allocation_distance.grow =
    Math.log(actual_memory_allocations.grow + 1) -
    Math.log(target_memory_allocations.grow + 1);
  allocation_distance.hack =
    Math.log(actual_memory_allocations.hack + 1) -
    Math.log(target_memory_allocations.hack + 1);
  tlogf(ns, "target_memory_allocations: %j", target_memory_allocations);
  tlogf(ns, "actual_memory_allocations: %j", actual_memory_allocations);
  tlogf(ns, "allocation_distance: %j", allocation_distance);

  return result;
}

export function run_on_remote(
  ns: NS,
  host: string,
  script: string,
  args: (string | number | boolean)[]
): void {
  ns.scp(["utils.js", script], host);
  const threads = max_script_threads(ns, host, script);
  const remote_args = args.concat(["--threads", threads]);
  for (const proc of ns.ps(host)) {
    if (proc.filename === script) {
      if (array_equals(proc.args, remote_args)) {
        logf(
          ns,
          "%s@%s is already running with args %j",
          script,
          host,
          remote_args
        );
        return;
      }
      ns.kill(proc.pid);
    }
  }
  ns.exec(script, host, threads, ...remote_args);
}

export function run_targets_on_remotes(
  ns: NS,
  runners: TargetHosts,
  targets: TargetHosts
): void {
  const json = JSON.stringify(targets);
  ns.write("target_hosts.txt", json, "w");

  const mode_file_tmp = "mode_tmp.txt";
  const mode_file = "mode.txt";

  for (const host of runners.weaken) {
    ns.write(mode_file_tmp, "weaken", "w");
    ns.scp([mode_file_tmp, "target_hosts.txt"], host);
    ns.mv(host, mode_file_tmp, mode_file);
    run_on_remote(ns, host, "on_remote.js", []);
  }

  for (const host of runners.grow) {
    ns.write(mode_file_tmp, "grow", "w");
    ns.scp([mode_file_tmp, "target_hosts.txt"], host);
    ns.mv(host, mode_file_tmp, mode_file);
    run_on_remote(ns, host, "on_remote.js", []);
  }

  for (const host of runners.hack) {
    ns.write(mode_file_tmp, "hack", "w");
    ns.scp([mode_file_tmp, "target_hosts.txt"], host);
    ns.mv(host, mode_file_tmp, mode_file);
    run_on_remote(ns, host, "on_remote.js", []);
  }
}
