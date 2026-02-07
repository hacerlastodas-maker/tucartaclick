'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartModal } from './CartModal';
import { formatPrice } from '@/lib/utils';

export function StickyCart() {
    const totalItems = useCartStore((state) => state.getTotalItems());
    const totalPrice = useCartStore((state) => state.getTotalPrice());

    // Global Cart State
    const isCartOpen = useCartStore((state) => state.isCartOpen);
    const openCart = useCartStore((state) => state.openCart);
    const closeCart = useCartStore((state) => state.closeCart);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <>
            <AnimatePresence>
                {isMounted && totalItems > 0 && !isCartOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-4 left-4 right-4 z-40 max-w-[500px] mx-auto"
                    >
                        <div className="bg-white text-gray-900 rounded-full shadow-2xl py-2 px-6 flex items-center justify-between border border-gray-200 ring-1 ring-black/5">
                            <div className="flex flex-col pl-2">
                                <span className="text-gray-500 text-[10px] uppercase tracking-wide font-bold">{totalItems} ítems</span>
                                <span className="text-base font-black text-gray-900 leading-tight">Total: {formatPrice(totalPrice)}</span>
                            </div>

                            <motion.button
                                key={totalItems} // Triggers animation on change
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 0.2 }}
                                onClick={openCart}
                                className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition-all hover:bg-gray-800"
                            >
                                <span>Ver Pedido</span>
                                <ShoppingBag size={16} className="stroke-[2.5]" />
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isCartOpen && (
                    <CartModal
                        isOpen={isCartOpen}
                        onClose={closeCart}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
