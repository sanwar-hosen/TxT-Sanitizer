/**
 * GET /api/about
 * Returns the About page HTML content from D1.
 * Falls back to static default content if DB not configured.
 */

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'edge';

const DEFAULT_ABOUT_HTML = `
<h2>About TxT Sanitizer</h2>
<p>TxT Sanitizer is a lightweight, fast text processing utility that helps you clean and transform text using customizable preset rules.</p>
<p>Built for freelancers, content creators, and anyone who needs to sanitize or format text quickly.</p>
<h3>Features</h3>
<ul>
  <li>Custom preset rules with find &amp; replace</li>
  <li>Multi-tab workspace</li>
  <li>Highlighted match visualization</li>
  <li>Hover-to-restore modified segments</li>
  <li>Output Find &amp; Replace tool</li>
  <li>Persistent history (up to 50 entries)</li>
</ul>
`.trim();

export async function GET() {
  try {
    const db = getDB();

    if (db) {
      const row = await db
        .prepare('SELECT html_content FROM about_content WHERE id = 1')
        .first();

      if (row?.html_content) {
        return NextResponse.json({ html: row.html_content as string });
      }
    }
  } catch {
    // DB not available — fall through
  }

  return NextResponse.json({ html: DEFAULT_ABOUT_HTML });
}
