import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ScrollToTop from '../components/ScrollToTop';
import PageLoader from '../components/PageLoader';

// Lazy load all website components for better performance
const RTDLandingPage = lazy(() => import('../Website/RTDLandingPage'));
const AdultStudentInfo = lazy(() => import('../Website/AdultStudentInfo'));
const InternationalStudentInfo = lazy(() => import('../Website/InternationalStudentInfo'));
const StudentFAQ = lazy(() => import('../Website/StudentFAQ'));
const ContactPage = lazy(() => import('../Website/ContactPage'));
const GetStartedNow = lazy(() => import('../Website/GetStartedNow'));
const PoliciesAndReports = lazy(() => import('../Website/PoliciesAndReports'));
const OpenCoursesEntry = lazy(() => import('../OpenCourses/OpenCoursesEntry'));
const OpenCoursesDashboard = lazy(() => import('../OpenCourses/OpenCoursesDashboard'));
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
          <Route path="/contact" element={<ContactPage />} />

          {/* Registration */}
          <Route path="/get-started" element={<GetStartedNow />} />

          {/* Open Courses */}
          <Route path="/open-courses" element={<OpenCoursesEntry />} />
          <Route path="/open-courses-dashboard" element={<OpenCoursesDashboard />} />

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