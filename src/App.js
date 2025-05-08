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
import YourWayScheduleMaker from './Schedule/YourWayScheduleMaker';
import IcsUpload from './Schedule/IcsUpload'; 
import GeminiChat from './AI/GeminiChat';
import app from './firebase'; 
import PaymentResult from './Dashboard/PaymentResult';
import CancelledPayment from './Dashboard/CancelledPayment';
import GetStartedNow from './Website/GetStartedNow';
import Emulate from './StudentManagement/Emulate';
import PoliciesAndReports from './Website/PoliciesAndReports';
import MigrationLogin from './migration/MigrationLogin'; 
import ModernCourseViewer from './courses/CourseViewer/ModernCourseViewer';
import CourseEditor from './courses/CourseEditor/CourseEditor';
import EmployeePortal from './TeacherDashboard/EmployeePortal';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';

// EdBotz imports
import EdBotzDashboard from './edbotz/Dashboard';
import EdBotzLogin from './edbotz/Login';
import EdBotzLayout from './edbotz/EdBotzLayout';
import StudentPortal from './edbotz/StudentPortal'
import CourseManagement from './edbotz/CourseManagement';
import GoogleAIChatPage from './edbotz/GoogleAIChat/GoogleAIChatPage';

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

    // Enable debug info in development mode or with a query parameter
    const isDebugMode = process.env.NODE_ENV === 'development' || 
    new URLSearchParams(window.location.search).has('debug');

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
       {user && <SessionTimeoutWarning showDebugInfo={isDebugMode} />}
      <Routes>

      <Route 
  path="/modern-course/:courseId?" 
  element={user ? <ModernCourseViewer /> : <Navigate to="/login" />} 
/>

<Route 
  path="/course-editor/:courseId?" 
  element={
    user && isStaff(user) ? 
    <CourseEditor /> : 
    <Navigate to="/staff-login" />
  } 
/>

<Route 
  path="/employee-portal" 
  element={
    user && isStaff(user) ? 
    <Layout><EmployeePortal /></Layout> : 
    <Navigate to="/staff-login" />
  } 
/>

      <Route path="/migrate" element={
          user ? (
            isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />
          ) : <MigrationLogin />
        } />

        <Route path="/login" element={
          user ? (
            isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />
          ) : <Login />
        } />

<Route path="/get-started" element={<GetStartedNow />} />
<Route path="/policies-reports" element={<PoliciesAndReports />} />
        
      <Route 
  path="/dashboard" 
  element={user && !isStaff(user) ? <Dashboard /> : <Navigate to="/login" />} 
/>

<Route 
  path="/emulate/:studentEmail" 
  element={
    user && isStaff(user) ? 
    <Emulate /> : 
    <Navigate to="/staff-login" />
  } 
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

        

       
        <Route path="/courses" element={
  <EdBotzProtectedRoute>
    <CourseManagement />
  </EdBotzProtectedRoute>
} />

         {/* Google AI Chat route - publically accessible */}
         <Route path="/google-ai-chat" element={<GoogleAIChatPage />} />

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