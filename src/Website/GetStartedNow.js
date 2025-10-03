import React, { useState } from 'react';
import Login from '../Dashboard/Login';
import StudentTypeSelector from '../Registration/StudentTypeSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { CheckCircle2, ArrowLeft } from 'lucide-react';

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

const GetStartedNow = () => {
  const [studentType, setStudentType] = useState('');
  
  const handleStudentTypeSelect = (type) => {
    setStudentType(type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/20 relative">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-full blur-3xl opacity-25 animate-pulse-slow" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-tr from-purple-200 to-teal-200 rounded-full blur-3xl opacity-20 animate-pulse-slow animation-delay-2000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-bl from-cyan-100 to-teal-100 rounded-full blur-3xl opacity-15" />
      </div>

      {/* Header with Back Button */}
      <header className="bg-white shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Name */}
            <div className="flex items-center gap-3">
              <RTDLogo className="w-10 h-10" />
              <span className="font-bold text-lg bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent">
                RTD Academy
              </span>
            </div>

            {/* Back Button */}
            <Button
              onClick={() => window.location.href = 'https://www.rtdacademy.com/'}
              variant="outline"
              className="border-teal-600 text-teal-700 hover:bg-teal-50 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 bg-gradient-to-br from-white/50 to-teal-50/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent">
                Get Started with RTD Academy
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who are already experiencing personalized learning
              through our innovative online platform.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Getting Started Info */}
          <div className="space-y-8">
            {/* Next Steps Card */}
            <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-teal-100 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Next Steps
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  {studentType ? (
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                      1
                    </div>
                  )}
                  <div className="ml-4 flex-1">
                    <p className="text-gray-900 font-semibold">
                      Determine your student type
                    </p>
                    {studentType && (
                      <p className="text-sm text-green-600 mt-1 font-medium">
                        ✓ Completed - You are a {studentType} student
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    2
                  </div>
                  <p className="ml-4 text-gray-700 font-medium mt-2">
                    Create your account through the Secure Sign-In Process
                  </p>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-teal-600 to-cyan-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                    3
                  </div>
                  <p className="ml-4 text-gray-700 font-medium mt-2">
                    Complete your profile and start exploring courses
                  </p>
                </div>
              </div>
            </div>

            {/* Student Type Section */}
            <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-teal-100 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Determine Your Student Type
              </h2>
              <p className="text-gray-700 mb-6">
                Before enrolling, it's important to know your student type as this affects your registration process and course options.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 hover:from-teal-700 hover:via-cyan-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all">
                    Find Your Student Type
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Student Type Determination</DialogTitle>
                    <DialogDescription>
                      Answer a few questions to determine your student category.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <StudentTypeSelector onStudentTypeSelect={handleStudentTypeSelect} />
                  </div>
                </DialogContent>
              </Dialog>
              {studentType && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    ✓ You've identified as a <strong>{studentType}</strong> student.
                  </p>
                </div>
              )}
            </div>

            {/* Sign In Information Card */}
            <div className="relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-teal-100 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Secure Sign-In Process
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  To enroll in our courses, you'll need to create a secure account. We recommend these simple options:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-3 text-gray-700">
                      <span className="font-semibold">Sign in with Google or Microsoft</span> - The fastest way to get started using your existing account
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-3 text-gray-700">
                      <span className="font-semibold">Email and Password</span> - Create an account with your email address and verify through the confirmation link we'll send
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Login Component */}
          <div className="lg:sticky lg:top-8">
            <Login 
              hideWelcome={true}
              startWithSignUp={true}
              compactView={true}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-b from-gray-100 to-gray-200 text-gray-700 py-12 mt-16 border-t border-gray-300 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RTDLogo className="w-8 h-8" />
              <span className="font-bold text-lg bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 bg-clip-text text-transparent">
                RTD Academy
              </span>
            </div>
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} RTD Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GetStartedNow;