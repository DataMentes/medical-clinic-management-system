import PropTypes from 'prop-types';
import ActionButtons from './ActionButtons.jsx';

/**
 * DataTable Component
 * 
 * Reusable table component for displaying data with edit/delete actions
 * Highly configurable with custom column rendering and styling
 * 
 * @param {Array} columns - Column configuration [{ key, label, render?, align? }]
 * @param {Array} data - Data array to display
 * @param {function} onEdit - Edit handler (item) => void
 * @param {function} onDelete - Delete handler (id) => void
 * @param {string} emptyMessage - Message when data is empty
 * @param {boolean} showActions - Show/hide action column
 * @param {string} keyField - Field name to use as unique key (default: 'id')
 */
export default function DataTable({
    columns,
    data,
    onEdit,
    onDelete,
    emptyMessage = "No data available.",
    showActions = true,
    keyField = 'id'
}) {

    // Default cell renderer
    const defaultRender = (value) => value !== null && value !== undefined ? value : 'N/A';

    return (
        <div style={{ overflowX: 'auto' }}>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginTop: '1rem'
                }}
            >
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                style={{
                                    textAlign: column.align || 'left',
                                    padding: '0.75rem',
                                    color: 'var(--text-soft)',
                                    fontWeight: 500
                                }}
                            >
                                {column.label}
                            </th>
                        ))}
                        {showActions && (
                            <th
                                style={{
                                    textAlign: 'right',
                                    padding: '0.75rem',
                                    color: 'var(--text-soft)',
                                    fontWeight: 500
                                }}
                            >
                                Actions
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length + (showActions ? 1 : 0)}
                                style={{
                                    padding: '2rem',
                                    textAlign: 'center',
                                    color: 'var(--text-soft)'
                                }}
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr
                                key={row[keyField]}
                                style={{
                                    borderBottom: '1px solid var(--border-subtle)',
                                    transition: 'background var(--transition-fast)'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-soft)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={`${row[keyField]}-${column.key}`}
                                        style={{
                                            padding: '0.75rem',
                                            textAlign: column.align || 'left'
                                        }}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : defaultRender(row[column.key])
                                        }
                                    </td>
                                ))}
                                {showActions && (
                                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                                        <ActionButtons
                                            onEdit={() => onEdit(row)}
                                            onDelete={() => onDelete(row[keyField])}
                                        />
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

DataTable.propTypes = {
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            render: PropTypes.func,
            align: PropTypes.oneOf(['left', 'center', 'right'])
        })
    ).isRequired,
    data: PropTypes.array.isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    emptyMessage: PropTypes.string,
    showActions: PropTypes.bool,
    keyField: PropTypes.string
};
