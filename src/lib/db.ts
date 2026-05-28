/**
 * Shared D1 database helper.
 *
 * Uses getRequestContext() from @cloudflare/next-on-pages — the ONLY
 * correct way to access Cloudflare bindings (D1, KV, R2, env vars)
 * inside a next-on-pages Edge runtime route.
 *
 * The binding name `txt_sanitizer_d1` must match the `binding` field in wrangler.toml:
 *   [[d1_databases]]
 *   binding = "txt_sanitizer_d1"
 *
 * The CloudflareEnv interface (including txt_sanitizer_d1) is declared in env.d.ts.
 */

import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * Returns the D1 database binding, or null when not running in a
 * Cloudflare Pages context (e.g. local Next.js dev server).
 *
 * Tries getRequestContext().env first (the documented next-on-pages approach),
 * then falls back to process.env which Cloudflare also populates with bindings.
 */
export function getDB(): D1Database | null {
  // Primary: use getRequestContext (documented next-on-pages approach)
  try {
    const db = getRequestContext().env.txt_sanitizer_d1;
    if (db) return db;
  } catch {
    // getRequestContext() throws outside of a Cloudflare Workers/Pages context
  }

  // Fallback: Cloudflare also exposes D1 bindings on process.env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processDb = (process.env as any).txt_sanitizer_d1;
  if (processDb && typeof processDb === 'object') return processDb as D1Database;

  return null;
}

/**
 * Returns a Cloudflare environment variable by name.
 * Falls back to process.env for local development.
 */
export function getCfEnv(key: keyof CloudflareEnv): string | undefined {
  // Primary: use getRequestContext (documented next-on-pages approach)
  try {
    const val = getRequestContext().env[key];
    if (val) return val as string;
  } catch {
    // Not in CF context
  }

  // Fallback to process.env (works for string vars in CF Pages)
  return process.env[key as string] as string | undefined;
}
