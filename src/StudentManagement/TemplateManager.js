import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
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
import { FilePenLine, PlusCircle, Archive, Trash2, RotateCcw, Eye, Save, Pencil } from 'lucide-react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';

const PLACEHOLDERS = [
  { id: 'firstName', label: 'First Name', token: '[firstName]' },
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
  'bullet',
  'indent',
  'link'
];

function TemplateManager({ onMessageChange = () => {}, initialTemplate = null }) {
  const [templates, setTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    color: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const quillRef = useRef(null);

  const { user_email_key } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

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

  const openDialog = () => {
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      color: ''
    });
    setActiveTab('create');
    setIsOpen(true);
    setIsEditing(false);
    setCurrentTemplateId(null);
  };

  const handleAddTemplate = async () => {
    if (!quillRef.current || !newTemplate.name || !newTemplate.color || !user_email_key)
      return;

    const editor = quillRef.current.getEditor();
    const deltaContent = editor.getContents();

    const db = getDatabase();

    try {
      if (isEditing && currentTemplateId) {
        // Update existing template
        const templateRef = ref(db, `teacherMessages/${user_email_key}/${currentTemplateId}`);
        await update(templateRef, {
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: deltaContent,
          color: newTemplate.color,
          lastModified: new Date().toISOString(),
        });
        showNotification('Template updated successfully');
      } else {
        // Add new template
        const templateId = Date.now().toString();
        const templateRef = ref(db, `teacherMessages/${user_email_key}/${templateId}`);
        await set(templateRef, {
          name: newTemplate.name,
          subject: newTemplate.subject,
          content: deltaContent,
          color: newTemplate.color,
          archived: false,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        });
        showNotification('Template added successfully');
      }

      setNewTemplate({ name: '', subject: '', content: '', color: '' });
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

    // Create a temporary div and Quill instance just for preview
    const tempDiv = document.createElement('div');
    const quill = new Quill(tempDiv);
    quill.setContents(template.content);
    return quill.getText().substring(0, 100);
  };

  const renderTemplateList = (archived) => (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-4 pr-4">
        {templates
          .filter((template) => template.archived === archived)
          .map((template) => (
            <div key={template.id} className="bg-white p-4 rounded-lg shadow-sm border break-words">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center overflow-hidden">
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: template.color }}
                  />
                  <span className="font-medium truncate">{template.name}</span>
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
                      <TooltipContent>Preview template</TooltipContent>
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
                      <TooltipContent>
                        <p>Edit template</p>
                      </TooltipContent>
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
                        <TooltipContent>
                          <p>Unarchive template</p>
                        </TooltipContent>
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
                        <TooltipContent>
                          <p>Archive template</p>
                        </TooltipContent>
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
                      <TooltipContent>
                        <p>Delete template</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {template.subject && (
                <div className="text-sm text-gray-600 mb-2 break-words">
                  Subject: {template.subject}
                </div>
              )}
              <div className="text-sm text-gray-500 break-words">
                {getTemplatePreview(template)}
              </div>
            </div>
          ))}
      </div>
    </ScrollArea>
  );

  return (
    <>
      <Button variant="outline" size="sm" onClick={openDialog}>
        <FilePenLine className="mr-2 h-4 w-4" /> Templates
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) { setIsEditing(false); setCurrentTemplateId(null); } }}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Message Templates</DialogTitle>
            <DialogDescription>
              Create and manage your message templates for quick access while messaging students.
            </DialogDescription>
          </DialogHeader>

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
              <TabsTrigger value="create">{isEditing ? 'Edit Template' : 'Create New'}</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="w-full">
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Message</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <PlusCircle className="h-4 w-4 mr-2" />
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
                  <div className="min-h-[200px]">
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
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddTemplate}
                  disabled={!newTemplate.name || !newTemplate.content || !newTemplate.color}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" /> {isEditing ? 'Update Template' : 'Save Template'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="w-full">
              {renderTemplateList(false)}
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
                  // Create a temporary div and Quill instance for preview
                  const tempDiv = document.createElement('div');
                  const quill = new Quill(tempDiv);
                  quill.setContents(previewTemplate.content);
                  return (
                    <div
                      className="ql-editor"
                      dangerouslySetInnerHTML={{
                        __html: tempDiv.querySelector('.ql-editor').innerHTML
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
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TemplateManager;
