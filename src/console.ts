import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const console = document.querySelector(
    "input,#terminal-input"
  ) as HTMLInputElement | null;
  if (console === null) {
    throw new Error("console not found");
  }
  await ns.sleep(500);
  console.value = "helo world";
  await ns.sleep(500);
  console.form?.dispatchEvent(new KeyboardEvent("submit"));
  await ns.sleep(500);
}
