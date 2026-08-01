import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Flower2, Leaf, Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';
import { useShop } from '../hooks/useShop';
import ProductCard from '../components/ProductCard';

const values = [
    { icon: Flower2, number: '01', title: 'Made by hand', description: 'Patiently crafted in small batches with respect for India’s incense-making heritage.' },
    { icon: Leaf, number: '02', title: 'Naturally considered', description: 'Thoughtful ingredients and clean fragrances, created for your everyday spaces.' },
    { icon: Sparkles, number: '03', title: 'Ritual, reimagined', description: 'Tradition expressed with a calm, contemporary sensibility for modern living.' }
];

const SectionHeading = ({ eyebrow, title, copy }) => <header className="section-heading"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{copy ? <p className="section-copy">{copy}</p> : null}</header>;
SectionHeading.propTypes = { eyebrow: PropTypes.string.isRequired, title: PropTypes.string.isRequired, copy: PropTypes.string };

const Home = () => {
    const { products } = useShop();
    const featuredIds = ['rose', 'oudh-regular', 'orchid'];
    const featuredProducts = featuredIds.map(id => products.find(product => product.id === id)).filter(Boolean);

    return <main>
        <section className="hero-section">
            <div className="hero-orb hero-orb-one" /><div className="hero-orb hero-orb-two" />
            <div className="container hero-main-layout">
                <div className="hero-text-content">
                    <p className="eyebrow">Incense for intentional living</p>
                    <h1>Make space<br />for stillness.</h1>
                    <p className="hero-copy">Small-batch Indian incense, made with pure ingredients to turn ordinary moments into meaningful rituals.</p>
                    <div className="hero-actions"><Link to="/shop" className="btn">Explore the collection <ArrowRight /></Link><a href="#our-promise" className="text-link">Our philosophy <ArrowDown /></a></div>
                    <div className="hero-trust"><span>Natural ingredients</span><span>Handcrafted in India</span><span>Mindful fragrance</span></div>
                </div>
                <div className="hero-media-grid" aria-label="Sugandhmaya incense collection">
                    <figure className="hero-image hero-image-main"><img src="/images/products/sugandhmaya_chandan_agarbatti/12-stick-box-agarbatti.webp" alt="Sugandhmaya incense glowing through smoke" fetchPriority="high" /><figcaption>Slow down. Light within.</figcaption></figure>
                    <figure className="hero-image hero-image-secondary"><img src="/images/products/sugandhmaya_chandan_agarbatti/40-stick-box-agarbatti.webp" alt="A peaceful Sugandhmaya incense ritual" /><span className="media-badge image-index">02 / 03</span></figure>
                    <div className="hero-product-float"><img src="/images/products/sugandhmaya_chandan_agarbatti/1.webp" alt="Sugandhmaya premium agarbatti" /><span className="media-badge product-badge">Premium agarbatti</span></div>
                </div>
            </div>
        </section>

        <section className="ritual-marquee" aria-label="Brand qualities"><div className="marquee-track">{[0, 1].map(copy => <div className="marquee-group" aria-hidden={copy === 1} key={copy}><span>Hand rolled</span><i>✦</i><span>Pure botanicals</span><i>✦</i><span>Made in India</span><i>✦</i><span>Slow living</span><i>✦</i></div>)}</div></section>

        <section id="collection" className="featured-collection">
            <div className="container">
                <div className="section-title-row"><SectionHeading eyebrow="The collection" title="Find your fragrance." copy="Scents composed to shape a mood—grounding, softening and quietly uplifting." /><Link to="/shop" className="text-link desktop-only">Shop all <ArrowRight /></Link></div>
                <div className="collection-grid">{featuredProducts.map((product, index) => <ProductCard key={product.id} product={product} featured index={index + 1} />)}</div>
                <Link to="/shop" className="btn mobile-only">Shop all fragrances <ArrowRight /></Link>
            </div>
        </section>

        <section className="experience-section">
            <div className="container experience-grid">
                <div className="experience-image"><img src="/images/products/sugandhmaya_chandan_agarbatti/5.webp" alt="Incense smoke rising in a calm space" loading="lazy" /><span>Pause · Breathe · Begin</span></div>
                <div className="experience-copy"><p className="eyebrow">The everyday ritual</p><h2>A quieter room.<br />A clearer mind.</h2><p>Light one stick at the threshold of your day. Let its fragrance mark a moment to arrive, breathe, and begin with intention.</p><ol><li><span>01</span>Choose a quiet corner</li><li><span>02</span>Light and gently extinguish the flame</li><li><span>03</span>Let the fragrance hold the moment</li></ol><Link to="/shop" className="text-link">Choose your ritual <ArrowRight /></Link></div>
            </div>
        </section>

        <section className="core-values-section">
            <div className="container"><SectionHeading eyebrow="Why Sugandhmaya" title="Rooted in care." />
                <div className="values-grid">{values.map(value => { const Icon = value.icon; return <article className="value-card" key={value.title}><span className="value-number">{value.number}</span><Icon aria-hidden="true" /><h3>{value.title}</h3><p>{value.description}</p></article>; })}</div>
            </div>
        </section>

        <section id="our-promise" className="promise-section">
            <div className="container promise-layout">
                <div className="promise-content"><p className="eyebrow">Our philosophy</p><h2>Old wisdom.<br />New expression.</h2><p>Sugandhmaya means “filled with fragrance.” We honour that idea with products that feel timeless, look considered, and belong naturally in modern homes.</p><Link to="/shop" className="btn btn-light">Discover the collection <ArrowRight /></Link></div>
                <div className="brand-emblem"><img src="/images/Sugandhmaya.webp" alt="Sugandhmaya brand emblem" loading="lazy" /><span>Purposefully made<br />in New Delhi</span></div>
            </div>
        </section>

        <section id="contact" className="contact-section"><div className="container contact-layout"><div><p className="eyebrow">We are here</p><h2>Let’s connect.</h2><p>Have a product question, gifting enquiry, or simply want to say hello?</p></div><div className="contact-links"><a href="mailto:ops@indiaonroaming.com">Email us <ArrowRight /></a><a href="tel:+919971055746">Call +91 99710 55746 <ArrowRight /></a></div></div></section>
    </main>;
};

export default Home;
