import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Reports from "../pages/Reports";
import LeaveManagement from "../pages/LeaveManagement";

const AppRouter = () => {
  return (
    <Routes>
      <Route >
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/leaves" element={<LeaveManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
