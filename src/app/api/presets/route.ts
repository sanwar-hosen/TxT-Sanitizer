/**
 * GET /api/presets
 * Returns system presets with a version number.
 * In production (Cloudflare Pages with D1), reads from DB.
 * Falls back to static default presets when DB is not configured.
 */

import { NextResponse } from 'next/server';
import { DEFAULT_PRESETS } from '@/data/defaultPresets';

// Cloudflare D1 binding is injected at runtime via `process.env` on CF Pages.
// In local Next.js dev, we skip the DB and return defaults.

export const runtime = 'edge';

export async function GET(request: Request) {
  // Cloudflare injects the D1 binding into the request's `cf` context.
  // We access it via the experimental `getRequestContext` from @cloudflare/next-on-pages,
  // but to avoid a hard dependency on that package we use a graceful fallback.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (request as any).cf?.env ?? (globalThis as any).__env__;
    const db = ctx?.DB;

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

      return NextResponse.json({ presets, version });
    }
  } catch {
    // DB not available — fall through to defaults
  }

  // Fallback: return static default presets
  return NextResponse.json({ presets: DEFAULT_PRESETS, version: 1 });
}
