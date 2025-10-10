import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv with path
dotenv.config({ path: './server/.env' });

const products = [
    {
        id: 'rose',
        name: 'Rose Agarbatti',
        category: 'Agarbatti',
        scents: ['Rose', 'Sandalwood'],
        variants: [
            {
                id: 'rose-40',
                name: 'Premium Box',
                sticks: 40,
                price: 70,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/2.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            },
            {
                id: 'rose-12',
                name: 'Travel Pack',
                sticks: 12,
                price: 15,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/4.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/5.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            }
        ],
        description: 'Experience the divine fragrance of fresh roses in our handcrafted agarbatti.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'mogra',
        name: 'Mogra Agarbatti',
        category: 'Agarbatti',
        scents: ['Mogra', 'Jasmine'],
        variants: [
            {
                id: 'mogra-40',
                name: 'Premium Box',
                sticks: 40,
                price: 70,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/2.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            },
            {
                id: 'mogra-12',
                name: 'Travel Pack',
                sticks: 12,
                price: 15,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/4.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/5.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            }
        ],
        description: 'The sweet and delicate fragrance of mogra flowers in every stick.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'oudh',
        name: 'Oudh Agarbatti',
        category: 'Agarbatti',
        scents: ['Oudh', 'Musk'],
        variants: [
            {
                id: 'oudh-40',
                name: 'Premium Box',
                sticks: 40,
                price: 70,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/2.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            },
            {
                id: 'oudh-12',
                name: 'Travel Pack',
                sticks: 12,
                price: 15,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/4.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/5.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            }
        ],
        description: 'The rich and earthy aroma of oudh in every stick.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'chandan',
        name: 'Chandan Agarbatti',
        category: 'Agarbatti',
        scents: ['Chandan', 'Sandalwood'],
        variants: [
            {
                id: 'chandan-40',
                name: 'Premium Box',
                sticks: 40,
                price: 70,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/2.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            },
            {
                id: 'chandan-12',
                name: 'Travel Pack',
                sticks: 12,
                price: 15,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/4.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/5.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            }
        ],
        description: 'The sacred and divine fragrance of chandan in every stick.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'orchid',
        name: 'Orchid Agarbatti',
        category: 'Agarbatti',
        scents: ['Orchid', 'Lily'],
        variants: [
            {
                id: 'orchid-40',
                name: 'Premium Box',
                sticks: 40,
                price: 70,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/1.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/2.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            },
            {
                id: 'orchid-12',
                name: 'Travel Pack',
                sticks: 12,
                price: 15,
                images: [
                    '/images/products/sugandhmaya_chandan_agarbatti/4.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/5.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
                    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
                ]
            }
        ],
        description: 'The sweet and delicate fragrance of orchid flowers in every stick.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    }
];

// Asynchronously import the CommonJS modules
(async () => {
    try {
        const productModule = await import('./server/models/product.js');
        const dbModule = await import('./server/db.js');
        const Product = productModule.default;
        const connectDB = dbModule.default;
        
        await connectDB();

        console.log('Clearing existing products...');
        await Product.deleteMany({});

        console.log('Populating the database with new products...');
        await Product.insertMany(products);
        console.log('✅ Database successfully populated!');
        
        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Database seeding failed:', err.message);
        process.exit(1);
    }
})();