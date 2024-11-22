import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Main site imports
import Login from './Dashboard/Login';
import Dashboard from './Dashboard/Dashboard';
import Layout from './Layout/Layout';
import StaffLogin from './Admin/StaffLogin';
import TeacherDashboard from './TeacherDashboard/TeacherDashboard';
import LMSWrapper from './Dashboard/LMSWrapper';
import Courses from './courses/Courses'; 
import MultiActionAuthHandler from './MultiActionAuthHandler';
import ContractorInvoiceForm from './PublicForms/ContractorInvoiceForm';
import AdultStudentInfo from './Website/AdultStudentInfo';
import ScheduleMaker from './Schedule/ScheduleMaker'; 
import YourWayScheduleMaker from './Website/YourWayScheduleMaker';
import IcsUpload from './Schedule/IcsUpload'; 
import GeminiChat from './AI/GeminiChat';
import app from './firebase'; 
import PaymentResult from './Dashboard/PaymentResult';
import CancelledPayment from './Dashboard/CancelledPayment';

// EdBotz imports
import EdBotzDashboard from './edbotz/Dashboard';
import EdBotzLogin from './edbotz/Login';
import EdBotzLayout from './edbotz/EdBotzLayout';
import StudentPortal from './edbotz/StudentPortal'

import './styles/styles.css';
import 'katex/dist/katex.min.css';

// Protected Route Component for EdBotz
const EdBotzProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <EdBotzLayout>{children}</EdBotzLayout>;
};

function MainApp() {
  const { user, loading, isStaff } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={
          user ? (
            isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />
          ) : <Login />
        } />
      <Route 
  path="/dashboard" 
  element={user && !isStaff(user) ? <Dashboard /> : <Navigate to="/login" />} 
/>
      
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

        <Route path="/payment/result" element={
          user ? <PaymentResult /> : <Navigate to="/login" />
        } />

        <Route path="/payment/cancelled" element={
          user ? <CancelledPayment /> : <Navigate to="/login" />
        } />

        <Route path="/course" element={
          user && !isStaff(user) ? <LMSWrapper /> : <Navigate to="/login" />
        } />
        <Route path="/courses" element={
          user && isStaff(user) ? <Layout><Courses /></Layout> : <Navigate to="/staff-login" />
        } />
        <Route path="/auth-action-handler" element={<MultiActionAuthHandler />} />
        <Route path="/contractor-invoice" element={<ContractorInvoiceForm />} />
        <Route path="/adult-students" element={<AdultStudentInfo />} />
        <Route path="/your-way" element={<YourWayScheduleMaker />} />
        <Route path="/schedule-maker" element={
          user && isStaff(user) ? <Layout><ScheduleMaker /></Layout> : <Navigate to="/staff-login" />
        } />
        <Route path="/ics-upload" element={
          user && isStaff(user) ? <Layout><IcsUpload /></Layout> : <Navigate to="/staff-login" />
        } />
        <Route path="/ai-chat" element={
          user ? (
            <Layout>
              <GeminiChat firebaseApp={app} />
            </Layout>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </div>
  );
}

function EdBotzApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="EdBotzApp">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          user ? <Navigate to="/" /> : <EdBotzLogin />
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <EdBotzProtectedRoute>
            <EdBotzDashboard />
          </EdBotzProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <EdBotzProtectedRoute>
            <EdBotzDashboard />
          </EdBotzProtectedRoute>
        } />

        {/* Add more EdBotz protected routes here */}
        <Route path="/courses" element={
          <EdBotzProtectedRoute>
            <Courses />
          </EdBotzProtectedRoute>
        } />

         {/* Student Portal Route - Note this is public but access controlled via Firebase */}
         <Route path="/student-portal/:userId/:accessKey" element={<StudentPortal />} />

        {/* Shared routes */}
        <Route path="/auth-action-handler" element={<MultiActionAuthHandler />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  // Check if we're running the second site
  const isSecondSite = process.env.REACT_APP_SITE === 'second';
  console.log('Site Type:', isSecondSite ? 'EdBotz' : 'Main', process.env.REACT_APP_SITE);
  return isSecondSite ? <EdBotzApp /> : <MainApp />;
}

export default App;