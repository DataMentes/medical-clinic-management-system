import { useState, useEffect } from "react";

const REPORT_TYPES = [
  "Appointments Report",
  "Patients Report",
  "Doctors Report",
  "Revenue Report",
  "Specialty Report"
];

// Mock data generators based on report type
const generateReportData = (reportType, startDate, endDate) => {
  // في التطبيق الحقيقي، هنا هيكون API call
  // محاكاة البيانات بناءً على نوع التقرير
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  switch (reportType) {
    case "Appointments Report":
      return days.map((day, index) => ({
        label: day,
        value: Math.floor(Math.random() * 30) + 10
      }));
    case "Patients Report":
      return days.map((day, index) => ({
        label: day,
        value: Math.floor(Math.random() * 20) + 5
      }));
    case "Doctors Report":
      return days.map((day, index) => ({
        label: day,
        value: Math.floor(Math.random() * 15) + 3
      }));
    case "Revenue Report":
      return days.map((day, index) => ({
        label: day,
        value: Math.floor(Math.random() * 5000) + 2000
      }));
    case "Specialty Report":
      return [
        { label: "Cardiology", value: 45 },
        { label: "Dermatology", value: 32 },
        { label: "Neurology", value: 28 },
        { label: "Orthopedics", value: 35 },
        { label: "Pediatrics", value: 40 }
      ];
    default:
      return days.map((day) => ({ label: day, value: 0 }));
  }
};

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("Appointments Report");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);

  // تعيين التاريخ الافتراضي (آخر 7 أيام)
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    setStartDate(lastWeek.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  // توليد البيانات عند تغيير نوع التقرير أو التاريخ
  useEffect(() => {
    if (startDate && endDate) {
      const data = generateReportData(reportType, startDate, endDate);
      setReportData(data);
    }
  }, [reportType, startDate, endDate]);

  const handleGenerateReport = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start date must be before end date");
      return;
    }
    const data = generateReportData(reportType, startDate, endDate);
    setReportData(data);
  };

  const max = reportData.length > 0 ? Math.max(...reportData.map((d) => d.value)) : 1;
  const isSpecialtyReport = reportType === "Specialty Report";

  return (
    <div className="page">
      <header className="page-header">
        <h1>Reports</h1>
        <p>Generate and view system reports with customizable date ranges.</p>
      </header>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <form className="form" onSubmit={handleGenerateReport}>
          <div className="form-grid-2">
            <label className="field">
              <span>Choose Report Type</span>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                required
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <label className="field" style={{ flex: 1 }}>
                <span>Start Date</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </label>
              <label className="field" style={{ flex: 1 }}>
                <span>End Date</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </label>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <button type="submit" className="btn-primary">
              Generate Report
            </button>
          </div>
        </form>
      </div>

      {reportData.length > 0 && (
        <section className="grid-2">
          <div className="card">
            <h3>{reportType}</h3>
            <p className="muted" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
              {startDate} to {endDate}
            </p>
            <div className="bar-chart">
              {reportData.map((d) => (
                <div key={d.label} className="bar-wrapper">
                  <div
                    className="bar"
                    style={{ height: `${(d.value / max) * 100}%` }}
                  >
                    <span className="bar-value">
                      {reportType === "Revenue Report" 
                        ? `${d.value} EGP` 
                        : d.value}
                    </span>
                  </div>
                  <span className="bar-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Summary</h3>
            <ul className="bullets">
              <li>
                <strong>Total:</strong>{" "}
                {reportType === "Revenue Report"
                  ? `${reportData.reduce((sum, d) => sum + d.value, 0)} EGP`
                  : reportData.reduce((sum, d) => sum + d.value, 0)}
              </li>
              <li>
                <strong>Average:</strong>{" "}
                {reportType === "Revenue Report"
                  ? `${Math.round(
                      reportData.reduce((sum, d) => sum + d.value, 0) /
                        reportData.length
                    )} EGP`
                  : Math.round(
                      reportData.reduce((sum, d) => sum + d.value, 0) /
                        reportData.length
                    )}
              </li>
              <li>
                <strong>Peak:</strong>{" "}
                {reportData.reduce(
                  (max, d) => (d.value > max.value ? d : max),
                  reportData[0]
                )?.label || "N/A"}
              </li>
              {reportType === "Revenue Report" && (
                <li>
                  <strong>Period:</strong> {startDate} to {endDate}
                </li>
              )}
            </ul>
            <p className="muted" style={{ marginTop: "1rem" }}>
              Report generated on {new Date().toLocaleString()}
            </p>
          </div>
        </section>
      )}

      {reportData.length === 0 && (
        <div className="card">
          <p className="muted" style={{ textAlign: "center", padding: "2rem" }}>
            Select a report type and date range, then click "Generate Report" to view data.
          </p>
        </div>
      )}
    </div>
  );
}

