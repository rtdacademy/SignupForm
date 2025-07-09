import React, { useState, useRef, useEffect, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDatabase, ref as dbRef, update } from 'firebase/database';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Save } from 'lucide-react';
import { ScrollArea } from '../../components/ui/scroll-area';

// KaTeX dependency
import katex from "katex";
window.katex = katex;
import "katex/dist/katex.css";

// MathQuill dependency
import '@edtr-io/mathquill/build/mathquill.js';
import '@edtr-io/mathquill/build/mathquill.css';

// mathquill4quill
import mathquill4quill from "mathquill4quill";
import "mathquill4quill/mathquill4quill.css";

// jQuery setup
import $ from "jquery";
window.jQuery = window.$ = $;

// Import our custom image resizing module
import './ImageResize';

// Define preset video sizes (16:9 aspect ratio)
const VIDEO_SIZES = [
  { label: 'Small (320×180)', width: 320, height: 180 },
  { label: 'Medium (640×360)', width: 640, height: 360 },
  { label: 'Large (1024×576)', width: 1024, height: 576 }
];

const CUSTOM_OPERATORS = [
  ["\\pm", "\\pm"],
  ["\\sqrt{x}", "\\sqrt"],
  ["\\sqrt[3]{x}", "\\sqrt[3]{}"],
  ["\\sqrt[n]{x}", "\\nthroot"],
  ["\\frac{x}{y}", "\\frac"],
  ["\\sum^{s}_{x}{d}", "\\sum"],
  ["\\prod^{s}_{x}{d}", "\\prod"],
  ["\\int^{s}_{x}{d}", "\\int"],
  ["\\binom{n}{k}", "\\binom"],
  ["\\pi", "\\pi"],
  ["\\theta", "\\theta"]
];

function VideoInsertDialog({ open, onClose, onInsert }) {
  const [url, setUrl] = useState('');
  const [selectedSize, setSelectedSize] = useState(VIDEO_SIZES[0]);

  // Reset the URL field whenever the dialog is opened
  useEffect(() => {
    if (open) {
      setUrl('');
      setSelectedSize(VIDEO_SIZES[0]);
    }
  }, [open]);

  const handleInsert = () => {
    if (!url) return;
    // Convert various YouTube URL formats to embed URL
    let embedUrl = url;
    let videoId = null;
    let startTime = null;
    
    // Extract time parameter if present
    if (url.includes("t=")) {
      const timeParam = url.split("t=")[1].split("&")[0];
      startTime = timeParam;
    }
    
    if (embedUrl.includes("youtube.com/watch?v=")) {
      // Standard YouTube URL
      videoId = embedUrl.split("watch?v=")[1].split("&")[0];
    } else if (embedUrl.includes("youtu.be/")) {
      // Short link format
      videoId = embedUrl.split("youtu.be/")[1].split("?")[0];
    } else if (embedUrl.includes("youtube.com/live/")) {
      // Live format
      videoId = embedUrl.split("youtube.com/live/")[1].split("?")[0];
    }
    
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
      // Add start time if present
      if (startTime) {
        embedUrl += `?start=${startTime}`;
      }
    }
  
    onInsert(embedUrl, selectedSize.width, selectedSize.height);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Insert Video</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">YouTube URL</label>
          <input 
            type="text" 
            className="border p-2 w-full rounded"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Size</label>
          <select 
            className="border p-2 w-full rounded"
            value={selectedSize.label}
            onChange={e => {
              const chosen = VIDEO_SIZES.find(size => size.label === e.target.value);
              if (chosen) setSelectedSize(chosen);
            }}
          >
            {VIDEO_SIZES.map(size => (
              <option key={size.label} value={size.label}>{size.label}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert}>
            Insert
          </Button>
        </div>
      </div>
    </div>
  );
}

// We'll modify the videoHandler to open the dialog and also store the current selection
function videoHandler() {
  const quillEditor = this.quill;
  const currentSelection = quillEditor.getSelection();
  const quillEditorContainer = quillEditor.container.closest('.quill-editor-container');
  if (!quillEditorContainer) return;

  // Dispatch a custom event to open the video dialog along with the current selection
  const event = new CustomEvent('openVideoDialog', { detail: { quill: quillEditor, selection: currentSelection } });
  quillEditorContainer.dispatchEvent(event);
}

const modules = {
  formula: true,
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video', 'formula'],
      ['clean']
    ],
    handlers: {
      video: videoHandler
    }
  },
  imageResize: {
    handleStyles: {
      width: '8px',
      height: '8px',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '50%'
    }
  }
};

const styles = document.createElement('style');
styles.textContent = `
  .ql-tooltip[data-mode="formula"],
  .ql-tooltip[data-mode="link"],
  .ql-tooltip[data-mode="video"] {
    position: fixed !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    top: 120px !important;
    z-index: 1000 !important;
    padding: 10px !important;
    background: white !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
    border-radius: 4px !important;
  }

  .ql-tooltip input[type="text"] {
    display: block !important;
    visibility: visible !important;
    width: 100% !important;
  }

  .ql-tooltip[data-mode="formula"]::before,
  .ql-tooltip[data-mode="video"]::before {
    display: none !important;
  }

  .ql-tooltip[data-mode="formula"] input[type="text"],
  .ql-tooltip[data-mode="video"] input[type="text"] {
    border: none !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    background: transparent !important;
  }

  .mathquill4quill-operator-container {
    margin-top: 10px !important;
  }

  .ql-editor img {
    cursor: pointer;
    max-width: 100%;
  }

  .ql-editor img:hover {
    outline: 2px solid #007bff;
  }

  .ql-editor iframe {
    cursor: pointer;
    max-width: 100%;
  }

  .ql-editor iframe:hover {
    outline: 2px solid #007bff;
  }

  .image-resize-size-display {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 12px;
    pointer-events: none;
    z-index: 100;
    transition: opacity 0.2s;
  }
`;
document.head.appendChild(styles);

// Add contentPath to the props list
const QuillEditor = forwardRef(({
  courseId,
  unitId,
  itemId,
  initialContent = '',
  contentPath = null, // Add default to prevent undefined errors
  onSave = () => {},
  onSaveAndClose = null,
  onError = () => {},
  onContentChange = null, // NEW: Callback for real-time content changes
  fixedHeight = null,
  hideSaveButton = false,
}, ref) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const quillRef = useRef(null);

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentQuill, setCurrentQuill] = useState(null);
  const [savedSelection, setSavedSelection] = useState(null);

  useEffect(() => {
    setContent(initialContent || '');
  }, [initialContent]);

  // Handle content changes with optional parent notification
  const handleContentChange = (value) => {
    setContent(value);
    // Notify parent component if callback provided
    if (onContentChange) {
      onContentChange(value);
    }
  };

  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    
    if (!quill._mathquillInitialized) {
      const enableMathQuillFormulaAuthoring = mathquill4quill({ Quill, katex, disableDefaultFormula: true });
      enableMathQuillFormulaAuthoring(quill, {
        operators: CUSTOM_OPERATORS,
        displayHistory: true,
        displayDeleteButtonOnHistory: true,
        hideSyntax: true
      });
      quill._mathquillInitialized = true;
    }

    // Attach the event listener for 'openVideoDialog' as soon as quill is ready
    const container = quill.container.closest('.quill-editor-container');
    if (container) {
      const handleOpenVideoDialog = (e) => {
        setCurrentQuill(e.detail.quill);
        setSavedSelection(e.detail.selection);
        setVideoDialogOpen(true);
      };
      container.addEventListener('openVideoDialog', handleOpenVideoDialog);
      
      return () => {
        container.removeEventListener('openVideoDialog', handleOpenVideoDialog);
      };
    }
  }, [quillRef]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!courseId || !unitId || !itemId) {
        throw new Error('Missing required parameters');
      }

      const editor = quillRef.current.getEditor();
      const html = editor.root.innerHTML;

      console.log('QuillEditor saving content:', {
        courseId,
        unitId, 
        itemId,
        contentPath,
        content: html
      });

      // If we have a specific content path, save directly
      if (contentPath) {
        try {
          const firestore = getFirestore();
          const contentRef = doc(firestore, contentPath);
          
          await setDoc(contentRef, {
            content: html,
            updatedAt: new Date().toISOString()
          });
          
          console.log('Content saved to Firestore at path:', contentPath);
        } catch (pathError) {
          console.error('Error saving to specific path:', pathError);
        }
      }

      // Return the content to parent component for state updates
      onSave(html);
      
      // If onSaveAndClose is provided, call it instead of just onSave
      if (onSaveAndClose) {
        onSaveAndClose(html);
        return; // Exit early to prevent showing save button
      }
    } catch (err) {
      console.error('Error saving content:', err);
      const errorMessage = err.message || 'Failed to save content. Please try again.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInsertVideo = (url, width, height) => {
    if (currentQuill) {
      // Restore the saved selection if available
      if (savedSelection) {
        currentQuill.setSelection(savedSelection.index, savedSelection.length);
      }
      const range = currentQuill.getSelection();
      if (range) {
        currentQuill.insertEmbed(range.index, 'video', url, 'user');
        setTimeout(() => {
          const iframes = currentQuill.root.querySelectorAll(`iframe[src="${url}"]`);
          if (iframes.length) {
            const iframe = iframes[iframes.length - 1];
            iframe.setAttribute('width', width);
            iframe.setAttribute('height', height);
            iframe.style.width = width + 'px';
            iframe.style.height = height + 'px';
          }
        }, 100);
      }
    }
  };

  // Dynamic height class based on fixedHeight prop
  const getHeightClass = () => {
    if (fixedHeight) {
      return `quill-fixed-height`;
    }
    return "h-full overflow-visible [&_.ql-editor]:max-h-[65vh] [&_.ql-editor]:overflow-y-auto";
  };

  // Add dynamic CSS for fixed height if provided
  React.useEffect(() => {
    if (fixedHeight) {
      const styleId = 'quill-fixed-height-style';
      let style = document.getElementById(styleId);
      
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      
      style.textContent = `
        .quill-fixed-height .ql-container {
          height: ${fixedHeight} !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .quill-fixed-height .ql-editor {
          height: calc(${fixedHeight} - 42px) !important;
          overflow-y: auto !important;
          min-height: calc(${fixedHeight} - 42px) !important;
          flex: 1 !important;
        }
        .quill-fixed-height .ql-toolbar {
          flex-shrink: 0 !important;
        }
      `;
      
      console.log('Fixed height CSS applied:', fixedHeight);
    }
  }, [fixedHeight]);


  return (
    <div className={`flex flex-col overflow-visible quill-editor-container ${fixedHeight ? 'h-auto' : 'h-full'}`}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <VideoInsertDialog 
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        onInsert={handleInsertVideo}
      />

      <div className={fixedHeight ? "overflow-hidden" : "flex-1 overflow-hidden"} style={{ minHeight: fixedHeight || 'auto' }}>
        {fixedHeight ? (
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={modules}
            placeholder="Start creating your content..."
            className={getHeightClass()}
          />
        ) : (
          <ScrollArea className="h-[calc(100%-4rem)] overflow-visible">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={modules}
              placeholder="Start creating your content..."
              className={getHeightClass()}
            />
          </ScrollArea>
        )}
      </div>

      {!hideSaveButton && (
        <div className="flex justify-end pt-4 mt-auto">
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : (onSaveAndClose ? 'Save & Close' : 'Save Content')}
          </Button>
        </div>
      )}
    </div>
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;