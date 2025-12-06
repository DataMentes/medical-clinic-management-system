import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doctorService } from "../api/doctorService";
import { authService } from "../api/authService";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [slots, setSlots] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [newSlot, setNewSlot] = useState({ 
    day: "Mon", 
    startTime: "", 
    endTime: "", 
    capacity: 1,
    roomId: "" 
  });
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [showAppointmentsDetails, setShowAppointmentsDetails] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    time: "",
    patient: "",
    type: "Examination",
    checkedIn: false
  });
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [editAppointment, setEditAppointment] = useState({
    time: "",
    patient: "",
    type: "Examination",
    checkedIn: false
  });
  const [expandedScheduleId, setExpandedScheduleId] = useState(null);
  const [patientsInClinic, setPatientsInClinic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorId, setDoctorId] = useState(null);

  const weekdayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDateForDayLabel = (label) => {
    const today = new Date();
    const todayIndex = today.getDay(); // 0-6, Sun-Sat
    const targetIndex = weekdayOrder.indexOf(label);
    if (targetIndex === -1) return null;
    let diff = targetIndex - todayIndex;
    // دائماً نتحرك للأمام في الأسبوع (القيمة السالبة تعني الأسبوع القادم)
    if (diff < 0) diff += 7;
    const date = new Date(today);
    date.setDate(today.getDate() + diff);
    return date;
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user to get doctorId
        const currentUser = await authService.getCurrentUser();
        const currentDoctorId = currentUser?.doctor?.id;
        setDoctorId(currentDoctorId);

        // Fetch data independently to prevent one failure from breaking everything
        try {
          const dashboardData = await doctorService.getDashboard();
          const formattedAppointments = dashboardData.todayAppointments.map(appt => ({
            id: appt.id,
            time: appt.schedule?.startTime || 'N/A',
            patient: appt.patient?.person?.fullName || 'Unknown',
            reason: appt.appointmentType === 'Examination' ? 'Routine examination' : 'Follow-up consultation',
            type: appt.appointmentType,
            status: appt.status === 'Confirmed' ? 'Scheduled' : appt.status === 'Completed' ? 'Completed' : appt.status
          }));
          setTodayAppointments(formattedAppointments);
        } catch (e) {
          console.error("Dashboard data failed", e);
        }

        try {
          const patientsData = await doctorService.getPatientsInClinic();
          const formattedPatients = patientsData.map(p => ({
            id: p.patient.id,
            appointmentId: p.id,
            name: p.patient?.person?.fullName || 'Unknown',
            reason: p.appointmentType === 'Examination' ? 'Examination' : 'Consultation',
            checkInTime: p.appointmentDate
          }));
          setPatientsInClinic(formattedPatients);
        } catch (e) {
          console.error("Patients data failed", e);
        }

        try {
          const schedules = await doctorService.getMySchedule();
          
          // Weekly Schedule Logic (showing all recurring slots)
          const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          const weekly = days.map(day => {
            const daySchedules = (schedules || []).filter(s => s.weekDay === day);
            if (daySchedules.length > 0) {
              const start = daySchedules.reduce((min, s) => s.startTime < min ? s.startTime : min, "23:59");
              const end = daySchedules.reduce((max, s) => s.endTime > max ? s.endTime : max, "00:00");
              const max = daySchedules.reduce((sum, s) => sum + s.maxCapacity, 0);
              return { day, start, end, max };
            }
            return null;
          }).filter(Boolean);
          
          if (weekly.length > 0) setWeeklySchedule(weekly);

          // Slots Logic
          const formattedSlots = (schedules || []).map(s => ({
            id: s.id,
            day: s.weekDay,
            time: s.startTime,
            capacity: s.maxCapacity,
            roomName: s.room?.roomName || 'N/A'
          }));
          setSlots(formattedSlots);

        } catch (e) {
          console.error("Schedule data failed", e);
        }

        try {
          const rooms = await doctorService.getRooms();
          if (rooms && Array.isArray(rooms)) {
            setRooms(rooms);
            if (rooms.length > 0) {
              setNewSlot(prev => ({ ...prev, roomId: rooms[0].id }));
            }
          }
        } catch (e) {
          console.error("Rooms data failed", e);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Fatal dashboard error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Poll for updates (e.g. new check-ins)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const patientsInClinicData = await doctorService.getPatientsInClinic();
        const formattedPatientsInClinic = patientsInClinicData.data?.map(p => ({
          id: p.patient.id,
          appointmentId: p.id,
          name: p.patient?.person?.fullName || 'Unknown',
          reason: p.appointmentType === 'Examination' ? 'Examination' : 'Consultation',
          checkInTime: p.appointmentDate
        })) || [];
        setPatientsInClinic(formattedPatientsInClinic);
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);


  const handleAddRecord = () => {
    setNewAppointment({
      time: "",
      patient: "",
      type: "Examination",
      checkedIn: false
    });
    setShowAddForm(true);
  };

  const handleAddFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAppointment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    if (!newAppointment.time || !newAppointment.patient) return;

    try {
      // Note: In real app, we need patient ID. Here we might need a search or create flow.
      // For simplicity in this integration step, we'll assume we can't create new patients here easily without ID.
      // But to keep UI working, we will alert.
      alert("To add an appointment, please use the Receptionist Dashboard or ensure Patient ID is available.");
      // Alternatively, we could implement a quick patient create here if needed.
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding appointment", error);
    }
  };

  const handleEditLatest = () => {
    setTodayAppointments((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      setEditingAppointmentId(last.id);
      setEditAppointment({
        time: last.time || "",
        patient: last.patient || "",
        type: last.type || "Examination",
        checkedIn: last.status === "Checked-In"
      });
      setShowEditForm(true);
      return prev;
    });
  };

  const handleEditSelectChange = (e) => {
    const id = Number(e.target.value);
    setEditingAppointmentId(id);
    const selected = todayAppointments.find((a) => a.id === id);
    if (selected) {
      setEditAppointment({
        time: selected.time || "",
        patient: selected.patient || "",
        type: selected.type || "Examination",
        checkedIn: selected.status === "Checked-In"
      });
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditAppointment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingAppointmentId) return;

    try {
      await doctorService.updateAppointment(editingAppointmentId, {
        appointmentTime: editAppointment.time,
        type: editAppointment.type.toUpperCase(),
        status: editAppointment.checkedIn ? 'CHECKED_IN' : 'CONFIRMED'
      });

      // Refresh list
      const dashboardData = await doctorService.getDashboard();
      const formattedAppointments = dashboardData.data?.todayAppointments?.map(appt => ({
        id: appt.id,
        time: appt.schedule?.startTime || 'N/A',
        patient: appt.patient?.person?.fullName || 'Unknown',
        reason: appt.appointmentType === 'Examination' ? 'Routine examination' : 'Follow-up consultation',
        type: appt.appointmentType,
        status: appt.status === 'Confirmed' ? 'Scheduled' : appt.status === 'Completed' ? 'Completed' : appt.status
      })) || [];
      setTodayAppointments(formattedAppointments);

      setShowEditForm(false);
    } catch (error) {
      alert("Failed to update appointment");
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.roomId) {
        alert("Please fill in all fields including Room");
        return;
    }

    try {
      // Use doctor's own schedule endpoint
      await doctorService.addSchedule({
        roomId: Number(newSlot.roomId),
        weekDay: newSlot.day,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        maxCapacity: newSlot.capacity
      });
      
      alert("Schedule added successfully!");

      // Refresh slots
      const schedulesData = await doctorService.getMySchedule();
      const schedules = schedulesData.data || [];
      const formattedSlots = schedules.map(s => ({
        id: s.id,
        day: s.weekDay,
        time: s.startTime,
        capacity: s.maxCapacity,
        roomName: s.room?.roomName || 'N/A'
      }));
      setSlots(formattedSlots);

      setNewSlot(prev => ({ ...prev, startTime: "", endTime: "", capacity: 1 }));
    } catch (error) {
      console.error("Failed to add slot:", error);
      alert("Failed to add slot: " + (error.response?.data?.error || error.message));
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await doctorService.deleteSchedule(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      alert("Failed to delete slot: " + (error.message || 'Unknown error'));
    }
  };

  const handleChangePassword = () => {
    setPasswordChanging(true);
    setTimeout(() => {
      alert("OTP sent to your email to change password (demo).");
      setPasswordChanging(false);
    }, 500);
  };

  const todayDate = new Date();
  const todayShort = todayDate.toLocaleString("en-US", { weekday: "short" });
  const todayPrettyDate = todayDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Safe access to weeklySchedule
  const todaySchedule = weeklySchedule.find(
    (entry) =>
      entry.day.toLowerCase().startsWith(todayShort.slice(0, 3).toLowerCase())
  );
  const maxPatientsToday = todaySchedule ? todaySchedule.max : todayAppointments.length || 1;
  const checkedInCount = todayAppointments.filter(
    (appt) => appt.status === "Checked-In"
  ).length;

  const getAppointmentsForSchedule = (schedule) => {
    // This logic filters today's appointments that fall into this schedule slot
    // Since we only have today's appointments in state, we can only show for today
    // For future days, we'd need to fetch appointments for that range.
    // For now, we'll keep it simple and only show for today if the schedule matches today

    const isToday = schedule.day === todayShort;
    if (!isToday) return [];

    return todayAppointments.filter((appt) => {
      if (!appt.time) return false;
      return appt.time >= schedule.start && appt.time <= schedule.end;
    });
  };

  const todayISO = todayDate.toISOString().split("T")[0];
  const maxRangeDate = new Date(todayDate);
  maxRangeDate.setDate(maxRangeDate.getDate() + 7);

  const visibleSchedules = weeklySchedule
    .map((d, index) => {
      const dateObj = getDateForDayLabel(d.day);
      return { ...d, index, dateObj };
    })
    .filter(
      (item) =>
        item.dateObj &&
        item.dateObj.toISOString().split("T")[0] !== todayISO && // نبدأ من بعد النهارده
        item.dateObj > todayDate &&
        item.dateObj <= maxRangeDate
    )
    .sort((a, b) => a.dateObj - b.dateObj);

  if (loading) return <div className="page"><p>Loading...</p></div>;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Doctor Dashboard</h1>
        <p>Overview of today, weekly schedule, and clinic activity.</p>
      </header>

      <section className="grid-2">
        {/* Today's Appointments */}
        <div className="card" style={{ cursor: "pointer" }}>
          <div
            className="card-header"
            style={{ alignItems: "flex-start" }}
            onClick={() => setShowAppointmentsDetails((prev) => !prev)}
          >
            <div>
              <h3>Today's Appointments</h3>
              <span className="muted">{todayPrettyDate}</span>
              <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Tap to {showAppointmentsDetails ? "hide" : "show"} patient list
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>
                {todayAppointments.length} / {maxPatientsToday}
              </div>
              <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                Today's capacity
              </p>
              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                Checked-in: {checkedInCount}
              </p>
            </div>
          </div>

          {showAppointmentsDetails && (
            <>
              <ul className="list" style={{ marginTop: "1rem" }}>
                {todayAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((a) => (
                    <li key={a.id} className="list-item">
                      <div>
                        <div className="list-title" style={{ display: "flex", gap: "0.75rem" }}>
                          <span style={{ fontWeight: 600 }}>{a.time}</span>
                          <span>{a.patient}</span>
                        </div>
                        <div className="list-subtitle" style={{ display: "flex", gap: "0.5rem" }}>
                          <span>{a.type}</span>
                          <span>•</span>
                          <span>{a.reason}</span>
                        </div>
                      </div>
                      <span
                        className="pill"
                        style={{
                          background:
                            a.status === "Checked-In"
                              ? "rgba(34, 197, 94, 0.2)"
                              : "var(--accent-soft)",
                          color: a.status === "Checked-In" ? "#22c55e" : "#e0edff"
                        }}
                      >
                        {a.status === "Checked-In" ? "Checked-In" : "Waiting"}
                      </span>
                    </li>
                  ))}
                {todayAppointments.length === 0 && (
                  <li className="list-empty">No appointments for today.</li>
                )}
              </ul>
            </>
          )}
        </div>

        {/* Weekly Schedule (by date with per-slot patients) */}
        <div className="card">
          <h3>Weekly Schedule</h3>
          <ul className="list">
            {weeklySchedule.length > 0 ? weeklySchedule.map((d, index) => {
              const label = d.day;
              // Simple check if this is today
              const todayDay = new Date().toLocaleString("en-US", { weekday: "short" });
              const isToday = label === todayDay;
              
              // We'll show today's appointments if it matches
              const slotAppointments = isToday ? todayAppointments : [];
              const isExpanded = expandedScheduleId === index;

              return (
                <li
                  key={d.day}
                  className="list-item"
                  style={{ cursor: "pointer", flexDirection: "column", alignItems: "stretch" }}
                  onClick={() =>
                    setExpandedScheduleId((prev) =>
                      prev === index ? null : index
                    )
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%"
                    }}
                  >
                    <div>
                      <div className="list-title">
                        {label} {isToday && <span className="pill pill-success" style={{fontSize: '0.7em', marginLeft: '8px'}}>Today</span>}
                      </div>
                      <div className="list-subtitle">
                        {d.start} – {d.end} · Max {d.max} slots
                      </div>
                    </div>
                    {isToday && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600 }}>
                        {slotAppointments.length} patients
                      </div>
                    </div>
                    )}
                  </div>

                  {isToday && isExpanded && (
                    <>
                      {slotAppointments.length === 0 ? (
                        <p
                          className="muted"
                          style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}
                        >
                          No patients booked yet.
                        </p>
                      ) : (
                        <ul
                          className="list"
                          style={{
                            marginTop: "0.75rem",
                            background: "var(--bg-soft)",
                            borderRadius: "12px",
                            padding: "0.5rem 0.75rem"
                          }}
                        >
                          {slotAppointments
                            .slice()
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((appt) => (
                              <li
                                key={appt.id}
                                className="list-item"
                                style={{ borderBottom: "1px solid transparent" }}
                              >
                                <div>
                                  <div className="list-title">
                                    {appt.time} · {appt.patient}
                                  </div>
                                  <div className="list-subtitle">
                                    {appt.type} · {appt.reason}
                                  </div>
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            }) : (
              <p className="muted" style={{padding: '1rem', textAlign: 'center'}}>No weekly schedule set.</p>
            )}
          </ul>
        </div>
      </section>

      {/* Manage Time Slots & Patients Inside Clinic */}
      <section className="grid-2">
        <div className="card">
          <h3>Manage Time Slots</h3>
          <form className="form" onSubmit={handleAddSlot}>
            <div className="form-grid-2">
              <label className="field">
                <span>Day</span>
                <select
                  value={newSlot.day}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, day: e.target.value })
                  }
                >
                  <option>Day</option>
                  <option>Sat</option>
                  <option>Sun</option>
                  <option>Mon</option>
                  <option>Tue</option>
                  <option>Wed</option>
                  <option>Thu</option>
                  <option>Fri</option>

                </select>
              </label>
              <label className="field">
                <span>Start Time</span>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span>End Time</span>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                  required
                />
              </label>

            </div>
            
            <label className="field">
              <span>Room</span>
              <select
                value={newSlot.roomId}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, roomId: e.target.value })
                }
                required
              >
                <option value="" disabled>Select Room</option>
                {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                        {room.roomName}
                    </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Max capacity</span>
              <input
                type="number"
                min={1}
                max={20}
                value={newSlot.capacity}
                onChange={(e) =>
                  setNewSlot({
                    ...newSlot,
                    capacity: Number(e.target.value)
                  })
                }
              />
            </label>
            <button className="btn-primary" type="submit">
              Add New Slot
            </button>
          </form>

          <ul className="list" style={{ marginTop: "1rem" }}>
            {slots.map((s) => (
              <li key={s.id} className="list-item">
                <div className="list-title">
                  {s.day} · {s.time}
                </div>
                <div className="list-subtitle">Room: {s.roomName} · Capacity: {s.capacity}</div>
                <button
                  type="button"
                  className="pill pill-danger"
                  onClick={() => handleDeleteSlot(s.id)}
                >
                  Delete
                </button>
              </li>
            ))}
            {slots.length === 0 && (
              <li className="list-empty">No time slots defined.</li>
            )}
          </ul>
        </div>

        <div className="card">
          <h3>Patients Inside Clinic Now</h3>
          <ul className="list">
            {patientsInClinic.map((p) => (
              <li key={p.id || p.appointmentId} className="list-item">
                <div>
                  <div className="list-title">{p.name}</div>
                  <div className="list-subtitle">{p.reason}</div>
                  {p.checkInTime && (
                    <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      Checked in: {new Date(p.checkInTime).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                      navigate("/doctor-medical-record", { state: { patient: p } })
                    }
                  >
                    Open Medical Record
                  </button>
                  <button
                    type="button"
                    className="pill pill-danger"
                    onClick={() => {
                      // In real app, this would be a "Check Out" API call
                      alert("Check out functionality to be implemented");
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
            {patientsInClinic.length === 0 && (
              <li className="list-empty">No checked-in patients.</li>
            )}
          </ul>
        </div>
      </section>

      {/* Modal: Add new appointment (record) */}
      {showAddForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={() => setShowAddForm(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "480px",
              width: "100%",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form className="form" onSubmit={handleAddFormSubmit}>
              <h2>Add Appointment</h2>
              <label className="field">
                <span>Time</span>
                <input
                  type="time"
                  name="time"
                  value={newAppointment.time}
                  onChange={handleAddFormChange}
                  required
                />
              </label>
              <label className="field">
                <span>Patient Name</span>
                <input
                  type="text"
                  name="patient"
                  value={newAppointment.patient}
                  onChange={handleAddFormChange}
                  placeholder="Patient full name"
                  required
                />
              </label>
              <label className="field">
                <span>Visit Type</span>
                <select
                  name="type"
                  value={newAppointment.type}
                  onChange={handleAddFormChange}
                >
                  <option value="Examination">Examination</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </label>
              <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  name="checkedIn"
                  checked={newAppointment.checkedIn}
                  onChange={handleAddFormChange}
                  style={{ width: "auto" }}
                />
                <span>Marked as checked-in</span>
              </label>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit existing appointment (record) */}
      {showEditForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }}
          onClick={() => setShowEditForm(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "480px",
              width: "100%",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form className="form" onSubmit={handleEditFormSubmit}>
              <h2>Edit Appointment</h2>

              <label className="field">
                <span>Select Appointment to Edit</span>
                <select
                  value={editingAppointmentId || ""}
                  onChange={handleEditSelectChange}
                  required
                >
                  <option value="" disabled>
                    Choose appointment
                  </option>
                  {todayAppointments
                    .slice()
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.time} - {a.patient}
                      </option>
                    ))}
                </select>
              </label>

              <label className="field">
                <span>Time</span>
                <input
                  type="time"
                  name="time"
                  value={editAppointment.time}
                  onChange={handleEditFormChange}
                  required
                />
              </label>
              <label className="field">
                <span>Patient Name</span>
                <input
                  type="text"
                  name="patient"
                  value={editAppointment.patient}
                  onChange={handleEditFormChange}
                  placeholder="Patient full name"
                  required
                />
              </label>
              <label className="field">
                <span>Visit Type</span>
                <select
                  name="type"
                  value={editAppointment.type}
                  onChange={handleEditFormChange}
                >
                  <option value="Examination">Examination</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </label>
              <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  name="checkedIn"
                  checked={editAppointment.checkedIn}
                  onChange={handleEditFormChange}
                  style={{ width: "auto" }}
                />
                <span>Marked as checked-in</span>
              </label>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
