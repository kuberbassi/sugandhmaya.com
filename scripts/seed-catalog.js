require('dotenv').config({ path: './server/.env' });
const products = require('../server/data/catalog');

const url = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const key = process.env.SUPABASE_SECRET_KEY;

const rows = products.map((product, index) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    scents: product.scents,
    variants: product.variants,
    description: product.description,
    featured_image: product.featuredImage,
    sort_order: index + 1,
    updated_at: new Date().toISOString()
}));

const seedDatabase = async () => {
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required in server/.env.');
    const response = await fetch(`${url}/rest/v1/products?on_conflict=id`, {
        method: 'POST',
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(rows)
    });
    if (!response.ok) throw new Error(`Seed failed (${response.status}): ${await response.text()}`);
    console.log(`Supabase catalogue populated with ${rows.length} products.`);
};

seedDatabase().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
