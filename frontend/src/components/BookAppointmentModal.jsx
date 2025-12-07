import { useState, useEffect } from "react";

import { getSpecialties, getAvailableDoctors } from "../api/reception.api.js";

export default function BookAppointmentModal({
  onClose,
  onSuccess
}) {
  const today = new Date().toISOString().split("T")[0];

  // Form state
  const [patientName, setPatientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [yearOfBirth, setYearOfBirth] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [appointmentType, setAppointmentType] = useState("Examination");
  const [appointmentDate, setAppointmentDate] = useState(today);
  
  // Data state
  const [specialties, setSpecialties] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load Specialties
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        console.log("📞 Calling getSpecialties API...");
        const response = await getSpecialties();
        console.log("📥 Specialties Response:", response);
        
        if (response.success) {
          console.log("✅ Specialties data:", response.data);
          setSpecialties(response.data);
        } else {
          console.error("❌ Response not successful:", response);
          setError("Failed to load specialties: " + (response.error || "Unknown error"));
        }
      } catch (err) {
        console.error("💥 Error loading specialties:", err);
        console.error("Error details:", err.response?.data || err.message);
        setError("Failed to load specialties: " + (err.response?.data?.error || err.message));
      }
    };
    loadSpecialties();
  }, []);
  
  // Get available slots when specialty/date changes
  useEffect(() => {
    if (!selectedSpecialty || !appointmentDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getAvailableDoctors(selectedSpecialty, appointmentDate);
        if (response.success) {
          // Transform API response to flat slots list for display
          const doctors = response.data;
          const allSlots = doctors.flatMap(doctor => {
             return (doctor.availableSlots || [])
               .filter(slot => slot.available)
               .map(slot => ({
                 scheduleId: slot.scheduleId,
                 doctorId: doctor.doctorId,
                 doctorName: doctor.fullName,
                 specialty: doctor.specialty ? doctor.specialty.name : 'Unknown',
                 time: slot.time,
                 fee: appointmentType === "Examination" ? (doctor.examinationFee) : (doctor.consultationFee),
                 maxCapacity: slot.maxCapacity
               }));
          });
          setAvailableSlots(allSlots);
        }
      } catch (err) {
        console.error("Error fetching slots:", err);
        setError("Failed to load available appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [selectedSpecialty, appointmentDate, appointmentType]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!patientName || !phoneNumber || !gender || !yearOfBirth || !selectedSlot) {
      alert("Please fill all fields and select a time slot");
      return;
    }
    
    // Return booking data
    onSuccess({
      patientName,
      phoneNumber,
      gender,
      yearOfBirth,
      appointmentType,
      appointmentDate,
      selectedDoctor: selectedSlot.doctorId,
      selectedTime: selectedSlot.time,
      selectedScheduleId: selectedSlot.scheduleId,
      fee: selectedSlot.fee
    });
  };
  
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  return (
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
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form className="form" onSubmit={handleSubmit}>
          <h2>Book New Appointment</h2>
          
          {/* Error Display */}
          {error && (
            <div style={{
              padding: "1rem",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "var(--radius-md)",
              marginBottom: "1rem",
              color: "#c00"
            }}>
              ⚠️ {error}
            </div>
          )}
          
          {/* Patient Information */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ marginBottom: "0.75rem", color: "var(--text-soft)" }}>Patient Information</h4>
            
            <label className="field">
              <span>Patient Name</span>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                placeholder="Enter patient name"
              />
            </label>

            <label className="field">
              <span>Phone Number</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="+20 100 123 4567"
              />
            </label>

            <label className="field">
              <span>Gender</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </label>
            <label className="field">
              <span>Year of Birth</span>
              <input
                type="number"
                value={yearOfBirth}
                onChange={(e) => setYearOfBirth(e.target.value)}
                required
                placeholder="e.g. 1990"
                min="1900"
                max={new Date().getFullYear()}
              />
            </label>
          </div>
          
          {/* Appointment Details */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ marginBottom: "0.75rem", color: "var(--text-soft)" }}>Appointment Details</h4>
            
            <label className="field">
              <span>Medical Specialty</span>
              <select
                value={selectedSpecialty}
                onChange={(e) => {
                  setSelectedSpecialty(e.target.value);
                  setSelectedSlot(null);
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

            <div className="field">
              <span>Appointment Type</span>
              <div className="radio-group">
                <label className="radio">
                  <input
                    type="radio"
                    name="appointment-type"
                    value="Examination"
                    checked={appointmentType === "Examination"}
                    onChange={(e) => {
                      setAppointmentType(e.target.value);
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
                      setSelectedSlot(null);
                    }}
                  />
                  Consultation
                </label>
              </div>
           </div>

            <label className="field">
              <span>Select Date</span>
              <input
                type="date"
                min={today}
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setSelectedSlot(null);
                }}
                required
              />
            </label>
          </div>

          {/* Available Slots */}
          {selectedSpecialty && appointmentDate && (
            <div className="field">
              <span>Available Appointments ({availableSlots.length})</span>
              {availableSlots.length > 0 ? (
                <div className="list" style={{ marginTop: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                  {availableSlots.map((slot, index) => {
                    const isSelected = selectedSlot?.scheduleId === slot.scheduleId && selectedSlot?.time === slot.time;
                    
                    return (
                      <div
                        key={`${slot.scheduleId}-${index}`}
                        className={"list-item clickable" + (isSelected ? " list-item-selected" : "")}
                        onClick={() => setSelectedSlot(slot)}
                        style={{ cursor: "pointer" }}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="list-title">
                            {slot.doctorName} · {slot.specialty}
                          </div>
                          <div className="list-subtitle">
                            📅 {getDayName(appointmentDate)}
                          </div>
                          <div className="list-subtitle">
                            🕐 {slot.time} · {appointmentType} · {slot.fee} EGP
                          </div>
                        </div>
                        {isSelected && (
                          <span style={{ 
                            color: "var(--primary)", 
                            fontWeight: "600",
                            fontSize: "1.5rem"
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

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={!patientName || !phoneNumber || !gender || !selectedSlot}
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
