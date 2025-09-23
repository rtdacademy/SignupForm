import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import DevFileIndicator from './DevFileIndicator';
import VideoEmbed from './VideoEmbed';
import {
  Download,
  X,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  ExternalLink,
  Film,
  Edit2,
  Check,
  Copy,
  Loader2
} from 'lucide-react';

const EditableAttachmentsSection = ({
  attachments = [],
  onUpdateAttachment,
  className = '',
  readOnly = false
}) => {
  const [expandedVideo, setExpandedVideo] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [copiedLink, setCopiedLink] = useState(null);
  const [localAttachments, setLocalAttachments] = useState(attachments);

  // Update local attachments when props change
  useEffect(() => {
    setLocalAttachments(attachments);
  }, [attachments]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Get attachment icon
  const getAttachmentIcon = (attachment) => {
    if (!attachment?.type) return File;
    if (attachment.type.includes('video')) return VideoIcon;
    if (attachment.type.includes('image')) return ImageIcon;
    if (attachment.type.includes('pdf')) return FileText;
    return File;
  };

  // Get file type badge color
  const getTypeBadgeColor = (type) => {
    if (type?.includes('video')) return 'bg-purple-100 text-purple-700';
    if (type?.includes('image')) return 'bg-blue-100 text-blue-700';
    if (type?.includes('pdf')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Handle download
  const handleDownload = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.displayTitle || attachment.title || attachment.name || 'download';
    link.click();
  };

  // Start editing title
  const startEditingTitle = (index, attachment) => {
    setEditingTitle(index);
    setTempTitle(attachment.displayTitle || attachment.title || attachment.name || '');
  };

  // Save title
  const saveTitle = (index) => {
    const updatedAttachment = {
      ...localAttachments[index],
      displayTitle: tempTitle || localAttachments[index].name
    };

    const updatedAttachments = [...localAttachments];
    updatedAttachments[index] = updatedAttachment;
    setLocalAttachments(updatedAttachments);

    if (onUpdateAttachment) {
      onUpdateAttachment(index, updatedAttachment);
    }

    setEditingTitle(null);
    setTempTitle('');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTitle(null);
    setTempTitle('');
  };

  // Copy share link
  const copyShareLink = async (attachment, index) => {
    try {
      await navigator.clipboard.writeText(attachment.url);
      setCopiedLink(index);
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (!localAttachments || localAttachments.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Film className="w-5 h-5" />
          Attachments ({localAttachments.length})
        </h3>
      </div>

      {/* Attachments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {localAttachments.map((attachment, index) => {
          const Icon = getAttachmentIcon(attachment);
          const isVideo = attachment.type?.includes('video');
          const isImage = attachment.type?.includes('image');
          const displayTitle = attachment.displayTitle || attachment.title || attachment.name || 'Untitled';

          return (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Preview Area */}
              <div className="relative aspect-video bg-gray-100">
                {isVideo ? (
                  <VideoEmbed
                    url={attachment.url}
                    title={displayTitle}
                    className="w-full h-full"
                  />
                ) : isImage ? (
                  <img
                    src={attachment.url}
                    alt={displayTitle}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setExpandedImage(attachment)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Icon className="w-16 h-16 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Preview not available</p>
                  </div>
                )}

                {/* Overlay Actions for Videos */}
                {isVideo && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-purple-600/90 hover:bg-purple-700 text-white"
                      onClick={() => window.open(attachment.url, '_blank')}
                      title="Open Original Video"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => copyShareLink(attachment, index)}
                      title="Copy Link"
                    >
                      {copiedLink === index ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Attachment Details */}
              <div className="p-4">
                {/* Title with Edit capability */}
                <div className="flex items-start justify-between mb-2">
                  {editingTitle === index ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        className="h-7 text-sm"
                        placeholder="Enter title"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle(index);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => saveTitle(index)}
                        className="h-7 w-7 p-0"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditing}
                        className="h-7 w-7 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {displayTitle}
                        </h4>
                        {!readOnly && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditingTitle(index, attachment)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <Badge className={getTypeBadgeColor(attachment.type)}>
                        {attachment.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                      </Badge>
                    </>
                  )}
                </div>

                {/* File info */}
                {editingTitle !== index && (
                  <>
                    <p className="text-xs text-gray-500 mb-1">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)}
                    </p>
                  </>
                )}

                {/* Action buttons for non-video/image files */}
                {!isVideo && !isImage && editingTitle !== index && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => handleDownload(attachment)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Expanded Video Modal */}
      {expandedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-6xl">
            <Button
              size="sm"
              variant="ghost"
              className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
              onClick={() => setExpandedVideo(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <VideoEmbed
                url={expandedVideo.url}
                title={expandedVideo.displayTitle || expandedVideo.title || expandedVideo.name}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-5xl max-h-full">
            <Button
              size="sm"
              variant="ghost"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setExpandedImage(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <img
              src={expandedImage.url}
              alt={expandedImage.displayTitle || expandedImage.title || expandedImage.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
      <DevFileIndicator fileName="EditableAttachmentsSection.js" />
    </div>
  );
};

export default EditableAttachmentsSection;