export type Category = 'women' | 'men' | 'kids';

export interface Color {
    name: string;
    hex: string
}

export interface Variant {
    id: string;
    color: string;
    size: string;
    stock: number
}

export interface Product {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: Category;
    collection: string;
    tags: string[];
    images: string[];
    price: number;
    originalPrice?: number;
    sizes: string[];
    colors: Color[];
    variants: Variant[];
    materials: string;
    care: string;
    featured: boolean;
    createdAt: string
}

export interface CatalogQuery {
    search?: string;
    category?: string;
    collection?: string;
    size?: string;
    color?: string;
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    sale?: boolean;
    sort?: string;
    page?: number;
    limit?: number
}

export interface CatalogResult {
    products: Product[];
    total: number
}

export interface CartLine {
    productId: string;
    variantId: string;
    quantity: number
}

export interface ResolvedLine extends CartLine {
    product: Product;
    variant: Variant
}

export type ShippingMethod = 'standard' | 'express';

export interface Totals {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number
}

export interface Address {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zip: string;
    country: string
}

export interface OrderItem {
    productId: string;
    variantId: string;
    name: string;
    image: string;
    color: string;
    size: string;
    price: number;
    quantity: number
}

export interface Order {
    id: string;
    reference: string;
    createdAt: string;
    estimatedDelivery: string;
    items: OrderItem[];
    totals: Totals;
    address: Address;
    shippingMethod: ShippingMethod;
    coupon: string;
    status: 'Confirmed'
}

export interface Profile {
    firstName: string;
    lastName: string;
    email: string
}
