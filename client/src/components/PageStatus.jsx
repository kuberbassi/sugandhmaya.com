import PropTypes from 'prop-types';

const PageStatus = ({ title, message, action }) => (
    <div className="page-status" role="status">
        <div className="page-status-mark" aria-hidden="true" />
        <h2>{title}</h2>
        {message && <p>{message}</p>}
        {action}
    </div>
);

PageStatus.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string,
    action: PropTypes.node
};

export default PageStatus;
