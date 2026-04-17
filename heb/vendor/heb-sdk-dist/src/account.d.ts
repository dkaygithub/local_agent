/**
 * Account profile operations.
 *
 * @module account
 */
import type { HEBSession } from './types.js';
/**
 * User address.
 */
export interface AccountAddress {
    id: string;
    nickname?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
}
/**
 * Account profile details.
 */
export interface AccountDetails {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    memberSince?: string;
    loyaltyNumber?: string;
    addresses: AccountAddress[];
}
/**
 * Get account profile details.
 *
 * Fetches the user's profile information including name, email, phone,
 * and saved addresses.
 * Requires a bearer session for the mobile GraphQL API.
 *
 * @param session - Active HEB session
 * @returns Account details
 *
 * @example
 * const details = await getAccountDetails(session);
 * console.log(`Welcome, ${details.firstName}!`);
 * console.log(`Email: ${details.email}`);
 */
export declare function getAccountDetails(session: HEBSession): Promise<AccountDetails>;
/**
 * Format account details for display.
 */
export declare function formatAccountDetails(account: AccountDetails): string;
//# sourceMappingURL=account.d.ts.map