import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const DOCTORS_KEY = "doctorsData";
const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "General Medicine"
];

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "male",
    specialty: "",
    examinationFee: "",
    consultationFee: "",
    biography: ""
  });

  // Load data from localStorage
  useEffect(() => {
    const savedDoctors = JSON.parse(localStorage.getItem(DOCTORS_KEY) || "[]");
    if (savedDoctors.length === 0) {
      const defaultDoctors = [
        {
          id: 1,
          fullName: "Dr. Omar Hassan",
          email: "omar@clinic.com",
          gender: "male",
          specialty: "Cardiology",
          examinationFee: 500,
          consultationFee: 300
        },
        {
          id: 2,
          fullName: "Dr. Lina Mohamed",
          email: "lina@clinic.com",
          gender: "female",
          specialty: "Dermatology",
          examinationFee: 400,
          consultationFee: 250
        }
      ];
      setDoctors(defaultDoctors);
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(defaultDoctors));
    } else {
      setDoctors(savedDoctors);
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
    setEditingDoctor(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      specialty: "",
      examinationFee: "",
      consultationFee: "",
      biography: ""
    });
    setShowModal(true);
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      fullName: doctor.fullName,
      email: doctor.email,
      phone: doctor.phone || "",
      password: "",
      gender: doctor.gender || "male",
      specialty: doctor.specialty,
      examinationFee: doctor.examinationFee?.toString() || "",
      consultationFee: doctor.consultationFee?.toString() || "",
      biography: doctor.biography || ""
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const updated = doctors.filter((doctor) => doctor.id !== deletingId);
    setDoctors(updated);
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingDoctor) {
      // Update
      const updated = doctors.map((doctor) =>
        doctor.id === editingDoctor.id
          ? {
            ...doctor,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            gender: formData.gender,
            specialty: formData.specialty,
            examinationFee: parseFloat(formData.examinationFee),
            consultationFee: parseFloat(formData.consultationFee),
            biography: formData.biography,
            ...(formData.password && { password: formData.password })
          }
          : doctor
      );
      setDoctors(updated);
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(updated));
    } else {
      // Add new
      const newDoctor = {
        id: Date.now(),
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        gender: formData.gender,
        specialty: formData.specialty,
        examinationFee: parseFloat(formData.examinationFee),
        consultationFee: parseFloat(formData.consultationFee),
        biography: formData.biography
      };
      const updated = [...doctors, newDoctor];
      setDoctors(updated);
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "male",
      specialty: "",
      examinationFee: "",
      consultationFee: "",
      biography: ""
    });
    setEditingDoctor(null);
  };

  // Table columns configuration
  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'fullName', label: 'Name' },
    { key: 'specialty', label: 'Specialty' },
    {
      key: 'fees',
      label: 'Fees',
      render: (_, row) => `Exam: ${row.examinationFee} EGP · Consult: ${row.consultationFee} EGP`
    }
  ];

  // Form fields configuration
  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Dr. Full Name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'doctor@clinic.com' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+20 100 123 4567' },
    { name: 'password', label: 'Password', type: 'password', required: !editingDoctor, placeholder: editingDoctor ? 'Leave empty to keep current' : 'Enter password' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }] },
    { name: 'specialty', label: 'Specialty', type: 'select', required: true, options: SPECIALTIES },
    { name: 'examinationFee', label: 'Examination Fee (EGP)', type: 'number', required: true, min: 0, step: 0.01, placeholder: '500', gridColumn: true },
    { name: 'consultationFee', label: 'Consultation Fee (EGP)', type: 'number', required: true, min: 0, step: 0.01, placeholder: '300', gridColumn: true },
    { name: 'biography', label: 'Biography', type: 'textarea', rows: 4, placeholder: "Doctor's biography and qualifications..." }
  ];

  return (
    <div className="page">
      <PageHeader
        title="Manage Doctors"
        description="Add, edit, or remove doctor accounts."
        action={{
          label: "+ Add Doctor",
          onClick: handleAdd
        }}
      />

      <div className="card">
        <div className="card-header">
          <h3>Doctors</h3>
        </div>

        <DataTable
          columns={columns}
          data={doctors}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No doctors found. Click 'Add Doctor' to create one."
        />
      </div>

      <CRUDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingDoctor ? "Edit Doctor" : "Add Doctor"}
        formFields={formFields}
        formData={formData}
        onChange={handleChange}
        submitLabel={editingDoctor ? "Update" : "Add"}
        isEditing={!!editingDoctor}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Doctor"
        message="Are you sure you want to delete this doctor? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
