require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const Product = require('./server/models/product');

const productsToSeed = [
    {
        id: 'sugandhmaya-agarbatti-collection',
        name: 'Sugandhmaya Agarbatti',
        category: 'Agarbatti',
        description: 'Experience a symphony of divine fragrances with our artisanal agarbatti collection. Each stick is crafted to elevate your spiritual practices and bring tranquility to your space. Select your preferred scent and size.',
        scents: ["Chandan", "Rose", "Orchid", "Oudh Regular"],
        variants: [
            {
                size: "12 Sticks",
                price: 91,
                image: './images/products/sugandhmaya_chandan_agarbatti/4.webp',
                thumbnails: [
                    './images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/2.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/4.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/5.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            },
            {
                size: "40 Sticks",
                price: 330,
                image: './images/products/sugandhmaya_chandan_agarbatti/1.webp',
                thumbnails: [
                    './images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/2.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/4.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/5.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            }
        ]
    },
    {
        id: 'sugandhmaya-oudh-premium',
        name: 'Oudh Premium Agarbatti',
        category: 'Agarbatti',
        description: 'Indulge in the luxurious and captivating aroma of our Oudh Premium Agarbatti. Sourced from the finest ingredients, this is an experience reserved for the connoisseur of fine fragrances.',
        scents: ["Oudh Premium"],
        variants: [
            {
                size: "12 Sticks",
                price: 150,
                image: './images/products/sugandhmaya_chandan_agarbatti/1.webp',
                thumbnails: [
                    './images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/2.webp'
                ]
            },
            {
                size: "40 Sticks",
                price: 500,
                image: './images/products/sugandhmaya_chandan_agarbatti/1.webp',
                thumbnails: [
                    './images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    './images/products/sugandhmaya_chandan_agarbatti/2.webp'
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
        console.log('✅ Database has been successfully seeded!');
    } catch (err) {
        console.error('❌ Error seeding database:', err);
    } finally {
        mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

seedDB();