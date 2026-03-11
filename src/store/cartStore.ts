import { create } from 'zustand';

import { CartItem, Product, Modifier, Coupon } from '../types';
import { COUPONS } from '../data';

interface CartState {
    items: CartItem[];
    selectedProduct: Product | null;
    editingItem: CartItem | null;
    isDrawerOpen: boolean;
    isCartOpen: boolean; // NEW: Global Cart State

    // Coupon State
    appliedCoupon: Coupon | null;

    addToCart: (product: Product, modifiers: Modifier[], quantity?: number) => void;
    updateItemQuantity: (id: string, modifiers: Modifier[], quantity: number) => void;
    editCartItem: (oldItem: CartItem, newModifiers: Modifier[], newQuantity: number) => void;
    removeFromCart: (id: string, modifiers: Modifier[]) => void;
    clearCart: () => void;

    openDrawer: (product: Product, existingItem?: CartItem) => void;
    closeDrawer: () => void;

    openCart: () => void; // NEW
    closeCart: () => void; // NEW
    applyCoupon: (code: string) => void;
    removeCoupon: () => void;

    getTotalPrice: () => number;
    getDiscountAmount: () => number;
    getFinalPrice: () => number;
    getTotalItems: () => number;
}

/**
 * Pure helper to compare modifier arrays for equality.
 * Exported for reuse in other components.
 */
export const areModifiersEqual = (mods1: Modifier[], mods2: Modifier[]): boolean => {
    if (mods1.length !== mods2.length) return false;
    // Sort by ID for consistent comparison
    const sorted1 = [...mods1].sort((a, b) => a.id.localeCompare(b.id));
    const sorted2 = [...mods2].sort((a, b) => a.id.localeCompare(b.id));
    return sorted1.every((m, i) =>
        m.id === sorted2[i].id && m.quantity === sorted2[i].quantity
    );
};

export const useCartStore = create<CartState>()((set, get) => ({
    items: [],
    selectedProduct: null,
    editingItem: null,
    isDrawerOpen: false,
    isCartOpen: false, // Fix: Initialize new state
    appliedCoupon: null,

    addToCart: (product, modifiers, quantity = 1) => {
        set((state) => {
            const existingItemIndex = state.items.findIndex(
                (item) => item.id === product.id && areModifiersEqual(item.modifiers, modifiers)
            );

            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                // FIX: Immutable update
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + quantity
                };
                return { items: newItems };
            }

            return {
                items: [
                    ...state.items,
                    { ...product, quantity, modifiers: [...modifiers] }
                ]
            };
        });
    },

    updateItemQuantity: (id, modifiers, quantity) => {
        set((state) => {
            if (quantity <= 0) {
                return {
                    items: state.items.filter(
                        (item) => !(item.id === id && areModifiersEqual(item.modifiers, modifiers))
                    )
                };
            }

            return {
                items: state.items.map((item) =>
                    (item.id === id && areModifiersEqual(item.modifiers, modifiers))
                        ? { ...item, quantity }
                        : item
                )
            };
        });
    },

    editCartItem: (oldItem, newModifiers, newQuantity) => {
        set((state) => {
            // 1. Find the index of the item being edited
            const oldItemIndex = state.items.findIndex(i =>
                i.id === oldItem.id && areModifiersEqual(i.modifiers, oldItem.modifiers)
            );

            if (oldItemIndex === -1) return {}; // Item not found, do nothing

            // 2. Check if moving to this new state would collide with ANOTHER existing item
            // (Collision means: Different index, same Product ID, same New Modifiers)
            const mergeTargetIndex = state.items.findIndex((item, index) =>
                index !== oldItemIndex &&
                item.id === oldItem.id &&
                areModifiersEqual(item.modifiers, newModifiers)
            );

            if (mergeTargetIndex > -1) {
                // MERGE STRATEGY:
                // Add quantity to target, remove old item
                const newItems = [...state.items];
                newItems[mergeTargetIndex].quantity += newQuantity;
                newItems.splice(oldItemIndex, 1);
                return { items: newItems };
            }

            // UPDATE STRATEGY:
            // In-place update, maintaining order
            const newItems = [...state.items];
            newItems[oldItemIndex] = {
                ...newItems[oldItemIndex],
                modifiers: [...newModifiers],
                quantity: newQuantity
            };
            return { items: newItems };
        });
    },

    removeFromCart: (id, modifiers) => {
        set((state) => ({
            items: state.items.filter(
                (item) => !(item.id === id && areModifiersEqual(item.modifiers, modifiers))
            )
        }));
    },

    clearCart: () => set({ items: [], appliedCoupon: null }), // Clear coupon too

    openDrawer: (product, existingItem) => set({
        selectedProduct: product,
        editingItem: existingItem || null,
        isDrawerOpen: true,
        isCartOpen: false // Close cart when opening drawer to avoid overlap
    }),
    closeDrawer: () => set({ selectedProduct: null, editingItem: null, isDrawerOpen: false }),

    openCart: () => set({ isCartOpen: true }),
    closeCart: () => set({ isCartOpen: false }),

    applyCoupon: (code) => {
        const normalizedCode = code.toUpperCase().trim();
        const coupon = COUPONS.find(c => c.code === normalizedCode);
        if (coupon) {
            set({ appliedCoupon: coupon });
        }
    },

    removeCoupon: () => set({ appliedCoupon: null }),

    getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => {
            const itemBasePrice = item.price;
            const modifiersCost = item.modifiers.reduce((sum, mod) => sum + (mod.price * mod.quantity), 0);
            return total + (itemBasePrice + modifiersCost) * item.quantity;
        }, 0);
    },

    getDiscountAmount: () => {
        const { appliedCoupon, getTotalPrice } = get();
        if (!appliedCoupon) return 0;

        const subtotal = getTotalPrice();

        if (appliedCoupon.type === 'FIXED') {
            return Math.min(appliedCoupon.value, subtotal); // Cannot discount more than total
        } else if (appliedCoupon.type === 'PERCENT') {
            return Math.round(subtotal * (appliedCoupon.value / 100));
        }
        return 0;
    },

    getFinalPrice: () => {
        const { getTotalPrice, getDiscountAmount } = get();
        return Math.max(0, getTotalPrice() - getDiscountAmount());
    },

    getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
    }
})
);
