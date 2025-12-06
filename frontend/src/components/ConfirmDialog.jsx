import PropTypes from 'prop-types';

/**
 * ConfirmDialog Component
 * 
 * Reusable confirmation dialog to replace window.confirm()
 * Provides better UX with custom styling and messaging
 * 
 * @param {boolean} isOpen - Dialog visibility
 * @param {function} onClose - Close handler
 * @param {function} onConfirm - Confirm action handler
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmLabel - Confirm button label
 * @param {string} cancelLabel - Cancel button label
 * @param {string} variant - Button variant: 'danger', 'warning', 'info'
 */
export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger"
}) {
    if (!isOpen) return null;

    const getButtonStyle = () => {
        const styles = {
            danger: { background: 'var(--danger)' },
            warning: { background: '#f59e0b' },
            info: { background: 'var(--accent)' }
        };
        return styles[variant] || styles.danger;
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '400px' }}
            >
                <div className="modal-header">
                    <h2 id="confirm-dialog-title">{title}</h2>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <p style={{ margin: 0, lineHeight: '1.6' }}>{message}</p>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onClose}
                        style={{ flex: 1 }}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{ flex: 1, ...getButtonStyle() }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

ConfirmDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    confirmLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    variant: PropTypes.oneOf(['danger', 'warning', 'info'])
};
