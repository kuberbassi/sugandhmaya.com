const fallbackProducts = require('../data/catalog');

const supabaseUrl = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const isCatalogConfigured = () => Boolean(supabaseUrl && publishableKey);
const isOrderStorageConfigured = () => Boolean(supabaseUrl && secretKey);

const request = async (path, { method = 'GET', body, secret = false, headers = {} } = {}) => {
    const key = secret ? secretKey : publishableKey;
    if (!supabaseUrl || !key) throw new Error('Supabase database is not configured.');

    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
        method,
        signal: AbortSignal.timeout(10000),
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
    if (!isCatalogConfigured()) {
        return { products: fallbackProducts, source: 'supabase-fallback' };
    }
    try {
        const rows = await request('products?select=id,name,category,scents,variants,description,featured_image&order=sort_order.asc');
        if (!Array.isArray(rows) || !rows.length) throw new Error('Supabase catalogue returned empty or invalid data.');
        return { products: rows.map(mapProduct), source: 'supabase' };
    } catch (error) {
        console.warn(`Supabase catalogue fetch warning (${error.message}). Serving local catalogue.`);
        return { products: fallbackProducts, source: 'supabase-fallback' };
    }
};

const saveOrder = async order => {
    if (!isOrderStorageConfigured()) {
        throw new Error('Supabase order storage is not configured.');
    }
    const [saved] = await request('orders?select=id,customer,items,total,order_date', {
        method: 'POST',
        secret: true,
        headers: { Prefer: 'return=representation' },
        body: order
    });
    return { ...saved, _id: saved.id, orderDate: saved.order_date, storage: 'supabase' };
};

module.exports = { getProducts, saveOrder, isCatalogConfigured, isOrderStorageConfigured };



