import React from 'react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Info } from 'lucide-react';

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
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
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
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This {item.type || 'item'} does not have any content yet.
          {previewMode && (
            <span className="block mt-2">
              Return to edit mode to add content for this item.
            </span>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Display the content with proper sanitization
  return (
    <div className="prose prose-blue max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default ContentDisplay;