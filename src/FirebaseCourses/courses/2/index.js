import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import contentRegistry from './content';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkDeflist from 'remark-deflist';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
// Course structure now loaded from database via gradebook

// Type-specific styling
const typeColors = {
  lesson: 'bg-blue-100 text-blue-800 border-blue-200',
  assignment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  exam: 'bg-purple-100 text-purple-800 border-purple-200',
  info: 'bg-amber-100 text-amber-800 border-amber-200',
};

// Helper function to detect if text contains markdown patterns
const containsMarkdown = (text) => {
  if (!text) return false;
  
  const markdownPatterns = [
    /\*\*.*?\*\*/,        // Bold text
    /\*.*?\*/,            // Italic text
    /\[.*?\]\(.*?\)/,     // Links
    /^#+\s/m,             // Headers
    /^[\s]*[-*+]\s/m,     // Unordered lists
    /^[\s]*\d+\.\s/m,     // Ordered lists
    /```[\s\S]*?```/,     // Code blocks
    /`.*?`/,              // Inline code
    /^\s*>/m,             // Blockquotes
    /\n\n/,               // Multiple line breaks
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
};

// Helper function to render text with markdown support
const renderTextWithMarkdown = (text, className = '') => {
  if (!text) return text;
  
  if (containsMarkdown(text)) {
    return (
      <div className={`prose prose-sm max-w-none ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkDeflist]}
          rehypePlugins={[
            [rehypeSanitize, {
              allowedElements: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 
                'pre', 'code', 'em', 'strong', 'del', 'table', 'thead', 'tbody', 'tr', 
                'th', 'td', 'a', 'img', 'hr', 'br', 'div', 'span'
              ],
              allowedAttributes: {
                'a': ['href', 'title', 'target', 'rel'],
                'img': ['src', 'alt', 'title', 'width', 'height'],
                'div': ['class'],
                'span': ['class'],
                'pre': ['class'],
                'code': ['class']
              }
            }],
            [rehypeKatex, { displayMode: false }],
            rehypeRaw
          ]}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  }
  
  return (
    <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {text}
    </div>
  );
};

/**
 * Main Course Component for 2
 * 
 * This component uses a convention-based structure where:
 * - Content is organized in numbered folders (01-getting-started, etc.)
 * - Cloud functions follow the pattern: COURSEID_FOLDERNAME_FUNCTIONTYPE
 * - Configuration is loaded from JSON files
 */
const Course2 = ({
  course,
  activeItemId: externalActiveItemId,
  onItemSelect,
  isStaffView = false,
  devMode = false,
  onUpdateAIContext,
  onPrepopulateMessage,
  // Add missing AI-related props
  AIAccordion,
  onAIAccordionContent,
  createAskAIButton,
  createAskAIButtonFromElement,
  gradebookItems
}) => {
  const [internalActiveItemId, setInternalActiveItemId] = useState(null);
  const courseId = course?.CourseID || '2';
  
  // Get course structure from course object (database-driven)
  // Handle both new structure (course.courseDetails['course-config']) and direct structure (course['course-config'])
  const structure = course?.courseDetails?.['course-config']?.courseStructure?.units || 
                   course?.['course-config']?.courseStructure?.units ||
                   course?.courseStructure?.units || 
                   course?.Gradebook?.courseStructure?.units || 
                   [];

  // Debug logging to help identify course object structure issues
  if (!structure || structure.length === 0) {
    console.log('🔍 Course2 Debug - course object:', course);
    console.log('🔍 Course2 Debug - structure paths:');
    console.log('  - course.courseDetails:', course?.courseDetails);
    console.log('  - course["course-config"]:', course?.['course-config']);
    console.log('  - course.courseStructure:', course?.courseStructure);
    console.log('  - course.Gradebook?.courseStructure:', course?.Gradebook?.courseStructure);
  }


  // Use external or internal active item ID
  const activeItemId = externalActiveItemId !== undefined ? externalActiveItemId : internalActiveItemId;

  // Set default active item - but don't override if external activeItemId is provided
  useEffect(() => {
    // Only set default if no external activeItemId is provided AND no internal one is set
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
  }, [activeItemId, externalActiveItemId, structure, onItemSelect]);

  // Find active item in structure
  const activeItem = React.useMemo(() => {
    if (!activeItemId || !structure) return null;

    for (const unit of structure) {
      for (const item of unit.items) {
        if (item.itemId === activeItemId) {
          return { ...item, unitId: unit.unitId, unitName: unit.name };
        }
      }
    }
    return null;
  }, [activeItemId, structure]);

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

    // Get content component using contentPath directly
    const contentKey = activeItem.contentPath || activeItem.itemId?.replace(/_/g, '-');
    const ContentComponent = contentRegistry[contentKey];


    if (ContentComponent) {
      return (
        <div className="p-2">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{activeItem.unitName}</p>
              <h1 className="text-3xl font-bold text-gray-800">
                {activeItem.title}
                {devMode && activeItem.hasCloudFunctions && (
                  <span className="ml-2 text-xs bg-yellow-600 text-white px-2 py-0.5 rounded-full">
                    Has Functions
                  </span>
                )}
              </h1>
            </div>
            <Badge className={`${typeColors[activeItem.type] || 'bg-gray-100'} px-2 py-1`}>
              {activeItem.type.charAt(0).toUpperCase() + activeItem.type.slice(1)}
            </Badge>
          </div>
          
          {/* Display learning objectives if available */}
          {activeItem.learningObjectives && activeItem.learningObjectives.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Learning Objectives</h3>
              <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                {activeItem.learningObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}
          
          <ContentComponent
            course={course}
            courseId={courseId}
            itemConfig={activeItem}
            isStaffView={isStaffView}
            devMode={devMode}
            onUpdateAIContext={onUpdateAIContext}
            onPrepopulateMessage={onPrepopulateMessage}
            // Add missing AI-related props
            AIAccordion={AIAccordion}
            onAIAccordionContent={onAIAccordionContent}
            createAskAIButton={createAskAIButton}
            createAskAIButtonFromElement={createAskAIButtonFromElement}
            gradebookItems={gradebookItems}
          />
        </div>
      );
    }

    // Fallback for missing content
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-md">
        <h2 className="text-xl font-semibold text-amber-800 mb-2">{activeItem.title}</h2>
        <p className="text-amber-700">
          Content for this {activeItem.type} is currently under development.
        </p>
        <p className="text-sm text-amber-600 mt-2">
          Expected content path: <code className="bg-amber-100 px-1 py-0.5 rounded">{contentKey}</code>
        </p>
        {devMode && (
          <div className="mt-4 p-3 bg-amber-100 rounded">
            <p className="text-sm font-medium text-amber-900">Developer Info:</p>
            <p className="text-xs text-amber-800 mt-1">
              Create a component at: content/{contentKey}/index.js
            </p>
            {activeItem.hasCloudFunctions && (
              <p className="text-xs text-amber-800 mt-1">
                Create cloud functions at: functions/{courseId}/{contentKey}/
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Calculate progress statistics
  const progressStats = React.useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    
    // Add safety checks for structure and units
    if (Array.isArray(structure)) {
      structure.forEach(unit => {
        // Ensure unit and unit.items exist before accessing length
        if (unit && Array.isArray(unit.items)) {
          totalItems += unit.items.length;
          // TODO: Integrate with actual progress tracking
        }
      });
    }
    
    return {
      total: totalItems,
      completed: completedItems,
      percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    };
  }, [structure]);

  // Early return with error message if no structure is available
  if (!structure || structure.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Course Structure Loading</h3>
          <p className="text-yellow-700 mb-4">
            The course structure is being initialized. Please refresh the page in a moment.
          </p>
          <p className="text-sm text-yellow-600">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
    
      
      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default Course2;