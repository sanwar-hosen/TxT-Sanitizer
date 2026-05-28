/**
 * GET /api/admin/email-status
 * Returns whether email sending is configured (admin-only).
 * Reads server-side env vars — NEVER exposes secrets to the client.
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
  const gmailUser = getCfEnv('GMAIL_USER');
  const gmailPass = getCfEnv('GMAIL_APP_PASSWORD');

  const hasResend = Boolean(resendApiKey);
  const hasGmail = Boolean(gmailUser && gmailPass);

  // Determine which provider is active
  let provider: 'resend' | 'gmail' | null = null;
  let displayEmail: string | null = null;

  if (hasResend) {
    provider = 'resend';
    // Show the Gmail address as the recipient (if set), else show generic
    displayEmail = gmailUser ?? null;
  } else if (hasGmail) {
    provider = 'gmail';
    displayEmail = gmailUser ?? null;
  }

  return NextResponse.json({
    configured: provider !== null,
    provider,
    displayEmail,
    // Mask the API key — just show whether it's set
    resendConfigured: hasResend,
    gmailConfigured: hasGmail,
  });
}
