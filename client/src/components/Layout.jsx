
import PropTypes from 'prop-types';
import Header from './Header';
import Footer from './Footer';
import CartPanel from './CartPanel';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <CartPanel />
            <div className="main-content-area">
                {children}
            </div>
            <Footer />
        </>
    );
};

export default Layout;

Layout.propTypes = { children: PropTypes.node.isRequired };
