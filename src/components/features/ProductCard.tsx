'use client';

import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useShopStatus } from '@/hooks/useShopStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptic';
import { useState, useEffect } from 'react';
import { cn, formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { openDrawer, items } = useCartStore();
    const { isOpen } = useShopStatus();
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = product.imageUrl;
        if (img.complete) {
            setIsImageLoaded(true);
        }
    }, [product.imageUrl]);

    // Calculate total quantity of this product in cart
    const productQuantity = items
        .filter(item => item.id === product.id)
        .reduce((acc, item) => acc + item.quantity, 0);

    const router = useRouter(); // Move hook call to top level if needed, but imported from navigation

    const handleClick = (e: React.MouseEvent) => {
        if (!isOpen) return;
        triggerHaptic();
        router.push(`/?product=${product.id}`, { scroll: false });
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isOpen) return;
        triggerHaptic();
        router.push(`/?product=${product.id}`, { scroll: false });
    };

    // Sale Calculation
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount && product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice!) * 100)
        : 0;

    return (
        <div
            onClick={handleClick}
            className={cn(
                "w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-row h-[190px] transition-all transform-gpu group", // Added group for hover effects
                isOpen ? "cursor-pointer active:scale-[0.98]" : "opacity-75 cursor-not-allowed grayscale-[0.5]"
            )}
        >
            {/* Left: Image (45%) */}
            <div className="w-[45%] relative bg-gray-100">
                {!isImageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}

                {/* Sale Badge (Smaller for horizontal) */}
                {hasDiscount && (
                    <div className="absolute top-1 left-1 z-10 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        -{discountPercent}%
                    </div>
                )}

                <motion.img
                    layoutId={`image-${product.id}`}
                    src={product.imageUrl}
                    alt={product.name}
                    className={cn(
                        "w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-110", // Living Image Effect
                        isImageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => setIsImageLoaded(true)}
                />


            </div>

            {/* Right: Content (55%) */}
            <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed mb-2">{product.description}</p>
                </div>

                {/* Strong Action Button */}
                <button
                    className={cn(
                        "w-full mt-auto py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95",
                        isOpen ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-gray-200 text-gray-400"
                    )}
                >
                    <ShoppingCart size={16} strokeWidth={2.5} />
                    <span className="text-xs font-bold whitespace-nowrap">
                        Agregar por {formatPrice(product.price)}
                    </span>
                </button>
            </div>
        </div>
    );
}
