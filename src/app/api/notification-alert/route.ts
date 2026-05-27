/**
 * Public Notification Alert API
 *
 * GET /api/notification-alert — returns the current alert config for all users.
 * Reads from D1 notification_alert table (id = 1).
 * Falls back to { enabled: false } when DB is unavailable (local dev, no D1 binding).
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (request as any).cf?.env ?? (globalThis as any).__env__;
    const db = ctx?.DB;

    if (db) {
      const row = await db
        .prepare('SELECT * FROM notification_alert WHERE id = 1')
        .first();

      if (row) {
        return NextResponse.json(
          {
            enabled: row.enabled === 1,
            heading: row.heading ?? '',
            hasLearnMore: row.has_learn_more === 1,
            body: row.body ?? '',
            version: row.version ?? 1,
          },
          {
            headers: {
              'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
            },
          }
        );
      }
    }
  } catch {
    // Fall through to default below
  }

  // Default: alert disabled (no DB or no row yet)
  return NextResponse.json(
    { enabled: false, heading: '', hasLearnMore: false, body: '', version: 1 },
    { headers: { 'Cache-Control': 'public, max-age=60' } }
  );
}
