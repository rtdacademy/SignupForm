import React, { useState, useEffect, useRef } from 'react';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles for proper display
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import DevFileIndicator from './DevFileIndicator';
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
import EditableAttachmentsSection from './EditableAttachmentsSection';
import MessageIconButton from './MessageIconButton';
import CommunicationSheet from './CommunicationSheet';
import { useCommunication } from '../hooks/useCommunication';
import ResourceDrop from './ResourceDrop';

const PortfolioEntry = ({
  entry,
  viewMode = 'grid',
  isPresentationMode = false,
  familyId,
  studentId,
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
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showTagSheet, setShowTagSheet] = useState(false);
  const [updatingTags, setUpdatingTags] = useState(false);
  const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
  const [showCommunicationSheet, setShowCommunicationSheet] = useState(false);
  const videoRef = useRef(null);

  // Use communication hook when we have the required IDs
  const {
    unreadByEntry = {}
  } = useCommunication(
    familyId || null,
    studentId || null,
    entry?.id || null
  );

  const unreadCount = entry?.id ? (unreadByEntry[entry.id] || 0) : 0;

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
    const attachmentCount = (entry.files?.length || 0) + (entry.attachments?.length || 0);
    if (attachmentCount > 0) {
      if (entry.type === 'image') return `${attachmentCount} image${attachmentCount > 1 ? 's' : ''}`;
      if (entry.type === 'video') return `${attachmentCount} video${attachmentCount > 1 ? 's' : ''}`;
      return `${attachmentCount} attachment${attachmentCount > 1 ? 's' : ''}`;
    }
    if (entry.reflections) {
      return 'Contains reflections';
    }
    if (entry.content) {
      return 'Contains content';
    }
    return '';
  };

  // Combine files and attachments into a single array for the preview component
  const getAllAttachments = () => {
    const files = entry.files || [];
    const attachments = entry.attachments || [];
    const allAttachments = [...files, ...attachments];

    // Debug logging
    if (viewMode === 'expanded') {
      console.log('PortfolioEntry - getAllAttachments debug:', {
        entryId: entry.id,
        entryTitle: entry.title,
        entryType: entry.type,
        files: files,
        filesLength: files.length,
        attachments: attachments,
        attachmentsLength: attachments.length,
        totalAttachments: allAttachments.length,
        fullEntry: entry
      });
    }

    return allAttachments;
  };

  // Handle attachment update (title changes)
  const handleAttachmentUpdate = async (index, updatedAttachment) => {
    if (!onUpdate) return;

    const allAttachments = getAllAttachments();
    const updatedAllAttachments = [...allAttachments];
    updatedAllAttachments[index] = updatedAttachment;

    // Split back into files and attachments based on original structure
    const files = entry.files || [];
    const attachments = entry.attachments || [];

    let updatedFiles = files;
    let updatedAttachmentsList = attachments;

    if (index < files.length) {
      // Update in files array
      updatedFiles = [...files];
      updatedFiles[index] = updatedAttachment;
    } else {
      // Update in attachments array
      const attachmentIndex = index - files.length;
      updatedAttachmentsList = [...attachments];
      updatedAttachmentsList[attachmentIndex] = updatedAttachment;
    }

    // Update the entry with new file metadata
    await onUpdate({
      files: updatedFiles.length > 0 ? updatedFiles : undefined,
      attachments: updatedAttachmentsList.length > 0 ? updatedAttachmentsList : undefined
    });
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
    // Debug log the entry data
    console.log('PortfolioEntry - Expanded mode entry:', {
      id: entry.id,
      title: entry.title,
      type: entry.type,
      hasFiles: !!(entry.files && entry.files.length > 0),
      hasAttachments: !!(entry.attachments && entry.attachments.length > 0),
      entry: entry
    });

    // In expanded mode, show full content directly without accordion
    return (
      <>
      <div className="space-y-6 p-6">
        {/* Title and metadata */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{entry.title}</h2>
            {familyId && studentId && (
              <MessageIconButton
                unreadCount={unreadCount}
                onClick={() => setShowCommunicationSheet(true)}
                variant="outline"
                size="default"
                showLabel={true}
                labelText="Messages"
                iconSize="default"
              />
            )}
          </div>
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

        {/* Main content - text/reflections */}
        {entry.content && (
          <div className="bg-white rounded-lg mb-6">
            {renderHTMLContent(entry.content)}
          </div>
        )}

        {/* Reflections */}
        {entry.reflections && (
          <div className="bg-purple-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-purple-900 mb-2">Reflections</h3>
            <p className="text-gray-700">{entry.reflections}</p>
          </div>
        )}

        {/* Attachments Section - Below main content */}
        {getAllAttachments().length > 0 && (
          <EditableAttachmentsSection
            attachments={getAllAttachments()}
            onUpdateAttachment={handleAttachmentUpdate}
            readOnly={!onUpdate}
            className="border-t pt-6"
          />
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

        {/* Resources */}
        {familyId && studentId && (
          <div className="border-t pt-6">
            <ResourceDrop
              level="entry"
              itemId={entry.id}
              itemTitle={entry.title}
              familyId={familyId}
              studentId={studentId}
              showInheritedResources={false}
              isEditMode={false}
            />
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

      {/* Communication Sheet */}
      {familyId && studentId && (
        <CommunicationSheet
          entryId={entry?.id}
          entryTitle={entry?.title}
          familyId={familyId}
          studentId={studentId}
          isOpen={showCommunicationSheet}
          onOpenChange={setShowCommunicationSheet}
        />
      )}
      </>
    );
  }

  // Main accordion-based display
  return (
    <>
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
            {getAllAttachments().length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Paperclip className="w-3 h-3 mr-1" />
                {getAllAttachments().length}
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="px-6 pb-6 space-y-4">
          {/* Enhanced Communication and Action Buttons */}
          {familyId && studentId && (
            <div className="mb-4 p-2">
              <EnhancedMessageButton
                parentMessages={parentMessages}
                staffMessages={staffMessages}
                lastMessage={lastMessage}
                onClick={() => setShowCommunicationSheet(true)}
                size="default"
                orientation="horizontal"
                className="max-w-full"
              />
            </div>
          )}

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

          {/* Main Content */}

          {entry.content && (
            <div className="bg-gray-50 rounded-lg p-6 mb-4">
              {renderHTMLContent(entry.content)}
            </div>
          )}

          {/* Reflections */}
          {entry.reflections && (
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-purple-900 mb-2">Reflections</h4>
              <p className="text-gray-700">{entry.reflections}</p>
            </div>
          )}

          {/* Attachments Section */}
          {getAllAttachments().length > 0 && (
            <EditableAttachmentsSection
              attachments={getAllAttachments()}
              onUpdateAttachment={handleAttachmentUpdate}
              readOnly={!onUpdate}
              className="mb-4"
            />
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
          <DevFileIndicator fileName="PortfolioEntry.js" />
        </SheetContent>
      </Sheet>
    </AccordionItem>

    {/* Communication Sheet */}
    {familyId && studentId && (
      <CommunicationSheet
        entryId={entry?.id}
        entryTitle={entry?.title}
        familyId={familyId}
        studentId={studentId}
        isOpen={showCommunicationSheet}
        onOpenChange={setShowCommunicationSheet}
      />
    )}
    </>
  );
};

export default PortfolioEntry;