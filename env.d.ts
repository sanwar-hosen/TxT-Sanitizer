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

  // Environment variables (secrets set in Cloudflare Pages dashboard)
  ADMIN_PASSWORD: string;
  GMAIL_USER: string;
  GMAIL_APP_PASSWORD: string;
  // Optional: Resend API key for edge-compatible email sending (recommended over Gmail SMTP)
  RESEND_API_KEY: string;
  // Recipient email address for feedback submissions (set in Cloudflare Pages dashboard)
  // Falls back to GMAIL_USER if not set.
  FEEDBACK_EMAIL: string;
}
