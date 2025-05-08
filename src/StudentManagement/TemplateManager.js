import React, { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { ScrollArea } from '../components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { getDatabase, ref, set, onValue, update, remove } from 'firebase/database';
import { 
  // Existing imports
  FilePenLine, PlusCircle, Archive, Trash2, RotateCcw, Eye, Save, Pencil, CircleIcon,
  // Template type icons
  Circle, Square, Triangle, BookOpen, GraduationCap, Trophy, Target, 
  ClipboardCheck, Brain, Lightbulb, Clock, Calendar, BarChart, TrendingUp, 
  AlertCircle, HelpCircle, MessageCircle, Users, Presentation, FileText, 
  Bookmark, Mail, Bell, Megaphone, Chat , Grid2X2Icon, ListFilterIcon
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Add custom styles to ensure tooltips and popovers stay inside the container
const customQuillStyles = `
  /* Position tooltips relative to the editor container */
  .quill-container {
    position: relative;
  }
  
  /* Fix tooltip positioning */
  .quill-container .ql-tooltip {
    z-index: 9999;
    position: absolute;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%);
    max-width: 90%;
  }
  
  /* Ensure tooltip is visible */
  .quill-container .ql-tooltip.ql-editing {
    position: fixed;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    padding: 10px;
    width: 300px;
    max-width: 90vw;
  }
`;
import { useAuth } from '../context/AuthContext';
import { TutorialButton } from '../components/TutorialButton';

const iconOptions = [
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'square', label: 'Square', icon: Square },
  { value: 'triangle', label: 'Triangle', icon: Triangle },
  { value: 'book-open', label: 'Study Material', icon: BookOpen },
  { value: 'graduation-cap', label: 'Graduation', icon: GraduationCap },
  { value: 'trophy', label: 'Achievement', icon: Trophy },
  { value: 'target', label: 'Goal', icon: Target },
  { value: 'clipboard-check', label: 'Task Complete', icon: ClipboardCheck },
  { value: 'brain', label: 'Understanding', icon: Brain },
  { value: 'lightbulb', label: 'Idea', icon: Lightbulb },
  { value: 'clock', label: 'Time Management', icon: Clock },
  { value: 'calendar', label: 'Schedule', icon: Calendar },
  { value: 'bar-chart', label: 'Progress', icon: BarChart },
  { value: 'trending-up', label: 'Improvement', icon: TrendingUp },
  { value: 'alert-circle', label: 'Important', icon: AlertCircle },
  { value: 'help-circle', label: 'Help', icon: HelpCircle },
  { value: 'message-circle', label: 'Discussion', icon: MessageCircle },
  { value: 'users', label: 'Group Work', icon: Users },
  { value: 'presentation', label: 'Lecture', icon: Presentation },
  { value: 'file-text', label: 'Assignment', icon: FileText },
  { value: 'bookmark', label: 'Bookmark', icon: Bookmark },
  { value: 'mail', label: 'Mail', icon: Mail },
  { value: 'bell', label: 'Notifications', icon: Bell },
  { value: 'megaphone', label: 'Announcements', icon: Megaphone },
  { value: 'message-circle', label: 'Chat', icon: MessageCircle }
];

const DEFAULT_TEMPLATE_TYPES = [
  { id: 'welcome', name: 'Welcome Messages', description: 'New student welcome emails', icon: 'mail', color: '#315369' }
];

const PLACEHOLDERS = [
  { id: 'firstName', label: 'Prefered Name', token: '[firstName]' },
  { id: 'lastName', label: 'Last Name', token: '[lastName]' },
  { id: 'courseName', label: 'Course Name', token: '[courseName]' },
  { id: 'startDate', label: 'Start Date', token: '[startDate]' },
  { id: 'endDate', label: 'End Date', token: '[endDate]' },
  { id: 'status', label: 'Status', token: '[status]' },
  { id: 'studentType', label: 'Student Type', token: '[studentType]' }
];

const colorOptions = [
  { value: '#315369', label: 'Primary' },
  { value: '#1fa6a7', label: 'Secondary' },
  { value: '#5d7a8c', label: 'Tertiary' },
  { value: '#2ecc71', label: 'Success' },
  { value: '#f39c12', label: 'Warning' },
  { value: '#3498db', label: 'Info' },
  { value: '#a75a1f', label: 'Complementary' }
];

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { list: 'ordered' },
      // The toolbar can still use bullet list in UI but we'll use a different
      // internal format name to make it compatible with react-quill-new
      { list: 'bullet' },
      { indent: '-1' },
      { indent: '+1' }
    ],
    ['link'],
    ['clean']
  ]
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  // 'bullet' has been removed as it's not registered in the new package
  'indent',
  'link'
];



function TemplateManager({ onMessageChange = () => {}, initialTemplate = null, defaultOpen = false }) {
  
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    color: ''
  });
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState('create');
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const quillRef = useRef(null);

  const { user_email_key } = useAuth();



  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);

  // New state declarations
  const [templateTypes, setTemplateTypes] = useState([]);
  const [organizationMethod, setOrganizationMethod] = useState('type'); // 'type' or 'name'
  const [selectedType, setSelectedType] = useState('');
  const [isAddingType, setIsAddingType] = useState(false);
  const [newType, setNewType] = useState({ 
    name: '', 
    description: '', 
    icon: '',
    color: colorOptions[0].value // Default color
  });

  const isTemplateTypeInUse = (typeId) => {
    return templates.some(template => template.type === typeId);
  };

  const handleDeleteTemplateType = async (typeId) => {
    if (isTemplateTypeInUse(typeId)) {
      showNotification('Cannot delete this template type as it is currently in use. Please reassign or delete templates using this type first.', 'error');
      return;
    }

    const db = getDatabase();
    const typeRef = ref(db, `templateTypes/${typeId}`);

    try {
      await remove(typeRef);
      showNotification('Template type deleted successfully');
    } catch (error) {
      console.error('Error deleting template type:', error);
      showNotification('Failed to delete template type', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };


  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);
  
  // Add custom style to fix Quill tooltip positioning
  useEffect(() => {
    // Create style element
    const styleEl = document.createElement('style');
    styleEl.innerHTML = customQuillStyles;
    document.head.appendChild(styleEl);
    
    // Clean up on unmount
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);


  useEffect(() => {
    if (!user_email_key) return;
  
    const db = getDatabase();
    const templatesRef = ref(db, `teacherMessages/${user_email_key}`);
  
    const unsubscribe = onValue(templatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const templatesData = snapshot.val();
        const templatesArray = Object.entries(templatesData).map(([id, data]) => ({
          id,
          ...data
        }));
        setTemplates(templatesArray);
        onMessageChange(templatesArray.filter((msg) => !msg.archived));
      } else {
        setTemplates([]);
        onMessageChange([]);
      }
    });
  
    return () => unsubscribe();
  }, [user_email_key, onMessageChange]);


  useEffect(() => {
    const db = getDatabase();
    const typesRef = ref(db, 'templateTypes'); // Changed from user-specific path
  
    const handleTypes = (snapshot) => {
      if (snapshot.exists()) {
        const typesData = snapshot.val();
        const typesArray = Object.entries(typesData).map(([id, type]) => ({
          id,
          ...type
        }));
        setTemplateTypes(typesArray);
      } else {
        setTemplateTypes([]);
      }
    };
  
    onValue(typesRef, handleTypes);
  
    return () => {
      // Cleanup
    };
  }, []);

  // Handle initial template loading
  useEffect(() => {
    if (initialTemplate) {
      setNewTemplate({
        name: initialTemplate.name || 'New Template',
        subject: initialTemplate.subject || '',
        content: initialTemplate.content,
        color: initialTemplate.color || colorOptions[0].value
      });
      setIsOpen(true);
      setActiveTab('create');
      setIsEditing(false);
      setCurrentTemplateId(null);
    }
  }, [initialTemplate]);

  // New useEffect for template types
  useEffect(() => {
    if (!user_email_key) return;

    const db = getDatabase();
    const customTypesRef = ref(db, `templateTypes/${user_email_key}`);

    const handleCustomTypes = (snapshot) => {
      if (snapshot.exists()) {
        const customTypes = snapshot.val();
        setTemplateTypes([
          ...DEFAULT_TEMPLATE_TYPES,
          ...Object.entries(customTypes).map(([id, type]) => ({
            id,
            ...type,
            isCustom: true
          }))
        ]);
      } else {
        setTemplateTypes(DEFAULT_TEMPLATE_TYPES);
      }
    };

    onValue(customTypesRef, handleCustomTypes);

    return () => {
      // Cleanup if necessary
    };
  }, [user_email_key]);

  // Handle adding a new template type
  const handleAddTemplateType = async () => {
    if (!newType.name || !newType.icon) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
  
    const db = getDatabase();
    const typeId = newType.name.toLowerCase().replace(/\s+/g, '-');
    const typeRef = ref(db, `templateTypes/${typeId}`); // Changed from user-specific path
  
    try {
      await set(typeRef, {
        name: newType.name,
        description: newType.description,
        icon: newType.icon,
        color: newType.color,
        createdAt: new Date().toISOString(),
        createdBy: user_email_key // Track who created it
      });
      setNewType({ name: '', description: '', icon: '', color: colorOptions[0].value });
      setIsAddingType(false);
      showNotification('Template type added successfully');
    } catch (error) {
      console.error('Error adding template type:', error);
      showNotification('Failed to add template type', 'error');
    }
  };

  const openDialog = () => {
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      color: ''
    });
    setSelectedType('');
    setActiveTab('create');
    setIsOpen(true);
    setIsEditing(false);
    setCurrentTemplateId(null);
  };

  // Modified handleAddTemplate to include template type
  const handleAddTemplate = async () => {
    if (!quillRef.current || !newTemplate.name || !newTemplate.color || !user_email_key)
      return;

    const editor = quillRef.current.getEditor();
    const deltaContent = editor.getContents();

    const db = getDatabase();

    try {
      if (isEditing && currentTemplateId) {
        const templateRef = ref(db, `teacherMessages/${user_email_key}/${currentTemplateId}`);
        await update(templateRef, {
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: deltaContent,
          color: newTemplate.color,
          type: selectedType, // Add type
          lastModified: new Date().toISOString(),
        });
        showNotification('Template updated successfully');
      } else {
        const templateId = Date.now().toString();
        const templateRef = ref(db, `teacherMessages/${user_email_key}/${templateId}`);
        await set(templateRef, {
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: deltaContent,
          color: newTemplate.color,
          type: selectedType, // Add type
          archived: false,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        });
        showNotification('Template added successfully');
      }

      setNewTemplate({ name: '', subject: '', content: '', color: '' });
      setSelectedType('');
      setIsEditing(false);
      setCurrentTemplateId(null);
      setActiveTab('templates');
    } catch (error) {
      console.error('Error saving template:', error);
      showNotification('Error saving template', 'error');
    }
  };

  const handleTemplateAction = async (templateId, action) => {
    if (!user_email_key) return;

    const db = getDatabase();
    const templateRef = ref(db, `teacherMessages/${user_email_key}/${templateId}`);

    try {
      if (action === 'delete') {
        await remove(templateRef);
        showNotification('Template deleted successfully');
        setTemplateToDelete(null);
      } else if (action === 'archive' || action === 'unarchive') {
        await update(templateRef, {
          archived: action === 'archive',
          lastModified: new Date().toISOString()
        });
        showNotification(`Template ${action}d successfully`);
      }
    } catch (error) {
      console.error(`Error ${action}ing template:`, error);
      showNotification(`Error ${action}ing template`, 'error');
    }
  };

  const handleEditTemplate = (template) => {
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
      color: template.color,
    });
    setSelectedType(template.type || '');
    setCurrentTemplateId(template.id);
    setIsEditing(true);
    setActiveTab('create');
    setIsOpen(true);

    // Set the editor content
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      editor.setContents(template.content);
    }
  };

  const insertPlaceholder = (placeholder) => {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true);
    const position = range ? range.index : editor.getLength();

    editor.insertText(position, placeholder.token);
    editor.setSelection(position + placeholder.token.length);
  };

  // Get preview text for a template using the editor
  const getTemplatePreview = (template) => {
    if (!template.content) return '';
    
    // Extract text without creating a Quill instance
    try {
      // Delta format typically contains ops array with insert operations
      if (template.content.ops) {
        return template.content.ops
          .map(op => typeof op.insert === 'string' ? op.insert : '')
          .join('')
          .substring(0, 100);
      }
      
      // Fallback for other formats
      return typeof template.content === 'string' 
        ? template.content.substring(0, 100) 
        : '';
    } catch (e) {
      console.error('Error extracting text from template:', e);
      return '';
    }
  };

  
 // Helper function to truncate text
const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const renderTemplateList = (archived, templatesList = null) => {
  const list = templatesList !== null ? templatesList : templates.filter((template) => template.archived === archived);

  const getTemplateContent = (template) => {
    if (!template.content) return '';
    
    // Extract HTML content without creating a Quill instance
    try {
      // If content is in Delta format (has ops array)
      if (template.content.ops) {
        // Create a container that's not attached to the DOM
        const container = document.createElement('div');
        
        // Process ops and build HTML directly
        template.content.ops.forEach(op => {
          if (typeof op.insert === 'string') {
            const span = document.createElement('span');
            
            // Apply basic formatting if available
            if (op.attributes) {
              if (op.attributes.bold) span.style.fontWeight = 'bold';
              if (op.attributes.italic) span.style.fontStyle = 'italic';
              if (op.attributes.underline) span.style.textDecoration = 'underline';
            }
            
            span.textContent = op.insert;
            container.appendChild(span);
          }
        });
        
        return container.innerHTML;
      }
      
      // Fallback for other formats
      return typeof template.content === 'string' 
        ? template.content 
        : '';
    } catch (e) {
      console.error('Error extracting HTML from template:', e);
      return '';
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    // Strip any HTML tags and decode HTML entities
    const div = document.createElement('div');
    div.innerHTML = text;
    const plainText = div.textContent || div.innerText || '';
    return plainText.length > maxLength ? `${plainText.substring(0, maxLength)}...` : plainText;
  };

  return (
    <div className="space-y-4">
      {list.map((template) => (
        <div key={template.id} className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center overflow-hidden">
              <div
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: template.color }}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium truncate max-w-[200px] cursor-help">
                      {truncateText(template.name, 30)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[300px] whitespace-pre-wrap">{template.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
      
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setPreviewTemplate(template)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <div className="max-w-[400px]">
        <p className="font-semibold mb-1">Template Details</p>
        <p className="mb-1"><span className="font-medium">Name:</span> {template.name}</p>
        {template.subject && (
          <p className="mb-1"><span className="font-medium">Subject:</span> {template.subject}</p>
        )}
        <p className="font-medium mb-1">Message:</p>
        <div 
          className="ql-editor whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: getTemplateContent(template) }}
        />
      </div>
    </TooltipContent>
  </Tooltip>

  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEditTemplate(template)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>Edit template</TooltipContent>
  </Tooltip>

  {archived ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTemplateAction(template.id, 'unarchive')}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Unarchive template</TooltipContent>
    </Tooltip>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTemplateAction(template.id, 'archive')}
        >
          <Archive className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Archive template</TooltipContent>
    </Tooltip>
  )}

  <Tooltip>
    <TooltipTrigger asChild>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTemplateToDelete(template.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleTemplateAction(template.id, 'delete')}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipTrigger>
    <TooltipContent>Delete template</TooltipContent>
  </Tooltip>
</TooltipProvider>
            </div>
          </div>
          {template.subject && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-sm text-gray-600 mb-2 truncate cursor-help">
                    Subject: {truncateText(template.subject, 50)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[300px] whitespace-pre-wrap">{template.subject}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm text-gray-500 line-clamp-2 cursor-help">
                  {truncateText(getTemplateContent(template), 150)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div 
                  className="max-w-[400px] ql-editor"
                  dangerouslySetInnerHTML={{ __html: getTemplateContent(template) }}
                />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ))}
    </div>
  );
};
  // Function to render the template type select
  const renderTemplateTypeSelect = () => (
    <div className="w-full">
      <Select
        value={selectedType}
        onValueChange={setSelectedType}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select template type">
            {selectedType && templateTypes.find(t => t.id === selectedType) && (
              <div className="flex items-center">
                {React.createElement(
                  iconOptions.find(icon => icon.value === templateTypes.find(t => t.id === selectedType).icon)?.icon || CircleIcon,
                  { 
                    className: "h-4 w-4 mr-2",
                    style: { color: templateTypes.find(t => t.id === selectedType).color }
                  }
                )}
                <span>{templateTypes.find(t => t.id === selectedType).name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {templateTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              <div className="flex items-center">
                {React.createElement(
                  iconOptions.find(icon => icon.value === type.icon)?.icon || CircleIcon,
                  { 
                    className: "h-4 w-4 mr-2",
                    style: { color: type.color }
                  }
                )}
                <span>{type.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Function to render the add type dialog
  const renderAddTypeDialog = () => (
    <AlertDialog open={isAddingType} onOpenChange={setIsAddingType}>
      <AlertDialogContent className="max-w-[90vw] sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Template Type</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new category for organizing your templates. Choose an icon and color to help identify this type.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Type Name"
            value={newType.name}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
          />
          <Input
            placeholder="Description (optional)"
            value={newType.description}
            onChange={(e) => setNewType({ ...newType, description: e.target.value })}
          />
          <Select
            value={newType.icon}
            onValueChange={(value) => setNewType({ ...newType, icon: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an icon">
                {newType.icon && (
                  <div className="flex items-center">
                    {React.createElement(
                      iconOptions.find(icon => icon.value === newType.icon)?.icon || CircleIcon,
                      { 
                        className: "h-4 w-4 mr-2",
                        style: { color: newType.color }
                      }
                    )}
                    {iconOptions.find(icon => icon.value === newType.icon)?.label}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <div className="grid grid-cols-3 gap-2 p-2">
                {iconOptions.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    <div className="flex flex-col items-center justify-center">
                      {React.createElement(icon.icon, { 
                        className: "h-6 w-6 mb-1",
                        style: { color: newType.color }
                      })}
                      <span className="text-xs text-center">{icon.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
          <Select
            value={newType.color}
            onValueChange={(value) => setNewType({ ...newType, color: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color.value }} />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsAddingType(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleAddTemplateType}>
            Add Type
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Function to render the templates tab with organization options
 // The issue is in the renderTemplatesTab function. The logic for rendering uncategorized templates
// is only checking for templates where !t.type, but it should also check for templates where
// the type doesn't exist in templateTypes. Here's the fixed version:

const renderTemplatesTab = () => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOrganizationMethod('type')}
          className={`${organizationMethod === 'type' ? 'bg-primary text-white' : ''} text-xs sm:text-sm`}
        >
          <Grid2X2Icon className="h-4 w-4 mr-1 sm:mr-2" />
          By Type
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOrganizationMethod('name')}
          className={`${organizationMethod === 'name' ? 'bg-primary text-white' : ''} text-xs sm:text-sm`}
        >
          <ListFilterIcon className="h-4 w-4 mr-1 sm:mr-2" />
          By Name
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsAddingType(true)}
        className="text-xs sm:text-sm"
      >
        <PlusCircle className="h-4 w-4 mr-1 sm:mr-2" />
        Add Type
      </Button>
    </div>
  
    <ScrollArea className="max-h-[60vh]">
      {organizationMethod === 'type' ? (
        <div className="space-y-4 pr-4">
          {templateTypes.map((type) => {
            const typeTemplates = templates.filter(
              (template) => !template.archived && template.type === type.id
            );
            
            return (
              <div key={type.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {React.createElement(
                      iconOptions.find(icon => icon.value === type.icon)?.icon || CircleIcon,
                      { 
                        className: "h-5 w-5 mr-2",
                        style: { color: type.color }
                      }
                    )}
                    <h3 className="font-medium">{type.name}</h3>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              disabled={isTemplateTypeInUse(type.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete template type?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this template type. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTemplateType(type.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isTemplateTypeInUse(type.id) 
                          ? "Cannot delete: Type is in use by templates"
                          : "Delete template type"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {typeTemplates.length > 0 && renderTemplateList(false, typeTemplates)}
                {typeTemplates.length === 0 && (
                  <div className="text-sm text-gray-500 italic pl-7">
                    No templates in this category
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Fixed uncategorized templates section */}
          {(() => {
            const uncategorizedTemplates = templates.filter((t) => (
              !t.archived && 
              (!t.type || !templateTypes.some(type => type.id === t.type))
            ));
            
            if (uncategorizedTemplates.length > 0) {
              return (
                <div>
                  <h3 className="font-medium mb-2">Uncategorized</h3>
                  {renderTemplateList(false, uncategorizedTemplates)}
                </div>
              );
            }
            return null;
          })()}
        </div>
      ) : (
        <div className="pr-4">
          {renderTemplateList(false)}
        </div>
      )}
    </ScrollArea>
    {renderAddTypeDialog()}
  </div>
);

  return (
    <>
      <Button variant="outline" size="sm" onClick={openDialog}>
        <FilePenLine className="mr-2 h-4 w-4" /> Templates
      </Button>

      <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setIsEditing(false); setCurrentTemplateId(null); } }}>
        <SheetContent side="right" className="overflow-y-auto w-full max-w-[90vw] sm:max-w-[600px] md:max-w-[800px]">
        <SheetHeader className="mb-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <SheetTitle>Message Templates</SheetTitle>
      <TutorialButton tutorialId="template-manager" tooltipText="Learn about templates" />
    </div>
  </div>
  <SheetDescription>
    Create and manage your message templates for quick access while messaging students.
  </SheetDescription>
</SheetHeader>

          {notification.message && (
            <div
              className={`p-2 rounded ${
                notification.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {notification.message}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create" className="text-xs sm:text-sm">{isEditing ? 'Edit Template' : 'Create New'}</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs sm:text-sm">Templates</TabsTrigger>
              <TabsTrigger value="archived" className="text-xs sm:text-sm">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="w-full">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Template Name"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Subject (optional)"
                    value={newTemplate.subject}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, subject: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTemplateTypeSelect()}
                  <Select
                    value={newTemplate.color}
                    onValueChange={(value) =>
                      setNewTemplate({ ...newTemplate, color: value })
                    }
                  >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-sm font-medium">Message</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-xs sm:text-sm">
                          <PlusCircle className="h-4 w-4 mr-1 sm:mr-2" />
                          Insert Field
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2">
                        <div className="space-y-1">
                          {PLACEHOLDERS.map((placeholder) => (
                            <Button
                              key={placeholder.id}
                              variant="ghost"
                              className="w-full justify-start text-sm"
                              onClick={() => insertPlaceholder(placeholder)}
                            >
                              {placeholder.label}
                              <span className="ml-auto text-xs text-gray-500">
                                {placeholder.token}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="relative quill-container">
  <div className="h-[40vh] min-h-[250px] max-h-[400px] overflow-hidden">
    <div className="h-full">
      <ReactQuill
        theme="snow"
        value={newTemplate.content}
        onChange={(content) => {
          setNewTemplate({
            ...newTemplate,
            content
          });
        }}
        modules={modules}
        formats={formats}
        ref={quillRef}
        bounds="body" // Use the full document body
        className="h-[calc(100%-42px)]" // 42px accounts for the toolbar height
      />
    </div>
  </div>
</div>
                </div>

                <Button
                  onClick={handleAddTemplate}
                  disabled={!newTemplate.name || !newTemplate.content || !newTemplate.color || !selectedType}
                  className="w-full mt-4"
                >
                  <Save className="mr-1 sm:mr-2 h-4 w-4" /> {isEditing ? 'Update Template' : 'Save Template'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="w-full">
              {renderTemplatesTab()}
            </TabsContent>

            <TabsContent value="archived" className="w-full">
              {renderTemplateList(true)}
            </TabsContent>
          </Tabs>

          {/* Preview Dialog */}
          {previewTemplate && (
            <AlertDialog open={true} onOpenChange={() => setPreviewTemplate(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{previewTemplate.name}</AlertDialogTitle>
                </AlertDialogHeader>
                {previewTemplate.subject && (
                  <div className="font-medium mb-2">
                    Subject: {previewTemplate.subject}
                  </div>
                )}
                {(() => {
                  // Use our helper function instead of creating a Quill instance
                  return (
                    <div
                      className="ql-editor"
                      dangerouslySetInnerHTML={{
                        __html: getTemplateContent(previewTemplate)
                      }}
                    />
                  );
                })()}
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setPreviewTemplate(null)}>
                    Close
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

export default TemplateManager;
