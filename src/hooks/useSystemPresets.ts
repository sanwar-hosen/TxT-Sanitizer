'use client';

/**
 * useSystemPresets
 *
 * Fetches system presets from GET /api/presets on every page load.
 * Caches in localStorage for a fast initial paint (no flash of stale content).
 * Falls back gracefully to DEFAULT_PRESETS if the API is unreachable.
 *
 * Merges with local user overrides so the settings page "Reset to default"
 * works correctly (removes the override key, restoring the API version).
 *
 * We intentionally do NOT gate the state update on version equality.
 * The version is stored in localStorage purely to power "Reset to default" UX.
 * Always applying the API response ensures admin updates propagate to all
 * users immediately on the next page refresh (no hard-refresh required).
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
          // no-store on the request tells the browser not to use its own cache.
          // The server response also carries Cache-Control: no-store so Cloudflare
          // CDN will not cache this endpoint either.
          headers: { 'cache-control': 'no-store' },
        });
        if (!res.ok) throw new Error('non-2xx');

        const data: { presets: Preset[]; version: number } = await res.json();

        // Always update state from the fresh API response so admin changes
        // are reflected immediately on the next page refresh.
        // We also update the localStorage cache so the next cold paint is fast.
        writeCache(data.presets, data.version);
        if (!cancelled) {
          const overrides = loadPresetOverrides();
          setSystemPresets(data.presets.map((p) => overrides[p.id] ?? p));
        }
      } catch {
        // Network error — keep the cached/default presets already in state.
        // Do NOT clear them; a brief network blip should not wipe presets.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPresets();
    return () => { cancelled = true; };
  }, []);

  return { systemPresets, loading };
}
