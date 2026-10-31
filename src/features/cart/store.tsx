import type {ReactNode} from 'react';
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {CartLine, Product, Profile, ResolvedLine, Variant} from '../../lib/types';
import {isRecord, isStringArray, readStored, storagePrefix, writeStored} from '../../lib/storage';
import {addCartItem, resolveCart, updateCartQuantity} from '../../lib/pricing';
import {catalogService} from '../../services/catalog';
import {accountService, isProfile} from '../../services/account';

const isLines = (value: unknown): value is CartLine[] => Array.isArray(value) && value.every(line => isRecord(line) && typeof line.productId === 'string' && typeof line.variantId === 'string' && Number.isInteger(line.quantity) && Number(line.quantity) > 0 && Number(line.quantity) <= 999);
const loadLines = () => readStored('cart', [], isLines);
const loadWishlist = () => readStored('wishlist', [], isStringArray);
const loadProfile = () => readStored<Profile | null>('profile', null, (v): v is Profile | null => v === null || isProfile(v));

interface Store {
    lines: CartLine[];
    products: Product[];
    resolvedLines: ResolvedLine[];
    wishlist: string[];
    cartOpen: boolean;
    toast: string | null;
    coupon: string;
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    addItem: (product: Product, variant: Variant, quantity: number) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    removeItem: (variantId: string) => void;
    toggleWishlist: (productId: string) => void;
    setCartOpen: (open: boolean) => void;
    setCoupon: (coupon: string) => void;
    notify: (message: string) => void;
    clearCart: () => void;
    setProfile: (profile: Profile | null) => void;
    signOut: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({children}: { children: ReactNode }) {
    const [lines, setLines] = useState<CartLine[]>(loadLines);
    const [products, setProducts] = useState<Product[]>([]);
    const [wishlist, setWishlist] = useState<string[]>(loadWishlist);
    const [cartOpen, setCartOpen] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [coupon, updateCoupon] = useState(() => readStored('coupon', '', (v): v is string => typeof v === 'string' && v.length < 30));
    const [profile, updateProfile] = useState<Profile | null>(loadProfile);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let active = true;
        catalogService.getAll().then(data => {
            if (!active) return;
            setProducts(data);
            setLines(current => {
                const cleaned = resolveCart(current, data).map(({productId, variantId, quantity}) => ({
                    productId,
                    variantId,
                    quantity
                }));
                // Collapse malformed duplicate persisted lines while respecting stock.
                const unique: CartLine[] = [];
                for (const line of cleaned) {
                    const previous = unique.find(l => l.variantId === line.variantId);
                    const stock = data.find(p => p.id === line.productId)?.variants.find(v => v.id === line.variantId)?.stock ?? 0;
                    if (previous) previous.quantity = Math.min(stock, previous.quantity + line.quantity);
                    else unique.push(line);
                }
                writeStored('cart', unique);
                return unique;
            });
            setWishlist(current => {
                const clean = current.filter(id => data.some(p => p.id === id));
                writeStored('wishlist', clean);
                return clean;
            });
        }).catch(() => {
            if (active) setError('We could not load the collection. Please refresh and try again.');
        }).finally(() => {
            if (active) setLoading(false);
        });
        return () => {
            active = false;
        };
    }, []);
    useEffect(() => {
        const sync = (event: StorageEvent) => {
            if (event.key === storagePrefix + 'cart') setLines(resolveCart(loadLines(), products).map(({
                                                                                                           productId,
                                                                                                           variantId,
                                                                                                           quantity
                                                                                                       }) => ({
                productId,
                variantId,
                quantity
            })));
            if (event.key === storagePrefix + 'wishlist') setWishlist(loadWishlist());
            if (event.key === storagePrefix + 'profile') updateProfile(loadProfile());
            if (event.key === storagePrefix + 'coupon') updateCoupon(readStored('coupon', '', (v): v is string => typeof v === 'string'));
        };
        window.addEventListener('storage', sync);
        return () => window.removeEventListener('storage', sync);
    }, [products]);
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);
    const notify = useCallback((message: string) => setToast(message), []);
    const resolvedLines = useMemo(() => resolveCart(lines, products), [lines, products]);
    const addItem = useCallback((product: Product, variant: Variant, quantity: number) => {
        const next = addCartItem(lines, product, variant, quantity);
        setLines(next);
        writeStored('cart', next);
        setCartOpen(true);
    }, [lines]);
    const updateQuantity = useCallback((variantId: string, quantity: number) => {
        const next = updateCartQuantity(lines, products, variantId, quantity);
        setLines(next);
        writeStored('cart', next);
    }, [lines, products]);
    const removeItem = useCallback((variantId: string) => {
        const next = lines.filter(line => line.variantId !== variantId);
        setLines(next);
        writeStored('cart', next);
    }, [lines]);
    const toggleWishlist = useCallback((id: string) => {
        if (!products.some(p => p.id === id)) return;
        const next = wishlist.includes(id) ? wishlist.filter(item => item !== id) : [...wishlist, id];
        setWishlist(next);
        writeStored('wishlist', next);
        notify(next.includes(id) ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
    }, [wishlist, products, notify]);
    const setCoupon = useCallback((value: string) => {
        const clean = value.trim().toUpperCase();
        updateCoupon(clean);
        writeStored('coupon', clean);
    }, []);
    const clearCart = useCallback(() => {
        setLines([]);
        writeStored('cart', []);
        updateCoupon('');
        writeStored('coupon', '');
    }, []);
    const setProfile = useCallback((value: Profile | null) => {
        updateProfile(value);
        writeStored('profile', value);
    }, []);
    const signOut = useCallback(() => {
        void accountService.signOut();
        updateProfile(null);
        notify('Signed out of your demo account.');
    }, [notify]);
    const value = {
        lines,
        products,
        resolvedLines,
        wishlist,
        cartOpen,
        toast,
        coupon,
        profile,
        loading,
        error,
        addItem,
        updateQuantity,
        removeItem,
        toggleWishlist,
        setCartOpen,
        setCoupon,
        notify,
        clearCart,
        setProfile,
        signOut
    };
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
    const value = useContext(StoreContext);
    if (!value) throw new Error('useStore must be used within StoreProvider');
    return value;
}
