import { Category } from '@/types';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
    categories: Category[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
    return (
        <div className="sticky top-[56px] z-40 bg-gray-50 border-b border-gray-200 shadow-sm">
            <div className="max-w-[1200px] mx-auto w-full px-4 py-3">
                {/* Category Pills */}
                {/* -mx-4 px-4 trick allows edge-to-edge scrolling on mobile while keeping alignment on desktop if needed, 
                   but strictly user asked for container alignment. 
                   We will use a simple container logic first. If they want edge-to-edge mobile scroll, we adjust. */}
                {/* -ml-1 px-1 adjustment ensures shadows aren't clipped on the left while keeping visual alignment */}
                {/* -ml-1 px-1 adjustment ensures shadows aren't clipped on the left while keeping visual alignment */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar items-center pb-1 px-1 -ml-1 w-full touch-pan-x snap-x snap-mandatory sm:snap-none">
                    {/* Added pb-1 to prevent shadow clipping at bottom */}
                    <button
                        onClick={() => onSelect('all')}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm flex-shrink-0 active:scale-95",
                            selectedId === 'all'
                                ? "bg-black text-white border-black transform scale-105"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                        )}
                    >
                        Todo
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border shadow-sm flex-shrink-0 active:scale-95",
                                selectedId === cat.id
                                    ? "bg-black text-white border-black transform scale-105"
                                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
