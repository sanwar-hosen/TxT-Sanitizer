/**
 * GET /api/admin/analytics
 * Returns aggregated analytics data from D1 for the admin dashboard.
 * Admin-only (session cookie required).
 *
 * Query params:
 *   ?range=30d | 6m | 12m  (default: 12m)
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const range = url.searchParams.get('range') ?? '12m';

  // Convert range to SQLite date filter
  let dateFilter: string;
  if (range === '30d') {
    dateFilter = "datetime('now', '-30 days')";
  } else if (range === '6m') {
    dateFilter = "datetime('now', '-6 months')";
  } else {
    dateFilter = "datetime('now', '-12 months')";
  }

  try {
    const db = getDB();

    if (!db) {
      // Return mock data for local dev
      return NextResponse.json(buildMockData());
    }

    // ── Summary totals ─────────────────────────────────────────────────────────
    const { results: totals } = await db
      .prepare(
        `SELECT
           event_type,
           COUNT(*) as count
         FROM analytics
         WHERE created_at >= ${dateFilter}
         GROUP BY event_type`
      )
      .all();

    const summary: Record<string, number> = { page_view: 0, sanitize: 0, feedback: 0 };
    for (const row of totals as { event_type: string; count: number }[]) {
      summary[row.event_type] = row.count;
    }

    // ── Monthly breakdown (year-month bucketing) ───────────────────────────────
    const { results: monthly } = await db
      .prepare(
        `SELECT
           strftime('%Y-%m', created_at) as month,
           event_type,
           COUNT(*) as count
         FROM analytics
         WHERE created_at >= ${dateFilter}
         GROUP BY month, event_type
         ORDER BY month ASC`
      )
      .all();

    // ── Top presets from sanitize events ──────────────────────────────────────
    const { results: dbPresets } = await db
      .prepare('SELECT id, name FROM presets')
      .all();
    const presetNames: Record<string, string> = {};
    for (const p of dbPresets as { id: string; name: string }[]) {
      presetNames[p.id] = p.name;
    }

    const { results: sanitizeEvents } = await db
      .prepare(
        `SELECT metadata
         FROM analytics
         WHERE event_type = 'sanitize' AND created_at >= ${dateFilter}
         LIMIT 5000`
      )
      .all();

    const presetCounts: Record<string, { count: number; name?: string }> = {};
    for (const row of sanitizeEvents as { metadata: string | null }[]) {
      if (row.metadata) {
        try {
          const meta = JSON.parse(row.metadata);
          if (meta.presetId) {
            if (!presetCounts[meta.presetId]) {
              presetCounts[meta.presetId] = { count: 0, name: meta.presetName };
            }
            presetCounts[meta.presetId].count += 1;
            if (meta.presetName && !presetCounts[meta.presetId].name) {
              presetCounts[meta.presetId].name = meta.presetName;
            }
          }
        } catch {
          // skip
        }
      }
    }

    const topPresets = Object.entries(presetCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([presetId, item]) => {
        const name = presetNames[presetId] || item.name || presetId;
        return { presetId, presetName: name, count: item.count };
      });

    // ── Average char count ────────────────────────────────────────────────────
    let totalChars = 0;
    let charSamples = 0;
    for (const row of sanitizeEvents as { metadata: string | null }[]) {
      if (row.metadata) {
        try {
          const meta = JSON.parse(row.metadata);
          if (typeof meta.charCount === 'number') {
            totalChars += meta.charCount;
            charSamples++;
          }
        } catch {
          // skip
        }
      }
    }
    const avgCharCount = charSamples > 0 ? Math.round(totalChars / charSamples) : 0;

    return NextResponse.json({
      summary,
      monthly,
      topPresets,
      avgCharCount,
      range,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── Mock data for local dev (no D1) ──────────────────────────────────────────
function buildMockData() {
  const now = new Date();
  const monthly = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthly.push(
      { month, event_type: 'page_view', count: Math.floor(Math.random() * 400) + 50 },
      { month, event_type: 'sanitize', count: Math.floor(Math.random() * 200) + 20 },
      { month, event_type: 'feedback', count: Math.floor(Math.random() * 15) + 1 }
    );
  }

  return {
    summary: { page_view: 3240, sanitize: 1587, feedback: 42 },
    monthly,
    topPresets: [
      { presetId: 'default01', presetName: 'ChatGPT → Normal', count: 823 },
      { presetId: 'default02', presetName: 'Fiverr Words', count: 412 },
      { presetId: 'custom-user-1', presetName: 'My Custom Preset', count: 187 },
    ],
    avgCharCount: 342,
    range: '12m',
  };
}
