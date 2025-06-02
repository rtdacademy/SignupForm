import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

// Import both versions
import ManualContent from './manual';
import UiGeneratedContent from '../../../../components/content/UiGeneratedContent';

const IntroEthicsFinancialDecisions = (props) => {
  const { course, courseId, itemConfig, isStaffView, devMode } = props;
  
  const [contentMode, setContentMode] = useState('manual'); // 'manual' | 'uiGenerated'
  const [loading, setLoading] = useState(true);
  const [uiContentExists, setUiContentExists] = useState(false);

  useEffect(() => {
    const checkUIGeneratedContent = async () => {
      try {
        setLoading(true);
        
        const db = getDatabase();
        const lessonPath = itemConfig?.contentPath || '01-intro-ethics-financial-decisions';
        const codeRef = ref(db, `courseDevelopment/${courseId}/${lessonPath}`);
        const snapshot = await get(codeRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUiContentExists(true);
          
          // Auto-switch to UI-generated if it's enabled
          if (data.enabled) {
            setContentMode('uiGenerated');
          }
        }
      } catch (error) {
        console.error('Error checking UI-generated content:', error);
        // Fallback to manual on error
        setContentMode('manual');
      } finally {
        setLoading(false);
      }
    };

    checkUIGeneratedContent();
  }, [courseId, itemConfig]);

  // Allow staff to manually toggle between versions
  const toggleContentMode = () => {
    setContentMode(contentMode === 'manual' ? 'uiGenerated' : 'manual');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading content...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Staff Content Mode Indicator & Toggle */}
      {isStaffView && (
        <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Content Mode: 
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              contentMode === 'uiGenerated' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {contentMode === 'uiGenerated' ? '🚧 UI-Generated' : '📄 Manual'}
            </span>
            
            {uiContentExists && (
              <button
                onClick={toggleContentMode}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Switch to {contentMode === 'manual' ? 'UI-Generated' : 'Manual'}
              </button>
            )}
          </div>
          
          {!uiContentExists && (
            <span className="text-xs text-gray-500">
              No UI-generated content available
            </span>
          )}
        </div>
      )}

      {/* Render the appropriate content */}
      {contentMode === 'uiGenerated' ? (
        <UiGeneratedContent {...props} />
      ) : (
        <ManualContent {...props} />
      )}
    </div>
  );
};

export default IntroEthicsFinancialDecisions;