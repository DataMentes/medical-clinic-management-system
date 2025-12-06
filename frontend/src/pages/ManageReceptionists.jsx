import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const RECEPTIONISTS_KEY = "receptionistsData";

export default function ManageReceptionists() {
  const [receptionists, setReceptionists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "male",
    shiftStart: "",
    shiftEnd: ""
  });

  useEffect(() => {
    const savedReceptionists = JSON.parse(localStorage.getItem(RECEPTIONISTS_KEY) || "[]");
    if (savedReceptionists.length === 0) {
      const defaultReceptionists = [
        {
          id: 1,
          fullName: "Mona Ahmed",
          email: "mona@clinic.com",
          gender: "female",
          shiftStart: "08:00",
          shiftEnd: "16:00"
        }
      ];
      setReceptionists(defaultReceptionists);
      localStorage.setItem(RECEPTIONISTS_KEY, JSON.stringify(defaultReceptionists));
    } else {
      setReceptionists(savedReceptionists);
    }
  }, []);

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
      gender: "male",
      shiftStart: "",
      shiftEnd: ""
    });
    setShowModal(true);
  };

  const handleEdit = (receptionist) => {
    setEditingReceptionist(receptionist);
    setFormData({
      fullName: receptionist.fullName,
      email: receptionist.email,
      phone: receptionist.phone || "",
      password: "",
      gender: receptionist.gender || "male",
      shiftStart: receptionist.shiftStart || "",
      shiftEnd: receptionist.shiftEnd || ""
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const updated = receptionists.filter((receptionist) => receptionist.id !== deletingId);
    setReceptionists(updated);
    localStorage.setItem(RECEPTIONISTS_KEY, JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingReceptionist) {
      const updated = receptionists.map((receptionist) =>
        receptionist.id === editingReceptionist.id
          ? {
            ...receptionist,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            gender: formData.gender,
            shiftStart: formData.shiftStart,
            shiftEnd: formData.shiftEnd,
            ...(formData.password && { password: formData.password })
          }
          : receptionist
      );
      setReceptionists(updated);
      localStorage.setItem(RECEPTIONISTS_KEY, JSON.stringify(updated));
    } else {
      const newReceptionist = {
        id: Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender,
        shiftStart: formData.shiftStart,
        shiftEnd: formData.shiftEnd
      };
      const updated = [...receptionists, newReceptionist];
      setReceptionists(updated);
      localStorage.setItem(RECEPTIONISTS_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      shiftStart: "",
      shiftEnd: ""
    });
    setEditingReceptionist(null);
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'fullName', label: 'Name' },
    {
      key: 'shift',
      label: 'Shift',
      render: (_, row) => row.shiftStart && row.shiftEnd ? `${row.shiftStart} - ${row.shiftEnd}` : 'N/A'
    }
  ];

  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter full name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'receptionist@clinic.com' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+20 100 123 4567' },
    { name: 'password', label: 'Password', type: 'password', required: !editingReceptionist, placeholder: editingReceptionist ? 'Leave empty to keep current' : 'Enter password' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] },
    { name: 'shiftStart', label: 'Shift Start', type: 'time', required: true, gridColumn: true },
    { name: 'shiftEnd', label: 'Shift End', type: 'time', required: true, gridColumn: true }
  ];

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
