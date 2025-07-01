import React from 'react';
import { X, Download, FileText, BookOpen, ExternalLink, Calculator, Maximize2 } from 'lucide-react';

const CourseResources = ({ course, isOpen, onClose }) => {
  // Extract course data from the course prop
  const courseConfig = course?.Gradebook?.courseConfig || {};
  const courseDetails = course?.courseDetails || {};
  
  // Try multiple paths for resources - new structure first, then legacy
  const resources = courseConfig?.courseOutline?.resources || 
                   courseDetails?.courseConfig?.courseOutline?.resources || 
                   courseConfig?.resources || 
                   {};
  
  // Function to open calculator in popup window
  const openCalculatorWindow = (resource) => {
    // Extract the src URL from the embed code
    const srcMatch = resource.embedCode.match(/src="([^"]+)"/);
    const calculatorUrl = srcMatch ? srcMatch[1] : '';
    
    if (calculatorUrl) {
      // Open in a popup window with specific dimensions
      const width = 650;
      const height = 850;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      window.open(
        calculatorUrl,
        'TI84Calculator',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes`
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Course Resources
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Official Resources */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Official Course Materials
                </h3>
                
                <div className="space-y-3">
                  {Object.entries(resources).map(([key, resource]) => (
                    <div key={key}>
                      {resource.type === 'embed' ? (
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <button
                            onClick={() => openCalculatorWindow(resource)}
                            className="w-full flex items-start gap-3 text-left"
                          >
                            <div className="flex-shrink-0 mt-1">
                              <Calculator className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
                                {resource.title}
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {resource.description}
                              </p>
                              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                                <Maximize2 className="h-4 w-4" />
                                <span>Open in new window</span>
                              </div>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3"
                          >
                            <div className="flex-shrink-0 mt-1">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base font-medium text-gray-900 flex items-center gap-2">
                                {resource.title}
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {resource.description}
                              </p>
                              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                                <Download className="h-4 w-4" />
                                <span>Download PDF</span>
                              </div>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Resources Section - Placeholder for future resources */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Additional Resources
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-600">
                    Additional course resources will be added here as they become available.
                  </p>
                </div>
              </div>

              {/* Course Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-2">Course Information</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Course:</span> {courseConfig.title || courseDetails.Title}
                  </p>
                  <p>
                    <span className="font-medium">Credits:</span> {courseDetails.courseCredits || 5}
                  </p>
                  <p>
                    <span className="font-medium">Hours:</span> {courseDetails.NumberOfHours || 125}
                  </p>
                  {courseDetails.DiplomaCourse === "Yes" && (
                    <p>
                      <span className="font-medium">Diploma Course:</span> Yes (30% of final grade)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseResources;