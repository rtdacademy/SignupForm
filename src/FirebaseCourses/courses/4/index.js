import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import contentRegistry from './content';
// Course structure now loaded from database via gradebook
// SEQUENTIAL_ACCESS_UPDATE: Added lesson access utilities for Course 4 sequential unlocking
import { 
  getLessonAccessibility, 
  getHighestAccessibleLesson,
  shouldBypassAccessControl 
} from '../../utils/lessonAccess';

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  info: 'bg-amber-100 text-amber-800 border-amber-200',
};

/**
 * Wrapper component that tracks lesson access when content is displayed
 */
const LessonContentWrapper = ({ 
  activeItem, 
  ContentComponent, 
  courseId, 
  isStaffView, 
  devMode, 
  onItemSelect, 
  setInternalActiveItemId, 
  findNextLesson,
  gradebookItems = {},
  courseStructure
}) => {
  // SEQUENTIAL_ACCESS_UPDATE: Temporarily commented out to isolate Firebase permission issue
  // const { trackLessonAccess, progress } = useProgress();

  // SEQUENTIAL_ACCESS_UPDATE: Added access validation for assessment-based unlocking
  // Original code (before sequential access): Only had trackLessonAccess call
  // Note: Access validation now uses assessment data instead of writing to Firebase progress
  useEffect(() => {
    if (activeItem?.itemId && !shouldBypassAccessControl(isStaffView, devMode)) {
      console.log('🔍 Course4 access validation for:', activeItem.itemId, {
        isStaffView,
        devMode,
        bypassControl: shouldBypassAccessControl(isStaffView, devMode)
      });
      
      // For assessment-based unlocking, we validate access using gradebook/assessment data
      const assessmentData = gradebookItems;
      
      const accessibility = getLessonAccessibility({ courseStructure }, assessmentData);
      const accessInfo = accessibility[activeItem.itemId];
      
      console.log('🔍 Access info for', activeItem.itemId, ':', accessInfo);
      
      if (!accessInfo) {
        console.warn('⚠️ No access info found for lesson:', activeItem.itemId);
        return;
      }
      
      if (!accessInfo.accessible) {
        console.log('⚠️ Access denied for lesson:', activeItem.itemId, 'Reason:', accessInfo.reason);
        
        // Check if this is a URL-based navigation (on page load)
        const urlParams = new URLSearchParams(window.location.search);
        const urlLesson = urlParams.get('lesson');
        
        if (urlLesson === activeItem.itemId) {
          console.log('🔄 Lesson was from URL, allowing access despite restrictions for direct navigation');
          return; // Don't redirect if user navigated directly via URL
        }
        
        // Redirect to highest accessible lesson
        const highestAccessible = getHighestAccessibleLesson({ courseStructure }, assessmentData);
        if (highestAccessible && highestAccessible !== activeItem.itemId) {
          console.log('🔄 Redirecting to highest accessible lesson:', highestAccessible);
          if (onItemSelect) {
            onItemSelect(highestAccessible);
          } else {
            setInternalActiveItemId(highestAccessible);
          }
          return;
        }
      } else {
        console.log('✅ Access granted for lesson:', activeItem.itemId);
      }
    } else {
      console.log('🔍 Course4 bypassing access control:', {
        hasActiveItem: !!activeItem?.itemId,
        shouldBypass: shouldBypassAccessControl(isStaffView, devMode),
        isStaffView,
        devMode
      });
    }
  }, [activeItem?.itemId, activeItem?.title, activeItem?.type, activeItem?.unitId, activeItem?.unitName, isStaffView, devMode, onItemSelect, setInternalActiveItemId, gradebookItems, courseStructure]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Item header */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center gap-3 mb-2">
          <Badge className={`${typeColors[activeItem.type] || 'bg-gray-100 text-gray-800'} text-sm`}>
            {activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900">{activeItem.title}</h1>
        </div>
        {activeItem.description && (
          <p className="text-gray-600">{activeItem.description}</p>
        )}
        {activeItem.estimatedTime && (
          <p className="text-sm text-blue-600 mt-2">
            Estimated time: {activeItem.estimatedTime} minutes
          </p>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <ContentComponent 
          courseId={courseId}
          itemId={activeItem.itemId}
          activeItem={activeItem}
          isStaffView={isStaffView}
          devMode={devMode}
          onNavigateToLesson={(lessonItemId) => {
            // Navigate to the specified lesson using the existing navigation system
            if (onItemSelect) {
              onItemSelect(lessonItemId);
            } else {
              setInternalActiveItemId(lessonItemId);
            }
          }}
          onNavigateToNext={() => {
            // Navigate to the next lesson in sequence
            const nextLessonId = findNextLesson(activeItem?.itemId);
            if (nextLessonId) {
              if (onItemSelect) {
                onItemSelect(nextLessonId);
              } else {
                setInternalActiveItemId(nextLessonId);
              }
            }
          }}
        />
      </div>
    </div>
  );
};

/**
 * Main Course Component for 4
 * 
 * This component uses a convention-based structure where:
 * - Content is organized in numbered folders (01-getting-started, etc.)
 * - Cloud functions follow the pattern: COURSEID_FOLDERNAME_FUNCTIONTYPE
 * - Configuration is loaded from JSON files
 */
const Course4 = ({
  course,
  activeItemId: externalActiveItemId,
  onItemSelect,
  isStaffView = false,
  devMode = false,
  gradebookItems = {}
}) => {
  const [internalActiveItemId, setInternalActiveItemId] = useState(null);
  const courseId = course?.CourseID || '4';
  // Get course structure from course object (database-driven)
  const structure = course?.courseDetails?.['course-config']?.courseStructure?.units || 
                   course?.courseStructure?.units || 
                   course?.Gradebook?.courseStructure?.units || 
                   [];

  // Debug logging
  useEffect(() => {
    // Debug logging removed
  }, [structure, externalActiveItemId, onItemSelect, isStaffView, devMode]);

  // Use external or internal active item ID
  const activeItemId = externalActiveItemId !== undefined ? externalActiveItemId : internalActiveItemId;

  // Set default active item - but don't override if external activeItemId is provided
  useEffect(() => {
    console.log('🔍 Course4 default lesson logic:', {
      activeItemId,
      externalActiveItemId,
      internalActiveItemId,
      structureLoaded: structure && structure.length > 0,
      shouldSetDefault: !activeItemId && structure && structure.length > 0
    });
    
    // Only set default if no external activeItemId is provided AND no internal one is set
    if (!activeItemId && externalActiveItemId === undefined && structure && structure.length > 0) {
      const firstUnit = structure[0];
      if (firstUnit.items && firstUnit.items.length > 0) {
        const firstItemId = firstUnit.items[0].itemId;
        console.log('🔄 Course4 setting default lesson:', firstItemId);
        setInternalActiveItemId(firstItemId);
        if (onItemSelect) {
          onItemSelect(firstItemId);
        }
      }
    }
  }, [activeItemId, externalActiveItemId, internalActiveItemId, structure, onItemSelect]);

  // Find active item in structure
  const activeItem = React.useMemo(() => {
    console.log('🔍 Course4 looking for activeItem:', {
      activeItemId,
      structureExists: !!structure,
      structureLength: structure?.length,
      firstUnitItems: structure?.[0]?.items?.map(item => item.itemId)
    });
    
    if (!activeItemId || !structure) {
      console.log('❌ Course4 activeItem lookup failed: missing activeItemId or structure');
      return null;
    }

    for (const unit of structure) {
      for (const item of unit.items) {
        if (item.itemId === activeItemId) {
          console.log('✅ Course4 found activeItem:', item.itemId, item.title);
          return { ...item, unitId: unit.unitId, unitName: unit.name };
        }
      }
    }
    console.log('❌ Course4 activeItem not found in structure. Available items:', 
      structure.flatMap(unit => unit.items || []).map(item => item.itemId)
    );
    return null;
  }, [activeItemId, structure]);

  // Helper function to find the next lesson in the course structure
  const findNextLesson = React.useCallback((currentItemId) => {
    if (!structure || !currentItemId) return null;

    let foundCurrent = false;
    for (const unit of structure) {
      for (const item of unit.items) {
        if (foundCurrent) {
          return item.itemId;
        }
        if (item.itemId === currentItemId) {
          foundCurrent = true;
        }
      }
    }
    return null; // No next lesson found
  }, [structure]);

  // Render content based on active item
  const renderContent = () => {
    if (!activeItem) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-gray-700">
            Select a {structure[0]?.items[0]?.type || 'lesson'} to begin
          </h2>
          <p className="text-gray-500 mt-2">
            Choose from the navigation menu on the left
          </p>
        </div>
      );
    }

    // Get content component using the contentPath from structure
    const contentPath = activeItem.contentPath;
    const ContentComponent = contentRegistry[contentPath];

    // Loading content logging removed

    if (!ContentComponent) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-red-600">Content Not Found</h2>
          <p className="text-gray-500 mt-2">
            No content component found for path: {contentPath}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Expected component at: src/FirebaseCourses/courses/4/content/{contentPath}/index.js
          </p>
        </div>
      );
    }

    const courseId = course?.CourseID || '4';

    return (
      <LessonContentWrapper 
          activeItem={activeItem}
          ContentComponent={ContentComponent}
          courseId={courseId}
          isStaffView={isStaffView}
          devMode={devMode}
          onItemSelect={onItemSelect}
          setInternalActiveItemId={setInternalActiveItemId}
          findNextLesson={findNextLesson}
          gradebookItems={gradebookItems}
          courseStructure={{ courseStructure: { units: structure } }}
        />
    );
  };

  return renderContent();
};

export default Course4;