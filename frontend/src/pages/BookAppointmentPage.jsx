import { useMemo, useState } from "react";

// ثابت للتخصصات الطبية والـ time slots المتاحة لكل تخصص
const SPECIALTIES = {
  cardiology: {
    label: "Cardiology",
    slots: [
      { time: "09:00", doctor: "Dr. Sarah Ahmed", type: "examination", price: 500 },
      { time: "11:30", doctor: "Dr. Omar Khaled", type: "consultation", price: 300 },
      { time: "14:00", doctor: "Dr. Rana Youssef", type: "examination", price: 500 },
      { time: "15:30", doctor: "Dr. Sarah Ahmed", type: "consultation", price: 300 }
    ]
  },
  dermatology: {
    label: "Dermatology",
    slots: [
      { time: "10:00", doctor: "Dr. Hana Farouk", type: "examination", price: 450 },
      { time: "13:00", doctor: "Dr. Karim Nassar", type: "consultation", price: 250 },
      { time: "16:00", doctor: "Dr. Hana Farouk", type: "consultation", price: 250 }
    ]
  },
  pediatrics: {
    label: "Pediatrics",
    slots: [
      { time: "09:30", doctor: "Dr. Maya Adel", type: "examination", price: 400 },
      { time: "12:30", doctor: "Dr. Ahmed Samir", type: "consultation", price: 280 },
      { time: "14:30", doctor: "Dr. Maya Adel", type: "consultation", price: 280 }
    ]
  }
};

const UPCOMING_KEY = "patientUpcomingAppointments";
const DOCTOR_APPOINTMENTS_KEY = "doctorAppointments";

export default function BookAppointmentPage() {
  const [specialty, setSpecialty] = useState("");
  const [appointmentType, setAppointmentType] = useState("examination");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // فلترة الـ slots بناءً على الـ appointment type المختار
  const availableSlots =
    specialty && appointmentDate
      ? SPECIALTIES[specialty].slots.filter(
          (slot) => slot.type === appointmentType
        )
      : [];

  // دالة لإرسال email confirmation للمريض
  const sendEmailConfirmation = (appointmentDetails) => {
    // في التطبيق الحقيقي، هنا هيكون API call لإرسال email
    // لكن في الـ demo، هنحاكي الإرسال
    const emailContent = `
Appointment Confirmation

Dear Patient,

Your appointment has been successfully booked!

Appointment Details:
- Doctor: ${appointmentDetails.doctor}
- Specialty: ${appointmentDetails.specialty}
- Type: ${appointmentDetails.type}
- Date: ${appointmentDetails.date}
- Time: ${appointmentDetails.time}
- Price: ${appointmentDetails.price} EGP
- Status: ${appointmentDetails.status}

Please arrive 10 minutes before your scheduled time.

Thank you for choosing CarePoint Clinic.
    `;

    // محاكاة إرسال email (في التطبيق الحقيقي هيكون API call)
    console.log("Email sent to patient:", emailContent);
    
    // يمكنك أيضاً حفظ الـ email في localStorage للـ demo
    const emailKey = "patientEmailNotifications";
    const existingEmails = JSON.parse(localStorage.getItem(emailKey) || "[]");
    existingEmails.push({
      timestamp: new Date().toISOString(),
      subject: "Appointment Confirmation",
      content: emailContent,
      appointmentId: appointmentDetails.id
    });
    localStorage.setItem(emailKey, JSON.stringify(existingEmails));
  };

  const handleBookSubmit = (e) => {
    e.preventDefault();
    if (!specialty || !appointmentDate || !selectedSlot) return;

    const typeLabel =
      appointmentType === "examination" ? "Examination" : "Consultation";

    const appointmentId = Date.now();
    const newAppointment = {
      id: appointmentId,
      date: `${appointmentDate} · ${selectedSlot.time}`,
      doctor: selectedSlot.doctor,
      type: typeLabel,
      status: "Confirmed",
      specialty: SPECIALTIES[specialty].label,
      price: selectedSlot.price
    };

    // قراءة المواعيد الحالية من localStorage (لو فيه)
    const existing =
      JSON.parse(localStorage.getItem(UPCOMING_KEY) || "null") || [];
    const updated = [...existing, newAppointment];

    localStorage.setItem(UPCOMING_KEY, JSON.stringify(updated));

    // حفظ الموعد عند الدكتور أيضاً
    const doctorAppointment = {
      id: appointmentId,
      date: appointmentDate,
      time: selectedSlot.time,
      patient: "Online patient",
      doctor: selectedSlot.doctor,
      reason: `${typeLabel} · ${SPECIALTIES[specialty].label}`
    };

    const doctorExisting =
      JSON.parse(localStorage.getItem(DOCTOR_APPOINTMENTS_KEY) || "null") ||
      [];
    const doctorUpdated = [...doctorExisting, doctorAppointment];
    localStorage.setItem(
      DOCTOR_APPOINTMENTS_KEY,
      JSON.stringify(doctorUpdated)
    );

    // إرسال email confirmation للمريض
    sendEmailConfirmation({
      id: appointmentId,
      doctor: selectedSlot.doctor,
      specialty: SPECIALTIES[specialty].label,
      type: typeLabel,
      date: appointmentDate,
      time: selectedSlot.time,
      price: selectedSlot.price,
      status: "Confirmed"
    });

    alert(
      `Appointment has been booked successfully!\n\n` +
      `A confirmation email has been sent to your email address with the appointment details.`
    );

    // reset form
    setSpecialty("");
    setAppointmentType("examination");
    setAppointmentDate("");
    setSelectedSlot(null);
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1>Book Appointment</h1>
        <p>Choose a specialty, date, and time slot to book your visit.</p>
      </header>

      <div className="card">
        <form className="form" onSubmit={handleBookSubmit}>
          {/* التخصصات الطبية */}
          <label className="field">
            <span>Medical specialty</span>
            <select
              value={specialty}
              onChange={(e) => {
                setSpecialty(e.target.value);
                setSelectedSlot(null);
              }}
              required
            >
              <option value="">Select specialty...</option>
              {Object.entries(SPECIALTIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </label>

          {/* نوع الـ appointment */}
          <div className="field">
            <span>Appointment type</span>
            <div className="radio-group">
              <label className="radio">
                <input
                  type="radio"
                  name="appointment-type"
                  value="examination"
                  checked={appointmentType === "examination"}
                  onChange={(e) => {
                    setAppointmentType(e.target.value);
                    setSelectedSlot(null); // reset الـ slot المختار عند تغيير النوع
                  }}
                />
                Examination
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="appointment-type"
                  value="consultation"
                  checked={appointmentType === "consultation"}
                  onChange={(e) => {
                    setAppointmentType(e.target.value);
                    setSelectedSlot(null); // reset الـ slot المختار عند تغيير النوع
                  }}
                />
                Consultation
              </label>
            </div>
          </div>

          {/* التاريخ */}
          <label className="field">
            <span>Select date</span>
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

          {/* الـ time slots المتاحة */}
          {specialty && appointmentDate && (
            <div className="field">
              <span>Available time slots</span>
              <div className="list">
                {availableSlots.map((slot) => {
                  const isSelected =
                    selectedSlot &&
                    selectedSlot.time === slot.time &&
                    selectedSlot.doctor === slot.doctor;
                  return (
                    <div
                      key={`${slot.time}-${slot.doctor}`}
                      className={
                        "list-item clickable" +
                        (isSelected ? " list-item-selected" : "")
                      }
                    >
                      <div>
                        <div className="list-title">
                          {slot.doctor}
                        </div>
                        <div className="list-subtitle">
                          Time: {slot.time} · {slot.price} EGP
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        Appointment
                      </button>
                    </div>
                  );
                })}
                {availableSlots.length === 0 && (
                  <div className="list-empty">
                    No available slots for this specialty.
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={!specialty || !appointmentDate || !selectedSlot}
          >
            Confirm appointment
          </button>
        </form>
      </div>
    </div>
  );
}

