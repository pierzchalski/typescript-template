import { NS } from "@ns";
import { tlogf } from "./utils";

/**
 *
 * @param n
 * @param k
 * @param cache
 * @returns number of ways to partition n into exactly k parts
 */
function partition(
  ns: NS,
  n: number,
  k: number,
  cache: Map<string, number>
): number {
  const key = `${n},${k}`;
  {
    const result = cache.get(key);
    if (result !== undefined) {
      return result;
    }
  }
  if (k <= 0) {
    return 0;
  }
  if (k === 1) {
    return 1;
  }
  if (k === n) {
    return 1;
  }
  if (k > n) {
    return 0;
  }
  const result =
    partition(ns, n - 1, k - 1, cache) + partition(ns, n - k, k, cache);
  cache.set(key, result);
  return result;
}

export function total_ways_to_sum(ns: NS, n: number): number {
  const cache = new Map<string, number>();
  var result = 0;
  for (var k = 1; k <= n; k += 1) {
    result += partition(ns, n, k, cache);
  }
  return result - 1;
}

function valid_graph(coloring: number, edges: [number, number][]): boolean {
  for (const [a, b] of edges) {
    if (((coloring >> a) & 1) === ((coloring >> b) & 1)) {
      return false;
    }
  }
  return true;
}

// Proper 2-Coloring of a Graph
export function proper_2_coloring_of_a_graph(
  ns: NS,
  graph: [number, [number, number][]]
): number[] {
  const [num_nodes, edges] = graph;
  for (var coloring = 0; coloring < 1 << num_nodes; coloring += 1) {
    if (valid_graph(coloring, edges)) {
      const result = new Array<number>();
      for (var i = 0; i < num_nodes; i += 1) {
        result.push((coloring >> i) & 1);
      }
      return result;
    }
  }
  return [];
}

// Encryption II: Vigenère Cipher
export function encryption_ii_vigenere_cipher(
  ns: NS,
  data: [string, string]
): string {
  const [message, key] = data;
  const result = new Array<string>();
  for (var i = 0; i < message.length; i += 1) {
    const key_char = key.charCodeAt(i % key.length) - "A".charCodeAt(0);
    const message_char = message.charCodeAt(i) - "A".charCodeAt(0);
    const result_char = (message_char + key_char) % 26;
    result.push(String.fromCharCode(result_char + "A".charCodeAt(0)));
  }
  return result.join("");
}

// Algorithmic Stock Trader II
export function algorithmic_stock_trader_ii(ns: NS, prices: number[]): number {
  var total_profit = 0;
  // Get sum of increasing subsequences.
  for (var i = 1; i < prices.length; i += 1) {
    if (prices[i] > prices[i - 1]) {
      total_profit += prices[i] - prices[i - 1];
    }
  }
  return total_profit;
}

// Array Jumping Game II
export function array_jumping_game_ii(ns: NS, max_jumps: number[]): number {
  const spots = max_jumps.length;
  const min_jumps_from = new Array<number>(spots).fill(Infinity);
  min_jumps_from[spots - 1] = 0;
  for (var i = spots - 2; i >= 0; i -= 1) {
    for (var j = 1; j <= max_jumps[i] && i + j < spots; j += 1) {
      min_jumps_from[i] = Math.min(
        min_jumps_from[i],
        min_jumps_from[i + j] + 1
      );
    }
  }
  if (min_jumps_from[0] === Infinity) {
    return 0;
  }
  return min_jumps_from[0];
}

function total_ways_to_sum_ii_key(n: number, ks: number[]): string {
  return `${n},[${ks.join(",")}]`;
}

var call_count = 0;

function total_ways_to_sum_ii_helper(
  ns: NS,
  n: number,
  ks: number[],
  cache: Map<string, number>
): number {
  if (ks.length === 0) {
    return 0;
  }
  if (n === 0) {
    return 1;
  }
  const k = ks[ks.length - 1];
  if (ks.length === 1) {
    if (n % k === 0) {
      return 1;
    }
    return 0;
  }
  call_count += 1;
  if (call_count > 1000) {
    throw new Error("too many calls");
  }
  const next_ks = ks.slice(0, -1);
  var result = 0;
  var next_n = n;
  while (next_n >= 0) {
    const sub_result = total_ways_to_sum_ii_helper(ns, next_n, next_ks, cache);
    // tlogf(
    //   ns,
    //   "next_n: %d, next_ks: %j, sub_result: %d",
    //   next_n,
    //   next_ks,
    //   sub_result
    // );

    result += sub_result;
    next_n -= k;
  }
  tlogf(ns, "n: %d, ks: %j, result: %d", n, ks, result);
  return result;
}

// Total Ways to Sum II
export function total_ways_to_sum_ii(ns: NS, data: [number, number[]]): number {
  call_count = 0;
  const [n, ks] = data;
  const cache = new Map<string, number>();
  return total_ways_to_sum_ii_helper(ns, n, ks, cache);
}
