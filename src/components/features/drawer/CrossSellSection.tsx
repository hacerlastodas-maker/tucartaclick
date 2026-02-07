'use client';

import { useMemo, useState, memo } from 'react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { PRODUCTS } from '@/data';
import { formatPrice, cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';

interface CrossSellSectionProps {
    relatedIds: string[];
}

export const CrossSellSection = memo(function CrossSellSection({ relatedIds }: CrossSellSectionProps) {
    const { addToCart } = useCartStore();
    const [addingId, setAddingId] = useState<string | null>(null);

    const relatedProducts = useMemo(() => {
        if (!relatedIds || relatedIds.length === 0) return [];
        return PRODUCTS.filter(p => relatedIds.includes(p.id));
    }, [relatedIds]);

    if (relatedProducts.length === 0) return null;

    const handleAddSuggestion = (e: React.MouseEvent, suggestion: Product) => {
        e.preventDefault();
        e.stopPropagation(); // CRITICAL: Bubbling protection
        e.nativeEvent.stopImmediatePropagation(); // CRITICAL: Extra shielding

        setAddingId(suggestion.id);
        addToCart(suggestion, [], 1); // Add with no modifiers

        setTimeout(() => {
            setAddingId(null);
        }, 1500);
    };

    return (
        <div className="mt-6 px-4 pb-4">
            <h3 className="text-lg font-bold mb-3">Completa tu orden</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {relatedProducts.map(suggestion => {
                    const isAdding = addingId === suggestion.id;
                    return (
                        <div
                            key={suggestion.id}
                            className="flex-shrink-0 w-32 border rounded-xl overflow-hidden bg-white shadow-sm flex flex-col"
                        >
                            <div className="h-24 bg-gray-100 relative">
                                <img
                                    src={suggestion.imageUrl}
                                    alt={suggestion.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-2 flex-1 flex flex-col">
                                <h4 className="text-xs font-semibold leading-tight mb-1 line-clamp-2 min-h-[2rem]">
                                    {suggestion.name}
                                </h4>
                                <p className="text-xs text-gray-500 mb-2 font-mono">
                                    {formatPrice(suggestion.price)}
                                </p>
                                <button
                                    onClick={(e) => handleAddSuggestion(e, suggestion)}
                                    disabled={isAdding}
                                    className={cn(
                                        "mt-auto w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1",
                                        isAdding
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 text-gray-900 hover:bg-gray-200 active:scale-95"
                                    )}
                                >
                                    {isAdding ? (
                                        <>
                                            <Check size={12} />
                                            <span>Listo</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={12} />
                                            <span>Agregar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
