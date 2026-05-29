/**
 * Cloudflare Pages / Workers environment bindings type declarations.
 *
 * Augments the CloudflareEnv interface from @cloudflare/next-on-pages
 * so TypeScript knows about our D1 database binding and other env vars.
 *
 * Binding names here MUST match those in wrangler.toml exactly.
 * We don't import @cloudflare/workers-types to avoid adding a dependency —
 * instead we declare D1Database inline as the minimal interface we need.
 */

// Minimal D1 interface — matches the actual Cloudflare D1 API shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface D1PreparedStatement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bind(...values: any[]): D1PreparedStatement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  first<T = any>(): Promise<T | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  all<T = any>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface CloudflareEnv {
  // D1 Database — binding name must match [[d1_databases]] binding in wrangler.toml
  txt_sanitizer_d1: D1Database;

  // ── Admin ──────────────────────────────────────────────────────────────────
  ADMIN_PASSWORD: string;

  // ── Email (Resend API) ─────────────────────────────────────────────────────
  // Primary email provider — edge-compatible, no Node.js required
  RESEND_API_KEY: string;
  // Recipient inbox for feedback submissions
  FEEDBACK_EMAIL: string;

  // ── Legacy / deprecated ────────────────────────────────────────────────────
  // GMAIL_USER can still serve as a fallback recipient if FEEDBACK_EMAIL is not set.
  // GMAIL_APP_PASSWORD is NOT used — Gmail SMTP requires Node.js runtime (incompatible
  // with Cloudflare Pages Edge). These can be safely removed.
  GMAIL_USER: string;
  GMAIL_APP_PASSWORD: string;
}
