import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {ArrowRight, Check, Package, Truck} from 'lucide-react';
import {accountService} from '../../services/account';
import type {Order} from '../../lib/types';
import {money} from '../../lib/config';
import {TelegramContact} from '../../components/TelegramContact';
import {orderTelegramMessage} from '../../lib/telegram';
import {Image} from '../../components/Image';
import './checkout.css';

export default function ConfirmationPage() {
    const {id} = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        let active = true;
        accountService.getOrder(id || '').then(result => {
            if (active) {
                setOrder(result || null);
                setLoading(false);
            }
        }).catch(() => {
            if (active) {
                setError('We couldn’t load this demo order. Please try refreshing.');
                setLoading(false);
            }
        });
        return () => {
            active = false;
        };
    }, [id]);
    if (loading) return <div className="container commerce-page"><p role="status">Finding your order…</p></div>;
    if (!order) return <div className="container commerce-page">
        <div className="empty-state"><Package size={44} strokeWidth={1}/><h1>We couldn’t find that order</h1>
            <p>{error || 'Demo orders are saved in the browser where you placed them.'}</p><Link to="/account"
                                                                                                 className="btn">View
                your demo orders <ArrowRight size={16}/></Link></div>
    </div>;
    return <div className="container commerce-page confirmation-page">
        <header className="confirmation-heading"><span className="confirmation-check"><Check size={27}/></span><p
            className="eyebrow">A little something to look forward to</p><h1>Good things are on their way.</h1><p>Thank
            you, {order.address.firstName}. Your demo order is confirmed.</p>
            <div
                className="confirmation-reference">{order.reference}<span>Placed {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })}</span></div>
            <p className="demo-notice">This is a simulated order. No payment was collected and no items will be
                shipped.</p></header>
        <div className="confirmation-layout">
            <section className="confirmation-order"><h2>Your order</h2>{order.items.map(item => <article
                className="confirmation-item" key={item.variantId}><Image src={item.image} alt={item.name}/>
                <div><strong>{item.name}</strong><p>{item.color} / {item.size}</p><p>Quantity: {item.quantity}</p></div>
                <strong>{money(item.price * item.quantity)}</strong></article>)}
                <dl className="summary-totals">
                    <div>
                        <dt>Subtotal</dt>
                        <dd>{money(order.totals.subtotal)}</dd>
                    </div>
                    {order.totals.discount > 0 && <div className="discount-total">
                        <dt>Discount ({order.coupon})</dt>
                        <dd>−{money(order.totals.discount)}</dd>
                    </div>}
                    <div>
                        <dt>Shipping</dt>
                        <dd>{order.totals.shipping === 0 ? 'Free' : money(order.totals.shipping)}</dd>
                    </div>
                    <div>
                        <dt>Tax</dt>
                        <dd>Excluded in demo</dd>
                    </div>
                    <div className="summary-grand-total">
                        <dt>Total</dt>
                        <dd>{money(order.totals.total)}</dd>
                    </div>
                </dl>
            </section>
            <aside className="confirmation-delivery">
                <div><Truck size={22}/><h2>Estimated delivery</h2>
                    <p>{new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric'
                    })}</p><span
                        className="muted">{order.shippingMethod === 'express' ? 'Express delivery · 2–3 business days' : 'Standard delivery · 5–7 business days'}</span>
                </div>
                <div><h2>Shipping to</h2>
                    <address>{order.address.firstName} {order.address.lastName}<br/>{order.address.address}<br/>{order.address.apartment && <>{order.address.apartment}<br/></>}{order.address.city}, {order.address.state} {order.address.zip}<br/>{order.address.country}
                    </address>
                </div>
                <div><h2>Stay in the loop</h2><p>This order is saved to your demo account in this browser.</p><Link
                    to="/account" className="btn-secondary">View order history <ArrowRight size={15}/></Link></div>
                <TelegramContact context="order" message={orderTelegramMessage(order)}/></aside>
        </div>
        <div className="confirmation-bottom"><Link to="/shop" className="btn">Find your next favorite <ArrowRight
            size={16}/></Link><p>Need a hand? <Link to="/contact">We’re here for you.</Link></p></div>
    </div>;
}
