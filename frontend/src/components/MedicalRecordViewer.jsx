/**
 * MedicalRecordViewer - Read-only display of patient medical history
 * Shows records in a timeline format with date, doctor, diagnosis, prescription, and notes
 */
export default function MedicalRecordViewer({ medicalHistory, loading }) {
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="muted">Loading medical history...</p>
      </div>
    );
  }

  if (!medicalHistory || medicalHistory.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p className="muted">No medical records found for this patient.</p>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '1rem' }}>
      <div style={{ position: 'relative' }}>
        {/* Timeline Line */}
        <div
          style={{
            position: 'absolute',
            left: '20px',
            top: '10px',
            bottom: '10px',
            width: '2px',
            background: 'var(--border)',
            zIndex: 0
          }}
        />

        {/* Medical Records */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {medicalHistory.map((record, index) => {
            const date = new Date(record.createdAt || record.appointment?.appointmentDate);
            const dateStr = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
            const doctorName = record.appointment?.doctor?.person?.fullName || 'Unknown Doctor';
            const specialty = record.appointment?.doctor?.specialty?.name || '';

            return (
              <div
                key={record.id}
                style={{
                  position: 'relative',
                  marginLeft: '50px',
                  marginBottom: index < medicalHistory.length - 1 ? '2rem' : 0,
                  paddingBottom: index < medicalHistory.length - 1 ? '1rem' : 0
                }}
              >
                {/* Timeline Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-38px',
                    top: '5px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    border: '3px solid var(--bg)',
                    boxShadow: '0 0 0 2px var(--border)'
                  }}
                />

                {/* Record Card */}
                <div
                  className="card"
                  style={{
                    background: 'var(--bg-soft)',
                    padding: '1rem',
                    borderRadius: '12px'
                  }}
                >
                  {/* Header */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                          {dateStr}
                        </div>
                        <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          Dr. {doctorName}
                          {specialty && ` • ${specialty}`}
                        </div>
                      </div>
                      {record.appointment?.schedule && (
                        <div className="pill" style={{ fontSize: '0.8rem' }}>
                          {record.appointment.schedule.startTime}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                      Diagnosis
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {record.diagnosis}
                    </div>
                  </div>

                  {/* Prescription */}
                  <div style={{ marginBottom: record.notes ? '0.75rem' : 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                      Prescription
                    </div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {record.prescription}
                    </div>
                  </div>

                  {/* Notes (if any) */}
                  {record.notes && (
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                        Notes
                      </div>
                      <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                        {record.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
