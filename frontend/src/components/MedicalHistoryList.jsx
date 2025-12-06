import PropTypes from 'prop-types';

/**
 * MedicalHistoryList Component
 * 
 * Reusable component to display medical history records
 * Can be used in PatientDashboard, DoctorDashboard, or anywhere medical history needs to be shown
 * 
 * @param {Array} records - Array of medical history records
 * @param {boolean} showActions - Whether to show action buttons for each record
 * @param {function} onRecordClick - Callback when a record is clicked
 */
export default function MedicalHistoryList({
    records = [],
    showActions = false,
    onRecordClick = null,
    emptyMessage = "No medical records found."
}) {
    return (
        <div className="medical-history-list">
            <ul className="list">
                {records.map((record) => (
                    <li
                        key={record.id}
                        className="list-item"
                        {...(onRecordClick && {
                            onClick: (e) => {
                                e.preventDefault();
                                onRecordClick(record);
                            },
                            style: { cursor: 'pointer' }
                        })}
                    >
                        <div>
                            <div className="list-title">
                                {record.date} · {record.diagnosis}
                            </div>
                            {(record.doctor || record.type) && (
                                <div className="list-subtitle" style={{ marginBottom: '0.25rem' }}>
                                    {record.doctor && <span>{record.doctor}</span>}
                                    {record.doctor && record.type && <span> · </span>}
                                    {record.type && <span>{record.type}</span>}
                                </div>
                            )}
                            <div className="list-subtitle">
                                Prescription: {record.prescription}
                            </div>
                            {record.notes && <p className="muted">{record.notes}</p>}
                        </div>
                        {showActions && onRecordClick && (
                            <button
                                type="button"
                                className="pill pill-soft"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onRecordClick(record);
                                }}
                            >
                                View Details
                            </button>
                        )}
                    </li>
                ))}
                {records.length === 0 && (
                    <li className="list-empty">{emptyMessage}</li>
                )}
            </ul>
        </div>
    );
}

MedicalHistoryList.propTypes = {
    records: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            date: PropTypes.string.isRequired,
            diagnosis: PropTypes.string.isRequired,
            prescription: PropTypes.string.isRequired,
            notes: PropTypes.string
        })
    ),
    showActions: PropTypes.bool,
    onRecordClick: PropTypes.func,
    emptyMessage: PropTypes.string
};
