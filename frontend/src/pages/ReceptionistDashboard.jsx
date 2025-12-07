import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BookAppointmentModal from "../components/BookAppointmentModal.jsx";
import * as receptionApi from "../api/reception.api.js";

const APPOINTMENTS_KEY = "adminAppointmentsData";
const PATIENTS_KEY = "adminPatientsData";
const DOCTORS_KEY = "doctorsData";
const SCHEDULES_KEY = "schedulesData";
const SPECIALTIES_KEY = "specialtiesData";
const PATIENTS_IN_CLINIC_KEY = "patientsInClinicNow";

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [selectedAppointmentCard, setSelectedAppointmentCard] = useState(null);
  const [searchPatientName, setSearchPatientName] = useState("");
  
  // API-driven state for Today's Appointments
  const [doctorGroups, setDoctorGroups] = useState([]);
  const [selectedDoctorGroup, setSelectedDoctorGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState("");

  // Form state for booking
  const [bookFormData, setBookFormData] = useState({
    patientName: "",
    phoneNumber: "",
    gender: "",
    specialtyId: "",
    appointmentType: "Examination",
    selectedDate: null,
    selectedDoctorId: null,
    selectedTime: null
  });

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await receptionApi.getDashboard();
        console.log("📊 Dashboard response:", response);
        
        if (response.success) {
          console.log("👥 Doctor Groups:", response.data.doctorGroups);
          response.data.doctorGroups.forEach(group => {
            console.log(`  Doctor: ${group.doctorName}, Total: ${group.totalAppointments}, Checked In: ${group.checkedInCount}, Appointments:`, group.appointments);
          });
          setDoctorGroups(response.data.doctorGroups || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  // قراءة البيانات
  useEffect(() => {
    const savedPatients = JSON.parse(localStorage.getItem(PATIENTS_KEY) || "[]");
    setPatients(savedPatients);

    const savedDoctors = JSON.parse(localStorage.getItem(DOCTORS_KEY) || "[]");
    if (savedDoctors.length === 0) {
      const defaultDoctors = [
        {
          id: 1,
          fullName: "Dr. Omar Hassan",
          email: "omar@clinic.com",
          specialty: "Cardiology",
          examinationFee: 500,
          consultationFee: 300
        },
        {
          id: 2,
          fullName: "Dr. Lina Mohamed",
          email: "lina@clinic.com",
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

    const savedSpecialties = JSON.parse(localStorage.getItem(SPECIALTIES_KEY) || "[]");
    setSpecialties(savedSpecialties);

    const savedAppointments = JSON.parse(
      localStorage.getItem(APPOINTMENTS_KEY) || "null"
    ) || [];

    // Always create fresh mock data for today to ensure it shows up
    const today = new Date();
    const defaultAppointments = [
      {
        id: 1,
        patientId: 1,
        patientName: "Ahmed Mohamed",
        phoneNumber: "+20 100 123 4567",
        doctorId: 1,
        type: "Examination",
        status: "Confirmed",
        bookingTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0, 0).toISOString()
      },
      {
        id: 2,
        patientId: 2,
        patientName: "Sara Ali",
        phoneNumber: "+20 101 234 5678",
        doctorId: 2,
        type: "Consultation",
        status: "Confirmed",
        bookingTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30, 0, 0).toISOString()
      },
      {
        id: 3,
        patientId: 3,
        patientName: "Mohamed Hassan",
        phoneNumber: "+20 102 345 6789",
        doctorId: 1,
        type: "Examination",
        status: "Confirmed",
        bookingTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0, 0).toISOString()
      },
      {
        id: 4,
        patientId: 4,
        patientName: "Fatma Ibrahim",
        phoneNumber: "+20 103 456 7890",
        doctorId: 2,
        type: "Examination",
        status: "Confirmed",
        bookingTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0, 0, 0).toISOString()
      }
    ];

    // Force update with fresh data
    setAppointments(defaultAppointments);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(defaultAppointments));

    const savedSchedules = JSON.parse(localStorage.getItem(SCHEDULES_KEY) || "null") || [];
    if (savedSchedules.length === 0) {
      const defaultSchedules = [
        { id: 1, doctorId: 1, roomId: 1, day: "Monday", startTime: "09:00", endTime: "13:00", maxCapacity: 12 },
        { id: 2, doctorId: 2, roomId: 2, day: "Monday", startTime: "13:00", endTime: "17:00", maxCapacity: 10 },
        { id: 3, doctorId: 1, roomId: 1, day: "Tuesday", startTime: "09:00", endTime: "15:00", maxCapacity: 18 }
      ];
      setSchedules(defaultSchedules);
      localStorage.setItem(SCHEDULES_KEY, JSON.stringify(defaultSchedules));
    } else {
      setSchedules(savedSchedules);
    }
  }, []);


  const handleCheckIn = (appointmentId) => {
    const appointment = appointments.find((appt) => appt.id === appointmentId);
    if (!appointment) return;

    // تحديث حالة الحجز
    const updated = appointments.map((appt) =>
      appt.id === appointmentId
        ? { ...appt, status: "Checked-In" }
        : appt
    );
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));

    // إضافة المريض إلى قائمة المرضى داخل العيادة في Doctor Dashboard
    const patientInClinic = {
      id: appointmentId,
      name: appointment.patientName || getPatientName(appointment.patientId),
      reason: appointment.type,
      doctorId: appointment.doctorId,
      appointmentId: appointmentId,
      checkInTime: new Date().toISOString()
    };

    const existingPatientsInClinic = JSON.parse(
      localStorage.getItem(PATIENTS_IN_CLINIC_KEY) || "[]"
    );
    // التحقق من عدم وجود المريض بالفعل
    const alreadyExists = existingPatientsInClinic.some(
      (p) => p.appointmentId === appointmentId
    );
    if (!alreadyExists) {
      const updatedPatientsInClinic = [...existingPatientsInClinic, patientInClinic];
      localStorage.setItem(
        PATIENTS_IN_CLINIC_KEY,
        JSON.stringify(updatedPatientsInClinic)
      );
    }

    // Update the selected card view if open
    if (selectedAppointmentCard) {
      const updatedGroup = updated.filter(a => a.doctorId === selectedAppointmentCard.doctorId &&
        new Date(a.bookingTime).toISOString().split("T")[0] === new Date().toISOString().split("T")[0]);

      setSelectedAppointmentCard(prev => ({
        ...prev,
        appointments: updatedGroup
      }));
    }
  };

  // الحصول على الأطباء المتاحين في يوم محدد
  const getAvailableDoctorsForDate = (selectedDate) => {
    if (!selectedDate) return [];

    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
    const availableDoctors = [];

    schedules.forEach((schedule) => {
      if (schedule.day === dayName) {
        const doctor = doctors.find((d) => d.id === schedule.doctorId);
        if (doctor) {
          // إنشاء time slots بناءً على startTime و endTime
          const slots = generateTimeSlots(schedule.startTime, schedule.endTime);
          availableDoctors.push({
            doctorId: doctor.id,
            doctorName: doctor.fullName,
            specialty: doctor.specialty,
            schedule: schedule,
            timeSlots: slots
          });
        }
      }
    });

    return availableDoctors;
  };

  // إنشاء time slots من startTime إلى endTime
  const generateTimeSlots = (startTime, endTime) => {
    const slots = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeString = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
      slots.push(timeString);

      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }

    return slots;
  };

  // الحصول على سعر الحجز
  const getAppointmentPrice = (doctorId, appointmentType) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return 0;

    return appointmentType === "Examination"
      ? doctor.examinationFee || 500
      : doctor.consultationFee || 300;
  };

  // معالجة إرسال نموذج الحجز
  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (
      !bookFormData.patientName ||
      !bookFormData.phoneNumber ||
      !bookFormData.specialtyId ||
      !bookFormData.selectedDate ||
      !bookFormData.selectedDoctorId ||
      !bookFormData.selectedTime
    ) {
      alert("Please fill all fields");
      return;
    }

    // إنشاء موعد جديد
    const selectedDate = bookFormData.selectedDate;
    const bookingDateTime = new Date(selectedDate);
    const [hours, minutes] = bookFormData.selectedTime.split(":");
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const price = getAppointmentPrice(
      bookFormData.selectedDoctorId,
      bookFormData.appointmentType
    );

    // البحث عن patientId إذا كان المريض موجوداً
    let patientId = null;
    const existingPatient = patients.find(
      (p) => p.phone === bookFormData.phoneNumber || p.fullName === bookFormData.patientName
    );
    if (existingPatient) {
      patientId = existingPatient.id;
    } else {
      // إنشاء مريض جديد
      patientId = Date.now();
      const newPatient = {
        id: patientId,
        fullName: bookFormData.patientName,
        phone: bookFormData.phoneNumber,
        gender: bookFormData.gender,
        email: `${bookFormData.patientName.toLowerCase().replace(/\s+/g, ".")}@example.com`
      };
      const updatedPatients = [...patients, newPatient];
      setPatients(updatedPatients);
      localStorage.setItem(PATIENTS_KEY, JSON.stringify(updatedPatients));
    }

    const newAppointment = {
      id: Date.now(),
      patientId: patientId,
      patientName: bookFormData.patientName,

      phoneNumber: bookFormData.phoneNumber,
      doctorId: bookFormData.selectedDoctorId,
      type: bookFormData.appointmentType,
      status: "Confirmed",
      bookingTime: bookingDateTime.toISOString()
    };

    const updated = [...appointments, newAppointment];
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));

    // إغلاق النموذج وإعادة تعيين البيانات
    setShowBookForm(false);
    setBookFormData({
      patientName: "",
      phoneNumber: "",
      gender: "",
      specialtyId: "",
      appointmentType: "Examination",
      selectedDate: null,
      selectedDoctorId: null,
      selectedTime: null
    });

    alert("Appointment booked successfully!");
  };

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.fullName : "Unknown Patient";
  };

  const getDoctorName = (doctorId) => {
    // Ensure we compare loosely or convert both to strings/numbers
    const doctor = doctors.find((d) => d.id == doctorId);
    return doctor ? doctor.fullName : "Unknown Doctor";
  };

  // الحصول على مواعيد اليوم مجمعة حسب الدكتور
  const getTodayAppointmentsByDoctor = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayAppts = appointments.filter((appt) => {
      if (!appt.bookingTime) return false;
      const appointmentDate = new Date(appt.bookingTime).toISOString().split("T")[0];
      return appointmentDate === today;
    });

    // تجميع حسب الدكتور
    const grouped = {};
    todayAppts.forEach((appt) => {
      const doctorId = appt.doctorId;
      if (!grouped[doctorId]) {
        grouped[doctorId] = {
          doctorId: doctorId,
          doctorName: getDoctorName(doctorId),
          appointments: []
        };
      }
      grouped[doctorId].appointments.push(appt);
    });

    return Object.values(grouped);
  };

  // الحصول على المرضى لحجز محدد
  const getPatientsForAppointment = (doctorId, time) => {
    const today = new Date().toISOString().split("T")[0];
    return appointments.filter((appt) => {
      if (appt.doctorId !== doctorId) return false;
      if (!appt.bookingTime) return false;
      const appointmentDate = new Date(appt.bookingTime).toISOString().split("T")[0];
      if (appointmentDate !== today) return false;
      const appointmentTime = new Date(appt.bookingTime).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      return appointmentTime === time;
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  const todayDate = new Date();
  const todayPrettyDate = todayDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // استخدام useMemo لتحديث القائمة تلقائياً عند تغيير appointments
  const todayAppointmentsByDoctor = useMemo(() => {
    return getTodayAppointmentsByDoctor();
  }, [appointments, doctors]);
  const availableDoctors = bookFormData.selectedDate
    ? getAvailableDoctorsForDate(bookFormData.selectedDate)
    : [];

  // فلترة الأطباء حسب التخصص المختار
  const filteredDoctors = bookFormData.specialtyId
    ? availableDoctors.filter((doc) => {
      const specialty = specialties.find((s) => s.id === parseInt(bookFormData.specialtyId));
      return specialty && doc.specialty === specialty.name;
    })
    : availableDoctors;

  return (
    <div className="page">
      <header className="page-header">
        <h1>Receptionist Dashboard</h1>
        <p>Manage today's appointments and patient check-ins.</p>
      </header>

      {/* New Book Appointment Section */}
      <div className="card-header">
        <button className="btn-primary" onClick={() => setShowBookForm(true)}>
          New Book Appointment
        </button>
      </div>

      {/* Today's Appointments Section */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <h3>Today's Appointments</h3>
          <span className="muted">{todayPrettyDate}</span>
        </div>
        {loading ? (
          <p className="muted" style={{ padding: "1rem", textAlign: "center" }}>
            Loading...
          </p>
        ) : doctorGroups.length === 0 ? (
          <p className="muted" style={{ padding: "1rem", textAlign: "center" }}>
            No appointments scheduled for today.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1rem",
              marginTop: "1rem"
            }}
          >
            {doctorGroups.map((group) => (
              <div
                key={group.doctorId}
                className="card"
                style={{
                  cursor: "pointer",
                  border: "1px solid var(--border-subtle)",
                  padding: "0",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  position: "relative"
                }}
                onClick={() => {
                  setSelectedDoctorGroup(group);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                  padding: "1.5rem",
                  color: "white"
                }}>
                  <div style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.25rem" }}>
                    {group.doctorName}
                  </div>
                  <div style={{ opacity: 0.9, fontSize: "0.95rem" }}>
                    {group.specialty}
                  </div>
                </div>

                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="muted" style={{ fontSize: '0.85rem' }}>Appointments</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{group.totalAppointments}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className="muted" style={{ fontSize: '0.85rem' }}>Checked In</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: "#22c55e" }}>{group.checkedInCount}</span>
                      </div>
                    </div>

                    <div style={{
                      marginTop: "1rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary)",
                      fontWeight: 600,
                      fontSize: "0.9rem"
                    }}>
                      View Patient List →
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>


      {/* Modal: Book Appointment Form */}
      {showBookForm && (
        <BookAppointmentModal
          onClose={() => setShowBookForm(false)}
          onSuccess={async (bookingData) => {
            try {
              const {
                patientName,
                phoneNumber,
                gender,
                yearOfBirth,
                appointmentType,
                appointmentDate,
                selectedDoctor,
                selectedTime,
                selectedScheduleId,
                fee
              } = bookingData;

              console.log("📝 Booking Data:", bookingData);

              // Step 1: Add walk-in patient (or it will return error if exists)
              let patientId = null;
              try {
                const patientResponse = await receptionApi.addWalkInPatient({
                  fullName: patientName,
                  phoneNumber: phoneNumber,
                  gender: gender,
                  yearOfBirth: parseInt(yearOfBirth)
                });
                
                console.log("✅ Patient created:", patientResponse);
                
                if (patientResponse.success) {
                  // Backend returns 'id' not 'patientId'
                  patientId = patientResponse.data.patient.id;
                  console.log("📝 Extracted patientId:", patientId);
                }
              } catch (patientError) {
                // If patient already exists (409), search for them
                if (patientError.message?.includes("already registered")) {
                  console.log("👤 Patient exists, searching...");
                  const searchResponse = await receptionApi.searchPatient(phoneNumber);
                  console.log("🔍 Search response:", searchResponse);
                  if (searchResponse.success && searchResponse.data.length > 0) {
                    // Search also returns 'id' field
                    patientId = searchResponse.data[0].id;
                    console.log("✅ Found existing patient, id:", patientId);
                  }
                } else {
                  throw patientError;
                }
              }

              if (!patientId) {
                alert("Failed to create or find patient");
                return;
              }

              // Step 2: Book appointment
              console.log("📅 Booking appointment with data:", {
                patientId: patientId,
                doctorId: selectedDoctor,
                scheduleId: selectedScheduleId,
                appointmentType: appointmentType,
                appointmentDate: appointmentDate
              });

              const appointmentResponse = await receptionApi.bookAppointmentForPatient({
                patientId: patientId,
                doctorId: selectedDoctor,
                scheduleId: selectedScheduleId,
                appointmentType: appointmentType,
                appointmentDate: appointmentDate
              });

              console.log("✅ Appointment booked:", appointmentResponse);

              if (appointmentResponse.success) {
                setShowBookForm(false);
                alert("✅ Appointment booked successfully!");
                
                // Refresh dashboard data
                window.location.reload();
              } else {
                alert("Failed to book appointment: " + (appointmentResponse.error || "Unknown error"));
              }
            } catch (error) {
              console.error("💥 Booking error:", error);
              alert("Error: " + (error.message || "Failed to book appointment"));
            }
          }}
        />
      )}
      {/* OLD FORM - COMMENTED OUT
      {showBookForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
            overflowY: "auto"
          }}
          onClick={() => setShowBookForm(false)}
        >
          <div
            className="card"
            style={{
              maxWidth: "600px",
              width: "100%",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form className="form" onSubmit={handleBookSubmit}>
              <h2>Book New Appointment</h2>

              <label className="field">
                <span>Patient Name</span>
                <input
                  type="text"
                  value={bookFormData.patientName}
                  onChange={(e) =>
                    setBookFormData({ ...bookFormData, patientName: e.target.value })
                  }
                  required
                  placeholder="Enter patient name"
                />
              </label>

              <label className="field">
                <span>Phone Number</span>
                <input
                  type="tel"
                  value={bookFormData.phoneNumber}
                  onChange={(e) =>
                    setBookFormData({ ...bookFormData, phoneNumber: e.target.value })
                  }
                  required
                  placeholder="+20 100 123 4567"
                />
              </label>

              <label className="field">
                <span>Gender</span>
                <select
                  value={bookFormData.gender}
                  onChange={(e) =>
                    setBookFormData({ ...bookFormData, gender: e.target.value })
                  }
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </label>

              <label className="field">
                <span>Specialty</span>
                <select
                  value={bookFormData.specialtyId}
                  onChange={(e) => {
                    setBookFormData({
                      ...bookFormData,
                      specialtyId: e.target.value,
                      selectedDoctorId: null,
                      selectedTime: null
                    });
                  }}
                  required
                >
                  <option value="">Select Specialty</option>
                  {specialties.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Appointment Type</span>
                <select
                  value={bookFormData.appointmentType}
                  onChange={(e) =>
                    setBookFormData({
                      ...bookFormData,
                      appointmentType: e.target.value,
                      selectedDoctorId: null,
                      selectedTime: null
                    })
                  }
                  required
                >
                  <option value="Examination">Examination</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </label>

              <label className="field">
                <span>Select Date</span>
                <input
                  type="date"
                  value={
                    bookFormData.selectedDate
                      ? bookFormData.selectedDate.toISOString().split("T")[0]
                      : ""
                  }
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const selectedDate = e.target.value ? new Date(e.target.value) : null;
                    setBookFormData({
                      ...bookFormData,
                      selectedDate: selectedDate,
                      selectedDoctorId: null,
                      selectedTime: null
                    });
                  }}
                  required
                />
              </label>

              {bookFormData.selectedDate && filteredDoctors.length > 0 && (
                <div className="field">
                  <span>Available Doctors & Times</span>
                  <div className="list" style={{ marginTop: "0.5rem" }}>
                    {filteredDoctors.map((doc) => (
                      <div key={doc.doctorId} style={{ marginBottom: "1rem" }}>
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "var(--text)"
                          }}
                        >
                          {doc.doctorName}
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                            gap: "0.5rem"
                          }}
                        >
                          {doc.timeSlots.map((slot) => {
                            const isSelected =
                              bookFormData.selectedDoctorId === doc.doctorId &&
                              bookFormData.selectedTime === slot;
                            const price = getAppointmentPrice(
                              doc.doctorId,
                              bookFormData.appointmentType
                            );
                            return (
                              <button
                                key={slot}
                                type="button"
                                className={
                                  isSelected
                                    ? "btn-primary"
                                    : "btn-secondary"
                                }
                                onClick={() => {
                                  setBookFormData({
                                    ...bookFormData,
                                    selectedDoctorId: doc.doctorId,
                                    selectedTime: slot
                                  });
                                }}
                                style={{
                                  padding: "0.5rem",
                                  fontSize: "0.85rem"
                                }}
                              >
                                {slot}
                                <br />
                                <span style={{ fontSize: "0.75rem" }}>
                                  {price} EGP
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookFormData.selectedDate &&
                filteredDoctors.length === 0 &&
                bookFormData.specialtyId && (
                  <p className="muted" style={{ padding: "1rem", textAlign: "center" }}>
                    No available doctors for this specialty on the selected date.
                  </p>
                )}

              {bookFormData.selectedDoctorId && bookFormData.selectedTime && (
                <div
                  style={{
                    padding: "1rem",
                    background: "var(--bg-soft)",
                    borderRadius: "var(--radius-md)",
                    marginTop: "1rem"
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                    Appointment Summary
                  </div>
                  <div className="muted" style={{ fontSize: "0.9rem" }}>
                    Doctor: {doctors.find((d) => d.id === bookFormData.selectedDoctorId)?.fullName}
                  </div>
                  <div className="muted" style={{ fontSize: "0.9rem" }}>
                    Time: {bookFormData.selectedTime}
                  </div>
                  <div className="muted" style={{ fontSize: "0.9rem" }}>
                    Type: {bookFormData.appointmentType}
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "0.5rem", color: "var(--accent)" }}>
                    Price: {getAppointmentPrice(bookFormData.selectedDoctorId, bookFormData.appointmentType)} EGP
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setShowBookForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1 }}
                  disabled={
                    !bookFormData.patientName ||
                    !bookFormData.phoneNumber ||
                    !bookFormData.specialtyId ||
                    !bookFormData.selectedDate ||
                    !bookFormData.selectedDoctorId ||
                    !bookFormData.selectedTime
                  }
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      */}

      {/* Modal: Appointment Details */}
      {selectedAppointmentCard && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
            overflowY: "auto"
          }}
          onClick={() => {
            setSelectedAppointmentCard(null);
            setSearchPatientName("");
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "700px",
              width: "100%",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">
              <div>
                <h3>Appointment Details</h3>
                <div className="muted">
                  {selectedAppointmentCard.doctorName}
                </div>
                <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {selectedAppointmentCard.appointments.length} appointment{selectedAppointmentCard.appointments.length !== 1 ? "s" : ""} today
                </div>
              </div>
              <button
                className="btn-secondary"
                onClick={() => {
                  setSelectedAppointmentCard(null);
                  setSearchPatientName("");
                }}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <label className="field">
                <span>Search Patient by Name</span>
                <input
                  type="text"
                  value={searchPatientName}
                  onChange={(e) => setSearchPatientName(e.target.value)}
                  placeholder="Enter patient name..."
                />
              </label>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <h4 style={{ marginBottom: "0.75rem" }}>Patients List</h4>
              <div className="list">
                {selectedAppointmentCard.appointments
                  .filter(appt => appt.patientName.toLowerCase().includes(searchPatientName.toLowerCase()))
                  .sort((a, b) => {
                    const timeA = a.bookingTime ? new Date(a.bookingTime).getTime() : 0;
                    const timeB = b.bookingTime ? new Date(b.bookingTime).getTime() : 0;
                    return timeA - timeB;
                  })
                  .map((appt) => (
                    <div key={appt.id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{appt.patientName}</div>
                        <div className="muted" style={{ fontSize: '0.85rem' }}>
                          {formatTime(appt.bookingTime)} - {appt.type === "Examination" ? "كشف" : (appt.type === "Consultation" ? "استشاره" : appt.type)}
                        </div>
                      </div>
                      <div>
                        {appt.status === "Checked-In" ? (
                          <span className="pill" style={{ background: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}>
                            Checked In
                          </span>
                        ) : (
                          <button
                            className="btn-primary"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckIn(appt.id);
                            }}
                          >
                            Confirm
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {selectedAppointmentCard.appointments.filter(appt => appt.patientName.toLowerCase().includes(searchPatientName.toLowerCase())).length === 0 && (
                  <div className="muted" style={{ textAlign: 'center', padding: '1rem' }}>
                    No patients found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Patient List */}
      {selectedDoctorGroup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
            overflowY: "auto"
          }}
          onClick={() => {
            setSelectedDoctorGroup(null);
            setSearchPhone("");
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header" style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: "0.25rem" }}>{selectedDoctorGroup.doctorName}</h3>
                  <p className="muted" style={{ margin: 0 }}>{selectedDoctorGroup.totalAppointments} appointments today</p>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedDoctorGroup(null);
                    setSearchPhone("");
                  }}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Search by Phone */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-subtle" }}>
              <input
                type="text"
                placeholder="Search Patient by Phone Number..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "1rem"
                }}
              />
            </div>

            {/* Patients List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
              <h4 style={{ marginBottom: "1rem" }}>Patients List</h4>
              {selectedDoctorGroup.appointments
                .filter(appt => !searchPhone || appt.phoneNumber.includes(searchPhone))
                .map((appt) => (
                  <div
                    key={appt.id}
                    style={{
                      padding: "1rem",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "0.75rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                        {appt.patientName}
                      </div>
                      <div className="muted" style={{ fontSize: "0.9rem" }}>
                        {new Date(appt.appointmentTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {appt.appointmentType}
                      </div>
                      <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        {appt.phoneNumber}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span
                        style={{
                          padding: "0.375rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          backgroundColor: appt.status === "Confirmed" ? "#22c55e20" : "#f59e0b20",
                          color: appt.status === "Confirmed" ? "#22c55e" : "#f59e0b"
                        }}
                      >
                        {appt.status}
                      </span>
                      {appt.status === "Pending" && (
                        <button
                          className="btn-primary"
                          onClick={async () => {
                            try {
                              await receptionApi.checkInPatient(appt.id);
                              alert("Patient checked in successfully!");
                              // Refresh dashboard
                              const response = await receptionApi.getDashboard();
                              if (response.success) {
                                setDoctorGroups(response.data.doctorGroups || []);
                                // Update selected group
                                const updatedGroup = response.data.doctorGroups.find(g => g.doctorId === selectedDoctorGroup.doctorId);
                                if (updatedGroup) {
                                  setSelectedDoctorGroup(updatedGroup);
                                }
                              }
                            } catch (error) {
                              alert("Error: " + error.message);
                            }
                          }}
                          style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

