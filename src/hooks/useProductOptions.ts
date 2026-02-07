import { useState, useMemo, useEffect } from 'react';
import { Product, Modifier, OptionGroup, CartItem } from '@/types';

interface UseProductOptionsProps {
    product: Product | null;
    editingItem?: CartItem | null;
}

export function useProductOptions({ product, editingItem }: UseProductOptionsProps) {
    const [quantity, setQuantity] = useState(1);
    const [selections, setSelections] = useState<Record<string, Set<string>>>({});
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

    // Initialize state
    useEffect(() => {
        if (!product) return;

        if (editingItem && editingItem.id === product.id) {
            setQuantity(editingItem.quantity);
            const loadedSelections: Record<string, Set<string>> = {};

            const findGroup = (modName: string) => {
                return product.extended_options?.find(g => g.items.some(i => i.name === modName));
            };

            editingItem.modifiers.forEach(mod => {
                const group = findGroup(mod.name);
                const groupName = group ? group.name : "Extras";
                if (!loadedSelections[groupName]) loadedSelections[groupName] = new Set();
                loadedSelections[groupName].add(mod.name);
            });

            setSelections(loadedSelections);
        } else {
            setQuantity(1);
            setSelections({});
            if (product.extended_options?.length) {
                setActiveAccordion(product.extended_options[0].name);
            }
        }
    }, [product, editingItem]);

    // Derived Option Groups
    const optionGroups: OptionGroup[] = useMemo(() => {
        if (!product) return [];
        return product.extended_options?.length
            ? product.extended_options
            : (product.modifiers?.length ? [{
                name: "Extras",
                max_qty: 99,
                items: product.modifiers
            }] : []);
    }, [product]);

    // Validation Logic
    const isGroupSatisfied = (group: OptionGroup) => {
        const count = selections[group.name]?.size || 0;
        if (group.max_qty === 1) {
            // Radio: Required (Must select 1)
            return count === 1;
        }
        // Checkbox: Optional (always valid)
        return true;
    };

    const isValid = useMemo(() => optionGroups.every(isGroupSatisfied), [optionGroups, selections]);

    // Hint for the user
    const firstInvalidGroup = useMemo(() =>
        optionGroups.find(g => !isGroupSatisfied(g))?.name,
        [optionGroups, selections]);

    // Toggle Logic
    const toggleOption = (group: OptionGroup, optionName: string) => {
        setSelections(prev => {
            const groupSelections = new Set(prev[group.name] || []);
            const isSelected = groupSelections.has(optionName);

            if (group.max_qty === 1) {
                // Radio Logic
                if (isSelected) {
                    groupSelections.delete(optionName); // Allow deselect
                } else {
                    groupSelections.clear();
                    groupSelections.add(optionName);

                    // Auto-advance
                    const currIdx = optionGroups.findIndex(g => g.name === group.name);
                    if (currIdx < optionGroups.length - 1) {
                        setTimeout(() => setActiveAccordion(optionGroups[currIdx + 1].name), 200);
                    } else {
                        setTimeout(() => setActiveAccordion(null), 200);
                    }
                }
            } else {
                // Checkbox Logic
                if (isSelected) {
                    groupSelections.delete(optionName);
                } else {
                    if (groupSelections.size < group.max_qty) {
                        groupSelections.add(optionName);
                    }
                }
            }

            return {
                ...prev,
                [group.name]: groupSelections
            };
        });
    };

    // Calculate Total
    const total = useMemo(() => {
        if (!product) return 0;
        let currentTotal = product.price;
        Object.entries(selections).forEach(([groupName, selectedSet]) => {
            const group = optionGroups.find(g => g.name === groupName);
            if (!group) return;
            selectedSet.forEach(optName => {
                const item = group.items.find(i => i.name === optName);
                if (item) currentTotal += item.price;
            });
        });
        return currentTotal * quantity;
    }, [product?.price, selections, optionGroups, quantity]);

    // Generate Modifiers for Cart
    const getFinalModifiers = (): Modifier[] => {
        const finalModifiers: Modifier[] = [];
        Object.entries(selections).forEach(([groupName, selectedSet]) => {
            const group = optionGroups.find(g => g.name === groupName);
            if (!group) return;
            selectedSet.forEach(optName => {
                const item = group.items.find(i => i.name === optName);
                if (item) {
                    finalModifiers.push({
                        id: item.name,
                        name: item.name,
                        price: item.price,
                        quantity: 1
                    });
                }
            });
        });
        return finalModifiers;
    };

    return {
        quantity,
        setQuantity,
        selections,
        activeAccordion,
        setActiveAccordion,
        optionGroups,
        isValid,
        firstInvalidGroup,
        toggleOption,
        total,
        getFinalModifiers,
        isGroupSatisfied
    };
}
