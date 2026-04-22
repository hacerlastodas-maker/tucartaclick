'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';

interface DrawerHeaderProps {
    product: Product;
}

export const DrawerHeader = memo(function DrawerHeader({ product }: DrawerHeaderProps) {
    return (
        <div className="flex flex-col w-full shrink-0">
            <div className="relative w-full h-64 overflow-hidden shrink-0">
                <motion.img
                    layoutId={`image-${product.id}`}
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain bg-white"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-bold text-white leading-tight shadow-black/50 drop-shadow-md">
                        {product.name}
                    </h2>
                </div>
            </div>
            {product.description && (
                <div className="px-4 pt-4 pb-2 bg-white">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {product.description}
                    </p>
                </div>
            )}
        </div>
    );
});
