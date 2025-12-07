import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { getAllSchedules, createSchedule, updateSchedule, deleteSchedule, getAllDoctors, getAllRooms } from "../api/admin.api.js";
import { transformSchedulesFromAPI, transformScheduleToAPI } from "../utils/scheduleTransform.js";
import { WEEKDAY_OPTIONS } from "../constants/schedules.js";

export default function ManageSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: "",
    roomId: "",
    day: "",
    startTime: "",
    endTime: "",
    maxCapacity: ""
  });

  // Load schedules from API
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Load doctors and rooms from API
  useEffect(() => {
    fetchDoctorsAndRooms();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllSchedules(1, 100); // Get all schedules
      
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        console.log('Raw schedules from API:', response.data.schedules);
        
        // Transform API data to frontend format
        const transformedSchedules = transformSchedulesFromAPI(response.data.schedules);
        
        console.log('Transformed schedules:', transformedSchedules);
        
        setSchedules(transformedSchedules);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError(err.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorsAndRooms = async () => {
    try {
      const [doctorsResponse, roomsResponse] = await Promise.all([
        getAllDoctors(1, 100),
        getAllRooms(1, 100)
      ]);

      if (doctorsResponse.success && doctorsResponse.data) {
        setDoctors(doctorsResponse.data.doctors);
      }

      if (roomsResponse.success && roomsResponse.data) {
        setRooms(roomsResponse.data.rooms);
      }
    } catch (err) {
      console.error('Error fetching doctors/rooms:', err);
    }
  };

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

  const handleDeleteConfirm = async () => {
    try {
      await deleteSchedule(deletingId);
      
      // Refresh schedules after deletion
      await fetchSchedules();
      
      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert(err.message || 'Failed to delete schedule');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Transform form data to API format (day → weekDay, add seconds to time)
      const apiData = transformScheduleToAPI(formData);
      
      if (editingSchedule) {
        // Update existing schedule
        await updateSchedule(editingSchedule.id, apiData);
      } else {
        // Create new schedule
        await createSchedule(apiData);
      }
      
      // Refresh schedules after save
      await fetchSchedules();
      
      // Close modal and reset form
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
    } catch (err) {
      console.error('Error saving schedule:', err);
      
      // Show user-friendly error messages in English
      let errorMessage = err.message || 'Failed to save schedule';
      
      // Check for specific error types
      if (errorMessage.includes('already has a schedule for this day')) {
        errorMessage = 'This doctor already has a schedule for this day. Please choose another day or edit the existing schedule.';
      } else if (errorMessage.includes('Unique constraint')) {
        errorMessage = 'This doctor already has a schedule for this day. You cannot add multiple schedules for the same doctor on the same day.';
      } else if (errorMessage.includes('startTime must be before endTime')) {
        errorMessage = 'Start time must be before end time.';
      } else if (errorMessage.includes('Invalid weekDay')) {
        errorMessage = 'Invalid day selected. Please choose a day from the list.';
      } else if (errorMessage.includes('maxCapacity')) {
        errorMessage = 'Max capacity must be a positive number.';
      }
      
      alert(errorMessage);
    }
  };

  // Table columns configuration
  const columns = [
    { key: 'doctorName', label: 'Doctor Name' },
    { key: 'roomName', label: 'Room Name' },
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
      options: rooms.map(r => ({ value: r.id, label: r.roomName }))
    },
    {
      name: 'day',
      label: 'Day',
      type: 'select',
      required: true,
      options: WEEKDAY_OPTIONS  // Uses full day names from constants
    },
    { name: 'startTime', label: 'Start Time', type: 'time', required: true, gridColumn: true },
    { name: 'endTime', label: 'End Time', type: 'time', required: true, gridColumn: true },
    { name: 'maxCapacity', label: 'Max Capacity', type: 'number', required: true, min: 1, placeholder: '10' }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Schedules"
          description="Add, edit, or remove doctor schedules."
        />
        <div className="card">
          <div className="card-header">
            <h3>Loading schedules...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Schedules"
          description="Add, edit, or remove doctor schedules."
        />
        <div className="card">
          <div className="card-header">
            <h3>Error: {error}</h3>
            <button onClick={fetchSchedules} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
