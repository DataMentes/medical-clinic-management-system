import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const SPECIALTIES_KEY = "specialtiesData";

export default function ManageSpecialties() {
  const [specialties, setSpecialties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [formData, setFormData] = useState({
    name: ""
  });

  useEffect(() => {
    const savedSpecialties = JSON.parse(
      localStorage.getItem(SPECIALTIES_KEY) || "[]"
    );
    if (savedSpecialties.length === 0) {
      const defaultSpecialties = [
        { id: 1, name: "Cardiology" },
        { id: 2, name: "Dermatology" },
        { id: 3, name: "Neurology" },
        { id: 4, name: "Orthopedics" },
        { id: 5, name: "Pediatrics" },
        { id: 6, name: "General Medicine" }
      ];
      setSpecialties(defaultSpecialties);
      localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(defaultSpecialties));
    } else {
      setSpecialties(savedSpecialties);
    }
  }, []);

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

  const handleDeleteConfirm = () => {
    const updated = specialties.filter((specialty) => specialty.id !== deletingId);
    setSpecialties(updated);
    localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingSpecialty) {
      const updated = specialties.map((specialty) =>
        specialty.id === editingSpecialty.id
          ? { ...specialty, name: formData.name }
          : specialty
      );
      setSpecialties(updated);
      localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(updated));
    } else {
      const newSpecialty = {
        id: Date.now(),
        name: formData.name
      };
      const updated = [...specialties, newSpecialty];
      setSpecialties(updated);
      localStorage.setItem(SPECIALTIES_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setFormData({ name: "" });
    setEditingSpecialty(null);
  };

  const columns = [
    { key: 'id', label: 'Specialty ID', render: (value) => `#${value}` },
    { key: 'name', label: 'Name' }
  ];

  const formFields = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Cardiology' }
  ];

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
