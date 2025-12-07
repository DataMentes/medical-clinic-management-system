import { useState, useEffect } from "react";
import { getAllAppointments } from "../api/admin.api.js";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    fetchAppointments();
  }, [pagination.page]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAppointments(pagination.page, pagination.limit);
      
      if (response.success) {
        setAppointments(response.data.appointments);
        setPagination(prev => ({ 
          ...prev, 
          total: response.data.pagination.total 
        }));
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusPill = (status) => {
    const styles = {
      Confirmed: { bg: "var(--accent-soft)", color: "#e0edff" },
      Pending: { bg: "rgba(255, 193, 7, 0.2)", color: "#ffc107" },
      Canceled: { bg: "rgba(239, 68, 68, 0.2)", color: "#ef4444" },
      Completed: { bg: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }
    };
    const style = styles[status] || styles.Pending;
    return (
      <span
        className="pill"
        style={{
          background: style.bg,
          color: style.color,
          padding: "0.25rem 0.75rem",
          borderRadius: "12px",
          fontSize: "0.85rem",
          fontWeight: 500
        }}
      >
        {status}
      </span>
    );
  };

  const columns = [
    { 
      key: 'id', 
      label: 'ID', 
      render: (value) => `#${value}` 
    },
    { 
      key: 'patientName', 
      label: 'Patient' 
    },
    { 
      key: 'patientPhone', 
      label: 'Phone' 
    },
    { 
      key: 'doctorName', 
      label: 'Doctor' 
    },
    { 
      key: 'specialty', 
      label: 'Specialty' 
    },
    { 
      key: 'appointmentType', 
      label: 'Type' 
    },
    { 
      key: 'appointmentDate', 
      label: 'Date', 
      render: (value) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => getStatusPill(value)
    },
    { 
      key: 'scheduleInfo', 
      label: 'Schedule' 
    },
    { 
      key: 'roomName', 
      label: 'Room' 
    }
  ];

  return (
    <div className="page">
      <PageHeader
        title="Manage Appointments"
        description="View all appointments in the system."
      />

      <div className="card">
        <div className="card-header">
          <h3>Appointments</h3>
          {!loading && !error && (
            <span className="muted">
              Total: {pagination.total} appointments
            </span>
          )}
        </div>

        {loading && (
          <p className="muted" style={{ padding: '1.5rem', textAlign: 'center' }}>
            Loading appointments...
          </p>
        )}
        
        {error && (
          <p style={{ 
            padding: '1.5rem', 
            textAlign: 'center', 
            color: 'var(--danger)' 
          }}>
            {error}
          </p>
        )}
        
        {!loading && !error && (
          <>
            <DataTable
              columns={columns}
              data={appointments}
              emptyMessage="No appointments found."
              showActions={false}
            />
            
            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div style={{ 
                padding: '1rem', 
                display: 'flex', 
                justifyContent: 'center',
                gap: '0.5rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <button
                  className="btn-secondary"
                  onClick={() => setPagination(prev => ({ 
                    ...prev, 
                    page: Math.max(1, prev.page - 1) 
                  }))}
                  disabled={pagination.page === 1}
                  style={{ opacity: pagination.page === 1 ? 0.5 : 1 }}
                >
                  Previous
                </button>
                <span style={{ 
                  padding: '0.5rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center' 
                }}>
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                </span>
                <button
                  className="btn-secondary"
                  onClick={() => setPagination(prev => ({ 
                    ...prev, 
                    page: prev.page + 1 
                  }))}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                  style={{ 
                    opacity: pagination.page >= Math.ceil(pagination.total / pagination.limit) ? 0.5 : 1 
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
