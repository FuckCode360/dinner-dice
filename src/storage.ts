import type { BackupPayload, DinnerHistory, Restaurant } from "./types";
import { inferArtworkId } from "./cardArt";

const RESTAURANTS_KEY = "dinner-dice:v1:restaurants";
const HISTORY_KEY = "dinner-dice:v1:history";

export function loadRestaurants(): Restaurant[] {
  return readJson<Partial<Restaurant>[]>(RESTAURANTS_KEY, []).map(normalizeRestaurant);
}

export function saveRestaurants(restaurants: Restaurant[]) {
  localStorage.setItem(RESTAURANTS_KEY, JSON.stringify(restaurants));
}

export function loadHistory(): DinnerHistory[] {
  return readJson<DinnerHistory[]>(HISTORY_KEY, []);
}

export function saveHistory(history: DinnerHistory[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function createBackup(restaurants: Restaurant[], history: DinnerHistory[]): BackupPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    restaurants,
    history,
  };
}

export function parseBackup(text: string): BackupPayload {
  const payload = JSON.parse(text) as Partial<BackupPayload>;
  if (payload.version !== 1 || !Array.isArray(payload.restaurants) || !Array.isArray(payload.history)) {
    throw new Error("备份文件格式不正确");
  }
  return {
    ...payload,
    restaurants: payload.restaurants.map(normalizeRestaurant),
    history: payload.history,
  } as BackupPayload;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeRestaurant(item: Partial<Restaurant>): Restaurant {
  return {
    id: item.id || crypto.randomUUID(),
    name: item.name || "",
    category: item.category || "",
    artworkId: inferArtworkId(item),
    mode: item.mode === "delivery" ? "delivery" : "dine-in",
    place: item.place === "work" || item.place === "home" || item.place === "both" ? item.place : "both",
    budget: Number(item.budget) || 35,
    distanceMinutes: Number(item.distanceMinutes) || 15,
    health: Number(item.health) || 3,
    spice: Number(item.spice) || 0,
    weight: Number(item.weight) || 3,
    note: item.note || "",
    enabled: item.enabled ?? true,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    lastEatenAt: item.lastEatenAt,
  };
}
