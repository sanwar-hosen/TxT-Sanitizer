/**
 * POST /api/feedback
 * Validates the form body and sends an email via Nodemailer + Gmail SMTP.
 *
 * Required env vars (set in .env.local + Cloudflare Pages env):
 *   GMAIL_USER         — sender Gmail address
 *   GMAIL_APP_PASSWORD — 16-char Gmail App Password
 *
 * Rate limiting: max 5 submissions per IP per hour (in-memory for edge; use KV in prod).
 * Body: { email?: string; subject: string; message: string }
 */

import { NextResponse } from 'next/server';
import { getCfEnv } from '@/lib/db';

// This route must run in the Edge runtime.
export const runtime = 'edge';

// ── In-memory rate limiter ────────────────────────────────────────────────────
// In production (multi-instance), replace with Cloudflare KV.
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT = 5;
const ipLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // Get client IP
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before sending again.' },
      { status: 429 }
    );
  }

  let body: { email?: string; subject?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, subject, message } = body;

  // Validate required fields
  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: 'Subject and message are required.' },
      { status: 400 }
    );
  }

  // Check env vars
  const gmailUser = getCfEnv('GMAIL_USER');
  const gmailPass = getCfEnv('GMAIL_APP_PASSWORD');

  if (!gmailUser || !gmailPass) {
    // In local dev without env vars, simulate success
    console.warn('[feedback] GMAIL_USER or GMAIL_APP_PASSWORD not set — simulating send');
    return NextResponse.json({ ok: true, simulated: true });
  }

  // Dynamically import nodemailer (avoids Edge runtime issues)
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const mailOptions = {
    from: `"TxT Sanitizer Feedback" <${gmailUser}>`,
    to: gmailUser,
    replyTo: email?.trim() || undefined,
    subject: `[TxT Sanitizer Feedback] ${subject.trim().slice(0, 200)}`,
    text: [
      `From: ${email?.trim() || 'Anonymous'}`,
      `Subject: ${subject.trim()}`,
      '',
      message.trim(),
    ].join('\n'),
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 600px;">
        <h2 style="color: #004AAD; margin-bottom: 4px;">New Feedback</h2>
        <p style="color: #666; font-size: 13px; margin-top: 0;">From: <strong>${email?.trim() || 'Anonymous'}</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;" />
        <p style="white-space: pre-wrap; color: #1a1a1a;">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);

    // Log analytics event (fire-and-forget)
    try {
      await fetch(new URL('/api/analytics', request.url), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event_type: 'feedback' }),
      });
    } catch {
      // Non-critical
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[feedback] Failed to send email:', err);
    return NextResponse.json(
      { error: 'Failed to send feedback. Please try again later.' },
      { status: 500 }
    );
  }
}
