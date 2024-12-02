import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off, set, push, serverTimestamp } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../components/ui/dropdown-menu";
import { 
  MessageSquare, 
  Send, 
  Save, 
  X, 
  Loader2, 
  PlusCircle, 
  ListPlus,
  Users, 
  Mail 
} from 'lucide-react'; // Added Users and Mail
import { toast, Toaster } from "sonner";
import { useAuth } from '../context/AuthContext';
import TemplateManager from './TemplateManager';
import PlaceholderValidation from './PlaceholderValidation';
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from "../components/ui/tooltip"; // Added Tooltip imports

const database = getDatabase();

const PLACEHOLDERS = [
  { id: 'firstName', label: 'First Name', token: '[firstName]' },
  { id: 'lastName', label: 'Last Name', token: '[lastName]' },
  { id: 'courseName', label: 'Course Name', token: '[courseName]' },
  { id: 'startDate', label: 'Start Date', token: '[startDate]' },
  { id: 'endDate', label: 'End Date', token: '[endDate]' },
  { id: 'status', label: 'Status', token: '[status]' },
  { id: 'studentType', label: 'Student Type', token: '[studentType]' }
];

const StudentMessaging = ({ selectedStudents, onClose }) => {
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [ccParent, setCcParent] = useState(false);
  const [quillRef, setQuillRef] = useState(null);
  const [teacherMessages, setTeacherMessages] = useState({});
  const [teacherNames, setTeacherNames] = useState({});
  const [templateToSave, setTemplateToSave] = useState(null);
  const [signature, setSignature] = useState('');
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const totalSelected = selectedStudents.length;

  const { currentUser, user_email_key } = useAuth();
  const functions = getFunctions();
  const sendBulkEmails = httpsCallable(functions, 'sendBulkEmails');

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
  ];

  // Load teacher messages and names
  useEffect(() => {
    const messagesRef = ref(database, 'teacherMessages');
    const staffRef = ref(database, 'staff');

    const handleMessages = (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        setTeacherMessages(messagesData);
      }
    };

    const handleStaff = (snapshot) => {
      if (snapshot.exists()) {
        const staffData = snapshot.val();
        const names = Object.entries(staffData).reduce((acc, [email, data]) => {
          acc[email] = `${data.firstName} ${data.lastName}`;
          return acc;
        }, {});
        setTeacherNames(names);
      }
    };

    onValue(messagesRef, handleMessages);
    onValue(staffRef, handleStaff);

    return () => {
      off(messagesRef, 'value', handleMessages);
      off(staffRef, 'value', handleStaff);
    };
  }, [database]);

  // Load signature
  useEffect(() => {
    if (!user_email_key) return;

    const signatureRef = ref(database, `staff/${user_email_key}/signature`);

    const handleSignature = (snapshot) => {
      if (snapshot.exists()) {
        setSignature(snapshot.val());
      }
    };

    onValue(signatureRef, handleSignature);

    return () => off(signatureRef, 'value', handleSignature);
  }, [user_email_key]);

  // Function to save signature
  const handleSaveSignature = async () => {
    try {
      const signatureRef = ref(database, `staff/${user_email_key}/signature`);
      await set(signatureRef, signature);
      setIsEditingSignature(false);
      toast.success("Signature saved successfully");
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error("Failed to save signature");
    }
  };

  const handleTemplateSelect = (template) => {
    if (!quillRef) return;
  
    const editor = quillRef.getEditor();
  
    // If there's a subject and the current subject is empty, use the template subject
    if (template.subject && !subject) {
      setSubject(template.subject);
    }
  
    // Get the current selection range
    const range = editor.getSelection(true);
    const position = range ? range.index : editor.getLength();
  
    // Insert the template content at the cursor position
    if (template.content) {
      // Delete any selected text first
      if (range && range.length > 0) {
        editor.deleteText(range.index, range.length);
      }
      
      // Insert the Delta content at the cursor position
      editor.insertText(position, editor.getText()); // Clear existing content
      editor.setContents(template.content);
    }
    
    // Update last used timestamp
    if (template.teacherKey && template.id) {
      const templateRef = ref(database, `teacherMessages/${template.teacherKey}/${template.id}/lastUsed`);
      set(templateRef, serverTimestamp());
    }
  };

  const handleTemplateSave = () => {
    if (!subject.trim() || !messageContent.trim() || !quillRef) {
      toast.error("Please enter both subject and message content");
      return;
    }
  
    const editor = quillRef.getEditor();
    const deltaContent = editor.getContents();
  
    console.log('Setting template to save:', {
      subject: subject,
      content: deltaContent
    });
  
    setTemplateToSave({
      subject: subject,
      content: deltaContent
    });
  };

  const handleTemplateManagerSave = async (template) => {
    try {
      const messageTemplatesRef = ref(database, 'messageTemplates');
      await push(messageTemplatesRef, {
        subject: template.subject,
        content: template.content, // This will now be a Delta object
        createdAt: serverTimestamp(),
        createdBy: currentUser.email,
        name: template.subject
      });
  
      toast.success("Template saved successfully");
      setTemplateToSave(null);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error("Failed to save template");
    }
  };

  const insertPlaceholder = (placeholder) => {
    if (!quillRef) return;

    const editor = quillRef.getEditor();
    const range = editor.getSelection(true);
    const position = range ? range.index : editor.getLength();

    editor.insertText(position, placeholder.token);
    editor.setSelection(position + placeholder.token.length);
  };

  const handlePreview = () => {
    // Assuming we're previewing for the first selected student
    const previewStudent = selectedStudents[0];
    const processedSubject = replacePlaceholders(subject, previewStudent);
    const processedContent = replacePlaceholders(messageContent, previewStudent);

    toast(
      <div className="max-h-[300px] overflow-auto">
        <h3 className="font-bold">{processedSubject}</h3>
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      </div>,
      {
        duration: 5000,
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const replacePlaceholders = (content, student) => {
    let processedContent = content;
    processedContent = processedContent.replace('[firstName]', student.preferredFirstName || student.firstName || '');
    processedContent = processedContent.replace('[lastName]', student.lastName || '');
    processedContent = processedContent.replace('[courseName]', student.Course_Value || '');
    processedContent = processedContent.replace('[startDate]', formatDate(student.ScheduleStartDate) || '');
    processedContent = processedContent.replace('[endDate]', formatDate(student.ScheduleEndDate) || '');
    processedContent = processedContent.replace('[status]', student.Status_Value || '');
    processedContent = processedContent.replace('[studentType]', student.StudentType_Value || '');
    return processedContent;
  };

  // Modified handleSend to include signature
  const handleSend = async () => {
    if (!messageContent.trim() || !subject.trim()) {
      toast.error("Please enter both subject and message content");
      return;
    }

    setIsSending(true);

    try {
      const recipients = selectedStudents.map(student => ({
        to: student.StudentEmail,
        subject: replacePlaceholders(subject, student),
        text: replacePlaceholders(messageContent + (signature ?  signature : ''), student).replace(/<[^>]*>/g, ''),
        html: replacePlaceholders(messageContent + (signature ? signature : ''), student),
        ccParent: ccParent && student.ParentEmail ? true : false,
        parentEmail: student.ParentEmail,
        courseId: student.CourseID,
        courseName: student.Course_Value
      }));

      const result = await sendBulkEmails({ recipients });

      if (result.data.success) {
        toast.success(`Messages sent to ${totalSelected} students${ccParent ? ' (including parent copies)' : ''}`);
        onClose();
      } else {
        throw new Error('Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error("Failed to send messages. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Toaster />
      <Card className="h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Message Students ({totalSelected})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto p-4 space-y-4">
          {/* Recipients Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              <h3 className="text-sm font-medium">Recipients</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map((student) => (
                <TooltipProvider key={student.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className="bg-white px-3 py-1.5 rounded-full text-xs border flex items-center gap-2 cursor-pointer"
                      >
                        <span>{student.firstName} {student.lastName}</span>
                        {student.ParentEmail && (
                          <Mail 
                            className="h-3.5 w-3.5 text-blue-500" 
                          />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 text-xs">
                        <div>Student: {student.StudentEmail}</div>
                        {student.ParentEmail && (
                          <div>Parent: {student.ParentEmail}</div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            {ccParent && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                Parent emails will be CC'd when available
              </div>
            )}
          </div>

          {/* Message Actions */}
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListPlus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {/* Current teacher's templates */}
                {teacherMessages[user_email_key] && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>My Templates</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {Object.entries(teacherMessages[user_email_key])
                        .filter(([_, template]) => !template.archived)
                        .map(([id, template]) => (
                          <DropdownMenuItem
                            key={id}
                            onClick={() => handleTemplateSelect({ ...template, id, teacherKey: user_email_key })}
                          >
                            <div
                              className="w-2 h-2 rounded-full mr-2"
                              style={{ backgroundColor: template.color }}
                            />
                            {template.name}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                {/* Other teachers' templates */}
                {Object.entries(teacherMessages)
                  .filter(([key]) => key !== user_email_key)
                  .map(([teacherKey, templates]) => (
                    <DropdownMenuSub key={teacherKey}>
                      <DropdownMenuSubTrigger>
                        {teacherNames[teacherKey] || teacherKey}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {Object.entries(templates)
                          .filter(([_, template]) => !template.archived)
                          .map(([id, template]) => (
                            <DropdownMenuItem
                              key={id}
                              onClick={() => handleTemplateSelect({ ...template, id, teacherKey })}
                            >
                              <div
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: template.color }}
                              />
                              {template.name}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Subject Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message Input with Insert Placeholder */}
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
            <div className="min-h-[200px] border rounded-md">
              <ReactQuill
                theme="snow"
                value={messageContent}
                onChange={setMessageContent}
                modules={modules}
                formats={formats}
                className="h-[150px]"
                ref={(el) => {
                  if (el) {
                    setQuillRef(el);
                  }
                }}
              />
            </div>
          </div>

          {/* Signature Section */}
<div className="space-y-2 border-t pt-4">
  <div className="flex items-center justify-between mb-2">
    <label className="text-sm font-medium">Email Signature</label>
    <div className="flex gap-2">
      {isEditingSignature && (
        <Button size="sm" onClick={handleSaveSignature}>
          <Save className="h-4 w-4 mr-2" />
          Save Signature
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditingSignature(!isEditingSignature)}
      >
        {isEditingSignature ? (
          <>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </>
        ) : (
          <>
            <PlusCircle className="h-4 w-4 mr-2" />
            Edit Signature
          </>
        )}
      </Button>
    </div>
  </div>
  {isEditingSignature ? (
    <ReactQuill
      theme="snow"
      value={signature}
      onChange={setSignature}
      modules={modules}
      formats={formats}
      className="h-[100px]"
    />
  ) : (
    <div 
      className="p-3 bg-gray-50 rounded-md min-h-[50px]"
      dangerouslySetInnerHTML={{ __html: signature }}
    />
  )}
</div>

          {/* CC Parents Option */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="ccParents"
              checked={ccParent}
              onCheckedChange={setCcParent}
            />
            <label
              htmlFor="ccParents"
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              CC Parents (if available)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-2">
              <TemplateManager 
                initialTemplate={templateToSave} 
                onMessageChange={() => setTemplateToSave(null)} 
                onSave={handleTemplateManagerSave}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTemplateSave}
                disabled={!subject.trim() || !messageContent.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
              <PlaceholderValidation 
                students={selectedStudents}
                placeholders={PLACEHOLDERS}
              />
             
            </div>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !messageContent.trim()}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default StudentMessaging;
