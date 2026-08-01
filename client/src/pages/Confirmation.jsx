import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { formatPrice } from '../utils/format';

const readLatestOrder = () => {
    try { return JSON.parse(localStorage.getItem('latestOrder')); } catch { return null; }
};

const Confirmation = () => {
    const [order] = useState(readLatestOrder);
    if (!order) return <Navigate to="/" replace />;
    const orderNumber = String(order._id || '').slice(-6).toUpperCase() || 'PENDING';

    return (
        <main className="confirmation-page">
            <section className="confirmation-card">
                <div className="confirmation-icon"><Check aria-hidden="true" /></div>
                <h1>Order Placed Successfully!</h1>
                <p>Thank you, {order.customer?.name}. Your order receipt has been sent to {order.customer?.email}.</p>
                <div className="confirmation-details">
                    <p><strong>Order ID:</strong> #{orderNumber}</p>
                    <div className="confirmation-items">{order.items?.map(item => <div className="confirmation-item" key={`${item.productId}-${item.size}-${item.scent}`}><div><strong>{item.name}</strong><span>{item.size} × {item.quantity}</span></div><b>{formatPrice(item.price * item.quantity)}</b></div>)}</div>
                    <div className="confirmation-total">Total: {formatPrice(order.total)}</div>
                </div>
                <div className="confirmation-actions"><Link to="/shop" className="btn">Continue Shopping</Link><button type="button" className="btn btn-secondary" onClick={() => window.print()}>Print Receipt</button></div>
            </section>
        </main>
    );
};

export default Confirmation;
