// ──────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types for TxT Sanitizer V2
// ──────────────────────────────────────────────────────────────────────────────

export interface Rule {
  priority: number;
  find: string;
  replace: string;
}

export interface Preset {
  id: string;
  name: string;
  rules: Rule[];
  /** true = fetched from system / D1; user cannot permanently delete (only locally override) */
  isDefault?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────────
// Sanitizer engine output
// ──────────────────────────────────────────────────────────────────────────────

export interface Match {
  /** The original text fragment before replacement */
  original: string;
  /** The replacement text */
  replaced: string;
  /** Byte offset in the *output* string where this match starts */
  startIndex: number;
  /** Byte offset in the *output* string where this match ends (exclusive) */
  endIndex: number;
  /** Which rule (by priority) produced this match */
  rulePriority: number;
  /** Byte offset in the original input text where this match starts */
  inputStartIndex?: number;
  /** Byte offset in the original input text where this match ends (exclusive) */
  inputEndIndex?: number;
}

export interface SanitizeResult {
  output: string;
  matches: Match[];
}

export interface ExemptRange {
  startIndex: number;
  endIndex: number;
  original: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Multi-tab workspace
// ──────────────────────────────────────────────────────────────────────────────

export interface TabState {
  id: string;
  label: string;
  inputText: string;
  outputText: string;
  selectedPresetId: string;
  matches: Match[];
  exemptRanges?: ExemptRange[];
}

// ──────────────────────────────────────────────────────────────────────────────
// History
// ──────────────────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  presetId: string;
  presetName: string;
  inputText: string;
  outputText: string;
  matchCount: number;
  createdAt: string; // ISO 8601
}
