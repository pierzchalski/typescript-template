import { NS } from "@ns";
import { tlogf } from "./utils";
import { gcd } from "./math";

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

// Array Jumping Game
export function array_jumping_game(ns: NS, max_jumps: number[]): number {
  const result = array_jumping_game_ii(ns, max_jumps);
  if (result === 0) {
    return 0;
  }
  return 1;
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
  if (n === 0) {
    return 1;
  }
  if (ks.length === 0) {
    return 0;
  }
  const k = ks[0];
  const next_ks = ks.slice(1);
  if (n < k) {
    return total_ways_to_sum_ii_helper(ns, n, next_ks, cache);
  }
  if (ks.length === 1) {
    if (n % k === 0) {
      return 1;
    }
    return 0;
  }
  if (n % gcd(...ks) !== 0) {
    return 0;
  }
  if (ks.length === 2 && ks[1] === 1) {
    if (n % k === 0) {
      return n / k + 1;
    }
    return n / k;
  }
  const key = total_ways_to_sum_ii_key(n, ks);
  {
    const result = cache.get(key);
    if (result !== undefined) {
      return result;
    }
  }
  call_count += 1;
  if (call_count > 1000) {
    throw new Error("too many calls");
  }
  var result = 0;
  var next_n = n % k;
  while (next_n <= n) {
    const sub_result = total_ways_to_sum_ii_helper(ns, next_n, next_ks, cache);
    result += sub_result;
    next_n += k;
  }
  tlogf(ns, "n: %d, ks: %j, result: %d", n, ks, result);
  cache.set(key, result);
  return result;
}

// Total Ways to Sum II
export function total_ways_to_sum_ii(ns: NS, data: [number, number[]]): number {
  call_count = 0;
  const [n, ks] = data;
  const cache = new Map<string, number>();
  ks.reverse();
  return total_ways_to_sum_ii_helper(ns, n, ks, cache);
}

// Merge Overlapping Intervals
export function merge_overlapping_intervals(
  ns: NS,
  data: [number, number][]
): [number, number][] {
  data.sort(([a, _], [b, __]) => a - b);
  const result = new Array<[number, number]>();
  for (const [start, end] of data) {
    if (result.length === 0) {
      result.push([start, end]);
    } else {
      const [last_start, last_end] = result[result.length - 1];
      if (start <= last_end) {
        result[result.length - 1] = [last_start, Math.max(last_end, end)];
      } else {
        result.push([start, end]);
      }
    }
  }
  return result;
}

// Generate IP Addresses
export function generate_ip_addresses(ns: NS, data: string): string[] {
  const result = new Array<string>();
  for (var a = 1; a < 4; a += 1) {
    for (var b = 1; b < 4; b += 1) {
      for (var c = 1; c < 4; c += 1) {
        for (var d = 1; d < 4; d += 1) {
          if (a + b + c + d !== data.length) {
            continue;
          }
          const ip = `${data.slice(0, a)}.${data.slice(a, a + b)}.${data.slice(
            a + b,
            a + b + c
          )}.${data.slice(a + b + c)}`;
          if (
            ip
              .split(".")
              .every(
                (n) =>
                  parseInt(n) < 256 &&
                  n.length === parseInt(n).toString().length
              )
          ) {
            result.push(ip);
          }
        }
      }
    }
  }
  return result;
}

// Encryption I: Caesar Cipher
export function encryption_i_caesar_cipher(
  ns: NS,
  data: [string, number]
): string {
  const [message, shift] = data;
  ns.printf("message: %s\n", message);
  var result = "";
  for (var i = 0; i < message.length; i += 1) {
    if (message[i] === " ") {
      result += " ";
      continue;
    }
    const message_char = message.charCodeAt(i) - "A".charCodeAt(0);
    const result_char = (message_char + 26 - shift) % 26;
    result += String.fromCharCode(result_char + "A".charCodeAt(0));
  }
  return result;
}
