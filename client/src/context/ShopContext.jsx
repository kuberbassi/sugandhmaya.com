
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShopContext } from './ContextStore';
const PRODUCT_CACHE_KEY = 'sugandhmaya-products-v1';
const PRODUCT_CACHE_TTL = 30 * 60 * 1000;

const getCachedProducts = () => {
    try {
        const cached = JSON.parse(localStorage.getItem(PRODUCT_CACHE_KEY));
        return cached?.products?.length && Date.now() - cached.savedAt < PRODUCT_CACHE_TTL
            ? cached.products
            : [];
    } catch {
        return [];
    }
};

export const ShopProvider = ({ children }) => {
    const [products, setProducts] = useState(getCachedProducts);
    const [productsStatus, setProductsStatus] = useState(products.length ? 'ready' : 'loading');
    const [productsError, setProductsError] = useState('');
    const [cart, setCart] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('cart'));
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // In production this will point to the same origin /api/products
                // For dev, we might need a proxy or full URL if backend is on 5000
                const response = await fetch('/api/products');
                if (!response.ok) throw new Error(`Products request failed (${response.status})`);
                const nextProducts = await response.json();
                setProducts(nextProducts);
                setProductsStatus('ready');
                setProductsError('');
                localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({
                    products: nextProducts,
                    savedAt: Date.now()
                }));
            } catch (error) {
                console.error("Failed to fetch products", error);
                setProductsStatus(current => current === 'ready' ? 'ready' : 'error');
                setProductsError('We could not load the collection. Please refresh and try again.');
            }
        };
        fetchProducts();
    }, []);

    // Update cart totals and localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));

    }, [cart]);

    useEffect(() => {
        document.body.classList.toggle('cart-open', isCartOpen);
        return () => document.body.classList.remove('cart-open');
    }, [isCartOpen]);

    const cartCount = useMemo(
        () => cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0),
        [cart]
    );
    const cartTotal = useMemo(
        () => cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0),
        [cart]
    );

    // Cart Actions
    const addToCart = (product, size, scent, quantity = 1) => {
        const cartItemId = `${product.id}_${size}_${scent}`;
        setCart(prev => {
            const existing = prev.find(item => item.cartItemId === cartItemId);
            if (existing) {
                return prev.map(item =>
                    item.cartItemId === cartItemId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            const variant = product.variants.find(v => v.name === size);
            return [...prev, {
                cartItemId,
                productId: product.id,
                productName: product.name,
                size,
                scent,
                quantity,
                price: variant ? variant.price : 0,
                image: variant ? variant.images[0] : ''
            }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (cartItemId) => {
        setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId, change) => {
        setCart(prev => prev.map(item => {
            if (item.cartItemId === cartItemId) {
                const newQty = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const clearCart = useCallback(() => setCart([]), []);

    const toggleCart = () => setIsCartOpen(current => !current);

    return (
        <ShopContext.Provider value={{
            products,
            productsStatus,
            productsError,
            cart,
            isCartOpen,
            setIsCartOpen,
            toggleCart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal
        }}>
            {children}
        </ShopContext.Provider>
    );
};
