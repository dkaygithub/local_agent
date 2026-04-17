import type { HEBSession } from "./types.js";
import { type Product } from "./product-mapper.js";
export type { NutritionInfo, ProductPrice, FulfillmentInfo, Product, } from "./product-mapper.js";
export interface GetProductOptions {
    includeImages?: boolean;
}
/**
 * Get full product details by product ID.
 *
 * Uses the mobile GraphQL API which returns comprehensive product info
 * including SKU ID, nutrition, aisle location, and fulfillment options.
 *
 * @param session - Active HEB bearer session
 * @param productId - Product ID
 * @param options - Options for fetching details
 *
 * @example
 * const product = await getProductDetails(session, '1875945');
 * console.log(`${product.name} - SKU: ${product.skuId}`);
 * console.log(`Price: ${product.price?.formatted}`);
 */
export declare function getProductDetails(session: HEBSession, productId: string, options?: GetProductOptions): Promise<Product>;
/**
 * Get just the SKU ID for a product.
 * Useful when you have a product ID and need the SKU for cart operations.
 *
 * @example
 * const skuId = await getProductSkuId(session, '1875945');
 * await addToCart(session, '1875945', skuId, 2);
 */
export declare function getProductSkuId(session: HEBSession, productId: string): Promise<string>;
/**
 * Build product image URL.
 * HEB images follow a predictable pattern.
 *
 * @param productId - Product ID
 * @param size - Image dimensions (default 360x360)
 *
 * @example
 * const imageUrl = getProductImageUrl('1875945', 500);
 * // https://images.heb.com/is/image/HEBGrocery/1875945?hei=500&wid=500
 */
export declare function getProductImageUrl(productId: string, size?: number): string;
/**
 * Format a product for list display (e.g. search results).
 */
export declare function formatProductListItem(p: Product, index: number): string;
/**
 * Format full product details.
 */
export declare function formatProductDetails(product: Product): string;
//# sourceMappingURL=product.d.ts.map