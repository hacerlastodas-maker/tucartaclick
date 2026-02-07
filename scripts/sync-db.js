const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// --- CONFIGURATION ---
const PRODUCTS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTifC-ytvLqv-aSRvxlvmSSxdH4fj328ICJebelmAJPW0AyYki8ZBWp5C6Gt5462gCgBOE51LflLVWB/pub?gid=0&single=true&output=csv";
const CONFIG_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTifC-ytvLqv-aSRvxlvmSSxdH4fj328ICJebelmAJPW0AyYki8ZBWp5C6Gt5462gCgBOE51LflLVWB/pub?gid=1412483830&single=true&output=csv";
const OPTIONS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTifC-ytvLqv-aSRvxlvmSSxdH4fj328ICJebelmAJPW0AyYki8ZBWp5C6Gt5462gCgBOE51LflLVWB/pub?gid=1059474261&single=true&output=csv";

// Paths
const PRODUCTS_OUT = path.join(__dirname, '../src/data/products.json');
const CONFIG_OUT = path.join(__dirname, '../src/data/config.json');

// --- HELPERS ---
const clean = (str) => str ? str.toString().trim() : "";
const isTrue = (val) => ['true', '1', 'yes', 'si', 'active', 'enabled'].includes(clean(val).toLowerCase());

const hexToRgb = (hex) => {
    hex = clean(hex);
    if (!hex.startsWith('#')) return hex;

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
        : hex;
};

// --- MAIN LOGIC ---

async function fetchConfig() {
    console.log('📡 Fetching Config...');
    try {
        const res = await fetch(CONFIG_CSV_URL);
        if (!res.ok) throw new Error(`Failed to fetch config: ${res.status} ${res.statusText}`);
        const text = await res.text();
        const rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data;

        // Default structure
        const config = {
            name: "",
            whatsappNumber: "",
            logoUrl: "",
            theme: {
                primary: "",
                background: "",
                backgroundImage: ""
            },
            schedule: {
                open: "",
                close: ""
            },
            announcement: {
                active: false,
                text: "",
                bgColor: "",
                textColor: ""
            },
            delivery: {
                zone1_price: 0,
                zone2_price: 0
            },
            _raw: {}
        };

        rows.forEach(row => {
            const key = clean(row.key);
            const val = clean(row.value);
            if (!key) return;

            config._raw[key] = val;

            switch (key) {
                case 'store_name': config.name = val; break;
                case 'whatsapp_number': config.whatsappNumber = val; break;
                case 'logo_url': config.logoUrl = val; break;
                case 'primary_color': config.theme.primary = hexToRgb(val); break;
                case 'background_color': config.theme.background = hexToRgb(val); break;
                case 'background_image': config.theme.backgroundImage = val; break;
                case 'open_time': config.schedule.open = val; break;
                case 'close_time': config.schedule.close = val; break;
                case 'announcement_active': config.announcement.active = isTrue(val); break;
                case 'announcement_text': config.announcement.text = val; break;
                case 'announcement_bg_color': config.announcement.bgColor = val; break;
                case 'announcement_text_color': config.announcement.textColor = val; break;
                case 'delivery_zones': {
                    if (!val) break;
                    try {
                        config.deliveryZones = val.split(';').map(z => {
                            const [name, price] = z.split(':').map(s => s.trim());
                            if (!name) return null;
                            return { name, price: Number(price) || 0 };
                        }).filter(Boolean);
                    } catch (e) {
                        console.warn(`⚠️ Error parsing delivery_zones: ${val}`);
                    }
                    break;
                }
                case 'coupons': {
                    if (!val) break;
                    try {
                        config.coupons = val.split(';').map(c => {
                            const [code, valueStr] = c.split(':').map(s => s.trim());
                            if (!code) return null;
                            const value = Number(valueStr) || 0;
                            return {
                                code: code.toUpperCase(),
                                type: 'PERCENT',
                                value: value
                            };
                        }).filter(Boolean);
                    } catch (e) {
                        console.warn(`⚠️ Error parsing coupons: ${val}`);
                    }
                    break;
                }
            }
        });

        fs.writeFileSync(CONFIG_OUT, JSON.stringify(config, null, 2));
        console.log('✅ Config cargada');
        return config;
    } catch (error) {
        console.error('Failed to fetch config:', error);
        fs.writeFileSync('sync_error_log.txt', `Config Error: ${error.message}\n${error.stack}`);
        throw error;
    }
}

async function fetchOptions() {
    console.log('📡 Fetching Options...');
    try {
        const res = await fetch(OPTIONS_CSV_URL);
        if (!res.ok) throw new Error(`Failed to fetch options: ${res.status} ${res.statusText}`);
        const text = await res.text();
        const rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data;

        const optionsMap = {};

        rows.forEach(row => {
            const pid = clean(row.product_id);
            const group = clean(row.group_name);
            if (!pid || !group) return;

            if (!optionsMap[pid]) optionsMap[pid] = {};
            if (!optionsMap[pid][group]) {
                optionsMap[pid][group] = {
                    name: group,
                    max_qty: Number(clean(row.max_qty)) || 99,
                    items: []
                };
            }

            optionsMap[pid][group].items.push({
                name: clean(row.option_name),
                price: Number(clean(row.price)) || 0
            });
        });

        console.log(`✅ Loaded options for ${Object.keys(optionsMap).length} products`);
        return optionsMap;
    } catch (error) {
        console.error('Failed to fetch options:', error);
        return {};
    }
}

async function fetchProducts(optionsMap) {
    console.log('📡 Fetching Products...');
    try {
        const res = await fetch(PRODUCTS_CSV_URL);
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status} ${res.statusText}`);
        const text = await res.text();
        const rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data;

        const products = rows.map(row => {
            const status = clean(row.is_active || row.status || "TRUE").toLowerCase();
            if (status === 'false' || status === 'disabled') return null;

            const id = clean(row.id) || `prod-${Math.random().toString(36).substr(2, 9)}`;

            let extended_options = [];
            if (optionsMap && optionsMap[id]) {
                extended_options = Object.values(optionsMap[id]);
            }

            return {
                id: id,
                name: clean(row.name || row.title),
                price: Number(clean(row.price)) || 0,
                originalPrice: row.original_price ? Number(clean(row.original_price)) : undefined,
                description: clean(row.description),
                imageUrl: clean(row.image_url || row.image),
                category: clean(row.category || row.type || "General"),
                stock: Number(clean(row.stock)) || 999,
                isActive: true,
                isFeatured: isTrue(row.is_featured),
                relatedIds: clean(row.related_ids).split(',').map(s => s.trim()).filter(Boolean),
                modifiers: clean(row.modifiers).split(';').map(mod => {
                    const parts = mod.split(':');
                    const name = clean(parts[0]);
                    if (!name) return null;
                    const price = parts[1] ? Number(clean(parts[1])) : 0;
                    return { name, price };
                }).filter(Boolean),
                extended_options: extended_options
            };
        }).filter(Boolean);

        fs.writeFileSync(PRODUCTS_OUT, JSON.stringify(products, null, 2));
        console.log(`✅ ${products.length} Productos cargados`);
        return products;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        fs.writeFileSync('sync_error_log.txt', `Products Error: ${error.message}\n${error.stack}`, { flag: 'a' });
        throw error;
    }
}

(async () => {
    console.log('🔄 Sincronizando Base de Datos...');
    try {
        const [config, optionsMap] = await Promise.all([
            fetchConfig(),
            fetchOptions()
        ]);
        await fetchProducts(optionsMap);
        console.log('✨ Sincronización Completada.');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
})();
