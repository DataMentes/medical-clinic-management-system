import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const SCHEDULES_KEY = "schedulesData";
const DOCTORS_KEY = "doctorsData";
const ROOMS_KEY = "roomsData";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: "",
    roomId: "",
    day: "",
    startTime: "",
    endTime: "",
    maxCapacity: ""
  });

  // Load doctors and rooms
  useEffect(() => {
    const savedDoctors = JSON.parse(localStorage.getItem(DOCTORS_KEY) || "[]");
    setDoctors(savedDoctors);

    const savedRooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || "[]");
    if (savedRooms.length === 0) {
      const defaultRooms = [
        { id: 1, roomName: "Room 101" },
        { id: 2, roomName: "Room 102" },
        { id: 3, roomName: "Room 201" },
        { id: 4, roomName: "Room 202" }
      ];
      setRooms(defaultRooms);
      localStorage.setItem(ROOMS_KEY, JSON.stringify(defaultRooms));
    } else {
      setRooms(savedRooms);
    }
  }, []);

  // Load schedules
  useEffect(() => {
    const savedSchedules = JSON.parse(localStorage.getItem(SCHEDULES_KEY) || "[]");
    if (savedSchedules.length === 0) {
      const defaultSchedules = [
        {
          id: 1,
          doctorId: 1,
          roomId: 1,
          day: "Monday",
          startTime: "09:00",
          endTime: "12:00",
          maxCapacity: 10
        },
        {
          id: 2,
          doctorId: 2,
          roomId: 2,
          day: "Tuesday",
          startTime: "10:00",
          endTime: "14:00",
          maxCapacity: 8
        }
      ];
      setSchedules(defaultSchedules);
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(defaultSchedules));
    } else {
      setSchedules(savedSchedules);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    setFormData({
      doctorId: "",
      roomId: "",
      day: "",
      startTime: "",
      endTime: "",
      maxCapacity: ""
    });
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      doctorId: schedule.doctorId.toString(),
      roomId: schedule.roomId.toString(),
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxCapacity: schedule.maxCapacity.toString()
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    const updated = schedules.filter((schedule) => schedule.id !== deletingId);
    setSchedules(updated);
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingSchedule) {
      const updated = schedules.map((schedule) =>
        schedule.id === editingSchedule.id
          ? {
            ...schedule,
            doctorId: parseInt(formData.doctorId),
            roomId: parseInt(formData.roomId),
            day: formData.day,
            startTime: formData.startTime,
            endTime: formData.endTime,
            maxCapacity: parseInt(formData.maxCapacity)
          }
          : schedule
      );
      setSchedules(updated);
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updated));
    } else {
      const newSchedule = {
        id: Date.now(),
        doctorId: parseInt(formData.doctorId),
        roomId: parseInt(formData.roomId),
        day: formData.day,
        startTime: formData.startTime,
        endTime: formData.endTime,
        maxCapacity: parseInt(formData.maxCapacity)
      };
      const updated = [...schedules, newSchedule];
      setSchedules(updated);
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setFormData({
      doctorId: "",
      roomId: "",
      day: "",
      startTime: "",
      endTime: "",
      maxCapacity: ""
    });
    setEditingSchedule(null);
  };

  // Helper functions
  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? doctor.fullName : "Unknown";
  };

  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? (room.roomName || room.name) : "Unknown";
  };

  // Table columns configuration
  const columns = [
    { key: 'doctorName', label: 'Doctor Name', render: (_, row) => getDoctorName(row.doctorId) },
    { key: 'roomName', label: 'Room Name', render: (_, row) => getRoomName(row.roomId) },
    { key: 'day', label: 'Day' },
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'maxCapacity', label: 'Max Capacity' }
  ];

  // Form fields configuration
  const formFields = [
    {
      name: 'doctorId',
      label: 'Doctor',
      type: 'select',
      required: true,
      options: doctors.map(d => ({ value: d.id, label: d.fullName }))
    },
    {
      name: 'roomId',
      label: 'Room',
      type: 'select',
      required: true,
      options: rooms.map(r => ({ value: r.id, label: r.roomName || r.name }))
    },
    {
      name: 'day',
      label: 'Day',
      type: 'select',
      required: true,
      options: DAYS
    },
    { name: 'startTime', label: 'Start Time', type: 'time', required: true, gridColumn: true },
    { name: 'endTime', label: 'End Time', type: 'time', required: true, gridColumn: true },
    { name: 'maxCapacity', label: 'Max Capacity', type: 'number', required: true, min: 1, placeholder: '10' }
  ];

  return (
    <div className="page">
      <PageHeader
        title="Manage Schedules"
        description="Add, edit, or remove doctor schedules."
        action={{
          label: "+ Add Schedule",
          onClick: handleAdd
        }}
      />

      <div className="card">
        <div className="card-header">
          <h3>Schedules</h3>
        </div>

        <DataTable
          columns={columns}
          data={schedules}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No schedules found. Click 'Add Schedule' to create one."
        />
      </div>

      <CRUDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingSchedule ? "Edit Schedule" : "Add Schedule"}
        formFields={formFields}
        formData={formData}
        onChange={handleChange}
        submitLabel={editingSchedule ? "Update" : "Add"}
        isEditing={!!editingSchedule}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
