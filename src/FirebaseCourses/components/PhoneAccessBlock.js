import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, RefreshCw } from 'lucide-react';
import { getPhoneBlockMessage } from '../../utils/deviceDetection';

const PhoneAccessBlock = ({ deviceInfo, onRetry }) => {
  const [message, setMessage] = useState(getPhoneBlockMessage());
  
  // Change message every 10 seconds for entertainment
  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(getPhoneBlockMessage());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Smartphone className="w-16 h-16" />
                <div className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-1">
                  <span className="text-2xl">🚫</span>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center">{message.title}</h1>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            <p className="text-gray-700 text-center leading-relaxed">
              {message.message}
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <p className="text-sm text-blue-700">
                {message.submessage}
              </p>
            </div>
            
            {/* Device Info Box */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Device Detected:</h3>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{deviceInfo.deviceSummary}</span>
                </div>
                <div className="flex justify-between">
                  <span>Screen:</span>
                  <span className="font-medium">{deviceInfo.screenWidth}x{deviceInfo.screenHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Touch Support:</span>
                  <span className="font-medium">{deviceInfo.touchPoints > 0 ? `Yes (${deviceInfo.touchPoints} points)` : 'No'}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={onRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Check Again
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
            
            {/* Helpful tip */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <Monitor className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">Pro tip:</p>
                  <p>This course includes typing exercises that require a physical keyboard. You'll need at least 10 fingers (thumbs don't count double).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Seriously though, come back on a computer. We'll wait. ⌨️
        </p>
      </div>
    </div>
  );
};

export default PhoneAccessBlock;