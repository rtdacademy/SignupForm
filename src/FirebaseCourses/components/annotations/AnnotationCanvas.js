import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text, Arrow, Transformer } from 'react-konva';
import { getDatabase, ref, set, onValue, off } from 'firebase/database';
import { useAuth } from '../../../context/AuthContext';
import AnnotationToolbar from './AnnotationToolbar';

/**
 * Annotation Canvas Component
 * 
 * Provides a drawing surface using react-konva for teacher annotations.
 * Features:
 * - Free drawing with pen tool
 * - Text annotations
 * - Shape tools (rectangle, circle, arrow)
 * - Eraser tool
 * - Undo/Redo functionality
 * - Save/Load to Firebase
 * - Read-only mode for students
 */
const AnnotationCanvas = ({
  course,
  questionId,
  isStaffView = false,
  width = 800,
  height = 600,
  className = ''
}) => {
  // Auth context
  const { user } = useAuth();
  const database = getDatabase();

  // Tool state
  const [activeTool, setActiveTool] = useState('pen');
  const [activeColor, setActiveColor] = useState('#FF4444');
  const [strokeWidth, setStrokeWidth] = useState(4);

  // Drawing state
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Text editing state
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Refs
  const stageRef = useRef();
  const layerRef = useRef();
  const transformerRef = useRef();
  const isDrawingRef = useRef(false);

  // Generate unique ID for annotations
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Firebase path for annotations
  const getAnnotationPath = () => {
    if (!course?.studentKey || !course?.CourseID || !questionId) return null;
    return `students/${course.studentKey}/courses/${course.CourseID}/Grades/annotations/${questionId}`;
  };

  // Save annotations to Firebase
  const saveAnnotations = useCallback(async (annotationsToSave = annotations) => {
    if (!isStaffView || !getAnnotationPath()) return;

    setIsSaving(true);
    try {
      const annotationPath = getAnnotationPath();
      const saveData = {
        annotations: annotationsToSave,
        metadata: {
          lastModified: Date.now(),
          teacherEmail: user?.email || 'unknown_staff',
          version: 1,
          toolsUsed: [...new Set(annotationsToSave.map(a => a.tool))],
          annotationCount: annotationsToSave.length
        }
      };

      await set(ref(database, annotationPath), saveData);
      console.log('✅ Annotations saved successfully');
    } catch (error) {
      console.error('❌ Error saving annotations:', error);
    } finally {
      setIsSaving(false);
    }
  }, [annotations, isStaffView, course, questionId, user?.email, database]);

  // Load annotations from Firebase
  const loadAnnotations = useCallback(() => {
    const annotationPath = getAnnotationPath();
    if (!annotationPath) return;

    const annotationRef = ref(database, annotationPath);
    const unsubscribe = onValue(annotationRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.annotations) {
        setAnnotations(data.annotations);
        // Update history with loaded data
        setHistory([data.annotations]);
        setHistoryStep(0);
      }
    });

    return () => off(annotationRef, 'value', unsubscribe);
  }, [course, questionId, database]);

  // Load annotations on mount
  useEffect(() => {
    const unsubscribe = loadAnnotations();
    return unsubscribe;
  }, [loadAnnotations]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !isStaffView) return;

    const autoSaveTimer = setTimeout(() => {
      if (annotations.length > 0) {
        saveAnnotations();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [annotations, autoSaveEnabled, isStaffView, saveAnnotations]);

  // Add to history for undo/redo
  const addToHistory = (newAnnotations) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push([...newAnnotations]);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Undo functionality
  const undo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      setAnnotations([...history[newStep]]);
    }
  };

  // Redo functionality
  const redo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      setAnnotations([...history[newStep]]);
    }
  };

  // Handle mouse/touch start
  const handlePointerDown = (e) => {
    if (!isStaffView) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    // Clear selection
    setSelectedId(null);

    if (activeTool === 'text') {
      // Text tool - show text input
      setTextPosition(point);
      setIsTextEditing(true);
      return;
    }

    // Start drawing
    setIsDrawing(true);
    isDrawingRef.current = true;

    const newAnnotation = {
      id: generateId(),
      tool: activeTool,
      color: activeColor,
      strokeWidth: strokeWidth,
      points: [point.x, point.y],
      timestamp: Date.now()
    };

    // Add tool-specific properties
    if (activeTool === 'rectangle' || activeTool === 'circle') {
      newAnnotation.startPoint = point;
      newAnnotation.endPoint = point;
    }

    setAnnotations([...annotations, newAnnotation]);
  };

  // Handle mouse/touch move
  const handlePointerMove = (e) => {
    if (!isDrawing || !isStaffView) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    setAnnotations(prevAnnotations => {
      const newAnnotations = [...prevAnnotations];
      const lastAnnotation = newAnnotations[newAnnotations.length - 1];

      if (activeTool === 'pen' || activeTool === 'eraser') {
        // Free drawing - add points
        lastAnnotation.points = [...lastAnnotation.points, point.x, point.y];
      } else if (activeTool === 'rectangle' || activeTool === 'circle') {
        // Shape drawing - update end point
        lastAnnotation.endPoint = point;
      } else if (activeTool === 'arrow') {
        // Arrow drawing
        lastAnnotation.points = [lastAnnotation.points[0], lastAnnotation.points[1], point.x, point.y];
      }

      return newAnnotations;
    });
  };

  // Handle mouse/touch end
  const handlePointerUp = () => {
    if (!isDrawing || !isStaffView) return;

    setIsDrawing(false);
    isDrawingRef.current = false;
    
    // Add to history for undo/redo
    addToHistory(annotations);
  };

  // Handle text input completion
  const handleTextComplete = (textValue) => {
    if (!textValue.trim()) {
      setIsTextEditing(false);
      return;
    }

    const newTextAnnotation = {
      id: generateId(),
      tool: 'text',
      color: activeColor,
      fontSize: 16,
      fontFamily: 'Arial',
      text: textValue,
      x: textPosition.x,
      y: textPosition.y,
      timestamp: Date.now()
    };

    const newAnnotations = [...annotations, newTextAnnotation];
    setAnnotations(newAnnotations);
    addToHistory(newAnnotations);
    setIsTextEditing(false);
  };

  // Export canvas as image
  const exportAsImage = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: 1,
        pixelRatio: 2
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `annotation_${questionId}_${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Render individual annotation
  const renderAnnotation = (annotation) => {
    const commonProps = {
      key: annotation.id,
      stroke: annotation.color,
      strokeWidth: annotation.strokeWidth,
      fill: annotation.tool === 'eraser' ? 'white' : undefined,
      globalCompositeOperation: annotation.tool === 'eraser' ? 'destination-out' : 'source-over'
    };

    switch (annotation.tool) {
      case 'pen':
      case 'eraser':
        return (
          <Line
            {...commonProps}
            points={annotation.points}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
          />
        );
      
      case 'rectangle':
        if (!annotation.startPoint || !annotation.endPoint) return null;
        return (
          <Rect
            {...commonProps}
            x={Math.min(annotation.startPoint.x, annotation.endPoint.x)}
            y={Math.min(annotation.startPoint.y, annotation.endPoint.y)}
            width={Math.abs(annotation.endPoint.x - annotation.startPoint.x)}
            height={Math.abs(annotation.endPoint.y - annotation.startPoint.y)}
            fill="transparent"
          />
        );
      
      case 'circle':
        if (!annotation.startPoint || !annotation.endPoint) return null;
        const radius = Math.sqrt(
          Math.pow(annotation.endPoint.x - annotation.startPoint.x, 2) +
          Math.pow(annotation.endPoint.y - annotation.startPoint.y, 2)
        ) / 2;
        return (
          <Circle
            {...commonProps}
            x={annotation.startPoint.x}
            y={annotation.startPoint.y}
            radius={radius}
            fill="transparent"
          />
        );
      
      case 'arrow':
        return (
          <Arrow
            {...commonProps}
            points={annotation.points}
            pointerLength={10}
            pointerWidth={8}
            fill={annotation.color}
          />
        );
      
      case 'text':
        return (
          <Text
            key={annotation.id}
            x={annotation.x}
            y={annotation.y}
            text={annotation.text}
            fontSize={annotation.fontSize}
            fontFamily={annotation.fontFamily}
            fill={annotation.color}
            draggable={isStaffView}
            onClick={() => isStaffView && setSelectedId(annotation.id)}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`annotation-canvas ${className}`}>
      {/* Toolbar - only show for staff */}
      {isStaffView && (
        <AnnotationToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          activeColor={activeColor}
          onColorChange={setActiveColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          onUndo={undo}
          onRedo={redo}
          onSave={() => saveAnnotations()}
          onExport={exportAsImage}
          canUndo={historyStep > 0}
          canRedo={historyStep < history.length - 1}
          isStaffView={isStaffView}
          isSaving={isSaving}
        />
      )}

      {/* Canvas */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onMouseDown={handlePointerDown}
          onMousemove={handlePointerMove}
          onMouseup={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{ cursor: isStaffView ? 'crosshair' : 'default' }}
        >
          <Layer ref={layerRef}>
            {/* Render all annotations */}
            {annotations.map(renderAnnotation)}
          </Layer>
        </Stage>

        {/* Text input overlay */}
        {isTextEditing && isStaffView && (
          <div
            className="absolute z-10"
            style={{
              left: textPosition.x,
              top: textPosition.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <input
              type="text"
              autoFocus
              className="px-2 py-1 border border-blue-500 rounded shadow-lg bg-white"
              placeholder="Enter text..."
              style={{ color: activeColor }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTextComplete(e.target.value);
                } else if (e.key === 'Escape') {
                  setIsTextEditing(false);
                }
              }}
              onBlur={(e) => handleTextComplete(e.target.value)}
            />
          </div>
        )}

        {/* Read-only indicator for students */}
        {!isStaffView && annotations.length > 0 && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            Teacher Annotations
          </div>
        )}

        {/* Empty state for students */}
        {!isStaffView && annotations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
            No annotations yet
          </div>
        )}
      </div>

      {/* Auto-save indicator */}
      {isStaffView && autoSaveEnabled && (
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSaving ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          {isSaving ? 'Saving...' : 'Auto-save enabled'}
        </div>
      )}
    </div>
  );
};

export default AnnotationCanvas;