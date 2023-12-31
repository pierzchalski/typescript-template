import { NS } from "@ns";
import { get_hosts, analyze_host } from "./utils";

export async function main(ns: NS): Promise<void> {
  const hosts = get_hosts(ns, 1);
  ns.tprint(hosts);
  for (const [host, server] of hosts) {
    ns.tprint(server);
    analyze_host(ns, host);
  }
}
