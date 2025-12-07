import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { 
  getAllAdmins, 
  createAdmin, 
  updateAdmin, 
  deleteAdmin 
} from "../api/admin.api.js";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male"
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAdmins();
      setAdmins(response.data.admins || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
      setError(err.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingAdmin(null);
    setFormData({ 
      fullName: "", 
      email: "", 
      phone: "", 
      password: "",
      gender: "Male"
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      fullName: admin.fullName || "",
      email: admin.email,
      phone: admin.phoneNumber || "",
      password: "",
      gender: admin.gender || "Male"
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAdmin(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
      await fetchAdmins();
    } catch (err) {
      console.error('Failed to delete admin:', err);
      alert(err.message || 'Failed to delete admin');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, formData);
      } else {
        await createAdmin(formData);
      }

      setShowModal(false);
      setFormData({  
        fullName: "", 
        email: "", 
        phone: "", 
        password: "",
        gender: "Male"
      });
      setEditingAdmin(null);
      await fetchAdmins();
    } catch (err) {
      console.error('Failed to save admin:', err);
      alert(err.message || 'Failed to save admin');
    }
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'fullName', label: 'Name' },
    { key: 'phoneNumber', label: 'Phone' }
  ];

  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'admin@clinic.com' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+20 100 123 4567' },
    { name: 'password', label: 'Password', type: 'password', required: !editingAdmin, placeholder: editingAdmin ? 'Leave empty to keep current' : 'Enter password' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }] }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Admins"
          description="Add, edit, or remove admin accounts."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading admins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Admins"
          description="Add, edit, or remove admin accounts."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <p>⚠️ {error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchAdmins}
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
        title="Manage Admins"
        description="Add, edit, or remove admin accounts."
        action={{
          label: "+ Add Admin",
          onClick: handleAdd
        }}
      />

      <div className="card">
        <div className="card-header">
          <h3>Admins</h3>
        </div>

        <DataTable
          columns={columns}
          data={admins}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No admins found. Click 'Add Admin' to create one."
        />
      </div>

      <CRUDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingAdmin ? "Edit Admin" : "Add Admin"}
        formFields={formFields}
        formData={formData}
        onChange={handleChange}
        submitLabel={editingAdmin ? "Update" : "Add"}
        isEditing={!!editingAdmin}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Admin"
        message="Are you sure you want to delete this admin? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
