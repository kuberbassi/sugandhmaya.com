import { Link } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { useShop } from '../hooks/useShop';
import { formatPrice } from '../utils/format';

const CartPanel = () => {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useShop();

    return <>
        <button type="button" id="cart-panel-overlay" className={isCartOpen ? 'is-visible' : ''} onClick={toggleCart} aria-label="Close cart" tabIndex={isCartOpen ? 0 : -1} />
        <aside id="cart-panel" className={isCartOpen ? 'open' : ''} aria-hidden={!isCartOpen} aria-label="Shopping cart">
            <header id="cart-panel-header">
                <h2>Your Cart</h2>
                <button type="button" className="cart-close-button" onClick={toggleCart} aria-label="Close cart"><X /></button>
            </header>
            <div className="cart-items">
                {cart.length === 0 ? <div className="empty-cart"><span aria-hidden="true">🛍️</span><h3>Your cart is empty</h3><p>Add something beautiful to begin your ritual.</p><Link to="/shop" className="btn" onClick={toggleCart}>Explore the collection</Link></div> : cart.map(item =>
                    <article className="cart-item" key={item.cartItemId}>
                        <div className="cart-item-details">
                            <div className="cart-item-heading">
                                <div><h3>{item.productName}</h3><p>Size: {item.size} • Scent: {item.scent}</p></div>
                                <button type="button" className="cart-remove" onClick={() => removeFromCart(item.cartItemId)} aria-label={`Remove ${item.productName}`}><X /></button>
                            </div>
                            <div className="cart-item-footer">
                                <div className="cart-quantity"><button type="button" onClick={() => updateQuantity(item.cartItemId, -1)} aria-label="Decrease quantity"><Minus /></button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.cartItemId, 1)} aria-label="Increase quantity"><Plus /></button></div>
                                <div className="cart-item-price"><strong>{formatPrice(item.price * item.quantity)}</strong><span>{formatPrice(item.price)} each</span></div>
                            </div>
                        </div>
                    </article>
                )}
            </div>
            {cart.length > 0 ? <footer className="cart-summary"><div><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div><Link to="/checkout" className="btn" onClick={toggleCart}>Proceed to Checkout</Link></footer> : null}
        </aside>
    </>;
};

export default CartPanel;
