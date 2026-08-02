import { ArrowUpRight, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => (
    <footer className="main-footer">
        <div className="container footer-grid">
            <div className="footer-brand">
                <img src="/media/brand/logo-mark.webp" alt="" />
                <div><strong>SUGANDHMAYA</strong><span>The art of ritual</span></div>
                <p>Pure, purposeful fragrance for slower mornings and sacred everyday moments.</p>
            </div>
            <div className="footer-column"><h2>Explore</h2><Link to="/shop">Shop all</Link><a href="/#collection">Collection</a><a href="/#our-promise">Our story</a><Link to="/privacy-policy">Privacy</Link></div>
            <div className="footer-column"><h2>Connect</h2><a href="tel:+919971055746"><Phone /> +91 99710 55746</a><a href="mailto:ops@indiaonroaming.com"><Mail /> Email us</a></div>
            <div className="footer-newsletter"><h2>Notes from Sugandhmaya</h2><p>Ritual ideas, product stories and thoughtful updates.</p><a href="mailto:ops@indiaonroaming.com?subject=Join%20Sugandhmaya" className="newsletter-link">Join our circle <ArrowUpRight /></a></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} Sugandhmaya</span><span>Handcrafted with intention in India</span></div>
    </footer>
);

export default Footer;
