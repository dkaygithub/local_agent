import type { HEBSession } from './types.js';
export interface CheckoutResult {
    success: boolean;
    errors: string[];
    raw: unknown;
}
export interface CommitCheckoutResult {
    success: boolean;
    orderId: string | null;
    errors: string[];
    raw: unknown;
}
/**
 * Begin checkout for the current cart.
 *
 * Validates the cart, reserved timeslot, and payment method. Does NOT
 * place the order — call {@link commitCheckout} after reviewing.
 */
export declare function checkoutCart(session: HEBSession): Promise<CheckoutResult>;
/**
 * Commit checkout and place the order.
 *
 * Charges the default payment method on file and creates the order.
 *
 * @param session - Active HEB session
 * @param tosToken - Terms-of-service acknowledgement token. Defaults to
 *   the literal string `"TEST_TOKEN"`, which is the value observed in
 *   captured traffic from a successfully placed curbside order. The name
 *   looks like a placeholder but is the actual accepted value; override
 *   only if H-E-B's API changes.
 */
export declare function commitCheckout(session: HEBSession, tosToken?: string): Promise<CommitCheckoutResult>;
//# sourceMappingURL=checkout.d.ts.map