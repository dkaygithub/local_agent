import type { HEBSession } from './types.js';
export interface WeeklyAdOptions {
    storeCode?: string | number;
    category?: string | number;
    limit?: number;
    cursor?: string;
}
export interface WeeklyAdProduct {
    id: string;
    name: string;
    brand?: string;
    description?: string;
    imageUrl?: string;
    priceText?: string;
    saleStory?: string;
    disclaimerText?: string;
    validFrom?: string;
    validTo?: string;
    categories?: string[];
    upc?: string;
    skuId?: string;
    storeLocation?: string;
}
export interface WeeklyAdCategory {
    id: string;
    name: string;
    count: number;
}
export interface WeeklyAdResult {
    products: WeeklyAdProduct[];
    totalCount: number;
    validFrom?: string;
    validTo?: string;
    storeCode: string;
    categories: WeeklyAdCategory[];
    cursor?: string;
}
export declare function getWeeklyAdProducts(session: HEBSession, options?: WeeklyAdOptions): Promise<WeeklyAdResult>;
/**
 * Format weekly ad products for display.
 */
export declare function formatWeeklyAd(adResults: WeeklyAdResult): string;
/**
 * Format weekly ad categories for display.
 */
export declare function formatWeeklyAdCategories(adResults: WeeklyAdResult): string;
//# sourceMappingURL=weekly-ad.d.ts.map