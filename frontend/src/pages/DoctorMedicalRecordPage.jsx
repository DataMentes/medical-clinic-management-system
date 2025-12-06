import { useState } from "react";
import MedicalRecordEditorModal from "../components/MedicalRecordEditorModal.jsx";

// Mock patients list - in real app, get from doctor's patient list
const mockPatients = [
    {
        id: 1,
        name: "Ahmed Mohamed",
        medicalHistory: [
            {
                id: 1,
                date: "2025-11-20",
                diagnosis: "Hypertension",
                prescription: "Amlodipine 5mg daily",
                notes: "Monitor blood pressure weekly"
            }
        ]
    },
    {
        id: 2,
        name: "Sara Ali",
        medicalHistory: [
            {
                id: 2,
                date: "2025-11-15",
                diagnosis: "Diabetes Type 2",
                prescription: "Metformin 500mg twice daily",
                notes: "Follow-up in 2 weeks"
            }
        ]
    },
    {
        id: 3,
        name: "Mohamed Hassan",
        medicalHistory: []
    }
];

export default function DoctorMedicalRecordPage() {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        setShowModal(true);
    };

    const handleSave = async (newRecord) => {
        console.log("Saved medical record:", newRecord);
        // TODO: Call API endpoint here when backend is ready
    };

    return (
        <div className="page">
            <header className="page-header">
                <h1>Medical Record Editor</h1>
                <p>Select a patient to view or add medical records.</p>
            </header>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Select Patient</h3>
                <ul className="list">
                    {mockPatients.map((patient) => (
                        <li
                            key={patient.id}
                            className="list-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handlePatientClick(patient)}
                        >
                            <div>
                                <div className="list-title">{patient.name}</div>
                                <div className="list-subtitle">
                                    {patient.medicalHistory.length} record(s)
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePatientClick(patient);
                                }}
                            >
                                Open Records
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <MedicalRecordEditorModal
                patient={selectedPatient}
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedPatient(null);
                }}
                onSave={handleSave}
            />
        </div>
    );
}
