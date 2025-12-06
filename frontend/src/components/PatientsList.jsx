import PropTypes from 'prop-types';

/**
 * PatientsList Component
 * 
 * Reusable component to display patients list
 * Can be used in DoctorDashboard, ReceptionistDashboard, or admin panels
 * 
 * @param {Array} patients - Array of patient objects
 * @param {function} onPatientClick - Callback when a patient is clicked
 * @param {function} onAction - Callback for action buttons
 * @param {boolean} showActions - Whether to show action buttons
 * @param {string} actionLabel - Label for the action button
 */
export default function PatientsList({
    patients = [],
    onPatientClick = null,
    onAction = null,
    showActions = true,
    actionLabel = "View",
    emptyMessage = "No patients found.",
    showStatus = false
}) {

    const getStatusColor = (status) => {
        const colors = {
            'waiting': 'pill-warning',
            'in-consultation': 'pill-primary',
            'completed': 'pill-success',
            'checked-in': 'pill-info'
        };
        return colors[status?.toLowerCase()] || 'pill-soft';
    };

    const formatTime = (time) => {
        if (!time) return '';
        if (time.includes('T')) {
            return new Date(time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return time;
    };

    return (
        <div className="patients-list">
            <ul className="list">
                {patients.map((patient) => (
                    <li
                        key={patient.id}
                        className="list-item"
                        onClick={() => onPatientClick && onPatientClick(patient)}
                        style={{ cursor: onPatientClick ? 'pointer' : 'default' }}
                    >
                        <div>
                            <div className="list-title">
                                {patient.name}
                                {patient.time && ` · ${formatTime(patient.time)}`}
                            </div>
                            <div className="list-subtitle">
                                {patient.type && `${patient.type} · `}
                                {patient.phone && `${patient.phone}`}
                                {patient.age && ` · Age: ${patient.age}`}
                                {patient.gender && ` · ${patient.gender}`}
                            </div>
                            {patient.notes && <p className="muted">{patient.notes}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {showStatus && patient.status && (
                                <span className={`pill ${getStatusColor(patient.status)}`}>
                                    {patient.status}
                                </span>
                            )}
                            {showActions && onAction && (
                                <button
                                    className="pill pill-soft"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction(patient);
                                    }}
                                    aria-label={`${actionLabel} patient ${patient.name}`}
                                >
                                    {actionLabel}
                                </button>
                            )}
                        </div>
                    </li>
                ))}
                {patients.length === 0 && (
                    <li className="list-empty">{emptyMessage}</li>
                )}
            </ul>
        </div>
    );
}

PatientsList.propTypes = {
    patients: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            time: PropTypes.string,
            type: PropTypes.string,
            phone: PropTypes.string,
            age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            gender: PropTypes.string,
            status: PropTypes.string,
            notes: PropTypes.string
        })
    ),
    onPatientClick: PropTypes.func,
    onAction: PropTypes.func,
    showActions: PropTypes.bool,
    actionLabel: PropTypes.string,
    emptyMessage: PropTypes.string,
    showStatus: PropTypes.bool
};
