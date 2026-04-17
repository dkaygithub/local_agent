/**
 * Fulfillment slot operations (Delivery and Curbside Pickup).
 *
 * @module fulfillment
 */
import type { Address, HEBSession, FulfillmentType } from "./types.js";
export interface FulfillmentSlot {
    slotId: string;
    date: Date;
    startTime: string;
    endTime: string;
    formattedStartTime: string;
    formattedEndTime: string;
    formattedDate: string;
    localDate: string;
    fee: number;
    isAvailable: boolean;
    raw?: any;
}
/**
 * Options for fetching fulfillment slots.
 */
export interface GetFulfillmentSlotsOptions {
    /** Number of days to fetch (default: 14) */
    days?: number;
    /** Delivery address (required for delivery) */
    address?: Address;
    /** Store number (required for curbside) */
    storeNumber?: number;
}
/**
 * Options for fetching delivery slots.
 */
export interface GetDeliverySlotsOptions {
    /** Delivery address */
    address: Address;
    /** Number of days to fetch (default: 14) */
    days?: number;
}
/**
 * Options for fetching curbside pickup slots.
 */
export interface GetCurbsideSlotsOptions {
    /** Store number */
    storeNumber: number;
    /** Number of days to fetch (default: 14) */
    days?: number;
}
/**
 * Result of a reservation attempt.
 */
export interface ReserveSlotResult {
    success: boolean;
    /** Cart/order ID from the reservation */
    orderId?: string;
    /** ISO 8601 timestamp when the reservation expires */
    expiresAt?: string;
    /** Formatted expiry time (e.g., "3:40pm") */
    expiresAtFormatted?: string;
    /** User-friendly deadline message (e.g., "Place your order by 3:40pm to keep this time") */
    deadlineMessage?: string;
    raw?: any;
}
/**
 * Get available delivery slots.
 *
 * @param session - Active HEB session
 * @param options - Slot options
 * @returns Available delivery slots
 */
export declare function getDeliverySlots(session: HEBSession, options: GetDeliverySlotsOptions): Promise<FulfillmentSlot[]>;
/**
 * Get available curbside pickup slots for a store.
 *
 * @param session - Active HEB session
 * @param options - Slot options with storeNumber
 * @returns Available curbside pickup slots
 */
export declare function getCurbsideSlots(session: HEBSession, options: GetCurbsideSlotsOptions): Promise<FulfillmentSlot[]>;
/**
 * Reserve a fulfillment slot (Delivery or Curbside).
 *
 * @param session - Active HEB session
 * @param options - Reservation options
 * @returns Whether reservation succeeded
 */
export declare function reserveSlot(session: HEBSession, options: {
    slotId: string;
    date: string;
    fulfillmentType: FulfillmentType;
    storeId: string | number;
    address?: Address;
}): Promise<ReserveSlotResult>;
/**
 * Format delivery slots for display.
 */
export declare function formatDeliverySlots(slots: FulfillmentSlot[], debug?: boolean): string;
/**
 * Format curbside slots for display.
 */
export declare function formatCurbsideSlots(slots: FulfillmentSlot[], debug?: boolean): string;
//# sourceMappingURL=fulfillment.d.ts.map