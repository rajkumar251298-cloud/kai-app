/**
 * Obfuscates selected localStorage values (not encryption — deters casual inspection).
 * Values prefixed so legacy plain-text entries still read correctly.
 */

const SECRET = "kai-app-2026";
const PREFIX = "kaienc:";

function encode(data: string): string {
  return btoa(
    encodeURIComponent(data)
      .split("")
      .map((c, i) =>
        String.fromCharCode(
          c.charCodeAt(0) ^ SECRET.charCodeAt(i % SECRET.length),
        ),
      )
      .join(""),
  );
}

function decode(data: string): string {
  try {
    return decodeURIComponent(
      atob(data)
        .split("")
        .map((c, i) =>
          String.fromCharCode(
            c.charCodeAt(0) ^ SECRET.charCodeAt(i % SECRET.length),
          ),
        )
        .join(""),
    );
  } catch {
    return "";
  }
}

export const secureStorage = {
  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, PREFIX + encode(value));
  },

  get(key: string): string {
    if (typeof window === "undefined") return "";
    const item = localStorage.getItem(key);
    if (!item) return "";
    if (item.startsWith(PREFIX)) {
      const inner = item.slice(PREFIX.length);
      const decoded = decode(inner);
      if (decoded) return decoded;
      return "";
    }
    return item;
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};
