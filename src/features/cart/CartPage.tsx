import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from 'lucide-react';
import { useStore } from './store';
import { calculateTotals, validateCoupon } from '../../lib/pricing';
import { config, money } from '../../lib/config';
import { TelegramContact } from '../../components/TelegramContact';
import { bagTelegramMessage } from '../../lib/telegram';
import { Image } from '../../components/Image';
import '../checkout/checkout.css';

export function CartContents({ compact = false, onCheckout }: {compact?: boolean; onCheckout?: () => void}) {
  const { resolvedLines, updateQuantity, removeItem, coupon, setCoupon, setCartOpen, notify, loading, error:loadError } = useStore();
  const [code, setCode] = useState(coupon);
  const [couponError, setCouponError] = useState('');
  const totals = calculateTotals(resolvedLines, coupon);
  const remaining = Math.max(0, config.freeShippingThreshold - totals.subtotal);
  const couponIssue = coupon ? validateCoupon(coupon, totals.subtotal) : null;
  const close = () => setCartOpen(false);
  const changeQuantity = (variantId: string, quantity: number) => {
    try { updateQuantity(variantId, quantity); }
    catch (error) { notify(error instanceof Error ? error.message : 'Unable to update quantity.'); }
  };
  if (loading) return <div className="commerce-loading" role="status">Getting your shopping bag ready…</div>;
  if (loadError) return <div className="empty-state"><ShoppingBag size={42} strokeWidth={1}/><h2>Your bag needs a moment</h2><p>{loadError}</p><button type="button" className="btn" onClick={()=>window.location.reload()}>Try again</button></div>;
  if (!resolvedLines.length) return <div className="empty-state cart-empty"><ShoppingBag size={42} strokeWidth={1} /><p className="eyebrow">A little room for something lovely</p><h2>Your bag is empty</h2><p>Find your new everyday favorite in our latest collection.</p><Link to="/shop" className="btn" onClick={close}>Explore the collection <ArrowRight size={16} /></Link></div>;
  return <div className={`cart-layout ${compact ? 'cart-layout-compact' : ''}`}>
    <section className="cart-items" aria-label="Shopping bag items">
      <div className="shipping-progress"><Truck size={19} /><p>{remaining ? <>You’re <strong>{money(remaining)}</strong> away from free standard shipping (before discounts).</> : <><Check size={15} /> Your order qualifies for free standard shipping.</>}</p><div role="progressbar" aria-label="Progress toward free shipping" aria-valuenow={Math.min(100, Math.round(totals.subtotal/config.freeShippingThreshold*100))} aria-valuemin={0} aria-valuemax={100}><span style={{width:`${Math.min(100,totals.subtotal/config.freeShippingThreshold*100)}%`}} /></div></div>
      {resolvedLines.map(line => <article className="cart-line" key={line.variantId}>
        <Link to={`/product/${line.product.slug}`} onClick={close} className="cart-line-image"><Image src={line.product.images[0]} alt={`${line.product.name} in ${line.variant.color}`} /></Link>
        <div className="cart-line-info"><p className="eyebrow">{line.product.category}</p><Link to={`/product/${line.product.slug}`} onClick={close} className="cart-product-name">{line.product.name}</Link><p className="muted cart-variant">{line.variant.color} <span> / </span> {line.variant.size}</p><p className="cart-unit-price">{money(line.product.price)}{line.product.originalPrice && <del>{money(line.product.originalPrice)}</del>}</p>
          <div className="cart-line-actions"><div className="commerce-quantity" aria-label={`Quantity for ${line.product.name}`}><button type="button" aria-label={`Decrease quantity of ${line.product.name}, ${line.variant.color}, size ${line.variant.size}`} disabled={line.quantity <= 1} onClick={() => changeQuantity(line.variantId,line.quantity-1)}><Minus size={14}/></button><span aria-live="polite">{line.quantity}</span><button type="button" aria-label={`Increase quantity of ${line.product.name}, ${line.variant.color}, size ${line.variant.size}`} disabled={line.quantity >= line.variant.stock} onClick={() => changeQuantity(line.variantId,line.quantity+1)}><Plus size={14}/></button></div><button type="button" className="cart-remove" onClick={() => removeItem(line.variantId)} aria-label={`Remove ${line.product.name}, ${line.variant.color}, size ${line.variant.size}`}><Trash2 size={15}/><span>Remove</span></button></div>
          {line.quantity >= line.variant.stock && <p className="stock-note">All {line.variant.stock} available pieces are in your bag.</p>}
        </div><strong className="cart-line-total">{money(line.product.price*line.quantity)}</strong>
      </article>)}
      {!compact && <Link to="/shop" className="continue-shopping"><ArrowLeft size={16}/> Continue shopping</Link>}
    </section>
    <aside className="order-summary"><h2>Order summary</h2><form className="coupon-form" onSubmit={event=>{event.preventDefault(); const normalized=code.trim().toUpperCase(); const error=validateCoupon(normalized,totals.subtotal); if(error){setCouponError(error);return;} setCoupon(normalized);setCode(normalized);setCouponError('');notify('Your 10% discount is applied.');}}><label htmlFor={compact?'drawer-coupon':'cart-coupon'}><Tag size={15}/> Have a little treat?</label><div><input className="input" id={compact?'drawer-coupon':'cart-coupon'} value={code} onChange={event=>{setCode(event.target.value);setCouponError('');}} placeholder="Discount code" aria-describedby={couponError ? (compact?'drawer-coupon-error':'cart-coupon-error'):undefined}/><button className="btn-secondary" type="submit">Apply</button></div><p className="coupon-hint">Try STAR10 for 10% off orders of $50 or more.</p>{couponError && <p className="form-error" id={compact?'drawer-coupon-error':'cart-coupon-error'} role="alert">{couponError}</p>}{coupon && !couponIssue && <p className="coupon-success"><Check size={14}/> {coupon} applied <button type="button" onClick={()=>{setCoupon('');setCode('');}}>Remove</button></p>}{couponIssue && <p className="form-error" role="alert">{couponIssue} <button type="button" className="remove-coupon-checkout" onClick={()=>{setCoupon('');setCode('');setCouponError('');}}>Remove coupon</button></p>}</form>
      <dl className="summary-totals"><div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>{totals.discount>0 && <div className="discount-total"><dt>Discount ({coupon})</dt><dd>−{money(totals.discount)}</dd></div>}<div><dt>Standard shipping</dt><dd>{totals.shipping===0?'Free':money(totals.shipping)}</dd></div><div><dt>Tax</dt><dd>Excluded in demo</dd></div><div className="summary-grand-total"><dt>Estimated total</dt><dd>{money(totals.total)}</dd></div></dl>
      <Link to="/checkout" className="btn checkout-button" onClick={()=>{close();onCheckout?.();}}>Continue to checkout <ArrowRight size={16}/></Link><p className="demo-reassurance">Demo checkout. No payment will be collected.</p><TelegramContact message={bagTelegramMessage(resolvedLines,totals)}/>{compact && <Link to="/cart" className="view-bag-link" onClick={close}>View your bag</Link>}
    </aside>
  </div>;
}

export default function CartPage(){ const {resolvedLines}=useStore(); return <div className="container commerce-page"><div className="page-heading"><p className="eyebrow">Your good finds</p><h1>Shopping bag<span className="heading-count">({resolvedLines.reduce((sum,line)=>sum+line.quantity,0)})</span></h1><p className="muted">Thoughtful pieces. Everyday possibilities.</p></div><CartContents/></div>; }
