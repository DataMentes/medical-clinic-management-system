import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { 
  getAllSpecialties, 
  createSpecialty, 
  updateSpecialty, 
  deleteSpecialty 
} from "../api/admin.api.js";

export default function ManageSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [formData, setFormData] = useState({
    name: ""
  });

  // Fetch specialties from API
  useEffect(() => {
    fetchSpecialties();
  }, []);

  async function fetchSpecialties() {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllSpecialties();
      setSpecialties(response.data.specialties || []);
    } catch (err) {
      console.error('Failed to fetch specialties:', err);
      setError(err.message || 'Failed to load specialties');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingSpecialty(null);
    setFormData({ name: "" });
    setShowModal(true);
  };

  const handleEdit = (specialty) => {
    setEditingSpecialty(specialty);
    setFormData({ name: specialty.name });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSpecialty(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
      // Refresh list
      await fetchSpecialties();
    } catch (err) {
      console.error('Failed to delete specialty:', err);
      alert(err.message || 'Failed to delete specialty');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingSpecialty) {
        // Update existing specialty
        await updateSpecialty(editingSpecialty.id, formData);
      } else {
        // Create new specialty
        await createSpecialty(formData);
      }

      setShowModal(false);
      setFormData({ name: "" });
      setEditingSpecialty(null);
      
      // Refresh list
      await fetchSpecialties();
    } catch (err) {
      console.error('Failed to save specialty:', err);
      alert(err.message || 'Failed to save specialty');
    }
  };

  const columns = [
    { key: 'id', label: 'Specialty ID', render: (value) => `#${value}` },
    { key: 'name', label: 'Name' }
  ];

  const formFields = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Cardiology' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Specialties"
          description="Add, edit, or remove medical specialties."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading specialties...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Specialties"
          description="Add, edit, or remove medical specialties."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <p>⚠️ {error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchSpecialties}
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
        title="Manage Specialties"
        description="Add, edit, or remove medical specialties."
        action={{
          label: "+ Add Specialty",
          onClick: handleAdd
        }}
      />

      <div className="card">
        <div className="card-header">
          <h3>Specialties</h3>
        </div>

        <DataTable
          columns={columns}
          data={specialties}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No specialties found. Click 'Add Specialty' to create one."
        />
      </div>

      <CRUDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingSpecialty ? "Edit Specialty" : "Add Specialty"}
        formFields={formFields}
        formData={formData}
        onChange={handleChange}
        submitLabel={editingSpecialty ? "Update" : "Add"}
        isEditing={!!editingSpecialty}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Specialty"
        message="Are you sure you want to delete this specialty? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
