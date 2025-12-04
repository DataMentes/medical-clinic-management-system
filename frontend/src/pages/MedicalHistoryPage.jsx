const medicalHistory = [
  {
    id: "mh-1",
    diagnosis: "Seasonal influenza",
    prescription: "Tamiflu 75mg · 5 days",
    notes: "Rest and hydrate well",
    date: "2025-11-14"
  },
  {
    id: "mh-2",
    diagnosis: "Lower back pain",
    prescription: "Physiotherapy + Ibuprofen",
    notes: "Improve posture. Re-evaluate in 6 weeks.",
    date: "2025-09-10"
  }
];

export default function MedicalHistoryPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Medical History</h1>
        <p>View your complete medical records and history.</p>
      </header>

      <div className="card">
        <h3>Medical Records</h3>
        <ul className="list">
          {medicalHistory.map((record) => (
            <li key={record.id} className="list-item">
              <div className="list-title">
                {record.diagnosis} · {record.date}
              </div>
              <div className="list-subtitle">
                Prescription: {record.prescription}
              </div>
              <p className="muted">{record.notes}</p>
            </li>
          ))}
          {medicalHistory.length === 0 && (
            <li className="list-empty">No medical records found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

