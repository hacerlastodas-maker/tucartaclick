import { SHOP_CONFIG } from '@/data';

export interface StoreStatus {
    isOpen: boolean;
    message: string;
    nextOpenTime?: string;
}

export function checkIsStoreOpen(): StoreStatus {
    const { openTime, closeTime, timezone } = SHOP_CONFIG;

    // Get current time in store's timezone
    const now = new Date();
    const storeTime = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(now); // Returns "HH:mm"

    // Parse logic
    // We assume simple "09:00" to "23:00" for MVP.
    // Extended logic would need to handle "18:00" to "02:00" (crossing midnight)

    let isOpen = false;
    let message = '';

    if (closeTime < openTime) {
        // Night shift case (e.g. 18:00 to 02:00)
        if (storeTime >= openTime || storeTime < closeTime) {
            isOpen = true;
        }
    } else {
        // Standard day shift (e.g. 09:00 to 22:00)
        if (storeTime >= openTime && storeTime < closeTime) {
            isOpen = true;
        }
    }

    // --- TESTING MODE: ALWAYS OPEN ---
    return { isOpen: true, message: "Abierto (Modo Test)", nextOpenTime: openTime };

    /*
    if (isOpen) {
        message = `Abierto hasta las ${closeTime}`;
    } else {
        message = `Cerrado. Abrimos a las ${openTime}`;
    }

    return { isOpen, message, nextOpenTime: openTime };
    */
}
