import type { HEBAuthTokens, HEBCookies, HEBEndpoints, HEBHeaders, HEBSession, ShoppingContext } from './types.js';
/**
 * Format cookies object into a Cookie header string.
 */
export declare function formatCookieHeader(cookies: HEBCookies): string;
/**
 * Build required headers for HEB GraphQL API requests.
 */
export declare function buildHeaders(cookies: HEBCookies): HEBHeaders;
export declare function buildBearerHeaders(tokens: HEBAuthTokens, options?: {
    userAgent?: string;
    clientName?: string;
    clientVersion?: string;
}): HEBHeaders;
export declare function normalizeHeaders(headers: HEBHeaders): Record<string, string>;
/**
 * Parse JWT expiration from sat cookie.
 * Returns undefined if parsing fails.
 */
export declare function parseJwtExpiry(sat: string): Date | undefined;
/**
 * Check if a session is still valid (not expired).
 */
export declare function isSessionValid(session: HEBSession): boolean;
export declare function isSessionAuthenticated(session: HEBSession): boolean;
/**
 * Create a session object from cookies and optional metadata.
 */
export declare function createSession(cookies: HEBCookies): HEBSession;
export declare function createTokenSession(tokens: HEBAuthTokens, options?: {
    cookies?: HEBCookies;
    endpoints?: Partial<HEBEndpoints>;
    userAgent?: string;
}): HEBSession;
export declare function updateTokenSession(session: HEBSession, tokens: HEBAuthTokens, options?: {
    userAgent?: string;
}): void;
export declare function ensureFreshSession(session: HEBSession): Promise<void>;
export declare function resolveEndpoint(session: HEBSession, key: keyof HEBEndpoints): string;
/**
 * Resolve the shopping context for the current session.
 * Defaults to 'CURBSIDE_PICKUP' if not set.
 */
export declare function resolveShoppingContext(session: HEBSession): ShoppingContext;
/**
 * Get the simplified shopping mode ('CURBSIDE' or 'ONLINE') from the context string.
 */
export declare function getShoppingMode(context: string): 'CURBSIDE' | 'ONLINE';
/**
 * Get information about the current session.
 */
export declare function getSessionInfo(session: HEBSession): {
    storeId: string;
    isValid: boolean;
    expiresAt: Date | undefined;
    shoppingContext: string;
};
//# sourceMappingURL=session.d.ts.map