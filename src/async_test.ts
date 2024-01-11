import { NS } from "@ns";

async function spawn(
  ns: NS,
  start_time: number,
  sleep_seconds: number
): Promise<void> {
  await ns.asleep(start_time + sleep_seconds * 1000 - Date.now());
  ns.run(
    "async_test.js",
    {},
    "--out-file",
    `${sleep_seconds}.txt`,
    "--start-time",
    start_time
  );
}

export async function main(ns: NS): Promise<void> {
  ns.enableLog("ALL");
  const flags = ns.flags([
    ["out-file", ""],
    ["start-time", Date.now()],
  ]);
  const out_file = flags["out-file"] as string;
  const start_time = flags["start-time"] as number;

  if (out_file !== "") {
    ns.clear(out_file);
    ns.write(out_file, `${(Date.now() - start_time) / 1000}`);
    return;
  }

  const promises = new Array<Promise<void>>();
  for (var i = 0; i < 10; i++) {
    promises.push(spawn(ns, start_time, i));
  }

  await Promise.all(promises);
  ns.tprintf("done!");
}
