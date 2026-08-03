const app = require('../server');

const run = async () => {
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));

    try {
        const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
        const [healthResponse, productsResponse] = await Promise.all([
            fetch(`${baseUrl}/health`),
            fetch(`${baseUrl}/products`)
        ]);
        if (!healthResponse.ok || !productsResponse.ok) throw new Error('API returned an unsuccessful response.');

        const health = await healthResponse.json();
        const products = await productsResponse.json();
        const source = productsResponse.headers.get('x-product-source');
        const covers = new Set(products.map(product => product.featuredImage));
        if (!health.success || products.length !== 6 || covers.size !== 1 || source !== 'supabase') {
            throw new Error(`API catalogue contract verification failed. Source: ${source}`);
        }
        console.log(`API verified: ${products.length} products strictly via ${source}.`);
    } finally {
        server.close();
    }
};

run().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
