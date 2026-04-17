import { HEBSession } from './types.js';
export interface Store {
    storeNumber: string;
    name: string;
    address: {
        streetAddress: string;
        city: string;
        state: string;
        zip: string;
    };
    distanceMiles?: number;
}
export interface StoreSearchResult {
    stores: Store[];
}
/**
 * Search for H-E-B stores by address, zip, or city.
 */
export declare function searchStores(session: HEBSession, query: string, radius?: number): Promise<Store[]>;
/**
 * Set the store context for the session.
 * This sets the CURR_SESSION_STORE cookie and performs a fulfillment selection request to ensure server-side context.
 */
export declare function setStore(session: HEBSession, storeId: string): Promise<void>;
/**
 * Format store search results for display.
 */
export declare function formatStoreSearch(stores: Store[], query: string): string;
//# sourceMappingURL=stores.d.ts.map