export interface RawDisplayPrice {
    unit?: string;
    formattedAmount?: string;
    amount?: number;
}
export interface RawContextPrice {
    context?: string;
    isOnSale?: boolean;
    isPriceCut?: boolean;
    priceType?: string;
    listPrice?: RawDisplayPrice;
    salePrice?: RawDisplayPrice;
    unitListPrice?: RawDisplayPrice;
    unitSalePrice?: RawDisplayPrice;
}
export interface RawNutritionLabel {
    servingsPerContainer?: string;
    servingSize?: string;
    calories?: string;
    nutrients?: Array<{
        title?: string;
        unit?: string;
        percentage?: string;
        subItems?: Array<{
            title?: string;
            unit?: string;
            percentage?: string;
        }>;
    }>;
}
export interface MobileProduct {
    productId?: string;
    skus?: Array<{
        id?: string;
        contextPrices?: RawContextPrice[];
        productAvailability?: string[];
        customerFriendlySize?: string;
    }>;
    displayName?: string;
    productCategory?: {
        name?: string;
    };
    brand?: {
        name?: string;
        isOwnBrand?: boolean;
    };
    productLocation?: {
        availability?: string;
        location?: string;
    };
    carouselImageUrls?: string[];
    inAssortment?: boolean;
    inventory?: {
        inventoryState?: string;
    };
    ingredientStatement?: string;
    productDescription?: string;
    preparationInstructions?: string;
    safetyWarning?: string;
    nutritionLabels?: RawNutritionLabel[];
    isAvailableForCheckout?: boolean;
    maximumOrderQuantity?: number;
}
export interface NutritionInfo {
    servingSize?: string;
    servingsPerContainer?: string;
    calories?: number;
    totalFat?: string;
    saturatedFat?: string;
    transFat?: string;
    cholesterol?: string;
    sodium?: string;
    totalCarbs?: string;
    fiber?: string;
    sugars?: string;
    protein?: string;
}
export interface ProductPrice {
    amount: number;
    formatted: string;
    wasPrice?: {
        amount: number;
        formatted: string;
    };
    unitPrice?: {
        amount: number;
        unit: string;
        formatted: string;
    };
}
export interface FulfillmentInfo {
    curbside: boolean;
    delivery: boolean;
    inStore: boolean;
    aisleLocation?: string;
}
export interface Product {
    productId: string;
    skuId: string;
    name: string;
    brand?: string;
    isOwnBrand?: boolean;
    description?: string;
    longDescription?: string;
    /** Raw HTML description from source */
    rawDescription?: string;
    imageUrl?: string;
    images?: string[];
    price?: ProductPrice;
    nutrition?: NutritionInfo;
    fulfillment?: FulfillmentInfo;
    ingredients?: string;
    upc?: string;
    size?: string;
    category?: string;
    categoryPath?: string[];
    isAvailable?: boolean;
    inStock?: boolean;
    maxQuantity?: number;
    productUrl?: string;
}
export declare function parseNutrition(labels?: RawNutritionLabel[]): NutritionInfo | undefined;
export declare function mapMobileFulfillment(availability?: string[]): FulfillmentInfo | undefined;
export declare function mapMobileProduct(product: MobileProduct, shoppingContext: string, options?: {
    includeImages?: boolean;
    fallbackProductId?: string;
}): Product;
//# sourceMappingURL=product-mapper.d.ts.map