/**
 * Shopping list operations.
 *
 * @module shopping-list
 */
import type { HEBSession } from './types.js';
/**
 * Shopping list summary (from list of all lists).
 */
export interface ShoppingList {
    /** Unique list ID */
    id: string;
    /** List name */
    name: string;
    /** Number of items in the list */
    itemCount: number;
    /** Store associated with the list */
    store: {
        id: number;
        name: string;
    };
    /** When the list was created */
    createdAt: Date;
    /** When the list was last updated */
    updatedAt: Date;
}
/**
 * Pagination details for shopping lists.
 */
export interface ShoppingListsPageInfo {
    /** Current page number (API uses 0-indexed pages). */
    page: number;
    /** Page size. */
    size: number;
    /** Total number of shopping lists. */
    totalCount: number;
    /** Sort field used by the API. */
    sort: string;
    /** Sort direction used by the API. */
    sortDirection: string;
    /** Whether more pages are available. */
    hasMore: boolean;
    /** Next page number, if available. */
    nextPage?: number;
}
/**
 * Shopping list collection with pagination info.
 */
export interface ShoppingListsResult {
    lists: ShoppingList[];
    pageInfo: ShoppingListsPageInfo;
}
/**
 * Item in a shopping list.
 */
export interface ShoppingListItem {
    /** Unique item ID within the list */
    id: string;
    /** Product ID */
    productId: string;
    /** Product name */
    name: string;
    /** Brand name (if available) */
    brand?: string;
    /** Whether item is checked off */
    checked: boolean;
    /** Quantity */
    quantity: number;
    /** Weight (for weighted items) */
    weight?: number;
    /** Note attached to item */
    note?: string;
    /** Category/group header */
    category: string;
    /** Price information */
    price: {
        /** Total price for quantity */
        total: number;
        /** List price per unit */
        listPrice: number;
        /** Sale price per unit (if on sale) */
        salePrice: number;
        /** Whether item is on sale */
        onSale: boolean;
    };
    /** Inventory status */
    inStock: boolean;
    /** Image URL */
    imageUrl?: string;
}
/**
 * Full shopping list with items.
 */
export interface ShoppingListDetails {
    /** Unique list ID */
    id: string;
    /** List name */
    name: string;
    /** List description */
    description?: string;
    /** User's role for this list (e.g., 'ADMIN') */
    role: string;
    /** Visibility level (e.g., 'PRIVATE') */
    visibility: string;
    /** Store associated with the list */
    store: {
        id: number;
        name: string;
    };
    /** When the list was created */
    createdAt: Date;
    /** When the list was last updated */
    updatedAt: Date;
    /** Items in the list */
    items: ShoppingListItem[];
    /** Pagination info for list items */
    pageInfo?: {
        page: number;
        size: number;
        totalCount?: number;
        hasMore?: boolean;
    };
}
/**
 * Options for fetching a shopping list.
 */
export interface GetShoppingListOptions {
    /** Page number (0-indexed, default: 0) */
    page?: number;
    /** Page size (default: 500) */
    size?: number;
    /** Sort field (default: 'CATEGORY') */
    sort?: 'CATEGORY' | 'LAST_UPDATED' | 'NAME';
    /** Sort direction (default: 'ASC') */
    sortDirection?: 'ASC' | 'DESC';
}
/**
 * Get all shopping lists for the current user.
 *
 * @param session - Active HEB session
 * @returns List of shopping lists
 *
 * @example
 * const lists = await getShoppingLists(session);
 * console.log(`You have ${lists.length} shopping lists`);
 * lists.forEach(list => console.log(`- ${list.name} (${list.itemCount} items)`));
 */
export declare function getShoppingLists(session: HEBSession): Promise<ShoppingListsResult>;
/**
 * Get a specific shopping list with its items.
 *
 * @param session - Active HEB session
 * @param listId - Shopping list ID
 * @param options - Pagination and sorting options
 * @returns Shopping list with items
 *
 * @example
 * const list = await getShoppingList(session, '66f00f64-5c8e-4f59-96e9-b3a00f280660');
 * console.log(`${list.name} has ${list.items.length} items`);
 * list.items.forEach(item => {
 *   const status = item.checked ? '[x]' : '[ ]';
 *   console.log(`${status} ${item.name} x${item.quantity} - $${item.price.total.toFixed(2)}`);
 * });
 */
export declare function getShoppingList(session: HEBSession, listId: string, options?: GetShoppingListOptions): Promise<ShoppingListDetails>;
/**
 * Format shopping lists for display.
 */
export declare function formatShoppingLists(lists: ShoppingList[]): string;
/**
 * Format a single shopping list with items for display.
 */
export declare function formatShoppingList(list: ShoppingListDetails): string;
//# sourceMappingURL=shopping-list.d.ts.map