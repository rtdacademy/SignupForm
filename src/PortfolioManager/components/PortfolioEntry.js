import React, { useState, useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles for proper display
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '../../components/ui/sheet';
import {
  FileText,
  Image,
  Video,
  Link2,
  Upload,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Download,
  Calendar,
  Tag,
  MessageSquare,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Zap,
  ZoomIn,
  Play,
  Pause,
  Share2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import PortfolioComments from './PortfolioComments';
import PortfolioTagSelector from './PortfolioTagSelector';
import PortfolioShareButton from './PortfolioShareButton';

const PortfolioEntry = ({
  entry,
  viewMode = 'grid',
  isPresentationMode = false,
  familyId,
  onEdit,
  onDelete,
  onUpdate,
  comments = [],
  loadingComments = false,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onLoadComments,
  onFullscreen,
  // Props for tag selector
  activities = [],
  assessments = [],
  resources = [],
  activityDescriptions = {},
  assessmentDescriptions = {},
  resourceDescriptions = {},
  getTagSuggestions,
  customActivities = [],
  customAssessments = [],
  customResources = []
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showTagSheet, setShowTagSheet] = useState(false);
  const [updatingTags, setUpdatingTags] = useState(false);
  const videoRef = useRef(null);

  // Load comments when component mounts or entry changes
  useEffect(() => {
    if (onLoadComments && entry?.id) {
      onLoadComments(entry.id);
    }
  }, [entry?.id, onLoadComments]);

  // Get entry type icon
  const getTypeIcon = () => {
    switch (entry.type) {
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'link':
        return <Link2 className="w-4 h-4" />;
      case 'file':
        return <Upload className="w-4 h-4" />;
      case 'unified':
      case 'combined':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get preview content - simplified without text preview
  const getPreviewContent = () => {
    if (entry.files?.length > 0) {
      if (entry.type === 'image') return `${entry.files.length} image${entry.files.length > 1 ? 's' : ''}`;
      if (entry.type === 'video') return `${entry.files.length} video${entry.files.length > 1 ? 's' : ''}`;
      return `${entry.files.length} file${entry.files.length > 1 ? 's' : ''}`;
    }
    if (entry.reflections) {
      return 'Contains reflections';
    }
    if (entry.content) {
      return 'Contains content';
    }
    return '';
  };

  // Render HTML content with Quill styles
  const renderHTMLContent = (content) => {
    if (!content) return null;

    // Use Quill's own classes to properly display formatted content
    // This ensures ql-indent-* classes and other Quill formatting work correctly
    return (
      <div className="ql-snow">
        <div
          className="ql-editor"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{
            padding: '12px 15px',
            minHeight: 'auto',
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        />
      </div>
    );
  };


  // Count total tags
  const getTotalTagCount = () => {
    const activities = entry.tags?.activities?.length || 0;
    const assessments = entry.tags?.assessments?.length || 0;
    const resources = entry.tags?.resources?.length || 0;
    return activities + assessments + resources;
  };

  // Handle tag updates
  const handleTagUpdate = async (newTags) => {
    setUpdatingTags(true);
    try {
      await onUpdate({ tags: newTags });
    } catch (error) {
      console.error('Error updating tags:', error);
    } finally {
      setUpdatingTags(false);
    }
  };

  // Expanded view for presentation mode
  if (viewMode === 'expanded') {
    // In expanded mode, show full content directly without accordion
    return (
      <div className="space-y-6 p-6">
        {/* Title and metadata */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{entry.title}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(entry.date)}
            </span>
            {entry.quickAdd && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                <Zap className="w-3 h-3 mr-1" />
                Quick Add
              </Badge>
            )}
            {getTotalTagCount() > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {getTotalTagCount()} tags
              </span>
            )}
          </div>
        </div>

        {/* Content based on type */}
        {entry.type === 'image' && entry.files?.length > 0 && (
          <div className="space-y-4">
            <img
              src={entry.files[currentImageIndex]?.url}
              alt={entry.files[currentImageIndex]?.name}
              className="w-full rounded-lg shadow-lg"
            />
            {entry.files.length > 1 && (
              <div className="flex justify-center gap-2">
                {entry.files.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {entry.type === 'video' && entry.files?.length > 0 && (
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={entry.files[0]?.url}
              className="w-full"
              controls
            />
          </div>
        )}

        {entry.content && (
          <div className="bg-white rounded-lg">
            {renderHTMLContent(entry.content)}
          </div>
        )}

        {/* Reflections */}
        {entry.reflections && (
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-2">Reflections</h3>
            <p className="text-gray-700">{entry.reflections}</p>
          </div>
        )}

        {/* Tags */}
        {getTotalTagCount() > 0 && (
          <div className="flex flex-wrap gap-2">
            {entry.tags?.activities?.map((tag, i) => (
              <Badge key={`a-${i}`} className="bg-blue-100 text-blue-700">
                {tag}
              </Badge>
            ))}
            {entry.tags?.assessments?.map((tag, i) => (
              <Badge key={`as-${i}`} className="bg-green-100 text-green-700">
                {tag}
              </Badge>
            ))}
            {entry.tags?.resources?.map((tag, i) => (
              <Badge key={`r-${i}`} className="bg-purple-100 text-purple-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Comments */}
        {onCreateComment && (
          <div className="border-t pt-6">
            <PortfolioComments
              entryId={entry.id}
              comments={comments}
              loadingComments={loadingComments}
              onCreateComment={onCreateComment}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              collapsed={false}
              onToggle={setShowComments}
              commentCount={entry.commentCount || 0}
            />
          </div>
        )}
      </div>
    );
  }

  // Main accordion-based display
  return (
    <AccordionItem value={entry.id} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-4">
            {/* Type Icon */}
            <div className="p-2 bg-gray-100 rounded-lg">
              {getTypeIcon()}
            </div>

            {/* Title and Preview */}
            <div className="text-left">
              <h3 className="font-medium text-gray-900 mb-1">
                {entry.title}
                {entry.quickAdd && (
                  <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700 text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Quick
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {getPreviewContent()}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(entry.date)}
            </span>
            {getTotalTagCount() > 0 && (
              <Badge variant="outline" className="text-xs">
                {getTotalTagCount()} tags
              </Badge>
            )}
            {entry.files?.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Paperclip className="w-3 h-3 mr-1" />
                {entry.files.length}
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="px-6 pb-6 space-y-4">
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pb-4 border-b">
            <PortfolioShareButton
              entry={entry}
              familyId={familyId}
              onUpdate={onUpdate}
              buttonSize="sm"
              buttonVariant="outline"
            />
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>

          {/* Content based on type */}
          {entry.type === 'image' && entry.files?.length > 0 && (
            <div className="space-y-4">
              <img
                src={entry.files[currentImageIndex]?.url}
                alt={entry.files[currentImageIndex]?.name}
                className="w-full rounded-lg shadow-lg max-h-[600px] object-contain"
              />
              {entry.files.length > 1 && (
                <div className="flex justify-center gap-2">
                  {entry.files.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {entry.type === 'video' && entry.files?.length > 0 && (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={entry.files[0]?.url}
                className="w-full"
                controls
              />
            </div>
          )}

          {entry.content && (
            <div className="bg-gray-50 rounded-lg p-6">
              {renderHTMLContent(entry.content)}
            </div>
          )}

          {/* Reflections */}
          {entry.reflections && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Reflections</h4>
              <p className="text-gray-700">{entry.reflections}</p>
            </div>
          )}

          {/* Tags */}
          {getTotalTagCount() > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Tags</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTagSheet(true)}
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit Tags
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.tags?.activities?.map((tag, i) => (
                  <Badge key={`a-${i}`} className="bg-blue-100 text-blue-700">
                    {tag}
                  </Badge>
                ))}
                {entry.tags?.assessments?.map((tag, i) => (
                  <Badge key={`as-${i}`} className="bg-green-100 text-green-700">
                    {tag}
                  </Badge>
                ))}
                {entry.tags?.resources?.map((tag, i) => (
                  <Badge key={`r-${i}`} className="bg-purple-100 text-purple-700">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {onCreateComment && (
            <div className="border-t pt-4">
              <PortfolioComments
                entryId={entry.id}
                comments={comments}
                loadingComments={loadingComments}
                onCreateComment={onCreateComment}
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
                collapsed={false}
                onToggle={setShowComments}
                commentCount={entry.commentCount || 0}
              />
            </div>
          )}
        </div>
      </AccordionContent>

      {/* Tag Editor Sheet */}
      <Sheet open={showTagSheet} onOpenChange={setShowTagSheet}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Tags</SheetTitle>
            <SheetDescription>
              Update tags for this portfolio entry
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <PortfolioTagSelector
              selectedTags={entry.tags || { activities: [], assessments: [], resources: [] }}
              onChange={handleTagUpdate}
              activities={activities}
              assessments={assessments}
              resources={resources}
              activityDescriptions={activityDescriptions}
              assessmentDescriptions={assessmentDescriptions}
              resourceDescriptions={resourceDescriptions}
              getTagSuggestions={getTagSuggestions}
              customActivities={customActivities}
              customAssessments={customAssessments}
              customResources={customResources}
              content={entry.content || entry.title}
              compact={false}
            />
            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTagSheet(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowTagSheet(false)}
                disabled={updatingTags}
              >
                {updatingTags ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Done'
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AccordionItem>
  );
};

export default PortfolioEntry;