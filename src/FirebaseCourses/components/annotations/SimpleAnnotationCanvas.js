import React, { useState } from 'react';

/**
 * Simple Annotation Canvas - Basic implementation without react-konva
 * This is a fallback implementation to test the integration without complex dependencies
 */
const SimpleAnnotationCanvas = ({
  course,
  questionId,
  isStaffView = false,
  width = 800,
  height = 600,
  className = ''
}) => {
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);

  // Simple drawing with SVG
  const handleMouseDown = (e) => {
    if (!isStaffView) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !isStaffView) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCurrentPath(prev => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    setAnnotations(prev => [...prev, { 
      id: Date.now(), 
      path: currentPath, 
      color: '#ff0000' 
    }]);
    setCurrentPath([]);
  };

  const pathToString = (path) => {
    if (path.length === 0) return '';
    return `M ${path[0].x} ${path[0].y} ` + 
           path.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div className={`annotation-canvas ${className}`}>
      {/* Simple toolbar for staff */}
      {isStaffView && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Simple Drawing Tools:</span>
            <button
              onClick={() => setAnnotations([])}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Clear All
            </button>
            <span className="text-xs text-gray-500">
              Click and drag to draw • This is a basic version
            </span>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white">
        <svg
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isStaffView ? 'crosshair' : 'default' }}
          className="block"
        >
          {/* Render saved annotations */}
          {annotations.map((annotation) => (
            <path
              key={annotation.id}
              d={pathToString(annotation.path)}
              stroke={annotation.color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          
          {/* Render current drawing path */}
          {isDrawing && currentPath.length > 0 && (
            <path
              d={pathToString(currentPath)}
              stroke="#ff0000"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Status indicators */}
        {!isStaffView && annotations.length > 0 && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            Teacher Annotations ({annotations.length})
          </div>
        )}

        {!isStaffView && annotations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            No annotations yet
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 text-xs text-gray-500">
        {isStaffView ? (
          <>Basic annotation tool • Click and drag to draw</>
        ) : (
          <>Viewing teacher annotations • {annotations.length} annotation(s)</>
        )}
      </div>
    </div>
  );
};

export default SimpleAnnotationCanvas;