import React, { useState, useEffect } from 'react';
import { ProgressProvider } from '../../context/CourseProgressContext';
import { Badge } from '../../../components/ui/badge';
import contentRegistry from './content';

// Import the course structure as a fallback
import courseStructure from './structure.json';

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  info: 'bg-amber-100 text-amber-800 border-amber-200',
};

/**
 * The main Physics 30 Course component
 */
const PHY30Course = ({
  course,
  activeItemId: externalActiveItemId,
  onItemSelect,
  isStaffView = false,
  devMode = false
}) => {
  const [internalActiveItemId, setInternalActiveItemId] = useState(null);
  const courseId = course.CourseID;

  useEffect(() => {
    console.log("PHY30: Course object:", JSON.stringify(course, null, 2));
    console.log("PHY30: Content Registry:", contentRegistry);
    console.log("PHY30: Structure paths:", {
      detailsStructurePath: course.courseDetails?.courseStructure?.structure,
      directPath: course.courseStructure?.structure,
      unitsPath: course.units,
      fallbackStructure: courseStructure.courseStructure.structure
    });
  }, [course]);

  const getStructure = () => {
    if (course.courseDetails?.courseStructure?.structure) {
      console.log("PHY30: Using structure from course.courseDetails.courseStructure.structure");
      return course.courseDetails.courseStructure.structure;
    } else if (course.courseStructure?.structure) {
      console.log("PHY30: Using structure from course.courseStructure.structure");
      return course.courseStructure.structure;
    } else if (course.units) {
      console.log("PHY30: Using structure generated from course.units");
      return [{
        name: "Course Content",
        section: "1",
        unitId: "main_unit",
        items: course.units.flatMap(unit => unit.items || [])
      }];
    } else {
      console.log("PHY30: Using fallback structure");
      return courseStructure.courseStructure.structure;
    }
  };

  const structure = getStructure();
  const activeItemId = externalActiveItemId !== undefined ? externalActiveItemId : internalActiveItemId;

  useEffect(() => {
    if (!activeItemId && structure && structure.length > 0 && structure[0].items.length > 0) {
      const firstItemId = structure[0].items[0].itemId;
      setInternalActiveItemId(firstItemId);
      if (onItemSelect) {
        onItemSelect(firstItemId);
      }
    }
  }, [activeItemId, structure, onItemSelect]);

  const activeItem = React.useMemo(() => {
    if (!activeItemId || !structure) return null;
    for (const unit of structure) {
      for (const item of unit.items) {
        if (item.itemId === activeItemId) {
          return item;
        }
      }
    }
    return null;
  }, [activeItemId, structure]);

  const renderContent = () => {
    if (!activeItem) {
      console.log("PHY30: No active item selected");
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-gray-700">Select a lesson to begin</h2>
        </div>
      );
    }

    const contentId = activeItem.content;
    console.log("PHY30: Attempting to render content", {
      activeItem,
      contentId,
      availableContent: Object.keys(contentRegistry),
      staffContentId: `${contentId}_Staff`,
      hasComponent: !!contentRegistry[contentId]
    });
    
    const staffContentId = `${contentId}_Staff`;
    const ContentComponent = devMode && contentRegistry[staffContentId]
      ? contentRegistry[staffContentId]
      : contentRegistry[contentId];

    if (ContentComponent) {
      return (
        <div className="p-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              {activeItem.title}
              {devMode && contentRegistry[staffContentId] && (
                <span className="ml-2 text-sm bg-red-600 text-white px-2 py-0.5 rounded-full">
                  STAFF VIEW
                </span>
              )}
            </h1>
            <Badge className={`${typeColors[activeItem.type] || 'bg-gray-100'} px-2 py-1`}>
              {activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}
            </Badge>
          </div>
          <ContentComponent
            course={course}
            courseId={courseId}
            isStaffView={isStaffView}
            devMode={devMode}
          />
        </div>
      );
    }

    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-md">
        <h2 className="text-xl font-semibold text-amber-800 mb-2">{activeItem.title}</h2>
        <p className="text-amber-700">
          Content for this {activeItem.type} is currently under development.
        </p>
      </div>
    );
  };

  return (
    <ProgressProvider courseId={courseId}>
      <div className="max-w-4xl mx-auto p-6">
        {renderContent()}
      </div>
    </ProgressProvider>
  );
};

export default PHY30Course;
