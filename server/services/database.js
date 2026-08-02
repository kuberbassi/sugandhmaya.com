const fallbackProducts = require('../data/catalog');
const { saveLocalOrder } = require('../data/orderStore');

const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;

const isCatalogConfigured = () => Boolean(supabaseUrl && publishableKey);
const isOrderStorageConfigured = () => Boolean(supabaseUrl && secretKey);

const request = async (path, { method = 'GET', body, secret = false, headers = {} } = {}) => {
    const key = secret ? secretKey : publishableKey;
    if (!supabaseUrl || !key) throw new Error('Supabase is not configured.');

    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
        method,
        signal: AbortSignal.timeout(4500),
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            ...headers
        },
        body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Supabase request failed (${response.status}): ${detail}`);
    }
    return response.status === 204 ? null : response.json();
};

const mapProduct = product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    scents: product.scents,
    variants: product.variants,
    description: product.description,
    featuredImage: product.featured_image
});

const getProducts = async () => {
    if (!isCatalogConfigured()) return { products: fallbackProducts, source: 'local-fallback' };
    try {
        const rows = await request('products?select=id,name,category,scents,variants,description,featured_image&order=sort_order.asc');
        if (!rows.length) throw new Error('Supabase product catalogue is empty.');
        return { products: rows.map(mapProduct), source: 'supabase' };
    } catch (error) {
        console.warn(`${error.message} The local catalogue fallback is active.`);
        return { products: fallbackProducts, source: 'local-fallback' };
    }
};

const saveOrder = async order => {
    if (!isOrderStorageConfigured()) return saveLocalOrder(order);
    const [saved] = await request('orders?select=id,customer,items,total,order_date', {
        method: 'POST',
        secret: true,
        headers: { Prefer: 'return=representation' },
        body: order
    });
    return { ...saved, _id: saved.id, orderDate: saved.order_date, storage: 'supabase' };
};

module.exports = { getProducts, saveOrder, isCatalogConfigured, isOrderStorageConfigured };
