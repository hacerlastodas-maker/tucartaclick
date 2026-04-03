import { Category, Product, Coupon } from '../types';
import productsData from './products.json';
import configData from './config.json';

// Types for our Config JSON structure
interface ConfigData {
    name: string;
    whatsappNumber: string;
    logoUrl: string;
    theme: {
        primary: string;
        background: string;
        backgroundImage?: string;
    };
    schedule: {
        open: string;
        close: string;
    };
    announcement: {
        active: boolean;
        text: string;
        bgColor: string;
        textColor: string;
    };
    deliveryZones: { name: string; price: number }[];
    coupons: (Omit<Coupon, 'minOrderAmount'> & { minOrderAmount?: number })[];
}

// Cast import
const rawConfig = configData as ConfigData;

// --- PRODUCTS ---
// --- PRODUCTS ---
export const products = productsData as Product[];
export const PRODUCTS = products; // Use products directly from JSON without overrides

// Auto-Discovery: Categories
const uniqueCategoryNames = Array.from(new Set(products.map(p => p.category)));
export const CATEGORIES: Category[] = uniqueCategoryNames.map(cat => ({
    id: cat,
    name: cat
}));

// --- COUPONS ---
// Export coupons from config, defaulting to empty if missing
// Ensure minOrderAmount defaults to 0 for backward compatibility
export const COUPONS: Coupon[] = (rawConfig.coupons || []).map(c => ({
    ...c,
    minOrderAmount: c.minOrderAmount ?? 0
}));

// --- SHOP CONFIG ADAPTER ---
// We map the JSON structure to the app's internal SHOP_CONFIG structure
export const SHOP_CONFIG = {
    name: rawConfig.name || "Sushi King",
    logoUrl: rawConfig.logoUrl, // Removed hardcoded fallback
    whatsappNumber: rawConfig.whatsappNumber || "56912345678",

    theme: {
        primary: rawConfig.theme.primary || "255 165 0",
        background: rawConfig.theme.background || "255 255 255",
        backgroundImage: rawConfig.theme.backgroundImage // Removed hardcoded fallback
    },

    timezone: "America/Santiago",
    openTime: rawConfig.schedule.open || "00:00",
    closeTime: rawConfig.schedule.close || "23:59",

    // Map the simple array to what the app expects (adding IDs if needed, or just using index/name)
    deliveryZones: (rawConfig.deliveryZones || []).map((z, i) => ({
        id: `zone-${i}`,
        name: z.name,
        price: z.price
    })),

    paymentMethods: [
        { id: 'transfer', label: 'Transferencia Bancaria' },
        { id: 'cash', label: 'Efectivo' },
        { id: 'card', label: 'Tarjeta (Llevamos máquina)' }
    ],

    announcement: {
        active: rawConfig.announcement.active,
        text: rawConfig.announcement.text,
        bgColor: rawConfig.announcement.bgColor,
        textColor: rawConfig.announcement.textColor
    }
};
