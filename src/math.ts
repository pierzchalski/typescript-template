export function gcd(...ns: number[]): number {
  if (ns.length === 0) {
    throw new Error("gcd: no arguments");
  }
  const a = ns.shift() as number;
  if (ns.length === 0) {
    return a;
  }
  const b = ns.shift() as number;
  if (b === 0) {
    return gcd(a, ...ns);
  } else {
    return gcd(b, a % b, ...ns);
  }
}
