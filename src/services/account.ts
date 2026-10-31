import type { Order, Profile } from '../lib/types';
import { isRecord, readStored, removeStored, writeStored } from '../lib/storage';
export function isProfile(value: unknown): value is Profile {
  return isRecord(value) && ['firstName','lastName','email'].every(k => typeof value[k] === 'string') && String(value.email).length < 255;
}
export function isOrder(value: unknown): value is Order {
  if (!isRecord(value) || !['id','reference','createdAt','estimatedDelivery'].every(k => typeof value[k] === 'string' && String(value[k]).length > 0) || value.status !== 'Confirmed') return false;
  if (![value.createdAt,value.estimatedDelivery].every(date => Number.isFinite(Date.parse(String(date))))) return false;
  if (!Array.isArray(value.items) || !value.items.length || !value.items.every(item => isRecord(item) && ['productId','variantId','name','image','color','size'].every(k => typeof item[k] === 'string') && Number.isSafeInteger(item.price) && Number(item.price) >= 0 && Number.isSafeInteger(item.quantity) && Number(item.quantity) > 0)) return false;
  if (!isRecord(value.totals) || !['subtotal','discount','shipping','tax','total'].every(k => Number.isSafeInteger((value.totals as Record<string,unknown>)[k]) && Number((value.totals as Record<string,unknown>)[k]) >= 0)) return false;
  const totals = value.totals as unknown as Order['totals'];
  const subtotal = value.items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  if (!Number.isSafeInteger(subtotal) || totals.subtotal !== subtotal || totals.discount > subtotal || totals.total !== subtotal - totals.discount + totals.shipping + totals.tax) return false;
  if (new Set(value.items.map(item => item.variantId)).size !== value.items.length) return false;
  return isRecord(value.address) && ['firstName','lastName','email','address','city','state','zip','country'].every(k => typeof (value.address as Record<string,unknown>)[k] === 'string') && (value.address.apartment === undefined || typeof value.address.apartment === 'string') && ['standard','express'].includes(String(value.shippingMethod)) && typeof value.coupon === 'string';
}
export const readOrders = (): Order[] => readStored<unknown[]>('orders', [], (value): value is unknown[] => Array.isArray(value)).filter(isOrder);
const pause = () => new Promise<void>(resolve => setTimeout(resolve, 120));
export interface AccountRepository {
  getProfile(): Promise<Profile | null>;
  updateProfile(profile: Profile): Promise<Profile>;
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  signOut(): Promise<void>;
}
export const accountService: AccountRepository = {
  async getProfile() { await pause(); return readStored<Profile | null>('profile', null, (v): v is Profile | null => v === null || isProfile(v)); },
  async updateProfile(profile) {
    await pause();
    if (!profile.firstName.trim() || !profile.lastName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new Error('Please provide your name and a valid email address.');
    const clean = { firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), email: profile.email.trim() };
    writeStored('profile', clean); return clean;
  },
  async getOrders() { await pause(); return structuredClone(readOrders()); },
  async getOrder(id) { await pause(); return structuredClone(readOrders().find(o => o.id === id || o.reference === id) ?? null); },
  async signOut() { await pause(); removeStored('profile'); },
};
