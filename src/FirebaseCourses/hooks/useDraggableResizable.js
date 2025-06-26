import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for draggable and resizable functionality
 * @param {Object} options - Configuration options
 * @param {Object} options.defaultPosition - Default position {x, y}
 * @param {Object} options.defaultSize - Default size {width, height}
 * @param {Object} options.minSize - Minimum size {width, height}
 * @param {Object} options.maxSize - Maximum size {width, height}
 * @param {string} options.storageKey - localStorage key for persistence
 * @param {boolean} options.disabled - Disable drag/resize (for mobile)
 */
export const useDraggableResizable = ({
  defaultPosition = { x: 24, y: 24 },
  defaultSize = { width: 420, height: 640 },
  minSize = { width: 320, height: 400 },
  maxSize = { width: 800, height: 900 },
  storageKey = 'draggable-dialog',
  disabled = false
}) => {
  // Load saved position and size from localStorage
  const loadSavedState = useCallback(() => {
    if (disabled) return { position: defaultPosition, size: defaultSize };
    
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Validate saved values are within screen bounds
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        const position = {
          x: Math.max(0, Math.min(parsed.position?.x || defaultPosition.x, screenWidth - 100)),
          y: Math.max(0, Math.min(parsed.position?.y || defaultPosition.y, screenHeight - 100))
        };
        
        const size = {
          width: Math.max(minSize.width, Math.min(parsed.size?.width || defaultSize.width, maxSize.width)),
          height: Math.max(minSize.height, Math.min(parsed.size?.height || defaultSize.height, maxSize.height))
        };
        
        return { position, size };
      }
    } catch (error) {
      console.warn('Failed to load saved dialog state:', error);
    }
    
    return { position: defaultPosition, size: defaultSize };
  }, [defaultPosition, defaultSize, minSize, maxSize, storageKey, disabled]);

  const [position, setPosition] = useState(loadSavedState().position);
  const [size, setSize] = useState(loadSavedState().size);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);

  const dragRef = useRef({ startX: 0, startY: 0, startPos: { x: 0, y: 0 } });
  const resizeRef = useRef({ startX: 0, startY: 0, startSize: { width: 0, height: 0 }, startPos: { x: 0, y: 0 } });

  // Save state to localStorage
  const saveState = useCallback(() => {
    if (disabled) return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify({ position, size }));
    } catch (error) {
      console.warn('Failed to save dialog state:', error);
    }
  }, [position, size, storageKey, disabled]);

  // Save state when position or size changes
  useEffect(() => {
    const timeoutId = setTimeout(saveState, 500); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [saveState]);

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    if (disabled || isResizing) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      startPos: { ...position }
    };
  }, [disabled, isResizing, position]);

  // Handle resize start
  const handleResizeStart = useCallback((e, handle) => {
    if (disabled || isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    resizeRef.current = {
      startX: clientX,
      startY: clientY,
      startSize: { ...size },
      startPos: { ...position }
    };
  }, [disabled, isDragging, size, position]);

  // Handle mouse/touch move
  useEffect(() => {
    const handleMove = (e) => {
      const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
      const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - dragRef.current.startX;
        const deltaY = clientY - dragRef.current.startY;
        
        const newX = Math.max(0, Math.min(
          dragRef.current.startPos.x + deltaX,
          window.innerWidth - size.width
        ));
        const newY = Math.max(0, Math.min(
          dragRef.current.startPos.y + deltaY,
          window.innerHeight - size.height
        ));
        
        setPosition({ x: newX, y: newY });
      } else if (isResizing && resizeHandle) {
        const deltaX = clientX - resizeRef.current.startX;
        const deltaY = clientY - resizeRef.current.startY;
        
        let newSize = { ...resizeRef.current.startSize };
        let newPos = { ...resizeRef.current.startPos };
        
        switch (resizeHandle) {
          case 'se': // Southeast
            newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeRef.current.startSize.width + deltaX));
            newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeRef.current.startSize.height + deltaY));
            break;
          case 'sw': // Southwest
            newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeRef.current.startSize.width - deltaX));
            newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeRef.current.startSize.height + deltaY));
            newPos.x = resizeRef.current.startPos.x + (resizeRef.current.startSize.width - newSize.width);
            break;
          case 'ne': // Northeast
            newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeRef.current.startSize.width + deltaX));
            newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeRef.current.startSize.height - deltaY));
            newPos.y = resizeRef.current.startPos.y + (resizeRef.current.startSize.height - newSize.height);
            break;
          case 'nw': // Northwest
            newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeRef.current.startSize.width - deltaX));
            newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeRef.current.startSize.height - deltaY));
            newPos.x = resizeRef.current.startPos.x + (resizeRef.current.startSize.width - newSize.width);
            newPos.y = resizeRef.current.startPos.y + (resizeRef.current.startSize.height - newSize.height);
            break;
          case 'e': // East
            newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeRef.current.startSize.width + deltaX));
            break;
          case 'w': // West
            newSize.width = Math.max(minSize.width, Math.min(maxSize.width, resizeRef.current.startSize.width - deltaX));
            newPos.x = resizeRef.current.startPos.x + (resizeRef.current.startSize.width - newSize.width);
            break;
          case 'n': // North
            newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeRef.current.startSize.height - deltaY));
            newPos.y = resizeRef.current.startPos.y + (resizeRef.current.startSize.height - newSize.height);
            break;
          case 's': // South
            newSize.height = Math.max(minSize.height, Math.min(maxSize.height, resizeRef.current.startSize.height + deltaY));
            break;
        }
        
        // Ensure dialog doesn't go off screen
        newPos.x = Math.max(0, Math.min(newPos.x, window.innerWidth - newSize.width));
        newPos.y = Math.max(0, Math.min(newPos.y, window.innerHeight - newSize.height));
        
        setSize(newSize);
        setPosition(newPos);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, isResizing, resizeHandle, size, minSize, maxSize]);

  // Reset to default position and size
  const resetToDefault = useCallback(() => {
    setPosition(defaultPosition);
    setSize(defaultSize);
  }, [defaultPosition, defaultSize]);

  return {
    position,
    size,
    isDragging,
    isResizing,
    handleDragStart,
    handleResizeStart,
    resetToDefault,
    setPosition,
    setSize
  };
};