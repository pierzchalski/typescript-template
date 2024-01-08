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

// Algorithmic Stock Trader III
export function algorithmic_stock_trader_iii(ns: NS, prices: number[]): number {
  var max_profit = 0;
  var iter = 0;
  // ns.tprintf("prices: %j (len: %d)", prices, prices.length);
  for (var b0 = 0; b0 < prices.length; b0 += 1) {
    for (var s0 = b0 + 1; s0 < prices.length; s0 += 1) {
      const first_trans_profit = prices[s0] - prices[b0];
      if (first_trans_profit <= 0) {
        continue;
      }
      if (first_trans_profit > max_profit) {
        // ns.tprintf("[%d, %d], profit: %d", b0, s0, first_trans_profit);
        max_profit = first_trans_profit;
      }
      for (var b1 = s0 + 1; b1 < prices.length; b1 += 1) {
        for (var s1 = b1 + 1; s1 < prices.length; s1 += 1) {
          const second_trans_profit = prices[s1] - prices[b1];
          if (second_trans_profit <= 0) {
            continue;
          }
          iter += 1;
          if (iter > 100000) {
            throw new Error("too many iterations");
          }
          const profit = first_trans_profit + second_trans_profit;
          if (profit > max_profit) {
            // ns.tprintf(
            //   "[%d, %d], [%d, %d], profit: %d",
            //   b0,
            //   s0,
            //   b1,
            //   s1,
            //   profit
            // );
            max_profit = profit;
          }
        }
      }
    }
  }
  return max_profit;
}

// Find Largest Prime Factor
export function find_largest_prime_factor(ns: NS, n: number): number {
  var result = 1;
  for (var i = 2; i <= n; i += 1) {
    if (n % i === 0) {
      result = i;
      while (n % i === 0) {
        n /= i;
      }
    }
  }
  return result;
}

// Unique Paths in a Grid I
export function unique_paths_in_a_grid_i(
  ns: NS,
  grid_size: [number, number]
): number {
  const [rows, cols] = grid_size;
  const dp = new Array<number>(cols).fill(1);
  for (var row = 1; row < rows; row += 1) {
    for (var col = 1; col < cols; col += 1) {
      dp[col] += dp[col - 1];
    }
  }
  return dp[cols - 1];
}

// HammingCodes: Integer to Encoded Binary
export function hammingcodes_integer_to_encoded_binary(
  ns: NS,
  data: number
): string {
  var result = "";
  return result;
}

function valid_parens(input: string): boolean {
  var depth = 0;
  for (const c of input) {
    if (c === "(") {
      depth += 1;
    } else if (c === ")") {
      depth -= 1;
    }
    if (depth < 0) {
      return false;
    }
  }
  return depth === 0;
}

function trim_parens(mask: number, input: string): string {
  var result = "";
  var paren_idx = 0;
  for (const c of input) {
    if (c !== "(" && c !== ")") {
      result += c;
      continue;
    }
    if (((mask >> paren_idx) & 1) === 0) {
      result += c;
    }
    paren_idx += 1;
  }
  return result;
}

function count_parens(input: string): number {
  var result = 0;
  for (const c of input) {
    if (c === "(" || c === ")") {
      result += 1;
    }
  }
  return result;
}

function mask_pop_count(mask: number): number {
  var result = 0;
  while (mask > 0) {
    result += mask & 1;
    mask >>= 1;
  }
  return result;
}

function number_as_binary(mask: number, length: number): string {
  var result = "";
  for (var i = 0; i < length; i += 1) {
    result += ((mask >> i) & 1) === 1 ? "1" : "0";
  }
  return result;
}

// Sanitize Parentheses in Expression
export async function sanitize_parentheses_in_expression(
  ns: NS,
  data: string
): Promise<string[]> {
  var results: string[] = [];
  const num_parens = count_parens(data);
  var min_pop_count = Infinity;
  for (var mask = 0; mask < 1 << num_parens; mask += 1) {
    // await ns.sleep(1);
    const pop_count = mask_pop_count(mask);
    // ns.tprintf(
    //   "mask: %s, pop count: %d",
    //   number_as_binary(mask, num_parens),
    //   pop_count
    // );
    if (pop_count > min_pop_count) {
      continue;
    }
    const trimmed = trim_parens(mask, data);
    // ns.tprintf("trimmed: %s (valid: %t)", trimmed, valid_parens(trimmed));
    if (!valid_parens(trimmed)) {
      continue;
    }
    if (pop_count < min_pop_count) {
      results = [];
      min_pop_count = pop_count;
    }
    if (results.find((s) => s === trimmed) !== undefined) {
      continue;
    }
    results.push(trimmed);
  }
  return results;
}

// Subarray with Maximum Sum
export function subarray_with_maximum_sum(ns: NS, data: number[]): number {
  var result = 0;
  for (var i = 0; i < data.length; i += 1) {
    var sum = 0;
    for (var j = i; j < data.length; j += 1) {
      sum += data[j];
      result = Math.max(result, sum);
    }
  }
  return result;
}

function decompress_chunk_type_1(
  ns: NS,
  compressed: [string],
  decompressed: [string]
): void {
  const input = compressed[0];
  if (input.length === 0) {
    return;
  }
  const length = parseInt(input[0]);
  if (length === 0) {
    compressed[0] = input.slice(1);
    return;
  }
  decompressed[0] += input.slice(1, 1 + length);
  compressed[0] = input.slice(1 + length);
}

function decompress_chunk_type_2(
  ns: NS,
  compressed: [string],
  decompressed: [string]
): void {
  const input = compressed[0];
  if (input.length === 0) {
    return;
  }
  const length = parseInt(input[0]);
  if (length === 0) {
    compressed[0] = input.slice(1);
    return;
  }
  const offset = parseInt(input[1]);
  for (var i = 0; i < length; i += 1) {
    const output = decompressed[0];
    decompressed[0] += output[output.length - offset];
  }
  compressed[0] = input.slice(2);
}

// Compression II: LZ Decompression
export function compression_ii_lz_decompression(ns: NS, data: string): string {
  const compressed: [string] = [data];
  const decompressed: [string] = [""];

  while (compressed[0].length > 0) {
    // ns.tprintf(
    //   "pre chunk type 1:\n\tcompressed:\t%s\n\tdecompressed:\t%s",
    //   compressed[0],
    //   decompressed[0]
    // );
    decompress_chunk_type_1(ns, compressed, decompressed);
    // ns.tprintf(
    //   "post chunk type 1, pre chunk type 2:\n\tcompressed:\t%s\n\tdecompressed:\t%s",
    //   compressed[0],
    //   decompressed[0]
    // );
    decompress_chunk_type_2(ns, compressed, decompressed);
    // ns.tprintf(
    //   "post chunk type 2:\n\tcompressed:\t%s\n\tdecompressed:\t%s",
    //   compressed[0],
    //   decompressed[0]
    // );
  }
  return decompressed[0];
}

interface CompressionState {
  input: string;
  // The index of the first uncompressed byte in `input` (so we're done when `input_idx === input.length`)
  input_idx: number;
  output: string;
}

async function compression_iii_helper(
  ns: NS,
  state: CompressionState
): Promise<string> {
  await ns.sleep(1);
}

// Compression III: LZ Compression
export async function compression_iii_lz_compression(
  ns: NS,
  data: string
): Promise<string> {
  ns.tprintf("data: %s", data);
  const state: CompressionState = {
    input: data,
    input_idx: 0,
    output: "",
  };
  return await compression_iii_helper(ns, state);
}

function mask_to_ops(mask: number, length: number): number[] {
  const result: number[] = [];
  for (var i = 0; i < length; i += 1) {
    result.push((mask >> (2 * i)) & 0b11);
  }
  return result;
}

function render_digits_and_ops(digits: number[], ops: number[]): string {
  var result = `${digits[0]}`;
  for (var i = 0; i < ops.length; i += 1) {
    if (ops[i] === 0) {
      result += `${digits[i + 1]}`;
    } else if (ops[i] === 1) {
      result += `*${digits[i + 1]}`;
    } else if (ops[i] === 2) {
      result += `+${digits[i + 1]}`;
    } else if (ops[i] === 3) {
      result += `-${digits[i + 1]}`;
    }
  }
  return result;
}

function digits_to_digits(n: string): number[] {
  const result: number[] = [];
  for (const c of n) {
    result.push(parseInt(c));
  }
  return result;
}

function max_ops_mask(digits: string): number {
  return (1 << (2 * (digits.length - 1))) - 1;
}

function reduce_expression(
  digits: number[],
  ops: number[]
): number | undefined {
  const post_concat_ops: number[] = [];
  const post_concat_numbers: number[] = [digits[0]];
  // `ops[i]` acts on `digits[i]` and `digits[i + 1]`
  for (var i = 0; i < ops.length; i += 1) {
    if (ops[i] !== 0) {
      post_concat_ops.push(ops[i]);
      post_concat_numbers.push(digits[i + 1]);
      continue;
    }
    const last_number = post_concat_numbers.pop() as number;
    if (last_number === 0) {
      // Can't concat 0 with something else
      return undefined;
    }
    post_concat_numbers.push(last_number * 10 + digits[i + 1]);
  }

  const post_mul_ops: number[] = [];
  const post_mul_numbers: number[] = [post_concat_numbers[0]];

  for (var i = 0; i < post_concat_ops.length; i += 1) {
    if (post_concat_ops[i] !== 1) {
      post_mul_ops.push(post_concat_ops[i]);
      post_mul_numbers.push(post_concat_numbers[i + 1]);
      continue;
    }
    const last_number = post_mul_numbers.pop() as number;
    post_mul_numbers.push(last_number * post_concat_numbers[i + 1]);
  }

  var result = post_mul_numbers[0];
  for (var i = 0; i < post_mul_ops.length; i += 1) {
    if (post_mul_ops[i] === 2) {
      result += post_mul_numbers[i + 1];
    } else if (post_mul_ops[i] === 3) {
      result -= post_mul_numbers[i + 1];
    }
  }

  return result;
}

// Find All Valid Math Expressions
export async function find_all_valid_math_expressions(
  ns: NS,
  data: [string, number]
): Promise<string[]> {
  const [digits_string, target] = data;
  // ns.tprintf("digits: %j, target: %d", digits_string, target);
  var result: string[] = [];
  const max_mask = max_ops_mask(digits_string);
  const digits = digits_to_digits(digits_string);
  for (var mask = 0; mask <= max_mask; mask += 1) {
    if (mask % 10000 === 0) {
      await ns.sleep(1);
    }
    const ops = mask_to_ops(mask, digits_string.length - 1);
    const value = reduce_expression(digits, ops);
    if (value === target) {
      const expr = render_digits_and_ops(digits, ops);
      // ns.tprintf("mask: %x, expr: %s", mask, expr);
      result.push(expr);
    }
  }
  return result;
}
