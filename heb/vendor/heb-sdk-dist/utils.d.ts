/**
 * Utility functions for the HEB client.
 *
 * @module utils
 */
/**
 * HEB operates in Central Time (Texas). All slot times should be displayed
 * in this timezone for consistency with HEB's in-store experience.
 */
export declare const HEB_TIMEZONE = "America/Chicago";
/**
 * Format an ISO date string to a 12-hour time in HEB's timezone (e.g., "8:00pm").
 *
 * @param isoString - ISO 8601 timestamp (e.g., "2026-01-15T02:00:00Z")
 * @returns Formatted time string in Central Time (e.g., "8:00pm")
 */
export declare function formatSlotTime(isoString: string): string;
/**
 * Format an ISO date string to a human-readable date in HEB's timezone.
 *
 * @param isoString - ISO 8601 timestamp (e.g., "2026-01-15T02:00:00Z")
 * @returns Formatted date string (e.g., "Wednesday, Jan 14")
 */
export declare function formatSlotDate(isoString: string): string;
/**
 * Format an ISO date string to a short date in HEB's timezone (e.g., "1/14/2026").
 *
 * @param isoString - ISO 8601 timestamp
 * @returns Formatted short date string
 */
export declare function formatSlotDateShort(isoString: string): string;
/**
 * Get the date portion (YYYY-MM-DD) from an ISO timestamp in HEB's timezone.
 * This is useful for grouping slots by local date rather than UTC date.
 *
 * @param isoString - ISO 8601 timestamp
 * @returns Date string in YYYY-MM-DD format (in Central Time)
 */
export declare function getLocalDateString(isoString: string): string;
/**
 * Format an ISO date string to a 12-hour time (e.g., "3:40pm").
 * Uses HEB's timezone for consistent display.
 *
 * @deprecated Use formatSlotTime instead for slot-related formatting
 */
export declare function formatExpiryTime(isoString: string): string;
/**
 * Format a number as USD currency (e.g., "$26.44").
 *
 * @param amount - Amount in dollars
 * @returns Formatted currency string
 */
export declare function formatCurrency(amount: number): string;
/**
 * Clean HTML tags and entities from text.
 * Converts <br> to newlines, decodes common entities, and strips other tags.
 *
 * @param text - Raw text with HTML tags and entities
 * @returns Cleaned text
 */
export declare function cleanHtml(text?: string): string | undefined;
//# sourceMappingURL=utils.d.ts.map