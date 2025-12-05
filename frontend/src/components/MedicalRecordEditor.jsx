import { useState, useEffect } from 'react';
import MedicalRecordViewer from './MedicalRecordViewer';
import { doctorService } from '../api/doctorService';

/**
 * MedicalRecordEditor - Modal with tabs for viewing history and adding new records
 * Tab 1: Medical History (read-only)
 * Tab 2: Add New Record (form)
 */
export default function MedicalRecordEditor({ patient, appointmentId, isOpen, onClose, onRecordAdded }) {
  const [activeTab, setActiveTab] = useState('history');
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state for new record
  const [formData, setFormData] = useState({
    diagnosis: '',
    prescription: '',
    notes: ''
  });

  // Fetch medical history when modal opens
  useEffect(() => {
    if (isOpen && patient?.id) {
      fetchMedicalHistory();
    }
  }, [isOpen, patient]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      const response = await doctorService.getPatientMedicalHistory(patient.id);
      setMedicalHistory(response.data.medicalHistory || []);
    } catch (error) {
      console.error('Failed to fetch medical history:', error);
      setMedicalHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.diagnosis || !formData.prescription) {
      alert('Diagnosis and Prescription are required');
      return;
    }

    try {
      setSubmitting(true);
      await doctorService.addMedicalRecord(appointmentId, formData);
      
      // Reset form
      setFormData({ diagnosis: '', prescription: '', notes: '' });
      
      // Refresh medical history
      await fetchMedicalHistory();
      
      // Switch to history tab to show the new record
      setActiveTab('history');
      
      // Notify parent component
      if (onRecordAdded) {
        onRecordAdded();
      }
      
      alert('Medical record added successfully!');
    } catch (error) {
      console.error('Failed to add medical record:', error);
      alert(error.response?.data?.error || 'Failed to add medical record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveTab('history');
    setFormData({ diagnosis: '', prescription: '', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
      onClick={handleClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Medical Records</h2>
          <div className="muted" style={{ fontSize: '0.9rem' }}>
            Patient: <strong>{patient?.name || 'Unknown'}</strong>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '1rem 1.5rem 0',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <button
            type="button"
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'history' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'history' ? '#fff' : 'var(--text)',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('history')}
          >
            Medical History
          </button>
          <button
            type="button"
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'add' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'add' ? '#fff' : 'var(--text)',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            onClick={() => setActiveTab('add')}
          >
            Add New Record
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {activeTab === 'history' ? (
            <MedicalRecordViewer medicalHistory={medicalHistory} loading={loading} />
          ) : (
            <div style={{ padding: '1.5rem' }}>
              <form className="form" onSubmit={handleSubmit}>
                <label className="field">
                  <span>Diagnosis *</span>
                  <textarea
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Enter diagnosis..."
                    rows={4}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </label>

                <label className="field">
                  <span>Prescription *</span>
                  <textarea
                    name="prescription"
                    value={formData.prescription}
                    onChange={handleInputChange}
                    placeholder="Enter prescription details..."
                    rows={4}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </label>

                <label className="field">
                  <span>Notes (Optional)</span>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes..."
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </label>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ flex: 1 }}
                    onClick={handleClose}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1 }}
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Medical Record'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'var(--text)',
            padding: '0.5rem',
            lineHeight: 1
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
