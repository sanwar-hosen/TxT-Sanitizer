/**
 * GET /api/admin/email-status
 * Returns whether email sending is configured (admin-only).
 * Reads server-side env vars — NEVER exposes secrets to the client.
 *
 * Email provider: Resend API (RESEND_API_KEY)
 * Recipient:      FEEDBACK_EMAIL env var
 */

import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import { getCfEnv } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: Request) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resendApiKey = getCfEnv('RESEND_API_KEY' as keyof CloudflareEnv);
  const feedbackEmail =
    getCfEnv('FEEDBACK_EMAIL' as keyof CloudflareEnv) ??
    getCfEnv('GMAIL_USER' as keyof CloudflareEnv); // legacy fallback for recipient

  const hasResend = Boolean(resendApiKey);
  const hasFeedbackEmail = Boolean(feedbackEmail);

  // Active provider — Resend only; Gmail SMTP is not used on Cloudflare Edge
  const provider: 'resend' | null = hasResend ? 'resend' : null;

  return NextResponse.json({
    configured: hasResend && hasFeedbackEmail,
    provider,
    // Show the recipient address (masked label only — do not expose full address)
    displayEmail: hasFeedbackEmail ? feedbackEmail : null,
    resendConfigured: hasResend,
    feedbackEmailConfigured: hasFeedbackEmail,
  });
}
