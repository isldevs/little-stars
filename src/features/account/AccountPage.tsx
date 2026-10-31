import {useEffect, useState} from 'react';
import type {FormEvent} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {ArrowRight, Check, LogOut, Package, ShieldCheck, UserRound} from 'lucide-react';
import {useStore} from '../cart/store';
import {accountService} from '../../services/account';
import type {Order, Profile} from '../../lib/types';
import {money} from '../../lib/config';
import {Modal} from '../../components/Modal';
import {TelegramLink} from '../../components/TelegramContact';
import {orderTelegramMessage} from '../../lib/telegram';
import {Image} from '../../components/Image';
import './account.css';

const sample:Profile = {firstName:'Alex',lastName:'Morgan',email:'alex@example.com'};
const orderDate=(value:string)=>new Date(value).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});

export default function AccountPage(){
  const {profile,setProfile,signOut,notify}=useStore();
  const [params,setParams]=useSearchParams();
  const [form,setForm]=useState<Profile>(profile??sample);
  const [orders,setOrders]=useState<Order[]>([]);
  const [loading,setLoading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [errors,setErrors]=useState<Partial<Record<keyof Profile,string>>>({});
  const [saved,setSaved]=useState(false);
  const [selected,setSelected]=useState<Order|null>(null);
  const [orderError,setOrderError]=useState('');
  const [orderLoading,setOrderLoading]=useState(false);
  const requestedOrder=params.get('order');

  useEffect(()=>{setForm(profile??sample)},[profile]);
  useEffect(()=>{
    if(!profile){setOrders([]);return;}
    let live=true;
    setLoading(true);setError('');
    accountService.getOrders().then(items=>{if(live)setOrders(items)}).catch(()=>{if(live)setError('Your orders could not be loaded. Please refresh and try again.')}).finally(()=>{if(live)setLoading(false)});
    return()=>{live=false};
  },[profile]);
  useEffect(()=>{
    if(!requestedOrder||!profile){setSelected(null);setOrderError('');return;}
    let live=true;setOrderLoading(true);setOrderError('');
    accountService.getOrder(requestedOrder).then(order=>{if(live){setSelected(order??null);if(!order)setOrderError('We could not find that demo order on this device.')}}).catch(()=>{if(live)setOrderError('This order could not be loaded. Please try again.')}).finally(()=>{if(live)setOrderLoading(false)});
    return()=>{live=false};
  },[requestedOrder,profile]);

  async function enterDemo(){
    setBusy(true);setError('');
    try{const next=await accountService.updateProfile(sample);setProfile(next);notify('Welcome to your demo account.');}
    catch{setError('We could not open your demo account. Please try again.');}
    finally{setBusy(false);}
  }
  async function save(event:FormEvent){
    event.preventDefault();
    const nextErrors:Partial<Record<keyof Profile,string>>={};
    if(!form.firstName.trim())nextErrors.firstName='Enter your first name.';
    if(!form.lastName.trim())nextErrors.lastName='Enter your last name.';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))nextErrors.email='Enter a valid email address.';
    setErrors(nextErrors);setSaved(false);
    if(Object.keys(nextErrors).length)return;
    setBusy(true);setError('');
    try{const next=await accountService.updateProfile({firstName:form.firstName.trim(),lastName:form.lastName.trim(),email:form.email.trim()});setProfile(next);setSaved(true);}
    catch{setError('Your profile could not be saved. Please try again.');}
    finally{setBusy(false);}
  }
  async function leave(){await Promise.resolve(signOut());setParams({});setSaved(false);notify('Signed out of your demo account.');}
  function closeOrder(){setParams({});}

  if(!profile)return <div className="container account-page"><div className="page-heading"><span className="eyebrow">A little space of your own</span><h1>Your Little Stars</h1></div><div className="demo-entry"><span className="account-icon"><UserRound size={28}/></span><span className="demo-label">DEMO ACCOUNT</span><h2>Make yourself at home.</h2><p>Explore a sample profile and revisit the demo orders you place on this device.</p><button className="btn" disabled={busy} onClick={enterDemo}>{busy?'Opening your account…':'Explore demo account'}<ArrowRight size={17}/></button><div className="demo-explainer"><ShieldCheck size={19}/><p>No password needed. This is a local demo, with no secure authentication. Your profile and orders are saved in this browser only.</p></div>{error&&<p role="alert" className="form-error">{error}</p>}<Link className="text-link" to="/shop">Back to the collection</Link></div></div>;

  return <div className="container account-page">
    <div className="page-heading account-heading"><div><span className="eyebrow">Your Little Stars</span><h1>Hello, {profile.firstName}.</h1><p className="muted">A little home for your everyday favorites.</p></div><span className="demo-label">DEMO ACCOUNT</span></div>
    <div className="account-layout">
      <aside className="account-sidebar"><div className="account-avatar">{profile.firstName.charAt(0)}{profile.lastName.charAt(0)}</div><h3>{profile.firstName} {profile.lastName}</h3><p>{profile.email}</p><a href="#profile"><UserRound size={18}/>Your profile</a><a href="#orders"><Package size={18}/>Demo orders <span>{orders.length}</span></a><button onClick={leave}><LogOut size={18}/>Demo sign out</button><p className="account-local-note">Local to this browser.<br/>No password or real authentication.</p></aside>
      <div className="account-main">
        <section className="account-panel" id="profile"><div className="account-panel-heading"><h2>Your profile</h2><span className="muted">Make it feel like you.</span></div><p className="muted">Sample details for exploring the demo. Use fictional information.</p><form onSubmit={save} noValidate><div className="profile-fields">{(['firstName','lastName','email'] as const).map(key=><div className={`field ${key==='email'?'profile-email':''}`} key={key}><label htmlFor={`profile-${key}`}>{key==='firstName'?'First name':key==='lastName'?'Last name':'Email address'}</label><input className="input" id={`profile-${key}`} type={key==='email'?'email':'text'} autoComplete={key==='firstName'?'given-name':key==='lastName'?'family-name':'email'} value={form[key]} onChange={e=>{setForm({...form,[key]:e.target.value});setSaved(false)}} aria-invalid={!!errors[key]} aria-describedby={errors[key]?`profile-${key}-error`:undefined}/>{errors[key]&&<span className="form-error" id={`profile-${key}-error`}>{errors[key]}</span>}</div>)}</div><div className="account-form-actions"><button type="submit" className="btn" disabled={busy}>{busy?'Saving…':'Save changes'}</button>{saved&&<p className="success-message" role="status"><Check size={17}/> Profile saved on this device.</p>}</div></form>{error&&<p className="form-error" role="alert">{error}</p>}</section>
        <section className="account-panel" id="orders"><div className="account-panel-heading"><h2>Your orders</h2><span className="muted">The good things, all in one place.</span></div><p className="muted">Demo orders only. No payments, shipments, or emails are sent.</p>{loading?<p className="account-loading" role="status">Finding your orders…</p>:orders.length===0?<div className="account-orders-empty"><Package size={32} strokeWidth={1.3}/><h3>Your next favorite is waiting.</h3><p>You haven’t placed a demo order yet.</p><Link className="btn-secondary" to="/shop">Explore the collection<ArrowRight size={16}/></Link></div>:<div className="order-history">{orders.map(order=><article className="history-order" key={order.id}><div className="history-order-top"><div><span className="eyebrow">{order.reference}</span><p>{orderDate(order.createdAt)}</p></div><span className="order-status"><Check size={13}/>{order.status}</span></div><div className="history-order-bottom"><div className="history-thumbnails">{order.items.slice(0,3).map(item=><Image key={item.variantId} src={item.image} alt={item.name} loading="lazy"/>)}{order.items.length>3&&<span>+{order.items.length-3}</span>}</div><div className="history-order-total"><strong>{money(order.totals.total)}</strong><span>{order.items.reduce((sum,item)=>sum+item.quantity,0)} items</span></div><button className="text-link" onClick={()=>setParams({order:order.id})}>View order<ArrowRight size={16}/></button></div></article>)}</div>}</section>
      </div>
    </div>
    <Modal open={!!requestedOrder} onClose={closeOrder} title={selected?`Order ${selected.reference}`:'Your demo order'} className="order-detail-modal">
      {orderLoading?<p role="status">Loading your order…</p>:orderError?<div className="empty-state"><Package size={32}/><h3>Order unavailable</h3><p role="alert">{orderError}</p><button className="btn-secondary" onClick={closeOrder}>Back to your account</button></div>:selected&&<><p className="order-demo-note">Demo order. No payment was collected or shipment created.</p><TelegramLink message={orderTelegramMessage(selected)}>Ask about this order on Telegram</TelegramLink><div className="order-detail-meta"><span>Placed {orderDate(selected.createdAt)}</span><span className="order-status"><Check size={13}/>{selected.status}</span></div><div className="order-detail-items">{selected.items.map(item=><div className="order-detail-item" key={item.variantId}><Image src={item.image} alt={item.name}/><div><h3>{item.name}</h3><p>{item.color} / {item.size}</p><p>Quantity {item.quantity}</p></div><strong>{money(item.price*item.quantity)}</strong></div>)}</div><dl className="order-detail-totals"><div><dt>Subtotal</dt><dd>{money(selected.totals.subtotal)}</dd></div>{selected.totals.discount>0&&<div><dt>Discount {selected.coupon}</dt><dd>−{money(selected.totals.discount)}</dd></div>}<div><dt>Shipping · {selected.shippingMethod}</dt><dd>{selected.totals.shipping===0?'Free':money(selected.totals.shipping)}</dd></div><div><dt>Tax</dt><dd>Excluded from demo</dd></div><div className="order-detail-grand"><dt>Total</dt><dd>{money(selected.totals.total)}</dd></div></dl><div className="order-delivery"><div><h3>Shipping address</h3><p>{selected.address.firstName} {selected.address.lastName}<br/>{selected.address.address}{selected.address.apartment&&`, ${selected.address.apartment}`}<br/>{selected.address.city}, {selected.address.state} {selected.address.zip}<br/>{selected.address.country}</p></div><div><h3>Estimated delivery</h3><p>{orderDate(selected.estimatedDelivery)}</p><p className="muted">Illustrative only for this demo.</p></div></div></>}
    </Modal>
  </div>;
}
