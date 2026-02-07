'use client';

import { memo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useShopStatus } from '@/hooks/useShopStatus';

interface DrawerFooterProps {
    quantity: number;
    setQuantity: (q: number) => void;
    total: number;
    isValid: boolean;
    onSave: () => void;
    firstInvalidGroup?: string;
    isEditing: boolean;
}

export const DrawerFooter = memo(function DrawerFooter({
    quantity,
    setQuantity,
    total,
    isValid,
    onSave,
    firstInvalidGroup,
    isEditing
}: DrawerFooterProps) {
    const { isOpen } = useShopStatus();

    return (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-4 items-stretch z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            {/* Quantity */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2">
                <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 active:scale-95 disabled:opacity-50"
                    disabled={quantity <= 1}
                ><Minus size={16} /></button>
                <span className="text-xl font-bold w-6 text-center">{quantity}</span>
                <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-900 active:scale-95"
                ><Plus size={16} /></button>
            </div>

            {/* Add Button */}
            <button
                onClick={onSave}
                disabled={!isOpen || !isValid}
                className={cn(
                    "flex-1 flex flex-col items-center justify-center rounded-xl transition-all duration-200 transform-gpu",
                    "active:scale-[0.98] active:shadow-none", // Tactile depth: Button sinks in
                    !isOpen ? "bg-gray-400 cursor-not-allowed" :
                        isValid ? "bg-black text-white shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-0.5" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
            >
                <span className="text-sm font-medium opacity-90">
                    {!isOpen ? "Cerrado" :
                        !isValid ? `Falta: ${firstInvalidGroup}` :
                            isEditing ? "Guardar" : "Agregar"}
                </span>
                <span className="text-lg font-bold leading-none">{formatPrice(total)}</span>
            </button>
        </div>
    );
});
