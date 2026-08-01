
import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AppErrorBoundary from './components/AppErrorBoundary';

const lazyWithRefresh = (name, importer) => lazy(() => importer().then(module => {
  sessionStorage.removeItem(`lazy-retry-${name}`);
  return module;
}).catch(error => {
  const retryKey = `lazy-retry-${name}`;
  if (!sessionStorage.getItem(retryKey)) {
    sessionStorage.setItem(retryKey, 'true');
    window.location.reload();
    return new Promise(() => {});
  }
  sessionStorage.removeItem(retryKey);
  throw error;
}));

const Shop = lazyWithRefresh('shop', () => import('./pages/Shop'));
const Product = lazyWithRefresh('product', () => import('./pages/Product'));
const Checkout = lazyWithRefresh('checkout', () => import('./pages/Checkout'));
const Confirmation = lazyWithRefresh('confirmation', () => import('./pages/Confirmation'));
const PrivacyPolicy = lazyWithRefresh('privacy', () => import('./pages/PrivacyPolicy'));

function App() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }));
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <AppErrorBoundary><Layout>
      <div className="page-transition" key={pathname}><Suspense fallback={<main className="page-status"><p className="eyebrow">Sugandhmaya</p><h2>Preparing your ritual…</h2></main>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </Suspense></div>
    </Layout></AppErrorBoundary>
  );
}

export default App;
