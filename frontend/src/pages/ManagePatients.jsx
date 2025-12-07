import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { 
  getAllPatients, 
  createPatient, 
  updatePatient, 
  deletePatient 
} from "../api/admin.api.js";

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male",
    yearOfBirth: ""
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllPatients();
      
      // Safety check for null/undefined data
      if (response && response.data && response.data.patients) {
        setPatients(response.data.patients);
      } else {
        console.warn('No patients data received:', response);
        setPatients([]);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

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
      gender: "Male",
      yearOfBirth: ""
    });
    setShowModal(true);
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      fullName: patient.fullName,
      email: patient.email || "", // ✅ Safe access for null email
      phone: patient.phoneNumber || "",
      password: "",
      gender: patient.gender || "Male",
      yearOfBirth: patient.yearOfBirth?.toString() || ""
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePatient(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
      await fetchPatients();
    } catch (err) {
      console.error('Failed to delete patient:', err);
      alert(err.message || 'Failed to delete patient');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPatient) {
        await updatePatient(editingPatient.id, formData);
      } else {
        await createPatient(formData);
      }

      setShowModal(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        gender: "Male",
        yearOfBirth: ""
      });
      setEditingPatient(null);
      await fetchPatients();
    } catch (err) {
      console.error('Failed to save patient:', err);
      alert(err.message || 'Failed to save patient');
    }
  };

  const columns = [
    { 
      key: 'email', 
      label: 'Email',
      render: (value, row) => {
        if (!value || !row.hasUserAccount) {
          return (
            <span style={{ color: 'var(--text-soft)', fontStyle: 'italic' }}>
              Not Activated
            </span>
          );
        }
        return value;
      }
    },
    { key: 'fullName', label: 'Name' },
    { key: 'phoneNumber', label: 'Phone' },
    {
      key: 'yearOfBirth',
      label: 'Year of Birth',
      render: (value) => value || 'N/A'
    },
    {
      key: 'hasUserAccount',
      label: 'Status',
      render: (value, row) => {
        if (!value) {
          return (
            <span className="pill pill-warning" style={{ fontSize: '0.75rem' }}>
              No Account
            </span>
          );
        }
        const isActive = row.active === 'Yes';
        return (
          <span 
            className={`pill ${isActive ? 'pill-success' : 'pill-soft'}`}
            style={{ fontSize: '0.75rem' }}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      }
    }
  ];

  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'patient@example.com' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+20 100 123 4567' },
    { name: 'password', label: 'Password', type: 'password', required: !editingPatient, placeholder: editingPatient ? 'Leave empty to keep current' : 'Enter password' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }] },
    { name: 'yearOfBirth', label: 'Year of Birth', type: 'number', required: true, placeholder: 'YYYY', min: 1900, max: new Date().getFullYear() }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Patients"
          description="Add, edit, or remove patient accounts."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Patients"
          description="Add, edit, or remove patient accounts."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <p>⚠️ {error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchPatients}
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Manage Patients"
        description="Add, edit, or remove patient accounts."
        action={{
          label: "+ Add Patient",
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
