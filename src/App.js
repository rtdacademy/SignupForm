import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Main site imports
import Login from './Dashboard/Login';
import Dashboard from './Dashboard/Dashboard';
import Layout from './Layout/Layout';
import StaffLogin from './Admin/StaffLogin';
import TeacherDashboard from './TeacherDashboard/TeacherDashboard';
import TeacherFileStorage from './TeacherDashboard/TeacherFileStorage';
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
import AERR2324 from './Website/AERR/23_24/AERR2324';
import EducationPlan from './Website/EducationPlan/24_25/EducationPlan';
import MigrationLogin from './migration/MigrationLogin';
 
import ModernCourseViewer from './courses/CourseViewer/ModernCourseViewer';
import CourseEditor from './courses/CourseEditor/CourseEditor';
import CourseOutline from './courses/CourseOutline';
import EmployeePortal from './TeacherDashboard/EmployeePortal';
import SessionTimeoutWarning from './components/SessionTimeoutWarning';
import ParentLogin from './ParentPortal/ParentLogin';
import ParentDashboard from './ParentPortal/ParentDashboard';
import ParentEmailVerification from './ParentPortal/ParentEmailVerification';
import FlowChartPrerequisites from './components/PrerequisiteFlowChart/FlowChartPrerequisites';
import TeacherFirebaseCourseView from './StudentManagement/TeacherFirebaseCourseView';
import RTDLearningLogin from './rtdLearning/Login';
import RTDLearningDashboard from './rtdLearning/Dashboard';
import RTDLearningAdminLogin from './rtdLearning/AdminLogin';
import RTDLearningAdminDashboard from './rtdLearning/AdminDashboard';
import RTDConnectLogin from './RTDConnect/Login';
import RTDConnectDashboard from './RTDConnect/Dashboard';
import RTDConnectLandingPage from './RTDConnect/LandingPage';
import FacilitatorsPage from './RTDConnect/FacilitatorsPage';
import FacilitatorProfile1 from './RTDConnect/FacilitatorProfile1';
import FacilitatorProfile2 from './RTDConnect/FacilitatorProfile2';
import FacilitatorProfile3 from './RTDConnect/FacilitatorProfile3';
import HomeEducationStaffDashboard from './HomeEducation/HomeEducationStaffDashboard';

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
  const { user, loading, isStaff, isHomeEducationParent } = useAuth();

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
  path="/course-outline/:courseId"
  element={<CourseOutline />}
/>

{/* Firebase course admin routes removed - components archived
<Route
  path="/firebase-course/:courseId?"
  element={
    user && isStaff(user) ?
    <Layout>
      <React.Suspense fallback={<div>Loading...</div>}>
        {React.createElement(React.lazy(() => import('./FirebaseCourses/FirebaseCourseAdmin')))}
      </React.Suspense>
    </Layout> :
    <Navigate to="/staff-login" />
  }
/>

<Route
  path="/firebase-course-view/:courseId?"
  element={
    user && isStaff(user) ?
    <Layout>
      <React.Suspense fallback={<div>Loading...</div>}>
        {React.createElement(React.lazy(() => import('./FirebaseCourses/StaffCourseWrapperRefactored')))}
      </React.Suspense>
    </Layout> :
    <Navigate to="/staff-login" />
  }
/>
*/}

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
<Route path="/aerr/2023-24" element={<AERR2324 />} />
<Route path="/education-plan/2025-26" element={<EducationPlan />} />
<Route path="/prerequisite-flowchart" element={<FlowChartPrerequisites />} />
<Route path="/parent-login" element={<ParentLogin />} />
<Route path="/parent-verify-email" element={<ParentEmailVerification />} />
<Route path="/parent-dashboard" element={user ? <ParentDashboard /> : <Navigate to="/parent-login" />} />


{/* RTD Learning Routes */}
<Route path="/rtd-learning-login" element={
  user ? <Navigate to="/rtd-learning-dashboard" /> : <RTDLearningLogin />
} />
<Route path="/rtd-learning-dashboard" element={
  user && !isStaff(user) ? <RTDLearningDashboard /> : <Navigate to="/rtd-learning-login" />
} />

{/* RTD Learning Admin Routes */}
<Route path="/rtd-learning-admin-login" element={
  user && ['kyle@rtdacademy.com', 'stan@rtdacademy.com', 'marc@rtdacademy.com'].includes(user.email?.toLowerCase()) ? <Navigate to="/rtd-learning-admin-dashboard" /> : <RTDLearningAdminLogin />
} />
<Route path="/rtd-learning-admin-dashboard" element={
  user && ['kyle@rtdacademy.com', 'stan@rtdacademy.com', 'marc@rtdacademy.com'].includes(user.email?.toLowerCase()) ? <RTDLearningAdminDashboard /> : <Navigate to="/rtd-learning-admin-login" />
} />
        
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

<Route 
  path="/firebase-course/:courseId" 
  element={
    user && isStaff(user) ? 
    <TeacherFirebaseCourseView /> : 
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
        <Route path="/home-education-staff" element={
          user && isStaff(user) ? <Layout><HomeEducationStaffDashboard /></Layout> : <Navigate to="/staff-login" />
        } />
        
        <Route path="/file-storage" element={
          user && isStaff(user) ? <Layout><TeacherFileStorage /></Layout> : <Navigate to="/staff-login?redirect=/file-storage" />
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
        <Route path="/google-ai-chat" element={<GoogleAIChatPage />} />
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

function RTDConnectApp() {
  const { user, loading, isHomeEducationParent } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  return (
    <div className="RTDConnectApp">
      <Routes>
        {/* Public routes - always accessible */}
        <Route path="/" element={<RTDConnectLandingPage />} />
        <Route path="/facilitators" element={<FacilitatorsPage />} />
        <Route path="/facilitator/golda-david" element={<FacilitatorProfile1 />} />
        <Route path="/facilitator/marian-johnson" element={<FacilitatorProfile2 />} />
        <Route path="/facilitator/grace-anne-post" element={<FacilitatorProfile3 />} />
        
        <Route path="/login" element={
          user && isHomeEducationParent ? <Navigate to="/dashboard" /> : <RTDConnectLogin />
        } />

        {/* Protected routes - require login and home education parent status */}
        <Route path="/dashboard" element={
          user && isHomeEducationParent ? <RTDConnectDashboard /> : <Navigate to="/login" />
        } />

   

        {/* Shared routes */}
        <Route path="/auth-action-handler" element={<MultiActionAuthHandler />} />
        
        {/* Catch-all route - redirect unknown paths to landing page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  // Check which site we're running
  const siteType = process.env.REACT_APP_SITE;
  console.log('Site Type:', siteType || 'main', process.env.REACT_APP_SITE);
  
  if (siteType === 'second') {
    return <EdBotzApp />;
  } else if (siteType === 'rtdconnect') {
    return <RTDConnectApp />;
  } else {
    return <MainApp />;
  }
}

export default App;