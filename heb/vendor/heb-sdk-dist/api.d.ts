import type { HEBSession } from './types.js';
/**
 * GraphQL request payload structure.
 */
export interface GraphQLPayload {
    operationName: string;
    variables: Record<string, unknown>;
    extensions?: {
        persistedQuery?: {
            version: number;
            sha256Hash: string;
        };
    };
}
/**
 * HEB API error structure.
 */
export interface HEBAPIError {
    message: string;
    extensions?: {
        code?: string;
        classification?: string;
    };
}
/**
 * GraphQL response wrapper.
 */
export interface GraphQLResponse<T> {
    data?: T;
    errors?: HEBAPIError[];
}
/**
 * Common HEB API error codes.
 */
export declare const ERROR_CODES: {
    readonly INVALID_PRODUCT_STORE: "INVALID_PRODUCT_STORE";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly NOT_FOUND: "NOT_FOUND";
};
/**
 * Execute a GraphQL request against the HEB API.
 */
export declare function graphqlRequest<T>(session: HEBSession, payload: GraphQLPayload): Promise<GraphQLResponse<T>>;
/**
 * Execute a persisted GraphQL query.
 */
export declare function persistedQuery<T>(session: HEBSession, operationName: string, variables: Record<string, unknown>): Promise<GraphQLResponse<T>>;
/**
 * Check if response contains specific error code.
 */
export declare function hasErrorCode(response: GraphQLResponse<unknown>, code: string): boolean;
/**
 * Extract error messages from response.
 */
export declare function getErrorMessages(response: GraphQLResponse<unknown>): string[];
//# sourceMappingURL=api.d.ts.map