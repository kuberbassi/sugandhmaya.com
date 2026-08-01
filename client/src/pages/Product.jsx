import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import PropTypes from 'prop-types';
import { useShop } from '../hooks/useShop';
import PageStatus from '../components/PageStatus';
import { formatPrice } from '../utils/format';

const OptionGroup = ({ label, options, value, onChange }) => {
    if (options.length <= 1) return null;
    return (
        <fieldset className="product-option-group">
            <legend className="subheading">{label}</legend>
            <div className="option-list">
                {options.map(option => (
                    <button type="button" key={option} className={`option-button ${value === option ? 'selected' : ''}`} onClick={() => onChange(option)} aria-pressed={value === option}>
                        {option}
                    </button>
                ))}
            </div>
        </fieldset>
    );
};

OptionGroup.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

const Accordion = ({ title, children, open, onToggle }) => (
    <div className={`accordion-item ${open ? 'active' : ''}`}>
        <button type="button" className="accordion-header" onClick={onToggle} aria-expanded={open}>
            <span>{title}</span><ChevronDown className="accordion-icon" aria-hidden="true" />
        </button>
        <div className="accordion-content" hidden={!open}>{children}</div>
    </div>
);

Accordion.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    open: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired
};

const ProductDetails = ({ product, addToCart }) => {
    const [variantName, setVariantName] = useState(product.variants[0].name);
    const [scent, setScent] = useState(product.scents?.[0] || 'Original');
    const [quantity, setQuantity] = useState(1);
    const [imageIndex, setImageIndex] = useState(0);
    const [openPanel, setOpenPanel] = useState('details');
    const variant = product.variants.find(item => item.name === variantName) || product.variants[0];
    const images = variant.images || [];

    const chooseVariant = (name) => {
        setVariantName(name);
        setImageIndex(0);
    };
    const showImage = direction => setImageIndex(current => (current + direction + images.length) % images.length);

    return (
        <main className="product-page-main">
            <div className="container product-page-container">
                <nav className="product-breadcrumb"><Link to="/shop">Shop</Link><span>/</span><span>{product.name}</span></nav>
                <div className="product-layout">
                    <section className="product-gallery" aria-label={`${product.name} images`}>
                        <div className="main-image-wrapper">
                            <img src={images[imageIndex]} alt={`${product.name}, ${variant.name}`} />
                            {images.length > 1 && <>
                                <button type="button" className="image-nav-arrow previous" onClick={() => showImage(-1)} aria-label="Previous image"><ChevronLeft /></button>
                                <button type="button" className="image-nav-arrow next" onClick={() => showImage(1)} aria-label="Next image"><ChevronRight /></button>
                            </>}
                        </div>
                        {images.length > 1 && <div className="thumbnail-track">
                            {images.map((image, index) => <button type="button" key={image} className={`thumbnail-button ${imageIndex === index ? 'active' : ''}`} onClick={() => setImageIndex(index)} aria-label={`View image ${index + 1}`}><img src={image} alt="" /></button>)}
                        </div>}
                    </section>
                    <section className="product-info">
                        <p className="subheading">{product.category}</p>
                        <h1>{product.name}</h1>
                        <p className="product-detail-price">{formatPrice(variant.price)}</p>
                        <p className="product-description">{product.description}</p>
                        <OptionGroup label="Scent" options={product.scents || []} value={scent} onChange={setScent} />
                        <OptionGroup label="Size" options={product.variants.map(item => item.name)} value={variantName} onChange={chooseVariant} />
                        <div className="purchase-row">
                            <div className="quantity-selector">
                                <button type="button" onClick={() => setQuantity(current => Math.max(1, current - 1))} aria-label="Decrease quantity"><Minus /></button>
                                <output aria-label="Quantity">{quantity}</output>
                                <button type="button" onClick={() => setQuantity(current => current + 1)} aria-label="Increase quantity"><Plus /></button>
                            </div>
                            <button type="button" className="btn add-to-cart-button" onClick={() => addToCart(product, variant.name, scent, quantity)}>Add to Cart</button>
                        </div>
                        <div className="product-accordions">
                            <Accordion title="Product Details" open={openPanel === 'details'} onToggle={() => setOpenPanel(openPanel === 'details' ? '' : 'details')}><p>This handcrafted product is made with 100% natural ingredients, including pure essential oils and sustainable wood powder. Our unique blend ensures a clean and long-lasting burn, perfect for meditation and daily rituals.</p></Accordion>
                            <Accordion title="Shipping & Returns" open={openPanel === 'shipping'} onToggle={() => setOpenPanel(openPanel === 'shipping' ? '' : 'shipping')}><p>We offer free shipping on all orders above ₹500. Orders are typically processed within 1–2 business days. We accept returns within 30 days for unused products in their original packaging.</p></Accordion>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
};

ProductDetails.propTypes = {
    product: PropTypes.object.isRequired,
    addToCart: PropTypes.func.isRequired
};

const Product = () => {
    const { id } = useParams();
    const { products, productsStatus, productsError, addToCart } = useShop();
    const product = products.find(item => item.id === id);
    if (!product) return <main className="product-page-main"><PageStatus title={productsStatus === 'loading' ? 'Loading product…' : 'Product not found'} message={productsStatus === 'error' ? productsError : undefined} action={productsStatus !== 'loading' ? <Link className="btn" to="/shop">Back to shop</Link> : undefined} /></main>;
    return <ProductDetails key={product.id} product={product} addToCart={addToCart} />;
};

export default Product;
