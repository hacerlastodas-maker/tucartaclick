'use client';

import { useMemo } from 'react';
import { Product, CartItem } from '@/types';
import { PRODUCTS } from '@/data';
import { formatPrice } from '@/lib/utils';

interface CartUpsellProps {
    items: CartItem[];
    onAdd: (product: Product) => void;
    onOpenDrawer: (product: Product) => void;
}

export function CartUpsell({ items, onAdd, onOpenDrawer }: CartUpsellProps) {
    // Optimized Recommendation Logic
    const upsellProducts = useMemo(() => {
        if (items.length === 0) return [];

        const cartIds = new Set(items.map(i => i.id));
        const relatedIds = new Set<string>();

        // Collect all related IDs from current cart items
        items.forEach(item => {
            if (item.relatedIds) {
                item.relatedIds.forEach(id => relatedIds.add(id));
            }
        });

        // Filter: Must be in relatedIds AND NOT already in cart
        return PRODUCTS.filter(p => relatedIds.has(p.id) && !cartIds.has(p.id));
    }, [items]);

    if (upsellProducts.length === 0) return null;

    const handleUpsellClick = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();
        const hasModifiers = product.modifiers && product.modifiers.length > 0;
        const hasExtendedOptions = product.extended_options && product.extended_options.length > 0;

        if (hasModifiers || hasExtendedOptions) {
            onOpenDrawer(product);
        } else {
            onAdd(product);
        }
    };

    return (
        <div className="pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <span>✨</span> ¿Qué tal si agregas?
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {upsellProducts.map(product => (
                    <div key={product.id} className="min-w-[140px] w-[140px] bg-white rounded-2xl p-2 border border-gray-100 shadow-sm flex flex-col gap-2 shrink-0">
                        <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden relative">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatPrice(product.price)}</p>
                        </div>
                        <button
                            onClick={(e) => handleUpsellClick(e, product)}
                            className="w-full bg-black text-white text-xs font-bold py-2 rounded-lg hover:bg-gray-800 active:scale-95 transition-all"
                        >
                            Agregar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
