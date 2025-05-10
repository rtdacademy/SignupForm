import React, { useState, useEffect } from 'react';
import { ProgressProvider } from '../../context/CourseProgressContext';
import { Badge } from '../../../components/ui/badge';
import courseData from './courseStructure';
import contentRegistry from './content';

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  info: 'bg-amber-100 text-amber-800 border-amber-200',
};

/**
 * The main COM1255 Course component
 */
const COM1255Course = ({ course, activeItemId: externalActiveItemId, onItemSelect }) => {
  // Maintain internal state that can sync with external props
  const [internalActiveItemId, setInternalActiveItemId] = useState(null);
  const courseId = course.CourseID;

  // Get structure from the static file instead of from the course object
  const { structure } = courseData;

  // Use the activeItemId from props if provided, otherwise use internal state
  const activeItemId = externalActiveItemId !== undefined ? externalActiveItemId : internalActiveItemId;

  // Find the first item ID to use as default if none is active
  useEffect(() => {
    if (!activeItemId && structure && structure.length > 0 && structure[0].items.length > 0) {
      const firstItemId = structure[0].items[0].itemId;

      // Update internal state
      setInternalActiveItemId(firstItemId);

      // Notify parent component if callback is provided
      if (onItemSelect) {
        onItemSelect(firstItemId);
      }
    }
  }, [activeItemId, structure, onItemSelect]);

  // Find the active item in the course structure
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

  // Render the appropriate content based on the active item
  const renderContent = () => {
    if (!activeItem) {
      return (
        <div className="text-center p-10">
          <h2 className="text-xl font-semibold text-gray-700">Select a lesson to begin</h2>
        </div>
      );
    }

    // Get the content component based on the content ID in the active item
    const ContentComponent = contentRegistry[activeItem.content];

    if (ContentComponent) {
      return (
        <div className="p-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">{activeItem.title}</h1>
            <Badge className={`${typeColors[activeItem.type] || 'bg-gray-100'} px-2 py-1`}>
              {activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}
            </Badge>
          </div>
          <ContentComponent />
        </div>
      );
    }

    // Fallback if content is not registered
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-md">
        <h2 className="text-xl font-semibold text-amber-800 mb-2">{activeItem.title}</h2>
        <p className="text-amber-700">
          Content for this {activeItem.type} is currently under development.
        </p>
      </div>
    );
  };

  // Debug log to track state changes
  useEffect(() => {
    console.log('COM1255Course: Active item ID:', activeItemId);
  }, [activeItemId]);

  return (
    <ProgressProvider courseId={courseId}>
      <div className="max-w-4xl mx-auto p-6">
        {renderContent()}
      </div>
    </ProgressProvider>
  );
};

export default COM1255Course;