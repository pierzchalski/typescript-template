import { NS } from "@ns";
import { get_host_paths, get_hosts, tlogf } from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const paths = get_host_paths(ns, 10);
  const servers = get_hosts(ns, 10);
  for (const [host, server] of servers) {
    if (
      server.hasAdminRights &&
      !server.purchasedByPlayer &&
      server.backdoorInstalled !== undefined &&
      !server.backdoorInstalled &&
      server.requiredHackingSkill !== undefined &&
      ns.getHackingLevel() >= server.requiredHackingSkill
    ) {
      tlogf(ns, "Need to install backdoor on %s (%j)", host, paths.get(host));
    }
    if (
      server.purchasedByPlayer ||
      server.openPortCount === undefined ||
      server.numOpenPortsRequired == undefined
    ) {
      continue;
    }
    if (!server.ftpPortOpen && ns.fileExists("FTPCrack.exe")) {
      ns.ftpcrack(host);
    }
    if (!server.sshPortOpen && ns.fileExists("BruteSSH.exe")) {
      ns.brutessh(host);
    }
    if (!server.httpPortOpen && ns.fileExists("HTTPWorm.exe")) {
      ns.httpworm(host);
    }
    if (!server.smtpPortOpen && ns.fileExists("relaySMTP.exe")) {
      ns.relaysmtp(host);
    }
    if (!server.sqlPortOpen && ns.fileExists("SQLInject.exe")) {
      ns.sqlinject(host);
    }
    if (
      !server.hasAdminRights &&
      server.openPortCount >= server.numOpenPortsRequired
    ) {
      ns.nuke(host);
    }
  }
}
