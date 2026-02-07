'use client';

import { useState, useEffect } from 'react';
import { checkIsStoreOpen } from '@/utils/time';

export function useShopStatus() {
    // Initialize with function call to avoid initial flicker if possible, 
    // though strictly this might cause hydration mismatch if server time differs from client time in timezone interpretation.
    // Safer to start true/false consistently.
    const [status, setStatus] = useState(checkIsStoreOpen());

    useEffect(() => {
        const check = () => setStatus(checkIsStoreOpen());
        check(); // Initial client-side check

        const interval = setInterval(check, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    return status;
}

