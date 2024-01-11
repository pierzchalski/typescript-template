import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([["target", ""]]);
  const target = flags["target"] as string;
  await ns.hack(target);
}
