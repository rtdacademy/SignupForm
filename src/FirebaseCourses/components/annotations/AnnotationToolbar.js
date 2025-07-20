import React from 'react';
import { 
  Pen, 
  Type, 
  Square, 
  Circle, 
  ArrowRight,
  Eraser,
  Undo,
  Redo,
  Palette,
  Save,
  Download
} from 'lucide-react';

/**
 * Annotation Toolbar Component
 * 
 * Provides drawing tools for teacher annotations including:
 * - Drawing tools (pen, eraser)
 * - Shape tools (rectangle, circle, arrow)
 * - Text tool
 * - Color selection
 * - Undo/Redo
 * - Save/Export
 */
const AnnotationToolbar = ({
  activeTool,
  onToolChange,
  activeColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onSave,
  onExport,
  canUndo = false,
  canRedo = false,
  isStaffView = false,
  isSaving = false
}) => {
  // Available drawing tools
  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen', description: 'Free drawing' },
    { id: 'text', icon: Type, label: 'Text', description: 'Add text annotation' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', description: 'Draw rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle', description: 'Draw circle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow', description: 'Draw arrow' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', description: 'Erase annotations' }
  ];

  // Color palette for annotations
  const colors = [
    { value: '#FF4444', name: 'Red', description: 'Corrections/Issues' },
    { value: '#4444FF', name: 'Blue', description: 'General feedback' },
    { value: '#44FF44', name: 'Green', description: 'Good work' },
    { value: '#FFB800', name: 'Orange', description: 'Suggestions' },
    { value: '#8B44FF', name: 'Purple', description: 'Questions' },
    { value: '#000000', name: 'Black', description: 'Default' }
  ];

  // Stroke width options
  const strokeWidths = [
    { value: 2, label: 'Thin' },
    { value: 4, label: 'Medium' },
    { value: 6, label: 'Thick' },
    { value: 8, label: 'Very Thick' }
  ];

  // Don't render toolbar for students
  if (!isStaffView) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Drawing Tools */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Tools:</span>
          <div className="flex gap-1">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              const isActive = activeTool === tool.id;
              
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  className={`
                    p-2 rounded-md transition-all duration-200 relative group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                  title={tool.description}
                >
                  <IconComponent className="w-4 h-4" />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {tool.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Color:</span>
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(color.value)}
                className={`
                  w-8 h-8 rounded-full border-2 transition-all duration-200 relative group
                  ${activeColor === color.value 
                    ? 'border-gray-800 scale-110' 
                    : 'border-gray-300 hover:border-gray-500'
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={`${color.name} - ${color.description}`}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {color.name}
                </div>
              </button>
            ))}
          </div>
          
          {/* Color picker for custom colors */}
          <input
            type="color"
            value={activeColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            title="Custom color"
          />
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Stroke Width */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Size:</span>
          <select
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
            className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            {strokeWidths.map((width) => (
              <option key={width.value} value={width.value}>
                {width.label}
              </option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              p-2 rounded-md transition-all duration-200 
              ${canUndo 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }
            `}
            title="Undo last action"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              p-2 rounded-md transition-all duration-200 
              ${canRedo 
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }
            `}
            title="Redo last undone action"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Save/Export Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium
              ${isSaving
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
            title="Save annotations"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200 text-sm font-medium"
            title="Export as image"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tool-specific options */}
      {activeTool === 'text' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Text Options:</span>
            <select
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              defaultValue="16"
            >
              <option value="12">Small (12px)</option>
              <option value="16">Medium (16px)</option>
              <option value="20">Large (20px)</option>
              <option value="24">Extra Large (24px)</option>
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              Bold
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotationToolbar;