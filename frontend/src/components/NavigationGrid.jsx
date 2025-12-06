import PropTypes from 'prop-types';

/**
 * NavigationGrid Component
 * 
 * Grid of navigation cards with icons for admin dashboard
 * Displays management options in a responsive grid layout
 * 
 * @param {Array} items - Navigation items [{ path, label, icon }]
 * @param {function} onNavigate - Navigation handler
 */
export default function NavigationGrid({ items, onNavigate }) {
    return (
        <div className="admin-management-grid">
            {items.map((item) => (
                <button
                    key={item.path}
                    onClick={() => onNavigate(item.path)}
                    className="btn-primary admin-management-card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1.1rem 0.8rem',
                        minHeight: '95px',
                        fontSize: '0.95rem'
                    }}
                    aria-label={`Navigate to ${item.label}`}
                >
                    <span style={{ fontSize: '2rem' }} aria-hidden="true">
                        {item.icon}
                    </span>
                    <span>{item.label}</span>
                </button>
            ))}
        </div>
    );
}

NavigationGrid.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            path: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            icon: PropTypes.string.isRequired
        })
    ).isRequired,
    onNavigate: PropTypes.func.isRequired
};
