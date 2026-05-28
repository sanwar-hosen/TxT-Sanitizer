/**
 * Admin Presets API
 *
 * GET  /api/admin/presets        — list all presets (admin-only, same as public but unversioned)
 * POST /api/admin/presets        — create a new system preset
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import { DEFAULT_PRESETS } from '@/data/defaultPresets';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

// ── GET — list all presets ────────────────────────────────────────────────────
export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDB();

    if (db) {
      const { results } = await db
        .prepare('SELECT id, name, rules, is_default, version, created_at, updated_at FROM presets ORDER BY created_at ASC')
        .all();

      const presets = results.map(
        (row: { id: string; name: string; rules: string; is_default: number; version: number; created_at: string; updated_at: string }) => ({
          id: row.id,
          name: row.name,
          rules: JSON.parse(row.rules),
          isDefault: row.is_default === 1,
          version: row.version,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })
      );

      return NextResponse.json({ presets });
    }
  } catch {
    // Fall through
  }

  // Fallback
  return NextResponse.json({ presets: DEFAULT_PRESETS });
}

// ── POST — create a new preset ────────────────────────────────────────────────
export async function POST(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, rules, isDefault } = body as {
      id: string;
      name: string;
      rules: unknown[];
      isDefault?: boolean;
    };

    if (!id || !name || !Array.isArray(rules)) {
      return NextResponse.json({ error: 'Missing required fields: id, name, rules' }, { status: 400 });
    }

    const db = getDB();

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    await db
      .prepare(
        'INSERT INTO presets (id, name, rules, is_default, version) VALUES (?, ?, ?, ?, 1)'
      )
      .bind(id, name, JSON.stringify(rules), isDefault ? 1 : 0)
      .run();

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
