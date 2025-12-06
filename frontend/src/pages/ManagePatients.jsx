import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const PATIENTS_KEY = "adminPatientsData";

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "male",
    yearOfBirth: ""
  });

  useEffect(() => {
    const savedPatients = JSON.parse(localStorage.getItem(PATIENTS_KEY) || "[]");
    if (savedPatients.length === 0) {
      const defaultPatients = [
        {
          id: 1,
          fullName: "Ahmed Mohamed",
          email: "ahmed@example.com",
          gender: "male",
          yearOfBirth: "1990"
        },
        {
          id: 2,
          fullName: "Sara Ali",
          email: "sara@example.com",
          gender: "female",
          yearOfBirth: "1985"
        },
        {
          id: 3,
          fullName: "Mohamed Hassan",
          email: "mohamed@example.com",
          gender: "male",
          yearOfBirth: "1992"
        }
      ];
      setPatients(defaultPatients);
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(defaultPatients));
    } else {
      setPatients(savedPatients);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = () => {
    setEditingPatient(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      yearOfBirth: ""
    });
    setShowModal(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName,
      email: patient.email,
      phone: patient.phone || "",
      password: "",
      gender: patient.gender || "male",
      yearOfBirth: patient.yearOfBirth || ""
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const updated = patients.filter((patient) => patient.id !== deletingId);
    setPatients(updated);
    localStorage.setItem(PATIENTS_KEY, JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingPatient) {
      const updated = patients.map((patient) =>
        patient.id === editingPatient.id
          ? {
            ...patient,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            gender: formData.gender,
            yearOfBirth: formData.yearOfBirth,
            ...(formData.password && { password: formData.password })
          }
          : patient
      );
      setPatients(updated);
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(updated));
    } else {
      const newPatient = {
        id: Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender,
        yearOfBirth: formData.yearOfBirth
      };
      const updated = [...patients, newPatient];
      setPatients(updated);
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      yearOfBirth: ""
    });
    setEditingPatient(null);
  };

  const columns = [
    { key: 'email', label: 'Mail' },
    { key: 'fullName', label: 'Name' },
    {
      key: 'yearOfBirth',
      label: 'Year of Birth',
      render: (value) => value || 'N/A'
    }
  ];

  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'patient@example.com' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+20 100 123 4567' },
    { name: 'password', label: 'Password', type: 'password', required: !editingPatient, placeholder: editingPatient ? 'Leave empty to keep current' : 'Enter password' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] },
    { name: 'yearOfBirth', label: 'Year of Birth', type: 'number', required: true, placeholder: 'YYYY', min: 1900, max: new Date().getFullYear() }
  ];

  return (
    <div className="page">
      <PageHeader
        title="Manage Patients"
        description="Add, edit, or remove patient accounts."
        action={{
          label: "+  Add Patient",
          onClick: handleAdd
        }}
      />

      <div className="card">
        <div className="card-header">
          <h3>Patients</h3>
        </div>

        <DataTable
          columns={columns}
          data={patients}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No patients found. Click 'Add Patient' to create one."
        />
      </div>

      <CRUDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingPatient ? "Edit Patient" : "Add Patient"}
        formFields={formFields}
        formData={formData}
        onChange={handleChange}
        submitLabel={editingPatient ? "Update" : "Add"}
        isEditing={!!editingPatient}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Patient"
        message="Are you sure you want to delete this patient? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
