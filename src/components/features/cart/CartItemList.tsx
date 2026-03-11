'use client';

import { CartItem, Modifier } from '@/types';
import { Minus, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItemListProps {
    items: CartItem[];
    onUpdateQuantity: (id: string, modifiers: Modifier[], quantity: number) => void;
    onEdit: (item: CartItem) => void;
}

export function CartItemList({ items, onUpdateQuantity, onEdit }: CartItemListProps) {
    if (items.length === 0) return null;

    return (
        <div className="space-y-4">
            <AnimatePresence initial={false} mode="popLayout">
                {items.map((item, idx) => (
                    <motion.div
                        key={`${item.id}-${idx}`}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-start border-b border-gray-50 pb-4 last:border-0"
                    >
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</span>
                            </div>
                            {/* Modifiers Display */}
                            {item.modifiers && item.modifiers.length > 0 && (
                                <div className="text-xs text-gray-500 mb-2 leading-relaxed">
                                    {item.modifiers.map(m => m.name).join(', ')}
                                </div>
                            )}
                            <p className="text-sm font-bold text-gray-900">
                                {formatPrice((item.price + (item.modifiers?.reduce((s, m) => s + (m.price * m.quantity), 0) || 0)) * item.quantity)}
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            {/* Edit Button */}
                            <button
                                onClick={() => onEdit(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Editar"
                            >
                                <Edit2 size={16} />
                            </button>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1 shadow-inner">
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.modifiers, item.quantity - 1)}
                                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 active:scale-90 transition-all"
                                >
                                    {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                                </button>
                                <span className="font-bold text-gray-900 w-4 text-center text-sm">{item.quantity}</span>
                                <button
                                    onClick={() => onUpdateQuantity(item.id, item.modifiers, item.quantity + 1)}
                                    className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-900 active:scale-90 transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
