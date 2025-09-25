import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  FileText,
  Image,
  Video,
  Link2,
  File,
  Download,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  User,
  BookOpen,
  MoreVertical,
  Share2,
  Library,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../../components/ui/dropdown-menu';
import VideoEmbed from './VideoEmbed';

const ResourceCard = ({
  resource,
  onEdit,
  onDelete,
  onAddToLocation,
  onCopyToLibrary,
  canEdit = false,
  canDelete = false,
  canShare = false,
  compact = false,
  showMetadata = true
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const getResourceIcon = (type) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'image':
        return <Image className="w-5 h-5" />;
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'link':
        return <Link2 className="w-5 h-5" />;
      case 'text':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getResourceBadgeColor = (type) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-700';
      case 'image':
        return 'bg-green-100 text-green-700';
      case 'video':
        return 'bg-purple-100 text-purple-700';
      case 'link':
        return 'bg-orange-100 text-orange-700';
      case 'text':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDownload = () => {
    if (resource.url) {
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.title || 'download';
      link.click();
    }
  };

  const handleCopyLink = async () => {
    if (resource.url) {
      try {
        await navigator.clipboard.writeText(resource.url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (error) {
        console.error('Failed to copy link:', error);
      }
    }
  };

  const handleView = () => {
    if (resource.type === 'link' || resource.type === 'document') {
      window.open(resource.url, '_blank');
    } else {
      setExpanded(true);
    }
  };

  const renderPreview = () => {
    if (resource.type === 'image' && resource.file?.thumbnailUrl) {
      return (
        <img
          src={resource.file.thumbnailUrl}
          alt={resource.title}
          className="w-full h-32 object-cover rounded"
        />
      );
    }

    if (resource.type === 'video' && resource.url) {
      return (
        <div className="relative h-32 bg-gray-100 rounded">
          <VideoEmbed
            url={resource.url}
            title={resource.title}
            className="w-full h-full"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
            <Video className="w-8 h-8 text-white" />
          </div>
        </div>
      );
    }

    if (resource.type === 'text' && resource.content) {
      const plainText = resource.content.replace(/<[^>]*>/g, '');
      return (
        <div className="p-3 bg-gray-50 rounded h-32 overflow-hidden">
          <p className="text-sm text-gray-600 line-clamp-5">
            {plainText}
          </p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded">
        {getResourceIcon(resource.type)}
      </div>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0">
          {getResourceIcon(resource.type)}
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="font-medium text-sm truncate">{resource.title}</h4>
          {resource.description && (
            <p className="text-xs text-gray-500 truncate">{resource.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Badge className={`${getResourceBadgeColor(resource.type)} text-xs`}>
            {resource.type}
          </Badge>
          {resource.library?.isInLibrary && (
            <Library className="w-3 h-3 text-blue-500" />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <MoreVertical className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleView}>
              <Eye className="w-3 h-3 mr-2" />
              View
            </DropdownMenuItem>
            {resource.url && (
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="w-3 h-3 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            {canEdit && (
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                <Edit2 className="w-3 h-3 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(resource.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          {renderPreview()}

          <div className="mt-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-grow min-w-0">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {getResourceIcon(resource.type)}
                  <span className="truncate">{resource.title}</span>
                </h3>
                {resource.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {resource.description}
                  </p>
                )}
              </div>
              <Badge className={getResourceBadgeColor(resource.type)}>
                {resource.type}
              </Badge>
            </div>

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {resource.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {showMetadata && (
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {resource.metadata?.createdByName || 'Unknown'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(resource.metadata?.createdAt)}
                </div>
                {resource.file?.size && (
                  <div>{formatFileSize(resource.file.size)}</div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-1">
                {resource.library?.isInLibrary && (
                  <Badge variant="outline" className="text-xs">
                    <Library className="w-3 h-3 mr-1" />
                    In Library
                  </Badge>
                )}
                {resource.metadata?.usageCount > 0 && (
                  <span className="text-xs text-gray-500">
                    Used {resource.metadata.usageCount} times
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleView}
                  title="View Resource"
                >
                  <Eye className="w-4 h-4" />
                </Button>

                {resource.url && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyLink}
                      title="Copy Link"
                    >
                      {copiedLink ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDownload}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {(canEdit || canDelete || canShare) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => onEdit(resource)}>
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onAddToLocation && (
                        <DropdownMenuItem onClick={() => onAddToLocation(resource)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Add to Another Location
                        </DropdownMenuItem>
                      )}
                      {onCopyToLibrary && !resource.library?.isInLibrary && (
                        <DropdownMenuItem onClick={() => onCopyToLibrary(resource)}>
                          <Library className="w-4 h-4 mr-2" />
                          Copy to Library
                        </DropdownMenuItem>
                      )}
                      {canShare && (
                        <DropdownMenuItem onClick={() => {}}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(resource.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {expanded && (resource.type === 'image' || resource.type === 'text') && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setExpanded(false)}
        >
          <div className="relative max-w-5xl max-h-full">
            <Button
              size="sm"
              variant="ghost"
              className="absolute -top-10 right-0 text-white hover:bg-white/20"
              onClick={() => setExpanded(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            {resource.type === 'image' ? (
              <img
                src={resource.url}
                alt={resource.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            ) : (
              <div className="bg-white rounded-lg p-6 max-w-3xl max-h-[80vh] overflow-auto">
                <h2 className="text-xl font-bold mb-4">{resource.title}</h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: resource.content }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ResourceCard;