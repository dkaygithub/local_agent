/**
 * Base error for all H-E-B API errors.
 */
export declare class HEBError extends Error {
    readonly code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
/**
 * Authentication-related errors.
 * Thrown when login fails, 2FA is required, or session is invalid.
 */
export declare class HEBAuthError extends HEBError {
    constructor(message: string, code?: string);
}
/**
 * Session-related errors.
 * Thrown when session is expired, missing, or cookies are stale.
 */
export declare class HEBSessionError extends HEBError {
    constructor(message: string, code?: string);
}
/**
 * Cart operation errors.
 * Thrown when add/update/remove cart operations fail.
 */
export declare class HEBCartError extends HEBError {
    constructor(message: string, code?: string);
}
/**
 * Product-related errors.
 * Thrown when product lookup fails or product is unavailable.
 */
export declare class HEBProductError extends HEBError {
    constructor(message: string, code?: string);
}
/**
 * Search-related errors.
 */
export declare class HEBSearchError extends HEBError {
    constructor(message: string, code?: string);
}
//# sourceMappingURL=errors.d.ts.map