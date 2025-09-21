import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { database } from '../firebase';
import { ref, get } from 'firebase/database';
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from 'media-chrome/react';
import { AlertCircle, Loader2 } from 'lucide-react';

function VideoPlayerPage() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  // Parse embed parameters
  // If no theme parameter is provided, it's an embed - show clean player
  const hasThemeParam = searchParams.has('theme');
  const embedConfig = {
    theme: searchParams.get('theme') || (hasThemeParam ? 'dark' : 'none'),
    showTitle: hasThemeParam ? searchParams.get('title') !== '0' : false,
    customTitle: searchParams.get('customTitle') ? decodeURIComponent(searchParams.get('customTitle')) : null,
    minimalMode: searchParams.get('minimal') === '1',
  };

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  // Ensure video starts unmuted
  useEffect(() => {
    if (video && videoRef.current) {
      const videoElement = videoRef.current;

      // Force unmute function
      const forceUnmute = () => {
        if (videoElement.muted) {
          videoElement.muted = false;
        }
        if (videoElement.volume < 1.0) {
          videoElement.volume = 1.0;
        }
      };

      // Watch for any changes that might mute the video
      const observer = new MutationObserver((mutations) => {
        forceUnmute();
      });

      // Observe changes to the video element's attributes
      observer.observe(videoElement, {
        attributes: true,
        attributeFilter: ['muted']
      });

      // Initial unmute attempts
      forceUnmute();

      // Unmute when ready to play
      const handleCanPlay = () => forceUnmute();
      videoElement.addEventListener('canplay', handleCanPlay);

      // Also unmute after Media Chrome initializes (with delay)
      const timer = setTimeout(forceUnmute, 500);

      return () => {
        observer.disconnect();
        videoElement.removeEventListener('canplay', handleCanPlay);
        clearTimeout(timer);
      };
    }
  }, [video]);


  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get video metadata from database
      const videoRef = ref(database, `sharedVideos/${videoId}`);
      const snapshot = await get(videoRef);

      if (!snapshot.exists()) {
        setError('Video not found');
        return;
      }

      const videoData = snapshot.val();
      setVideo(videoData);

      // View tracking removed - no longer needed for public access

    } catch (err) {
      console.error('Error loading video:', err);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  // Check if this is an embed (no theme parameter)
  const isEmbed = !searchParams.has('theme');

  if (loading) {
    return (
      <div className={isEmbed ? "h-full flex items-center justify-center bg-black" : "min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={isEmbed ? "h-full flex items-center justify-center bg-black" : "min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center"}>
        <div className="text-center text-white">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Video Not Available</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${embedConfig.theme === 'none' ? 'h-full flex items-center justify-center' : 'min-h-screen flex items-center justify-center p-4'} ${
      embedConfig.theme === 'none' ? 'bg-transparent' :
      embedConfig.theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-black' :
      embedConfig.theme === 'light' ? 'bg-gradient-to-br from-gray-100 to-white' :
      embedConfig.theme === 'midnight' ? 'bg-gradient-to-br from-indigo-950 via-purple-950 to-black' :
      embedConfig.theme === 'sunset' ? 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600' :
      embedConfig.theme === 'ocean' ? 'bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800' :
      embedConfig.theme === 'forest' ? 'bg-gradient-to-br from-green-600 via-emerald-700 to-teal-900' :
      'bg-gradient-to-br from-gray-900 to-black'
    }`}>
      <div className={embedConfig.theme === 'none' ? 'w-full h-full' : 'w-full max-w-6xl'}>
        {/* Title */}
        {embedConfig.showTitle && (
          <h1 className={`text-2xl font-semibold mb-4 text-center ${
            embedConfig.theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            {embedConfig.customTitle || video.title || 'RTD Academy'}
          </h1>
        )}

        {/* Video Player with Media Chrome Controls */}
        <div className={embedConfig.theme === 'none' ? 'relative bg-black h-full' : 'relative bg-black rounded-lg overflow-hidden shadow-2xl'}>
          <MediaController
            noautoseektolive
            nomutedpref
            novolumepref
            nopipbutton
            style={{
              width: "100%",
              aspectRatio: embedConfig.theme === 'none' ? undefined : "16/9",
              height: embedConfig.theme === 'none' ? "100%" : undefined,
              backgroundColor: "black",
            }}
          >
            <video
              ref={videoRef}
              slot="media"
              src={video.url}
              controls={false}
              preload="metadata"
              autoPlay={false}
              disablePictureInPicture
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            <MediaControlBar className={embedConfig.minimalMode ? 'minimal' : ''}>
              <MediaPlayButton />
              {!embedConfig.minimalMode && (
                <>
                  <MediaSeekBackwardButton seekOffset={10} />
                  <MediaSeekForwardButton seekOffset={10} />
                </>
              )}
              <MediaTimeRange />
              <MediaTimeDisplay showDuration />
              <MediaMuteButton />
              {!embedConfig.minimalMode && <MediaVolumeRange />}
              {!embedConfig.minimalMode && <MediaPlaybackRateButton />}
              <MediaFullscreenButton />
            </MediaControlBar>
          </MediaController>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerPage;