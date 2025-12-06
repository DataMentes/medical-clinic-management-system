import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import DataTable from "../components/DataTable.jsx";
import CRUDModal from "../components/CRUDModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const ROOMS_KEY = "roomsData";

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomName: ""
  });

  useEffect(() => {
    const savedRooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || "[]");
    if (savedRooms.length === 0) {
      const defaultRooms = [
        { id: 1, roomName: "Room 101" },
        { id: 2, roomName: "Room 102" },
        { id: 3, roomName: "Room 201" },
        { id: 4, roomName: "Room 202" },
        { id: 5, roomName: "Room 301" }
      ];
      setRooms(defaultRooms);
      localStorage.setItem(ROOMS_KEY, JSON.stringify(defaultRooms));
    } else {
      setRooms(savedRooms);
    }
  }, []);

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

  const handleDeleteConfirm = () => {
    const updated = rooms.filter((room) => room.id !== deletingId);
    setRooms(updated);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingRoom) {
      const updated = rooms.map((room) =>
        room.id === editingRoom.id
          ? { ...room, roomName: formData.roomName }
          : room
      );
      setRooms(updated);
      localStorage.setItem(ROOMS_KEY, JSON.stringify(updated));
    } else {
      const newRoom = {
        id: Date.now(),
        roomName: formData.roomName
      };
      const updated = [...rooms, newRoom];
      setRooms(updated);
      localStorage.setItem(ROOMS_KEY, JSON.stringify(updated));
    }

    setShowModal(false);
    setFormData({ roomName: "" });
    setEditingRoom(null);
  };

  const columns = [
    { key: 'id', label: 'Room ID', render: (value) => `#${value}` },
    { key: 'roomName', label: 'Room Name' }
  ];

  const formFields = [
    { name: 'roomName', label: 'Room Name', type: 'text', required: true, placeholder: 'Room 101' }
  ];

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
