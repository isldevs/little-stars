import {ArrowRight, Heart} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useStore} from '../features/cart/store';
import {ProductCard} from '../components/ProductCard';

export default function WishlistPage() {
    const {products, wishlist, loading} = useStore();
    const saved = products.filter(p => wishlist.includes(p.id));
    return <div className="container content-page">
        <div className="page-heading"><p className="eyebrow">KEEP A LITTLE SOMETHING CLOSE</p><h1>Your favorites.</h1><p
            className="muted">The pieces you love, waiting for their moment.</p></div>
        {loading ? <p role="status">Finding your favorites…</p> : saved.length ? <><p
            className="muted wishlist-count">{saved.length} {saved.length === 1 ? 'favorite' : 'favorites'} · Choose a
            piece to select your size and color.</p>
            <div className="product-grid">{saved.map(p => <ProductCard key={p.id} product={p}/>)}</div>
        </> : <div className="empty-state"><Heart size={38} strokeWidth={1}/><h2>A little room for favorites.</h2><p>Tap
            the heart on anything you love. We’ll keep it here for you.</p><Link className="btn" to="/shop">Find your
            favorites <ArrowRight size={17}/></Link></div>}</div>
}
