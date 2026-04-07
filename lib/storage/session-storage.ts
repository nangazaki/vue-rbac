import type { StorageAdapter } from "../types";

export const sessionStorageAdapter: StorageAdapter = {
  get<T>(key: string): T | null {
    const item = sessionStorage.getItem(key);
    if (item === null) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  
  remove(key: string): void {
    sessionStorage.removeItem(key);
  },
}