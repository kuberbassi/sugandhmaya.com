import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { formatPrice } from '../utils/format';

const ProductCard = ({ product, featured = false, index }) => {
    const variant = product.variants?.[0];
    const image = variant?.images?.[0] || product.featuredImage;
    return <Link to={`/product/${product.id}`} className={`product-card-link ${featured ? 'featured' : ''}`} aria-label={`View ${product.name}`}>
        <article className="product-card">
            <div className="product-image-container"><img src={image} alt={product.name} className="product-image" loading="lazy" />{index ? <span className="product-index">0{index}</span> : null}<span className="product-view">View <ArrowUpRight /></span></div>
            <div className="product-details"><div><p className="product-category">{product.category}</p><h3>{product.name}</h3></div><p className="product-price">From {formatPrice(variant?.price || 0)}</p></div>
        </article>
    </Link>;
};

ProductCard.propTypes = { product: PropTypes.shape({ id: PropTypes.string.isRequired, name: PropTypes.string.isRequired, category: PropTypes.string.isRequired, featuredImage: PropTypes.string, variants: PropTypes.arrayOf(PropTypes.shape({ price: PropTypes.number.isRequired, images: PropTypes.arrayOf(PropTypes.string).isRequired })).isRequired }).isRequired, featured: PropTypes.bool, index: PropTypes.number };
export default ProductCard;
