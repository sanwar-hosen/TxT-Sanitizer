/**
 * Admin About API
 *
 * GET /api/admin/about  — return about page content (admin-only)
 * PUT /api/admin/about  — update about page content (admin-only)
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';

export const runtime = 'edge';

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (request as any).cf?.env ?? (globalThis as any).__env__;
    const db = ctx?.DB;

    if (db) {
      const row = await db
        .prepare('SELECT html_content, updated_at FROM about_content WHERE id = 1')
        .first();

      if (row) {
        return NextResponse.json({ content: row.html_content, updatedAt: row.updated_at });
      }
    }
  } catch {
    // Fall through
  }

  return NextResponse.json({ content: '', updatedAt: null });
}

export async function PUT(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = body as { content?: string };

    if (content === undefined) {
      return NextResponse.json({ error: 'Missing content field' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (request as any).cf?.env ?? (globalThis as any).__env__;
    const db = ctx?.DB;

    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const existing = await db
      .prepare('SELECT id FROM about_content WHERE id = 1')
      .first();

    if (existing) {
      await db
        .prepare(
          `UPDATE about_content SET html_content = ?, updated_at = datetime('now') WHERE id = 1`
        )
        .bind(content)
        .run();
    } else {
      await db
        .prepare(
          `INSERT INTO about_content (id, html_content) VALUES (1, ?)`
        )
        .bind(content)
        .run();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
