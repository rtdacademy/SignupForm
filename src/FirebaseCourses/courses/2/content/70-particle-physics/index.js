import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';

// Import both versions
import ManualContent from './manual';
import UiGeneratedContent from '../../../../components/content/UiGeneratedContent';

const ParticlePhysics = (props) => {
  const { course, courseId, itemConfig, isStaffView, devMode } = props;
  
  const [contentMode, setContentMode] = useState('manual'); // 'manual' | 'uiGenerated'
  const [loading, setLoading] = useState(true);
  const [uiContentExists, setUiContentExists] = useState(false);
  const [manualContentExists, setManualContentExists] = useState(false);

  useEffect(() => {
    const checkContentAvailability = async () => {
      try {
        setLoading(true);
        
        // Check if manual.js exists by trying to import it
        let hasManualContent = false;
        try {
          // We already imported ManualContent at the top, so manual.js exists
          hasManualContent = true;
          setManualContentExists(true);
        } catch (importError) {
          console.log('No manual.js file found');
          setManualContentExists(false);
        }
        
        // Check for UI-generated content in database
        const db = getDatabase();
        const lessonPath = itemConfig?.contentPath || '70-particle-physics';
        const codeRef = ref(db, `courseDevelopment/${courseId}/${lessonPath}`);
        const snapshot = await get(codeRef);
        
        let hasUIContent = false;
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.enabled) {
            setUiContentExists(true);
            hasUIContent = true;
          }
        }
        
        // Determine default content mode based on availability
        if (hasManualContent) {
          // If manual.js exists, default to manual
          setContentMode('manual');
        } else if (hasUIContent) {
          // If no manual.js but UI content exists, default to UI
          setContentMode('uiGenerated');
        } else {
          // Fallback to manual (will show error if neither exists)
          setContentMode('manual');
        }
        
      } catch (error) {
        console.error('Error checking content availability:', error);
        // Fallback to manual on error
        setContentMode('manual');
      } finally {
        setLoading(false);
      }
    };

    checkContentAvailability();
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
            
            {/* Show toggle if both content types exist */}
            {manualContentExists && uiContentExists && (
              <button
                onClick={toggleContentMode}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Switch to {contentMode === 'manual' ? 'UI-Generated' : 'Manual'}
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={manualContentExists ? 'text-green-600' : 'text-red-500'}>
              📄 Manual: {manualContentExists ? 'Available' : 'Missing'}
            </span>
            <span className={uiContentExists ? 'text-green-600' : 'text-gray-400'}>
              🚧 UI-Generated: {uiContentExists ? 'Available' : 'Not Created'}
            </span>
          </div>
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

export default ParticlePhysics;
