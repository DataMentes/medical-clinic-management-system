import PropTypes from 'prop-types';

/**
 * AppointmentsList Component
 * 
 * Reusable component to display appointments across different dashboards
 * Supports different views for patients, doctors, receptionists, and admins
 * 
 * @param {Array} appointments - Array of appointment objects
 * @param {string} viewMode - Display mode: 'patient', 'doctor', 'receptionist', 'admin'
 * @param {function} onAppointmentClick - Callback when appointment is clicked
 * @param {function} onAction - Callback for action buttons (cancel, reschedule, etc.)
 * @param {boolean} showActions - Whether to show action buttons
 */
export default function AppointmentsList({
    appointments = [],
    viewMode = 'patient',
    onAppointmentClick = null,
    onAction = null,
    showActions = true,
    emptyMessage = "No appointments found."
}) {

    const getStatusColor = (status) => {
        const colors = {
            'confirmed': 'pill-success',
            'pending': 'pill-warning',
            'completed': 'pill-info',
            'cancelled': 'pill-danger',
            'checked-in': 'pill-primary'
        };
        return colors[status?.toLowerCase()] || 'pill-soft';
    };

    const formatTime = (time) => {
        if (!time) return 'N/A';
        // Handle both "HH:MM" and ISO date formats
        if (time.includes('T')) {
            return new Date(time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return time;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="appointments-list">
            <ul className="list">
                {appointments.map((appointment) => (
                    <li
                        key={appointment.id}
                        className="list-item"
                        onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
                        style={{ cursor: onAppointmentClick ? 'pointer' : 'default' }}
                    >
                        <div>
                            <div className="list-title">
                                {formatTime(appointment.time)} · {' '}
                                {viewMode === 'patient' && (appointment.doctorName || 'Dr. ' + appointment.doctor)}
                                {viewMode === 'doctor' && (appointment.patientName || appointment.patient)}
                                {(viewMode === 'receptionist' || viewMode === 'admin') &&
                                    `${appointment.patientName || appointment.patient} → ${appointment.doctorName || appointment.doctor}`
                                }
                            </div>
                            <div className="list-subtitle">
                                {appointment.type || 'General Consultation'} · {formatDate(appointment.date)}
                                {appointment.room && ` · Room ${appointment.room}`}
                            </div>
                            {appointment.notes && <p className="muted">{appointment.notes}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {appointment.status && (
                                <span className={`pill ${getStatusColor(appointment.status)}`}>
                                    {appointment.status}
                                </span>
                            )}
                            {showActions && onAction && (
                                <button
                                    className="pill pill-soft"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction(appointment, 'view');
                                    }}
                                    aria-label={`View appointment details for ${appointment.patientName}`}
                                >
                                    Details
                                </button>
                            )}
                        </div>
                    </li>
                ))}
                {appointments.length === 0 && (
                    <li className="list-empty">{emptyMessage}</li>
                )}
            </ul>
        </div>
    );
}

AppointmentsList.propTypes = {
    appointments: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            time: PropTypes.string,
            date: PropTypes.string,
            patientName: PropTypes.string,
            patient: PropTypes.string,
            doctorName: PropTypes.string,
            doctor: PropTypes.string,
            type: PropTypes.string,
            status: PropTypes.string,
            room: PropTypes.string,
            notes: PropTypes.string
        })
    ),
    viewMode: PropTypes.oneOf(['patient', 'doctor', 'receptionist', 'admin']),
    onAppointmentClick: PropTypes.func,
    onAction: PropTypes.func,
    showActions: PropTypes.bool,
    emptyMessage: PropTypes.string
};
