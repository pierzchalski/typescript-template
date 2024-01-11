import { NS, Server as NsServer } from "@ns";
import { Config } from "./config";

export interface Server extends NsServer {
  path: string[];
  moneyFraction?: number;
  remainingSecurity?: number;
  weakenTimeSeconds: number;
  growTimeSeconds: number;
  hackTimeSeconds: number;
}

export interface StockPosition {
  long: number;
  long_avg_price: number;
  short: number;
  short_avg_price: number;
  total_position: number;
  max_position: number;
}

export interface StockInfo {
  symbol: string;
  score: number;
  volatility: number;
  forecast: number;
  average_change: number;
  bid: number;
  ask: number;
  spread: number;
  spread_frac: number;
  expected_spread_duraton: number;
  mid: number;
  position: StockPosition;
}

export interface StockPositionLimits {
  max_position_value: number;
  max_order_value: number;
  min_order_value: number;
}

export interface StockOrderLimits {
  max_order_size: number;
  min_order_size: number;
}

export function parse_stock_position_limits(
  ns: NS,
  filename: string = "stock_position_limits.txt"
): StockPositionLimits {
  const contents = ns.read(filename);
  const result = JSON.parse(contents);
  logf(ns, "Parsed %s: %j", filename, result);
  return result;
}

function get_stock_position(ns: NS, symbol: string): StockPosition {
  const [long, long_avg_price, short, short_avg_price] =
    ns.stock.getPosition(symbol);
  return {
    long,
    long_avg_price,
    short,
    short_avg_price,
    total_position: long + short,
    max_position: ns.stock.getMaxShares(symbol),
  };
}

export function get_stock_info(ns: NS): StockInfo[] {
  const result: StockInfo[] = [];
  for (const symbol of ns.stock.getSymbols()) {
    const bid = ns.stock.getBidPrice(symbol);
    const ask = ns.stock.getAskPrice(symbol);
    const mid = (bid + ask) / 2;
    const spread = ask - bid;
    const spread_frac = spread / mid;
    const forecast = ns.stock.getForecast(symbol);
    const volatility = ns.stock.getVolatility(symbol);
    const average_change = volatility * (forecast - 0.5);
    const expected_spread_duraton = Math.abs(spread_frac / average_change);

    const score = average_change / expected_spread_duraton;

    result.push({
      symbol,
      volatility,
      forecast,
      average_change,
      bid,
      ask,
      mid,
      spread,
      spread_frac,
      expected_spread_duraton,
      score,
      position: get_stock_position(ns, symbol),
    });
  }
  return result;
}

export function kill_any_other_copies(ns: NS): void {
  for (const proc of ns.ps()) {
    if (proc.filename === ns.getScriptName() && proc.pid !== ns.pid) {
      tlogf(ns, "Killing %s %j (pid %d)", proc.filename, proc.args, proc.pid);
      ns.kill(proc.pid);
    }
  }
}

export async function sleep_and_spawn_self(
  ns: NS,
  sleep_seconds: number
): Promise<void> {
  if (sleep_seconds <= 0) {
    return;
  }
  await ns.sleep(sleep_seconds * 1000);
  ns.spawn(ns.getScriptName(), 1, ...ns.args);
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
  nsServer: NsServer,
  path: string[]
): Server {
  const server: Server = {
    ...nsServer,
    path,
    moneyFraction: undefined,
    remainingSecurity: undefined,
    weakenTimeSeconds: ns.getWeakenTime(nsServer.hostname) / 1000,
    growTimeSeconds: ns.getGrowTime(nsServer.hostname) / 1000,
    hackTimeSeconds: ns.getHackTime(nsServer.hostname) / 1000,
  };

  if (
    nsServer.moneyAvailable !== undefined &&
    nsServer.moneyMax !== undefined &&
    nsServer.moneyMax > 0
  ) {
    server.moneyFraction = nsServer.moneyAvailable / nsServer.moneyMax;
  }
  if (
    nsServer.hackDifficulty !== undefined &&
    nsServer.minDifficulty !== undefined
  ) {
    server.remainingSecurity = nsServer.hackDifficulty - nsServer.minDifficulty;
  }
  return server;
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
  // logf(ns, "Parsed %s: %j", filename, result);
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

export function pick_random<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

export function take_random<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined;
  }
  const index = Math.floor(Math.random() * array.length);
  return array.splice(index, 1)[0];
}

export function get_servers(ns: NS, depth: number = 50): Server[] {
  const starting_server = enhance_server(ns, ns.getServer(), [
    ns.getHostname(),
  ]);
  const paths = get_server_paths(ns, depth);
  const servers = new Map<string, Server>([
    [ns.getHostname(), starting_server],
  ]);
  const scanned = new Set<string>();
  while (depth > 0) {
    for (const host of new Set(servers.keys())) {
      if (!scanned.has(host)) {
        scanned.add(host);
        for (const link of ns.scan(host)) {
          if (servers.has(link)) {
            continue;
          }
          const path = paths.get(link);
          if (path === undefined) {
            throw new Error(`Path for ${link} is undefined.`);
          }
          servers.set(link, enhance_server(ns, ns.getServer(link), path));
        }
      }
    }
    depth--;
  }
  return [...servers.values()];
}

function get_root_hosts(ns: NS, depth: number): string[] {
  const root_hosts = new Array<string>();
  const pending = new Set<string>([ns.getHostname()]);
  const scanned = new Set<string>();
  while (pending.size > 0) {
    for (const host of new Set(pending)) {
      pending.delete(host);
      if (scanned.has(host)) {
        continue;
      }
      scanned.add(host);
      for (const link of ns.scan(host)) {
        if (scanned.has(link)) {
          continue;
        }
        pending.add(link);
      }
    }
  }
  for (const host of scanned) {
    const server = ns.getServer(host);
    if (server.backdoorInstalled || server.purchasedByPlayer) {
      root_hosts.push(host);
    }
  }
  return root_hosts;
}

export function get_server_paths(
  ns: NS,
  depth: number = 50
): Map<string, string[]> {
  const root_hosts = get_root_hosts(ns, depth);
  const host_paths = new Map<string, string[]>();

  for (const root_host of root_hosts) {
    const scanned = new Set<string>();
    const paths_from_root = new Map<string, string[]>();
    if (root_host === ns.getHostname()) {
      paths_from_root.set(root_host, []);
    } else {
      paths_from_root.set(root_host, [root_host]);
    }
    const pending = new Set<string>([root_host]);
    while (pending.size > 0) {
      for (const host of new Set(pending)) {
        pending.delete(host);
        if (scanned.has(host)) {
          continue;
        }
        scanned.add(host);
        const path_from_root = paths_from_root.get(host)!;
        for (const link of ns.scan(host)) {
          const current_path = host_paths.get(link);
          const new_path = path_from_root.concat([link]);
          paths_from_root.set(link, new_path);
          if (
            current_path !== undefined &&
            current_path.length <= new_path.length
          ) {
            continue;
          }
          host_paths.set(link, new_path);

          if (!scanned.has(link)) {
            pending.add(link);
          }
        }
      }
    }
  }
  return host_paths;
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
    server_ram = server_ram - 256;
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

function not_too_slow(server: Server): boolean {
  return (
    server.weakenTimeSeconds <= 10 * 60 &&
    server.growTimeSeconds <= 10 * 60 &&
    server.hackTimeSeconds <= 10 * 60
  );
}

function valid_weaken_target(ns: NS, server: Server): boolean {
  return (
    server.hasAdminRights &&
    !server.purchasedByPlayer &&
    not_too_slow(server) &&
    server.minDifficulty !== undefined &&
    server.hackDifficulty !== undefined &&
    server.hackDifficulty > server.minDifficulty
  );
}

function valid_grow_target(ns: NS, server: Server): boolean {
  return (
    server.hasAdminRights &&
    !server.purchasedByPlayer &&
    not_too_slow(server) &&
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
    not_too_slow(server) &&
    ns.hackAnalyzeChance(server.hostname) > 0.5 &&
    server.moneyAvailable !== undefined &&
    server.moneyMax !== undefined &&
    server.moneyMax > 0 &&
    server.moneyAvailable > 0.95 * server.moneyMax
  );
}

export function allocate_targets(ns: NS, servers: Server[]): TargetHosts {
  const result = default_target_arrays<string>();
  for (const server of servers) {
    if (valid_weaken_target(ns, server)) {
      result.weaken.push(server.hostname);
    }
    if (valid_grow_target(ns, server)) {
      result.grow.push(server.hostname);
    }
    if (valid_hack_target(ns, server)) {
      result.hack.push(server.hostname);
    }
  }
  return result;
}

export function allocate_runners(
  ns: NS,
  servers: Server[],
  target_ratios: TargetNumbers
): TargetHosts {
  const runners = new Array<Server>();
  var total_memory = 0;
  for (const server of servers) {
    if (valid_runner(ns, server)) {
      runners.push(server);
      total_memory += server.maxRam;
    }
  }

  const target_memory_allocations = default_target_kinds(0);
  target_memory_allocations.weaken = weaken_frac(target_ratios) * total_memory;
  target_memory_allocations.grow = grow_frac(target_ratios) * total_memory;
  target_memory_allocations.hack = hack_frac(target_ratios) * total_memory;

  const actual_memory_allocations = default_target_kinds(0);
  const result = default_target_arrays<string>();

  runners.sort((a, b) => {
    return b.maxRam - a.maxRam;
  });

  for (const runner of runners) {
    const post_allocation_distance = default_target_kinds(0);
    post_allocation_distance.weaken =
      Math.log(actual_memory_allocations.weaken + runner.maxRam) -
      Math.log(target_memory_allocations.weaken);
    post_allocation_distance.grow =
      Math.log(actual_memory_allocations.grow + runner.maxRam) -
      Math.log(target_memory_allocations.grow);
    post_allocation_distance.hack =
      Math.log(actual_memory_allocations.hack + runner.maxRam) -
      Math.log(target_memory_allocations.hack);
    const min_distance = Math.min(
      post_allocation_distance.weaken,
      post_allocation_distance.grow,
      post_allocation_distance.hack
    );
    if (min_distance === post_allocation_distance.weaken) {
      actual_memory_allocations.weaken += runner.maxRam;
      result.weaken.push(runner.hostname);
    } else if (min_distance === post_allocation_distance.grow) {
      actual_memory_allocations.grow += runner.maxRam;
      result.grow.push(runner.hostname);
    } else {
      actual_memory_allocations.hack += runner.maxRam;
      result.hack.push(runner.hostname);
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
  logf(ns, "target_memory_allocations: %j", target_memory_allocations);
  logf(ns, "actual_memory_allocations: %j", actual_memory_allocations);
  logf(ns, "allocation_distance: %j", allocation_distance);

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
  if (threads < 1) {
    logf(ns, "Not enough RAM to run %s@%s", script, host);
    return;
  }
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

export function respawn_self_if_source_changed(
  ns: NS,
  old_source: string
): void {
  const new_source = ns.read(ns.getScriptName());
  if (old_source !== new_source) {
    ns.spawn(ns.getScriptName(), {}, ...ns.args);
  }
}

export function available_funds(ns: NS): number {
  const base = ns.getServerMoneyAvailable("home");
  const config_txt = ns.read("config.txt");
  if (config_txt === "") {
    return base;
  }
  const config = JSON.parse(config_txt) as Config;
  return Math.max(base - config.reserve_balance, 0);
}

export function clean_nbsp(s: string): string {
  return s.replace(/&nbsp;/g, " ");
}
