import { type AccountDetails } from './account.js';
import { type Cart, type CartResponse } from './cart.js';
import { type CheckoutResult, type CommitCheckoutResult } from './checkout.js';
import { type FulfillmentSlot, type ReserveSlotResult, type GetCurbsideSlotsOptions, type GetDeliverySlotsOptions } from './fulfillment.js';
import { type HomepageData } from './homepage.js';
import { type GetOrdersOptions, type OrderDetailsResponse, type OrderHistoryResponse } from './orders.js';
import { type GetProductImageBytesOptions, type Product, type ProductImage, type GetProductOptions } from './product.js';
import { type SearchOptions, type SearchResult, type TypeaheadResult } from './search.js';
import { type GetShoppingListOptions, type ShoppingListDetails, type ShoppingListsResult } from './shopping-list.js';
import { type Store } from './stores.js';
import type { Address, HEBSession, ShoppingContext } from './types.js';
import { type WeeklyAdOptions, type WeeklyAdResult } from './weekly-ad.js';
/**
 * Unified HEB API client.
 *
 * Wraps all API functions with a single session for convenient usage.
 *
 * @example
 * import { createTokenSession, HEBClient } from 'heb-sdk-unofficial';
 *
 * // Create session from OAuth tokens
 * const session = createTokenSession({ accessToken: '...', refreshToken: '...' });
 *
 * // Create client
 * const heb = new HEBClient(session);
 * await heb.setStore('790');
 *
 * // Search for products
 * const results = await heb.search('cinnamon rolls', { limit: 20 });
 *
 * // Get product details
 * const product = await heb.getProduct(results.products[0].productId);
 *
 * // Add to cart
 * await heb.addToCart(product.productId, product.skuId, 2);
 */
export declare class HEBClient {
    session: HEBSession;
    constructor(session: HEBSession);
    /**
     * Enable or disable detailed debug logging.
     */
    setDebug(enabled: boolean): void;
    /**
     * Check if the session is still valid.
     */
    isValid(): boolean;
    /**
     * Get information about the current session.
     */
    getSessionInfo(): {
        storeId: string;
        isValid: boolean;
        expiresAt: Date | undefined;
        shoppingContext: string;
    };
    /**
     * Search for products using the mobile GraphQL API.
     * Requires a bearer session.
     *
     * @param query - Search query
     * @param options - Search options
     *
     * @example
     * const results = await heb.search('cinnamon rolls', { limit: 20 });
     * console.log(`Found ${results.products.length} products`);
     */
    search(query: string, options?: SearchOptions): Promise<SearchResult>;
    /**
     * Get "Buy It Again" products (previously purchased items).
     * Requires a bearer session.
     *
     * @example
     * const results = await heb.getBuyItAgain({ limit: 20 });
     * console.log(`Found ${results.products.length} buy it again items`);
     */
    getBuyItAgain(options?: SearchOptions): Promise<SearchResult>;
    /**
     * Get typeahead/autocomplete suggestions.
     *
     * Returns recent searches and trending searches.
     * Note: These are search terms, not product results.
     *
     * @example
     * const result = await heb.typeahead('milk');
     * console.log('Recent:', result.recentSearches);
     * console.log('Trending:', result.trendingSearches);
     */
    typeahead(query: string): Promise<TypeaheadResult>;
    /**
     * Fetch weekly ad products for the current store.
     */
    getWeeklyAdProducts(options?: WeeklyAdOptions): Promise<WeeklyAdResult>;
    /**
     * Get full product details.
     * Requires a bearer session.
     *
     * @example
     * const product = await heb.getProduct('1875945');
     * console.log(product.name);        // H-E-B Bakery Two-Bite Cinnamon Rolls
     * console.log(product.brand);       // H-E-B
     * console.log(product.inStock);     // true
     * console.log(product.nutrition);   // { calories: 210, ... }
     */
    getProduct(productId: string, options?: GetProductOptions): Promise<Product>;
    /**
     * Get SKU ID for a product.
     */
    getSkuId(productId: string): Promise<string>;
    /**
     * Get product image URL.
     */
    getImageUrl(productId: string, size?: number): string;
    /**
     * Fetch product image bytes from the HEB CDN.
     *
     * Resolves the real carousel URL from product details (the deterministic
     * `/HEBGrocery/<id>` URL returns a placeholder logo for most IDs — the
     * actual asset lives at `/HEBGrocery/<zero-padded-id>-<n>`).
     *
     * Pass `options.url` to skip the lookup and fetch a specific URL directly.
     *
     * @example
     * const img = await heb.getProductImage('1875945', { size: 500 });
     * await fs.writeFile('rolls.jpg', img.bytes);
     */
    getProductImage(productId: string, options?: GetProductImageBytesOptions): Promise<ProductImage>;
    /**
     * Get the current cart contents.
     *
     * Returns full cart with items, pricing, payment groups, and fees.
     *
     * @example
     * const cart = await heb.getCart();
     * console.log(`Cart has ${cart.itemCount} items`);
     * console.log(`Subtotal: ${cart.subtotal.formatted}`);
     * cart.items.forEach(item => console.log(`${item.name} x${item.quantity}`));
     */
    getCart(): Promise<Cart>;
    /**
     * Add or update item in cart.
     *
     * @param productId - Product ID
     * @param skuId - SKU ID (optional, will be fetched if not provided)
     * @param quantity - Quantity to set (not add)
     *
     * @example
     * const product = await heb.getProduct('1875945');
     * await heb.addToCart(product.productId, product.skuId, 2);
     */
    addToCart(productId: string, skuId: string | undefined, quantity: number): Promise<CartResponse>;
    /**
     * Update cart item quantity.
     */
    updateCartItem(productId: string, skuId: string | undefined, quantity: number): Promise<CartResponse>;
    /**
     * Remove item from cart.
     */
    removeFromCart(productId: string, skuId: string): Promise<CartResponse>;
    /**
     * Quick add - set quantity to 1.
     */
    quickAdd(productId: string, skuId: string): Promise<CartResponse>;
    /**
     * Add to cart by product ID only.
     * Fetches SKU ID automatically.
     *
     * @example
     * // Simplest way to add a product
     * await heb.addToCartById('1875945', 2);
     */
    addToCartById(productId: string, quantity: number): Promise<CartResponse>;
    /**
     * Begin checkout for the current cart.
     *
     * Validates the cart, reserved timeslot, and payment method.
     * Does NOT place the order — call {@link commitCheckout} after reviewing.
     */
    checkoutCart(): Promise<CheckoutResult>;
    /**
     * Commit checkout and place the order.
     *
     * Charges the default payment method and creates the order.
     *
     * @param tosToken - Terms-of-service acknowledgement token
     */
    commitCheckout(tosToken?: string): Promise<CommitCheckoutResult>;
    /**
     * Get order history (mobile GraphQL payload).
     * Requires a bearer session.
     *
     * @example
     * const history = await heb.getOrders({ page: 1 });
     * const orders = history.pageProps?.orders ?? [];
     * console.log(`Found ${orders.length} orders`);
     */
    getOrders(options?: GetOrdersOptions): Promise<OrderHistoryResponse>;
    /**
     * Get order details.
     * Requires a bearer session.
     *
     * @param orderId - Order ID
     * @returns Raw order details payloads
     */
    getOrder(orderId: string): Promise<OrderDetailsResponse>;
    /**
     * Get account profile details.
     * Requires a bearer session.
     *
     * Returns the user's profile information including name, email,
     * phone, and saved addresses.
     *
     * @example
     * const account = await heb.getAccountDetails();
     * console.log(`Welcome, ${account.firstName}!`);
     * console.log(`Email: ${account.email}`);
     */
    getAccountDetails(): Promise<AccountDetails>;
    /**
     * Get the homepage content including banners, promotions, and featured products.
     * Requires a bearer session.
     *
     * @param options - Optional filtering/limiting options
     * @example
     * const homepage = await heb.getHomepage();
     * console.log(`Found ${homepage.banners.length} banners`);
     *
     * @example
     * // Get only titled carousel sections with max 5 items
     * const homepage = await heb.getHomepage({
     *   onlyTitledSections: true,
     *   includeSectionTypes: ['carousel'],
     *   maxItemsPerSection: 5,
     * });
     */
    getHomepage(options?: import('./homepage.js').HomepageOptions): Promise<HomepageData>;
    /**
     * Get all shopping lists for the current user.
     */
    getShoppingLists(): Promise<ShoppingListsResult>;
    /**
     * Get a specific shopping list with its items.
     */
    getShoppingList(listId: string, options?: GetShoppingListOptions): Promise<ShoppingListDetails>;
    /**
     * Get available delivery slots.
     */
    getDeliverySlots(options: GetDeliverySlotsOptions): Promise<FulfillmentSlot[]>;
    /**
     * Reserve a delivery slot.
     */
    reserveSlot(slotId: string, date: string, address: Address, storeId: string): Promise<ReserveSlotResult>;
    /**
     * Get available curbside pickup slots for a store.
     *
     * @param options - Options with storeNumber (required)
     * @example
     * const slots = await heb.getCurbsideSlots({ storeNumber: 790 });
     * slots.forEach(s => console.log(`${s.date.toLocaleDateString()} ${s.startTime}-${s.endTime}`));
     */
    getCurbsideSlots(options: GetCurbsideSlotsOptions): Promise<FulfillmentSlot[]>;
    /**
     * Reserve a curbside pickup slot.
     *
     * @param slotId - Slot ID from getCurbsideSlots
     * @param date - Date (YYYY-MM-DD)
     * @param storeId - Store ID
     */
    reserveCurbsideSlot(slotId: string, date: string, storeId: string): Promise<ReserveSlotResult>;
    /**
     * Search for H-E-B stores.
     *
     * @param query - Address, zip, or city (e.g. "78701", "Austin")
     * @example
     * const stores = await heb.searchStores('78701');
     * console.log(`Found ${stores.length} stores`);
     */
    searchStores(query: string): Promise<Store[]>;
    /**
     * Set the active store for the session.
     *
     * This updates the session cookie and makes a server request to
     * set the fulfillment context.
     *
     * @param storeId - Store ID (e.g. "790")
     */
    setStore(storeId: string): Promise<void>;
    /**
     * Set the shopping context for the session.
     *
     * @param context - CURBSIDE_PICKUP, CURBSIDE_DELIVERY, or EXPLORE_MY_STORE
     */
    setShoppingContext(context: ShoppingContext): void;
}
//# sourceMappingURL=client.d.ts.map