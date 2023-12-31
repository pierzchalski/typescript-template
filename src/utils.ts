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
