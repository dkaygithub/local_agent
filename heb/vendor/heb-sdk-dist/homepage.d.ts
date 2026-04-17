/**
 * Homepage content operations.
 *
 * @module homepage
 */
import type { HEBSession } from './types.js';
/**
 * Banner displayed on the homepage (hero or grid).
 */
export interface HomepageBanner {
    id: string;
    title?: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    position: number;
}
/**
 * Promotional content on the homepage.
 */
export interface HomepagePromotion {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    linkUrl?: string;
}
/**
 * Featured product displayed on the homepage.
 */
export interface HomepageFeaturedProduct {
    productId: string;
    name: string;
    brand?: string;
    imageUrl?: string;
    priceFormatted?: string;
    price?: number;
}
/**
 * Generic item in a homepage section.
 */
export type HomepageItem = HomepageBanner | HomepagePromotion | HomepageFeaturedProduct | {
    id: string;
    type: string;
    name: string;
    [key: string]: unknown;
};
/**
 * Content section on the homepage.
 */
export interface HomepageSection {
    id: string;
    type: string;
    title?: string;
    itemCount: number;
    items: HomepageItem[];
}
/**
 * Complete homepage data.
 */
export interface HomepageData {
    banners: HomepageBanner[];
    promotions: HomepagePromotion[];
    featuredProducts: HomepageFeaturedProduct[];
    sections: HomepageSection[];
}
/**
 * Options for filtering and limiting homepage data.
 */
export interface HomepageOptions {
    /**
     * Maximum number of sections to return (default: unlimited).
     */
    maxSections?: number;
    /**
     * Maximum items to include per section (default: unlimited).
     * Set to 0 to exclude item content entirely.
     */
    maxItemsPerSection?: number;
    /**
     * Section types to include (whitelist). If provided, only matching types are returned.
     * Case-insensitive partial match (e.g., "carousel" matches "ContentDeliveryTextLinkCarousel").
     */
    includeSectionTypes?: string[];
    /**
     * Section types to exclude (blacklist). Excluded after include filter.
     * Case-insensitive partial match.
     */
    excludeSectionTypes?: string[];
    /**
     * Whether to populate the top-level `banners` array (default: true).
     */
    includeBanners?: boolean;
    /**
     * Whether to populate the top-level `promotions` array (default: true).
     */
    includePromotions?: boolean;
    /**
     * Whether to populate the top-level `featuredProducts` array (default: true).
     */
    includeFeaturedProducts?: boolean;
    /**
     * Only include sections that have a title (default: false).
     */
    onlyTitledSections?: boolean;
}
/**
 * Get the H-E-B homepage content.
 *
 * Returns featured banners, promotions, and product sections.
 * Requires a bearer session for the mobile GraphQL API.
 *
 * @param session - Active HEB session
 * @param options - Optional filtering/limiting options
 * @returns Homepage data with banners, promotions, and sections
 *
 * @example
 * // Get all homepage content
 * const homepage = await getHomepage(session);
 *
 * @example
 * // Get only titled sections with max 5 items each
 * const homepage = await getHomepage(session, {
 *   onlyTitledSections: true,
 *   maxItemsPerSection: 5,
 * });
 *
 * @example
 * // Get only carousel sections, no banners/promos
 * const homepage = await getHomepage(session, {
 *   includeSectionTypes: ['carousel'],
 *   includeBanners: false,
 *   includePromotions: false,
 * });
 */
export declare function getHomepage(session: HEBSession, options?: HomepageOptions): Promise<HomepageData>;
/**
 * Format homepage data for display.
 */
export declare function formatHomepageData(homepage: HomepageData): string;
//# sourceMappingURL=homepage.d.ts.map