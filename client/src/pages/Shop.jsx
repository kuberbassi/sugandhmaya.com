import { useMemo, useState, useTransition } from 'react';
import { ArrowDown } from 'lucide-react';
import { useShop } from '../hooks/useShop';
import ProductCard from '../components/ProductCard';
import PageStatus from '../components/PageStatus';

const Shop = () => {
    const { products, productsStatus, productsError } = useShop();
    const [filter, setFilter] = useState('all');
    const [isPending, startTransition] = useTransition();
    const categories = useMemo(() => [...new Set(products.map(product => product.category))], [products]);
    const filteredProducts = filter === 'all' ? products : products.filter(product => product.category.toLowerCase() === filter.toLowerCase());

    return (
        <main className="shop-page">
            <section className="shop-hero">
                <div className="container shop-hero-layout"><div><p className="eyebrow">The fragrance edit</p><h1 className="shop-title">Shop the<br />collection.</h1></div><div className="shop-hero-copy"><p>Handcrafted incense for rooms that feel calmer, rituals that feel richer, and moments that stay with you.</p><a href="#product-grid" className="shop-scroll-link">Explore all six scents <ArrowDown /></a></div></div>
            </section>
            <section className="filter-section" aria-label="Product filters">
                <div className="filter-buttons">
                    {['all', ...categories].map(category => (
                        <button type="button" key={category} className={`filter-button ${filter === category ? 'active' : ''}`} onClick={() => startTransition(() => setFilter(category))} aria-pressed={filter === category}>
                            {category === 'all' ? 'All Products' : category}
                        </button>
                    ))}
                </div>
            </section>
            <div id="product-grid" className={`products-grid shop-product-grid ${isPending ? 'is-filtering' : ''}`}>
                {filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index + 1} />)}
                {productsStatus === 'loading' && <PageStatus title="Loading products…" />}
                {productsStatus === 'error' && <PageStatus title="Products unavailable" message={productsError} />}
                {productsStatus === 'ready' && filteredProducts.length === 0 && <PageStatus title="No products found" message="Try another category." />}
            </div>
        </main>
    );
};

export default Shop;
