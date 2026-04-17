import type { HEBCookies, HEBSession } from './types.js';
/**
 * Parse cookies from a Cookie header string or browser export.
 *
 * Accepts:
 * - Cookie header string: "sat=xxx; reese84=yyy; ..."
 * - JSON array from browser DevTools: Copy as JSON from Application > Cookies
 */
export declare function parseCookies(input: string): HEBCookies;
/**
 * Create a session from manually extracted cookies.
 *
 * @example
 * // Option 1: From cookie header (copy from browser DevTools Network tab)
 * const session = createSessionFromCookies('sat=xxx; reese84=yyy; ...');
 *
 * // Option 2: From JSON export (Chrome DevTools > Application > Cookies > right-click > Copy all)
 * const session = createSessionFromCookies('[{"name":"sat","value":"xxx"},...]');
 *
 * // Then use for requests
 * fetch('https://www.heb.com/graphql', { headers: session.headers, ... });
 */
export declare function createSessionFromCookies(cookieInput: string): HEBSession;
//# sourceMappingURL=cookies.d.ts.map