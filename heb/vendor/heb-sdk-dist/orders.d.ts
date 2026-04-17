/**
 * Order history operations.
 *
 * @module orders
 */
import type { GraphQLResponse } from './api.js';
import type { HEBSession } from './types.js';
/**
 * Raw order object from order history list.
 */
export interface RawHistoryOrder {
    orderId: string;
    orderStatusMessageShort?: string;
    status?: string;
    orderChangesOverview?: {
        reviewChangesEligible?: boolean;
        unfulfilledCount?: number;
        __typename?: string;
    };
    fulfillmentType?: string;
    store?: {
        name?: string;
        latitude?: number;
        longitude?: number;
        __typename?: string;
    };
    orderTimeslot?: {
        startTime?: string;
        endTime?: string;
        startDateTime?: string;
        endDateTime?: string;
        formattedStartTime?: string;
        formattedEndTime?: string;
        formattedDate?: string;
        __typename?: string;
    };
    totalPrice?: {
        formattedAmount?: string;
        __typename?: string;
    };
    priceDetails?: {
        total?: {
            formattedAmount?: string;
        };
    };
    productCount?: number;
    __typename?: string;
}
/**
 * Raw order history response (mobile GraphQL).
 */
export interface OrderHistoryResponse {
    pageProps: {
        orders?: RawHistoryOrder[];
        [key: string]: unknown;
    };
    pagination?: {
        page: number;
        size: number;
        hasMore: boolean;
        nextPage?: number;
        activeCount: number;
        completedCount: number;
    };
    [key: string]: unknown;
}
/**
 * Normalized order item (from orderItems array).
 */
export interface OrderDetailsItem {
    /** Product ID */
    id: string;
    /** Product display name */
    name: string;
    /** Quantity ordered */
    quantity: number;
    /** Formatted price string (e.g., "$26.44") */
    price: string;
    /** Unit price as a number (in dollars, NOT cents) */
    unitPrice: number;
    /** Thumbnail image URL */
    image?: string;
}
/**
 * Normalized order details payload (from mobile GraphQL).
 */
export interface OrderDetailsPageOrder {
    orderId: string;
    status: string;
    /** Normalized order items */
    items: OrderDetailsItem[];
    priceDetails?: {
        subtotal?: {
            formattedAmount?: string;
        };
        total?: {
            formattedAmount?: string;
        };
        tax?: {
            formattedAmount?: string;
        };
    };
    fulfillmentType?: string;
    orderPlacedOnDateTime?: string;
    orderTimeslot?: {
        startDateTime?: string;
        endDateTime?: string;
        formattedStartTime?: string;
        formattedEndTime?: string;
        formattedDate?: string;
    };
    [key: string]: unknown;
}
export interface OrderDetailsPageResponse {
    pageProps?: {
        order?: OrderDetailsPageOrder;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
/**
 * Raw order details response (GraphQL persisted query).
 */
export interface OrderDetailsGraphqlResponse {
    orderDetails?: OrderDetailsOrder;
    orderDetailsRequest?: {
        order?: OrderDetailsOrder;
    };
}
/**
 * Order details order structure from orderDetails query.
 */
export interface OrderDetailsOrder {
    orderId?: string;
    status?: string;
    orderStatusMessageShort?: string;
    fulfillmentType?: string;
    orderPlacedOnDateTime?: string;
    priceDetails?: {
        subtotal?: {
            formattedAmount?: string;
        };
        total?: {
            formattedAmount?: string;
        };
        tax?: {
            formattedAmount?: string;
        };
    };
    orderTimeslot?: {
        startTime?: string;
        endTime?: string;
        startDateTime?: string;
        endDateTime?: string;
    };
    store?: {
        id?: string;
        name?: string;
        address?: string;
    };
    orderItems?: Array<{
        quantity: number;
        product: {
            id: string;
            fullDisplayName: string;
            thumbnailImageUrls?: Array<{
                size: string;
                url: string;
            }>;
            SKUs?: Array<{
                id: string;
            }>;
        };
        totalUnitPrice?: {
            amount?: number;
            formattedAmount?: string;
        };
        unitPrice?: {
            amount?: number;
            formattedAmount?: string;
        };
    }>;
    readyOrder?: {
        orderId?: string;
        status?: string;
    };
}
/**
 * Raw order details response (mobile GraphQL).
 */
export interface OrderDetailsResponse {
    page: OrderDetailsPageResponse;
    graphql: GraphQLResponse<OrderDetailsGraphqlResponse>;
}
/**
 * Options for fetching orders.
 */
export interface GetOrdersOptions {
    page?: number;
    size?: number;
}
/**
 * Get order history (mobile GraphQL).
 *
 * @param session - Active HEB bearer session
 * @param options - Pagination options
 * @returns Raw order history response
 */
export declare function getOrders(session: HEBSession, options?: GetOrdersOptions): Promise<OrderHistoryResponse>;
/**
 * Get a single order by ID (mobile GraphQL).
 *
 * Uses the dedicated orderDetails operation for efficient single-order fetching.
 *
 * @param session - Active HEB bearer session
 * @param orderId - Order ID (e.g., "HEB24702750622")
 * @param includeReadyOrder - Include ready order status info (default: true)
 * @returns Raw order details response
 */
export declare function getOrder(session: HEBSession, orderId: string, includeReadyOrder?: boolean): Promise<OrderDetailsResponse>;
/**
 * Format order history list for display.
 */
export declare function formatOrderHistory(orders: RawHistoryOrder[]): string;
/**
 * Format full order details for display.
 */
export declare function formatOrderDetails(order: OrderDetailsPageOrder): string;
//# sourceMappingURL=orders.d.ts.map