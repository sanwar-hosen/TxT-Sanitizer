/**
 * GET /api/popup
 * Returns the popup configuration (content and enabled flag).
 * Reads from D1 in production; returns disabled default in local dev.
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
        .prepare('SELECT content, enabled, version FROM popup_config WHERE id = 1')
        .first();

      if (row) {
        return NextResponse.json({
          content: row.content as string,
          enabled: row.enabled === 1,
          version: row.version as number,
        });
      }
    }
  } catch {
    // DB not available — fall through
  }

  // Fallback: popup disabled
  return NextResponse.json({ content: '', enabled: false, version: 1 });
}
