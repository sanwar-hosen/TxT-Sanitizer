/**
 * GET /api/presets
 * Returns system presets with a version number.
 * In production (Cloudflare Pages with D1), reads from DB.
 * Falls back to static default presets when DB is not configured (local dev).
 *
 * Cache-Control: no-store — ensures Cloudflare CDN never caches this response
 * so admin updates propagate to all users immediately on next page refresh.
 */

import { NextResponse } from 'next/server';
import { DEFAULT_PRESETS } from '@/data/defaultPresets';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

/** Shared headers applied to every response from this route. */
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store',
};

export async function GET() {
  try {
    const db = getDB();

    if (db) {
      // Fetch presets from D1
      const { results } = await db
        .prepare(
          'SELECT id, name, rules, is_default, version FROM presets ORDER BY created_at ASC'
        )
        .all();

      // Current schema version = max version across all presets
      const version: number = results.reduce(
        (max: number, row: { version: number }) => Math.max(max, row.version ?? 1),
        1
      );

      const presets = results.map(
        (row: { id: string; name: string; rules: string; is_default: number; version: number }) => ({
          id: row.id,
          name: row.name,
          rules: JSON.parse(row.rules),
          isDefault: row.is_default === 1,
          version: row.version,
        })
      );

      return NextResponse.json({ presets, version }, { headers: NO_CACHE_HEADERS });
    }
  } catch {
    // DB not available — fall through to defaults
  }

  // Fallback: return static default presets
  return NextResponse.json(
    { presets: DEFAULT_PRESETS, version: 1 },
    { headers: NO_CACHE_HEADERS }
  );
}
