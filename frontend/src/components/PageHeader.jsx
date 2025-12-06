import PropTypes from 'prop-types';

/**
 * PageHeader Component
 * 
 * Consistent page header with title, description, and optional action button
 * Used across all manage pages for uniform styling and layout
 * 
 * @param {string} title - Page title (H1)
 * @param {string} description - Optional page description
 * @param {object} action - Optional action button config { label, onClick, icon }
 */
export default function PageHeader({ title, description, action }) {
    return (
        <header className="page-header">
            <div>
                <h1>{title}</h1>
                {description && <p>{description}</p>}
            </div>
            {action && (
                <button
                    className="btn-primary"
                    onClick={action.onClick}
                    aria-label={action.label}
                >
                    {action.icon && <span style={{ marginRight: '0.5rem' }}>{action.icon}</span>}
                    {action.label}
                </button>
            )}
        </header>
    );
}

PageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    action: PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        icon: PropTypes.string
    })
};
