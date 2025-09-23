import React from 'react';

/**
 * DevFileIndicator - Shows file name in development mode only
 * This component helps developers quickly identify which file contains the current component
 */
const DevFileIndicator = ({ fileName }) => {
  // Only render in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '2px',
        right: '2px',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        color: '#6366f1',
        padding: '2px 6px',
        fontSize: '9px',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
        borderRadius: '3px',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        zIndex: 1, // Very low z-index, just above the content
        pointerEvents: 'none', // Don't interfere with interactions
        userSelect: 'none',
        opacity: 0.7,
        fontWeight: 500,
        letterSpacing: '0.025em',
      }}
      title={fileName}
    >
      {fileName}
    </div>
  );
};

export default DevFileIndicator;