import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { 
  getAllRooms, 
  createRoom, 
  updateRoom, 
  deleteRoom 
} from "../api/admin.api.js";

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomName: ""
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  async function fetchRooms() {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRooms();
      setRooms(response.data.rooms || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({ roomName: "" });
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({ roomName: room.roomName });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteRoom(deletingId);
      setShowDeleteConfirm(false);
      setDeletingId(null);
      await fetchRooms();
    } catch (err) {
      console.error('Failed to delete room:', err);
      alert(err.message || 'Failed to delete room');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, formData);
      } else {
        await createRoom(formData);
      }

      setShowModal(false);
      setFormData({ roomName: "" });
      setEditingRoom(null);
      await fetchRooms();
    } catch (err) {
      console.error('Failed to save room:', err);
      alert(err.message || 'Failed to save room');
    }
  };

  const columns = [
    { key: 'id', label: 'Room ID', render: (value) => `#${value}` },
    { key: 'roomName', label: 'Room Name' }
  ];

  const formFields = [
    { name: 'roomName', label: 'Room Name', type: 'text', required: true, placeholder: 'Room 101' }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Rooms"
          description="Add, edit, or remove clinic rooms."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <PageHeader
          title="Manage Rooms"
          description="Add, edit, or remove clinic rooms."
        />
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: '#e74c3c' }}>
          <p>⚠️ {error}</p>
          <button 
            className="btn btn-primary" 
            onClick={fetchRooms}
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Manage Rooms"
        description="Add, edit, or remove clinic rooms."
        action={{
          label: "+ Add Room",
          onClick: handleAdd
        }}
      />

      <div className="card">
        <div className="card-header">
          <h3>Rooms</h3>
        </div>

        <DataTable
          columns={columns}
          data={rooms}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          emptyMessage="No rooms found. Click 'Add Room' to create one."
        />
      </div>

      <CRUDModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title={editingRoom ? "Edit Room" : "Add Room"}
        formFields={formFields}
        formData={formData}
        onChange={handleChange}
        submitLabel={editingRoom ? "Update" : "Add"}
        isEditing={!!editingRoom}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
