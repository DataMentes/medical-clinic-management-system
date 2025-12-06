import { useState } from "react";
import PropTypes from "prop-types";
import MedicalHistoryList from "./MedicalHistoryList.jsx";

/**
 * MedicalRecordEditorModal Component
 * 
 * Modal component for doctors to view patient medical history and add new records
 * Converted from a full page to a modal for better UX and reduced routing complexity
 * 
 * @param {Object} patient - Patient object with id, name, and medical history
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Callback to close the modal
 * @param {function} onSave - Callback when a new record is saved (for backend integration)
 */
export default function MedicalRecordEditorModal({
    patient,
    isOpen,
    onClose,
    onSave
}) {
    const [form, setForm] = useState({
        diagnosis: "",
        prescription: "",
        notes: ""
    });

    const handleSave = async () => {
        if (!form.diagnosis && !form.prescription && !form.notes) {
            alert("Please fill in at least one field");
            return;
        }

        const newRecord = {
            id: Date.now(), // Temporary ID, backend will provide real ID
            date: new Date().toISOString().split("T")[0],
            patientId: patient?.id,
            ...form
        };

        // Call parent's save handler for backend integration
        if (onSave) {
            await onSave(newRecord);
        }

        // Reset form
        setForm({ diagnosis: "", prescription: "", notes: "" });
        alert("Medical record saved successfully");
    };

    const handleCancel = () => {
        setForm({ diagnosis: "", prescription: "", notes: "" });
        onClose();
    };

    if (!isOpen || !patient) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '900px', width: '90%' }}
            >
                <header className="modal-header">
                    <div>
                        <h2>Medical Record Editor</h2>
                        <p>
                            Review medical records for <strong>{patient.name}</strong> and add a new entry.
                        </p>
                    </div>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </header>

                <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Section 1: Patient History */}
                    <div className="card">
                        <h3>Patient History</h3>
                        <MedicalHistoryList
                            records={patient.medicalHistory || []}
                            emptyMessage="No medical records for this patient."
                        />
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
                                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                                    placeholder="Enter diagnosis..."
                                    aria-label="Diagnosis"
                                />
                            </label>
                            <label className="field">
                                <span>Prescription</span>
                                <textarea
                                    rows={2}
                                    value={form.prescription}
                                    onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                                    placeholder="Enter prescription details..."
                                    aria-label="Prescription"
                                />
                            </label>
                            <label className="field">
                                <span>Notes</span>
                                <textarea
                                    rows={3}
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Additional notes..."
                                    aria-label="Medical notes"
                                />
                            </label>
                            <div className="actions-buttons">
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={handleSave}
                                    aria-label="Save medical record"
                                >
                                    Save Record
                                </button>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleCancel}
                                    aria-label="Cancel and close"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

MedicalRecordEditorModal.propTypes = {
    patient: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string.isRequired,
        medicalHistory: PropTypes.array
    }),
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func
};
