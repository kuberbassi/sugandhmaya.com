import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../hooks/useShop';
import PageStatus from '../components/PageStatus';
import { formatPrice } from '../utils/format';

const requestJson = async (url, body) => {
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || 'Something went wrong. Please try again.');
    return data;
};

const initialForm = { name: '', email: '', phone: '', country: '', state: '', address: '', pin: '' };

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useShop();
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [otp, setOtp] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const changeField = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

    const sendOtp = async event => {
        event.preventDefault();
        setStatus('sending');
        setError('');
        try {
            await requestJson('/api/send-otp', { email: form.email });
            setModalOpen(true);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setStatus('idle');
        }
    };

    const completeOrder = async () => {
        if (!/^\d{6}$/.test(otp)) return setError('Enter the complete 6-digit verification code.');
        setStatus('verifying');
        setError('');
        try {
            await requestJson('/api/verify-otp', { email: form.email, otp });
            setStatus('ordering');
            const result = await requestJson('/api/orders', { customer: form, items: cart });
            localStorage.setItem('latestOrder', JSON.stringify(result.order));
            clearCart();
            navigate('/confirmation', { replace: true });
        } catch (requestError) {
            setError(requestError.message);
            setStatus('idle');
        }
    };

    if (cart.length === 0) return <main className="checkout-page"><PageStatus title="Your cart is empty" message="Add a product before checking out." action={<Link className="btn" to="/shop">Continue shopping</Link>} /></main>;

    return <main className="checkout-page">
        <div className="checkout-layout-grid">
            <section className="checkout-form-section">
                <div className="form-container">
                    <Link to="/" className="checkout-heading"><img src="/images/Sugandhmaya-icon.webp" alt="" /><h1>Shipping Information</h1></Link>
                    <form onSubmit={sendOtp} className="checkout-form">
                        <label className="form-group">Full name<input name="name" autoComplete="name" required value={form.name} onChange={changeField} /></label>
                        <label className="form-group">Email<input name="email" type="email" autoComplete="email" required value={form.email} onChange={changeField} /></label>
                        <label className="form-group">Phone<span className="phone-field"><span className="phone-prefix" aria-hidden="true"><span className="country-flag">🇮🇳</span> +91</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="81234 56789" required value={form.phone} onChange={changeField} /></span></label>
                        <div className="form-row">
                            <label className="form-group">Country<input name="country" autoComplete="country-name" required value={form.country} onChange={changeField} /></label>
                            <label className="form-group">State<input name="state" autoComplete="address-level1" required value={form.state} onChange={changeField} /></label>
                        </div>
                        <label className="form-group">Address<input name="address" autoComplete="street-address" placeholder="Street address, apartment, etc." required value={form.address} onChange={changeField} /></label>
                        <label className="form-group">PIN / ZIP Code<input name="pin" inputMode="numeric" autoComplete="postal-code" required value={form.pin} onChange={changeField} /></label>
                        {error && !modalOpen ? <p className="form-error" role="alert">{error}</p> : null}
                        <button type="submit" className="btn checkout-button" disabled={status !== 'idle'}>{status === 'sending' ? 'Sending verification code…' : 'Place Order'}</button>
                    </form>
                </div>
            </section>
            <section className="checkout-summary-section">
                <div className="summary-container">
                    <h2>Order Summary</h2>
                    <div className="summary-items">{cart.map(item => <div key={item.cartItemId} className="summary-item"><div><strong>{item.productName}</strong><span>{item.size} × {item.quantity}</span></div><b>{formatPrice(item.price * item.quantity)}</b></div>)}</div>
                    <div className="summary-divider" />
                    <div className="summary-total"><span>Total</span><strong>{formatPrice(cartTotal)}</strong></div>
                </div>
            </section>
        </div>
        {modalOpen ? <div className="modal-backdrop" role="presentation"><section className="otp-modal" role="dialog" aria-modal="true" aria-labelledby="otp-title"><h2 id="otp-title">Verify Your Order</h2><p>A 6-digit verification code has been sent to {form.email}.</p><input value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, ''))} maxLength="6" inputMode="numeric" autoComplete="one-time-code" aria-label="Six-digit verification code" placeholder="------" />{error ? <p className="form-error" role="alert">{error}</p> : null}<div className="modal-actions"><button type="button" className="btn" onClick={completeOrder} disabled={status !== 'idle'}>{status === 'verifying' ? 'Verifying…' : status === 'ordering' ? 'Placing order…' : 'Verify & Complete Order'}</button><button type="button" className="btn btn-secondary" onClick={() => { setModalOpen(false); setOtp(''); setError(''); }} disabled={status !== 'idle'}>Cancel</button></div></section></div> : null}
    </main>;
};

export default Checkout;
