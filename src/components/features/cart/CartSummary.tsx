'use client';

import { ArrowRight } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useShopStatus } from '@/hooks/useShopStatus';

interface CartSummaryProps {
    total: number;
    onCheckout: () => void;
}

export function CartSummary({ total, onCheckout }: CartSummaryProps) {
    const { isOpen: isStoreOpen } = useShopStatus();

    return (
        <div className="p-4 pt-4 pb-8 sm:pb-4 border-t border-gray-100 bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-3xl z-10 relative">
            <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-gray-500">Total Estimado</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(total)}</span>
            </div>
            <button
                onClick={onCheckout}
                disabled={!isStoreOpen}
                className={cn(
                    "w-full font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 group",
                    isStoreOpen
                        ? "bg-gray-900 hover:bg-black text-white active:scale-[0.98]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
            >
                {!isStoreOpen ? (
                    <span>Local Cerrado 🔒</span>
                ) : (
                    <>
                        <span>IR A PAGAR</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
            <p className="text-center text-[10px] text-gray-400 mt-2">
                El costo de envío se calculará en el siguiente paso.
            </p>
        </div>
    );
}
