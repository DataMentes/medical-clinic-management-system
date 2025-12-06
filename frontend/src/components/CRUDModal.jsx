import PropTypes from 'prop-types';

/**
 * CRUDModal Component
 * 
 * Reusable modal for add/edit forms
 * Dynamically generates form fields based on configuration
 * 
 * @param {boolean} isOpen - Modal visibility
 * @param {function} onClose - Close handler
 * @param {function} onSubmit - Form submit handler
 * @param {string} title - Modal title
 * @param {Array} formFields - Field configuration
 * @param {object} formData - Current form data
 * @param {function} onChange - Form change handler
 * @param {string} submitLabel - Submit button label
 * @param {string} cancelLabel - Cancel button label
 * @param {boolean} isEditing - Whether in edit mode
 */
export default function CRUDModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    formFields,
    formData,
    onChange,
    submitLabel = "Save",
    cancelLabel = "Cancel",
    isEditing = false
}) {

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const renderField = (field) => {
        const {
            name,
            label,
            type = 'text',
            required = false,
            placeholder = '',
            options = [],
            min,
            max,
            step,
            rows = 3,
            disabled = false
        } = field;

        const value = formData[name] || '';

        // Common field props
        const commonProps = {
            name,
            value,
            onChange,
            required: type === 'password' && isEditing ? false : required,
            placeholder,
            disabled,
            'aria-label': label
        };

        switch (type) {
            case 'select':
                return (
                    <label key={name} className="field">
                        <span>{label}</span>
                        <select {...commonProps}>
                            <option value="">Select {label}</option>
                            {options.map((option) => (
                                <option
                                    key={typeof option === 'string' ? option : option.value}
                                    value={typeof option === 'string' ? option : option.value}
                                >
                                    {typeof option === 'string' ? option : option.label}
                                </option>
                            ))}
                        </select>
                    </label>
                );

            case 'textarea':
                return (
                    <label key={name} className="field">
                        <span>{label}</span>
                        <textarea
                            {...commonProps}
                            rows={rows}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: 'var(--bg-soft)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text)',
                                fontFamily: 'inherit',
                                fontSize: '0.95rem',
                                resize: 'vertical'
                            }}
                        />
                    </label>
                );

            case 'number':
                return (
                    <label key={name} className="field">
                        <span>{label}</span>
                        <input
                            {...commonProps}
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                        />
                    </label>
                );

            case 'password':
                return (
                    <label key={name} className="field">
                        <span>{label}</span>
                        <input
                            {...commonProps}
                            type="password"
                            placeholder={isEditing ? "Leave empty to keep current password" : placeholder}
                        />
                    </label>
                );

            default:
                return (
                    <label key={name} className="field">
                        <span>{label}</span>
                        <input
                            {...commonProps}
                            type={type}
                        />
                    </label>
                );
        }
    };

    // Group fields into grid if they have gridColumn property
    const renderFields = () => {
        const elements = [];
        let gridGroup = [];

        formFields.forEach((field, index) => {
            if (field.gridColumn) {
                gridGroup.push(field);
                // If it's the last field or next field doesn't have gridColumn, render the grid
                if (index === formFields.length - 1 || !formFields[index + 1]?.gridColumn) {
                    elements.push(
                        <div key={`grid-${index}`} className="form-grid-2">
                            {gridGroup.map(renderField)}
                        </div>
                    );
                    gridGroup = [];
                }
            } else {
                // Render any pending grid group first
                if (gridGroup.length > 0) {
                    elements.push(
                        <div key={`grid-${index}`} className="form-grid-2">
                            {gridGroup.map(renderField)}
                        </div>
                    );
                    gridGroup = [];
                }
                // Render regular field
                elements.push(renderField(field));
            }
        });

        return elements;
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="crud-modal-title"
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                <form className="form" onSubmit={handleSubmit}>
                    <h2 id="crud-modal-title">{title}</h2>

                    {renderFields()}

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            style={{ flex: 1 }}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 1 }}
                        >
                            {submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

CRUDModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    formFields: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            type: PropTypes.string,
            required: PropTypes.bool,
            placeholder: PropTypes.string,
            options: PropTypes.array,
            min: PropTypes.number,
            max: PropTypes.number,
            step: PropTypes.number,
            rows: PropTypes.number,
            disabled: PropTypes.bool,
            gridColumn: PropTypes.bool
        })
    ).isRequired,
    formData: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    submitLabel: PropTypes.string,
    cancelLabel: PropTypes.string,
    isEditing: PropTypes.bool
};
