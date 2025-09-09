import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// EdBotz imports
import EdBotzDashboard from '../edbotz/Dashboard';
import EdBotzLogin from '../edbotz/Login';
import EdBotzLayout from '../edbotz/EdBotzLayout';
import StudentPortal from '../edbotz/StudentPortal';
import CourseManagement from '../edbotz/CourseManagement';
import GoogleAIChatPage from '../edbotz/GoogleAIChat/GoogleAIChatPage';
import MultiActionAuthHandler from '../MultiActionAuthHandler';

// Legal page imports
import PrivacyStatement from '../legal/PrivacyStatement';
import TermsAndConditions from '../legal/TermsAndConditions';

import ScrollToTop from '../components/ScrollToTop';

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
      <ScrollToTop />
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

        {/* Legal pages */}
        <Route path="/privacy" element={<PrivacyStatement />} />
        <Route path="/terms" element={<TermsAndConditions />} />

        {/* Shared routes */}
        <Route path="/auth-action-handler" element={<MultiActionAuthHandler />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default EdBotzApp;