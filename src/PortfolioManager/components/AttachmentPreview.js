import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import DevFileIndicator from './DevFileIndicator';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  File,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2
} from 'lucide-react';

const AttachmentPreview = ({
  attachments = [],
  currentIndex = 0,
  onIndexChange,
  onClose,
  fullscreenMode = false,
  showThumbnails = true,
  autoPlay = false,
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(fullscreenMode);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (onIndexChange) {
      onIndexChange(activeIndex);
    }
  }, [activeIndex, onIndexChange]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') navigatePrevious();
      if (e.key === 'ArrowRight') navigateNext();
      if (e.key === 'Escape' && onClose) onClose();
      if (e.key === ' ' && getCurrentAttachment()?.type?.includes('video')) {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, attachments.length]);

  // Touch handling for swipe gestures
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIndex < attachments.length - 1) {
      navigateNext();
    }
    if (isRightSwipe && activeIndex > 0) {
      navigatePrevious();
    }
  };

  const getCurrentAttachment = () => {
    return attachments[activeIndex];
  };

  const navigateNext = () => {
    if (activeIndex < attachments.length - 1) {
      setActiveIndex(activeIndex + 1);
      setImageZoom(1);
      setImageRotation(0);
      setIsLoading(true);
    }
  };

  const navigatePrevious = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
      setImageZoom(1);
      setImageRotation(0);
      setIsLoading(true);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleProgressBarClick = (e) => {
    if (videoRef.current && progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      videoRef.current.currentTime = percentage * videoRef.current.duration;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const zoomIn = () => {
    setImageZoom(Math.min(imageZoom + 0.25, 3));
  };

  const zoomOut = () => {
    setImageZoom(Math.max(imageZoom - 0.25, 0.5));
  };

  const rotateImage = () => {
    setImageRotation((imageRotation + 90) % 360);
  };

  const downloadAttachment = () => {
    const attachment = getCurrentAttachment();
    if (attachment?.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name || 'download';
      link.click();
    }
  };

  const getAttachmentIcon = (attachment) => {
    if (!attachment?.type) return File;
    if (attachment.type.includes('video')) return VideoIcon;
    if (attachment.type.includes('image')) return ImageIcon;
    if (attachment.type.includes('pdf')) return FileText;
    return File;
  };

  const renderAttachmentContent = () => {
    const attachment = getCurrentAttachment();
    if (!attachment) return null;

    // Video rendering
    if (attachment.type?.includes('video')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={attachment.url}
            className="w-full h-full object-contain"
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlayPause}
            playsInline
          />

          {/* Video controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            {/* Progress bar */}
            <div
              ref={progressBarRef}
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3"
              onClick={handleProgressBarClick}
            >
              <div
                className="h-full bg-white rounded-full relative"
                style={{ width: `${videoProgress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <span className="text-white text-sm">
                  {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(videoDuration)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Play button overlay when paused */}
          {!isPlaying && (
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
            >
              <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 text-gray-900 ml-1" />
              </div>
            </button>
          )}
        </div>
      );
    }

    // Image rendering
    if (attachment.type?.includes('image')) {
      return (
        <div className="relative w-full h-full flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`,
              display: isLoading ? 'none' : 'block'
            }}
            onLoad={handleImageLoad}
          />

          {/* Image controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={imageZoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">{Math.round(imageZoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={imageZoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={rotateImage}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    }

    // PDF/Document preview
    if (attachment.type?.includes('pdf')) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{attachment.name}</h3>
          <p className="text-sm text-gray-600 mb-4">PDF Document</p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.open(attachment.url, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              onClick={downloadAttachment}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </div>
      );
    }

    // Generic file preview
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-8">
        <File className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{attachment.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{attachment.type || 'File'}</p>
        <Button
          onClick={downloadAttachment}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    );
  };

  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No attachments to preview
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main content area */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 rounded-lg overflow-hidden">
        {renderAttachmentContent()}

        {/* Navigation arrows */}
        {attachments.length > 1 && (
          <>
            <button
              onClick={navigatePrevious}
              disabled={activeIndex === 0}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg transition-opacity ${
                activeIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={navigateNext}
              disabled={activeIndex === attachments.length - 1}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg transition-opacity ${
                activeIndex === attachments.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Top controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Badge className="bg-white/90 text-gray-900">
            {activeIndex + 1} / {attachments.length}
          </Badge>
          {getCurrentAttachment()?.url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadAttachment}
              className="bg-white/90 hover:bg-white"
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-white/90 hover:bg-white"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && attachments.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {attachments.map((attachment, index) => {
            const Icon = getAttachmentIcon(attachment);
            return (
              <button
                key={index}
                onClick={() => {
                  setActiveIndex(index);
                  setImageZoom(1);
                  setImageRotation(0);
                }}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === activeIndex
                    ? 'border-purple-500 shadow-lg scale-105'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {attachment.type?.includes('image') ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {attachment.type?.includes('video') && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
      <DevFileIndicator fileName="AttachmentPreview.js" />
    </div>
  );
};

export default AttachmentPreview;