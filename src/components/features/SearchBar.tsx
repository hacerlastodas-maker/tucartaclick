'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="¿Qué se te antoja?"
                className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm shadow-inner focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all outline-none"
            />
        </div>
    );
}
