import type { HistoryEntry, Preset, TabState } from '@/types/preset';

// ──────────────────────────────────────────────────────────────────────────────
// Keys
// ──────────────────────────────────────────────────────────────────────────────
const KEYS = {
  tabs:          'txts_v2_tabs',
  activeTab:     'txts_v2_activeTab',
  presets:       'txts_v2_presets',
  lastPreset:    'txts_v2_lastPreset',
  history:       'txts_v2_history',
  darkMode:      'txts_v2_darkMode',
  userPresets:   'txts_v2_userPresets',
  presetOverrides: 'txts_v2_presetOverrides',
  manualSanitize: 'txts_v2_manualSanitize',
  adsConfig:     'txts_v2_adsConfig',
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// Safe wrappers (SSR-safe — localStorage not available on server)
// ──────────────────────────────────────────────────────────────────────────────

function get<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — ignore
  }
}

function remove(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tabs
// ──────────────────────────────────────────────────────────────────────────────

export function loadTabs(): TabState[] {
  return get<TabState[]>(KEYS.tabs, []);
}

export function saveTabs(tabs: TabState[]): void {
  set(KEYS.tabs, tabs);
}

export function loadActiveTabId(): string | null {
  return get<string | null>(KEYS.activeTab, null);
}

export function saveActiveTabId(id: string): void {
  set(KEYS.activeTab, id);
}

// ──────────────────────────────────────────────────────────────────────────────
// Last-selected preset (for ordering)
// ──────────────────────────────────────────────────────────────────────────────

export function loadLastSelectedPresetId(): string | null {
  return get<string | null>(KEYS.lastPreset, null);
}

export function saveLastSelectedPresetId(id: string): void {
  set(KEYS.lastPreset, id);
}

// ──────────────────────────────────────────────────────────────────────────────
// User Presets (custom presets created by the user)
// ──────────────────────────────────────────────────────────────────────────────

export function loadUserPresets(): Preset[] {
  return get<Preset[]>(KEYS.userPresets, []);
}

export function saveUserPresets(presets: Preset[]): void {
  set(KEYS.userPresets, presets);
}

export function addUserPreset(preset: Preset): Preset[] {
  const existing = loadUserPresets();
  const next = [...existing, preset];
  saveUserPresets(next);
  return next;
}

export function updateUserPreset(updated: Preset): Preset[] {
  const existing = loadUserPresets();
  const next = existing.map((p) => (p.id === updated.id ? updated : p));
  saveUserPresets(next);
  return next;
}

export function deleteUserPreset(id: string): Preset[] {
  const existing = loadUserPresets();
  const next = existing.filter((p) => p.id !== id);
  saveUserPresets(next);
  return next;
}

// ──────────────────────────────────────────────────────────────────────────────
// System Preset Local Overrides
// ──────────────────────────────────────────────────────────────────────────────

/** Overrides for system/default presets (local edits) */
export function loadPresetOverrides(): Record<string, Preset> {
  return get<Record<string, Preset>>(KEYS.presetOverrides, {});
}

export function savePresetOverride(preset: Preset): void {
  const overrides = loadPresetOverrides();
  overrides[preset.id] = preset;
  set(KEYS.presetOverrides, overrides);
}

export function removePresetOverride(id: string): void {
  const overrides = loadPresetOverrides();
  delete overrides[id];
  set(KEYS.presetOverrides, overrides);
}

// ──────────────────────────────────────────────────────────────────────────────
// History  (max 50 entries, newest first)
// ──────────────────────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

export function loadHistory(): HistoryEntry[] {
  return get<HistoryEntry[]>(KEYS.history, []);
}

export function saveHistory(entries: HistoryEntry[]): void {
  set(KEYS.history, entries.slice(0, MAX_HISTORY));
}

export function appendHistory(entry: HistoryEntry): HistoryEntry[] {
  const existing = loadHistory();
  const next = [entry, ...existing].slice(0, MAX_HISTORY);
  saveHistory(next);
  return next;
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const next = loadHistory().filter((e) => e.id !== id);
  saveHistory(next);
  return next;
}

export function clearHistory(): void {
  remove(KEYS.history);
}

// ──────────────────────────────────────────────────────────────────────────────
// Dark mode
// ──────────────────────────────────────────────────────────────────────────────

export function loadDarkMode(): boolean {
  return get<boolean>(KEYS.darkMode, false);
}

export function saveDarkMode(enabled: boolean): void {
  set(KEYS.darkMode, enabled);
}

// ──────────────────────────────────────────────────────────────────────────────
// Manual Sanitize Mode
// ──────────────────────────────────────────────────────────────────────────────

export function loadManualSanitize(): boolean {
  return get<boolean>(KEYS.manualSanitize, false);
}

export function saveManualSanitize(enabled: boolean): void {
  set(KEYS.manualSanitize, enabled);
}

// ──────────────────────────────────────────────────────────────────────────────
// Ads configuration
// ──────────────────────────────────────────────────────────────────────────────

export interface AdsConfig {
  belowNavbar: boolean;
  sidebar: boolean;
}

export function loadAdsConfig(): AdsConfig {
  return get<AdsConfig>(KEYS.adsConfig, { belowNavbar: false, sidebar: false });
}

export function saveAdsConfig(config: AdsConfig): void {
  set(KEYS.adsConfig, config);
}

// ──────────────────────────────────────────────────────────────────────────────
// Clear all
// ──────────────────────────────────────────────────────────────────────────────

export function clearAll(): void {
  Object.values(KEYS).forEach(remove);
}
