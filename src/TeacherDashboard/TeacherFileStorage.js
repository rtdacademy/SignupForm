import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { storage } from '../firebase';
import { 
  ref, 
  uploadBytes, 
  listAll, 
  getDownloadURL, 
  deleteObject,
  getMetadata,
  getBlob
} from 'firebase/storage';
import {
  FolderPlus,
  Upload,
  File,
  Folder,
  Download,
  Trash2,
  Edit3,
  ChevronRight,
  ChevronDown,
  Search,
  Grid,
  List,
  MoreVertical,
  Calendar,
  HardDrive,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Code,
  FileType,
  Presentation,
  FileX,
  Check,
  Square,
  CheckSquare,
  X,
  Copy,
  Save,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useDrag, useDrop } from 'react-dnd';

function TeacherFileStorage() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [folderCounts, setFolderCounts] = useState({});
  const [currentPath, setCurrentPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [movingFile, setMovingFile] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isPasteAreaFocused, setIsPasteAreaFocused] = useState(false);
  const [lastPastedFiles, setLastPastedFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Get user-specific storage path
  const getUserStoragePath = (path = '') => {
    const userPath = `teachers/${user.uid}`;
    return path ? `${userPath}/${path}` : userPath;
  };

  // Count files in a folder
  const countFilesInFolder = async (folderPath) => {
    try {
      const folderRef = ref(storage, getUserStoragePath(folderPath));
      const result = await listAll(folderRef);
      // Filter out .placeholder files from count
      const fileCount = result.items.filter(item => !item.name.includes('.placeholder')).length;
      return fileCount;
    } catch (error) {
      console.error('Error counting files in folder:', error);
      return 0;
    }
  };

  // Load files and folders from current path
  const loadFiles = async (path = currentPath, showSkeletons = false) => {
    setIsLoading(true);
    setError('');
    
    // Only clear files if showSkeletons is true (initial load or folder change)
    if (showSkeletons) {
      setFiles([]);
      setFolders([]);
    }
    
    try {
      const storageRef = ref(storage, getUserStoragePath(path));
      const result = await listAll(storageRef);
      
      // Get folders
      const folderList = result.prefixes.map(folderRef => ({
        name: folderRef.name,
        type: 'folder',
        path: path ? `${path}/${folderRef.name}` : folderRef.name
      }));
      
      // Get file counts for each folder
      const folderCountPromises = folderList.map(async (folder) => {
        const count = await countFilesInFolder(folder.path);
        return { path: folder.path, count };
      });
      
      const folderCountResults = await Promise.all(folderCountPromises);
      const newFolderCounts = {};
      folderCountResults.forEach(({ path, count }) => {
        newFolderCounts[path] = count;
      });
      
      // Get files with metadata
      const filePromises = result.items.map(async (fileRef) => {
        const metadata = await getMetadata(fileRef);
        const downloadURL = await getDownloadURL(fileRef);
        
        return {
          name: fileRef.name,
          type: 'file',
          size: metadata.size,
          updated: metadata.updated,
          downloadURL,
          fullPath: fileRef.fullPath,
          path: path ? `${path}/${fileRef.name}` : fileRef.name
        };
      });
      
      const fileList = await Promise.all(filePromises);
      
      // Filter out .placeholder files from display
      const filteredFiles = fileList.filter(file => !file.name.includes('.placeholder'));
      
      // Add display names to files based on timestamps and versioning
      const allFileNames = filteredFiles.map(f => f.name);
      const filesWithDisplayNames = filteredFiles.map(file => ({
        ...file,
        displayName: getDisplayFileName(file.name, allFileNames)
      }));
      
      setFolders(folderList);
      setFiles(filesWithDisplayNames);
      setFolderCounts(newFolderCounts);
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload files
  const handleFileUpload = async (uploadFiles, isPastedImages = false) => {
    if (!uploadFiles.length) return;
    
    setError('');
    const uploadPromises = [];
    const uploadedImageUrls = [];
    
    for (const file of uploadFiles) {
      // Always use timestamped filename for storage
      const timestampedFileName = generateTimestampedFileName(file.name);
      const storageRef = ref(storage, getUserStoragePath(`${currentPath}/${timestampedFileName}`));
      const uploadPromise = uploadBytes(storageRef, file).then(async (snapshot) => {
        const downloadURL = await getDownloadURL(snapshot.ref);
        if (isPastedImages && isImageFile(file.name)) {
          uploadedImageUrls.push({
            name: file.name,
            url: downloadURL
          });
        }
        return snapshot;
      });
      uploadPromises.push(uploadPromise);
      
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));
    }
    
    try {
      await Promise.all(uploadPromises);
      
      // Handle pasted images - copy URL and show toast
      if (isPastedImages && uploadedImageUrls.length > 0) {
        const firstImage = uploadedImageUrls[0];
        
        // Copy first image URL to clipboard
        try {
          await navigator.clipboard.writeText(firstImage.url);
          
          // Show toast with image info and copy confirmation
          toast.success(`Image uploaded successfully!`, {
            description: `"${firstImage.name}" URL copied to clipboard`,
            duration: 4000,
            action: {
              label: 'View',
              onClick: () => window.open(firstImage.url, '_blank')
            }
          });
          
        } catch (clipboardError) {
          console.error('Failed to copy to clipboard:', clipboardError);
          toast.success(`Image uploaded successfully!`, {
            description: `"${firstImage.name}" - Click to copy URL`,
            duration: 4000,
            action: {
              label: 'Copy URL',
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(firstImage.url);
                  toast.success('URL copied to clipboard!');
                } catch (e) {
                  toast.error('Failed to copy URL');
                }
              }
            }
          });
        }
        
        // Store the pasted files for potential future reference
        setLastPastedFiles(uploadedImageUrls);
      } else {
        setSuccess(`Successfully uploaded ${uploadFiles.length} file(s)`);
        setTimeout(() => setSuccess(''), 3000);
      }
      
      loadFiles(); // Refresh without skeletons after upload
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload files. Please try again.');
      if (isPastedImages) {
        toast.error('Failed to upload pasted image', {
          description: 'Please try again'
        });
      }
    }
    
    setUploadProgress({});
  };

  // Create new folder
  const createFolder = async (folderName) => {
    if (!folderName.trim()) return;
    
    try {
      const placeholderRef = ref(storage, getUserStoragePath(`${currentPath}/${folderName}/.placeholder`));
      await uploadBytes(placeholderRef, new Blob([''], { type: 'text/plain' }));
      setSuccess(`Folder "${folderName}" created successfully`);
      setTimeout(() => setSuccess(''), 3000);
      loadFiles(); // Refresh without skeletons after folder creation
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder. Please try again.');
    }
  };

  // Delete file or folder
  const deleteItem = async (item) => {
    try {
      if (item.type === 'file') {
        const fileRef = ref(storage, item.fullPath);
        await deleteObject(fileRef);
      } else {
        // Delete folder by deleting all items in it
        const folderRef = ref(storage, getUserStoragePath(item.path));
        const result = await listAll(folderRef);
        
        const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
        await Promise.all(deletePromises);
      }
      
      setSuccess(`${item.type === 'file' ? 'File' : 'Folder'} deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
      loadFiles(); // Refresh without skeletons after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(`Failed to delete ${item.type}. Please try again.`);
    }
  };

  // Toggle file selection
  const toggleFileSelection = (filePath) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  // Select all files
  const selectAllFiles = () => {
    const allFilePaths = filteredFiles.map(file => file.path);
    setSelectedFiles(new Set(allFilePaths));
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  // Bulk delete selected files
  const deleteSelectedFiles = async () => {
    if (selectedFiles.size === 0) return;
    
    setIsDeleting(true);
    setError('');
    
    try {
      const filesToDelete = files.filter(file => selectedFiles.has(file.path));
      const deletePromises = filesToDelete.map(file => {
        const fileRef = ref(storage, file.fullPath);
        return deleteObject(fileRef);
      });
      
      await Promise.all(deletePromises);
      
      setSuccess(`Successfully deleted ${selectedFiles.size} file(s)`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedFiles(new Set());
      loadFiles(); // Refresh without skeletons after bulk deletion
    } catch (error) {
      console.error('Error deleting files:', error);
      setError('Failed to delete some files. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Navigate to folder
  const navigateToFolder = (folderPath) => {
    setCurrentPath(folderPath);
    setSelectedFiles(new Set()); // Clear selection when navigating
    loadFiles(folderPath, true); // Show skeletons when changing folders
  };

  // Go back to parent folder
  const goBack = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(parentPath);
    setSelectedFiles(new Set()); // Clear selection when navigating
    loadFiles(parentPath, true); // Show skeletons when changing folders
  };

  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (user) {
      loadFiles(currentPath, true); // Show skeletons on initial load
    }
  }, [user]);

  // No longer need global paste listener since we handle it in the paste area

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileUpload(droppedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Check if file is an image
  const isImageFile = (fileName) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'];
    const extension = fileName.toLowerCase().split('.').pop();
    return imageExtensions.includes(extension);
  };

  // Handle file click (preview images, download others)
  const handleFileClick = (file) => {
    if (isImageFile(file.name)) {
      setPreviewImage(file);
    } else {
      // For non-images, open download link
      window.open(file.downloadURL, '_blank');
    }
  };

  // Copy URL to clipboard
  const copyUrlToClipboard = async (url, fileName) => {
    try {
      await navigator.clipboard.writeText(url);
      setSuccess(`URL copied to clipboard for ${fileName}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      setError('Failed to copy URL to clipboard');
    }
  };

  // Copy JSX code to clipboard
  const copyJsxToClipboard = async (file) => {
    try {
      const altText = file.displayName || file.name;
      const jsxCode = `<img src="${file.downloadURL}" alt="${altText}" className="max-w-full h-auto" />`;
      await navigator.clipboard.writeText(jsxCode);
      setSuccess(`JSX code copied to clipboard for ${altText}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to copy JSX:', error);
      setError('Failed to copy JSX to clipboard');
    }
  };

  // Handle paste events to upload images (only from paste area)
  const handlePasteAreaPaste = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          // Generate a unique filename for pasted images
          const timestamp = Date.now();
          const extension = file.type.split('/')[1] || 'png';
          const filename = `pasted-image-${timestamp}.${extension}`;
          
          // Create a new File object with the custom name
          const renamedFile = new window.File([file], filename, { type: file.type });
          imageFiles.push(renamedFile);
        }
      }
    }

    if (imageFiles.length > 0) {
      setSuccess(`Pasting ${imageFiles.length} image(s)...`);
      handleFileUpload(imageFiles, true); // Mark as pasted images
    }
  };

  // Handle paste area specific events
  const handlePasteAreaClick = () => {
    setIsPasteAreaFocused(true);
  };

  const handlePasteAreaBlur = () => {
    setIsPasteAreaFocused(false);
  };

  const handlePasteAreaKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // The paste event will handle the actual pasting
      // This just ensures the key combination is recognized
    }
  };

  // Start editing a file name
  const startEditingFile = (file) => {
    setEditingFile(file.path);
    // Get the clean display name and split into name and extension
    const fullDisplayName = file.displayName || parseTimestampedFileName(file.name).originalName;
    const lastDotIndex = fullDisplayName.lastIndexOf('.');
    
    if (lastDotIndex > 0) {
      // Only edit the name part, keep extension separate
      const nameWithoutExtension = fullDisplayName.substring(0, lastDotIndex);
      setEditingName(nameWithoutExtension);
    } else {
      // No extension found, edit the whole name
      setEditingName(fullDisplayName);
    }
  };

  // Get the file extension for display
  const getFileExtension = (file) => {
    const fullDisplayName = file.displayName || parseTimestampedFileName(file.name).originalName;
    const lastDotIndex = fullDisplayName.lastIndexOf('.');
    return lastDotIndex > 0 ? fullDisplayName.substring(lastDotIndex) : '';
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingFile(null);
    setEditingName('');
  };

  // Save the edited file name
  const saveFileName = async (file) => {
    const currentDisplayName = file.displayName || parseTimestampedFileName(file.name).originalName;
    const extension = getFileExtension(file);
    const newFullName = extension ? `${editingName.trim()}${extension}` : editingName.trim();
    
    // Get the current name without extension for comparison
    const lastDotIndex = currentDisplayName.lastIndexOf('.');
    const currentNameWithoutExt = lastDotIndex > 0 ? currentDisplayName.substring(0, lastDotIndex) : currentDisplayName;
    
    if (!editingName.trim() || editingName.trim() === currentNameWithoutExt) {
      cancelEditing();
      return;
    }

    try {
      setError('');
      setSuccess('');

      // Get file reference using the full path
      const oldRef = ref(storage, file.fullPath);
      
      // First, verify the file exists by getting metadata
      const metadata = await getMetadata(oldRef);
      
      // Get the file blob
      const blob = await getBlob(oldRef);
      
      // Generate new timestamped filename with the new name (including extension)
      const timestampedFileName = generateTimestampedFileName(newFullName);
      
      // Create new path with edited name using the current path structure
      const currentPathInStorage = currentPath ? `${currentPath}/${timestampedFileName}` : timestampedFileName;
      const newRef = ref(storage, getUserStoragePath(currentPathInStorage));
      
      // Upload with new name
      await uploadBytes(newRef, blob, {
        contentType: metadata.contentType,
        customMetadata: metadata.customMetadata
      });
      
      // Create a fresh reference to the old file for deletion
      const deleteRef = ref(storage, file.fullPath);
      
      // Verify file still exists before deletion
      try {
        await getMetadata(deleteRef);
        await deleteObject(deleteRef);
      } catch (deleteError) {
        // If the old file doesn't exist, that's actually okay since we've already uploaded the new one
        if (deleteError.code !== 'storage/object-not-found') {
          throw deleteError; // Re-throw if it's a different error
        }
      }
      
      toast.success('File renamed successfully!', {
        description: `"${currentDisplayName}" → "${newFullName}"`
      });
      
      cancelEditing();
      loadFiles(); // Refresh without skeletons after rename
      
    } catch (error) {
      console.error('Error renaming file:', error);
      setError(`Failed to rename file: ${error.message}`);
      toast.error('Failed to rename file', {
        description: 'Please try again'
      });
    }
  };

  // Handle enter key in edit input
  const handleEditKeyDown = (e, file) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveFileName(file);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  // Generate a timestamped filename for storage
  const generateTimestampedFileName = (originalFileName) => {
    const timestamp = Date.now();
    const lastDotIndex = originalFileName.lastIndexOf('.');
    const name = lastDotIndex > 0 ? originalFileName.substring(0, lastDotIndex) : originalFileName;
    const extension = lastDotIndex > 0 ? originalFileName.substring(lastDotIndex) : '';
    
    return `${name}_${timestamp}${extension}`;
  };

  // Parse timestamped filename to get original name and timestamp
  const parseTimestampedFileName = (timestampedFileName) => {
    const lastDotIndex = timestampedFileName.lastIndexOf('.');
    const nameWithTimestamp = lastDotIndex > 0 ? timestampedFileName.substring(0, lastDotIndex) : timestampedFileName;
    const extension = lastDotIndex > 0 ? timestampedFileName.substring(lastDotIndex) : '';
    
    // Check if filename has timestamp pattern (ends with _[13-digit number])
    const timestampMatch = nameWithTimestamp.match(/^(.+)_(\d{13})$/);
    
    if (timestampMatch) {
      return {
        originalName: `${timestampMatch[1]}${extension}`,
        timestamp: parseInt(timestampMatch[2]),
        hasTimestamp: true
      };
    }
    
    // No timestamp found, return as-is
    return {
      originalName: timestampedFileName,
      timestamp: 0,
      hasTimestamp: false
    };
  };

  // Get display name with version number for UI
  const getDisplayFileName = (actualFileName, allFilesInDirectory) => {
    const parsed = parseTimestampedFileName(actualFileName);
    
    // If no timestamp, show original name
    if (!parsed.hasTimestamp) {
      return actualFileName;
    }
    
    // Find all files with the same base name
    const sameBaseNameFiles = allFilesInDirectory
      .map(fileName => ({ fileName, parsed: parseTimestampedFileName(fileName) }))
      .filter(item => item.parsed.originalName === parsed.originalName && item.parsed.hasTimestamp)
      .sort((a, b) => a.parsed.timestamp - b.parsed.timestamp); // Sort by timestamp (oldest first)
    
    // If only one file with this base name, show without version number
    if (sameBaseNameFiles.length === 1) {
      return parsed.originalName;
    }
    
    // Find the index of current file in the sorted list
    const currentIndex = sameBaseNameFiles.findIndex(item => item.fileName === actualFileName);
    const versionNumber = currentIndex + 1;
    
    // Add version number to display name
    const lastDotIndex = parsed.originalName.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const name = parsed.originalName.substring(0, lastDotIndex);
      const extension = parsed.originalName.substring(lastDotIndex);
      return `${name} (${versionNumber})${extension}`;
    } else {
      return `${parsed.originalName} (${versionNumber})`;
    }
  };

  // Get file icon and color based on extension
  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    
    const iconMap = {
      // Documents
      'pdf': { icon: FileText, color: 'text-red-500' },
      'doc': { icon: FileText, color: 'text-blue-600' },
      'docx': { icon: FileText, color: 'text-blue-600' },
      'txt': { icon: FileText, color: 'text-gray-600' },
      'rtf': { icon: FileText, color: 'text-gray-600' },
      'odt': { icon: FileText, color: 'text-blue-500' },
      
      // Spreadsheets
      'xlsx': { icon: FileSpreadsheet, color: 'text-green-600' },
      'xls': { icon: FileSpreadsheet, color: 'text-green-600' },
      'csv': { icon: FileSpreadsheet, color: 'text-green-500' },
      'ods': { icon: FileSpreadsheet, color: 'text-green-500' },
      
      // Presentations
      'ppt': { icon: Presentation, color: 'text-orange-600' },
      'pptx': { icon: Presentation, color: 'text-orange-600' },
      'odp': { icon: Presentation, color: 'text-orange-500' },
      
      // Images
      'jpg': { icon: FileImage, color: 'text-purple-500' },
      'jpeg': { icon: FileImage, color: 'text-purple-500' },
      'png': { icon: FileImage, color: 'text-purple-500' },
      'gif': { icon: FileImage, color: 'text-purple-500' },
      'bmp': { icon: FileImage, color: 'text-purple-500' },
      'svg': { icon: FileImage, color: 'text-purple-600' },
      'webp': { icon: FileImage, color: 'text-purple-500' },
      'ico': { icon: FileImage, color: 'text-purple-500' },
      
      // Videos
      'mp4': { icon: FileVideo, color: 'text-red-600' },
      'avi': { icon: FileVideo, color: 'text-red-600' },
      'mov': { icon: FileVideo, color: 'text-red-600' },
      'wmv': { icon: FileVideo, color: 'text-red-600' },
      'flv': { icon: FileVideo, color: 'text-red-600' },
      'webm': { icon: FileVideo, color: 'text-red-600' },
      'mkv': { icon: FileVideo, color: 'text-red-600' },
      
      // Audio
      'mp3': { icon: FileAudio, color: 'text-pink-600' },
      'wav': { icon: FileAudio, color: 'text-pink-600' },
      'flac': { icon: FileAudio, color: 'text-pink-600' },
      'aac': { icon: FileAudio, color: 'text-pink-600' },
      'ogg': { icon: FileAudio, color: 'text-pink-600' },
      'm4a': { icon: FileAudio, color: 'text-pink-600' },
      
      // Archives
      'zip': { icon: Archive, color: 'text-yellow-600' },
      'rar': { icon: Archive, color: 'text-yellow-600' },
      '7z': { icon: Archive, color: 'text-yellow-600' },
      'tar': { icon: Archive, color: 'text-yellow-600' },
      'gz': { icon: Archive, color: 'text-yellow-600' },
      
      // Code files
      'js': { icon: Code, color: 'text-yellow-500' },
      'jsx': { icon: Code, color: 'text-blue-400' },
      'ts': { icon: Code, color: 'text-blue-600' },
      'tsx': { icon: Code, color: 'text-blue-600' },
      'html': { icon: Code, color: 'text-orange-500' },
      'css': { icon: Code, color: 'text-blue-500' },
      'scss': { icon: Code, color: 'text-pink-500' },
      'json': { icon: Code, color: 'text-yellow-600' },
      'xml': { icon: Code, color: 'text-orange-400' },
      'php': { icon: Code, color: 'text-purple-600' },
      'py': { icon: Code, color: 'text-blue-500' },
      'java': { icon: Code, color: 'text-red-500' },
      'cpp': { icon: Code, color: 'text-blue-700' },
      'c': { icon: Code, color: 'text-blue-700' },
      'sql': { icon: Code, color: 'text-orange-600' },
      
      // Other common types
      'exe': { icon: FileX, color: 'text-red-500' },
      'dmg': { icon: FileX, color: 'text-gray-600' },
      'iso': { icon: FileX, color: 'text-gray-600' },
    };
    
    return iconMap[extension] || { icon: File, color: 'text-gray-500' };
  };

  // Move file to folder using getBlob (requires CORS configuration)
  const moveFileToFolder = async (file, targetFolder) => {
    try {
      setMovingFile(file.displayName || file.name);
      setError('');
      setSuccess('');
      
      // Get file reference (using actual storage filename, not display name)
      const oldRef = ref(storage, file.fullPath);
      
      // Get the file blob
      const blob = await getBlob(oldRef);
      
      // Get original metadata
      const metadata = await getMetadata(oldRef);
      
      // Generate new timestamped filename for the target location
      const originalFileName = parseTimestampedFileName(file.name).originalName;
      const timestampedFileName = generateTimestampedFileName(originalFileName);
      
      // Upload to new location with original metadata
      const targetPath = targetFolder.path || '';
      const newPath = targetPath ? `${targetPath}/${timestampedFileName}` : timestampedFileName;
      const newRef = ref(storage, getUserStoragePath(newPath));
      
      await uploadBytes(newRef, blob, {
        contentType: metadata.contentType,
        customMetadata: metadata.customMetadata
      });
      
      // Delete from old location
      await deleteObject(oldRef);
      
      setSuccess(`File moved to ${targetFolder.name} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      loadFiles(); // Refresh without skeletons after move
      
    } catch (error) {
      console.error('Error moving file:', error);
      
      // Check if it's a CORS error
      if (error.message.includes('CORS') || error.message.includes('Access-Control-Allow-Origin')) {
        setError(`CORS Error: Please configure CORS for Firebase Storage. Run: gsutil cors set cors.json gs://rtd-academy.appspot.com`);
      } else {
        setError(`Failed to move file: ${error.message}`);
      }
    } finally {
      setMovingFile(null);
    }
  };

  // Draggable File Component
  const DraggableFile = ({ file, children }) => {
    const [{ isDragging }, drag] = useDrag({
      type: 'file',
      item: { file },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const isCurrentlyMoving = movingFile === file.name;

    return (
      <div 
        ref={drag} 
        style={{ 
          opacity: isDragging ? 0.5 : (isCurrentlyMoving ? 0.7 : 1),
          cursor: isCurrentlyMoving ? 'wait' : 'grab'
        }}
        className={isCurrentlyMoving ? 'pointer-events-none' : ''}
      >
        {children}
      </div>
    );
  };

  // Droppable Folder Component
  const DroppableFolder = ({ folder, children }) => {
    const [{ isOver, canDrop }, drop] = useDrop({
      accept: 'file',
      drop: (item) => {
        if (!movingFile) {
          moveFileToFolder(item.file, folder);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    });

    return (
      <div 
        ref={drop} 
        className={`transition-colors duration-200 ${
          isOver && canDrop && !movingFile ? 'bg-blue-50 border-blue-300' : ''
        }`}
        style={{ 
          backgroundColor: isOver && canDrop && !movingFile ? '#dbeafe' : 'transparent',
          borderRadius: '8px',
          border: isOver && canDrop && !movingFile ? '2px dashed #3b82f6' : '2px dashed transparent'
        }}
      >
        {children}
      </div>
    );
  };

  if (!user) {
    return <div className="p-4">Please log in to access file storage.</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 max-w-7xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-6 w-6" />
              My File Storage
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/file-storage', '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Window
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Navigation breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <button 
              onClick={() => navigateToFolder('')}
              className="hover:text-foreground"
            >
              Home
            </button>
            {currentPath && currentPath.split('/').map((folder, index, array) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-4 w-4" />
                <button
                  onClick={() => navigateToFolder(array.slice(0, index + 1).join('/'))}
                  className="hover:text-foreground"
                >
                  {folder}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Input
              placeholder="Search files and folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
              icon={<Search className="h-4 w-4" />}
            />
            
            <Button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              variant="outline"
              size="sm"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              <span className="ml-2">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
            </Button>
            
            <Button
              onClick={() => {
                const folderName = prompt('Enter folder name:');
                if (folderName) createFolder(folderName);
              }}
              variant="outline"
              size="sm"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            
            <Button
              onClick={() => document.getElementById('file-upload').click()}
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            
            {currentPath && (
              <Button
                onClick={goBack}
                variant="outline"
                size="sm"
              >
                ← Back
              </Button>
            )}
          </div>

          {/* Bulk Actions */}
          {filteredFiles.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectedFiles.size === filteredFiles.length ? clearSelection : selectAllFiles}
                >
                  {selectedFiles.size === filteredFiles.length ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : selectedFiles.size > 0 ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {selectedFiles.size === filteredFiles.length ? 'Deselect All' : 'Select All'}
                  </span>
                </Button>
                
                {selectedFiles.size > 0 && (
                  <span className="text-sm text-muted-foreground">
                    {selectedFiles.size} of {filteredFiles.length} selected
                  </span>
                )}
              </div>
              
              {selectedFiles.size > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Delete ${selectedFiles.size} selected file(s)?`)) {
                        deleteSelectedFiles();
                      }
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : `Delete (${selectedFiles.size})`}
                  </Button>
                </div>
              )}
            </div>
          )}

          <input
            id="file-upload"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
          />

          {/* Alerts */}
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {movingFile && (
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800 flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                Moving "{movingFile}"...
              </AlertDescription>
            </Alert>
          )}

          {/* Paste Area for Images */}
          <div className="flex gap-4 mb-6">
            {/* File Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="flex-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors"
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">
                Drag and drop files here or click "Upload Files"
              </p>
            </div>

            {/* Image Paste Area */}
            <div
              tabIndex={0}
              onClick={handlePasteAreaClick}
              onBlur={handlePasteAreaBlur}
              onKeyDown={handlePasteAreaKeyDown}
              onPaste={handlePasteAreaPaste}
              className={`
                w-64 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200
                ${isPasteAreaFocused 
                  ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200' 
                  : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50/30'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <FileImage className={`h-8 w-8 mb-2 ${isPasteAreaFocused ? 'text-blue-600' : 'text-purple-500'}`} />
                <p className={`text-sm font-medium ${isPasteAreaFocused ? 'text-blue-700' : 'text-purple-600'}`}>
                  Paste Image Area
                </p>
                <p className={`text-xs mt-1 ${isPasteAreaFocused ? 'text-blue-600' : 'text-purple-500'}`}>
                  {isPasteAreaFocused ? 'Ready for Ctrl+V' : 'Click to focus, then Ctrl+V'}
                </p>
                {isPasteAreaFocused && (
                  <div className="mt-2 px-2 py-1 bg-blue-100 rounded text-xs text-blue-700 animate-pulse">
                    Area Active
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* File listing */}
          {isLoading ? (
            /* Loading Skeletons */
            viewMode === 'list' ? (
              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 border-b font-medium text-sm">
                  <div className="col-span-1">Select</div>
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-3">Modified</div>
                  <div className="col-span-2">Actions</div>
                </div>
                
                {/* Loading skeleton rows */}
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-3 border-b animate-pulse">
                    <div className="col-span-1">
                      <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="h-5 w-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="col-span-3">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Grid Loading Skeletons */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : viewMode === 'list' ? (
            <div className="border rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 border-b font-medium text-sm">
                <div className="col-span-1">Select</div>
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-3">Modified</div>
                <div className="col-span-2">Actions</div>
              </div>
              
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <DroppableFolder key={folder.path} folder={folder}>
                  <div 
                    className="grid grid-cols-12 gap-4 p-3 border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigateToFolder(folder.path)}
                  >
                    <div className="col-span-1">
                      {/* Empty cell for folders */}
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="relative">
                        <Folder className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        {folderCounts[folder.path] !== undefined && folderCounts[folder.path] > 0 && (
                          <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 font-medium">
                            {folderCounts[folder.path]}
                          </span>
                        )}
                      </div>
                      <span className="truncate font-medium">{folder.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">—</div>
                    <div className="col-span-3 text-sm text-muted-foreground">—</div>
                    <div className="col-span-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(folder);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </DroppableFolder>
              ))}

              {/* Files */}
              {filteredFiles.map((file) => {
                const { icon: FileIcon, color } = getFileIcon(file.name);
                return (
                  <DraggableFile key={file.path} file={file}>
                    <div className="grid grid-cols-12 gap-4 p-3 border-b hover:bg-muted/30 transition-colors">
                      <div className="col-span-1 flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFileSelection(file.path);
                          }}
                        >
                          {selectedFiles.has(file.path) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="col-span-4 flex items-center gap-3">
                        <FileIcon className={`h-5 w-5 ${color} flex-shrink-0`} />
                        {editingFile === file.path ? (
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex items-center gap-1 flex-1">
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => handleEditKeyDown(e, file)}
                                onBlur={() => saveFileName(file)}
                                className="h-6 text-sm flex-1"
                                autoFocus
                                placeholder="Enter file name"
                              />
                              {getFileExtension(file) && (
                                <span className="text-sm text-muted-foreground font-mono">
                                  {getFileExtension(file)}
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => saveFileName(file)}
                            >
                              <Save className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={cancelEditing}
                            >
                              <RotateCcw className="h-3 w-3 text-gray-600" />
                            </Button>
                          </div>
                        ) : (
                          <span 
                            className={`truncate ${isImageFile(file.name) ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
                            onClick={() => handleFileClick(file)}
                          >
                            {file.displayName || file.name}
                          </span>
                        )}
                      </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </div>
                    <div className="col-span-3 text-sm text-muted-foreground">
                      {formatDate(file.updated)}
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      {/* Copy URL button for all files */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Copy file URL"
                        onClick={() => copyUrlToClipboard(file.downloadURL, file.displayName || file.name)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {/* Quick copy button for images */}
                      {isImageFile(file.name) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Image copy options"
                            >
                              <FileImage className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => copyJsxToClipboard(file)}
                            >
                              <Code className="h-4 w-4 mr-2" />
                              Copy JSX
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => window.open(file.downloadURL, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyUrlToClipboard(file.downloadURL, file.displayName || file.name)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          {isImageFile(file.name) && (
                            <DropdownMenuItem
                              onClick={() => setPreviewImage(file)}
                            >
                              <FileImage className="h-4 w-4 mr-2" />
                              Preview Image
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => startEditingFile(file)}
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const folderName = prompt('Enter folder name to move to (or leave empty for root):');
                              if (folderName !== null) {
                                const targetFolder = { name: folderName || 'root', path: folderName };
                                moveFileToFolder(file, targetFolder);
                              }
                            }}
                          >
                            <Folder className="h-4 w-4 mr-2" />
                            Move to Folder
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteItem(file)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </DraggableFile>
                );
              })}
            </div>
          ) : (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <DroppableFolder key={folder.path} folder={folder}>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigateToFolder(folder.path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Folder className="h-8 w-8 text-blue-500" />
                          {folderCounts[folder.path] !== undefined && folderCounts[folder.path] > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full min-w-[18px] h-5 flex items-center justify-center px-1 font-medium">
                              {folderCounts[folder.path]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{folder.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {folderCounts[folder.path] !== undefined 
                              ? `${folderCounts[folder.path]} file${folderCounts[folder.path] !== 1 ? 's' : ''}`
                              : 'Folder'
                            }
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(folder);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </DroppableFolder>
              ))}

              {/* Files */}
              {filteredFiles.map((file) => {
                const { icon: FileIcon, color } = getFileIcon(file.displayName || file.name);
                return (
                  <DraggableFile key={file.path} file={file}>
                    <Card className="hover:shadow-md transition-shadow relative">
                      <div className="absolute top-2 left-2 z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 bg-white/80 hover:bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFileSelection(file.path);
                          }}
                        >
                          {selectedFiles.has(file.path) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <FileIcon className={`h-8 w-8 ${color}`} />
                          <div className="flex-1 min-w-0">
                            {editingFile === file.path ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1 flex-1">
                                    <Input
                                      value={editingName}
                                      onChange={(e) => setEditingName(e.target.value)}
                                      onKeyDown={(e) => handleEditKeyDown(e, file)}
                                      onBlur={() => saveFileName(file)}
                                      className="h-6 text-sm flex-1"
                                      autoFocus
                                      placeholder="Enter file name"
                                    />
                                    {getFileExtension(file) && (
                                      <span className="text-sm text-muted-foreground font-mono">
                                        {getFileExtension(file)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={() => saveFileName(file)}
                                  >
                                    <Save className="h-3 w-3 text-green-600 mr-1" />
                                    Save
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                    onClick={cancelEditing}
                                  >
                                    <RotateCcw className="h-3 w-3 text-gray-600 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p 
                                  className={`font-medium truncate ${isImageFile(file.name) ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
                                  onClick={() => handleFileClick(file)}
                                >
                                  {file.displayName || file.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </>
                            )}
                          </div>
                          
                          {/* Copy URL button for all files */}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Copy file URL"
                            onClick={() => copyUrlToClipboard(file.downloadURL, file.displayName || file.name)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>

                          {/* Quick copy button for images */}
                          {isImageFile(file.name) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Image copy options"
                                >
                                  <FileImage className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => copyJsxToClipboard(file)}
                                >
                                  <Code className="h-4 w-4 mr-2" />
                                  Copy JSX
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => window.open(file.downloadURL, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => copyUrlToClipboard(file.downloadURL, file.displayName || file.name)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Copy URL
                            </DropdownMenuItem>
                            {isImageFile(file.name) && (
                              <DropdownMenuItem
                                onClick={() => setPreviewImage(file)}
                              >
                                <FileImage className="h-4 w-4 mr-2" />
                                Preview Image
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => startEditingFile(file)}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const folderName = prompt('Enter folder name to move to (or leave empty for root):');
                                if (folderName !== null) {
                                  const targetFolder = { name: folderName || 'root', path: folderName };
                                  moveFileToFolder(file, targetFolder);
                                }
                              }}
                            >
                              <Folder className="h-4 w-4 mr-2" />
                              Move to Folder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteItem(file)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </DraggableFile>
                );
              })}
            </div>
          )}

          {!isLoading && filteredFiles.length === 0 && filteredFolders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No files or folders match your search.' : 'No files or folders yet. Upload some files to get started!'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{previewImage.displayName || previewImage.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                <img
                  src={previewImage.downloadURL}
                  alt={previewImage.displayName || previewImage.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <div 
                  className="hidden text-center text-gray-500 p-8"
                  style={{ display: 'none' }}
                >
                  Failed to load image
                </div>
              </div>

              {/* Image Info & Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">File Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {previewImage.displayName || previewImage.name}</p>
                    <p><span className="font-medium">Size:</span> {formatFileSize(previewImage.size)}</p>
                    <p><span className="font-medium">Modified:</span> {formatDate(previewImage.updated)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Actions</h4>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(previewImage.downloadURL, '_blank')}
                      className="justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyUrlToClipboard(previewImage.downloadURL, previewImage.displayName || previewImage.name)}
                      className="justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Copy Image URL
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const htmlCode = `<img src="${previewImage.downloadURL}" alt="${previewImage.displayName || previewImage.name}" />`;
                        copyUrlToClipboard(htmlCode, 'HTML code');
                      }}
                      className="justify-start"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Copy HTML Code
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const markdownCode = `![${previewImage.displayName || previewImage.name}](${previewImage.downloadURL})`;
                        copyUrlToClipboard(markdownCode, 'Markdown code');
                      }}
                      className="justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Copy Markdown Code
                    </Button>
                  </div>
                </div>
              </div>

              {/* URL Display */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Direct URL</h4>
                <div className="flex gap-2">
                  <Input
                    value={previewImage.downloadURL}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrlToClipboard(previewImage.downloadURL, previewImage.displayName || previewImage.name)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </DndProvider>
  );
}

export default TeacherFileStorage;