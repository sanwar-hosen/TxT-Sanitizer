/**
 * Admin auth helper.
 * - Session cookie name: `admin_session`
 * - Value: the ADMIN_PASSWORD itself (simple, single-user)
 * - HttpOnly, SameSite=Strict, Secure
 */

export const ADMIN_COOKIE = 'admin_session';
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 h in seconds

/**
 * Returns true if the request carries a valid admin session cookie.
 */
export function isAdminAuthorized(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...rest] = c.trim().split('=');
      return [k, rest.join('=')];
    })
  );
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return cookies[ADMIN_COOKIE] === password;
}

/**
 * Builds a Set-Cookie header string for the admin session.
 */
export function buildSessionCookie(password: string): string {
  return [
    `${ADMIN_COOKIE}=${password}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Builds a Set-Cookie header that clears the admin session.
 */
export function buildClearCookie(): string {
  return `${ADMIN_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict`;
}
