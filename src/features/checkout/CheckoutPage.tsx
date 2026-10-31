import {useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {ArrowLeft, ArrowRight, Check, CreditCard, LockKeyhole, ShoppingBag, Truck} from 'lucide-react';
import {useStore} from '../cart/store';
import {calculateTotals, validateCoupon} from '../../lib/pricing';
import {config, money} from '../../lib/config';
import type {Address, ShippingMethod} from '../../lib/types';
import {checkoutService, validateAddress} from '../../services/checkout';
import {TelegramLink} from '../../components/TelegramContact';
import {bagTelegramMessage} from '../../lib/telegram';
import {Image} from '../../components/Image';
import './checkout.css';

const initialAddress: Address = {
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
};
type AddressErrors = Partial<Record<keyof Address, string>>;

export default function CheckoutPage() {
    const {lines, resolvedLines, coupon, setCoupon, clearCart, profile, loading, error: loadError} = useStore();
    const [address, setAddress] = useState<Address>({
        ...initialAddress, ...(profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email
        } : {})
    });
    const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
    const [errors, setErrors] = useState<AddressErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [failure, setFailure] = useState('');
    const submissionGuard = useRef(false);
    const idempotencyKey = useRef(crypto.randomUUID());
    const navigate = useNavigate();
    const totals = calculateTotals(resolvedLines, coupon, shippingMethod);
    const couponIssue = coupon ? validateCoupon(coupon, totals.subtotal) : null;
    const field = (name: keyof Address, label: string, options: {
        type?: string;
        autoComplete?: string;
        wide?: boolean;
        optional?: boolean
    } = {}) => <div className={`field ${options.wide ? 'field-wide' : ''}`}><label
        htmlFor={`checkout-${name}`}>{label}{options.optional &&
        <span className="optional-label"> (optional)</span>}</label><input
        className={`input ${errors[name] ? 'input-error' : ''}`} id={`checkout-${name}`} name={name}
        type={options.type || 'text'} autoComplete={options.autoComplete}
        inputMode={name === 'zip' ? 'numeric' : undefined} value={address[name] || ''} onChange={event => {
        setAddress(current => ({...current, [name]: event.target.value}));
        setErrors(current => ({...current, [name]: undefined}));
    }} aria-required={!options.optional} aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `error-${name}` : undefined}
        maxLength={name === 'address' || name === 'apartment' ? 150 : 100}/>{errors[name] &&
        <span id={`error-${name}`} className="form-error">{errors[name]}</span>}</div>;
    if (loading) return <div className="container commerce-page"><p role="status">Preparing checkout…</p></div>;
    if (loadError) return <div className="container commerce-page">
        <div className="empty-state"><h1>Checkout needs a moment</h1><p>{loadError}</p>
            <button type="button" className="btn" onClick={() => window.location.reload()}>Try again</button>
        </div>
    </div>;
    if (!resolvedLines.length) return <div className="container commerce-page">
        <div className="empty-state"><ShoppingBag size={44} strokeWidth={1}/><h1>Your next favorite is waiting</h1>
            <p>Add a piece to your bag before heading to checkout.</p><Link className="btn" to="/shop">Explore the
                collection <ArrowRight size={16}/></Link></div>
    </div>;
    return <div className="container commerce-page checkout-page"><Link className="continue-shopping"
                                                                        to="/cart"><ArrowLeft size={16}/> Back to your
        bag</Link>
        <div className="page-heading"><p className="eyebrow">Just a few finishing touches</p><h1>Checkout</h1><p
            className="demo-notice"><LockKeyhole size={16}/> Demo checkout. No payment will be collected.</p></div>
        <form noValidate className="checkout-layout" onSubmit={async event => {
            event.preventDefault();
            if (submissionGuard.current) return;
            if (couponIssue) {
                setFailure(couponIssue);
                return;
            }
            const nextErrors: AddressErrors = validateAddress(address);
            setErrors(nextErrors);
            if (Object.keys(nextErrors).length) {
                const first = Object.keys(nextErrors)[0];
                document.getElementById(`checkout-${first}`)?.focus();
                return;
            }
            submissionGuard.current = true;
            setSubmitting(true);
            setFailure('');
            try {
                const order = await checkoutService.createOrder({
                    lines,
                    address,
                    shippingMethod,
                    coupon,
                    idempotencyKey: idempotencyKey.current
                });
                clearCart();
                navigate(`/order-confirmation/${order.id}`, {replace: true});
            } catch (error) {
                setFailure(error instanceof Error ? error.message : 'We couldn’t create your demo order. Please try again.');
                submissionGuard.current = false;
                setSubmitting(false);
            }
        }}>
            <div className="checkout-form-sections">
                <section className="checkout-section"><h2><span>01</span> Contact details</h2><p
                    className="muted">Checking out as a guest. Use sample details for this demo.</p>
                    <div className="checkout-fields">{field('email', 'Email address', {
                        type: 'email',
                        autoComplete: 'email',
                        wide: true
                    })}</div>
                </section>
                <section className="checkout-section"><h2><span>02</span> Shipping address</h2>
                    <div
                        className="checkout-fields">{field('firstName', 'First name', {autoComplete: 'given-name'})}{field('lastName', 'Last name', {autoComplete: 'family-name'})}{field('address', 'Street address', {
                        autoComplete: 'address-line1',
                        wide: true
                    })}{field('apartment', 'Apartment, suite, etc.', {
                        autoComplete: 'address-line2',
                        wide: true,
                        optional: true
                    })}{field('city', 'City', {autoComplete: 'address-level2'})}{field('state', 'State', {autoComplete: 'address-level1'})}{field('zip', 'ZIP code', {autoComplete: 'postal-code'})}
                        <div className="field"><label htmlFor="checkout-country">Country</label><select
                            className="input" id="checkout-country" value={address.country}
                            onChange={event => setAddress(current => ({...current, country: event.target.value}))}>
                            <option>United States</option>
                        </select></div>
                    </div>
                </section>
                <section className="checkout-section"><h2><span>03</span> Delivery</h2>
                    <fieldset className="shipping-options">
                        <legend className="sr-only">Shipping method</legend>
                        <label
                            className={shippingMethod === 'standard' ? 'shipping-option selected' : 'shipping-option'}><input
                            type="radio" name="shipping" value="standard" checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}/><span><strong>Standard delivery</strong><small>5–7 business days</small></span><strong>{totals.subtotal >= config.freeShippingThreshold ? 'Free' : money(config.standardShipping)}</strong></label><label
                        className={shippingMethod === 'express' ? 'shipping-option selected' : 'shipping-option'}><input
                        type="radio" name="shipping" value="express" checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}/><span><strong>Express delivery</strong><small>2–3 business days</small></span><strong>{money(config.expressShipping)}</strong></label>
                    </fieldset>
                </section>
                <section className="checkout-section"><h2><span>04</span> Demo payment</h2>
                    <div className="demo-payment"><CreditCard size={24}/>
                        <div><strong>Simulated payment</strong><p>No card details needed. This creates a sample order
                            only.</p></div>
                        <Check size={18}/></div>
                    <p className="checkout-privacy">Your sample details stay in this browser’s local storage. Please
                        avoid using sensitive personal information.</p></section>
            </div>
            <aside className="order-summary checkout-summary"><h2>Your good
                finds <span>({resolvedLines.reduce((n, line) => n + line.quantity, 0)})</span></h2>
                <div className="checkout-summary-items">{resolvedLines.map(line => <div
                    className="checkout-summary-item" key={line.variantId}>
                    <div className="checkout-thumb"><Image src={line.product.images[0]}
                                                           alt={line.product.name}/><span>{line.quantity}</span></div>
                    <div><strong>{line.product.name}</strong><p>{line.variant.color} / {line.variant.size}</p></div>
                    <strong>{money(line.product.price * line.quantity)}</strong></div>)}</div>
                <dl className="summary-totals">
                    <div>
                        <dt>Subtotal</dt>
                        <dd>{money(totals.subtotal)}</dd>
                    </div>
                    {totals.discount > 0 && <div className="discount-total">
                        <dt>Discount ({coupon})</dt>
                        <dd>−{money(totals.discount)}</dd>
                    </div>}
                    <div>
                        <dt>Shipping</dt>
                        <dd>{totals.shipping === 0 ? 'Free' : money(totals.shipping)}</dd>
                    </div>
                    <div>
                        <dt>Tax</dt>
                        <dd>Excluded in demo</dd>
                    </div>
                    <div className="summary-grand-total">
                        <dt>Total <small>USD</small></dt>
                        <dd>{money(totals.total)}</dd>
                    </div>
                </dl>
                {couponIssue && <p className="form-error checkout-failure" role="alert">{couponIssue}
                    <button type="button" className="remove-coupon-checkout" onClick={() => {
                        setCoupon('');
                        setFailure('');
                    }}>Remove coupon
                    </button>
                </p>}{failure && <p className="form-error checkout-failure" role="alert">{failure}</p>}
                <button type="submit" className="btn checkout-button" disabled={submitting || !!couponIssue}
                        aria-busy={submitting}>{submitting ? 'Creating your demo order…' : 'Place demo order'}{!submitting &&
                    <ArrowRight size={16}/>}</button>
                <p className="demo-reassurance">Demo checkout. No payment will be collected.</p><p
                    className="checkout-terms">By placing a demo order, you agree to our <Link to="/terms">sample
                    terms</Link> and <Link to="/privacy">privacy policy</Link>.</p>
                <div className="checkout-telegram"><TelegramLink message={bagTelegramMessage(resolvedLines, totals)}>Need
                    help? Chat on Telegram</TelegramLink></div>
                <div className="checkout-shipping-note"><Truck size={18}/><span>A little closer to your doorstep.</span>
                </div>
            </aside>
        </form>
    </div>;
}
