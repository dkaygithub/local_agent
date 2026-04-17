import type { HEBSession } from './types.js';
import { type Product } from './product-mapper.js';
/**
 * Search options.
 */
export interface SearchOptions {
    limit?: number;
    storeId?: string | number;
    shoppingContext?: string;
    searchMode?: 'MAIN_SEARCH' | 'BIA_SEARCH';
    includeImages?: boolean;
}
/**
 * Search result structure.
 */
export interface SearchResult {
    products: Product[];
    totalCount: number;
    page: number;
    hasNextPage: boolean;
    nextCursor?: string;
    searchContextToken?: string;
    facets?: Array<{
        key: string;
        label: string;
        values: Array<{
            value: string;
            count: number;
        }>;
    }>;
}
/**
 * Typeahead suggestion (search term).
 */
export interface TypeaheadSuggestion {
    term: string;
    type: 'recent' | 'trending' | 'keyword';
}
/**
 * Typeahead response with categorized suggestions.
 */
export interface TypeaheadResult {
    recentSearches: string[];
    trendingSearches: string[];
    allTerms: string[];
}
/**
 * Search for products using the mobile GraphQL API.
 * Requires a bearer session.
 *
 * @example
 * const results = await searchProducts(session, 'milk', { limit: 20 });
 * console.log(results.products);
 */
export declare function searchProducts(session: HEBSession, query: string, options?: SearchOptions): Promise<SearchResult>;
/**
 * Get "Buy It Again" products (previously purchased items).
 * Requires a bearer session.
 *
 * @example
 * const results = await getBuyItAgain(session, { limit: 20 });
 * console.log(results.products);
 */
export declare function getBuyItAgain(session: HEBSession, options?: SearchOptions): Promise<SearchResult>;
/**
 * Get typeahead/autocomplete suggestions.
 *
 * Returns recent searches and trending searches from HEB.
 *
 * @example
 * const result = await typeahead(session, 'pea');
 * console.log('Recent:', result.recentSearches);
 * console.log('Trending:', result.trendingSearches);
 */
export declare function typeahead(session: HEBSession, query: string): Promise<TypeaheadResult>;
//# sourceMappingURL=search.d.ts.map