// server/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

// --- YOUR PRODUCT DATA GOES HERE ---
const productsToSeed = [

    // --- PRODUCT 1 ---
    {
        id: 'sugandhmaya-chandan-agarbatti',
        name: 'Sugandhmaya Chandan Agarbatti',
        category: 'Agarbatti',
        price: 91,
        description: 'Scent: Chandan (Sandalwood), Material: Wood, Type: Pooja Samagri, Dimensions: 10 inches long, 0.5 inches wide and deep, Quantity: 1 pack.',
        image: '/images/products/sugandhmaya_chandan_agarbatti/1.jpg',
        thumbnails: [
            '/images/products/sugandhmaya_chandan_agarbatti/1.jpg',
            '/images/products/sugandhmaya_chandan_agarbatti/2.jpg',
            '/images/products/sugandhmaya_chandan_agarbatti/3.jpg',
            '/images/products/sugandhmaya_chandan_agarbatti/4.jpg',
            '/images/products/sugandhmaya_chandan_agarbatti/5.jpg',
            '/images/products/sugandhmaya_chandan_agarbatti/6.jpg',
        ]

    },

    // --- PRODUCT 2 ---
    {
        id: 'camphor-dhoop-cones',
        name: 'Camphor Dhoop Cones',
        category: 'Dhoop',
        price: 280,
        description: 'Purifying camphor dhoop cones that cleanse the air and create a sacred atmosphere for your rituals.',
        image: '/images/camphor_main.jpg',
        thumbnails: [
            '/images/camphor_thumb1.jpg',
            '/images/camphor_thumb2.jpg',
        ]
    },

    // --- ADD MORE PRODUCTS HERE by copying the block above ---

];
// -----------------------------------------

const seedDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
    await Product.deleteMany({});
    console.log('Existing products cleared.');
    await Product.insertMany(productsToSeed);
    console.log('Database has been successfully seeded with new products!');
    mongoose.connection.close();
};

seedDB().catch(err => {
    console.error("Seeding failed:", err);
    mongoose.connection.close();
});