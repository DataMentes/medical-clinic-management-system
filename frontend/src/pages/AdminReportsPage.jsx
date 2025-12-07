import { useState, useEffect } from "react";
import * as adminAPI from "../api/admin.api";

const REPORT_TYPES = [
  "Appointments Report",
  "Patients Report",
  "Doctors Report",
  "Revenue Report",
  "Specialty Report"
];

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("Appointments Report");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState({ total: 0, average: 0, peak: { label: '', value: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set default dates (last 7 days)
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    setStartDate(lastWeek.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  // Auto-generate report when dates and type are set
  useEffect(() => {
    if (startDate && endDate && reportType) {
      handleGenerateReport();
    }
  }, [reportType]);

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();
    
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      
      // Map report type to API function
      switch (reportType) {
        case "Appointments Report":
          response = await adminAPI.getAppointmentsReport(startDate, endDate);
          break;
        case "Patients Report":
          response = await adminAPI.getPatientsReport(startDate, endDate);
          break;
        case "Doctors Report":
          response = await adminAPI.getDoctorsReport(startDate, endDate);
          break;
        case "Revenue Report":
          response = await adminAPI.getRevenueReport(startDate, endDate);
          break;
        case "Specialty Report":
          response = await adminAPI.getSpecialtyReport(startDate, endDate);
          break;
        default:
          setError("Unknown report type");
          return;
      }

      if (response.success && response.data) {
        setReportData(response.data.data || []);
        setSummary(response.data.summary || { total: 0, average: 0, peak: { label: 'N/A', value: 0 } });
      } else {
        setError("Failed to generate report");
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err.response?.data?.error || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const max = reportData.length > 0 ? Math.max(...reportData.map((d) => d.value)) : 1;

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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="card" style={{ marginBottom: "1.5rem", borderLeft: "4px solid var(--danger-color, #e74c3c)" }}>
          <p style={{ color: "var(--danger-color, #e74c3c)" }}>{error}</p>
        </div>
      )}

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
                  ? `${summary.total} EGP`
                  : summary.total}
              </li>
              <li>
                <strong>Average:</strong>{" "}
                {reportType === "Revenue Report"
                  ? `${summary.average} EGP`
                  : summary.average}
              </li>
              <li>
                <strong>Peak:</strong> {summary.peak?.label || 'N/A'}
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

      {reportData.length === 0 && !loading && !error && (
        <div className="card">
          <p className="muted" style={{ textAlign: "center", padding: "2rem" }}>
            Select a report type and date range, then click "Generate Report" to view data.
          </p>
        </div>
      )}
    </div>
  );
}
