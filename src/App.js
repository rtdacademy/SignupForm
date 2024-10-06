import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LayoutProvider } from './context/LayoutContext';
import Login from './Dashboard/Login';
import Dashboard from './Dashboard/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import Layout from './Layout/Layout';
import StaffLogin from './Admin/StaffLogin';
import TeacherDashboard from './TeacherDashboard/TeacherDashboard';
import LMSWrapper from './Dashboard/LMSWrapper';
import Courses from './courses/Courses'; 
import MultiActionAuthHandler from './MultiActionAuthHandler';
import ContractorInvoiceForm from './PublicForms/ContractorInvoiceForm';
import ScheduleMaker from './Schedule/ScheduleMaker'; 
import IcsUpload from './Schedule/IcsUpload'; 
import './styles/styles.css';
import 'katex/dist/katex.min.css';

function App() {
  const { user, loading, isStaff } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LayoutProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={
            user ? (
              isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />
            ) : <Login />
          } />
          <Route path="/dashboard" element={
            user && !isStaff(user) ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />
          } />
          <Route path="/register" element={
            user && !isStaff(user) ? <Layout><RegistrationForm /></Layout> : <Navigate to="/login" />
          } />
          <Route path="/" element={
            user ? (
              isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />
            ) : <Navigate to="/login" />
          } />
          <Route path="/staff-login" element={
            user ? <Navigate to="/teacher-dashboard" /> : <StaffLogin />
          } />
          <Route path="/teacher-dashboard" element={
            user && isStaff(user) ? <Layout><TeacherDashboard /></Layout> : <Navigate to="/staff-login" />
          } />
          <Route path="/course" element={
            user && !isStaff(user) ? <LMSWrapper /> : <Navigate to="/login" />
          } />
          <Route path="/courses" element={
            user && isStaff(user) ? <Layout><Courses /></Layout> : <Navigate to="/staff-login" />
          } />
          <Route path="/auth-action-handler" element={<MultiActionAuthHandler />} />
          <Route path="/contractor-invoice" element={<ContractorInvoiceForm />} />
          
          {/* New routes for ScheduleMaker and IcsUpload */}
          <Route path="/schedule-maker" element={
            user && isStaff(user) ? <Layout><ScheduleMaker /></Layout> : <Navigate to="/staff-login" />
          } />
          <Route path="/ics-upload" element={
            user && isStaff(user) ? <Layout><IcsUpload /></Layout> : <Navigate to="/staff-login" />
          } />
        </Routes>
      </div>
    </Router>
    </LayoutProvider>
  );
}

export default App;