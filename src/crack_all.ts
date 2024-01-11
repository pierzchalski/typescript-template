import { NS } from "@ns";
import {
  get_servers,
  kill_any_other_copies,
  sleep_and_spawn_self,
  tlogf,
} from "./utils";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  kill_any_other_copies(ns);

  const flags = ns.flags([["sleep-seconds", 300]]);
  const sleep_seconds = flags["sleep-seconds"] as number;

  const servers = get_servers(ns);
  for (const server of servers) {
    if (
      server.purchasedByPlayer ||
      server.openPortCount === undefined ||
      server.numOpenPortsRequired == undefined
    ) {
      continue;
    }
    const host = server.hostname;
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
  servers.sort((a, b) => {
    return b.hackTimeSeconds - a.hackTimeSeconds;
  });
  for (const server of servers) {
    if (
      server.hasAdminRights &&
      !server.purchasedByPlayer &&
      server.backdoorInstalled !== undefined &&
      !server.backdoorInstalled &&
      server.requiredHackingSkill !== undefined &&
      ns.getHackingLevel() >= server.requiredHackingSkill
    ) {
      tlogf(
        ns,
        "Need to install backdoor on %s (%s seconds, %j)",
        server.hostname,
        ns.formatNumber(server.hackTimeSeconds),
        server.path
      );
    }
  }

  await sleep_and_spawn_self(ns, sleep_seconds);
}
