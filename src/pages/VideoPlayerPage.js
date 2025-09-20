import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { database } from '../firebase';
import { ref, get, update, increment } from 'firebase/database';
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
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

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

      // Increment view count
      await update(videoRef, {
        views: increment(1),
        lastViewed: Date.now()
      });

    } catch (err) {
      console.error('Error loading video:', err);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-gray-400">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Video Not Available</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Title */}
        <h1 className="text-white text-2xl font-semibold mb-4 text-center">
          {video.title || 'RTD Academy'}
        </h1>

        {/* Video Player with Media Chrome Controls */}
        <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
          <MediaController
            style={{
              width: "100%",
              aspectRatio: "16/9",
              backgroundColor: "black",
            }}
          >
            <video
              slot="media"
              src={video.url}
              controls={false}
              preload="auto"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
            <MediaControlBar>
              <MediaPlayButton />
              <MediaSeekBackwardButton seekOffset={10} />
              <MediaSeekForwardButton seekOffset={10} />
              <MediaTimeRange />
              <MediaTimeDisplay showDuration />
              <MediaMuteButton />
              <MediaVolumeRange />
              <MediaPlaybackRateButton />
              <MediaFullscreenButton />
            </MediaControlBar>
          </MediaController>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerPage;