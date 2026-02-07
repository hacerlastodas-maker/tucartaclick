'use client';

import { SHOP_CONFIG } from "@/data";
import { useState } from "react";
import Image from "next/image";

export function BrandLogo() {
    const [imageError, setImageError] = useState(false);
    const { logoUrl, name } = SHOP_CONFIG;

    const showImage = logoUrl && !imageError;

    return (
        <div className="h-10 flex items-center">
            {showImage ? (
                <div className="relative h-full w-auto aspect-[200/80]">
                    <img
                        src={logoUrl}
                        alt={name}
                        className="h-full w-auto object-contain"
                        onError={() => setImageError(true)}
                    />
                </div>
            ) : (
                <span className="font-bold text-xl text-gray-900 tracking-tight">
                    {name}
                </span>
            )}
        </div>
    );
}
