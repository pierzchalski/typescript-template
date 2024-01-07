export function gcd(a: number, b: number, ...rest: number[]): number {
  if (rest.length === 0) {
    if (b === 0) {
      return a;
    }
    return gcd(b, a % b);
  }
  const c = rest.shift() as number;
  return gcd(gcd(a, b), c, ...rest);
}
