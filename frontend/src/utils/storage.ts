export const storage = {
  getItem: <T = string>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (e) {
      console.error("[storage.getItem error]", e);
      return null;
    }
  },
  setItem: (key: string, value: any): void => {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (e) {
      console.error("[storage.setItem error]", e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("[storage.removeItem error]", e);
    }
  },
};
