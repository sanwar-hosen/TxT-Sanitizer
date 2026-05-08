'use client';

/**
 * useSystemPresets
 *
 * Fetches system presets from GET /api/presets on first visit.
 * Caches in localStorage with a version field. Re-fetches only when version changes.
 * Falls back gracefully to DEFAULT_PRESETS if the API is unreachable.
 *
 * Merges with local user overrides so the settings page "Reset to default"
 * works correctly (removes the override key, restoring the API version).
 */

import { useState, useEffect } from 'react';
import type { Preset } from '@/types/preset';
import { DEFAULT_PRESETS } from '@/data/defaultPresets';
import { loadPresetOverrides } from '@/lib/storage';

const LS_SYSTEM_PRESETS_KEY = 'txts_v2_systemPresets';
const LS_SYSTEM_VERSION_KEY = 'txts_v2_systemPresetsVersion';

interface CachedSystemPresets {
  presets: Preset[];
  version: number;
}

function readCache(): CachedSystemPresets | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_SYSTEM_PRESETS_KEY);
    const version = localStorage.getItem(LS_SYSTEM_VERSION_KEY);
    if (!raw || !version) return null;
    return { presets: JSON.parse(raw), version: parseInt(version, 10) };
  } catch {
    return null;
  }
}

function writeCache(presets: Preset[], version: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_SYSTEM_PRESETS_KEY, JSON.stringify(presets));
    localStorage.setItem(LS_SYSTEM_VERSION_KEY, String(version));
  } catch {
    // quota — ignore
  }
}

/**
 * Returns system presets with local overrides merged in.
 * `loading` is true during the first fetch.
 */
export function useSystemPresets(): {
  systemPresets: Preset[];
  loading: boolean;
} {
  const [systemPresets, setSystemPresets] = useState<Preset[]>(() => {
    // Initialise from cache immediately (avoids flash of default content)
    const cached = readCache();
    if (cached) {
      const overrides = loadPresetOverrides();
      return cached.presets.map((p) => overrides[p.id] ?? p);
    }
    return DEFAULT_PRESETS;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPresets() {
      try {
        const res = await fetch('/api/presets', {
          headers: { 'cache-control': 'no-store' },
        });
        if (!res.ok) throw new Error('non-2xx');

        const data: { presets: Preset[]; version: number } = await res.json();
        const cached = readCache();

        // Only update state + cache if version changed or no cache
        if (!cached || cached.version !== data.version) {
          writeCache(data.presets, data.version);
          if (!cancelled) {
            const overrides = loadPresetOverrides();
            setSystemPresets(data.presets.map((p) => overrides[p.id] ?? p));
          }
        }
      } catch {
        // Network error — keep defaults already set from init
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPresets();
    return () => { cancelled = true; };
  }, []);

  return { systemPresets, loading };
}
