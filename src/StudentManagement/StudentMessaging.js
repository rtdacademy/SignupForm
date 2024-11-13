import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, push, serverTimestamp, onValue, off } from 'firebase/database';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { MessageSquare, Send, Save, X, Loader2 } from 'lucide-react';
import { toast, Toaster } from "sonner";
import { useAuth } from '../context/AuthContext';

const StudentMessaging = ({ selectedStudents, onClose }) => {
  const [messageTemplate, setMessageTemplate] = useState('');
  const [templates, setTemplates] = useState([]);
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [ccParent, setCcParent] = useState(false);
  const totalSelected = selectedStudents.length;

  const { currentUser } = useAuth();
  const functions = getFunctions();
  const database = getDatabase();
  const sendBulkEmails = httpsCallable(functions, 'sendBulkEmails');

  // ReactQuill configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
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

  // Load message templates
  useEffect(() => {
    const templatesRef = ref(database, 'messageTemplates');
    
    const handleTemplates = (snapshot) => {
      if (snapshot.exists()) {
        const templatesData = snapshot.val();
        const templatesArray = Object.entries(templatesData).map(([id, data]) => ({
          id,
          ...data
        }));
        setTemplates(templatesArray);
      }
      setIsLoadingTemplates(false);
    };

    onValue(templatesRef, handleTemplates);

    return () => {
      off(templatesRef, 'value', handleTemplates);
    };
  }, [database]);

  // Handle template selection
  const handleTemplateChange = (templateId) => {
    setMessageTemplate(templateId);
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setSubject(selectedTemplate.subject || '');
      setMessageContent(selectedTemplate.content || '');
    }
  };

  const handleTemplateSave = async () => {
    if (!subject.trim() || !messageContent.trim()) {
      toast.error("Please enter both subject and message content");
      return;
    }

    try {
      const messageTemplatesRef = ref(database, 'messageTemplates');
      await push(messageTemplatesRef, {
        subject,
        content: messageContent,
        createdAt: serverTimestamp(),
        createdBy: currentUser.email,
        name: subject
      });
      
      toast.success("Template saved successfully");
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error("Failed to save template");
    }
  };

  const handlePreview = () => {
    toast(
      <div className="max-h-[300px] overflow-auto">
        <h3 className="font-bold">{subject}</h3>
        <div dangerouslySetInnerHTML={{ __html: messageContent }} />
      </div>,
      {
        duration: 5000,
      }
    );
  };

  const handleSend = async () => {
    if (!messageContent.trim() || !subject.trim()) {
      toast.error("Please enter both subject and message content");
      return;
    }

    setIsSending(true);

    try {
      // Prepare recipients array for bulk email
      const recipients = selectedStudents.map(student => ({
        to: student.StudentEmail,
        subject: subject,
        text: messageContent.replace(/<[^>]*>/g, ''),
        html: messageContent,
        ccParent // Include ccParent flag for each recipient
      }));

      // Send bulk emails
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
            <h3 className="text-sm font-medium mb-2">Recipients</h3>
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white px-2 py-1 rounded-full text-xs border"
                >
                  {student.firstName} {student.lastName}
                </div>
              ))}
            </div>
          </div>

          {/* Message Template Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Template</label>
            <Select value={messageTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingTemplates ? "Loading templates..." : "Select a template"} />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name || template.subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <div className="min-h-[200px] border rounded-md">
              <ReactQuill
                theme="snow"
                value={messageContent}
                onChange={setMessageContent}
                modules={modules}
                formats={formats}
                className="h-[150px]"
              />
            </div>
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
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleTemplateSave}
                disabled={!subject.trim() || !messageContent.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePreview}
                disabled={!subject.trim() || !messageContent.trim()}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Preview
              </Button>
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