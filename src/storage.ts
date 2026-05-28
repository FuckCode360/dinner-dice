import type { BackupPayload, DailyDrawState, DinnerHistory, Restaurant } from "./types";
import { inferArtworkId } from "./cardArt";

const RESTAURANTS_KEY = "dinner-dice:v1:restaurants";
const HISTORY_KEY = "dinner-dice:v1:history";
const DAILY_DRAW_KEY = "dinner-dice:v1:daily-draw";
export const DAILY_DRAW_LIMIT = 3;

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

export function todayKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function createEmptyDailyDrawState(date = todayKey()): DailyDrawState {
  return {
    date,
    used: 0,
  };
}

export function normalizeDailyDrawState(state: Partial<DailyDrawState> | null | undefined): DailyDrawState {
  const date = todayKey();
  if (!state || state.date !== date) return createEmptyDailyDrawState(date);
  return {
    date,
    used: Math.max(0, Math.min(DAILY_DRAW_LIMIT, Number(state.used) || 0)),
    committedRestaurantId: state.committedRestaurantId,
    committedAt: state.committedAt,
  };
}

export function loadDailyDrawState(): DailyDrawState {
  return normalizeDailyDrawState(readJson<Partial<DailyDrawState> | null>(DAILY_DRAW_KEY, null));
}

export function saveDailyDrawState(state: DailyDrawState) {
  localStorage.setItem(DAILY_DRAW_KEY, JSON.stringify(normalizeDailyDrawState(state)));
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
