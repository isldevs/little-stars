import type {ErrorInfo, ReactNode} from 'react';
import {Component, lazy, Suspense} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import {StoreProvider} from './features/cart/store';
import {Layout} from './components/Layout';
import HomePage from './pages/HomePage';
import CartPage from './features/cart/CartPage';

const CatalogPage = lazy(() => import('./features/catalog/CatalogPage'));
const ProductPage = lazy(() => import('./features/catalog/ProductPage'));

const CheckoutPage = lazy(() => import('./features/checkout/CheckoutPage'));
const ConfirmationPage = lazy(() => import('./features/checkout/ConfirmationPage'));
const AccountPage = lazy(() => import('./features/account/AccountPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = {failed: false};

    static getDerivedStateFromError() {
        return {failed: true}
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Storefront error', error, info.componentStack)
    }

    render() {
        return this.state.failed ?
            <div className="empty-state"><h1>A small hiccup.</h1><p>Please reload the store to try again. Your saved bag
                stays on this device.</p>
                <button className="btn" onClick={() => window.location.reload()}>Reload store</button>
            </div> : this.props.children
    }
}

export default function App() {
    return <ErrorBoundary><BrowserRouter><StoreProvider><Suspense
        fallback={<div className="loading-screen" role="status">A little moment…</div>}><Routes><Route
        element={<Layout/>}><Route index element={<HomePage/>}/><Route path="shop" element={<CatalogPage/>}/><Route
        path="collections/:collection" element={<CatalogPage/>}/><Route path="product/:slug"
                                                                        element={<ProductPage/>}/><Route path="wishlist"
                                                                                                         element={
                                                                                                             <WishlistPage/>}/><Route
        path="cart" element={<CartPage/>}/><Route path="checkout" element={<CheckoutPage/>}/><Route
        path="order-confirmation/:id" element={<ConfirmationPage/>}/><Route path="account" element={
        <AccountPage/>}/>{['about', 'contact', 'faq', 'shipping-returns', 'privacy', 'terms'].map(path => <Route
        key={path} path={path} element={<InfoPage/>}/>)}<Route path="*" element={
        <NotFoundPage/>}/></Route></Routes></Suspense></StoreProvider></BrowserRouter></ErrorBoundary>
}
