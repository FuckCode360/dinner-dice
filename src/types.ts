export type MealMode = "either" | "dine-in" | "delivery";
export type SpicePreference = "any" | "spicy" | "mild";

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  mode: Exclude<MealMode, "either">;
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
