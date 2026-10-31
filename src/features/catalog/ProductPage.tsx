import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Expand} from 'lucide-react';
import {catalogService} from '../../services/catalog';
import {Image} from '../../components/Image';
import {ProductCard} from '../../components/ProductCard';
import {Modal} from '../../components/Modal';
import {ProductSelection} from './ProductSelection';
import type {Product} from '../../lib/types';
import './catalog.css';

export default function ProductPage() {
    const {slug} = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [related, setRelated] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [active, setActive] = useState(0);
    const [enlarged, setEnlarged] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError('');
        setActive(0);
        setEnlarged(false);
        catalogService.getBySlug(slug || '').then(p => {
            if (alive) {
                setProduct(p || null);
                if (p) catalogService.search({category: p.category, limit: 8}).then(r => {
                    if (alive) setRelated(r.products.filter(other => other.id !== p.id).slice(0, 4))
                }).catch(() => {
                })
            }
        }).catch(() => {
            if (alive) setError('We couldn’t load this piece. Please try again.')
        }).finally(() => {
            if (alive) setLoading(false)
        });
        return () => {
            alive = false
        }
    }, [slug, retry]);
    if (loading) return <div className="container product-loading" aria-busy="true">
        <div className="catalog-skeleton">
            <div/>
        </div>
        <div><p className="eyebrow">A GOOD FIND IS ON ITS WAY</p><h1 className="page-heading">Getting things ready…</h1>
        </div>
    </div>;
    if (error) return <div className="container empty-state"><h1>A little pause.</h1><p>{error}</p>
        <button className="btn" onClick={() => setRetry(x => x + 1)}>Try again</button>
    </div>;
    if (!product) return <div className="container empty-state"><span className="empty-star">✧</span><p
        className="eyebrow">NOT HERE, BUT THERE’S MORE TO LOVE</p><h1>This piece has wandered off.</h1><p>It may have
        moved on, but your next favorite is waiting.</p><Link className="btn" to="/shop">Explore the
        collection <ArrowRight size={17}/></Link></div>;
    return <div className="product-page container">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link
            to={`/collections/${product.category}`}>{product.category}</Link><span>/</span><span>{product.name}</span>
        </nav>
        <div className="product-detail-layout">
            <section className="product-gallery" aria-label={`${product.name} images`}>
                <button className="product-main-image" onClick={() => setEnlarged(true)}
                        aria-label={`Enlarge ${product.name} image ${active + 1}`}><Image src={product.images[active]}
                                                                                          alt={`${product.name} — ${active === 0 ? 'front view' : `detail view ${active + 1}`}`}
                                                                                          fetchPriority="high"/><span
                    className="gallery-enlarge"><Expand size={18}/></span>{product.originalPrice &&
                    <span className="gallery-label">A GOOD FIND</span>}</button>
                <div className="product-thumbnails">{product.images.map((src, i) => <button
                    className={active === i ? 'active' : ''} key={`${src}-${i}`}
                    aria-label={`View ${product.name} image ${i + 1}`} aria-pressed={active === i}
                    onClick={() => setActive(i)}><Image src={src} alt={`${product.name} thumbnail ${i + 1}`}
                                                        loading="lazy"/></button>)}</div>
                <p className="gallery-caption"><span>MADE FOR YOUR EVERYDAY</span><span>GOOD THINGS, SIMPLY.</span></p>
            </section>
            <div className="product-info"><ProductSelection key={product.id} product={product}/>
                <div className="product-accordions">
                    <details open>
                        <summary>The little details</summary>
                        <p>{product.description} Thoughtfully selected for an easy fit and lasting versatility. Style it
                            your way, season after season.</p></details>
                    <details>
                        <summary>Materials & care</summary>
                        <p><strong>Made with</strong><br/>{product.materials}</p><p><strong>Keep it
                        lovely</strong><br/>{product.care}</p></details>
                    <details>
                        <summary>Shipping & returns</summary>
                        <p>Standard US delivery in 5–7 business days for $6.95. Free standard shipping on orders of $125
                            or more before discounts. Express shipping is $14.95.</p><p>Changed your mind? Return unworn
                        pieces within 30 days. <Link to="/shipping-returns">All the details</Link>.</p></details>
                </div>
            </div>
        </div>
        {related.length > 0 && <section className="related-products">
            <div className="section-heading-row">
                <div><p className="eyebrow">A LITTLE MORE TO LOVE</p><h2 className="section-title">Good company for your
                    wardrobe.</h2></div>
                <Link className="text-link" to={`/collections/${product.category}`}>Explore more <ArrowRight size={16}/></Link>
            </div>
            <div className="product-grid">{related.map(p => <ProductCard key={p.id} product={p}/>)}</div>
        </section>}
        <Link className="product-back-link" to={`/collections/${product.category}`}><ArrowLeft size={15}/> Back to the
            collection</Link>
        <Modal open={enlarged} onClose={() => setEnlarged(false)}
               title={`${product.name} — image ${active + 1} of ${product.images.length}`} className="image-lightbox">
            <div className="lightbox-image"><Image src={product.images[active]}
                                                   alt={`${product.name} enlarged view ${active + 1}`}/></div>
            {product.images.length > 1 && <div className="lightbox-controls">
                <button className="btn-secondary" aria-label="Previous image"
                        onClick={() => setActive(i => (i - 1 + product.images.length) % product.images.length)}>
                    <ChevronLeft size={18}/></button>
                <span>{active + 1} / {product.images.length}</span>
                <button className="btn-secondary" aria-label="Next image"
                        onClick={() => setActive(i => (i + 1) % product.images.length)}><ChevronRight size={18}/>
                </button>
            </div>}</Modal>
    </div>
}
