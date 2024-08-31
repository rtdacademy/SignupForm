import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from "./Dashboard/Login";
import Dashboard from "./Dashboard/Dashboard";
import TeacherDashboard from "./TeacherDashboard/TeacherDashboard";
import AdminPanel from "./Admin/AdminPanel";
import RegistrationForm from "./components/RegistrationForm";
import "./styles/styles.css";

function App() {
  const { user, loading, isSuperAdmin } = useAuth(); // Removed isTeacherEmail

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={user ? <Navigate to={isSuperAdmin(user.email) ? "/teacher-dashboard" : "/dashboard"} /> : <Login />} />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/teacher-dashboard" 
            element={user && isSuperAdmin(user.email) ? <TeacherDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin-panel" 
            element={user && isSuperAdmin(user.email) ? <AdminPanel /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/register" 
            element={<RegistrationForm />} 
          />
          <Route path="/" element={<Navigate to={user ? (isSuperAdmin(user.email) ? "/teacher-dashboard" : "/dashboard") : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
