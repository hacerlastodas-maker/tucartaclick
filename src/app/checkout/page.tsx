'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { SHOP_CONFIG } from '@/data';
import { ChevronLeft, MapPin, Store, Send, ShoppingBag, CreditCard, CheckCircle2, Bike, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { useShopStatus } from '@/hooks/useShopStatus';

const { deliveryZones: DELIVERY_ZONES } = SHOP_CONFIG;

type PaymentMethod = 'Transferencia' | 'Efectivo' | 'Tarjeta (Débito/Crédito)';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getTotalPrice, getDiscountAmount, appliedCoupon, applyCoupon, removeCoupon, couponError, clearCouponError } = useCartStore();
    const { isOpen } = useShopStatus();

    // Stats - with Persistence
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
    const [address, setAddress] = useState('');
    const [selectedZoneIndex, setSelectedZoneIndex] = useState<number>(-1);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia');
    const [couponCode, setCouponCode] = useState('');

    // Load from LocalStorage on Mount
    useEffect(() => {
        const savedData = localStorage.getItem('checkout_data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.name) setName(parsed.name);
                if (parsed.phone) setPhone(parsed.phone);
                if (parsed.deliveryType) setDeliveryType(parsed.deliveryType);
                if (parsed.address) setAddress(parsed.address);
                if (parsed.selectedZoneIndex !== undefined) setSelectedZoneIndex(parsed.selectedZoneIndex);
            } catch (e) {
                console.error("Error loading checkout data", e);
            }
        }
    }, []);

    // Save to LocalStorage on Change
    useEffect(() => {
        const data = { name, phone, deliveryType, address, selectedZoneIndex };
        localStorage.setItem('checkout_data', JSON.stringify(data));
    }, [name, phone, deliveryType, address, selectedZoneIndex]);

    // UI State
    const [isSuccess, setIsSuccess] = useState(false);

    // Redirect if empty
    useEffect(() => {
        if (items.length === 0 && !isSuccess) {
            router.push('/');
        }
    }, [items, router, isSuccess]);

    // Calculations
    const cartTotal = getTotalPrice();
    const discountAmount = getDiscountAmount();
    const deliveryCost = deliveryType === 'delivery' && selectedZoneIndex !== -1
        ? DELIVERY_ZONES[selectedZoneIndex].price
        : 0;
    const finalTotal = Math.max(0, cartTotal - discountAmount + deliveryCost);

    const handleConfirm = () => {
        if (!name.trim()) return alert('Por favor ingresa tu nombre');
        if (!phone.trim()) return alert('Por favor ingresa tu teléfono');

        if (deliveryType === 'delivery') {
            if (!address.trim()) return alert('Por favor ingresa tu dirección');
            if (selectedZoneIndex === -1) return alert('Por favor selecciona una zona de reparto');
        }

        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleWhatsApp = () => {
        const link = generateWhatsAppLink({
            items,
            subtotal: cartTotal,
            deliveryCost,
            total: finalTotal,
            customerName: name,
            deliveryType,
            address: deliveryType === 'delivery' ? address : undefined,
            deliveryZoneName: deliveryType === 'delivery' && selectedZoneIndex !== -1 ? DELIVERY_ZONES[selectedZoneIndex].name : undefined,
            paymentMethod,
            appliedCoupon,
            discountAmount
        });
        window.open(link, '_blank');
    };

    if (items.length === 0 && !isSuccess) return null;

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 text-center space-y-6"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={48} className="text-green-600" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Armado! 🍣</h1>
                        <p className="text-gray-500">
                            ¡Casi listo! Envía tu pedido a WhatsApp para que empecemos a prepararlo.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-2 border border-gray-100">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Cliente</span>
                            <span className="font-bold">{name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Entrega</span>
                            <span className="font-bold">{deliveryType === 'delivery' ? 'Domicilio' : 'Retiro'}</span>
                        </div>
                        <div className="flex justify-between text-lg pt-2 border-t border-gray-200 mt-2">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-primary">{formatPrice(finalTotal)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleWhatsApp}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 animate-pulse"
                    >
                        <span>Enviar a WhatsApp 🚀</span>
                        <Send size={24} />
                    </button>

                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 text-sm hover:text-gray-600"
                    >
                        Volver al Inicio
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 sm:px-6">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">

                {/* HEADLINE Mobile */}
                <div className="lg:col-span-12 flex items-center gap-4 mb-2">
                    <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
                </div>

                {/* LEFT COLUMN: FORM */}
                <div className="lg:col-span-7 space-y-6">

                    {/* 1. Delivery Type */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Bike className="text-primary" /> Tipo de Entrega
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDeliveryType('delivery')}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all",
                                    deliveryType === 'delivery'
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-gray-100 hover:bg-gray-50 text-gray-500"
                                )}
                            >
                                <MapPin size={24} />
                                <span className="font-bold">Delivery</span>
                            </button>
                            <button
                                onClick={() => setDeliveryType('pickup')}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all",
                                    deliveryType === 'pickup'
                                        ? "border-primary bg-primary/5 text-primary"
                                        : "border-gray-100 hover:bg-gray-50 text-gray-500"
                                )}
                            >
                                <Store size={24} />
                                <span className="font-bold">Retiro</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. User Details */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-900 mb-4">Datos Personales</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Nombre</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Tu Nombre"
                                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Teléfono</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="+569..."
                                    className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>

                            <AnimatePresence>
                                {deliveryType === 'delivery' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4 pt-2"
                                    >
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Zona de Reparto</label>
                                            <select
                                                value={selectedZoneIndex}
                                                onChange={(e) => setSelectedZoneIndex(Number(e.target.value))}
                                                className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            >
                                                <option value={-1}>Selecciona tu zona...</option>
                                                {DELIVERY_ZONES.map((zone, idx) => (
                                                    <option key={idx} value={idx}>
                                                        {zone.name} {zone.price > 0 ? `(+${formatPrice(zone.price)})` : '(Gratis)'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Dirección</label>
                                            <input
                                                type="text"
                                                value={address}
                                                onChange={e => setAddress(e.target.value)}
                                                placeholder="Calle 123, Of 402"
                                                className="w-full mt-1 p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* 3. Payment */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <CreditCard className="text-green-600" /> Forma de Pago
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {(['Transferencia', 'Efectivo', 'Tarjeta (Débito/Crédito)'] as PaymentMethod[]).map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={cn(
                                        "px-3 py-3 rounded-xl text-sm font-medium border transition-all text-center",
                                        paymentMethod === method
                                            ? "bg-green-50 border-green-500 text-green-700 shadow-sm"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                    )}
                                >
                                    {method === 'Tarjeta (Débito/Crédito)' ? 'Tarjeta' : method}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: SUMMARY */}
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ShoppingBag size={20} /> Resumen
                        </h2>

                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.quantity}x {item.name}</p>
                                        {item.modifiers?.length > 0 && (
                                            <p className="text-xs text-gray-500">
                                                {item.modifiers.map(m => m.name).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                    <p className="font-semibold text-gray-700">
                                        {formatPrice(((item.price * item.quantity) + (item.modifiers?.reduce((s, m) => s + (m.price * 1), 0) || 0) * item.quantity))}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* COUPON SECTION */}
                        <div className="mb-4">
                            {!appliedCoupon ? (
                                <>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="CÓDIGO"
                                            value={couponCode}
                                            onChange={(e) => {
                                                setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ''));
                                                if (couponError) clearCouponError();
                                            }}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <button
                                            onClick={() => {
                                                if (couponCode) applyCoupon(couponCode);
                                            }}
                                            disabled={!couponCode}
                                            className="bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="text-red-500 text-xs mt-1.5 font-medium">{couponError}</p>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-1">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center text-sm">
                                        <span className="text-green-700 font-medium flex items-center gap-1">
                                            🏷 {appliedCoupon.code} aplicado
                                        </span>
                                        <button
                                            onClick={removeCoupon}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    {appliedCoupon.minOrderAmount > 0 && (
                                        <p className="text-xs text-gray-400 pl-1">
                                            Mínimo de pedido: ${appliedCoupon.minOrderAmount.toLocaleString('es-CL')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(cartTotal)}</span>
                            </div>
                            {appliedCoupon && (
                                <div className="flex justify-between text-green-600 text-sm font-medium">
                                    <span>Cupón ({appliedCoupon.code})</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600 text-sm">
                                <span>Envío</span>
                                <span>{deliveryCost === 0 ? 'Gratis' : `${formatPrice(deliveryCost)}`}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                <span>Total</span>
                                <span>{formatPrice(finalTotal)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirm}
                            disabled={!isOpen}
                            className={cn(
                                "w-full font-bold py-4 rounded-xl shadow-lg mt-6 transition-all flex items-center justify-center gap-2",
                                isOpen
                                    ? "bg-gray-900 text-white hover:bg-black active:scale-[0.98]"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            )}
                        >
                            {isOpen ? "Confirmar Pedido" : "Local Cerrado 🔒"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
