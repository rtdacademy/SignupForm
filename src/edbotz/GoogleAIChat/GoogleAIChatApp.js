import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Loader, 
  Bot, 
  Info, 
  RotateCcw, 
  Image as ImageIcon, 
  X, 
  Youtube, 
  Link,
  FileIcon,
  FileText,
  File,
  Upload
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { cn } from "../../lib/utils";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { AI_MODEL_MAPPING } from '../utils/settings';
import { Input } from '../../components/ui/input';
import { 
  ImageScanningAnimation, 
  DocumentReadingAnimation, 
  VideoWatchingAnimation, 
  AIThinkingAnimation,
  getProcessingAnimation
} from './ProcessingAnimations';

// Helper function to extract YouTube video ID
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Regular expression to match YouTube video IDs from various URL formats
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[1].length === 11) ? match[1] : null;
};

// Get file icon based on mime type or extension
const getFileIcon = (file) => {
  if (!file) return <FileIcon />;
  
  const fileName = file.name || '';
  const mimeType = file.type || '';
  
  // Check by mime type first
  if (mimeType.startsWith('image/')) return <ImageIcon />;
  if (mimeType.startsWith('video/')) return <Youtube />;
  if (mimeType.startsWith('audio/')) return <FileIcon />;
  if (mimeType.includes('pdf')) return <FileText />;
  if (mimeType.includes('word') || mimeType.includes('document')) return <FileText />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return <FileText />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <FileText />;
  
  // Check by extension as fallback
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(extension)) return <FileText />;
  if (['xls', 'xlsx', 'csv', 'ods'].includes(extension)) return <FileText />;
  if (['ppt', 'pptx', 'odp'].includes(extension)) return <FileText />;
  
  // Default file icon
  return <File />;
};

// Get friendly file size
const getFormattedSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return 'Unknown size';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// YouTube embed component
const YouTubeEmbed = ({ videoId, className }) => {
  if (!videoId) return null;
  
  return (
    <div className={cn("relative w-full pt-[56.25%]", className)}>
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

// Sample message component
// Helper function to enhance links in HTML content
const enhanceLinks = (htmlContent) => {
  if (!htmlContent) return '';
  const div = document.createElement('div');
  div.innerHTML = htmlContent;
  
  // Process all links
  const links = div.getElementsByTagName('a');
  Array.from(links).forEach(link => {
    // Add necessary attributes for security and styling
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.classList.add('text-blue-600');
    link.style.textDecoration = 'underline';
    link.style.fontWeight = 'bold';
  });
  
  // Process all images
  const images = div.getElementsByTagName('img');
  Array.from(images).forEach(img => {
    // Add responsive classes
    img.classList.add('max-w-full', 'rounded-lg', 'my-2');
    img.style.maxHeight = '300px';
    img.style.objectFit = 'contain';
  });
  
  // Process all iframes (YouTube embeds)
  const iframes = div.getElementsByTagName('iframe');
  Array.from(iframes).forEach(iframe => {
    // Add responsive wrapper if not already wrapped
    if (iframe.parentElement && !iframe.parentElement.classList.contains('youtube-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('youtube-wrapper', 'relative', 'w-full', 'pt-[56.25%]', 'my-4');
      iframe.classList.add('absolute', 'top-0', 'left-0', 'w-full', 'h-full', 'rounded-lg');
      
      // Replace the iframe with the wrapped iframe
      iframe.parentNode.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
    }
  });
  
  return div.innerHTML;
};

const MessageBubble = ({ 
  message, 
  isStreaming = false, 
  isProcessing = false,
  processingMedia = null,
  userName = 'You', 
  assistantName = 'Google AI Assistant'
}) => {
  const isUser = message.sender === 'user';
  
  // Helper function to render media content
  const renderMedia = (media) => {
    if (!media || !media.length) return null;
    
    return (
      <div className="flex flex-col gap-2 mb-2 w-full">
        {media.map((item, index) => (
          <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200">
            {item.type === 'image' && (
              <img 
                src={item.url} 
                alt="Uploaded image" 
                className="max-w-full max-h-[300px] object-contain"
              />
            )}
            {item.type === 'youtube' && (
              <div className="w-full max-w-xl">
                <YouTubeEmbed 
                  videoId={extractYouTubeVideoId(item.url)} 
                  className="mb-2"
                />
                <div className="text-xs text-gray-500 mb-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    <Youtube className="w-3 h-3" />
                    {item.url}
                  </a>
                </div>
              </div>
            )}
            {item.type === 'document' && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                {getFileIcon(item)}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-gray-500">{getFormattedSize(item.size)}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // Render processing animations when the AI is analyzing
  const renderProcessingAnimations = () => {
    if (!isProcessing || !processingMedia) return null;
    
    if (Array.isArray(processingMedia)) {
      // If processing multiple media items, group them by type
      const mediaTypes = {};
      processingMedia.forEach(item => {
        mediaTypes[item.type] = true;
      });
      
      return (
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {mediaTypes.image && <ImageScanningAnimation />}
          {mediaTypes.document && <DocumentReadingAnimation />}
          {(mediaTypes.youtube || mediaTypes.video) && <VideoWatchingAnimation />}
        </div>
      );
    } else {
      // If processing a single media item
      return getProcessingAnimation(processingMedia);
    }
  };
  
  // Render the message content
  const renderMessageContent = () => {
    // If the message is flagged as HTML content (from Quill editor)
    if (message.isHtml || (message.text && message.text.includes('<') && message.text.includes('>'))) {
      return (
        <div 
          className={cn(
            "prose prose-sm max-w-none chat-content-html",
            isUser && "text-white [&_*]:text-white [&_a]:text-white"
          )}
          dangerouslySetInnerHTML={{ __html: enhanceLinks(message.text) }}
        />
      );
    }
    
    // Otherwise, render as plain text
    return (
      <div className={cn(
        "prose prose-sm max-w-none",
        isUser && "text-white [&_*]:text-white"
      )}>
        {message.text}
        {isStreaming && !isProcessing && (
          <span className="inline-block w-1.5 h-4 ml-0.5 bg-indigo-500 animate-pulse rounded"></span>
        )}
      </div>
    );
  };
  
  return (
    <div className={cn(
      "group flex gap-3 relative transition-all duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0",
        isUser ? "bg-blue-500" : "bg-gradient-to-br from-purple-600 to-indigo-600"
      )}>
        {isUser ? <Send className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
          {isUser ? userName : assistantName}
          {isStreaming && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
              {isProcessing ? "Thinking" : "Generating"}
            </span>
          )}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isUser 
            ? "bg-blue-500 text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none",
          isStreaming && "border border-indigo-200"
        )}>
          {/* Render media items if present */}
          {message.media && renderMedia(message.media)}
          
          {/* Show processing animations for AI responses */}
          {!isUser && isProcessing && renderProcessingAnimations()}
          
          {/* Render message content */}
          {renderMessageContent()}
        </div>
        
        <div className="text-xs text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

// Local storage keys
const STORAGE_KEY_SESSION_ID = 'google_ai_chat_session_id';
const STORAGE_KEY_MESSAGES = 'google_ai_chat_messages';

// Main component
const GoogleAIChatApp = ({ 
  firebaseApp = getApp()
}) => {
  // Load saved session ID from localStorage if available
  const getSavedSessionId = () => {
    try {
      return localStorage.getItem(STORAGE_KEY_SESSION_ID);
    } catch (e) {
      console.warn("Could not access localStorage:", e);
      return null;
    }
  };
  
  // Load saved messages from localStorage if available
  const getSavedMessages = () => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (e) {
      console.warn("Could not load saved messages:", e);
      return [];
    }
  };

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState(getSavedMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMedia, setProcessingMedia] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [youtubeURL, setYoutubeURL] = useState('');
  const [addingYouTube, setAddingYouTube] = useState(false);
  const [youtubeURLs, setYoutubeURLs] = useState([]);
  const [sessionId, setSessionId] = useState(getSavedSessionId); // Load saved session ID
  const scrollAreaRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Initialize Firebase Functions
  const functions = getFunctions(firebaseApp, 'us-central1');
  const sendChatMessage = httpsCallable(functions, 'sendChatMessage');
  
  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn("Could not save messages to localStorage:", e);
    }
  }, [messages]);
  
  // Save session ID to localStorage
  useEffect(() => {
    if (sessionId) {
      try {
        localStorage.setItem(STORAGE_KEY_SESSION_ID, sessionId);
        console.log(`Session ID saved to localStorage: ${sessionId}`);
      } catch (e) {
        console.warn("Could not save session ID to localStorage:", e);
      }
    }
  }, [sessionId]);


  // Reset chat
  const handleReset = useCallback(() => {
    setMessages([]);
    setError(null);
    setUploadedFiles([]);
    setYoutubeURLs([]);
    setYoutubeURL('');
    setAddingYouTube(false);
    setIsProcessing(false);
    setProcessingMedia(null);
    setSessionId(null); // Clear the session ID to start a fresh conversation
    
    // Also clear localStorage
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION_ID);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
  }, []);
  
  // Get file type based on mime type or extension
  const getFileType = (file) => {
    if (!file) return 'file';
    
    const mimeType = file.type || '';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    
    // Document types
    if (mimeType.includes('pdf') || 
        mimeType.includes('word') || 
        mimeType.includes('document') ||
        mimeType.includes('spreadsheet') || 
        mimeType.includes('excel') || 
        mimeType.includes('csv') ||
        mimeType.includes('presentation') || 
        mimeType.includes('powerpoint')) {
      return 'document';
    }
    
    // Check by extension as fallback
    const extension = file.name?.split('.').pop()?.toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ods', 'ppt', 'pptx', 'odp'].includes(extension)) {
      return 'document';
    }
    
    return 'file';
  };
  
  // Handle file selection for uploads
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Process each file - convert to data URL if it's an image, handle differently for documents
    files.forEach(file => {
      // Size validation (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File '${file.name}' exceeds 10MB size limit.`);
        return;
      }
      
      const fileType = getFileType(file);
      
      // Use FileReader for images and small text files
      if (fileType === 'image' || (fileType === 'document' && file.size < 1 * 1024 * 1024 && file.type.includes('text'))) {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          setUploadedFiles(prev => [...prev, {
            file,
            url: dataUrl,
            type: fileType,
            name: file.name,
            size: file.size,
            mimeType: file.type
          }]);
        };
        
        reader.onerror = () => {
          setError(`Failed to read file '${file.name}'.`);
        };
        
        reader.readAsDataURL(file);
      } else {
        // For other document types, we'll just keep track of metadata and send the file directly
        setUploadedFiles(prev => [...prev, {
          file,
          // For documents, we'll create a data URL when sending to the backend
          url: null,  
          type: fileType,
          name: file.name,
          size: file.size,
          mimeType: file.type
        }]);
      }
    });
    
    // Clear the file input
    e.target.value = '';
  };
  
  // Handle adding YouTube URL
  const handleAddYouTubeURL = () => {
    if (!youtubeURL.trim()) return;
    
    // Validate URL is a YouTube URL
    const videoId = extractYouTubeVideoId(youtubeURL);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      return;
    }
    
    // Add the YouTube URL to the list
    setYoutubeURLs(prev => [...prev, {
      url: youtubeURL,
      type: 'youtube'
    }]);
    
    // Clear the input
    setYoutubeURL('');
    setAddingYouTube(false);
  };
  
  // Prepare files for sending to the backend
  const prepareFilesForSending = async () => {
    const preparedFiles = await Promise.all(
      uploadedFiles.map(async fileItem => {
        // If URL is already set (like for images), just return as is
        if (fileItem.url) {
          return fileItem;
        }
        
        // For documents without URLs, create a data URL
        try {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                ...fileItem,
                url: reader.result
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(fileItem.file);
          });
        } catch (err) {
          console.error(`Error converting file ${fileItem.name} to data URL:`, err);
          return fileItem; // Return original if conversion fails
        }
      })
    );
    
    return preparedFiles;
  };
  
  // Remove a file
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Remove a YouTube URL
  const removeYouTubeURL = (index) => {
    setYoutubeURLs(prev => prev.filter((_, i) => i !== index));
  };
  
  // Trigger file input click
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  
  // Toggle YouTube URL input
  const toggleYouTubeInput = () => {
    setAddingYouTube(prev => !prev);
  };
  
  // Simulate the AI's analysis of media with realistic timing
  const simulateMediaAnalysis = async (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) {
      return;
    }
    
    // Set processing state and keep track of which media is being processed
    setIsProcessing(true);
    setProcessingMedia(mediaItems);
    
    // Calculate a realistic wait time based on file types and sizes
    let maxWaitTime = 0;
    
    mediaItems.forEach(item => {
      let waitTime = 0;
      
      if (item.type === 'youtube') {
        // Videos take longer to process
        waitTime = 3000 + (Math.random() * 2000);
      } else if (item.type === 'image') {
        // Images are usually faster
        waitTime = 2000 + (Math.random() * 1000);
      } else if (item.type === 'document') {
        // Documents take time based on size
        const sizeInMB = (item.size || 0) / (1024 * 1024);
        waitTime = 2000 + (sizeInMB * 500) + (Math.random() * 1500);
      }
      
      maxWaitTime = Math.max(maxWaitTime, waitTime);
    });
    
    // Ensure a minimum wait time for the animation to be visible
    maxWaitTime = Math.max(maxWaitTime, 2000);
    
    // Wait for the calculated time - we don't need to actually wait here anymore
    // as we'll keep the animations going until we get a response from the server
    await new Promise(resolve => setTimeout(resolve, 500)); // Short delay for visual effect
    
    // We're not going to disable the processing state here anymore
    // Instead we'll keep showing the animations and maintain the processing state
    // setIsProcessing(false);
    // setProcessingMedia(null);
  };
  
  // Send message to Google AI
  const handleSendMessage = async () => {
    if (!inputMessage.trim() && uploadedFiles.length === 0 && youtubeURLs.length === 0) return;
    setError(null);
    
    // Prepare all files (convert to data URLs if needed)
    const preparedFiles = await prepareFilesForSending();
    
    // Combine prepared files and YouTube URLs
    const allMedia = [...preparedFiles, ...youtubeURLs];
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: Date.now(),
      media: allMedia.length > 0 ? allMedia : undefined
    };
    
    // Create a copy of the input message before clearing it
    const messageToSend = inputMessage;
    const mediaItemsToSend = [...allMedia];
    
    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setUploadedFiles([]);
    setYoutubeURLs([]);
    setYoutubeURL('');
    setAddingYouTube(false);
    setIsLoading(true);
    
    // Create empty AI message placeholder for streaming
    const aiMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: Date.now() + 1,
    }]);

    // Set streaming state
    setIsStreaming(true);
    
    try {
      // Start showing media analysis animations if there are media items
      if (mediaItemsToSend.length > 0) {
        // Show media processing animations and keep them showing
        await simulateMediaAnalysis(mediaItemsToSend);
      } else {
        // If there's no media, just proceed without showing animations
        setIsProcessing(false);
        setProcessingMedia(null);
      }
      
      // Call the Cloud Function with message and history
      const history = messages.slice(-10); // Keep last 10 messages for context
      
      // Log what we're sending to help debug
      console.log("Sending to AI:", {
        message: messageToSend,
        history: history,
        model: AI_MODEL_MAPPING.livechat.name,
        streaming: true, // Enable streaming mode
        mediaItems: mediaItemsToSend.map(item => ({
          url: item.url,
          type: item.type,
          name: item.name,
          mimeType: item.mimeType
        }))
      });
      
      // Format the data that we send to match what the Cloud Function expects
      // Ensure history is always an array even if it's undefined
      const safeHistory = Array.isArray(history) ? history : [];
      
      const result = await sendChatMessage({
        message: messageToSend, // The actual text message to send
        history: safeHistory.map(msg => ({
          // Convert our internal message format to what the function expects
          sender: msg.sender, // 'user' or 'ai'
          text: msg.text
        })),
        model: AI_MODEL_MAPPING.livechat.name, // Using the live chat model from settings
        systemInstruction: "You are a helpful AI assistant that provides clear, accurate information.",
        streaming: true, // Enable streaming mode
        mediaItems: mediaItemsToSend.map(item => ({
          url: item.url,
          type: item.type,
          name: item.name,
          mimeType: item.mimeType
        })),
        sessionId: sessionId // Pass the session ID if we have one
      });
      
      // Now that we have a response, stop the processing animations
      setIsProcessing(false);
      setProcessingMedia(null);
      
      // Update the AI message with the response
      const aiResponse = result.data.text;
      
      // Save the session ID if provided by the server
      if (result.data.sessionId) {
        setSessionId(result.data.sessionId);
        console.log(`Chat session established with ID: ${result.data.sessionId}`);
      }
      
      // Simulate progressive typing effect
      if (result.data.streaming) {
        let displayedText = '';
        const fullText = aiResponse;
        const words = fullText.split(' ');
        
        for (let i = 0; i < words.length; i++) {
          displayedText += words[i] + ' ';
          
          // Update message with current text
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: displayedText } : msg
            )
          );
          
          // Small delay to simulate typing
          // This creates a visual effect of streaming
          if (i < words.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
      } else {
        // Regular non-streaming update
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
          )
        );
      }
      
    } catch (err) {
      console.error('Error sending message:', err);
      const errorDetails = err.message || 'Failed to send message. Please try again.';
      setError(errorDetails);
      
      // Show detailed error information in the UI for debugging
      const errorMessage = err.code === 'functions/invalid-argument' 
        ? `API Error: ${errorDetails}` 
        : `I'm sorry, I encountered an error: ${errorDetails}`;
        
      // Update the AI message with the error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { 
            ...msg, 
            text: errorMessage
          } : msg
        )
      );
      
      // Always ensure processing animations are stopped when there's an error
      setIsProcessing(false);
      setProcessingMedia(null);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      scrollToBottom();
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !addingYouTube) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Component to display uploaded files
  const FilePreview = () => {
    if (uploadedFiles.length === 0) return null;
    
    return (
      <div className="border-t pt-3 mb-2">
        <div className="text-sm font-medium text-gray-500 mb-2">Uploaded Files</div>
        <div className="flex flex-wrap gap-2">
          {uploadedFiles.map((fileItem, index) => {
            // Different preview based on file type
            if (fileItem.type === 'image') {
              return (
                <div key={index} className="relative group">
                  <img 
                    src={fileItem.url} 
                    alt={`Uploaded ${fileItem.name || index}`} 
                    className="h-20 w-auto rounded-md border border-gray-200 object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100"
                    title="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            } else {
              // Document or other file type
              return (
                <div key={index} className="relative flex items-center gap-2 pl-2 pr-7 py-2 bg-gray-50 rounded-md border border-gray-200">
                  {getFileIcon(fileItem)}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate max-w-[150px]">{fileItem.name}</span>
                    <span className="text-xs text-gray-500">{getFormattedSize(fileItem.size)}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                    title="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };
  
  // Component to display YouTube URLs
  const YouTubePreview = () => {
    if (youtubeURLs.length === 0) return null;
    
    return (
      <div className="border-t pt-3 mb-2">
        <div className="text-sm font-medium text-gray-500 mb-2">YouTube Videos</div>
        <div className="flex flex-col gap-2">
          {youtubeURLs.map((item, index) => {
            const videoId = extractYouTubeVideoId(item.url);
            const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
            
            return (
              <div key={index} className="relative flex items-center gap-2 bg-gray-50 rounded-md p-2 border border-gray-200">
                {thumbnailUrl && (
                  <img 
                    src={thumbnailUrl} 
                    alt="YouTube thumbnail" 
                    className="h-12 w-auto rounded-md object-cover"
                  />
                )}
                <div className="flex-1 truncate text-sm text-gray-700">
                  {item.url}
                </div>
                <button
                  onClick={() => removeYouTubeURL(index)}
                  className="shrink-0 text-red-500 hover:text-red-700"
                  title="Remove YouTube URL"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // YouTube URL input
  const YouTubeURLInput = () => {
    if (!addingYouTube) return null;
    
    return (
      <div className="border-t pt-3 mb-2">
        <div className="text-sm font-medium text-gray-500 mb-2">Add YouTube Video</div>
        <div className="flex gap-2">
          <Input
            value={youtubeURL}
            onChange={(e) => setYoutubeURL(e.target.value)}
            placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddYouTubeURL();
              }
            }}
          />
          <Button 
            onClick={handleAddYouTubeURL}
            disabled={!youtubeURL.trim()}
            className="shrink-0 bg-red-600 hover:bg-red-700"
          >
            Add
          </Button>
          <Button 
            onClick={() => setAddingYouTube(false)}
            variant="outline"
            className="shrink-0"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full relative">
      <Card className="flex flex-col h-full border-0 rounded-none bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="flex-shrink-0 border-b bg-gradient-to-br from-purple-50 to-indigo-50 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-purple-900">
                Google AI Chat
              </CardTitle>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isLoading || messages.length === 0}
                className="hover:bg-purple-100 text-purple-600"
                title="Reset Chat"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <div className="flex-1 min-h-0">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-full"
          >
            <div className="p-4 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 my-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Welcome to Edbotz</p>
                  <p className="text-sm mt-2">
                    {isInitializing ? 'Loading your assistant...' : 'Ask me anything and I\'ll help you find the answer.'}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming && message === messages[messages.length - 1] && message.sender === 'ai'}
                    isProcessing={isProcessing && message === messages[messages.length - 1] && message.sender === 'ai'}
                    processingMedia={processingMedia}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <CardFooter className="flex-shrink-0 border-t bg-white p-4 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />
          
          {/* File and image preview area */}
          <FilePreview />
          
          {/* YouTube URL preview */}
          <YouTubePreview />
          
          {/* YouTube URL input */}
          <YouTubeURLInput />
          
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={openFileDialog}
              disabled={isLoading || isInitializing}
              className="shrink-0 self-end border-gray-300"
              title="Upload File or Image"
            >
              <Upload className="w-5 h-5 text-gray-600" />
            </Button>
            
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={toggleYouTubeInput}
              disabled={isLoading || isInitializing || addingYouTube}
              className="shrink-0 self-end border-gray-300"
              title="Add YouTube Video"
            >
              <Youtube className="w-5 h-5 text-red-600" />
            </Button>
            
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isInitializing ? "Initializing..." : "Type your message... (Press Enter to send)"}
              className="resize-none min-h-[80px]"
              disabled={isLoading || isInitializing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(uploadedFiles.length === 0 && youtubeURLs.length === 0 && !inputMessage.trim()) || isLoading || isInitializing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shrink-0 self-end"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {isProcessing ? 'Processing...' : 'Generating...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default GoogleAIChatApp;