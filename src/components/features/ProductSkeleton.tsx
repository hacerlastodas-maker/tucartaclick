import { cn } from '@/lib/utils';

export function ProductSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full relative p-0 animate-pulse">
            {/* Image Placeholder */}
            <div className="aspect-square w-full bg-gray-200" />

            {/* Content Placeholder */}
            <div className="p-3 flex flex-col flex-1 gap-2">
                {/* Title */}
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />

                {/* Description (only visible on SM, but we keep skeleton consistent or simplify) */}
                <div className="h-3 bg-gray-100 rounded w-full hidden sm:block" />

                {/* Price Area */}
                <div className="mt-auto pt-2 flex items-end justify-between">
                    <div className="h-5 bg-gray-200 rounded w-16" />
                    {/* Add Button Circle placeholder */}
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                </div>
            </div>
        </div>
    );
}
