import type { Rule } from "@/lib/sanitizer/types";

const DEVICE_ID_KEY = "txt_sanitizer_device_id";
const HISTORY_LIMIT = 100;

export type UserPreset = {
  id: string;
  name: string;
  rules: Rule[];
};

export type HistoryEntry = {
  id: string;
  timestamp: number;
  input: string;
  output: string;
  presetId: string;
  presetName: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function createRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 11)}`;
}

function getDeviceId(): string {
  if (!canUseStorage()) return "unknown";

  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const created = createRandomId();
  window.localStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

function getUserPresetsKey(): string {
  return `txt_sanitizer_presets_${getDeviceId()}`;
}

function getHistoryKey(): string {
  return `txt_sanitizer_history_${getDeviceId()}`;
}

export function loadUserPresets(): UserPreset[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(getUserPresetsKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as UserPreset[]) : [];
  } catch {
    return [];
  }
}

export function saveUserPresets(payload: UserPreset[]): boolean {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(getUserPresetsKey(), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function loadHistory(): HistoryEntry[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(getHistoryKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(payload: HistoryEntry[]): boolean {
  if (!canUseStorage()) return false;
  try {
    const trimmed = payload.slice(0, HISTORY_LIMIT);
    window.localStorage.setItem(getHistoryKey(), JSON.stringify(trimmed));
    return true;
  } catch {
    return false;
  }
}

export function addHistoryEntry(payload: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry[] {
  const existing = loadHistory();
  const nextItem: HistoryEntry = {
    id: createRandomId(),
    timestamp: Date.now(),
    ...payload,
  };
  const next = [nextItem, ...existing].slice(0, HISTORY_LIMIT);
  saveHistory(next);
  return next;
}

export function deleteHistoryEntry(entryId: string): HistoryEntry[] {
  const next = loadHistory().filter((item) => item.id !== entryId);
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(getHistoryKey());
}

export function clearAllData(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(getUserPresetsKey());
  window.localStorage.removeItem(getHistoryKey());
  window.localStorage.removeItem(DEVICE_ID_KEY);
}
