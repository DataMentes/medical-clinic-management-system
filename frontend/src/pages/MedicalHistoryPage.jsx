import { useState, useEffect } from "react";
import { getMedicalRecords } from "../api/patient.api.js";

export default function MedicalHistoryPage() {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await getMedicalRecords();
        
        if (response.success && response.data) {
          setMedicalRecords(response.data);
        }
      } catch (err) {
        console.error('Error loading medical records:', err);
        setError(err.message || "Failed to load medical records");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, []);

  const formatDateTime = (dateString, time) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (time) {
      if (time.includes('T')) {
        const timeDate = new Date(time);
        const formattedTime = timeDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        return `${formattedDate} - ${formattedTime}`;
      } else {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${formattedDate} - ${hour12}:${minutes} ${ampm}`;
      }
    }
    
    return formattedDate;
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>My Medical History</h1>
        <p>View your past medical records and prescriptions.</p>
      </header>

      {error && (
        <div style={{
          padding: "1rem",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "var(--radius-md)",
          color: "#dc2626",
          marginBottom: "1rem"
        }}>
          {error}
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Medical Records</h3>
        
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-soft)" }}>
            Loading medical records...
          </div>
        ) : medicalRecords.length > 0 ? (
          <ul className="list">
            {medicalRecords.map((record) => (
              <li key={record.id} className="list-item">
                <div>
                  <div className="list-title">
                    {formatDateTime(
                      record.appointment?.appointmentDate,
                      record.appointment?.schedule?.startTime
                    )} · {record.appointment?.appointmentType}
                  </div>
                  <div className="list-subtitle">
                    {record.appointment?.doctor?.person?.fullName} · {record.appointment?.doctor?.specialty?.name}
                  </div>
                  
                  {record.diagnosis && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                      <strong>Diagnosis:</strong> {record.diagnosis}
                    </div>
                  )}
                  
                  {record.prescription && (
                    <div style={{ marginTop: "0.25rem", fontSize: "0.9rem" }}>
                      <strong>Prescription:</strong> {record.prescription}
                    </div>
                  )}
                  
                  {record.notes && (
                    <p className="muted" style={{ marginTop: "0.5rem" }}>
                      {record.notes}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="list-empty">
            No medical records found.
          </div>
        )}
      </div>
    </div>
  );
}
