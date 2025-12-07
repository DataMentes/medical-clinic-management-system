import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { 
  getAllReceptionists, 
  createReceptionist, 
  updateReceptionist, 
  deleteReceptionist 
} from "../api/admin.api.js";

export default function ManageReceptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male"
  });

  useEffect(() => {
    fetchReceptionists();
  }, []);

  async function fetchReceptionists() {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllReceptionists();
      setReceptionists(response.data.receptionists || []);
    } catch (err) {
      console.error('Failed to fetch receptionists:', err);
      setError(err.message || 'Failed to load receptionists');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingReceptionist(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "Male"
    });
    setShowModal(true);
  };

  const handleEdit = (receptionist) => {
    setEditingReceptionist(receptionist);
    setFormData({
      fullName: receptionist.fullName,
      email: receptionist.email,
      phone: receptionist.phoneNumber || "",
      password: "",
      gender: receptionist.gender || "Male"
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteReceptionist(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
      await fetchReceptionists();
    } catch (err) {
      console.error('Failed to delete receptionist:', err);
      alert(err.message || 'Failed to delete receptionist');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingReceptionist) {
        await updateReceptionist(editingReceptionist.id, formData); // Use 'id' not 'userId'
      } else {
        await createReceptionist(formData);
      }

      setShowModal(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        gender: "Male"
      });
      setEditingReceptionist(null);
      await fetchReceptionists();
    } catch (err) {
      console.error('Failed to save receptionist:', err);
      alert(err.message || 'Failed to save receptionist');
    }
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'fullName', label: 'Name' },
    { key: 'phoneNumber', label: 'Phone' }
  ];

  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'receptionist@clinic.com' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+20 100 123 4567' },
    { name: 'password', label: 'Password', type: 'password', required: !editingReceptionist, placeholder: editingReceptionist ? 'Leave empty to keep current' : 'Enter password' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }] }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Receptionists"
          description="Add, edit, or remove receptionist accounts."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading receptionists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Receptionists"
          description="Add, edit, or remove receptionist accounts."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <p>⚠️ {error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchReceptionists}
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
        title="Manage Receptionists"
        description="Add, edit, or remove receptionist accounts."
        action={{
          label: "+ Add Receptionist",
          onClick: handleAdd
        }}
      />

      <div className="card">
        <div className="card-header">
          <h3>Receptionists</h3>
        </div>

        <DataTable
          columns={columns}
          data={receptionists}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No receptionists found. Click 'Add Receptionist' to create one."
        />
      </div>

      <CRUDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingReceptionist ? "Edit Receptionist" : "Add Receptionist"}
        formFields={formFields}
        formData={formData}
        onChange={handleChange}
        submitLabel={editingReceptionist ? "Update" : "Add"}
        isEditing={!!editingReceptionist}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Receptionist"
        message="Are you sure you want to delete this receptionist? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
