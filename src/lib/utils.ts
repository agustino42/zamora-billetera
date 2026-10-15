import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address?: string | null, chars = 4) {
  if (!address) return "—";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function formatNumber(value: number | string, decimals = 2) {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "0";
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatZamora(value: number | string) {
  const n = typeof value === "string" ? Number(value) : value;
  return `${formatNumber(Number.isNaN(n) ? 0 : n, 2)} ZAM`;
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function relativeTime(date: string | Date) {
  const d = new Date(date).getTime();
  const diff = d - Date.now();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "ahora";
}

export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;
  const currentFloor = (level - 1) ** 2 * 100;
  const nextFloor = level ** 2 * 100;
  const progress = Math.min(
    100,
    Math.round(((xp - currentFloor) / (nextFloor - currentFloor)) * 100),
  );
  const tier = level >= 12 ? "Oro" : level >= 6 ? "Plata" : "Bronce";
  return { level, progress, nextFloor, tier };
}

export function encodeForumHash(post: {
  author: string;
  content: string;
  createdAt: string;
}) {
  const raw = `${post.author}:${post.createdAt}:${post.content}`;
  let hash = 0n;
  const FNV_PRIME = 0x100000001b3n;
  const OFFSET = 0xcbf29ce484222325n;
  hash = OFFSET;
  for (let i = 0; i < raw.length; i++) {
    hash ^= BigInt(raw.charCodeAt(i));
    hash = (hash * FNV_PRIME) & 0xffffffffffffffffn;
  }
  return "0x" + hash.toString(16).padStart(64, "0");
}
