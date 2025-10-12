import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv with path
dotenv.config({ path: './server/.env' });

const images_40_sticks = [
    '/images/products/sugandhmaya_chandan_agarbatti/1.webp',
    '/images/products/sugandhmaya_chandan_agarbatti/2.webp',
    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
];

const images_20_sticks = [
    '/images/products/sugandhmaya_chandan_agarbatti/4.webp',
    '/images/products/sugandhmaya_chandan_agarbatti/5.webp',
    '/images/products/sugandhmaya_chandan_agarbatti/3.webp',
    '/images/products/sugandhmaya_chandan_agarbatti/6.webp'
];

const products = [
    {
        id: 'rose',
        name: 'Rose Agarbatti',
        category: 'Agarbatti',
        scents: ['Rose'],
        variants: [
            {
                id: 'rose-40',
                name: 'Premium Box',
                sticks: 40,
                price: 330,
                images: images_40_sticks
            },
            {
                id: 'rose-20',
                name: 'Travel Pack',
                sticks: 20,
                price: 83,
                images: images_20_sticks
            }
        ],
        description: 'Experience the divine fragrance of fresh roses in our handcrafted agarbatti.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'mogra',
        name: 'Mogra Agarbatti',
        category: 'Agarbatti',
        scents: ['Mogra'],
        variants: [
            {
                id: 'mogra-40',
                name: 'Premium Box',
                sticks: 40,
                price: 330,
                images: images_40_sticks
            },
            {
                id: 'mogra-20',
                name: 'Travel Pack',
                sticks: 20,
                price: 83,
                images: images_20_sticks
            }
        ],
        description: 'The sweet and delicate fragrance of mogra flowers in every stick.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'oudh-regular',
        name: 'Oudh Agarbatti',
        category: 'Agarbatti',
        scents: ['Oudh - Regular'],
        variants: [
            {
                id: 'oudh-regular-40',
                name: 'Premium Box',
                sticks: 40,
                price: 330,
                images: images_40_sticks
            },
            {
                id: 'oudh-regular-20',
                name: 'Travel Pack',
                sticks: 20,
                price: 83,
                images: images_20_sticks
            }
        ],
        description: 'The rich and earthy aroma of oudh in every stick.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'chandan',
        name: 'Chandan Agarbatti',
        category: 'Agarbatti',
        scents: ['Chandan'],
        variants: [
            {
                id: 'chandan-40',
                name: 'Premium Box',
                sticks: 40,
                price: 330,
                images: images_40_sticks
            },
            {
                id: 'chandan-20',
                name: 'Travel Pack',
                sticks: 20,
                price: 83,
                images: images_20_sticks
            }
        ],
        description: 'The sacred and divine fragrance of chandan in every stick.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'orchid',
        name: 'Orchid Agarbatti',
        category: 'Agarbatti',
        scents: ['Orchid'],
        variants: [
            {
                id: 'orchid-40',
                name: 'Premium Box',
                sticks: 40,
                price: 330,
                images: images_40_sticks
            },
            {
                id: 'orchid-20',
                name: 'Travel Pack',
                sticks: 20,
                price: 83,
                images: images_20_sticks
            }
        ],
        description: 'The sweet and delicate fragrance of orchid flowers in every stick.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    },
    {
        id: 'oudh-premium',
        name: 'Oudh Premium Agarbatti',
        category: 'Agarbatti',
        scents: ['Oudh - Premium'],
        variants: [
            {
                id: 'oudh-premium-40',
                name: 'Premium Box',
                sticks: 40,
                price: 450,
                images: images_40_sticks
            },
            {
                id: 'oudh-premium-20',
                name: 'Travel Pack',
                sticks: 20,
                price: 113,
                images: images_20_sticks
            }
        ],
        description: 'A rich and exotic blend of premium oudh.',
        featuredImage: '/images/products/sugandhmaya_chandan_agarbatti/1.webp'
    }
];

// Asynchronously import the CommonJS module
(async () => {
    try {
        const { default: Product } = await import('./server/models/product.js');
        const { default: connectDB } = await import('./server/db.js');
        
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