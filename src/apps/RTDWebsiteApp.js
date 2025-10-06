import React, { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import PageLoader from '../components/PageLoader';
import AcademicCalendar from '../Website/AcademicCalendar';

// Lazy load all website components for better performance
const RTDLandingPage = lazy(() => import('../Website/RTDLandingPage'));
const AdultStudentInfo = lazy(() => import('../Website/AdultStudentInfo'));
const InternationalStudentInfo = lazy(() => import('../Website/InternationalStudentInfo'));
const StudentFAQ = lazy(() => import('../Website/StudentFAQ'));
const GetStartedNow = lazy(() => import('../Website/GetStartedNow'));
const PoliciesAndReports = lazy(() => import('../Website/PoliciesAndReports'));
// const AcademicCalendar = lazy(() => import('../Website/AcademicCalendar')); // Changed to normal import for speed testing
const OpenCoursesEntry = lazy(() => import('../OpenCourses/OpenCoursesEntry'));
const OpenCoursesDashboard = lazy(() => import('../OpenCourses/OpenCoursesDashboard'));
const OpenCourseViewer = lazy(() => import('../OpenCourses/OpenCourseViewer'));
const FlowChartPrerequisites = lazy(() => import('../components/PrerequisiteFlowChart/FlowChartPrerequisites'));

// Legal pages
const PrivacyStatement = lazy(() => import('../legal/PrivacyStatement'));
const TermsAndConditions = lazy(() => import('../legal/TermsAndConditions'));

// AERR and Education Plan pages
const AERR2324 = lazy(() => import('../Website/AERR/23_24/AERR2324'));
const EducationPlan = lazy(() => import('../Website/EducationPlan/24_25/EducationPlan'));

// Policy pages
const ConflictOfInterestPolicy = lazy(() => import('../Website/Policies/ConflictOfInterestPolicy'));
const MobileDevicePolicy = lazy(() => import('../Website/Policies/MobileDevicePolicy'));

function RTDWebsiteApp() {
  // Initialize Crisp Chat for website
  useEffect(() => {
    // Initialize Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "e35b0a24-b040-4122-b990-fc721c10cf80";

    // Create and append the script
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const scripts = document.querySelectorAll('script[src="https://client.crisp.chat/l.js"]');
      scripts.forEach(s => s.remove());

      // Clean up Crisp variables
      delete window.$crisp;
      delete window.CRISP_WEBSITE_ID;

      // Remove Crisp chat widget if it exists
      const crispContainer = document.getElementById('crisp-chatbox');
      if (crispContainer) {
        crispContainer.remove();
      }
    };
  }, []);

  return (
    <div className="RTDWebsiteApp">
      <ScrollToTop />
      <Suspense fallback={<PageLoader message="Loading page..." />}>
        <Routes>
          {/* Main landing page */}
          <Route path="/" element={<RTDLandingPage />} />

          {/* Information pages */}
          <Route path="/adult-students" element={<AdultStudentInfo />} />
          <Route path="/international-students" element={<InternationalStudentInfo />} />
          <Route path="/student-faq" element={<StudentFAQ />} />
          <Route path="/calendar" element={<AcademicCalendar />} />

          {/* Registration */}
          <Route path="/get-started" element={<GetStartedNow />} />

          {/* Open Courses */}
          <Route path="/open-courses" element={<OpenCoursesEntry />} />
          <Route path="/open-courses-dashboard" element={<OpenCoursesDashboard />} />
          <Route path="/open-courses/view/:courseId" element={<OpenCourseViewer />} />

          {/* Prerequisite Flow Chart */}
          <Route path="/prerequisites" element={<FlowChartPrerequisites />} />

          {/* Policies and Reports */}
          <Route path="/policies-reports" element={<PoliciesAndReports />} />
          <Route path="/conflict-of-interest-policy" element={<ConflictOfInterestPolicy />} />
          <Route path="/mobile-device-policy" element={<MobileDevicePolicy />} />

          {/* AERR and Education Plans */}
          <Route path="/aerr-2324" element={<AERR2324 />} />
          <Route path="/education-plan-2425" element={<EducationPlan />} />

          {/* Legal pages */}
          <Route path="/privacy" element={<PrivacyStatement />} />
          <Route path="/terms" element={<TermsAndConditions />} />

          {/* Student Portal Login - redirect to main app */}
          <Route path="/login" element={
            <Navigate to={`${window.location.protocol}//${window.location.hostname}:${window.location.port}/login`} replace />
          } />

          {/* Catch-all route - redirect unknown paths to landing page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default RTDWebsiteApp;