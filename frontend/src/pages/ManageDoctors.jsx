import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { 
  getAllDoctors, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor 
} from "../api/admin.api.js";
import { getAllSpecialties } from "../api/admin.api.js";

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    gender: "Male",
    specialtyId: "",
    examinationFee: "",
    consultationFee: "",
    biography: ""
  });

  useEffect(() => {
    fetchDoctorsAndSpecialties();
  }, []);

  async function fetchDoctorsAndSpecialties() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both doctors and specialties in parallel
      const [doctorsResponse, specialtiesResponse] = await Promise.all([
        getAllDoctors(),
        getAllSpecialties(1, 100) // Get all specialties (up to 100)
      ]);
      
      // Safety checks for null/undefined data
      if (doctorsResponse && doctorsResponse.data && doctorsResponse.data.doctors) {
        setDoctors(doctorsResponse.data.doctors);
      } else {
        console.warn('No doctors data received:', doctorsResponse);
        setDoctors([]);
      }
      
      if (specialtiesResponse && specialtiesResponse.data && specialtiesResponse.data.specialties) {
        setSpecialties(specialtiesResponse.data.specialties);
      } else {
        console.warn('No specialties data received:', specialtiesResponse);
        setSpecialties([]);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || 'Failed to load doctors');
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
    setEditingDoctor(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "Male",
      specialtyId: "",
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
      phone: doctor.phoneNumber || "",
      password: "",
      gender: doctor.gender || "Male",
      specialtyId: doctor.specialtyId?.toString() || "", // Use specialtyId directly from backend
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

  const handleDeleteConfirm = async () => {
    try {
      await deleteDoctor(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
      await fetchDoctorsAndSpecialties();
    } catch (err) {
      console.error('Failed to delete doctor:', err);
      alert(err.message || 'Failed to delete doctor');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDoctor) {
        // Update existing doctor
        await updateDoctor(editingDoctor.id, formData);
      } else {
        // Create new doctor
        await createDoctor(formData);
      }

      setShowModal(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        gender: "Male",
        specialtyId: "",
        examinationFee: "",
        consultationFee: "",
        biography: ""
      });
      setEditingDoctor(null);
      
      await fetchDoctorsAndSpecialties();
    } catch (err) {
      console.error('Failed to save doctor:', err);
      alert(err.message || 'Failed to save doctor');
    }
  };

  // Table columns configuration
  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'fullName', label: 'Name' },
    { key: 'specialty', label: 'Specialty' },
    {
      key: 'fees',
      label: 'Fees',
      render: (_, row) => `Exam: ${row.examinationFee || 0} EGP · Consult: ${row.consultationFee || 0} EGP`
    }
  ];

  // Form fields configuration
  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'Dr. Full Name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'doctor@clinic.com' },
    { name: 'phone', label: 'Phone', type: 'tel', required: true, placeholder: '+20 100 123 4567' },
    { name: 'password', label: 'Password', type: 'password', required: !editingDoctor, placeholder: editingDoctor ? 'Leave empty to keep current' : 'Enter password' },
    { name: 'gender', label: 'Gender', type: 'select', required: true, options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }] },
    { 
      name: 'specialtyId', 
      label: 'Specialty', 
      type: 'select', 
      required: true, 
      options: specialties.map(s => ({ value: s.id.toString(), label: s.name }))
    },
    { name: 'examinationFee', label: 'Examination Fee (EGP)', type: 'number', required: true, min: 0, step: 0.01, placeholder: '500', gridColumn: true },
    { name: 'consultationFee', label: 'Consultation Fee (EGP)', type: 'number', required: true, min: 0, step: 0.01, placeholder: '300', gridColumn: true },
    { name: 'biography', label: 'Biography', type: 'textarea', rows: 4, placeholder: "Doctor's biography and qualifications..." }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Doctors"
          description="Add, edit, or remove doctor accounts."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Doctors"
          description="Add, edit, or remove doctor accounts."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <p>⚠️ {error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchDoctorsAndSpecialties}
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
