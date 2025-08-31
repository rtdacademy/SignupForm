import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import contentRegistry from './content';
import { 
  getLessonAccessibility, 
  getHighestAccessibleLesson,
  shouldBypassAccessControl 
} from '../../utils/lessonAccess';

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lab: 'bg-green-100 text-green-800 border-green-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  quiz: 'bg-amber-100 text-amber-800 border-amber-200',
  info: 'bg-gray-100 text-gray-800 border-gray-200',
};

/**
 * Wrapper component that tracks lesson access when content is displayed
 */
const LessonContentWrapper = ({ 
  activeItem, 
  ContentComponent, 
  course,
  courseId, 
  isStaffView, 
  devMode, 
  onItemSelect, 
  setInternalActiveItemId, 
  findNextLesson,
  gradebookItems = {},
  courseStructure,
  // AI-related props
  onPrepopulateMessage,
  createAskAIButton,
  createAskAIButtonFromElement,
  AIAccordion,
  onAIAccordionContent
}) => {
  useEffect(() => {
    if (activeItem?.itemId && !shouldBypassAccessControl(isStaffView, devMode)) {
      const courseWithGradebook = {
        Gradebook: {
          items: gradebookItems
        },
        courseDetails: {
          'course-config': {
            progressionRequirements: {
              enabled: true
            }
          }
        }
      };
      
      const accessibility = getLessonAccessibility({ courseStructure }, courseWithGradebook);
      const accessInfo = accessibility[activeItem.itemId];
      
      if (!accessInfo) {
        console.warn('⚠️ No access info found for lesson:', activeItem.itemId);
        return;
      }
      
      if (!accessInfo.accessible) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlLesson = urlParams.get('lesson');
        
        if (urlLesson === activeItem.itemId) {
          return;
        }
        
        const highestAccessible = getHighestAccessibleLesson({ courseStructure }, courseWithGradebook);
        if (highestAccessible && highestAccessible !== activeItem.itemId) {
          if (onItemSelect) {
            onItemSelect(highestAccessible);
          } else {
            setInternalActiveItemId(highestAccessible);
          }
          return;
        }
      }
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
          course={course}
          courseId={courseId}
          itemId={activeItem.itemId}
          activeItem={activeItem}
          isStaffView={isStaffView}
          devMode={devMode}
          onNavigateToLesson={(lessonItemId) => {
            if (onItemSelect) {
              onItemSelect(lessonItemId);
            } else {
              setInternalActiveItemId(lessonItemId);
            }
          }}
          onNavigateToNext={() => {
            const nextLessonId = findNextLesson(activeItem?.itemId);
            if (nextLessonId) {
              if (onItemSelect) {
                onItemSelect(nextLessonId);
              } else {
                setInternalActiveItemId(nextLessonId);
              }
            }
          }}
          // AI-related props
          onPrepopulateMessage={onPrepopulateMessage}
          createAskAIButton={createAskAIButton}
          createAskAIButtonFromElement={createAskAIButtonFromElement}
          AIAccordion={AIAccordion}
          onAIAccordionContent={onAIAccordionContent}
        />
      </div>
    </div>
  );
};

/**
 * Main Course Component for Course 5
 * Introduction to Data Science
 * 
 * This component uses a convention-based structure where:
 * - Content is organized in numbered folders
 * - Cloud functions follow the pattern: COURSEID_FOLDERNAME_FUNCTIONTYPE
 * - Configuration is loaded from Firebase database
 */
const Course5 = ({
  course,
  activeItemId: externalActiveItemId,
  onItemSelect,
  isStaffView = false,
  devMode = false,
  gradebookItems = {},
  // AI-related props
  onPrepopulateMessage,
  createAskAIButton,
  createAskAIButtonFromElement,
  AIAccordion,
  onAIAccordionContent,
  // Next lesson navigation props
  currentLessonCompleted = false,
  nextLessonInfo = null,
  courseProgress = 0
}) => {
  const [internalActiveItemId, setInternalActiveItemId] = useState(null);
  const courseId = course?.CourseID || '5';
  
  // Get course structure from course object (database-driven)
  const structure = course?.courseDetails?.['course-config']?.courseStructure?.units || 
                   course?.courseStructure?.units || 
                   course?.Gradebook?.courseStructure?.units || 
                   [];

  // Use external or internal active item ID
  const activeItemId = externalActiveItemId !== undefined ? externalActiveItemId : internalActiveItemId;

  // Set default active item
  useEffect(() => {
    if (!activeItemId && externalActiveItemId === undefined && structure && structure.length > 0) {
      const firstUnit = structure[0];
      if (firstUnit.items && firstUnit.items.length > 0) {
        const firstItemId = firstUnit.items[0].itemId;
        setInternalActiveItemId(firstItemId);
        if (onItemSelect) {
          onItemSelect(firstItemId);
        }
      }
    }
  }, [activeItemId, externalActiveItemId, internalActiveItemId, structure, onItemSelect]);

  // Find active item in structure
  const activeItem = React.useMemo(() => {
    if (!activeItemId || !structure) {
      return null;
    }

    for (const unit of structure) {
      for (const item of unit.items) {
        if (item.itemId === activeItemId) {
          return { ...item, unitId: unit.unitId, unitName: unit.name };
        }
      }
    }
    return null;
  }, [activeItemId, structure]);

  // Helper function to find the next lesson
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
    return null;
  }, [structure]);

  // Render content based on active item
  const renderContent = () => {
    if (!activeItem) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-gray-700">
            Select a lesson to begin
          </h2>
          <p className="text-gray-500 mt-2">
            Choose from the navigation menu on the left
          </p>
        </div>
      );
    }

    const contentPath = activeItem.contentPath || activeItem.itemId;
    const ContentComponent = contentRegistry[contentPath];

    if (!ContentComponent) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-red-600">Content Not Found</h2>
          <p className="text-gray-500 mt-2">
            No content component found for path: {contentPath}
          </p>
          <p className="text-sm text-gray-400 mt-4">
            Expected component at: src/FirebaseCourses/courses/5/content/{contentPath}/index.js
          </p>
        </div>
      );
    }

    const courseId = course?.CourseID || '5';

    return (
      <LessonContentWrapper 
        activeItem={activeItem}
        ContentComponent={ContentComponent}
        course={course}
        courseId={courseId}
        isStaffView={isStaffView}
        devMode={devMode}
        onItemSelect={onItemSelect}
        setInternalActiveItemId={setInternalActiveItemId}
        findNextLesson={findNextLesson}
        gradebookItems={gradebookItems}
        courseStructure={{ courseStructure: { units: structure } }}
        // AI-related props
        onPrepopulateMessage={onPrepopulateMessage}
        createAskAIButton={createAskAIButton}
        createAskAIButtonFromElement={createAskAIButtonFromElement}
        AIAccordion={AIAccordion}
        onAIAccordionContent={onAIAccordionContent}
      />
    );
  };

  return renderContent();
};

export default Course5;
