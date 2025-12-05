import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { receptionistService } from "../api/receptionistService";
import { adminService } from "../api/adminService";

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]); // We might not need full patients list if we search
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [showBookForm, setShowBookForm] = useState(false);
  const [selectedAppointmentCard, setSelectedAppointmentCard] = useState(null);
  const [searchPatientName, setSearchPatientName] = useState("");
  const [loading, setLoading] = useState(true);

  // Form state for booking
  const [bookFormData, setBookFormData] = useState({
    patientName: "",
    phoneNumber: "",
    specialtyId: "",
    appointmentType: "Examination",
    selectedDate: null,
    selectedDoctorId: null,
    selectedTime: null
  });

  // Fetch all initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          doctorsData,
          specialtiesData,
          schedulesData,
          dashboardData
        ] = await Promise.all([
          adminService.getAllDoctors(),
          adminService.getAllSpecialties(),
          adminService.getAllSchedules(),
          receptionistService.getDashboard()
        ]);

        // Transform doctors data
        const formattedDoctors = doctorsData.map(d => ({
          id: d.id,
          fullName: d.user.fullName,
          email: d.user.email,
          specialty: d.specialty?.name || "General",
          examinationFee: d.examinationFee,
          consultationFee: d.consultationFee
        }));

        setDoctors(formattedDoctors);
        setSpecialties(specialtiesData);
        setSchedules(schedulesData);

        // Format appointments from dashboard
        const flatAppointments = dashboardData.todaysAppointments.map(appt => ({
          id: appt.id,
          patientId: appt.patient.id,
          patientName: appt.patient.person.fullName,
          phoneNumber: appt.patient.person.phoneNumber,
          doctorId: appt.doctor.id,
          type: appt.type === 'EXAMINATION' ? 'Examination' : 'Consultation',
          status: appt.status === 'CONFIRMED' ? 'Confirmed' : appt.status === 'CHECKED_IN' ? 'Checked-In' : appt.status,
          feePaid: appt.feePaid,
          bookingTime: new Date(appt.appointmentDate.split('T')[0] + 'T' + appt.appointmentTime).toISOString()
        }));
        setAppointments(flatAppointments);

      } catch (error) {
        console.error('Failed to fetch receptionist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCheckIn = async (appointmentId) => {
    try {
      await receptionistService.checkInPatient(appointmentId);

      const updated = appointments.map((appt) =>
        appt.id === appointmentId
          ? { ...appt, status: "Checked-In" }
          : appt
      );
      setAppointments(updated);

      if (selectedAppointmentCard) {
        const updatedGroup = updated.filter(a => a.doctorId === selectedAppointmentCard.doctorId);
        setSelectedAppointmentCard(prev => ({
          ...prev,
          appointments: updatedGroup
        }));
      }

      alert("Patient checked in successfully!");
    } catch (error) {
      console.error('Check-in failed:', error);
      alert(error.message || 'Failed to check in patient');
    }
  };

  const getAvailableDoctorsForDate = (selectedDate) => {
    if (!selectedDate) return [];

    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
    const availableDoctors = [];

    schedules.forEach((schedule) => {
      if (schedule.dayOfWeek === dayName) {
        const doctor = doctors.find((d) => d.id === schedule.doctorId);
        if (doctor) {
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

  const getAppointmentPrice = (doctorId, appointmentType) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return 0;
    return appointmentType === "Examination"
      ? doctor.examinationFee || 500
      : doctor.consultationFee || 300;
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookFormData.patientName || !bookFormData.phoneNumber || !bookFormData.selectedDate || !bookFormData.selectedDoctorId || !bookFormData.selectedTime) {
      alert("Please fill all fields");
      return;
    }

    try {
      let patientId;
      const patientSearch = await receptionistService.searchPatients(bookFormData.phoneNumber);

      if (patientSearch.length > 0) {
        patientId = patientSearch[0].patient.id;
      } else {
        alert("Patient not found. Please register the patient first.");
        return;
      }

      const appointmentDate = bookFormData.selectedDate.toISOString().split('T')[0];

      await receptionistService.bookAppointment({
        patientId,
        doctorId: bookFormData.selectedDoctorId,
        appointmentDate,
        appointmentTime: bookFormData.selectedTime,
        type: bookFormData.appointmentType.toUpperCase(),
        notes: "Booked by receptionist"
      });

      // Refresh appointments
      const dashboardData = await receptionistService.getDashboard();
      const flatAppointments = dashboardData.todaysAppointments.map(appt => ({
        id: appt.id,
        patientId: appt.patient.id,
        patientName: appt.patient.person.fullName,
        phoneNumber: appt.patient.person.phoneNumber,
        doctorId: appt.doctor.id,
        type: appt.type === 'EXAMINATION' ? 'Examination' : 'Consultation',
        status: appt.status === 'CONFIRMED' ? 'Confirmed' : appt.status === 'CHECKED_IN' ? 'Checked-In' : appt.status,
        feePaid: appt.feePaid,
        bookingTime: new Date(appt.appointmentDate.split('T')[0] + 'T' + appt.appointmentTime).toISOString()
      }));
      setAppointments(flatAppointments);

      setShowBookForm(false);
      setBookFormData({
        patientName: "",
        phoneNumber: "",
        specialtyId: "",
        appointmentType: "Examination",
        selectedDate: null,
        selectedDoctorId: null,
        selectedTime: null
      });

      alert("Appointment booked successfully!");
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book appointment: ' + (error.response?.data?.error || error.message));
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((d) => d.id == doctorId);
    return doctor ? doctor.fullName : "Unknown Doctor";
  };

  const getTodayAppointmentsByDoctor = () => {
    const grouped = {};
    appointments.forEach((appt) => {
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

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const todayDate = new Date();
  const todayPrettyDate = todayDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const todayAppointmentsByDoctor = useMemo(() => {
    return getTodayAppointmentsByDoctor();
  }, [appointments, doctors]);

  const availableDoctors = bookFormData.selectedDate
    ? getAvailableDoctorsForDate(bookFormData.selectedDate)
    : [];

  const filteredDoctors = bookFormData.specialtyId
    ? availableDoctors.filter((doc) => {
      const specialty = specialties.find((s) => s.id === parseInt(bookFormData.specialtyId));
      return specialty && doc.specialty === specialty.name;
    })
    : availableDoctors;

  if (loading) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Receptionist Dashboard</h1>
          <p>Loading...</p>
        </header>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Receptionist Dashboard</h1>
        <p>Manage today's appointments and patient check-ins.</p>
      </header>

      {/* New Book Appointment Section */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <h3>New Book Appointment</h3>
          <button className="btn-primary" onClick={() => setShowBookForm(true)}>
            + Add
          </button>
        </div>
      </div>

      {/* Today's Appointments Section */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <h3>Today's Appointments</h3>
          <span className="muted">{todayPrettyDate}</span>
        </div>
        {todayAppointmentsByDoctor.length === 0 ? (
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
            {todayAppointmentsByDoctor.map((group) => {
              const doctor = doctors.find((d) => d.id === group.doctorId);
              const checkedInCount = group.appointments.filter(
                (appt) => appt.status === "Checked-In"
              ).length;

              return (
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
                    setSelectedAppointmentCard({
                      doctorId: group.doctorId,
                      doctorName: group.doctorName,
                      appointments: group.appointments
                    });
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
                    {doctor && (
                      <div style={{ opacity: 0.9, fontSize: "0.95rem" }}>
                        {doctor.specialty}
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="muted" style={{ fontSize: '0.85rem' }}>Appointments</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{group.appointments.length}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span className="muted" style={{ fontSize: '0.85rem' }}>Checked In</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: "#22c55e" }}>{checkedInCount}</span>
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
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Book Appointment Form */}
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
                            Check in
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
    </div>
  );
}
