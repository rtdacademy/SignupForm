import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
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
  Zap
} from 'lucide-react';
import PortfolioComments from './PortfolioComments';

const PortfolioEntry = ({
  entry,
  viewMode = 'grid',
  isPresentationMode = false,
  onEdit,
  onDelete,
  onUpdate,
  comments = [],
  loadingComments = false,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onLoadComments
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);

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

  // Get preview content
  const getPreviewContent = () => {
    if (entry.type === 'text' || entry.type === 'combined') {
      // Strip HTML tags and truncate
      const stripped = entry.content?.replace(/<[^>]*>/g, '') || '';
      return stripped.length > 150 ? `${stripped.substring(0, 150)}...` : stripped;
    }
    return '';
  };

  // Count total tags
  const getTotalTagCount = () => {
    const activities = entry.tags?.activities?.length || 0;
    const assessments = entry.tags?.assessments?.length || 0;
    const resources = entry.tags?.resources?.length || 0;
    return activities + assessments + resources;
  };

  // Grid View Card
  const GridCard = () => (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 bg-gray-100 rounded-lg">
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {entry.title}
                {entry.quickAdd && (
                  <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                    <Zap className="w-3 h-3 mr-1" />
                    Quick Add
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(entry.date)}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Preview Content */}
        {entry.type === 'image' && entry.files?.length > 0 && (
          <div className="mb-3 grid grid-cols-2 gap-2">
            {entry.files.slice(0, 4).map((file, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer"
                onClick={() => {
                  setCurrentImageIndex(index);
                  setShowPreview(true);
                }}
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            ))}
            {entry.files.length > 4 && (
              <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-gray-600">
                +{entry.files.length - 4} more
              </div>
            )}
          </div>
        )}

        {entry.type === 'video' && entry.files?.length > 0 && (
          <div className="mb-3">
            <div className="aspect-video bg-black rounded overflow-hidden">
              <video
                src={entry.files[0].url}
                className="w-full h-full"
                controls
                preload="metadata"
              />
            </div>
          </div>
        )}

        {(entry.type === 'text' || entry.type === 'combined') && entry.content && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {getPreviewContent()}
          </p>
        )}

        {entry.type === 'file' && entry.files?.length > 0 && (
          <div className="mb-3 space-y-1">
            {entry.files.slice(0, 3).map((file, index) => (
              <div key={index} className="flex items-center text-sm text-gray-600">
                <Upload className="w-3 h-3 mr-2" />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
            {entry.files.length > 3 && (
              <p className="text-sm text-gray-500">
                +{entry.files.length - 3} more files
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {getTotalTagCount() > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="w-3 h-3 text-gray-400" />
            <div className="flex flex-wrap gap-1">
              {entry.tags?.activities?.slice(0, 2).map((tag, index) => (
                <span key={index} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {entry.tags?.assessments?.slice(0, 1).map((tag, index) => (
                <span key={index} className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {getTotalTagCount() > 3 && (
                <span className="text-xs text-gray-500">
                  +{getTotalTagCount() - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Reflections */}
        {entry.reflections && (
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-3 h-3 text-gray-400 mt-0.5" />
            <p className="text-xs text-gray-600 line-clamp-2">
              {entry.reflections}
            </p>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          {entry.files?.length > 0 && (
            <span>{entry.files.length} file{entry.files.length > 1 ? 's' : ''}</span>
          )}
          {entry.commentCount > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 hover:text-gray-700"
            >
              <MessageSquare className="w-3 h-3" />
              {entry.commentCount}
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(true)}
          className="text-xs"
        >
          View Details
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && onCreateComment && (
        <div className="border-t">
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
    </Card>
  );

  // List View Row
  const ListRow = () => (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <div className="p-4 flex items-center space-x-4">
        {/* Type Icon */}
        <div className="p-2 bg-gray-100 rounded-lg">
          {getTypeIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {entry.title}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(entry.date)}
                </p>
                {getTotalTagCount() > 0 && (
                  <p className="text-sm text-gray-500 flex items-center">
                    <Tag className="w-3 h-3 mr-1" />
                    {getTotalTagCount()} tag{getTotalTagCount() > 1 ? 's' : ''}
                  </p>
                )}
                {entry.files?.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {entry.files.length} file{entry.files.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Full Preview Modal
  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {getTypeIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {entry.title}
              </h2>
              <p className="text-sm text-gray-500">
                {formatDate(entry.date)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Image Gallery */}
          {entry.type === 'image' && entry.files?.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <img
                  src={entry.files[currentImageIndex].url}
                  alt={entry.files[currentImageIndex].name}
                  className="w-full rounded-lg"
                />
                {entry.files.length > 1 && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? entry.files.length - 1 : prev - 1
                      )}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === entry.files.length - 1 ? 0 : prev + 1
                      )}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              {entry.files.length > 1 && (
                <div className="mt-3 flex justify-center space-x-2">
                  {entry.files.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Video Player */}
          {entry.type === 'video' && entry.files?.length > 0 && (
            <div className="mb-6">
              <video
                src={entry.files[0].url}
                className="w-full rounded-lg"
                controls
              />
            </div>
          )}

          {/* Text Content */}
          {entry.content && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Content</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            </div>
          )}

          {/* File List */}
          {entry.type === 'file' && entry.files?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Files</h3>
              <div className="space-y-2">
                {entry.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download
                      className="text-purple-600 hover:text-purple-700"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {getTotalTagCount() > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
              <div className="space-y-2">
                {entry.tags?.activities?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Activities</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.activities.map((tag, index) => (
                        <span key={index} className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.tags?.assessments?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assessments</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.assessments.map((tag, index) => (
                        <span key={index} className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {entry.tags?.resources?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Resources</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.resources.map((tag, index) => (
                        <span key={index} className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reflections */}
          {entry.reflections && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Reflections</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{entry.reflections}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-2 p-6 border-t">
          <Button variant="outline" onClick={onEdit}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={onDelete} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );

  // Presentation Mode Card - Beautiful display for showcasing
  const PresentationCard = () => (
    <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white">
      {/* Image Type - Full Image Display */}
      {entry.type === 'image' && entry.files?.length > 0 && (
        <div 
          className="aspect-[4/3] overflow-hidden cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          <img
            src={entry.files[0].url}
            alt={entry.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{entry.title}</h3>
              <p className="text-sm opacity-90">{formatDate(entry.date)}</p>
            </div>
          </div>
          {entry.files.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              +{entry.files.length - 1} more
            </div>
          )}
        </div>
      )}

      {/* Video Type - Video Thumbnail */}
      {entry.type === 'video' && entry.files?.length > 0 && (
        <div 
          className="aspect-video bg-black relative cursor-pointer group"
          onClick={() => setShowPreview(true)}
        >
          <video
            src={entry.files[0].url}
            className="w-full h-full object-cover"
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Video className="w-8 h-8 text-gray-800 ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-xl font-bold">{entry.title}</h3>
            <p className="text-sm opacity-90 mt-1">{formatDate(entry.date)}</p>
          </div>
        </div>
      )}

      {/* Text Type - Beautiful Typography */}
      {entry.type === 'text' && (
        <div 
          className="p-8 cursor-pointer min-h-[300px] flex flex-col"
          onClick={() => setShowPreview(true)}
        >
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
              {entry.title}
            </h3>
            <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
          </div>
          
          <div className="flex-1">
            <div 
              className="text-gray-600 line-clamp-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: entry.content?.substring(0, 300) + '...' || '' 
              }}
            />
          </div>

          {/* Tags in presentation mode */}
          {getTotalTagCount() > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                {entry.tags?.activities?.slice(0, 2).map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
                {entry.tags?.assessments?.slice(0, 1).map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full font-medium">
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Type - Document Display */}
      {entry.type === 'file' && (
        <div 
          className="p-8 cursor-pointer"
          onClick={() => setShowPreview(true)}
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Upload className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {entry.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{formatDate(entry.date)}</p>
              
              <div className="space-y-2">
                {entry.files?.slice(0, 3).map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded">
                    <Paperclip className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{file.name}</span>
                  </div>
                ))}
                {entry.files?.length > 3 && (
                  <p className="text-sm text-gray-500 pl-3">
                    +{entry.files.length - 3} more files
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combined/Mixed Type */}
      {entry.type === 'combined' && (
        <div className="cursor-pointer" onClick={() => setShowPreview(true)}>
          {entry.files?.length > 0 && entry.files[0].type?.includes('image') && (
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={entry.files[0].url}
                alt={entry.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          )}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{entry.title}</h3>
            <p className="text-sm text-gray-500 mb-3">{formatDate(entry.date)}</p>
            {entry.content && (
              <div 
                className="text-gray-600 line-clamp-3 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
              />
            )}
            {entry.files?.length > 0 && (
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <Paperclip className="w-4 h-4 mr-1" />
                {entry.files.length} attachment{entry.files.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reflection Badge - Shows if has reflections */}
      {entry.reflections && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-purple-700 shadow-lg">
          <MessageSquare className="w-3 h-3 inline mr-1" />
          Reflection
        </div>
      )}

      {/* Hover Actions - Subtle in presentation mode */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="default"
          size="sm"
          className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            setShowPreview(true);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Choose which view to render
  if (viewMode === 'presentation' || isPresentationMode) {
    return (
      <>
        <PresentationCard />
        {showPreview && <PreviewModal />}
      </>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? <GridCard /> : <ListRow />}
      {showPreview && <PreviewModal />}
    </>
  );
};

export default PortfolioEntry;