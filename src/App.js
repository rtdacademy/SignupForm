import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from "./Dashboard/Login";
import Dashboard from "./Dashboard/Dashboard";
import RegistrationForm from "./components/RegistrationForm";
import Layout from "./Layout/Layout";
import StaffLogin from "./Admin/StaffLogin";
import TeacherDashboard from "./TeacherDashboard/TeacherDashboard";
import LMSWrapper from "./Dashboard/LMSWrapper"; // Updated import statement
import "./styles/styles.css";
import 'katex/dist/katex.min.css';

function App() {
  const { user, loading, isStaff } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? (isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />) : <Login />} 
          />
          <Route 
            path="/dashboard" 
            element={user && !isStaff(user) ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} 
          />
          <Route 
            path="/register" 
            element={user && !isStaff(user) ? <Layout><RegistrationForm /></Layout> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={user ? (isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />) : <Navigate to="/login" />} 
          />
          <Route 
            path="/staff-login" 
            element={user ? <Navigate to="/teacher-dashboard" /> : <StaffLogin />} 
          />
          <Route 
            path="/teacher-dashboard" 
            element={user && isStaff(user) ? <Layout><TeacherDashboard /></Layout> : <Navigate to="/staff-login" />} 
          />
          <Route 
            path="/course" 
            element={user && !isStaff(user) ? <LMSWrapper />: <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;