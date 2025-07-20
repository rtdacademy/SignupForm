import React from 'react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Info, AlertCircle, BookOpen } from 'lucide-react';
import { sanitizeHtml } from '../../utils/htmlSanitizer';

/**
 * ContentDisplay component for rendering course content
 * @param {Object} props - Component props
 * @param {Object} props.item - Current item to display
 * @param {Object} props.unit - Current unit the item belongs to
 * @param {Object} props.contentData - The content data structure
 * @param {boolean} props.previewMode - Whether the component is in preview mode
 */
const ContentDisplay = ({ 
  item, 
  unit,
  contentData,
  previewMode = false
}) => {
  if (!item) {
    return (
      <Alert className="border-blue-100 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 text-blue-800 shadow-sm">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="font-medium">
          No content selected. Please choose an item from the menu.
        </AlertDescription>
      </Alert>
    );
  }

  // Extract content for the current item
  const unitId = `unit_${unit?.sequence}`;
  const itemId = `item_${item.sequence}`;
  
  // Get content from the contentData structure
  const content = contentData?.units?.[unitId]?.items?.[itemId]?.content;

  if (!content) {
    return (
      <Alert className="border-amber-100 bg-gradient-to-r from-amber-50/90 to-orange-50/90 text-amber-800 shadow-sm">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="font-medium">
          This {item.type || 'item'} does not have any content yet.
          {previewMode && (
            <span className="block mt-2 text-amber-700">
              Return to edit mode to add content for this item.
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Sanitize the HTML content before rendering to remove contenteditable attributes
  const sanitizedContent = sanitizeHtml(content);

  // Display the content with proper sanitization
  return (
    <div className="prose prose-blue prose-headings:text-blue-900 prose-headings:font-semibold prose-img:rounded-lg prose-img:shadow-md max-w-none bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-white p-6 rounded-lg border border-blue-100/50 shadow-inner">
      <div 
        dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default ContentDisplay;