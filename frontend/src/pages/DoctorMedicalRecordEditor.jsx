import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doctorService } from "../api/doctorService";

export default function DoctorMedicalRecordEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const patient = location.state?.patient || null;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    diagnosis: "",
    prescription: "",
    notes: ""
  });

  useEffect(() => {
    if (!patient) {
      navigate("/doctor-dashboard", { replace: true });
      return;
    }

    fetchMedicalHistory();
  }, [patient, navigate]);

  const fetchMedicalHistory = async () => {
    if (!patient?.id) return;

    try {
      setLoading(true);
      const records = await doctorService.getMedicalRecord(patient.id);
      // Transform records
      const formattedHistory = records.map(r => ({
        id: r.id,
        date: new Date(r.visitDate).toISOString().split("T")[0],
        diagnosis: r.diagnosis,
        prescription: r.prescription,
        notes: r.notes
      }));
      setHistory(formattedHistory);
    } catch (error) {
      console.error("Failed to fetch medical history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.diagnosis && !form.prescription && !form.notes) return;
    if (!patient?.id) return;

    try {
      await doctorService.updateMedicalRecord(patient.id, {
        diagnosis: form.diagnosis,
        prescription: form.prescription,
        notes: form.notes,
        visitDate: new Date().toISOString()
      });

      // Refresh history
      await fetchMedicalHistory();
      setForm({ diagnosis: "", prescription: "", notes: "" });
      alert("Medical record saved successfully.");
    } catch (error) {
      console.error("Failed to save medical record:", error);
      alert("Failed to save medical record");
    }
  };

  const handleCancel = () => {
    setForm({ diagnosis: "", prescription: "", notes: "" });
    window.history.back();
  };

  if (!patient) return null;
  if (loading) return <div className="page"><p>Loading medical records...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Medical Record Editor</h1>
        <p>
          Review medical records for{" "}
          <strong>{patient.name}</strong> and add a new entry.
        </p>
      </header>

      <section className="grid-2">
        {/* Section 1: Patient History */}
        <div className="card">
          <h3>Patient History</h3>
          <ul className="list">
            {history.map((r) => (
              <li key={r.id} className="list-item">
                <div className="list-title">
                  {r.date} · {r.diagnosis}
                </div>
                <div className="list-subtitle">{r.prescription}</div>
                <p className="muted">{r.notes}</p>
              </li>
            ))}
            {history.length === 0 && (
              <li className="list-empty">No medical records for this patient.</li>
            )}
          </ul>
        </div>

        {/* Section 2: New Record Entry */}
        <div className="card">
          <h3>New Record Entry</h3>
          <div className="form">
            <label className="field">
              <span>Diagnosis</span>
              <textarea
                rows={2}
                value={form.diagnosis}
                onChange={(e) =>
                  setForm({ ...form, diagnosis: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Prescription</span>
              <textarea
                rows={2}
                value={form.prescription}
                onChange={(e) =>
                  setForm({ ...form, prescription: e.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Notes</span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            <div className="actions-buttons">
              <button type="button" className="btn-primary" onClick={handleSave}>
                Save Record
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
