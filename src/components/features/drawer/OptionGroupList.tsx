'use client';

import { memo } from 'react';
import { OptionGroup } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface OptionGroupListProps {
    groups: OptionGroup[];
    selections: Record<string, Set<string>>;
    activeAccordion: string | null;
    setActiveAccordion: (name: string | null) => void;
    toggleOption: (group: OptionGroup, optionName: string) => void;
    isGroupSatisfied: (group: OptionGroup) => boolean;
}

export const OptionGroupList = memo(function OptionGroupList({
    groups,
    selections,
    activeAccordion,
    setActiveAccordion,
    toggleOption,
    isGroupSatisfied
}: OptionGroupListProps) {
    return (
        <div className="p-4 space-y-4">
            {groups.map((group, groupIdx) => {
                const isOpenAccordion = activeAccordion === group.name;
                const isSatisfied = isGroupSatisfied(group);
                const isRequired = group.max_qty === 1;

                return (
                    <div key={groupIdx} className={cn(
                        "border rounded-xl overflow-hidden transition-all duration-300",
                        isOpenAccordion ? "border-primary/30 shadow-md bg-white" : "border-gray-100 bg-gray-50/50",
                        !isSatisfied && !isOpenAccordion ? "border-red-200 bg-red-50/30" : "" // Error hint
                    )}>
                        {/* Accordion Header */}
                        <button
                            onClick={() => setActiveAccordion(isOpenAccordion ? null : group.name)}
                            className="w-full flex items-center justify-between p-4 text-left"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className={cn("font-bold text-gray-900", !isSatisfied && "text-red-600")}>
                                        {group.name}
                                    </h3>
                                    {isSatisfied ? (
                                        <Check size={16} className="text-green-500" />
                                    ) : (
                                        <span className="bg-red-100 text-red-600 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                                            Requerido
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {isRequired ? "Elige 1 opción" : `Elige hasta ${group.max_qty}`}
                                </p>
                            </div>
                            <div className={cn(
                                "transition-transform duration-300",
                                isOpenAccordion ? "rotate-180" : ""
                            )}>
                                <ChevronDown size={20} className="text-gray-400" />
                            </div>
                        </button>

                        {/* Accordion Content */}
                        <AnimatePresence>
                            {isOpenAccordion && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className={cn(
                                        "p-4 pt-0 gap-3",
                                        group.items.length > 5 ? "grid grid-cols-2" : "flex flex-col"
                                    )}>
                                        {group.items.map((item, itemIdx) => {
                                            const isSelected = selections[group.name]?.has(item.name);
                                            return (
                                                <div
                                                    key={itemIdx}
                                                    onClick={() => toggleOption(group, item.name)}
                                                    className={cn(
                                                        "relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all active:scale-[0.98]",
                                                        isSelected
                                                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0",
                                                        isSelected ? "bg-primary border-primary text-white" : "bg-white border-gray-300"
                                                    )}>
                                                        {isSelected && <Check size={12} strokeWidth={4} />}
                                                    </div>
                                                    <div className="flex-1 leading-none">
                                                        <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-gray-700")}>
                                                            {item.name}
                                                        </span>
                                                        {item.price > 0 && (
                                                            <span className="block text-xs text-gray-500 mt-1">
                                                                +{formatPrice(item.price)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
});
