'use client';

import { useState, useEffect, Suspense } from 'react';
import { SearchX } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { CategoryFilter } from '@/components/features/CategoryFilter';
import { ProductCard } from '@/components/features/ProductCard';
import { ProductSkeleton } from '@/components/features/ProductSkeleton';
import { StickyCart } from '@/components/features/StickyCart';
import { ProductDrawer } from '@/components/features/ProductDrawer';
import { CATEGORIES, PRODUCTS } from '@/data';

import { normalizeText } from '@/lib/utils';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading or just wait for mount
    // Adding a small delay to make the skeleton visible and smooth transition
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    if (!searchQuery) return matchesCategory;

    const normalizedQuery = normalizeText(searchQuery);
    const normalizedName = normalizeText(p.name);
    const normalizedDesc = normalizeText(p.description);

    const matchesSearch = normalizedName.includes(normalizedQuery) ||
      normalizedDesc.includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-transparent pb-32">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <CategoryFilter
        categories={CATEGORIES}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="p-4 w-full max-w-[1200px] mx-auto">
        {searchQuery && filteredProducts.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            {/* Icon Sutil */}
            <div className="bg-white/10 p-4 rounded-full mb-4">
              <SearchX className="w-8 h-8 text-white/60" />
            </div>

            {/* Mensaje */}
            <p className="text-white text-lg font-medium mb-1">
              No encontramos "{searchQuery}" 🥢
            </p>
            <p className="text-gray-300 text-sm mb-6">
              Intenta buscar otra cosa o ve nuestros Rolls favoritos.
            </p>

            {/* Botón de Reset */}
            <button
              onClick={() => setSearchQuery('')}
              className="text-primary hover:underline font-bold text-sm transition-colors"
            >
              Ver todo el menú
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        )}
      </div>

      <StickyCart />
      <Suspense fallback={null}>
        <ProductDrawer />
      </Suspense>
    </main>
  );
}
