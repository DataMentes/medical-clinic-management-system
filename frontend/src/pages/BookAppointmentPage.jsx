import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSpecialties, getAvailableDoctors, bookAppointment } from "../api/patient.api.js";

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [appointmentType, setAppointmentType] = useState("Examination");
  const [appointmentDate, setAppointmentDate] = useState(today);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await getSpecialties();
        if (response.success && response.data) {
          setSpecialties(response.data);
        }
      } catch (err) {
        console.error('Error loading specialties:', err);
        setError("Failed to load specialties");
      }
    };

    fetchSpecialties();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedSpecialty || !appointmentDate) {
        setAvailableDoctors([]);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const response = await getAvailableDoctors(selectedSpecialty, appointmentDate);
        
        if (response.success && response.data) {
          setAvailableDoctors(response.data);
        }
      } catch (err) {
        console.error('Error loading doctors:', err);
        setError(err.message || "Failed to load available doctors");
        setAvailableDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialty, appointmentDate]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSpecialty || !appointmentDate || !selectedDoctor || !selectedSlot) {
      setError("Please select an appointment slot");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await bookAppointment({
        doctorId: selectedDoctor.doctorId,
        scheduleId: selectedSlot.scheduleId,
        appointmentDate: appointmentDate,
        appointmentType: appointmentType
      });

      if (response.success) {
        alert("Appointment booked successfully!");
        navigate("/patient-dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const getSpecialtyName = (specialty) => {
    if (!specialty) return 'N/A';
    return typeof specialty === 'object' ? specialty.name : specialty;
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Calculate appointments - using new backend format
  const allAppointments = availableDoctors.flatMap((doctor) => {
    const slots = doctor.availableSlots || [];
    
    console.log('👨‍⚕️ Doctor:', doctor.fullName, 'Slots:', slots);
    
    return slots
      .filter(slot => {
        console.log('  🕐 Slot:', slot.time, 'Available:', slot.available);
        return slot.available;
      })
      .map((slot) => ({
        doctor,
        slot
      }));
  });
  
  console.log('📋 Total appointments:', allAppointments.length);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Book Appointment</h1>
        <p>Choose a specialty, date, and time slot to book your visit.</p>
      </header>

      <div className="card">
        <form className="form" onSubmit={handleBookSubmit}>
          {error && (
            <div style={{
              padding: "0.75rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)",
              color: "#dc2626",
              marginBottom: "1rem"
            }}>
              {error}
            </div>
          )}

          <label className="field">
            <span>Medical specialty</span>
            <select
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setSelectedDoctor(null);
                setSelectedSlot(null);
              }}
              required
            >
              <option value="">Select specialty...</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </label>

          <div className="field">
            <span>Appointment type</span>
            <div className="radio-group">
              <label className="radio">
                <input
                  type="radio"
                  name="appointment-type"
                  value="Examination"
                  checked={appointmentType === "Examination"}
                  onChange={(e) => {
                    setAppointmentType(e.target.value);
                    setSelectedDoctor(null);
                    setSelectedSlot(null);
                  }}
                />
                Examination
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="appointment-type"
                  value="Consultation"
                  checked={appointmentType === "Consultation"}
                  onChange={(e) => {
                    setAppointmentType(e.target.value);
                    setSelectedDoctor(null);
                    setSelectedSlot(null);
                  }}
                />
                Consultation
              </label>
            </div>
          </div>

          <label className="field">
            <span>Select date</span>
            <input
              type="date"
              min={today}
              value={appointmentDate}
              onChange={(e) => {
                setAppointmentDate(e.target.value);
                setSelectedDoctor(null);
                setSelectedSlot(null);
              }}
              required
            />
          </label>

          {selectedSpecialty && appointmentDate && (
            <div className="field">
              <span>Available appointments</span>
              {loading ? (
                <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-soft)" }}>
                  Loading available appointments...
                </div>
              ) : allAppointments.length > 0 ? (
                <div className="list">
                  {allAppointments.map(({ doctor, slot }) => {
                    const isSelected = 
                      selectedSlot?.scheduleId === slot.scheduleId && 
                      selectedDoctor?.doctorId === doctor.doctorId;
                    
                    const fee = appointmentType === "Examination" ? doctor.examinationFee : doctor.consultationFee;
                    
                    return (
                      <div 
                        key={`${doctor.doctorId}-${slot.scheduleId}`}
                        className={"list-item clickable" + (isSelected ? " list-item-selected" : "")}
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setSelectedSlot(slot);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="list-title">
                            {doctor.fullName} · {getSpecialtyName(doctor.specialty)}
                          </div>
                          <div className="list-subtitle">
                            📅 {getDayName(appointmentDate)}
                          </div>
                          <div className="list-subtitle">
                            🕐 {slot.time} · {appointmentType} · {fee} EGP
                          </div>
                          <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: "0.25rem" }}>
                            Slots: {slot.maxCapacity - slot.bookedCount} available ({slot.bookedCount}/{slot.maxCapacity} booked)
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ 
                            color: "var(--primary)", 
                            fontWeight: "600",
                            fontSize: "1.5rem",
                            lineHeight: "1"
                          }}>
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="list-empty">
                  No available appointments for this specialty and date.
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={!selectedSpecialty || !appointmentDate || !selectedDoctor || !selectedSlot || loading}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
