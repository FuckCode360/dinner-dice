export type MealMode = "either" | "dine-in" | "delivery";
export type MealPlace = "work" | "home" | "both";
export type PlaceFilter = Exclude<MealPlace, "both">;
export type SpicePreference = "any" | "spicy" | "mild";

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  artworkId: string;
  mode: Exclude<MealMode, "either">;
  place: MealPlace;
  budget: number;
  distanceMinutes: number;
  health: number;
  spice: number;
  weight: number;
  note: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastEatenAt?: string;
}

export interface DinnerHistory {
  id: string;
  restaurantId: string;
  restaurantName: string;
  eatenAt: string;
}

export interface Filters {
  maxBudget: number;
  maxDistance: number;
  minHealth: number;
  spicePreference: SpicePreference;
  mode: MealMode;
  place: PlaceFilter;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  restaurants: Restaurant[];
  history: DinnerHistory[];
}

export interface DiceResult {
  restaurant: Restaurant | null;
  candidates: Restaurant[];
}
