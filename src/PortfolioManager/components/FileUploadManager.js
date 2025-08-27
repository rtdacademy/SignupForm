import React, { useState, useCallback, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import {
  Upload,
  X,
  File,
  Image,
  Video,
  FileText,
  Download,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Paperclip,
  FolderOpen
} from 'lucide-react';
import { uploadPortfolioFile, deletePortfolioFile } from '../hooks/usePortfolio';

const FileUploadManager = ({
  familyId,
  studentId,
  schoolYear,
  structureId,
  entryId,
  existingFiles = [],
  onFilesUploaded,
  onFileDeleted,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes = ['image/*', 'video/*', 'application/pdf', '.doc', '.docx'],
  maxFiles = 10,
  compact = false
}) => {
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // File type icons
  const getFileIcon = (file) => {
    const type = file.type || file.contentType || '';
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file type
    const isAllowed = allowedFileTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type || file.name.endsWith(type);
    });

    if (!isAllowed) {
      return 'File type not allowed';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    // Check max files limit
    if (existingFiles.length + uploadQueue.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate and queue files
    const newQueue = [];
    const errors = {};

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors[file.name] = error;
      } else {
        const fileData = {
          id: `temp_${Date.now()}_${Math.random()}`,
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          preview: null
        };

        // Generate preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUploadQueue(prev => prev.map(item => 
              item.id === fileData.id 
                ? { ...item, preview: reader.result }
                : item
            ));
          };
          reader.readAsDataURL(file);
        }

        newQueue.push(fileData);
      }
    });

    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
    }

    setUploadQueue(prev => [...prev, ...newQueue]);
    
    // Start upload automatically
    if (newQueue.length > 0) {
      uploadFiles(newQueue);
    }
  };

  // Upload files
  const uploadFiles = async (files) => {
    for (const fileData of files) {
      try {
        // Update status
        setUploadQueue(prev => prev.map(item =>
          item.id === fileData.id
            ? { ...item, status: 'uploading' }
            : item
        ));

        // Upload file
        const uploadedFile = await uploadPortfolioFile(
          fileData.file,
          familyId,
          studentId,
          schoolYear,
          structureId,
          entryId,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [fileData.id]: progress
            }));
          }
        );

        // Update status to completed
        setUploadQueue(prev => prev.map(item =>
          item.id === fileData.id
            ? { ...item, status: 'completed', uploadedFile }
            : item
        ));

        // Notify parent component
        if (onFilesUploaded) {
          onFilesUploaded([uploadedFile]);
        }

        // Remove from queue after delay
        setTimeout(() => {
          setUploadQueue(prev => prev.filter(item => item.id !== fileData.id));
          setUploadProgress(prev => {
            const { [fileData.id]: _, ...rest } = prev;
            return rest;
          });
        }, 2000);

      } catch (error) {
        console.error('Upload error:', error);
        
        // Update status to error
        setUploadQueue(prev => prev.map(item =>
          item.id === fileData.id
            ? { ...item, status: 'error', error: error.message }
            : item
        ));
      }
    }
  };

  // Cancel upload
  const cancelUpload = (fileId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== fileId));
    setUploadProgress(prev => {
      const { [fileId]: _, ...rest } = prev;
      return rest;
    });
  };

  // Delete existing file
  const handleDeleteFile = async (file) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await deletePortfolioFile(file.url, file.path);
      if (onFileDeleted) {
        onFileDeleted(file);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Compact view for inline usage
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Paperclip className="w-4 h-4 mr-2" />
            Attach Files
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
            className="md:hidden"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        {/* Upload queue (compact) */}
        {uploadQueue.length > 0 && (
          <div className="space-y-1">
            {uploadQueue.map(item => (
              <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                {getFileIcon(item)}
                <span className="text-xs truncate flex-1">{item.name}</span>
                {item.status === 'uploading' && (
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                )}
                {item.status === 'completed' && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-3 h-3 text-red-500" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Existing files (compact) */}
        {existingFiles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs"
              >
                {getFileIcon(file)}
                <span className="ml-1 truncate max-w-[100px]">{file.name}</span>
                <button
                  onClick={() => handleDeleteFile(file)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging 
            ? 'border-purple-400 bg-purple-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-700 mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Max {maxFiles} files, up to {formatFileSize(maxFileSize)} each
        </p>
        
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
          <Button
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            className="md:hidden"
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Upload queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploading Files</h4>
          {uploadQueue.map(item => (
            <div key={item.id} className="border rounded-lg p-3">
              <div className="flex items-start space-x-3">
                {/* Preview */}
                {item.preview && (
                  <img
                    src={item.preview}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                {!item.preview && (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    {getFileIcon(item)}
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.size)}
                  </p>
                  
                  {/* Progress bar */}
                  {item.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress value={uploadProgress[item.id] || 0} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">
                        {uploadProgress[item.id] || 0}% uploaded
                      </p>
                    </div>
                  )}

                  {/* Status messages */}
                  {item.status === 'completed' && (
                    <p className="text-xs text-green-600 flex items-center mt-2">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Upload complete
                    </p>
                  )}
                  {item.status === 'error' && (
                    <p className="text-xs text-red-600 flex items-center mt-2">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {item.error || 'Upload failed'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div>
                  {item.status === 'pending' || item.status === 'uploading' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelUpload(item.id)}
                      className="p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload errors */}
      {Object.keys(uploadErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm font-medium text-red-900 mb-2">Upload Errors</p>
          {Object.entries(uploadErrors).map(([fileName, error]) => (
            <p key={fileName} className="text-xs text-red-700">
              <span className="font-medium">{fileName}:</span> {error}
            </p>
          ))}
        </div>
      )}

      {/* Existing files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Attached Files ({existingFiles.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* File icon or thumbnail */}
                  {file.type?.startsWith('image/') && file.thumbnailUrl ? (
                    <img
                      src={file.thumbnailUrl}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      className="p-1"
                    >
                      {file.type?.startsWith('image/') || file.type?.startsWith('video/') 
                        ? <Eye className="w-4 h-4" />
                        : <Download className="w-4 h-4" />
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadManager;