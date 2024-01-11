import { CityName, ILocation, InfiltrationLocation, NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  const locations = ns.infiltration
    .getPossibleLocations()
    .map<[CityName, InfiltrationLocation]>((l) => [
      l.city,
      ns.infiltration.getInfiltration(l.name),
    ]);
  locations.sort((a, b) => {
    const a_difficulty = a[1].difficulty;
    const b_difficulty = b[1].difficulty;
    if (a_difficulty === b_difficulty) {
      return a[1].reward.tradeRep - b[1].reward.tradeRep;
    }
    return a_difficulty - b_difficulty;
  });
  for (const [city, inf] of locations) {
    ns.tprintf(
      "%s: %s: difficulty(%s), reward(SoA: %s, Other: %s)",
      inf.location.city,
      inf.location.name,
      inf.difficulty,
      inf.reward.SoARep,
      inf.reward.tradeRep
    );
  }
}
