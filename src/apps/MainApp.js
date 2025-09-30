import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Only import critical components that are needed immediately
import Login from '../Dashboard/Login';
import StaffLogin from '../Admin/StaffLogin';
import Layout from '../Layout/Layout';
import SessionTimeoutWarning from '../components/SessionTimeoutWarning';
import ScrollToTop from '../components/ScrollToTop';
import PageLoader from '../components/PageLoader';

// Lazy load ALL other components for better performance
const Dashboard = lazy(() => import('../Dashboard/Dashboard'));
const OpenCoursesComingSoon = lazy(() => import('../OpenCourses/OpenCoursesComingSoon'));
const TeacherDashboard = lazy(() => import('../TeacherDashboard/TeacherDashboard'));
const TeacherFileStorage = lazy(() => import('../TeacherDashboard/TeacherFileStorage'));
const LMSWrapper = lazy(() => import('../Dashboard/LMSWrapper'));
const Courses = lazy(() => import('../courses/Courses'));
const ModernCourseViewer = lazy(() => import('../courses/CourseViewer/ModernCourseViewer'));
const CourseEditor = lazy(() => import('../courses/CourseEditor/CourseEditor'));
const CourseOutline = lazy(() => import('../courses/CourseOutline'));
const EmployeePortal = lazy(() => import('../TeacherDashboard/EmployeePortal'));
const MultiActionAuthHandler = lazy(() => import('../MultiActionAuthHandler'));

// Lazy load public forms
const ContractorInvoiceForm = lazy(() => import('../PublicForms/ContractorInvoiceForm'));

// Lazy load website pages
const GetStartedNow = lazy(() => import('../Website/GetStartedNow'));
const AdultStudentInfo = lazy(() => import('../Website/AdultStudentInfo'));
const InternationalStudentInfo = lazy(() => import('../Website/InternationalStudentInfo'));

// Lazy load schedule components
const ScheduleMaker = lazy(() => import('../Schedule/ScheduleMaker'));
const YourWayScheduleMaker = lazy(() => import('../Schedule/YourWayScheduleMaker'));
const IcsUpload = lazy(() => import('../Schedule/IcsUpload'));

// Lazy load AI and special features
const GeminiChat = lazy(() => import('../AI/GeminiChat'));
const JSXGraphTest = lazy(() => import('../components/JSXGraphTest'));
const ExamResults = lazy(() => import('../components/ExamResults'));

// Lazy load migration components
const MigrationLogin = lazy(() => import('../migration/MigrationLogin'));

// Lazy load payment components
const PaymentResult = lazy(() => import('../Dashboard/PaymentResult'));
const CancelledPayment = lazy(() => import('../Dashboard/CancelledPayment'));

// Lazy load student management
const Emulate = lazy(() => import('../StudentManagement/Emulate'));
const TeacherFirebaseCourseView = lazy(() => import('../StudentManagement/TeacherFirebaseCourseView'));

// Lazy load parent portal
const ParentLogin = lazy(() => import('../ParentPortal/ParentLogin'));
const ParentDashboard = lazy(() => import('../ParentPortal/ParentDashboard'));
const ParentEmailVerification = lazy(() => import('../ParentPortal/ParentEmailVerification'));

// Lazy load RTD Learning components
const RTDLearningLogin = lazy(() => import('../rtdLearning/Login'));
const RTDLearningDashboard = lazy(() => import('../rtdLearning/Dashboard'));
const RTDLearningAdminLogin = lazy(() => import('../rtdLearning/AdminLogin'));
const RTDLearningAdminDashboard = lazy(() => import('../rtdLearning/AdminDashboard'));

// Lazy load Home Education components
const HomeEducationStaffDashboard = lazy(() => import('../HomeEducation/HomeEducationStaffDashboard'));
const RegistrarDashboard = lazy(() => import('../HomeEducation/RegistrarDashboard'));

// Lazy load legal and misc pages
const PrivacyStatement = lazy(() => import('../legal/PrivacyStatement'));
const TermsAndConditions = lazy(() => import('../legal/TermsAndConditions'));
const FlowChartPrerequisites = lazy(() => import('../components/PrerequisiteFlowChart/FlowChartPrerequisites'));
const PublicPortfolioEntry = lazy(() => import('../PortfolioManager/components/PublicPortfolioEntry'));
const PublicPortfolioView = lazy(() => import('../PortfolioManager/components/PublicPortfolioView'));
const StandalonePortfolioView = lazy(() => import('../PortfolioManager/components/StandalonePortfolioView'));

// Lazy load video sharing
const VideoPlayerPage = lazy(() => import('../pages/VideoPlayerPage'));

// Firebase app import - keep this as is since it's needed for initialization
import app from '../firebase';

// Protected Route wrapper with Suspense
const ProtectedRoute = ({ children, requireStaff = false }) => {
  const { user, loading, isStaff } = useAuth();

  if (loading) return <PageLoader message="Checking authentication..." />;
  
  if (!user) return <Navigate to="/login" />;
  
  if (requireStaff && !isStaff(user)) {
    return <Navigate to="/staff-login" />;
  }

  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
};

// Public Route wrapper with Suspense for lazy loaded components
const PublicRoute = ({ children }) => {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
};

function MainApp() {
  const { user, loading, isStaff } = useAuth();

  // Enable debug info in development mode or with a query parameter
  const isDebugMode = process.env.NODE_ENV === 'development' || 
    new URLSearchParams(window.location.search).has('debug');

  if (loading) {
    return <PageLoader message="Loading application..." />;
  }

  return (
    <div className="App">
      {user && <SessionTimeoutWarning showDebugInfo={isDebugMode} />}
      <ScrollToTop />
      <Routes>
        {/* Critical routes - Login pages (not lazy loaded for fast initial access) */}
        <Route path="/login" element={
          user ? (
            isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />
          ) : <Login />
        } />
        
        <Route path="/staff-login" element={
          user ? (
            user.email?.endsWith('@rtd-connect.com') ? 
              <Navigate to="/home-education-staff" /> : 
              <Navigate to="/teacher-dashboard" />
          ) : <StaffLogin />
        } />

        {/* Protected dashboard routes with lazy loading */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Get Started route - public registration page */}
        <Route path="/get-started" element={
          <PublicRoute>
            <GetStartedNow />
          </PublicRoute>
        } />

        {/* Adult Students Info route - public information page */}
        <Route path="/adult-students" element={
          <PublicRoute>
            <AdultStudentInfo />
          </PublicRoute>
        } />

        {/* International Students Info route - public information page */}
        <Route path="/international-students" element={
          <PublicRoute>
            <InternationalStudentInfo />
          </PublicRoute>
        } />

        <Route path="/teacher-dashboard" element={
          <ProtectedRoute requireStaff>
            <Layout><TeacherDashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/home-education-staff" element={
          <ProtectedRoute requireStaff>
            <Layout><HomeEducationStaffDashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/registrar" element={
          <ProtectedRoute requireStaff>
            <Layout><RegistrarDashboard /></Layout>
          </ProtectedRoute>
        } />

        {/* Course routes - heavy components */}
        <Route path="/modern-course/:courseId?" element={
          <ProtectedRoute>
            <ModernCourseViewer />
          </ProtectedRoute>
        } />

        <Route path="/course-editor/:courseId?" element={
          <ProtectedRoute requireStaff>
            <CourseEditor />
          </ProtectedRoute>
        } />

        <Route path="/course-outline/:courseId" element={
          <PublicRoute>
            <CourseOutline />
          </PublicRoute>
        } />

        <Route path="/course" element={
          <ProtectedRoute>
            <LMSWrapper />
          </ProtectedRoute>
        } />

        <Route path="/courses" element={
          <ProtectedRoute requireStaff>
            <Layout><Courses /></Layout>
          </ProtectedRoute>
        } />

        {/* Employee/Staff routes */}
        <Route path="/employee-portal" element={
          <ProtectedRoute requireStaff>
            <Layout><EmployeePortal /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/file-storage" element={
          <ProtectedRoute requireStaff>
            <Layout><TeacherFileStorage /></Layout>
          </ProtectedRoute>
        } />

        {/* Student management routes */}
        <Route path="/emulate/:studentEmail" element={
          <ProtectedRoute requireStaff>
            <Emulate />
          </ProtectedRoute>
        } />

        <Route path="/firebase-course/:courseId" element={
          <ProtectedRoute requireStaff>
            <TeacherFirebaseCourseView />
          </ProtectedRoute>
        } />

        {/* Payment routes */}
        <Route path="/payment/result" element={
          <ProtectedRoute>
            <PaymentResult />
          </ProtectedRoute>
        } />

        <Route path="/payment/cancelled" element={
          <ProtectedRoute>
            <CancelledPayment />
          </ProtectedRoute>
        } />

        {/* Parent portal routes */}
        <Route path="/parent-login" element={
          <PublicRoute>
            <ParentLogin />
          </PublicRoute>
        } />

        <Route path="/parent-verify-email" element={
          <PublicRoute>
            <ParentEmailVerification />
          </PublicRoute>
        } />

        <Route path="/parent-dashboard" element={
          <ProtectedRoute>
            <ParentDashboard />
          </ProtectedRoute>
        } />

        {/* RTD Learning Routes */}
        <Route path="/rtd-learning-login" element={
          user ? <Navigate to="/rtd-learning-dashboard" /> : 
          <PublicRoute><RTDLearningLogin /></PublicRoute>
        } />

        <Route path="/rtd-learning-dashboard" element={
          <ProtectedRoute>
            <RTDLearningDashboard />
          </ProtectedRoute>
        } />

        <Route path="/rtd-learning-admin-login" element={
          user && ['kyle@rtdacademy.com', 'stan@rtdacademy.com', 'marc@rtdacademy.com'].includes(user.email?.toLowerCase()) ? 
            <Navigate to="/rtd-learning-admin-dashboard" /> : 
            <PublicRoute><RTDLearningAdminLogin /></PublicRoute>
        } />

        <Route path="/rtd-learning-admin-dashboard" element={
          user && ['kyle@rtdacademy.com', 'stan@rtdacademy.com', 'marc@rtdacademy.com'].includes(user.email?.toLowerCase()) ?
            <Suspense fallback={<PageLoader />}><RTDLearningAdminDashboard /></Suspense> :
            <Navigate to="/rtd-learning-admin-login" />
        } />

        {/* Schedule routes */}
        <Route path="/schedule-maker" element={
          <ProtectedRoute requireStaff>
            <Layout><ScheduleMaker /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/ics-upload" element={
          <ProtectedRoute requireStaff>
            <Layout><IcsUpload /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/your-way" element={
          <PublicRoute>
            <YourWayScheduleMaker />
          </PublicRoute>
        } />

        {/* AI features */}
        <Route path="/ai-chat" element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<PageLoader />}>
                <GeminiChat firebaseApp={app} />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/google-ai-chat" element={
          <Suspense fallback={<PageLoader />}>
            {React.createElement(lazy(() => import('../edbotz/GoogleAIChat/GoogleAIChatPage')))}
          </Suspense>
        } />

        <Route path="/jsxgraph-test" element={
          <PublicRoute>
            <JSXGraphTest />
          </PublicRoute>
        } />

        {/* Exam results */}
        <Route path="/exam-results/:sessionId" element={
          <ProtectedRoute>
            <ExamResults />
          </ProtectedRoute>
        } />

        {/* Public website pages */}
        {/* Legal pages */}
        <Route path="/privacy" element={
          <PublicRoute>
            <PrivacyStatement />
          </PublicRoute>
        } />

        <Route path="/terms" element={
          <PublicRoute>
            <TermsAndConditions />
          </PublicRoute>
        } />

        <Route path="/prerequisite-flowchart" element={
          <PublicRoute>
            <FlowChartPrerequisites />
          </PublicRoute>
        } />

        {/* Public video sharing */}
        <Route path="/video/:videoId" element={
          <PublicRoute>
            <VideoPlayerPage />
          </PublicRoute>
        } />

        {/* Public portfolio viewers */}
        <Route path="/portfolio/:familyId/:entryId" element={
          <PublicRoute>
            <PublicPortfolioEntry />
          </PublicRoute>
        } />

        <Route path="/portfolio/:familyId/course/:courseId" element={
          <PublicRoute>
            <PublicPortfolioView />
          </PublicRoute>
        } />

        {/* Portfolio manager with URL-based navigation */}
        <Route path="/portfolio/:familyId/:studentId/:schoolYear/:structureId?" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <StandalonePortfolioView />
            </Suspense>
          </ProtectedRoute>
        } />

        {/* Public forms */}
        <Route path="/contractor-invoice" element={
          <PublicRoute>
            <ContractorInvoiceForm />
          </PublicRoute>
        } />

        {/* Auth and migration */}
        <Route path="/auth-action-handler" element={
          <PublicRoute>
            <MultiActionAuthHandler />
          </PublicRoute>
        } />

        <Route path="/migrate" element={
          user ? (
            isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />
          ) : <PublicRoute><MigrationLogin /></PublicRoute>
        } />

        {/* Default route */}
        <Route path="/" element={
          user ? (
            isStaff(user) ? <Navigate to="/teacher-dashboard" /> : <Navigate to="/dashboard" />
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </div>
  );
}

export default MainApp;