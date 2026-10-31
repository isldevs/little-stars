import { useState } from 'react';
import { Heart, Minus, Plus, ShoppingBag, Ruler, Check, Truck, RotateCcw } from 'lucide-react';
import type { Product } from '../../lib/types';
import { money } from '../../lib/config';
import { useStore } from '../cart/store';
import { Modal } from '../../components/Modal';

export function ProductSelection({product}:{product:Product}){
 const {addItem,toggleWishlist,wishlist,setCartOpen,lines}=useStore();
 const [color,setColor]=useState('');const [size,setSize]=useState('');const [quantity,setQuantity]=useState(1);const [guide,setGuide]=useState(false);const [error,setError]=useState('');const [added,setAdded]=useState(false);
 const variant=product.variants.find(v=>v.color===color&&v.size===size);
 const existing=variant?lines.find(l=>l.variantId===variant.id)?.quantity||0:0;
 const remaining=variant?Math.max(0,variant.stock-existing):undefined;
 const soldOut=product.variants.every(v=>v.stock===0);
 const selectColor=(value:string)=>{setColor(value);setQuantity(1);setError('');setAdded(false)};
 const selectSize=(value:string)=>{setSize(value);setQuantity(1);setError('');setAdded(false)};
 const submit=()=>{setError('');if(!color||!size){setError(`Please choose ${!color&&!size?'a color and size':!color?'a color':'a size'} before adding to your bag.`);return}if(!variant||variant.stock===0){setError('This combination is currently sold out. Please choose another.');return}if(quantity>(remaining||0)){setError(`You already have ${existing} in your bag. Only ${variant.stock} available in this variant.`);return}try{addItem(product,variant,quantity);setAdded(true);setCartOpen(true)}catch(e){setError(e instanceof Error?e.message:'This item could not be added. Please try again.')}};
 return <div className="product-selection">
  <p className="eyebrow">{product.category.toUpperCase()} / {product.collection.replaceAll('-',' ').toUpperCase()}</p>
  <h1>{product.name}</h1>
  <div className="product-price"><span>{money(product.price)}</span>{product.originalPrice&&<><del>{money(product.originalPrice)}</del><span className="product-saving">Save {Math.round((1-product.price/product.originalPrice)*100)}%</span></>}</div>
  <p className="product-description">{product.description}</p>
  <fieldset className="product-options"><legend>Color <span>{color||'Choose a color'}</span></legend><div className="product-colors">{product.colors.map(c=><button type="button" key={c.name} aria-label={`Color: ${c.name}`} title={c.name} aria-pressed={color===c.name} className={color===c.name?'selected':''} onClick={()=>selectColor(c.name)}><span style={{background:c.hex}}/>{color===c.name&&<Check size={13} color={['#ffffff','#fff','#f5f0e8','#e8e1d5'].includes(c.hex.toLowerCase())?'#262a26':'#fff'}/>}</button>)}</div></fieldset>
  <div className="size-label"><span>Size <span className="muted">{size||'Choose a size'}</span></span><button className="text-button" onClick={()=>setGuide(true)}><Ruler size={14}/> Size guide</button></div>
  <div className="product-sizes">{product.sizes.map(s=>{const unavailable=color? !product.variants.some(v=>v.size===s&&v.color===color&&v.stock>0):!product.variants.some(v=>v.size===s&&v.stock>0);return <button type="button" key={s} aria-label={`Size ${s}${unavailable?', sold out':''}`} aria-pressed={size===s} disabled={unavailable} onClick={()=>selectSize(s)} className={`${size===s?'selected':''} ${unavailable?'unavailable':''}`}>{s}</button>})}</div>
  <p className={`product-stock ${variant?.stock===0||soldOut?'out':''}`} role="status"><span/>{soldOut?'Currently sold out':variant?variant.stock===0?'This variant is sold out':remaining===0?`All ${variant.stock} available are in your bag`:variant.stock<=4?`Only ${variant.stock} left in this color and size`:`In stock · ${variant.stock} available`:'Select your color and size for availability'}</p>
  <div className="product-purchase"><div className="quantity-control"><button aria-label="Decrease quantity" disabled={quantity<=1} onClick={()=>{setQuantity(q=>Math.max(1,q-1));setAdded(false)}}><Minus size={16}/></button><output aria-live="polite" aria-label="Quantity">{quantity}</output><button aria-label="Increase quantity" disabled={quantity>=(remaining??10)} onClick={()=>{setQuantity(q=>q+1);setAdded(false)}}><Plus size={16}/></button></div><button className="btn add-to-bag" disabled={soldOut||remaining===0} onClick={submit}>{added?<Check size={17}/>:<ShoppingBag size={17}/>} {soldOut?'Sold out':remaining===0?'Already in your bag':added?'Added to bag':'Add to bag'}</button><button className={`product-wishlist ${wishlist.includes(product.id)?'saved':''}`} aria-label={wishlist.includes(product.id)?'Remove from wishlist':'Add to wishlist'} aria-pressed={wishlist.includes(product.id)} onClick={()=>toggleWishlist(product.id)}><Heart size={21} fill={wishlist.includes(product.id)?'currentColor':'none'}/></button></div>
  {error&&<p className="form-error" role="alert">{error}</p>}
  <p className="product-note">A little something you’ll wear a lot.</p>
  <div className="product-delivery"><span><Truck size={19}/>Free shipping on orders $125+</span><span><RotateCcw size={18}/>Easy returns within 30 days</span></div>
  <Modal open={guide} onClose={()=>setGuide(false)} title="Find your fit"><p className="muted">A little guidance for the right fit. Sample body measurements in inches; allow a little room for comfort.</p><div className="size-guide-table"><table><thead><tr><th>Size</th><th>{product.category==='kids'?'Height':'Chest / Bust'}</th><th>Waist</th><th>{product.category==='kids'?'Age':'Hip'}</th></tr></thead><tbody>{product.sizes.map((s,i)=><tr key={s}><th>{s}</th><td>{product.category==='kids'?`${35+i*4}–${38+i*4}`:`${32+i*2}–${34+i*2}`}</td><td>{product.category==='kids'?`${20+i}–${21+i}`:`${25+i*2}–${27+i*2}`}</td><td>{product.category==='kids'?s:`${35+i*2}–${37+i*2}`}</td></tr>)}</tbody></table></div><p className="muted">Between sizes? Choose the larger size for an easy, relaxed fit. Measurements are illustrative for this demo.</p></Modal>
 </div>
}
