import React, { useState } from 'react';
import Login from '../Dashboard/Login';
import StudentTypeSelector from '../Registration/StudentTypeSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { CheckCircle2 } from 'lucide-react';

const GetStartedNow = () => {
  const [studentType, setStudentType] = useState('');
  
  const handleStudentTypeSelect = (type) => {
    setStudentType(type);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Get Started with RTD Academy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of students who are already experiencing personalized learning 
              through our innovative online platform.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Getting Started Info */}
          <div className="space-y-8">
            {/* Next Steps Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Next Steps
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  {studentType ? (
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                  )}
                  <div className="ml-4">
                    <p className="text-gray-700 font-medium">
                      Determine your student type
                    </p>
                    {studentType && (
                      <p className="text-sm text-green-600 mt-1">
                        Completed - You are a {studentType} student
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <p className="ml-4 text-gray-700">
                    Create your account through the Secure Sign-In Process
                  </p>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <p className="ml-4 text-gray-700">
                    Complete your profile and start exploring courses
                  </p>
                </div>
              </div>
            </div>

            {/* Student Type Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Determine Your Student Type
              </h2>
              <p className="text-gray-700 mb-6">
                Before enrolling, it's important to know your student type as this affects your registration process and course options.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Find Your Student Type</Button>
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
                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-green-800">
                    You've identified as a <strong>{studentType}</strong> student.
                  </p>
                </div>
              )}
            </div>

            {/* Sign In Information Card */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Secure Sign-In Process
              </h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  To enroll in our courses, you'll need to create a secure account. We recommend these simple options:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-3 text-gray-700">
                      <span className="font-medium">Sign in with Google or Microsoft</span> - The fastest way to get started using your existing account
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-primary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="ml-3 text-gray-700">
                      <span className="font-medium">Email and Password</span> - Create an account with your email address and verify through the confirmation link we'll send
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
      <footer className="mt-8 text-center text-sm text-gray-500 pb-8">
        <p>&copy; {new Date().getFullYear()} RTD Academy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default GetStartedNow;