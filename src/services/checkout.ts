import type { Address, CartLine, Order, ShippingMethod } from '../lib/types';
import { calculateTotals, resolveCart, validateCoupon } from '../lib/pricing';
import { writeStored } from '../lib/storage';
import { catalogService } from './catalog';
import { readOrders } from './account';
export interface CreateOrderInput { lines: CartLine[]; address: Address; shippingMethod: ShippingMethod; coupon?: string; idempotencyKey: string }
export interface CheckoutRepository { createOrder(input: CreateOrderInput): Promise<Order> }
const pending = new Map<string, Promise<Order>>();
export function validateAddress(address: Address): Record<string, string> {
  const errors: Record<string,string> = {};
  for (const key of ['firstName','lastName','email','address','city','state','zip','country'] as const) if (!address[key]?.trim()) errors[key] = 'This field is required.';
  if (address.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)) errors.email = 'Enter a valid email address.';
  if (address.zip && !/^\d{5}(-\d{4})?$/.test(address.zip)) errors.zip = 'Enter a valid US ZIP code.';
  if (address.country && !['US','United States','USA'].includes(address.country)) errors.country = 'This demo ships within the United States.';
  return errors;
}
async function create(input: CreateOrderInput): Promise<Order> {
  if (!input.idempotencyKey) throw new Error('An order request reference is required.');
  const existing = readOrders().find(o => o.id === input.idempotencyKey);
  if (existing) return structuredClone(existing);
  if (!input.lines.length) throw new Error('Your bag is empty. Add a little something first.');
  if (Object.keys(validateAddress(input.address)).length) throw new Error('Please check your contact and shipping information.');
  if (!['standard','express'].includes(input.shippingMethod)) throw new Error('Choose a shipping method.');
  const products = await catalogService.getAll();
  const seen = new Set<string>();
  for (const line of input.lines) {
    const variant = products.find(p => p.id === line.productId)?.variants.find(v => v.id === line.variantId);
    if (!variant || seen.has(line.variantId) || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > variant.stock) throw new Error('One of your items exceeds the available stock. Please review your bag.');
    seen.add(line.variantId);
  }
  const resolved = resolveCart(input.lines, products);
  const coupon = input.coupon?.trim().toUpperCase() ?? '';
  const subtotal = calculateTotals(resolved).subtotal;
  if (coupon) { const error = validateCoupon(coupon, subtotal); if (error) throw new Error(error); }
  const now = new Date();
  const delivery = new Date(now);
  let businessDays = input.shippingMethod === 'express' ? 3 : 7;
  while (businessDays > 0) { delivery.setDate(delivery.getDate() + 1); if (![0,6].includes(delivery.getDay())) businessDays--; }
  const order: Order = {
    id: input.idempotencyKey,
    reference: `LS-${now.getFullYear()}-${crypto.randomUUID().replace(/-/g,'').slice(0,7).toUpperCase()}`,
    createdAt: now.toISOString(), estimatedDelivery: delivery.toISOString(), status:'Confirmed',
    items: resolved.map(line => ({ productId: line.product.id, variantId: line.variant.id, name: line.product.name, image: line.product.images[0], color: line.variant.color, size: line.variant.size, price: line.product.price, quantity: line.quantity })),
    totals: calculateTotals(resolved, coupon, input.shippingMethod), address: structuredClone(input.address), shippingMethod: input.shippingMethod, coupon,
  };
  // Persist first; only the caller clears the cart after this promise succeeds.
  // Store failures are surfaced here so a failed save cannot discard the cart.
  try { localStorage.setItem('little-stars:v1:orders', JSON.stringify([order, ...readOrders()])); }
  catch { throw new Error('Your demo order could not be saved. Enable browser storage and try again. Your bag is safe.'); }
  writeStored('lastOrder', order.id);
  return structuredClone(order);
}
export const checkoutService: CheckoutRepository = {
  createOrder(input) {
    const existing = pending.get(input.idempotencyKey);
    if (existing) return existing.then(order => structuredClone(order));
    const request = create(structuredClone(input)); pending.set(input.idempotencyKey, request);
    void request.finally(() => pending.delete(input.idempotencyKey)).catch(() => undefined);
    return request;
  },
};
