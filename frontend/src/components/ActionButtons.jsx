import PropTypes from 'prop-types';

/**
 * ActionButtons Component
 * 
 * Standardized Edit/Delete button group for data tables
 * Provides consistent styling and behavior across all manage pages
 * 
 * @param {function} onEdit - Edit button click handler
 * @param {function} onDelete - Delete button click handler
 * @param {string} editLabel - Custom edit button label
 * @param {string} deleteLabel - Custom delete button label
 * @param {boolean} showEdit - Show/hide edit button
 * @param {boolean} showDelete - Show/hide delete button
 */
export default function ActionButtons({
    onEdit,
    onDelete,
    editLabel = "Edit",
    deleteLabel = "Delete",
    showEdit = true,
    showDelete = true
}) {
    return (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            {showEdit && (
                <button
                    className="btn-secondary"
                    onClick={onEdit}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                    aria-label={editLabel}
                >
                    {editLabel}
                </button>
            )}
            {showDelete && (
                <button
                    className="btn-primary"
                    onClick={onDelete}
                    style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.85rem',
                        background: 'var(--danger)'
                    }}
                    aria-label={deleteLabel}
                >
                    {deleteLabel}
                </button>
            )}
        </div>
    );
}

ActionButtons.propTypes = {
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    editLabel: PropTypes.string,
    deleteLabel: PropTypes.string,
    showEdit: PropTypes.bool,
    showDelete: PropTypes.bool
};
