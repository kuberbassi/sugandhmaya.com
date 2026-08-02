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
        const covers = new Set(products.map(product => product.featuredImage));
        if (!health.success || products.length !== 6 || covers.size !== 1) {
            throw new Error('API catalogue contract verification failed.');
        }
        console.log(`API verified: ${products.length} products via ${productsResponse.headers.get('x-product-source')}.`);
    } finally {
        server.close();
    }
};

run().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
