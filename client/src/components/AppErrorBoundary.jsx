import { Component } from 'react';
import PropTypes from 'prop-types';

class AppErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) { return { error }; }

    componentDidCatch(error, details) {
        console.error('[ui] Unhandled render error', error, details);
    }

    render() {
        if (!this.state.error) return this.props.children;
        return <main className="error-page"><section className="error-card">
            <img src="/media/brand/logo-mark.webp" alt="" />
            <p className="eyebrow">A brief pause</p><h1>This page needs a fresh start.</h1>
            <p>Your cart is safe. Refresh to reconnect with the latest version of Sugandhmaya.</p>
            <div className="error-actions"><button className="btn" onClick={() => window.location.reload()}>Refresh page</button><a className="text-link" href="/">Return home</a></div>
        </section></main>;
    }
}

AppErrorBoundary.propTypes = { children: PropTypes.node.isRequired };
export default AppErrorBoundary;
