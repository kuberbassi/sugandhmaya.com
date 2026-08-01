require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const connectDB = require('./server/db');
const Product = require('./server/models/product');
const products = require('./server/data/products');

const seedDatabase = async () => {
    const connected = await connectDB({ retry: false });
    if (!connected) {
        process.exitCode = 1;
        return;
    }

    try {
        await Product.deleteMany({});
        await Product.insertMany(products);
        console.log(`Database populated with ${products.length} products.`);
    } catch (error) {
        console.error('Database seeding failed:', error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

seedDatabase();
