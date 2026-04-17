import type { HEBSession } from './types.js';
/**
 * Price display structure.
 */
export interface DisplayPrice {
    amount: number;
    formatted: string;
}
/**
 * Cart item structure.
 */
export interface CartItem {
    productId: string;
    skuId: string;
    name?: string;
    quantity: number;
    price?: DisplayPrice;
    imageUrl?: string;
    brand?: string;
    inStock?: boolean;
}
/**
 * Payment group in the cart.
 */
export interface PaymentGroup {
    paymentGroupId: string;
    paymentMethod: string;
    amount: DisplayPrice;
    paymentAlias?: string;
}
/**
 * Fee applied to the cart (e.g., delivery, curbside).
 */
export interface CartFee {
    id: string;
    displayName: string;
    feeType: string;
    amount: DisplayPrice;
    description?: string;
}
/**
 * Full cart contents (from getCart query).
 */
export interface Cart {
    id: string;
    items: CartItem[];
    /** Total item count reported by the server (sum of all quantities). */
    itemCount: number;
    /**
     * True if the server reported more items than were returned in the items array.
     * When true, the UI should indicate truncation (e.g., "Showing 12 of 22 items").
     */
    isTruncated: boolean;
    subtotal: DisplayPrice;
    total: DisplayPrice;
    tax?: DisplayPrice;
    savings?: DisplayPrice;
    paymentGroups: PaymentGroup[];
    fees: CartFee[];
}
/**
 * Cart response from mutation (add/update/remove).
 */
export interface CartResponse {
    success: boolean;
    cart?: {
        items: CartItem[];
        itemCount: number;
        /**
         * True if the server reported more items than were returned in the items array.
         */
        isTruncated: boolean;
        subtotal?: DisplayPrice;
    };
    errors?: string[];
}
/**
 * Get the current cart contents.
 *
 * @param session - Active HEB session
 * @returns Full cart with items, pricing, payment groups, and fees
 *
 * @example
 * const cart = await getCart(session);
 * console.log(`Cart has ${cart.itemCount} items`);
 * console.log(`Subtotal: ${cart.subtotal.formatted}`);
 * console.log(`Total: ${cart.total.formatted}`);
 *
 * // Check fees
 * cart.fees.forEach(fee => {
 *   console.log(`${fee.displayName}: ${fee.amount.formatted}`);
 * });
 */
export declare function getCart(session: HEBSession): Promise<Cart>;
/**
 * Add or update an item in the cart.
 *
 * @param session - Active HEB session
 * @param productId - Product ID (platform-level)
 * @param skuId - SKU ID (inventory-level)
 * @param quantity - Quantity to set (not add)
 *
 * @example
 * // Add 4 protein bars to cart
 * const result = await addToCart(session, '2996503', '4122077587', 4);
 * if (result.success) {
 *   console.log(`Cart now has ${result.cart?.itemCount} items`);
 * }
 */
export declare function addToCart(session: HEBSession, productId: string, skuId: string, quantity: number): Promise<CartResponse>;
/**
 * Update cart item quantity.
 * Alias for addToCart - same mutation, just clearer intent.
 */
export declare const updateCartItem: typeof addToCart;
/**
 * Remove item from cart by setting quantity to 0.
 *
 * @example
 * await removeFromCart(session, '2996503', '4122077587');
 */
export declare function removeFromCart(session: HEBSession, productId: string, skuId: string): Promise<CartResponse>;
/**
 * Quick add - add 1 of an item to cart.
 */
export declare function quickAdd(session: HEBSession, productId: string, skuId: string): Promise<CartResponse>;
/**
 * Format cart for display.
 */
export declare function formatCart(cart: Cart): string;
//# sourceMappingURL=cart.d.ts.map