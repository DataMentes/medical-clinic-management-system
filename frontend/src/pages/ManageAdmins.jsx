import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const ADMINS_KEY = "adminUsersData";

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    const savedAdmins = JSON.parse(localStorage.getItem(ADMINS_KEY) || "[]");
    setAdmins(savedAdmins);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingAdmin(null);
    setFormData({ email: "", password: "" });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      password: ""
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const updated = admins.filter((admin) => admin.id !== deletingId);
    setAdmins(updated);
    localStorage.setItem(ADMINS_KEY, JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingAdmin) {
      const updated = admins.map((admin) =>
        admin.id === editingAdmin.id
          ? {
            ...admin,
            email: formData.email,
            ...(formData.password && { password: formData.password })
          }
          : admin
      );
      setAdmins(updated);
      localStorage.setItem(ADMINS_KEY, JSON.stringify(updated));
    } else {
      const newAdmin = {
        id: Date.now(),
        email: formData.email,
        password: formData.password
      };
      const updated = [...admins, newAdmin];
      setAdmins(updated);
      localStorage.setItem(ADMINS_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setFormData({ email: "", password: "" });
    setEditingAdmin(null);
  };

  const columns = [
    { key: 'email', label: 'Email' }
  ];

  const formFields = [
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'admin@clinic.com' },
    { name: 'password', label: 'Password', type: 'password', required: !editingAdmin, placeholder: editingAdmin ? 'Leave empty to keep current' : 'Enter password' }
  ];

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
