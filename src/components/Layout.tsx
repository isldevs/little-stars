import {useEffect, useState} from 'react';
import {Link, NavLink, Outlet, useLocation, useNavigate} from 'react-router-dom';
import {
    ArrowRight,
    ArrowUpRight,
    Check,
    Heart,
    Instagram,
    Menu,
    Search,
    ShoppingBag,
    Star,
    UserRound,
    X
} from 'lucide-react';
import {useStore} from '../features/cart/store';
import {ThemeSwitcher} from '../features/theme/ThemeSwitcher';
import {TelegramLink} from './TelegramContact';
import {Modal} from './Modal';
import {CartContents} from '../features/cart/CartPage';

const nav = [['Women', '/collections/women'], ['Men', '/collections/men'], ['Kids', '/collections/kids'], ['New arrivals', '/collections/new-arrivals'], ['Sale', '/collections/sale']];

function Logo() {
    return <Link to="/" className="logo" aria-label="Little Stars home"><Star size={27} strokeWidth={1.1}/><span>little stars<span
        className="logo-dot">®</span></span></Link>
}

export function Layout() {
    const {lines, wishlist, cartOpen, setCartOpen, toast} = useStore();
    const [announcement, setAnnouncement] = useState(() => {
        try {
            return localStorage.getItem('ls-announcement') !== 'dismissed'
        } catch {
            return true
        }
    });
    const [mobile, setMobile] = useState(false);
    const [search, setSearch] = useState(false);
    const [query, setQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        setMobile(false);
        setSearch(false);
        setCartOpen(false);
        window.scrollTo(0, 0);
    }, [location.pathname, location.search, setCartOpen]);
    return <><a className="skip-link" href="#main">Skip to content</a>{announcement && <div className="announcement">
        <span>A little joy, delivered. <strong>Free shipping on orders $125+</strong></span>
        <button aria-label="Dismiss announcement" onClick={() => {
            setAnnouncement(false);
            try {
                localStorage.setItem('ls-announcement', 'dismissed')
            } catch {/* storage optional */
            }
        }}><X size={14}/></button>
    </div>}
        <header className="site-header">
            <div className="container header-inner">
                <button className="icon-button mobile-menu" aria-label="Open navigation"
                        onClick={() => setMobile(true)}><Menu size={23}/></button>
                <Logo/>
                <nav className="desktop-nav" aria-label="Main navigation">{nav.map(([label, path]) => <NavLink
                    className={label === 'Sale' ? 'sale-link' : ''} key={path} to={path}>{label}</NavLink>)}</nav>
                <div className="header-actions"><ThemeSwitcher className="header-theme-switcher"/>
                    <button className="icon-button" aria-label="Search products" onClick={() => setSearch(true)}><Search
                        size={21}/></button>
                    <Link className="icon-button account-link" aria-label="Demo account" to="/account"><UserRound
                        size={21}/></Link><Link className="icon-button"
                                                aria-label={`Wishlist, ${wishlist.length} items`} to="/wishlist"><Heart
                        size={21}/>{wishlist.length > 0 && <span className="counter">{wishlist.length}</span>}</Link>
                    <button className="icon-button cart-trigger"
                            aria-label={`Shopping bag, ${lines.reduce((s, l) => s + l.quantity, 0)} items`}
                            onClick={() => setCartOpen(true)}><ShoppingBag size={21}/><span
                        className="bag-count">{lines.reduce((s, l) => s + l.quantity, 0)}</span></button>
                </div>
            </div>
        </header>
        <main id="main"><Outlet/></main>
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-brand"><Logo/><p>Little things. Lasting favorites.<br/>Clothing for the moments
                    that matter.</p><Link className="footer-social" to="/about" aria-label="Our story"><Instagram
                    size={19}/><span>Get to know Little Stars <ArrowUpRight size={13}/></span></Link></div>
                <div><h3>Explore</h3>{nav.map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</div>
                <div><h3>Here to help</h3><Link to="/contact">Contact us</Link><Link to="/shipping-returns">Shipping &
                    returns</Link><Link to="/faq">FAQs</Link><Link to="/account">My demo account</Link><Link
                    to="/about">Our story</Link></div>
                <div className="footer-note"><h3>A little hello?</h3><p>We’d love to hear from you.</p><a
                    href="mailto:hello@littlestars.example">hello@littlestars.example <ArrowUpRight
                    size={13}/></a><TelegramLink/><p>Monday–Friday, 9am–5pm EST<br/>New York, NY</p><span
                    className="demo-tag">A thoughtfully made demo store</span></div>
            </div>
            <div className="container footer-bottom">
                <span>© {new Date().getFullYear()} Little Stars. Made for everyday.</span>
                <div><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms of service</Link><span>United States · USD $</span>
                </div>
            </div>
        </footer>
        <Modal open={mobile} onClose={() => setMobile(false)} title="Find your everyday" className="drawer nav-drawer">
            <nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(([label, path]) => <Link key={path}
                                                                                                         to={path}>{label}<ArrowRight
                size={20}/></Link>)}<Link to="/account">Demo account <UserRound size={20}/></Link><Link to="/about">Our
                story <Star size={20}/></Link><Link to="/contact">Get in touch <ArrowRight size={20}/></Link></nav>
            <section className="mobile-theme-panel"><h3>Make yourself at home.</h3><p>A lighter look, a cozier evening,
                or whatever feels right on your device.</p><ThemeSwitcher className="mobile-theme-switcher"/></section>
        </Modal><Modal open={search} onClose={() => setSearch(false)} title="Find a little something"
                       className="search-modal">
            <form onSubmit={e => {
                e.preventDefault();
                navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
                setSearch(false)
            }}><label htmlFor="site-search">Search our collections</label>
                <div className="search-input-wrap"><Search size={22}/><input id="site-search"
                                                                             placeholder="Try linen, knitwear, or everyday essentials…"
                                                                             value={query}
                                                                             onChange={e => setQuery(e.target.value)}/>
                    <button className="btn" type="submit">Search <ArrowRight size={17}/></button>
                </div>
            </form>
            <p className="muted">A few favorites: linen, cotton, cozy layers.</p></Modal><Modal open={cartOpen}
                                                                                                onClose={() => setCartOpen(false)}
                                                                                                title="Your shopping bag"
                                                                                                className="drawer cart-drawer"><CartContents
            compact onCheckout={() => setCartOpen(false)}/></Modal>{toast &&
            <div role="status" className="toast"><Check size={18}/>{toast}</div>}</>
}
