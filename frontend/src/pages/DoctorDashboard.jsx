import { useEffect, useState } from "react";
import MedicalRecordEditorModal from "../components/MedicalRecordEditorModal.jsx";
import * as doctorApi from "../api/doctor.api";

const DOCTOR_APPOINTMENTS_KEY = "doctorAppointments";
const PATIENTS_IN_CLINIC_KEY = "patientsInClinicNow";
const APPOINTMENTS_KEY = "adminAppointmentsData";
const DOCTORS_KEY = "doctorsData";

  const initialTodayAppointments = [
    {
      id: 1,
      time: "09:00",
      patient: "Sarah Ahmed",
      reason: "Routine examination",
      type: "Examination",
      status: "Scheduled"
    },
    {
      id: 2,
      time: "10:30",
      patient: "Mohamed Ali",
      reason: "Follow-up consultation",
      type: "Consultation",
      status: "Scheduled"
    }
  ];

const initialWeeklySchedule = [
  { day: "Mon", start: "09:00", end: "15:00", max: 12 },
  { day: "Tue", start: "10:00", end: "16:00", max: 10 },
  { day: "Wed", start: "09:00", end: "14:00", max: 8 },
  { day: "Thu", start: "11:00", end: "17:00", max: 10 },
  { day: "Fri", start: "09:00", end: "13:00", max: 6 }
];

const mockRooms = [
  { id: 1, roomName: "Room 101" },
  { id: 2, roomName: "Room 102" },
  { id: 3, roomName: "Room 201" },
  { id: 4, roomName: "Room 202" }
];

const initialSlots = [
  { id: 1, day: "Mon", startTime: "09:00", endTime: "12:00", roomId: 1, capacity: 4 },
  { id: 2, day: "Mon", startTime: "13:00", endTime: "16:00", roomId: 2, capacity: 4 },
  { id: 3, day: "Tue", startTime: "11:00", endTime: "14:00", roomId: 1, capacity: 3 }
];

export default function DoctorDashboard() {
  const [todayAppointments, setTodayAppointments] = useState(
    initialTodayAppointments
  );
  const [weeklySchedule] = useState(initialWeeklySchedule);
  const [slots, setSlots] = useState(initialSlots);
  const [rooms] = useState(mockRooms);
  const [newSlot, setNewSlot] = useState({ day: "Mon", startTime: "", endTime: "", roomId: "", capacity: 1 });
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
  const [currentDoctorId, setCurrentDoctorId] = useState(null);

  // Modal state for medical record editor
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

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

  const normalizeAppointments = (list) =>
    list.map((appt) => {
      const derivedType =
        appt.type ||
        (appt.reason?.toLowerCase().includes("consult")
          ? "Consultation"
          : "Examination");
      return {
        ...appt,
        type: derivedType,
        status: appt.status || "Scheduled"
      };
    });

  // تحميل مواعيد الدكتور المحجوزة من المرضى
  useEffect(() => {
    // Log current doctor info
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('👨‍⚕️ ========== LOGGED IN DOCTOR ==========');
        console.log('User ID:', payload.userId);
        console.log('Doctor ID:', payload.doctorId);
        console.log('Email:', payload.email);
        console.log('Role:', payload.role);
        console.log('========================================');
      } catch (e) {
        console.error('Failed to parse token');
      }
    }

    // Fetch today's appointments from API
    async function fetchAppointments() {
      try {
        const response = await doctorApi.getTodayAppointments();
        console.log('✅ API Response:', response);
        if (response.data && Array.isArray(response.data)) {
          console.log('📅 Appointments fetched:', response.data.length);
          const formatted = response.data.map(apt => {
            // Format time from DateTime string (e.g., "1970-01-01T09:00:00.000Z" -> "09:00")
            let timeStr = '00:00';
            if (apt.schedule?.startTime) {
              const timeObj = new Date(apt.schedule.startTime);
              timeStr = timeObj.toISOString().substring(11, 16);
            }
            
            return {
              id: apt.id,
              time: timeStr,
              patient: apt.patient?.person?.fullName || 'Unknown',
              reason: apt.appointmentType || 'Appointment',
              type: apt.appointmentType || 'Examination',
              status: apt.status || 'Pending'
            };
          });
          console.log('📋 Formatted appointments:', formatted);
          setTodayAppointments(formatted);
        }
      } catch (error) {
        console.error('❌ Error fetching appointments:', error);
      }
    }

    fetchAppointments();
  }, []);

  // تحديث قائمة المرضى داخل العيادة
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(PATIENTS_IN_CLINIC_KEY) || "[]");

    // Add mock data if empty for testing
    if (stored.length === 0) {
      const mockPatientsInClinic = [
        {
          id: 1,
          appointmentId: 101,
          name: "Ahmed Mohamed",
          reason: "Regular Checkup",
          checkInTime: new Date().toISOString(),
          doctorId: 1,
          medicalHistory: [
            {
              id: 1,
              date: "2025-11-20",
              diagnosis: "Hypertension",
              prescription: "Amlodipine 5mg daily",
              notes: "Monitor blood pressure weekly"
            },
            {
              id: 2,
              date: "2025-10-15",
              diagnosis: "Common Cold",
              prescription: "Paracetamol 500mg as needed",
              notes: "Rest and fluids"
            }
          ]
        },
        {
          id: 2,
          appointmentId: 102,
          name: "Sara Ali",
          reason: "Follow-up",
          checkInTime: new Date(Date.now() - 30 * 60000).toISOString(),
          doctorId: 1,
          medicalHistory: [
            {
              id: 3,
              date: "2025-11-15",
              diagnosis: "Diabetes Type 2",
              prescription: "Metformin 500mg twice daily",
              notes: "Follow-up in 2 weeks"
            }
          ]
        },
        {
          id: 3,
          appointmentId: 103,
          name: "Mohamed Hassan",
          reason: "Consultation",
          checkInTime: new Date(Date.now() - 15 * 60000).toISOString(),
          doctorId: 1,
          medicalHistory: []
        }
      ];
      localStorage.setItem(PATIENTS_IN_CLINIC_KEY, JSON.stringify(mockPatientsInClinic));
      setPatientsInClinic(mockPatientsInClinic.filter((p) => p.doctorId === currentDoctorId || !currentDoctorId));
    } else {
      setPatientsInClinic(stored.filter((p) => p.doctorId === currentDoctorId || !currentDoctorId));
    }
  }, [currentDoctorId]);

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

  const handleAddFormSubmit = (e) => {
    e.preventDefault();
    if (!newAppointment.time || !newAppointment.patient) return;

    const id = Date.now();
    const status = newAppointment.checkedIn ? "Checked-In" : "Scheduled";

    setTodayAppointments((prev) => [
      ...prev,
      {
        id,
        time: newAppointment.time,
        patient: newAppointment.patient,
        reason:
          newAppointment.type === "Consultation"
            ? "Consultation (manual)"
            : "Examination (manual)",
        type: newAppointment.type,
        status
      }
    ]);

    setShowAddForm(false);
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

  const handleEditFormSubmit = (e) => {
    e.preventDefault();
    if (!editingAppointmentId || !editAppointment.time || !editAppointment.patient)
      return;

    const status = editAppointment.checkedIn ? "Checked-In" : "Scheduled";
    const reason =
      editAppointment.type === "Consultation"
        ? "Consultation (manual)"
        : "Examination (manual)";

    setTodayAppointments((prev) =>
      prev.map((appt) =>
        appt.id === editingAppointmentId
          ? {
            ...appt,
            time: editAppointment.time,
            patient: editAppointment.patient,
            type: editAppointment.type,
            status,
            reason
          }
          : appt
      )
    );

    setShowEditForm(false);
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlot.startTime || !newSlot.endTime || !newSlot.roomId) return;
    const id = Date.now();
    setSlots((prev) => [...prev, { id, ...newSlot }]);
    setNewSlot({ ...newSlot, startTime: "", endTime: "", roomId: "" });
  };

  const handleDeleteSlot = (id) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
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
  const todaySchedule = weeklySchedule.find(
    (entry) =>
      entry.day.toLowerCase().startsWith(todayShort.slice(0, 3).toLowerCase())
  );
  const maxPatientsToday = todaySchedule ? todaySchedule.max : todayAppointments.length || 1;
  const checkedInCount = todayAppointments.filter(
    (appt) => appt.status === "Checked-In"
  ).length;

  const getAppointmentsForSchedule = (schedule) => {
    const dateObj = schedule.dateObj || getDateForDayLabel(schedule.day);
    const dateKey = dateObj.toISOString().split("T")[0];

    return todayAppointments.filter((appt) => {
      const apptDate =
        appt.date ||
        todayDate.toISOString().split("T")[0]; // fallback لو البيانات القديمة
      if (apptDate !== dateKey) return false;
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
            {visibleSchedules.map((d) => {
              const dateObj = d.dateObj;
              const label = dateObj
                ? dateObj.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric"
                })
                : d.day;
              const slotAppointments = getAppointmentsForSchedule(d);
              const isExpanded = expandedScheduleId === d.index;

              return (
                <li
                  key={d.day}
                  className="list-item"
                  style={{ cursor: "pointer", flexDirection: "column", alignItems: "stretch" }}
                  onClick={() =>
                    setExpandedScheduleId((prev) =>
                      prev === d.index ? null : d.index
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
                      <div className="list-title">{label}</div>
                      <div className="list-subtitle">
                        {d.start} – {d.end} · Max {d.max} slots
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600 }}>
                        {slotAppointments.length} patients
                      </div>
                      <div className="muted" style={{ fontSize: "0.85rem" }}>
                        Tap to {isExpanded ? "hide" : "view"}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <>
                      {slotAppointments.length === 0 ? (
                        <p
                          className="muted"
                          style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}
                        >
                          No patients booked in this slot.
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
                                <span
                                  className="pill"
                                  style={{
                                    background:
                                      appt.status === "Checked-In"
                                        ? "rgba(34, 197, 94, 0.2)"
                                        : "var(--accent-soft)",
                                    color:
                                      appt.status === "Checked-In"
                                        ? "#22c55e"
                                        : "#e0edff"
                                  }}
                                >
                                  {appt.status === "Checked-In"
                                    ? "Checked-In"
                                    : "Waiting"}
                                </span>
                              </li>
                            ))}
                        </ul>
                      )}
                    </>
                  )}
                </li>
              );
            })}
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
                  <option>Mon</option>
                  <option>Tue</option>
                  <option>Wed</option>
                  <option>Thu</option>
                  <option>Fri</option>
                </select>
              </label>
              <label className="field">
                <span>Room</span>
                <select
                  value={newSlot.roomId}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, roomId: Number(e.target.value) })
                  }
                  required
                >
                  <option value="">Select Room</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.roomName}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-grid-2">
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
                  {s.day} · {s.startTime} - {s.endTime}
                </div>
                <div className="list-subtitle">
                  {rooms.find(r => r.id === s.roomId)?.roomName || 'Unknown Room'} · Capacity: {s.capacity}
                </div>
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
                <div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setSelectedPatient(p);
                      setShowMedicalRecordModal(true);
                    }}
                  >
                    Open Records
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
              <label
                className="field"
                style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}
              >
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical Record Editor Modal */}
      <MedicalRecordEditorModal
        patient={selectedPatient}
        isOpen={showMedicalRecordModal}
        onClose={() => {
          setShowMedicalRecordModal(false);
          setSelectedPatient(null);
        }}
        onSave={async (newRecord) => {
          // Backend integration point
          console.log("Saved medical record:", newRecord);
          // TODO: Call API endpoint here when backend is ready
        }}
      />
    </div>
  );
}



