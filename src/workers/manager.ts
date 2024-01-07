import { NS } from "@ns";
import { Server } from "/utils";

export async function main(ns: NS): Promise<void> {}

function valid_runner(server: Server): boolean {
  return server.hasAdminRights && server.maxRam > 0;
}

function valid_weaken_target(target: Server): boolean {
  return (
    target.hasAdminRights &&
    !target.purchasedByPlayer &&
    target.minDifficulty !== undefined &&
    target.hackDifficulty !== undefined &&
    target.hackDifficulty > target.minDifficulty
  );
}

function valid_grow_target(target: Server): boolean {
  return (
    target.hasAdminRights &&
    !target.purchasedByPlayer &&
    target.moneyMax !== undefined &&
    target.moneyMax > 0 &&
    target.moneyAvailable !== undefined &&
    target.moneyAvailable < target.moneyMax
  );
}

function valid_hack_target(target: Server): boolean {
  return (
    target.hasAdminRights &&
    !target.purchasedByPlayer &&
    target.moneyMax !== undefined &&
    target.moneyMax > 0 &&
    target.moneyAvailable !== undefined &&
    target.moneyAvailable > 0
  );
}
