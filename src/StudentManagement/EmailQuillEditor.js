import React, { useState, useRef, useEffect, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import ImageResize from '../courses/CourseEditor/ImageResize';  

// Register the custom ImageResize module
Quill.register('modules/imageResize', ImageResize);

// Custom image handler that uploads to Firebase Storage
function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;

    const range = this.quill.getSelection(true);
    this.quill.insertText(range.index, 'Uploading image...', 'bold', true);

    try {
      const storage = getStorage();
      const path = `email-images/${new Date().getTime()}_${file.name}`;
      const imageRef = storageRef(storage, path);
      
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      
      // Remove loading text
      this.quill.deleteText(range.index, 'Uploading image...'.length);
      
      // Insert the image
      this.quill.insertEmbed(range.index, 'image', url);
      
      // Move cursor to next position
      this.quill.setSelection(range.index + 1);
    } catch (error) {
      console.error('Error uploading image:', error);
      this.quill.deleteText(range.index, 'Uploading image...'.length);
      this.quill.insertText(range.index, 'Failed to upload image', 'bold', true);
    }
  };
}

// Add custom styles
const styles = document.createElement('style');
styles.textContent = `
  .email-quill-editor {
    display: flex;
    flex-direction: column;
  }

  .email-quill-editor .ql-container {
    height: 350px !important;
    flex: 1;
  }

  .email-quill-editor .ql-editor {
    height: 100%;
    max-height: none;
    overflow-y: auto;
  }

  .email-quill-editor .ql-editor img {
    cursor: pointer;
    max-width: 100%;
  }

  .email-quill-editor .ql-editor img:hover {
    outline: 2px solid #007bff;
  }

  .ql-snow .ql-tooltip[data-mode="link"]::before {
    content: "Enter link URL:";
  }

  .ql-tooltip {
    z-index: 1000;
  }
`;
document.head.appendChild(styles);

const modules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    handlers: {
      image: imageHandler
    }
  },
  imageResize: {
    handleStyles: {
      width: '8px',
      height: '8px',
      backgroundColor: '#007bff',
      border: 'none',
      borderRadius: '50%'
    },
    overlayStyles: {
      position: 'absolute',
      boxSizing: 'border-box',
      border: '1px dashed #007bff'
    }
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'link', 'image',
  'width'  // Important for image resizing
];

const EmailQuillEditor = forwardRef(({
  initialContent = '',
  onChange = () => {},
  placeholder = 'Compose your email...',
  className = '',
  disabled = false
}, ref) => {
  const [content, setContent] = useState(initialContent);
  const [error, setError] = useState(null);
  const quillRef = useRef(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (value) => {
    setContent(value);
    onChange(value);
  };

  // Method to get editor content
  const getContent = () => {
    if (!quillRef.current) return '';
    return quillRef.current.getEditor().root.innerHTML;
  };

  // Method to set editor content
  const setEditorContent = (html) => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    editor.clipboard.dangerouslyPasteHTML(html);
  };

  // Method to get plain text
  const getPlainText = () => {
    if (!quillRef.current) return '';
    return quillRef.current.getEditor().getText();
  };

  // Expose methods through ref
  React.useImperativeHandle(ref, () => ({
    getContent,
    setContent: setEditorContent,
    getPlainText,
    getEditor: () => quillRef.current?.getEditor()
  }));

  return (
    <div className={`email-quill-editor ${className}`}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={disabled}
      />
    </div>
  );
});

EmailQuillEditor.displayName = 'EmailQuillEditor';

export default EmailQuillEditor;