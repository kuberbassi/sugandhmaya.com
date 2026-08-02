const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const ordersPath = path.join(__dirname, 'orders.local.json');
let writeQueue = Promise.resolve();

const readOrders = async () => {
    try { return JSON.parse(await fs.readFile(ordersPath, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return []; throw error; }
};

const saveLocalOrder = order => {
    const savedOrder = { ...order, _id: crypto.randomUUID(), orderDate: new Date().toISOString(), storage: 'local-fallback' };
    writeQueue = writeQueue.then(async () => {
        const orders = await readOrders();
        orders.push(savedOrder);
        await fs.writeFile(ordersPath, JSON.stringify(orders, null, 2), 'utf8');
    });
    return writeQueue.then(() => savedOrder);
};

module.exports = { saveLocalOrder };
