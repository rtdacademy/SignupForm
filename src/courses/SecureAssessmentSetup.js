import React, { useState, useEffect } from 'react';
import { FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const SecureAssessmentSetup = ({ item, unitIndex, itemIndex, onItemChange, isEditing }) => {
  const [urlInput, setUrlInput] = useState(item.secureUrl || '');
  const [validationStatus, setValidationStatus] = useState(null);
  const [extractedData, setExtractedData] = useState({
    courseId: item.secureCourseId || '',
    assessmentId: item.secureAssessmentId || ''
  });

  // Extract parameters from URL
  const extractUrlParameters = (url) => {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      const cid = params.get('cid');
      const aid = params.get('aid');
      
      if (cid && aid) {
        return {
          isValid: true,
          courseId: cid,
          assessmentId: aid
        };
      } else {
        return {
          isValid: false,
          error: 'URL must contain both cid and aid parameters'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid URL format'
      };
    }
  };

  // Validate and extract when URL changes
  useEffect(() => {
    if (urlInput) {
      const result = extractUrlParameters(urlInput);
      if (result.isValid) {
        setValidationStatus('valid');
        setExtractedData({
          courseId: result.courseId,
          assessmentId: result.assessmentId
        });
      } else {
        setValidationStatus('invalid');
        setExtractedData({ courseId: '', assessmentId: '' });
      }
    } else {
      setValidationStatus(null);
      setExtractedData({ courseId: '', assessmentId: '' });
    }
  }, [urlInput]);

  // Handle URL input change
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrlInput(newUrl);
  };

  // Save the URL and extracted data
  const handleSave = () => {
    if (validationStatus === 'valid') {
      // Create a complete update object with all secure assessment fields
      const secureData = {
        secureUrl: urlInput,
        secureCourseId: extractedData.courseId,
        secureAssessmentId: extractedData.assessmentId
      };
      
      // Call onItemChange once with all the data
      onItemChange(unitIndex, itemIndex, 'secure', secureData);
    }
  };

  // Clear secure assessment data
  const handleClear = () => {
    setUrlInput('');
    // Clear all secure fields at once
    const clearedData = {
      secureUrl: '',
      secureCourseId: '',
      secureAssessmentId: ''
    };
    onItemChange(unitIndex, itemIndex, 'secure', clearedData);
  };

  // Don't show for info type items
  if (item.type === 'info') {
    return null;
  }

  return (
    <div className="flex flex-col space-y-2 mt-2 px-8">
      <div className="flex items-center justify-between">
        <span className="font-medium flex items-center gap-2">
          <FaLock className="w-4 h-4" />
          Secure Assessment URL
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={handleUrlChange}
              placeholder="https://edge.rtdacademy.com/assess2/?cid=97&aid=7405#/"
              className="flex-1"
            />
            {urlInput && (
              <Button
                onClick={handleSave}
                variant="outline"
                disabled={validationStatus !== 'valid'}
                size="sm"
              >
                Save
              </Button>
            )}
            {item.secureUrl && (
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            )}
          </div>

          {urlInput && validationStatus && (
            <div className={`p-3 rounded-md ${
              validationStatus === 'valid' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {validationStatus === 'valid' ? (
                <div className="space-y-1">
                  <p className="text-green-700 flex items-center gap-2 text-sm">
                    <FaCheck className="w-4 h-4" />
                    Valid secure assessment URL
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Course ID:</span>
                      <span className="text-green-700">{extractedData.courseId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Assessment ID:</span>
                      <span className="text-green-700">{extractedData.assessmentId}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-red-700 flex items-center gap-2 text-sm">
                  <FaTimes className="w-4 h-4" />
                  Invalid URL format. URL must contain both cid and aid parameters.
                </p>
              )}
            </div>
          )}

          {!urlInput && !item.secureUrl && (
            <Alert>
              <AlertDescription>
                Enter a secure assessment URL to enable secure testing. The URL should be in the format:
                https://edge.rtdacademy.com/assess2/?cid=[courseId]&aid=[assessmentId]
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        item.secureUrl ? (
          <div className="bg-blue-50 p-4 rounded-md space-y-2">
            <p className="text-blue-700 flex items-center gap-2">
              <FaLock className="w-4 h-4" />
              Secure Assessment Configured
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Course ID:</span> {item.secureCourseId}
              </div>
              <div>
                <span className="font-medium">Assessment ID:</span> {item.secureAssessmentId}
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-medium">URL:</span>
              <div className="text-xs break-all mt-1">{item.secureUrl}</div>
            </div>
          </div>
        ) : (
          <Alert>
            <AlertDescription>
              No secure assessment URL configured.
            </AlertDescription>
          </Alert>
        )
      )}
    </div>
  );
};

export default SecureAssessmentSetup;