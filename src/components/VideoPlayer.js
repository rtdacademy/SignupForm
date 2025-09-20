import React, { useState } from 'react';
import ReactPlayer from 'react-player';

function VideoPlayer({ url, onReady }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleError = (err) => {
    console.error('Video playback error:', err);
    setError('Unable to load video. This may be due to CORS settings.');
    setLoading(false);
  };

  const handleReady = () => {
    setLoading(false);
    if (onReady) onReady();
  };

  // For Firebase Storage URLs, we need to ensure proper CORS headers
  // Try using a direct video element as fallback
  if (error) {
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
        <video
          className="absolute top-0 left-0 w-full h-full"
          controls
          src={url}
          onError={(e) => {
            console.error('Native video error:', e);
            setError('Video cannot be played. Please check the file format or try downloading it.');
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white">Loading video...</div>
        </div>
      )}
      <ReactPlayer
        url={url}
        controls={true}
        width="100%"
        height="100%"
        className="absolute top-0 left-0"
        playing={false}
        config={{
          file: {
            attributes: {
              crossOrigin: 'anonymous',
              controlsList: 'nodownload',
            },
            forceVideo: true,
          },
        }}
        onError={handleError}
        onReady={handleReady}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}

export default VideoPlayer;