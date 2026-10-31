import { config } from './config';
import type { CartLine, Product, ResolvedLine, ShippingMethod, Totals, Variant } from './types';

export function validateCoupon(code: string, subtotal: number): string | null {
  if (!code.trim()) return 'Enter a coupon code.';
  if (code.trim().toUpperCase() !== config.coupon) return 'That code is not valid. Try STAR10.';
  if (subtotal < config.couponMinimum) return 'STAR10 is available on orders of $50 or more.';
  return null;
}
/** All money is integer cents. Free-shipping eligibility uses the subtotal before discounts. */
export function calculateTotals(lines: ResolvedLine[], coupon = '', method: ShippingMethod = 'standard'): Totals {
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const discount = coupon && !validateCoupon(coupon, subtotal) ? Math.round(subtotal * config.couponPercent / 100) : 0;
  const shipping = !lines.length ? 0 : method === 'express' ? config.expressShipping : subtotal >= config.freeShippingThreshold ? 0 : config.standardShipping;
  const tax = Math.round((subtotal - discount) * config.taxRate);
  return { subtotal, discount, shipping, tax, total: subtotal - discount + shipping + tax };
}
export function resolveCart(lines: CartLine[], products: Product[]): ResolvedLine[] {
  return lines.flatMap(line => {
    const product = products.find(p => p.id === line.productId);
    const variant = product?.variants.find(v => v.id === line.variantId);
    if (!product || !variant || variant.stock === 0 || !Number.isInteger(line.quantity) || line.quantity < 1) return [];
    return [{ ...line, quantity: Math.min(line.quantity, variant.stock), product, variant }];
  });
}
export function addCartItem(lines: CartLine[], product: Product, variant: Variant, quantity: number): CartLine[] {
  const actual = product.variants.find(v => v.id === variant.id);
  if (!actual || !Number.isInteger(quantity) || quantity < 1) throw new Error('Choose a valid size, color and quantity.');
  const existing = lines.find(line => line.variantId === variant.id);
  if (actual.stock < (existing?.quantity ?? 0) + quantity) throw new Error(actual.stock ? `Only ${actual.stock} available for this size and color.` : 'This size and color is sold out.');
  return existing ? lines.map(line => line.variantId === variant.id ? { ...line, quantity: line.quantity + quantity } : line) : [...lines, { productId: product.id, variantId: variant.id, quantity }];
}
export function updateCartQuantity(lines: CartLine[], products: Product[], variantId: string, quantity: number): CartLine[] {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be at least one.');
  const line = lines.find(l => l.variantId === variantId);
  const variant = products.find(p => p.id === line?.productId)?.variants.find(v => v.id === variantId);
  if (!line || !variant) throw new Error('This item is no longer available.');
  if (quantity > variant.stock) throw new Error(`Only ${variant.stock} available for this size and color.`);
  return lines.map(l => l.variantId === variantId ? { ...l, quantity } : l);
}
