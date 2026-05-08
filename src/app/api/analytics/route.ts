/**
 * POST /api/analytics
 * Logs an analytics event to D1.
 * Body: { event_type: 'page_view' | 'sanitize' | 'feedback', metadata?: object }
 *
 * Silently succeeds (204) even if DB is unavailable — analytics are non-critical.
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

const VALID_EVENT_TYPES = new Set(['page_view', 'sanitize', 'feedback']);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, metadata } = body as { event_type: string; metadata?: unknown };

    if (!event_type || !VALID_EVENT_TYPES.has(event_type)) {
      return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (request as any).cf?.env ?? (globalThis as any).__env__;
    const db = ctx?.DB;

    if (db) {
      await db
        .prepare(
          'INSERT INTO analytics (event_type, metadata) VALUES (?, ?)'
        )
        .bind(event_type, metadata ? JSON.stringify(metadata) : null)
        .run();
    }
    // If no DB, silently succeed
  } catch {
    // Non-critical — never surface errors to client
  }

  return new NextResponse(null, { status: 204 });
}
