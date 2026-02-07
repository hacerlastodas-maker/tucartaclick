'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProductOptions } from '@/hooks/useProductOptions';
import { DrawerHeader } from './drawer/DrawerHeader';
import { OptionGroupList } from './drawer/OptionGroupList';
import { CrossSellSection } from './drawer/CrossSellSection';
import { DrawerFooter } from './drawer/DrawerFooter';
import { PRODUCTS } from '@/data';

export function ProductDrawer() {
    const { selectedProduct, editingItem, isDrawerOpen, closeDrawer, addToCart, editCartItem, openDrawer } = useCartStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isGlassActive, setIsGlassActive] = useState(false);

    // FIX: Reconnect URL "Nerve" to Store
    useEffect(() => {
        const productId = searchParams.get('product');

        if (productId) {
            // CRITICAL GUARD: If we are currently EDITING an item, ignore the URL.
            // This prevents the URL from "resetting" the drawer to "New Item" mode.
            if (editingItem && editingItem.id === productId) {
                return;
            }

            // Case 1: URL has product, but Store doesn't (or has different one)
            if (!selectedProduct || selectedProduct.id !== productId) {
                const productToOpen = PRODUCTS.find(p => p.id === productId);
                if (productToOpen) {
                    console.log("[ProductDrawer] Syncing URL -> Store:", productToOpen.name);
                    openDrawer(productToOpen);
                }
            }
        } else {
            // Case 2: URL has no product, ensure Drawer is closed
            // Only close if we are NOT editing (editing might happen without URL param now)
            if (isDrawerOpen && !editingItem) {
                closeDrawer();
            }
        }
    }, [searchParams, selectedProduct, isDrawerOpen, openDrawer, closeDrawer, editingItem]);

    // Business Logic Hook
    const {
        quantity,
        setQuantity,
        selections,
        activeAccordion,
        setActiveAccordion,
        toggleOption,
        optionGroups,
        isValid,
        firstInvalidGroup,
        total,
        getFinalModifiers,
        isGroupSatisfied
    } = useProductOptions({
        product: selectedProduct || null,
        editingItem
    });

    // Handle Close / Deep Link
    const handleClose = () => {
        if (searchParams.has('product')) {
            router.back();
        } else {
            closeDrawer();
        }
    };

    // Save Action
    const handleSave = () => {
        if (!selectedProduct) return;
        const finalModifiers = getFinalModifiers();

        if (editingItem) {
            editCartItem(editingItem, finalModifiers, quantity);
            // FIX: Reopen cart if we were editing an item from the cart
            useCartStore.getState().openCart();
        } else {
            addToCart(selectedProduct, finalModifiers, quantity);
        }
        handleClose();
    };

    if (!selectedProduct) return null;

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
                    />

                    {/* Drawer Container */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 40, stiffness: 400, mass: 0.8 }}
                        onAnimationComplete={() => setIsGlassActive(true)}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-[70] border-t border-white/20 rounded-t-3xl shadow-2xl h-[92vh] flex flex-col overflow-hidden max-w-[600px] mx-auto transform-gpu",
                            "bg-white", // Solid White (No transparency)
                            // Removed backdrop-blur for performance & minimalism
                            "will-change-transform"
                        )}
                    >
                        {/* Close Button */}
                        <div className="absolute top-4 right-4 z-20">
                            <button onClick={handleClose} className="p-2 bg-black/10 rounded-full hover:bg-black/20 transition-colors active:scale-90">
                                <X size={20} className="text-gray-900" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto pb-32">
                            <DrawerHeader product={selectedProduct} />

                            <OptionGroupList
                                groups={optionGroups}
                                selections={selections}
                                activeAccordion={activeAccordion}
                                setActiveAccordion={setActiveAccordion}
                                toggleOption={toggleOption}
                                isGroupSatisfied={isGroupSatisfied}
                            />

                            <CrossSellSection relatedIds={selectedProduct.relatedIds} />
                        </div>

                        {/* Sticky Footer */}
                        <DrawerFooter
                            quantity={quantity}
                            setQuantity={setQuantity}
                            total={total}
                            isValid={isValid}
                            onSave={handleSave}
                            firstInvalidGroup={firstInvalidGroup}
                            isEditing={!!editingItem}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
