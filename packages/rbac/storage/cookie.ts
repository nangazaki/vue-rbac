import type { StorageAdapter } from "../types";

function getCookie<T>(name: string): T | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[2])) as T;
  } catch {
    return null;
  }
}

function setCookie<T>(name: string, value: T, days = 7) {
  if (typeof document === "undefined") return null;

  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    JSON.stringify(value)
  )}; expires=${expires}; path=/; Secure; SameSite=Strict`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return null;

  document.cookie = `${name}=; Max-Age=-1; path=/; Secure; SameSite=Strict  `;
}

export const cookieStorageAdapter: StorageAdapter = {
  get: getCookie,
  set: setCookie,
  remove: deleteCookie,
};
