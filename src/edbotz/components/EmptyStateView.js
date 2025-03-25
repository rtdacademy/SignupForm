import React from 'react';
import { Bot, ArrowRight, PlusCircle, ArrowLeft } from 'lucide-react';

const EmptyStateView = ({ message }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Animated Bot Icon Container */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative">
            <Bot className="w-16 h-16 mx-auto text-blue-600 animate-float" />
          </div>
        </div>
        
        {/* Title with Gradient */}
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Your AI Assistant
        </h2>
        
      
        {/* Quick Start */}
        <div className="mb-8 bg-white rounded-lg p-3 shadow-md border border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Quick Start</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Click the "Create New Assistant" button in the sidebar to quickly set up your first AI assistant</p>
         
        </div>

        {/* Divider */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gray-50 px-4 text-sm text-gray-500">OR</span>
          </div>
        </div>
        
        {/* Step by Step Guide */}
        <div className="space-y-4 text-left bg-white rounded-lg p-3 shadow-md border border-gray-100">
        
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Select a Location</p>
              <p className="text-sm text-gray-500">Choose a course or unit from the sidebar</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-purple-600">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Choose an Assistant</p>
              <p className="text-sm text-gray-500">Pick an AI assistant or create a new one</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-indigo-600">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Start Testing</p>
              <p className="text-sm text-gray-500">Interact with your AI assistant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateView;