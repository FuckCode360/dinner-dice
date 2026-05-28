import type { DiceResult, Filters, Restaurant } from "./types";

const TWO_DAYS = 1000 * 60 * 60 * 24 * 2;

export function rollDinner(restaurants: Restaurant[], filters: Filters): DiceResult {
  const candidates = restaurants.filter((item) => matchesFilters(item, filters));
  if (candidates.length === 0) {
    return { restaurant: null, candidates };
  }

  const now = Date.now();
  const weighted = candidates.map((item) => {
    const wasRecent = item.lastEatenAt && now - new Date(item.lastEatenAt).getTime() < TWO_DAYS;
    return {
      item,
      score: Math.max(1, wasRecent ? Math.floor(item.weight / 2) : item.weight),
    };
  });
  const total = weighted.reduce((sum, item) => sum + item.score, 0);
  let pick = Math.random() * total;

  for (const entry of weighted) {
    pick -= entry.score;
    if (pick <= 0) {
      return { restaurant: entry.item, candidates };
    }
  }

  return { restaurant: weighted[weighted.length - 1].item, candidates };
}

export function matchesFilters(item: Restaurant, filters: Filters) {
  if (!item.enabled) return false;
  if (item.budget > filters.maxBudget) return false;
  if (item.distanceMinutes > filters.maxDistance) return false;
  if (item.health < filters.minHealth) return false;
  if (filters.mode !== "either" && item.mode !== filters.mode) return false;
  if (filters.spicePreference === "spicy" && item.spice < 2) return false;
  if (filters.spicePreference === "mild" && item.spice > 1) return false;
  return true;
}
