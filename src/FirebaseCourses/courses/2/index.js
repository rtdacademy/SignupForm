import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import contentRegistry from './content';
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
  const structure = course?.courseStructure?.units || 
                   course?.Gradebook?.courseStructure?.units || 
                   [];


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

    // Get content component using the contentPath from structure
    const contentPath = activeItem.contentPath;
    const ContentComponent = contentRegistry[contentPath];


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
          Expected content path: <code className="bg-amber-100 px-1 py-0.5 rounded">{contentPath}</code>
        </p>
        {devMode && (
          <div className="mt-4 p-3 bg-amber-100 rounded">
            <p className="text-sm font-medium text-amber-900">Developer Info:</p>
            <p className="text-xs text-amber-800 mt-1">
              Create a component at: content/{contentPath}/index.js
            </p>
            {activeItem.hasCloudFunctions && (
              <p className="text-xs text-amber-800 mt-1">
                Create cloud functions at: functions/{courseId}/{contentPath}/
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
    
    structure.forEach(unit => {
      totalItems += unit.items.length;
      // TODO: Integrate with actual progress tracking
    });
    
    return {
      total: totalItems,
      completed: completedItems,
      percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    };
  }, [structure]);

  return (
    <div className="max-w-4xl mx-auto p-6">
    
      
      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default Course2;