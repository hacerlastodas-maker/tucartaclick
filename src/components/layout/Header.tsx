import Link from 'next/link';
import { ShoppingBag, Search } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface HeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
    const totalItems = useCartStore((state) => state.getTotalItems());
    const openCart = useCartStore((state) => state.openCart); // Global Action
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all h-[56px]">
                <div className="max-w-[1200px] mx-auto w-full h-full px-4 py-2 flex items-center gap-3">
                    {/* Left: Brand Identity (Home Link) */}
                    <Link href="/" className="flex-shrink-0">
                        <BrandLogo />
                    </Link>

                    {/* Center: Search Bar Integration (Pill Shape) */}
                    <div className="flex-1 max-w-md mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar..."
                            className="block w-full pl-9 pr-4 py-2 bg-gray-100/50 border-none rounded-full text-base focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none h-10 shadow-inner"
                        />
                    </div>

                    {/* Right: Cart Action */}
                    <button
                        onClick={openCart}
                        className="relative p-2 text-gray-800 hover:opacity-70 rounded-full transition-colors active:scale-95 flex-shrink-0 aspect-square flex items-center justify-center"
                    >
                        <ShoppingBag size={24} className="stroke-[2.5]" />

                        {isMounted && totalItems > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full ring-2 ring-white animate-in zoom-in spin-in-180 duration-300">
                                {totalItems}
                            </span>
                        )}
                    </button>
                </div>
            </header>
        </>
    );
}
