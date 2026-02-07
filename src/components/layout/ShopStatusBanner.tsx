'use client';

import { useShopStatus } from '@/hooks/useShopStatus';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

export function ShopStatusBanner() {
    const { isOpen, nextOpenTime } = useShopStatus();

    if (isOpen) return null;

    return (
        <div className="bg-red-600 border-b border-red-700 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
            <Clock size={16} />
            <span>LOCAL CERRADO. Abrimos a las {nextOpenTime}</span>
        </div>
    );
}
