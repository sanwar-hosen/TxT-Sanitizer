'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Preset } from '@/types/preset';
import { DEFAULT_PRESETS } from '@/data/defaultPresets';
import {
  loadLastSelectedPresetId,
  saveLastSelectedPresetId,
  loadUserPresets,
  loadPresetOverrides,
} from '@/lib/storage';

/**
 * Reorders presets so that the last-selected preset is always first.
 * The remaining presets stay in their natural order.
 */
function reorder(presets: Preset[], lastId: string | null): Preset[] {
  if (!lastId) return presets;
  const idx = presets.findIndex((p) => p.id === lastId);
  if (idx <= 0) return presets;
  const selected = presets[idx];
  const rest = presets.filter((_, i) => i !== idx);
  return [selected, ...rest];
}

const MAX_VISIBLE = 3;

export function usePresets() {
  // All available presets (system + user — for now just defaults)
  const [allPresets, setAllPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [activePresetId, setActivePresetIdRaw] = useState<string>(
    DEFAULT_PRESETS[0]?.id ?? ''
  );

  // Hydrate last-selected + user presets + overrides from localStorage
  useEffect(() => {
    const stored = loadLastSelectedPresetId();
    if (stored) {
      setLastSelectedId(stored);
      setActivePresetIdRaw(stored);
    }

    // Apply local overrides to system presets
    const overrides = loadPresetOverrides();
    const systemWithOverrides = DEFAULT_PRESETS.map((p) => overrides[p.id] ?? p);

    // Merge user presets
    const userPresets = loadUserPresets();
    setAllPresets([...systemWithOverrides, ...userPresets]);
  }, []);

  // Derived: ordered presets (last-selected first)
  const ordered = reorder(allPresets, lastSelectedId);
  const visiblePresets = ordered.slice(0, MAX_VISIBLE);
  const overflowPresets = ordered.slice(MAX_VISIBLE);
  const hasOverflow = overflowPresets.length > 0;

  const activePreset =
    allPresets.find((p) => p.id === activePresetId) ?? allPresets[0];

  /** Select a preset — saves to localStorage and moves it to position 1 */
  const selectPreset = useCallback(
    (id: string) => {
      setActivePresetIdRaw(id);
      setLastSelectedId(id);
      saveLastSelectedPresetId(id);
    },
    []
  );

  /** Refresh presets from storage (call after settings page changes) */
  const refreshPresets = useCallback(() => {
    const overrides = loadPresetOverrides();
    const systemWithOverrides = DEFAULT_PRESETS.map((p) => overrides[p.id] ?? p);
    const userPresets = loadUserPresets();
    setAllPresets([...systemWithOverrides, ...userPresets]);
  }, []);

  return {
    allPresets,
    visiblePresets,
    overflowPresets,
    hasOverflow,
    activePreset,
    activePresetId,
    selectPreset,
    setAllPresets,
    refreshPresets,
  };
}
