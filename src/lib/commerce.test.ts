import { beforeEach, describe, expect, it } from 'vitest';
import { addCartItem, calculateTotals, resolveCart, updateCartQuantity, validateCoupon } from './pricing';
import { catalogService } from '../services/catalog';
import { checkoutService } from '../services/checkout';
import { accountService } from '../services/account';
import { readStored } from './storage';
import type { Address, Product, ResolvedLine } from './types';
const memory = new Map<string,string>();
Object.defineProperty(globalThis,'localStorage',{value:{getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value),removeItem:(key:string)=>memory.delete(key),clear:()=>memory.clear()},configurable:true});
let product:Product;
let line:ResolvedLine;
const address:Address = {firstName:'Alex',lastName:'Rivera',email:'alex@example.com',address:'123 Maple Street',city:'Portland',state:'OR',zip:'97205',country:'US'};
beforeEach(async()=>{memory.clear();product=(await catalogService.getAll())[0];const variant=product.variants.find(v=>v.stock>2)!;line={productId:product.id,variantId:variant.id,quantity:1,product,variant};});
describe('integer-cent shared pricing',()=>{
  it('calculates standard shipping, coupon discount and excluded tax',()=>{
    const totals=calculateTotals([line],'STAR10');
    expect(totals).toEqual({subtotal:6800,discount:680,shipping:695,tax:0,total:6815});
    expect(Object.values(totals).every(Number.isInteger)).toBe(true);
  });
  it('rounds fractional-cent discounts once, never unit by unit',()=>{const unusual={...line,quantity:3,product:{...product,price:1999}};expect(calculateTotals([unusual],'STAR10').discount).toBe(600);});
  it('applies free standard shipping before discount and charges for express',()=>{
    const lines=[{...line,quantity:2}];expect(calculateTotals(lines,'STAR10').shipping).toBe(0);expect(calculateTotals(lines,'STAR10','express').shipping).toBe(1495);expect(calculateTotals([]).total).toBe(0);
  });
  it('rejects invalid and ineligible coupons and accepts case-insensitive code',()=>{
    expect(validateCoupon('BAD',6800)).toContain('not valid');expect(validateCoupon('STAR10',4999)).toContain('$50');expect(validateCoupon(' star10 ',5000)).toBeNull();expect(calculateTotals([line],'BAD').discount).toBe(0);
  });
});
describe('cart identity and stock',()=>{
  it('merges the same variant and keeps color/size variants separate',()=>{
    const second=product.variants.find(v=>v.id!==line.variant.id&&v.stock>1)!;
    let lines=addCartItem([],product,line.variant,1);lines=addCartItem(lines,product,line.variant,1);lines=addCartItem(lines,product,second,1);expect(lines).toHaveLength(2);expect(lines[0].quantity).toBe(2);
  });
  it('rejects unavailable variants, invalid quantities and cumulative overstock',()=>{
    expect(()=>addCartItem([],product,line.variant,0)).toThrow();expect(()=>addCartItem([],product,line.variant,1.5)).toThrow();expect(()=>addCartItem([],product,{...line.variant,id:'missing'},1)).toThrow();
    const unavailable=product.variants.find(v=>!v.stock)!;expect(()=>addCartItem([],product,unavailable,1)).toThrow('sold out');
    const lines=addCartItem([],product,line.variant,line.variant.stock);expect(()=>addCartItem(lines,product,line.variant,1)).toThrow('Only');expect(()=>updateCartQuantity(lines,[product],line.variant.id,line.variant.stock+1)).toThrow('Only');
  });
  it('safely removes unknown products and caps outdated saved quantities',()=>{
    const lines=resolveCart([{productId:product.id,variantId:line.variant.id,quantity:999},{productId:'removed',variantId:'old',quantity:1}],[product]);expect(lines).toHaveLength(1);expect(lines[0].quantity).toBe(line.variant.stock);
  });
});
describe('demo order creation',()=>{
  it('persists immutable item snapshots with the same pricing, and reuses idempotency key',async()=>{
    const input={lines:[{productId:product.id,variantId:line.variant.id,quantity:1}],address,shippingMethod:'standard' as const,coupon:'STAR10',idempotencyKey:'test-order'};
    const [first,second]=await Promise.all([checkoutService.createOrder(input),checkoutService.createOrder(input)]);expect(first.reference).toBe(second.reference);expect(first.totals).toEqual(calculateTotals([line],'STAR10'));
    first.items[0].name='changed';first.totals.total=1;
    const orders=await accountService.getOrders();expect(orders).toHaveLength(1);expect(orders[0].items[0].name).toBe(product.name);expect(orders[0].totals.total).toBe(6815);
    const refresh=await checkoutService.createOrder(input);expect(refresh.reference).toBe(second.reference);
  });
  it('rejects empty carts, duplicate lines, invalid address and stale stock without creating orders',async()=>{
    const base={address,shippingMethod:'standard' as const,idempotencyKey:'bad'};
    await expect(checkoutService.createOrder({...base,lines:[]})).rejects.toThrow('empty');await expect(checkoutService.createOrder({...base,lines:[{productId:product.id,variantId:line.variant.id,quantity:line.variant.stock+1}]})).rejects.toThrow('stock');await expect(checkoutService.createOrder({...base,lines:[line,line]})).rejects.toThrow('stock');await expect(checkoutService.createOrder({...base,address:{...address,email:'bad'},lines:[line]})).rejects.toThrow('information');expect(await accountService.getOrders()).toHaveLength(0);
  });
  it('keeps valid history while discarding malformed snapshots that could break rendering',async()=>{
    const order=await checkoutService.createOrder({lines:[line],address,shippingMethod:'standard',idempotencyKey:'valid-history'});
    const invalidApartment={...order,id:'bad-apartment',address:{...order.address,apartment:{malformed:true}}};
    const invalidDate={...order,id:'bad-date',estimatedDelivery:'not-a-date'};
    const invalidTotals={...order,id:'bad-total',totals:{...order.totals,total:1}};
    localStorage.setItem('little-stars:v1:orders',JSON.stringify([invalidApartment,order,invalidDate,invalidTotals]));
    const history=await accountService.getOrders();expect(history).toHaveLength(1);expect(history[0].id).toBe(order.id);
  });
  it('handles malformed or outdated storage without crashing',async()=>{
    localStorage.setItem('little-stars:v1:orders','{bad json');expect(await accountService.getOrders()).toEqual([]);localStorage.setItem('little-stars:v1:orders',JSON.stringify([{id:'old'}]));expect(await accountService.getOrders()).toEqual([]);localStorage.setItem('little-stars:v1:profile',JSON.stringify({firstName:4}));expect(await accountService.getProfile()).toBeNull();expect(readStored('unknown',[],(v):v is string[]=>Array.isArray(v))).toEqual([]);
  });
});

describe('catalog repository',()=>{
  it('searches descriptions and categories, filters arrivals, and paginates stable sorted results',async()=>{
    const men=await catalogService.search({search:'men',category:'men',sort:'price-asc',limit:2,page:1});
    expect(men.total).toBe(8);expect(men.products).toHaveLength(2);expect(men.products[0].price).toBeLessThanOrEqual(men.products[1].price);
    const next=await catalogService.search({category:'men',sort:'price-asc',limit:2,page:2});expect(next.products[0].id).not.toBe(men.products[0].id);
    const arrivals=await catalogService.search({collection:'new-arrivals',limit:100});expect(arrivals.total).toBeGreaterThan(0);expect(arrivals.products.every(p=>p.tags.includes('new arrivals'))).toBe(true);
  });
});
