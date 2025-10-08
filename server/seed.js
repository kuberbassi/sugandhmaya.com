// server/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

const productsToSeed = [
    // --- PRODUCT 1: The Main Agarbatti Product ---
    {
        id: 'sugandhmaya-agarbatti-collection',
        name: 'Sugandhmaya Agarbatti',
        category: 'Agarbatti',
        description: 'Experience a symphony of divine fragrances with our artisanal agarbatti collection. Each stick is crafted to elevate your spiritual practices and bring tranquility to your space. Select your preferred scent and size.',
        scents: ["Chandan", "Rose", "Orchid", "Oudh Regular"],
        variants: [
            {
                size: "12 Sticks",
                price: 91, // CHANGE THIS PRICE
                image: '/images/products/sugandhmaya_chandan_agarbatti/1.jpg', // CHANGE to your 12-stick box image
                thumbnails: [
                    '/images/products/sugandhmaya_chandan_agarbatti/1.jpg', // CHANGE to your 12-stick thumbnails
                    '/images/products/sugandhmaya_chandan_agarbatti/2.jpg',
                ]
            },
            {
                size: "40 Sticks",
                price: 330, // CHANGE THIS PRICE
                image: '/images/products/sugandhmaya_chandan_agarbatti/3.jpg', // CHANGE to your 40-stick box image
                thumbnails: [
                    '/images/products/sugandhmaya_chandan_agarbatti/3.jpg', // CHANGE to your 40-stick thumbnails
                    '/images/products/sugandhmaya_chandan_agarbatti/4.jpg',
                    '/images/products/sugandhmaya_chandan_agarbatti/5.jpg',
                ]
            }
        ]
    },

    // --- PRODUCT 2: The Oudh Premium Product ---
    {
        id: 'sugandhmaya-oudh-premium',
        name: 'Oudh Premium Agarbatti',
        category: 'Agarbatti',
        description: 'Indulge in the luxurious and captivating aroma of our Oudh Premium Agarbatti. Sourced from the finest ingredients, this is an experience reserved for the connoisseur of fine fragrances.',
        scents: ["Oudh Premium"], // This product only has one scent
        variants: [
            {
                size: "12 Sticks",
                price: 150, // CHANGE THIS PRICE
                image: '/images/products/oudh_premium/12_stick_main.jpg', // ADD YOUR IMAGE PATH
                thumbnails: [
                    '/images/products/oudh_premium/12_stick_thumb1.jpg', // ADD YOUR IMAGE PATHS
                ]
            },
            {
                size: "40 Sticks",
                price: 500, // CHANGE THIS PRICE
                image: '/images/products/oudh_premium/40_stick_main.jpg', // ADD YOUR IMAGE PATH
                thumbnails: [
                    '/images/products/oudh_premium/40_stick_thumb1.jpg', // ADD YOUR IMAGE PATHS
                ]
            }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');
        await Product.deleteMany({});
        console.log('Existing products cleared.');
        await Product.insertMany(productsToSeed);
        console.log('Database has been successfully seeded with new variant products!');
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();