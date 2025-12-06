import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const APPOINTMENTS_KEY = "adminAppointmentsData";
const PATIENTS_KEY = "adminPatientsData";
const DOCTORS_KEY = "doctorsData";
const SCHEDULES_KEY = "schedulesData";

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    scheduleId: "",
    type: "",
    status: "",
    feePaid: "",
    bookingTime: ""
  });

  // Load reference data
  useEffect(() => {
    const savedPatients = JSON.parse(localStorage.getItem(PATIENTS_KEY) || "[]");
    setPatients(savedPatients);

    const savedDoctors = JSON.parse(localStorage.getItem(DOCTORS_KEY) || "[]");
    setDoctors(savedDoctors);

    const savedSchedules = JSON.parse(localStorage.getItem(SCHEDULES_KEY) || "[]");
    setSchedules(savedSchedules);
  }, []);

  // Load appointments
  useEffect(() => {
    const savedAppointments = JSON.parse(
      localStorage.getItem(APPOINTMENTS_KEY) || "[]"
    );
    if (savedAppointments.length === 0) {
      const defaultAppointments = [
        {
          id: 1,
          patientId: 1,
          doctorId: 1,
          scheduleId: 1,
          type: "Examination",
          status: "Confirmed",
          feePaid: 500,
          bookingTime: "2025-01-15T10:30:00"
        },
        {
          id: 2,
          patientId: 2,
          doctorId: 2,
          scheduleId: 2,
          type: "Consultation",
          status: "Pending",
          feePaid: 250,
          bookingTime: "2025-01-16T14:00:00"
        }
      ];
      setAppointments(defaultAppointments);
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(defaultAppointments));
    } else {
      setAppointments(savedAppointments);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      scheduleId: appointment.scheduleId.toString(),
      type: appointment.type,
      status: appointment.status,
      feePaid: appointment.feePaid.toString(),
      bookingTime: appointment.bookingTime
        ? new Date(appointment.bookingTime).toISOString().slice(0, 16)
        : ""
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const updated = appointments.filter((appt) => appt.id !== deletingId);
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingAppointment) {
      const updated = appointments.map((appointment) =>
        appointment.id === editingAppointment.id
          ? {
            ...appointment,
            patientId: parseInt(formData.patientId),
            doctorId: parseInt(formData.doctorId),
            scheduleId: parseInt(formData.scheduleId),
            type: formData.type,
            status: formData.status,
            feePaid: parseFloat(formData.feePaid),
            bookingTime: new Date(formData.bookingTime).toISOString()
          }
          : appointment
      );
      setAppointments(updated);
      localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setFormData({
      patientId: "",
      doctorId: "",
      scheduleId: "",
      type: "",
      status: "",
      feePaid: "",
      bookingTime: ""
    });
    setEditingAppointment(null);
  };

  // Helper functions
  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.fullName : "Unknown";
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.fullName : "Unknown";
  };

  const getScheduleInfo = (scheduleId) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      return `${schedule.day} · ${schedule.startTime} - ${schedule.endTime}`;
    }
    return "Unknown";
  };

  const getStatusPill = (status) => {
    const styles = {
      Confirmed: { bg: "var(--accent-soft)", color: "#e0edff" },
      Pending: { bg: "rgba(255, 193, 7, 0.2)", color: "#ffc107" },
      Cancelled: { bg: "rgba(239, 68, 68, 0.2)", color: "#ef4444" },
      Completed: { bg: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }
    };
    const style = styles[status] || styles.Pending;
    return (
      <span
        className="pill"
        style={{
          background: style.bg,
          color: style.color
        }}
      >
        {status}
      </span>
    );
  };

  // Table columns configuration
  const columns = [
    { key: 'id', label: 'Appointment ID', render: (value) => `#${value}` },
    { key: 'patientName', label: 'Patient', render: (_, row) => getPatientName(row.patientId) },
    { key: 'doctorName', label: 'Doctor', render: (_, row) => getDoctorName(row.doctorId) },
    { key: 'schedule', label: 'Schedule', render: (_, row) => getScheduleInfo(row.scheduleId) },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', render: (_, row) => getStatusPill(row.status) },
    { key: 'feePaid', label: 'Fee Paid', render: (value) => `${value} EGP` },
    { key: 'bookingTime', label: 'Booking Time', render: (value) => value ? new Date(value).toLocaleString() : 'N/A' }
  ];

  // Form fields configuration  
  const formFields = [
    {
      name: 'patientId',
      label: 'Patient',
      type: 'select',
      required: true,
      options: patients.map(p => ({ value: p.id, label: p.fullName }))
    },
    {
      name: 'doctorId',
      label: 'Doctor',
      type: 'select',
      required: true,
      options: doctors.map(d => ({ value: d.id, label: d.fullName }))
    },
    {
      name: 'scheduleId',
      label: 'Schedule',
      type: 'select',
      required: true,
      options: schedules.map(s => ({
        value: s.id,
        label: `${getScheduleInfo(s.id)} - ${getDoctorName(s.doctorId)}`
      }))
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      required: true,
      options: ['Examination', 'Consultation']
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: ['Confirmed', 'Pending', 'Cancelled', 'Completed']
    },
    { name: 'feePaid', label: 'Fee Paid (EGP)', type: 'number', required: true, min: 0, step: 0.01, placeholder: '500' },
    { name: 'bookingTime', label: 'Booking Time', type: 'datetime-local', required: true }
  ];

  return (
    <div className="page">
      <PageHeader
        title="Manage Appointments"
        description="View, edit, or remove appointments."
      />

      <div className="card">
        <div className="card-header">
          <h3>Appointments</h3>
        </div>

        <DataTable
          columns={columns}
          data={appointments}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No appointments found."
        />
      </div>

      <CRUDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title="Edit Appointment"
        formFields={formFields}
        formData={formData}
        onChange={handleChange}
        submitLabel="Update"
        isEditing={true}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
