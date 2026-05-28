import type { BackupPayload, DinnerHistory, Restaurant } from "./types";

const RESTAURANTS_KEY = "dinner-dice:v1:restaurants";
const HISTORY_KEY = "dinner-dice:v1:history";

export function loadRestaurants(): Restaurant[] {
  return readJson<Restaurant[]>(RESTAURANTS_KEY, []);
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
  return payload as BackupPayload;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
