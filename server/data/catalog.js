const premiumImages = [
    '/media/products/product-cover.webp',
    '/media/products/product-back.webp',
    '/media/products/incense-sticks.webp',
    '/media/products/product-ritual.webp',
    '/media/products/hero-smoke.webp',
    '/media/products/hero-ritual.webp'
];

const sharedCoverImage = '/media/products/product-cover.webp';

const travelImages = [
    '/media/products/product-cover.webp',
    '/media/products/ritual-lifestyle.webp',
    '/media/products/incense-sticks.webp',
    '/media/products/product-ritual.webp'
];

const productDetails = [
    ['rose', 'Rose Agarbatti', 'Rose', 330, 83, 'Experience the divine fragrance of fresh roses in our handcrafted agarbatti.'],
    ['mogra', 'Mogra Agarbatti', 'Mogra', 330, 83, 'The sweet and delicate fragrance of mogra flowers in every stick.'],
    ['oudh-regular', 'Oudh Agarbatti', 'Oudh - Regular', 330, 83, 'The rich and earthy aroma of oudh in every stick.'],
    ['chandan', 'Chandan Agarbatti', 'Chandan', 330, 83, 'The sacred and divine fragrance of chandan in every stick.'],
    ['orchid', 'Orchid Agarbatti', 'Orchid', 330, 83, 'The sweet and delicate fragrance of orchid flowers in every stick.'],
    ['oudh-premium', 'Oudh Premium Agarbatti', 'Oudh - Premium', 450, 113, 'A rich and exotic blend of premium oudh.']
];

const rotateImages = (images, offset) => [...images.slice(offset % images.length), ...images.slice(0, offset % images.length)];

const products = productDetails.map(([id, name, scent, premiumPrice, travelPrice, description], index) => ({
    id,
    name,
    category: 'Agarbatti',
    scents: [scent],
    variants: [
        { id: `${id}-40`, name: 'Premium Box', sticks: 40, price: premiumPrice, images: rotateImages(premiumImages, index) },
        { id: `${id}-20`, name: 'Travel Pack', sticks: 20, price: travelPrice, images: rotateImages(travelImages, index) }
    ],
    description,
    featuredImage: sharedCoverImage
}));

module.exports = products;
