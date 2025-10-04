// src/Website/AcademicCalendarPage.js
import React from 'react';
import { Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import AcademicCalendarCustom from './components/AcademicCalendarCustom';
import { getRegistrationStatus } from './websiteConfig';

// RTD Logo Component
const RTDLogo = ({ className = "w-12 h-12" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 75 75"
    className={className}
    role="img"
    aria-label="RTD Academy Logo"
  >
    <g transform="translate(10, 15)">
      <polygon points="40 0 46.5 12 53 24 40 24 27 24 33.5 12 40 0" fill="#0F766E"/>
      <polygon points="53 24 59.5 36 66 48 53 48 40 48 46.5 36 53 24" fill="#E0FFFF"/>
      <polygon points="27 24 33.5 36 40 48 27 48 14 48 20.5 36 27 24" fill="#14B8A6"/>
    </g>
  </svg>
);

/**
 * Academic Calendar Page
 * Standalone page for viewing the school year calendar
 */
const AcademicCalendarPage = () => {
  const navigate = useNavigate();
  const registrationStatus = getRegistrationStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/30 via-white to-cyan-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Name */}
            <div className="flex items-center gap-3">
              <RTDLogo className="w-10 h-10" />
              <span className="font-bold text-lg text-gray-900">
                RTD Academy
              </span>
            </div>

            {/* Calendar Title with Badge */}
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-teal-600" />
              <h1 className="text-xl font-bold text-gray-900">Academic Calendar</h1>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full">
                <span className="text-white font-semibold text-sm">{registrationStatus.schoolYearDisplay}</span>
              </div>
            </div>

            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-teal-100/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Calendar Component */}
          <div className="max-w-7xl mx-auto">
            <AcademicCalendarCustom
              userRole="public"
              dateRangeMonths={6}
              className="bg-white rounded-xl p-6 shadow-2xl"
            />
          </div>

          {/* Additional Information */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              All dates are subject to change. Please check regularly for updates.
            </p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => navigate('/get-started')}
                className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/student-faq')}
                className="border-teal-600 text-teal-600 hover:bg-teal-50"
              >
                View FAQs
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AcademicCalendarPage;
