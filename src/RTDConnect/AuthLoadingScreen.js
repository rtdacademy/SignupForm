import React from 'react';
import { Loader2 } from 'lucide-react';

const RTDConnectLogo = () => (
  <div className="flex items-center justify-center space-x-4 mb-8">
    <img 
      src="/connectImages/Connect.png" 
      alt="RTD Connect Logo"
      className="h-16 w-auto"
    />
    <div className="text-center">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
        RTD Connect
      </h1>
      <p className="text-lg text-gray-600 font-medium">Home Education Portal</p>
    </div>
  </div>
);

const AuthLoadingScreen = ({ message = "Completing your sign-in..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50 flex flex-col justify-center items-center py-12 px-4">
      <div className="max-w-md w-full">
        <RTDConnectLogo />
        
        <div className="bg-white rounded-lg shadow-xl p-8 text-center border border-purple-100">
          <div className="mb-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-500" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Signing you in...
          </h2>
          
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Verifying your account</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              <span>Setting up your dashboard</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-400"></div>
              <span>Loading your family information</span>
            </div>
          </div>
          
          <div className="mt-6 text-xs text-gray-400">
            This may take a few moments...
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;