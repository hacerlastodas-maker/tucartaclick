import { CartItem, Coupon } from '@/types';
import { SHOP_CONFIG } from '@/data';

interface WhatsAppLinkParams {
    items: CartItem[];
    subtotal: number;
    deliveryCost: number;
    total: number;
    customerName: string;
    deliveryType: 'pickup' | 'delivery';
    address?: string;
    deliveryZoneName?: string;
    paymentMethod: string;
    appliedCoupon?: Coupon | null;
    discountAmount?: number;
    promoDiscountAmount?: number;
}

export function generateWhatsAppLink({
    items,
    subtotal,
    deliveryCost,
    total,
    customerName,
    deliveryType,
    address,
    deliveryZoneName,
    paymentMethod,
    appliedCoupon,
    discountAmount,
    promoDiscountAmount
}: WhatsAppLinkParams) {
    const { whatsappNumber, name: shopName } = SHOP_CONFIG;

    let message = `¡Hola! 👋 Soy *${customerName}* y quiero pedir en ${shopName}:\n`;
    message += `────────────────────\n`;

    const itemsList = items.map(item => {
        const modifiers = item.modifiers && item.modifiers.length > 0
            ? ` (${item.modifiers.map(m => m.name).join(', ')})`
            : '';
        return `• *${item.quantity}x ${item.name}*${modifiers}`;
    }).join('\n');

    message += itemsList;
    message += `\n────────────────────\n`;

    // Financials
    message += `💰 *Subtotal:* $${subtotal.toLocaleString('es-CL')}\n`;

    if (appliedCoupon && discountAmount) {
        message += `🏷 *Cupón aplicado:* ${appliedCoupon.code} (-$${discountAmount.toLocaleString('es-CL')})\n`;
    }

    if (promoDiscountAmount && promoDiscountAmount > 0) {
        message += `🎁 *Promo 3x2:* (-$${promoDiscountAmount.toLocaleString('es-CL')})\n`;
    }

    if (deliveryType === 'delivery') {
        const costText = deliveryCost > 0 ? `$${deliveryCost.toLocaleString('es-CL')}` : 'A convenir/Gratis';
        message += `🛵 *Envío (${deliveryZoneName || 'Zona sin especificar'}):* ${costText}\n`;
    } else {
        message += `🏪 *Retiro en Local* (Sin costo de envío)\n`;
    }

    message += `💳 *Pago:* ${paymentMethod}\n`;
    message += `🏁 *TOTAL LÍQUIDO: $${total.toLocaleString('es-CL')}*\n`;
    message += `────────────────────\n`;

    // Logistics
    if (deliveryType === 'delivery') {
        message += `📍 *Dirección:* ${address}\n`;
    } else {
        message += `📍 *Retiro:* Iré al local.\n`;
    }

    // Add date for context
    const date = new Date().toLocaleDateString('es-CL', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    message += `📅 *Fecha:* ${date}\n`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
