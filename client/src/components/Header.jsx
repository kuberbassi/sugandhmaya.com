import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useShop } from '../hooks/useShop';

const homeLinks = [
    { label: 'Collection', hash: 'collection' },
    { label: 'Our story', hash: 'our-promise' },
    { label: 'Contact', hash: 'contact' }
];

const Header = () => {
    const { cartCount, toggleCart } = useShop();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 24);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return <>
        <div className="announcement-bar">Complimentary shipping on orders above ₹500 <span>•</span> Handcrafted in India</div>
        <header id="main-header" className={isScrolled ? 'scrolled' : ''}>
            <div className="container header-container">
                <nav className="header-nav" aria-label="Main navigation">
                    <Link to="/" className="brand-name" aria-label="Sugandhmaya home">
                        <img src="/media/brand/logo-mark.webp" alt="" className="header-logo" />
                        <span><strong>SUGANDHMAYA</strong><small>The art of ritual</small></span>
                    </Link>
                    <div className="nav-links">
                        <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Shop</NavLink>
                        {homeLinks.map(link => location.pathname === '/'
                            ? <a key={link.hash} href={`#${link.hash}`} className="nav-link">{link.label}</a>
                            : <Link key={link.hash} to={`/#${link.hash}`} className="nav-link">{link.label}</Link>)}
                    </div>
                    <div className="header-right">
                        <button className="cart-button" onClick={toggleCart} aria-label={`Open cart, ${cartCount} items`}>
                            <ShoppingBag aria-hidden="true" />
                            <span className="cart-label">Bag</span>
                            {cartCount > 0 ? <span className="cart-count">{cartCount}</span> : null}
                        </button>
                        <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(open => !open)} aria-label="Toggle menu" aria-expanded={isMobileMenuOpen}>
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </nav>
            </div>
        </header>
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} aria-hidden={!isMobileMenuOpen}>
            <nav aria-label="Mobile navigation">
                <Link to="/shop" onClick={closeMobileMenu}>Shop <span>01</span></Link>
                {homeLinks.map((link, index) => <Link key={link.hash} to={`/#${link.hash}`} onClick={closeMobileMenu}>{link.label} <span>0{index + 2}</span></Link>)}
            </nav>
        </div>
    </>;
};

export default Header;
