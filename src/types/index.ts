/**
 * Unique Identifier Aliases
 * Improves code semantics and self-documentation.
 */
export type ProductId = string;
export type CategoryId = string;
export type OrderId = string;

/**
 * Common Enums / Union Types
 */
export type ShopStatus = 'open' | 'closed' | 'busy';
export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type CouponType = 'PERCENT' | 'FIXED';

export interface OptionItem {
    name: string;
    price: number;
}

export interface OptionGroup {
    /** Internal name of the group (e.g., "Salsas", "Bebidas") */
    name: string;
    /** Maximum number of items selectable. 1 = Radio behavior, >1 = Checkbox behavior */
    max_qty: number;
    items: OptionItem[];
}

export interface Product {
    id: ProductId;
    name: string;
    price: number;
    /** Price before discount, used to show strike-through pricing */
    originalPrice?: number;
    description: string;
    /** ID or Key of the category this product belongs to */
    category: string; // Kept as string to match possible Google Sheets mixed usage (Name vs ID)
    imageUrl: string;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;

    /** 
     * List of Product IDs suggested as cross-sell or upsell items.
     * Displayed in the "Relacionados" section of the drawer.
     */
    relatedIds: ProductId[];

    /**
     * @deprecated Legacy modifier system. Use `extended_options` for new "Mega Builder".
     */
    modifiers?: { name: string; price: number }[];

    /**
     * Extended options configuration for complex products (e.g., Rolls with steps).
     * Replaces the legacy `modifiers` system.
     */
    extended_options?: OptionGroup[];
}

export interface Modifier {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

/**
 * Represents an item inside the Shopping Cart.
 * Inherits all Product properties and adds Quantity + Selected Modifiers.
 */
export interface CartItem extends Product {
    quantity: number;
    /** List of selected optional items/modifiers */
    modifiers: Modifier[];
}

export interface Category {
    id: CategoryId;
    name: string;
}

export interface Coupon {
    code: string;
    type: CouponType;
    value: number;
}
