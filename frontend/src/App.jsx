import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ManageAdmins from "./pages/ManageAdmins.jsx";
import ManageDoctors from "./pages/ManageDoctors.jsx";
import ManagePatients from "./pages/ManagePatients.jsx";
import ManageReceptionists from "./pages/ManageReceptionists.jsx";
import ManageSchedules from "./pages/ManageSchedules.jsx";
import ManageAppointments from "./pages/ManageAppointments.jsx";
import ManageRooms from "./pages/ManageRooms.jsx";
import ManageSpecialties from "./pages/ManageSpecialties.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";
import ReceptionistDashboard from "./pages/ReceptionistDashboard.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import BookAppointmentPage from "./pages/BookAppointmentPage.jsx";
import PatientSettings from "./pages/PatientSettings.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import DoctorSettings from "./pages/DoctorSettings.jsx";
import ReceptionistSettings from "./pages/ReceptionistSettings.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import MedicalHistoryPage from "./pages/MedicalHistoryPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Default route: go to login when opening the project */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        {/* Admin routes */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-manage-admins" element={<ManageAdmins />} />
        <Route path="/admin-manage-doctors" element={<ManageDoctors />} />
        <Route path="/admin-manage-patients" element={<ManagePatients />} />
        <Route path="/admin-manage-receptionists" element={<ManageReceptionists />} />
        <Route path="/admin-manage-schedules" element={<ManageSchedules />} />
        <Route path="/admin-manage-appointments" element={<ManageAppointments />} />
        <Route path="/admin-manage-rooms" element={<ManageRooms />} />
        <Route path="/admin-manage-specialties" element={<ManageSpecialties />} />
        <Route path="/admin-reports" element={<AdminReportsPage />} />
        <Route path="/admin-settings" element={<AdminSettings />} />
        {/* Receptionist routes */}
        <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
        <Route path="/receptionist-book-appointment" element={<BookAppointmentPage />} />
        <Route path="/receptionist-settings" element={<ReceptionistSettings />} />
        {/* Patient routes */}
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/book-appointment" element={<BookAppointmentPage />} />
        <Route path="/medical-history" element={<MedicalHistoryPage />} />
        <Route path="/patient-settings" element={<PatientSettings />} />
        {/* Doctor routes */}
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-settings" element={<DoctorSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}


