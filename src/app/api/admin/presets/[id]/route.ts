/**
 * Admin Preset [id] API
 *
 * PUT    /api/admin/presets/[id]  — update a system preset (name, rules); bumps version
 * DELETE /api/admin/presets/[id]  — delete a system preset
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';

export const runtime = 'edge';

// ── PUT — update preset ────────────────────────────────────────────────────────
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { name, rules, isDefault } = body as {
      name?: string;
      rules?: unknown[];
      isDefault?: boolean;
    };

    if (!name && !rules) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (request as any).cf?.env ?? (globalThis as any).__env__;
    const db = ctx?.DB;

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    await db
      .prepare(
        `UPDATE presets
         SET name = COALESCE(?, name),
             rules = COALESCE(?, rules),
             is_default = COALESCE(?, is_default),
             version = version + 1,
             updated_at = datetime('now')
         WHERE id = ?`
      )
      .bind(
        name ?? null,
        rules ? JSON.stringify(rules) : null,
        isDefault !== undefined ? (isDefault ? 1 : 0) : null,
        id
      )
      .run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── DELETE — delete preset ─────────────────────────────────────────────────────
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (request as any).cf?.env ?? (globalThis as any).__env__;
    const db = ctx?.DB;

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    await db.prepare('DELETE FROM presets WHERE id = ?').bind(id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
