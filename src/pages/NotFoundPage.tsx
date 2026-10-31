import {ArrowRight, Star} from 'lucide-react';
import {Link} from 'react-router-dom';

export default function NotFoundPage() {
    return <div className="container empty-state not-found"><Star size={46} strokeWidth={1}/><p className="eyebrow">A
        LITTLE OFF THE BEATEN PATH · 404</p><h1>Let’s find your way back.</h1><p>This page has wandered off. There are
        still plenty of lovely things to discover.</p><Link to="/" className="btn">Back to Little Stars <ArrowRight
        size={18}/></Link><Link className="text-link" to="/shop">Explore the collection</Link></div>
}
