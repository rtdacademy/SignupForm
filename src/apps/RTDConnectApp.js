import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// RTDConnect imports
import RTDConnectLogin from '../RTDConnect/Login';
import RTDConnectDashboard from '../RTDConnect/Dashboard';
import RTDConnectLandingPage from '../RTDConnect/LandingPage';
import FacilitatorProfile1 from '../RTDConnect/FacilitatorProfile1';
import FacilitatorProfile2 from '../RTDConnect/FacilitatorProfile2';
import FacilitatorProfile3 from '../RTDConnect/FacilitatorProfile3';
import FacilitatorProfile4 from '../RTDConnect/FacilitatorProfile4';
import FacilitatorProfile5 from '../RTDConnect/FacilitatorProfile5';
import AboutPage from '../RTDConnect/pages/AboutPage';
import FAQPage from '../RTDConnect/pages/FAQPage';
import FundingPage from '../RTDConnect/pages/FundingPage';
import BioPage from '../RTDConnect/pages/BioPage';
import MultiActionAuthHandler from '../MultiActionAuthHandler';
import FlowChartPrerequisites from '../components/PrerequisiteFlowChart/FlowChartPrerequisites';

// Legal page imports
import PrivacyStatement from '../legal/PrivacyStatement';
import TermsAndConditions from '../legal/TermsAndConditions';

import ScrollToTop from '../components/ScrollToTop';

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
      <ScrollToTop />
      <Routes>
        {/* Public routes - always accessible */}
        <Route path="/" element={<RTDConnectLandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/bio" element={<BioPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/funding" element={<FundingPage />} />
        <Route path="/facilitator/golda-david" element={<FacilitatorProfile1 />} />
        <Route path="/facilitator/marian-johnson" element={<FacilitatorProfile2 />} />
        <Route path="/facilitator/grace-anne-post" element={<FacilitatorProfile3 />} />
        <Route path="/facilitator/elise" element={<FacilitatorProfile4 />} />
        <Route path="/facilitator/kari-luther" element={<FacilitatorProfile5 />} />
        
        {/* Legal pages */}
        <Route path="/privacy" element={<PrivacyStatement />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/prerequisite-flowchart" element={<FlowChartPrerequisites />} />
        
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

export default RTDConnectApp;