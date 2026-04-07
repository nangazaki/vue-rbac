import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { localStorageAdapter } from "../storage/local-storage";
import { sessionStorageAdapter } from "../storage/session-storage";
import { cookieStorageAdapter } from "../storage/cookie";

describe("Storage Adapters", () => {
  describe("LocalStorage Adapter", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it("should set and get a value", () => {
      const testData = { roles: ["admin"], permissions: ["read"] };

      localStorageAdapter.set("test-key", testData);
      const result = localStorageAdapter.get("test-key");

      expect(result).toEqual(testData);
    });

    it("should return null for non-existent key", () => {
      const result = localStorageAdapter.get("non-existent");

      expect(result).toBeNull();
    });

    it("should remove a value", () => {
      localStorageAdapter.set("test-key", { data: "value" });
      localStorageAdapter.remove("test-key");

      const result = localStorageAdapter.get("test-key");

      expect(result).toBeNull();
    });

    it("should handle complex nested objects", () => {
      const complexData = {
        roles: {
          admin: { permissions: ["users:create", "users:delete"] },
          editor: { permissions: ["posts:edit"], inherits: ["viewer"] },
        },
        userRoles: ["admin"],
      };

      localStorageAdapter.set("complex", complexData);
      const result = localStorageAdapter.get("complex");

      expect(result).toEqual(complexData);
    });

    it("should handle arrays", () => {
      const arrayData = ["admin", "editor", "viewer"];

      localStorageAdapter.set("array", arrayData);
      const result = localStorageAdapter.get("array");

      expect(result).toEqual(arrayData);
    });
  });

  describe("SessionStorage Adapter", () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    afterEach(() => {
      sessionStorage.clear();
    });

    it("should set and get a value", () => {
      const testData = { roles: ["admin"], permissions: ["read"] };

      sessionStorageAdapter.set("test-key", testData);
      const result = sessionStorageAdapter.get("test-key");

      expect(result).toEqual(testData);
    });

    it("should return null for non-existent key", () => {
      const result = sessionStorageAdapter.get("non-existent");

      expect(result).toBeNull();
    });

    it("should remove a value", () => {
      sessionStorageAdapter.set("test-key", { data: "value" });
      sessionStorageAdapter.remove("test-key");

      const result = sessionStorageAdapter.get("test-key");

      expect(result).toBeNull();
    });

    it("should return null for invalid JSON", () => {
      // Manually set invalid JSON
      sessionStorage.setItem("invalid-json", "not-valid-json{");

      const result = sessionStorageAdapter.get("invalid-json");

      expect(result).toBeNull();
    });

    it("should handle primitive values", () => {
      sessionStorageAdapter.set("string", "test-string");
      sessionStorageAdapter.set("number", 42);
      sessionStorageAdapter.set("boolean", true);

      expect(sessionStorageAdapter.get("string")).toBe("test-string");
      expect(sessionStorageAdapter.get("number")).toBe(42);
      expect(sessionStorageAdapter.get("boolean")).toBe(true);
    });
  });

  describe("Cookie Storage Adapter", () => {
    beforeEach(() => {
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });

    it("should set and get a value", () => {
      const testData = { roles: ["admin"] };

      cookieStorageAdapter.set("test-cookie", testData);
      const result = cookieStorageAdapter.get("test-cookie");

      expect(result).toEqual(testData);
    });

    it("should return null for non-existent cookie", () => {
      const result = cookieStorageAdapter.get("non-existent");

      expect(result).toBeNull();
    });

    it("should remove a cookie", () => {
      cookieStorageAdapter.set("test-cookie", { data: "value" });
      cookieStorageAdapter.remove("test-cookie");

      const result = cookieStorageAdapter.get("test-cookie");

      expect(result).toBeNull();
    });

    it("should return null for invalid JSON in cookie", () => {
      // Manually set invalid JSON cookie
      document.cookie = "invalid-cookie=not-valid-json{;path=/";

      const result = cookieStorageAdapter.get("invalid-cookie");

      expect(result).toBeNull();
    });

    it("should handle arrays in cookies", () => {
      const arrayData = ["admin", "editor"];

      cookieStorageAdapter.set("array-cookie", arrayData);
      const result = cookieStorageAdapter.get("array-cookie");

      expect(result).toEqual(arrayData);
    });
  });

  describe("SSR Safety (document undefined)", () => {
    it("cookieStorageAdapter should not break when document is undefined", () => {
      // Save original document
      const originalDocument = global.document;

      // Simulate SSR environment
      // @ts-ignore
      delete global.document;

      // These should not throw
      expect(() => cookieStorageAdapter.get("test")).not.toThrow();
      expect(() => cookieStorageAdapter.set("test", { data: "value" })).not.toThrow();
      expect(() => cookieStorageAdapter.remove("test")).not.toThrow();

      // Results should be null in SSR
      expect(cookieStorageAdapter.get("test")).toBeNull();

      // Restore document
      global.document = originalDocument;
    });
  });

  describe("Type Safety", () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it("should correctly type the returned value", () => {
      interface UserRoles {
        roles: string[];
        permissions: string[];
      }

      const data: UserRoles = { roles: ["admin"], permissions: ["read"] };

      sessionStorageAdapter.set("typed-data", data);
      const result = sessionStorageAdapter.get<UserRoles>("typed-data");

      expect(result?.roles).toEqual(["admin"]);
      expect(result?.permissions).toEqual(["read"]);
    });
  });
});
