import React, { useState, useRef, useEffect, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDatabase, ref as dbRef, update } from 'firebase/database';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Save } from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';

// jQuery and KaTeX are loaded globally in index.js

// MathQuill dependency - requires jQuery to be loaded first
import '@edtr-io/mathquill/build/mathquill.js';
import '@edtr-io/mathquill/build/mathquill.css';

// mathquill4quill
import mathquill4quill from "mathquill4quill";
import "mathquill4quill/mathquill4quill.css";

// Import our custom image resizing module
import '../courses/CourseEditor/ImageResize';

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
  ["\\theta", "\\theta"],
  ["\\sin", "\\sin"],
  ["\\cos", "\\cos"],
  ["\\tan", "\\tan"],
  ["\\sin^{-1}", "\\sin^{-1}"],
  ["\\cos^{-1}", "\\cos^{-1}"],
  ["\\tan^{-1}", "\\tan^{-1}"]
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
  const quillEditorContainer = quillEditor.container.closest('.simple-quill-editor-container');
  if (!quillEditorContainer) return;

  // Dispatch a custom event to open the video dialog along with the current selection
  const event = new CustomEvent('openVideoDialog', { detail: { quill: quillEditor, selection: currentSelection } });
  quillEditorContainer.dispatchEvent(event);
}

const modules = {
  formula: true,
  toolbar: {
    container: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['formula']
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
const SimpleQuillEditor = forwardRef(({
  courseId,
  unitId,
  itemId,
  initialContent = '',
  contentPath = null, // Add default to prevent undefined errors
  onSave = () => {},
  onError = () => {},
  onWordCountChange = () => {}, // NEW: Callback for word count updates
  onContentChange = () => {}, // NEW: Callback for real-time content changes
  disabled = false, // NEW: Prop to disable the editor
}, ref) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const quillRef = useRef(null);

  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [currentQuill, setCurrentQuill] = useState(null);
  const [savedSelection, setSavedSelection] = useState(null);

  // Track if user is actively editing to prevent overwriting their changes
  const isUserEditingRef = useRef(false);
  const lastInitialContentRef = useRef(initialContent);

  useEffect(() => {
    const newContent = initialContent || '';
    
    // Only update if initialContent actually changed and user isn't actively editing
    if (newContent !== lastInitialContentRef.current && !isUserEditingRef.current) {
      console.log('📝 SimpleQuillEditor: Updating content from initialContent change', {
        newContent: newContent.substring(0, 50) + '...',
        wasEditing: isUserEditingRef.current
      });
      setContent(newContent);
      lastInitialContentRef.current = newContent;
    }
  }, [initialContent]);

  // Handle content changes with word count tracking
  const handleContentChange = (value, delta, source, editor) => {
    if (disabled) {
      console.log('🚫 Content change blocked: editor is disabled');
      return;
    }
    
    // Track that user is actively editing
    isUserEditingRef.current = true;
    
    setContent(value);
    
    // Calculate word count from plain text (strips HTML)
    const text = editor.getText();
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Call the callbacks
    onWordCountChange(wordCount);
    onContentChange(value); // Notify parent of content changes in real-time
    
    // Reset editing flag after a short delay
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 1000);
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
    const container = quill.container.closest('.simple-quill-editor-container');
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
    if (disabled) {
      console.log('🚫 Save blocked: editor is disabled');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);

      if (!courseId || !unitId || !itemId) {
        throw new Error('Missing required parameters');
      }

      const editor = quillRef.current.getEditor();
      const html = editor.root.innerHTML;

      console.log('SimpleQuillEditor saving content:', {
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

  return (
    <div className="flex flex-col h-full overflow-visible simple-quill-editor-container">
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

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100%-4rem)] overflow-visible">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleContentChange}
            modules={disabled ? {} : modules} // Disable modules when disabled
            readOnly={disabled} // Make read-only when disabled
            placeholder={disabled ? "" : "Start adding your content..."}
            className={`h-full overflow-visible [&_.ql-editor]:max-h-[65vh] [&_.ql-editor]:overflow-y-auto ${
              disabled ? 'opacity-70 pointer-events-none' : ''
            }`}
          />
        </ScrollArea>
      </div>

    </div>
  );
});

SimpleQuillEditor.displayName = 'SimpleQuillEditor';

export default SimpleQuillEditor;