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
 */
export function getDB(): D1Database | null {
  try {
    return getRequestContext().env.txt_sanitizer_d1 ?? null;
  } catch {
    // getRequestContext() throws outside of a Cloudflare Workers/Pages context
    return null;
  }
}

/**
 * Returns a Cloudflare environment variable by name.
 * Falls back to process.env for local development.
 */
export function getCfEnv(key: keyof CloudflareEnv): string | undefined {
  try {
    const val = getRequestContext().env[key];
    if (val) return val as string;
  } catch {
    // Not in CF context
  }
  return process.env[key as string] as string | undefined;
}
