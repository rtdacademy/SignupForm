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
  Grid2X2 as Grid2X2Icon,
  Circle as CircleIcon,

   // Template type icons
   Circle, Square, Triangle, BookOpen, GraduationCap, Trophy, Target, 
   ClipboardCheck, Brain, Lightbulb, Clock, Calendar, BarChart, TrendingUp, 
   AlertCircle, HelpCircle, MessageCircle, Users, Presentation, FileText, 
   Bookmark, Mail, Bell, Megaphone, Chat, ListFilterIcon
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
import EmailRecipientSelector from './EmailRecipientSelector';
import { TutorialButton } from '../components/TutorialButton';
import DuplicateEmailDialog from '../components/DuplicateEmailDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

const database = getDatabase();

const PLACEHOLDERS = [
  { id: 'firstName', label: 'Prefered Name', token: '[firstName]' },
  { id: 'lastName', label: 'Last Name', token: '[lastName]' },
  { id: 'courseName', label: 'Course Name', token: '[courseName]' },
  { id: 'startDate', label: 'Start Date', token: '[startDate]' },
  { id: 'endDate', label: 'End Date', token: '[endDate]' },
  { id: 'status', label: 'Status', token: '[status]' },
  { id: 'studentType', label: 'Student Type', token: '[studentType]' }
];

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

// Non-Active Students Confirmation Dialog
const NonActiveStudentsDialog = ({ open, onOpenChange, nonActiveStudents, onContinue }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Non-Active Students Detected
          </DialogTitle>
          <DialogDescription>
            The following students are not marked as Active. Are you sure you want to include them in this email?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {Object.entries(nonActiveStudents).map(([status, students]) => (
            <div key={status} className="border rounded-lg p-3">
              <h4 className="font-medium mb-2 capitalize">{status} Students ({students.length})</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {students.map((student, index) => (
                  <div key={index} className="text-sm flex items-center gap-2">
                    <span className="font-medium">
                      {student.preferredFirstName || student.firstName} {student.lastName}
                    </span>
                    <span className="text-gray-500">- {student.StudentEmail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            onContinue();
            onOpenChange(false);
          }}>
            Continue with Non-Active Students
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StudentMessaging = ({ 
  selectedStudents, 
  onClose,
  onNotification = () => {} 
}) => {
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [quillRef, setQuillRef] = useState(null);
  const [teacherMessages, setTeacherMessages] = useState({});
  const [teacherNames, setTeacherNames] = useState({});
  const [templateToSave, setTemplateToSave] = useState(null);
  const [signature, setSignature] = useState('');
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const totalSelected = selectedStudents.length;
  const [useDoNotReply, setUseDoNotReply] = useState(false);
  const [templateTypes, setTemplateTypes] = useState([]);
  const [showCcOptions, setShowCcOptions] = useState(false); // State for the CC options dialog
  const [ccRecipients, setCcRecipients] = useState({}); // State to store CC recipient selections
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateEmails, setDuplicateEmails] = useState([]);
  const [preparedRecipients, setPreparedRecipients] = useState(null);
  const [showNonActiveDialog, setShowNonActiveDialog] = useState(false);
  const [nonActiveStudents, setNonActiveStudents] = useState({});

  const { currentUser, user_email_key} = useAuth(); 
  const functions = getFunctions();
  const sendBulkEmails = httpsCallable(functions, 'sendBulkEmailsV2');

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

  const sendEmails = async (recipients) => {
    setIsSending(true);
  
    try {
      // Format recipients for the API by only including needed properties
      const formattedRecipients = recipients.map(recipient => {
        // Filter out any CC emails that match the recipient's email
        const filteredCCs = (recipient.originalCCs || [])
          .filter(cc => cc.toLowerCase() !== recipient.to.toLowerCase());
  
        return {
          to: recipient.to,
          subject: recipient.subject,
          text: recipient.text,
          html: recipient.html,
          cc: filteredCCs.length > 0 ? filteredCCs : undefined,
          bcc: recipient.bcc,
          courseId: recipient.courseId,
          courseName: recipient.courseName,
          useDoNotReply: recipient.useDoNotReply
        };
      });
  
      const result = await sendBulkEmails({ recipients: formattedRecipients });

      console.log('API response:', result.data); // For debugging
  
      if (result.data.success) {
        // Handle successful sends
        if (result.data.successfulCount > 0) {
          toast.success(`Successfully sent ${result.data.successfulCount} emails`);
        }
        
        // Handle failures with detailed error display
        if (result.data.failedEmails?.length > 0) {
          // Group failures by error type
          const failureGroups = result.data.failedEmails.reduce((acc, failure) => {
            const key = failure.message;
            if (!acc[key]) acc[key] = [];
            acc[key].push(failure.recipient);
            return acc;
          }, {});
  
          // Display grouped errors
          Object.entries(failureGroups).forEach(([error, recipients]) => {
            toast.error(
              <div className="space-y-2">
                <p className="font-semibold">{error}</p>
                <div className="text-sm max-h-32 overflow-y-auto">
                  {recipients.map((recipient, i) => (
                    <div key={i} className="text-xs">{recipient}</div>
                  ))}
                </div>
                {recipients.length > 3 && (
                  <p className="text-xs text-gray-500">
                    ... and {recipients.length - 3} more
                  </p>
                )}
              </div>,
              {
                duration: 10000,
              }
            );
          });
        }
  
        // Only close if all emails were successful
        if (result.data.failedCount === 0) {
          onClose();
        } else {
          onNotification(
            `${result.data.successfulCount} sent successfully, ${result.data.failedCount} failed. Check the error messages for details.`,
            'warning'
          );
        }
      } else {
        throw new Error(result.data.message || 'Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      
      let errorMessage = "Failed to send messages.";
      
      if (error.details?.failedEmails) {
        const failureCount = error.details.failedEmails.length;
        errorMessage += ` ${failureCount} email${failureCount !== 1 ? 's' : ''} failed.`;
      }
      
      onNotification(errorMessage, 'error');
      
      if (error.details?.failedEmails) {
        error.details.failedEmails.forEach(failure => {
          toast.error(`Failed to send to ${failure.recipient}: ${failure.message}`, {
            duration: 10000,
          });
        });
      }
    } finally {
      setIsSending(false);
    }
  };
  
  const handleSend = async () => {
    if (!messageContent.trim() || !subject.trim()) {
      onNotification("Please enter both subject and message content", 'error');
      return;
    }

    // Check for non-active students
    const categorizedStudents = selectedStudents.reduce((acc, student) => {
      const status = student.ActiveFutureArchived_Value || 'Unknown';
      if (status !== 'Active') {
        if (!acc[status]) acc[status] = [];
        acc[status].push(student);
      }
      return acc;
    }, {});

    if (Object.keys(categorizedStudents).length > 0) {
      setNonActiveStudents(categorizedStudents);
      setShowNonActiveDialog(true);
      return;
    }

    // If all students are active, proceed with the original send logic
    proceedWithSend();
  };

  const proceedWithSend = async () => {
    // First prepare the recipients and check for duplicates
    const recipients = selectedStudents.map(student => {
      const studentEmail = student.StudentEmail?.toLowerCase();
  
      // Get parent/guardian CC emails
      const studentCcEmails = ccRecipients[student.id] || {};
      const parentGuardianCcList = Object.entries(studentCcEmails)
        .filter(([_, checked]) => checked)
        .map(([email]) => email);
  
      // Get staff CC/BCC information if this is a single student
      let staffCcEmails = [];
      let staffBccEmails = [];
      let staffCcInfo = [];
      let staffBccInfo = [];
      
      if (selectedStudents.length === 1 && ccRecipients['staff']) {
        if (ccRecipients['staff'].cc) {
          staffCcInfo = ccRecipients['staff'].cc;
          staffCcEmails = staffCcInfo.map(staff => staff.email);
        }
        if (ccRecipients['staff'].bcc) {
          staffBccInfo = ccRecipients['staff'].bcc;
          staffBccEmails = staffBccInfo.map(staff => staff.email);
        }
      }
  
      // Combine parent/guardian CCs with staff CCs
      const allCcList = [...parentGuardianCcList, ...staffCcEmails];
  
      return {
        studentName: `${student.preferredFirstName || student.firstName} ${student.lastName}`,
        studentEmail: student.StudentEmail,
        to: student.StudentEmail,
        originalCCs: allCcList,
        bcc: staffBccEmails.length > 0 ? staffBccEmails : undefined,
        subject: replacePlaceholders(subject, student),
        text: replacePlaceholders(messageContent + (signature ? signature : ''), student).replace(/<[^>]*>/g, ''),
        html: replacePlaceholders(messageContent + (signature ? signature : ''), student),
        courseId: student.CourseID,
        courseName: student.Course_Value,
        useDoNotReply
      };
    });
  
    // Check for duplicates
    const duplicates = recipients
      .map(recipient => {
        const recipientEmail = recipient.to.toLowerCase();
        const duplicateCCs = (recipient.originalCCs || [])
          .filter(cc => cc.toLowerCase() === recipientEmail);
        
        return duplicateCCs.length > 0 ? {
          studentName: recipient.studentName,
          studentEmail: recipient.studentEmail,
          duplicateCCs
        } : null;
      })
      .filter(Boolean);
  
    console.log('Found duplicates:', duplicates); // For debugging
  
    if (duplicates.length > 0) {
      console.log('Showing duplicate dialog', duplicates); // For debugging
      setPreparedRecipients(recipients);
      setDuplicateEmails(duplicates);
      setShowDuplicateDialog(true);
      return;
    }
  
    // If no duplicates, proceed with send
    await sendEmails(recipients);
  };

  useEffect(() => {
    const db = getDatabase();
    const typesRef = ref(db, 'templateTypes'); // Shared template types path
  
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
      off(typesRef);
    };
  }, []);

  // Group students by status for display
  const groupedStudents = selectedStudents.reduce((acc, student) => {
    const status = student.ActiveFutureArchived_Value || 'Unknown';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(student);
    return acc;
  }, {});

  return (
    <>
      <Card className="w-full h-full flex flex-col overflow-hidden">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">
                Message Students ({totalSelected})
              </CardTitle>
              <TutorialButton tutorialId="student-messaging" tooltipText="Learn about messaging" />
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto p-4 space-y-4">
          {/* Recipients Summary - Updated to group by status */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              <h3 className="text-sm font-medium">Recipients</h3>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedStudents).map(([status, statusStudents]) => (
                <div key={status} className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {status} Students ({statusStudents.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {statusStudents.map((student) => (
                      <TooltipProvider key={student.id}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className={`bg-white px-3 py-1.5 rounded-full text-xs border flex items-center gap-2 cursor-pointer 
                                ${status !== 'Active' ? 'border-yellow-400' : ''}`}
                            >
                              <span>
                                {(student?.preferredFirstName || student?.firstName || '') + ' ' + (student?.lastName || '')}
                              </span>
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
                              <div>Status: {status}</div>
                              {student.ParentEmail && (
                                <div>Parent: {student.ParentEmail}</div>
                              )}
                              {Array.from({ length: 10 }, (_, i) => i + 1).map(i => {
                                const email = student[`guardianEmail${i}`];
                                return (
                                  email && (
                                    <div key={i}>Guardian {i}: {email}</div>
                                  )
                                );
                              })}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {Object.values(ccRecipients).some(cc => Object.values(cc).some(checked => checked)) && (
              <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                CC options have been selected
              </div>
            )}
          </div>

          {/* New Flex Container with Add Template, CC Options, and Do Not Reply */}
          <div className="flex flex-wrap items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListPlus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56" 
                align="start" 
                side="right"
              >
                {/* By Staff option */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Users className="h-4 w-4 mr-2" />
                    By Staff
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent 
                    className="max-h-[300px] overflow-y-auto"
                    alignOffset={-5}
                    side="right"
                  >
                    {/* Current user's templates */}
                    {teacherMessages[user_email_key] && (
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>My Templates</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent 
                          className="max-h-[300px] overflow-y-auto"
                          alignOffset={-5}
                          side="right"
                        >
                          {Object.entries(teacherMessages[user_email_key])
                            .filter(([_, template]) => !template.archived)
                            .map(([id, template]) => (
                              <DropdownMenuItem
                                key={id}
                                onClick={() => handleTemplateSelect({ ...template, id, teacherKey: user_email_key })}
                              >
                                <div className="flex items-center w-full overflow-hidden">
                                  <div
                                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                                    style={{ backgroundColor: template.color }}
                                  />
                                  <span className="truncate">{template.name}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    )}
    
                    {/* Other staff templates */}
                    {Object.entries(teacherMessages)
                      .filter(([key]) => key !== user_email_key)
                      .map(([teacherKey, templates]) => (
                        <DropdownMenuSub key={teacherKey}>
                          <DropdownMenuSubTrigger className="w-full">
                            <div className="truncate">
                              {teacherNames[teacherKey] || teacherKey}
                            </div>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent 
                            className="max-h-[300px] overflow-y-auto"
                            alignOffset={-5}
                            side="right"
                          >
                            {Object.entries(templates)
                              .filter(([_, template]) => !template.archived)
                              .map(([id, template]) => (
                                <DropdownMenuItem
                                  key={id}
                                  onClick={() => handleTemplateSelect({ ...template, id, teacherKey })}
                                >
                                  <div className="flex items-center w-full overflow-hidden">
                                    <div
                                      className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                                      style={{ backgroundColor: template.color }}
                                    />
                                    <span className="truncate">{template.name}</span>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
    
                {/* By Type option */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Grid2X2Icon className="h-4 w-4 mr-2" />
                    By Type
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent 
                    className="max-h-[300px] overflow-y-auto"
                    alignOffset={-5}
                    side="right"
                  >
                    {templateTypes.map((type) => (
                      <DropdownMenuSub key={type.id}>
                        <DropdownMenuSubTrigger className="w-full">
                          <div className="flex items-center overflow-hidden">
                            {React.createElement(
                              iconOptions.find(icon => icon.value === type.icon)?.icon || CircleIcon,
                              { 
                                className: "h-4 w-4 mr-2 flex-shrink-0",
                                style: { color: type.color }
                              }
                            )}
                            <span className="truncate">{type.name}</span>
                          </div>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent 
                          className="max-h-[300px] overflow-y-auto"
                          alignOffset={-5}
                          side="right"
                        >
                          {Object.entries(teacherMessages).flatMap(([teacherKey, templates]) =>
                            Object.entries(templates)
                              .filter(([_, template]) => !template.archived && template.type === type.id)
                              .map(([id, template]) => (
                                <DropdownMenuItem
                                  key={`${teacherKey}-${id}`}
                                  onClick={() => handleTemplateSelect({ ...template, id, teacherKey })}
                                >
                                  <div className="flex items-center w-full overflow-hidden">
                                    <div
                                      className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                                      style={{ backgroundColor: template.color }}
                                    />
                                    <span className="truncate">{template.name}</span>
                                    <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                      ({teacherNames[teacherKey] || teacherKey})
                                    </span>
                                  </div>
                                </DropdownMenuItem>
                              ))
                          )}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ))}
    
                    {/* Uncategorized templates */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <CircleIcon className="h-4 w-4 mr-2" />
                        Uncategorized
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent 
                        className="max-h-[300px] overflow-y-auto"
                        alignOffset={-5}
                        side="right"
                      >
                        {Object.entries(teacherMessages).flatMap(([teacherKey, templates]) =>
                          Object.entries(templates)
                            .filter(([_, template]) => !template.archived && !template.type)
                            .map(([id, template]) => (
                              <DropdownMenuItem
                                key={`${teacherKey}-${id}`}
                                onClick={() => handleTemplateSelect({ ...template, id, teacherKey })}
                              >
                                <div className="flex items-center w-full overflow-hidden">
                                  <div
                                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                                    style={{ backgroundColor: template.color }}
                                  />
                                  <span className="truncate">{template.name}</span>
                                  <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                    ({teacherNames[teacherKey] || teacherKey})
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            ))
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={() => setShowCcOptions(true)}>
              <ListPlus className="h-4 w-4 mr-2" />
              CC Options
            </Button>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="doNotReply"
                checked={useDoNotReply}
                onCheckedChange={setUseDoNotReply}
              />
              <label
                htmlFor="doNotReply"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Send as Do Not Reply
              </label>
            </div>
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
                className="h-full w-full"
                ref={(el) => {
                  if (el) {
                    setQuillRef(el);
                  }
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "250px"
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

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-between items-center pt-4 gap-2">
            <div className="flex flex-wrap gap-2">
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
            <div>
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
          </div>
        </CardContent>
      </Card>
  
      {/* CC Options Dialog */}
      <EmailRecipientSelector
        open={showCcOptions}
        onOpenChange={setShowCcOptions}
        students={selectedStudents}
        ccRecipients={ccRecipients}
        onCcRecipientsChange={setCcRecipients}
      />

      {/* Non-Active Students Dialog */}
      <NonActiveStudentsDialog
        open={showNonActiveDialog}
        onOpenChange={setShowNonActiveDialog}
        nonActiveStudents={nonActiveStudents}
        onContinue={proceedWithSend}
      />

      {/* Duplicate Email Dialog */}
      <DuplicateEmailDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        duplicates={duplicateEmails}
        onContinue={() => {
          if (preparedRecipients) {
            sendEmails(preparedRecipients);
          }
        }}
      />
    </>
  );
};

export default StudentMessaging;