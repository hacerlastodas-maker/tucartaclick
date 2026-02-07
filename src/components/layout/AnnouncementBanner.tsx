'use client';

import { SHOP_CONFIG } from '@/data';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const AnnouncementBanner = () => {
    const { announcement } = SHOP_CONFIG;

    if (!announcement || !announcement.active || !announcement.text) {
        return null;
    }

    return (
        <div className={cn(
            "w-full py-2 z-50 overflow-hidden relative border-b border-white/10 shadow-sm",
            // Solid Minimalist Style
            "bg-black text-white"
        )}>
            {/* 
               Implement Marquee effect:
               We render the text twice to create a seamless loop if needed, 
               or just a simple scroll for the MVP as requested.
            */}
            <div className="flex whitespace-nowrap justify-center w-full">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        duration: 20, // Adjust speed based on length in a real app
                        ease: "linear"
                    }}
                    className="flex gap-8 px-4 font-bold text-sm items-center"
                >
                    {/* Repeating the text to fill space for the marquee effect */}
                    <span>{announcement.text}</span>
                    <span>•</span>
                    <span>{announcement.text}</span>
                    <span>•</span>
                    <span>{announcement.text}</span>
                    <span>•</span>
                    <span>{announcement.text}</span>
                    <span>•</span>
                    <span>{announcement.text}</span>
                </motion.div>
            </div>
        </div>
    );
}
