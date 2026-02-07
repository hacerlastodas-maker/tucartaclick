'use client';

import { useCartStore } from '@/store/cartStore';
import { motion } from 'framer-motion';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CartItemList } from './cart/CartItemList';
import { CartUpsell } from './cart/CartUpsell';
import { CartSummary } from './cart/CartSummary';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
    const { items, updateItemQuantity, getTotalPrice, openDrawer, clearCart, addToCart } = useCartStore();
    const router = useRouter();

    if (!isOpen) return null;

    const cartTotal = getTotalPrice();

    const handleCheckout = () => {
        onClose();
        router.push('/checkout');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 40, stiffness: 400 }}
                className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Crystal UI Standardized */}
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={24} className="text-gray-900" />
                            <h2 className="text-2xl font-bold text-gray-900">Tu Pedido</h2>
                        </div>
                        {items.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
                                        clearCart();
                                    }
                                }}
                                className="text-xs text-red-500 font-medium hover:bg-red-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                            >
                                <Trash2 size={14} />
                                Vaciar
                            </button>
                        )}
                    </div>
                </div>

                {/* Floating Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X size={20} className="text-gray-600" />
                </button>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Empty State */}
                    {items.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <ShoppingBag size={32} className="text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-medium">Tu carrito está vacío</p>
                            <button onClick={onClose} className="text-primary font-bold hover:underline">
                                Ver Productos
                            </button>
                        </div>
                    ) : (
                        <>
                            <CartItemList
                                items={items}
                                onUpdateQuantity={updateItemQuantity}
                                onEdit={(item) => {
                                    openDrawer(item, item);
                                    onClose();
                                    // FIX: Do not push to URL. Editing is an internal state.
                                    // router.push(`/?product=${item.id}`, { scroll: false }); 
                                }}
                            />

                            <CartUpsell
                                items={items}
                                onAdd={(p) => addToCart(p, [], 1)}
                                onOpenDrawer={openDrawer}
                            />
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {items.length > 0 && (
                    <CartSummary
                        total={cartTotal}
                        onCheckout={handleCheckout}
                    />
                )}
            </motion.div>
        </motion.div >
    );
}
