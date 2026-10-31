import type {CatalogQuery, CatalogResult, Product} from '../lib/types';
import {config} from '../lib/config';
import {products} from './catalogData';

const pause = () => new Promise<void>(resolve => setTimeout(resolve, 140));
const copy = <T, >(value: T): T => structuredClone(value);

export interface CatalogRepository {
    getAll(): Promise<Product[]>;

    search(query: CatalogQuery): Promise<CatalogResult>;

    getBySlug(slug: string): Promise<Product | null>;

    getById(id: string): Promise<Product | null>;
}

export const catalogService: CatalogRepository = {
    async getAll() {
        await pause();
        return copy(products);
    },
    async getBySlug(slug) {
        await pause();
        return copy(products.find(p => p.slug === slug) ?? null);
    },
    async getById(id) {
        await pause();
        return copy(products.find(p => p.id === id) ?? null);
    },
    async search(query) {
        await pause();
        const search = query.search?.trim().toLowerCase();
        let result = products.filter(p => {
            if (search && !`${p.name} ${p.description} ${p.category} ${p.collection} ${p.tags.join(' ')}`.toLowerCase().includes(search)) return false;
            if (query.category && p.category !== query.category) return false;
            if (query.collection && query.collection !== 'all') {
                if (['new', 'new-arrivals'].includes(query.collection)) {
                    if (!p.tags.some(tag => ['new', 'new arrivals'].includes(tag))) return false;
                } else if (query.collection === 'sale') {
                    if (!p.originalPrice) return false;
                } else if (['bestsellers', 'best-sellers'].includes(query.collection)) {
                    if (!p.featured) return false;
                } else if (p.collection !== query.collection) return false;
            }
            if (query.size && !p.sizes.includes(query.size)) return false;
            if (query.color && !p.colors.some(c => c.name.toLowerCase() === query.color?.toLowerCase())) return false;
            if (query.minPrice !== undefined && p.price < query.minPrice) return false;
            if (query.maxPrice !== undefined && p.price > query.maxPrice) return false;
            if (query.sale && !p.originalPrice) return false;
            if (query.available && !p.variants.some(v => v.stock > 0 && (!query.size || v.size === query.size) && (!query.color || v.color.toLowerCase() === query.color.toLowerCase()))) return false;
            return true;
        });
        result = [...result].sort((a, b) => query.sort === 'newest' ? b.createdAt.localeCompare(a.createdAt) : ['price-asc', 'priceAsc'].includes(query.sort ?? '') ? a.price - b.price : ['price-desc', 'priceDesc'].includes(query.sort ?? '') ? b.price - a.price : Number(b.featured) - Number(a.featured));
        const total = result.length;
        const page = Number.isFinite(query.page) ? Math.max(1, Math.floor(query.page ?? 1)) : 1;
        const limit = Number.isFinite(query.limit) ? Math.max(1, Math.min(Math.floor(query.limit ?? config.pageSize), 100)) : config.pageSize;
        return {products: copy(result.slice((page - 1) * limit, page * limit)), total};
    },
};
