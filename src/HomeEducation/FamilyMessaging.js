import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off, set, push, serverTimestamp } from 'firebase/database';
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
  Send, 
  Save, 
  Loader2, 
  PlusCircle, 
  ListPlus, 
  Grid2X2 as Grid2X2Icon,
  Circle as CircleIcon,
  Users,
  Mail,
  AlertCircle,
  ChevronDown,
  X
} from 'lucide-react';
import { toast } from "sonner";
import { useAuth } from '../context/AuthContext';
import FamilyEmailRecipientSelector from './FamilyEmailRecipientSelector';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { sanitizeEmail } from '../utils/sanitizeEmail';

const database = getDatabase();

const PLACEHOLDERS = [
  { id: 'firstName', label: 'First Name', token: '[firstName]' },
  { id: 'lastName', label: 'Last Name', token: '[lastName]' },
  { id: 'phone', label: 'Phone', token: '[phone]' },
];

// Confirmation Dialog for No Primary Guardian
const NoPrimaryGuardianDialog = ({ open, onOpenChange, familiesWithoutPrimary }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Families Without Primary Guardian
          </DialogTitle>
          <DialogDescription>
            The following families do not have a primary guardian designated. 
            The first guardian in their list will be used as the recipient.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {familiesWithoutPrimary.map((family) => (
            <div key={family.familyId} className="text-sm border rounded p-2">
              <div className="font-medium">Family {family.familyId.slice(-8)}</div>
              <div className="text-gray-500">
                Using: {family.fallbackGuardian.name} ({family.fallbackGuardian.email})
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const FamilyMessaging = ({ 
  selectedFamilies,
  families,
  onClose
}) => {
  const [subject, setSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [quillRef, setQuillRef] = useState(null);
  const [teacherMessages, setTeacherMessages] = useState({});
  const [teacherNames, setTeacherNames] = useState({});
  const [signature, setSignature] = useState('');
  const [isEditingSignature, setIsEditingSignature] = useState(false);
  const [useDoNotReply, setUseDoNotReply] = useState(false);
  const [showCcOptions, setShowCcOptions] = useState(false);
  const [ccRecipients, setCcRecipients] = useState({});
  const [showNoPrimaryDialog, setShowNoPrimaryDialog] = useState(false);
  const [familiesWithoutPrimary, setFamiliesWithoutPrimary] = useState([]);
  const [preparedRecipients, setPreparedRecipients] = useState(null);

  const { currentUser, user_email_key } = useAuth();
  const functions = getFunctions();
  const sendFamilyEmails = httpsCallable(functions, 'sendFamilyEmailsV2');

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
        setTeacherMessages(snapshot.val());
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
  }, []);

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

  // Save signature
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

  // Template selection
  const handleTemplateSelect = (template) => {
    if (!quillRef) return;

    const editor = quillRef.getEditor();

    if (template.subject) {
      setSubject(template.subject);
    }

    if (template.content) {
      editor.setContents(template.content);
    }

    // Update last used timestamp
    if (template.teacherKey && template.id) {
      const templateRef = ref(database, `teacherMessages/${template.teacherKey}/${template.id}/lastUsed`);
      set(templateRef, serverTimestamp());
    }
  };

  // Insert placeholder
  const insertPlaceholder = (placeholder) => {
    if (!quillRef) return;

    const editor = quillRef.getEditor();
    const range = editor.getSelection(true);
    const position = range ? range.index : editor.getLength();

    editor.insertText(position, placeholder.token);
    editor.setSelection(position + placeholder.token.length);
  };

  // Replace placeholders in content
  const replacePlaceholders = (content, familyData) => {
    let processedContent = content;
    
    // Get primary guardian or first guardian
    const guardians = familyData.guardians ? Object.values(familyData.guardians) : [];
    const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
    
    // Replace placeholders with primary guardian's information
    if (primaryGuardian) {
      processedContent = processedContent.replace(/\[firstName\]/g, primaryGuardian.firstName || '');
      processedContent = processedContent.replace(/\[lastName\]/g, primaryGuardian.lastName || '');
      processedContent = processedContent.replace(/\[phone\]/g, primaryGuardian.phone || '');
    } else {
      // If no primary guardian, clear the placeholders
      processedContent = processedContent.replace(/\[firstName\]/g, '');
      processedContent = processedContent.replace(/\[lastName\]/g, '');
      processedContent = processedContent.replace(/\[phone\]/g, '');
    }
    
    return processedContent;
  };

  // Prepare recipients for sending
  const prepareRecipients = () => {
    const recipients = [];
    const familiesWithoutPrimaryList = [];

    selectedFamilies.forEach(familyId => {
      const family = families[familyId];
      if (!family) return;

      // Get guardians
      const guardians = family.guardians ? Object.values(family.guardians) : [];
      const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian');
      const fallbackGuardian = guardians[0];

      if (!primaryGuardian && fallbackGuardian) {
        familiesWithoutPrimaryList.push({
          familyId,
          fallbackGuardian: {
            ...fallbackGuardian,
            name: `${fallbackGuardian.firstName} ${fallbackGuardian.lastName}`
          }
        });
      }

      const mainGuardian = primaryGuardian || fallbackGuardian;
      if (!mainGuardian || !mainGuardian.email) return;

      // Get CC recipients for this family
      const familyCcEmails = [];
      const familyCcRecipients = ccRecipients[familyId] || {};

      // Add selected additional guardians
      if (familyCcRecipients.guardians) {
        Object.entries(familyCcRecipients.guardians).forEach(([email, selected]) => {
          if (selected && email !== mainGuardian.email) {
            familyCcEmails.push(email);
          }
        });
      }

      // Add selected students
      if (familyCcRecipients.students) {
        Object.entries(familyCcRecipients.students).forEach(([email, selected]) => {
          if (selected) {
            familyCcEmails.push(email);
          }
        });
      }

      // Create recipient object
      const familyData = {
        ...family,
        familyId
      };

      recipients.push({
        to: mainGuardian.email,
        cc: familyCcEmails.length > 0 ? familyCcEmails : undefined,
        subject: replacePlaceholders(subject, familyData),
        text: replacePlaceholders(messageContent + (signature ? signature : ''), familyData).replace(/<[^>]*>/g, ''),
        html: replacePlaceholders(messageContent + (signature ? signature : ''), familyData),
        useDoNotReply,
        // Add metadata for tracking
        familyId,
        guardianName: `${mainGuardian.firstName} ${mainGuardian.lastName}`
      });
    });

    return { recipients, familiesWithoutPrimaryList };
  };

  // Send emails
  const sendEmails = async (recipientsToSend) => {
    setIsSending(true);

    try {
      const result = await sendFamilyEmails({ recipients: recipientsToSend });

      if (result.data.success) {
        if (result.data.successfulCount > 0) {
          toast.success(`Successfully sent ${result.data.successfulCount} emails`);
        }

        if (result.data.failedEmails?.length > 0) {
          const failureGroups = result.data.failedEmails.reduce((acc, failure) => {
            const key = failure.message;
            if (!acc[key]) acc[key] = [];
            acc[key].push(failure.recipient);
            return acc;
          }, {});

          Object.entries(failureGroups).forEach(([error, recipients]) => {
            toast.error(
              <div className="space-y-2">
                <p className="font-semibold">{error}</p>
                <div className="text-sm max-h-32 overflow-y-auto">
                  {recipients.slice(0, 3).map((recipient, i) => (
                    <div key={i} className="text-xs">{recipient}</div>
                  ))}
                  {recipients.length > 3 && (
                    <p className="text-xs text-gray-500">
                      ... and {recipients.length - 3} more
                    </p>
                  )}
                </div>
              </div>,
              { duration: 10000 }
            );
          });
        }

        if (result.data.failedCount === 0) {
          onClose();
        }
      } else {
        throw new Error(result.data.message || 'Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error(`Failed to send messages: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Handle send button click
  const handleSend = async () => {
    if (!messageContent.trim() || !subject.trim()) {
      toast.error("Please enter both subject and message content");
      return;
    }

    const { recipients, familiesWithoutPrimaryList } = prepareRecipients();

    if (recipients.length === 0) {
      toast.error("No valid recipients found");
      return;
    }

    // Check for families without primary guardian
    if (familiesWithoutPrimaryList.length > 0) {
      setFamiliesWithoutPrimary(familiesWithoutPrimaryList);
      setPreparedRecipients(recipients);
      setShowNoPrimaryDialog(true);
      return;
    }

    await sendEmails(recipients);
  };

  // Continue send after warning dialog
  const continueSendAfterWarning = async () => {
    setShowNoPrimaryDialog(false);
    if (preparedRecipients) {
      await sendEmails(preparedRecipients);
    }
  };

  // Group families for display
  const groupedFamilies = Array.from(selectedFamilies).map(familyId => {
    const family = families[familyId];
    if (!family) return null;

    const guardians = family.guardians ? Object.values(family.guardians) : [];
    const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
    const students = family.students ? Object.values(family.students) : [];

    return {
      familyId,
      primaryGuardian: primaryGuardian ? {
        ...primaryGuardian,
        name: `${primaryGuardian.firstName} ${primaryGuardian.lastName}`
      } : null,
      guardianCount: guardians.length,
      studentCount: students.length,
      students: students.map(s => `${s.firstName} ${s.lastName}`).join(', ')
    };
  }).filter(Boolean);

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <h2 className="text-lg font-semibold">
              Email Families ({selectedFamilies.size})
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Recipients Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4" />
              <h3 className="text-sm font-medium">Recipients</h3>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                Sending to primary guardian of each family
              </div>
              <div className="flex flex-wrap gap-2">
                {groupedFamilies.slice(0, 5).map((family) => (
                  <div
                    key={family.familyId}
                    className="bg-white px-3 py-1.5 rounded-full text-xs border"
                  >
                    {family.primaryGuardian?.name || 'No primary guardian'}
                  </div>
                ))}
                {groupedFamilies.length > 5 && (
                  <div className="px-3 py-1.5 text-xs text-gray-500">
                    ... and {groupedFamilies.length - 5} more
                  </div>
                )}
              </div>
              {Object.values(ccRecipients).some(family => 
                Object.values(family.guardians || {}).some(v => v) ||
                Object.values(family.students || {}).some(v => v)
              ) && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  CC options have been selected
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ListPlus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" side="right">
                {/* By Staff templates */}
                {Object.entries(teacherMessages).length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Users className="h-4 w-4 mr-2" />
                      By Staff
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                      {Object.entries(teacherMessages).map(([teacherKey, templates]) => (
                        <DropdownMenuSub key={teacherKey}>
                          <DropdownMenuSubTrigger>
                            {teacherNames[teacherKey] || teacherKey}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                            {Object.entries(templates)
                              .filter(([_, template]) => !template.archived)
                              .map(([id, template]) => (
                                <DropdownMenuItem
                                  key={id}
                                  onClick={() => handleTemplateSelect({ ...template, id, teacherKey })}
                                >
                                  {template.name}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}
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

          {/* Message Input */}
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
                dangerouslySetInnerHTML={{ __html: signature || '<p>No signature set</p>' }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <Button
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
                Send Emails
              </>
            )}
          </Button>
        </div>
      </div>

      {/* CC Options Dialog */}
      <FamilyEmailRecipientSelector
        open={showCcOptions}
        onOpenChange={setShowCcOptions}
        families={selectedFamilies}
        familiesData={families}
        ccRecipients={ccRecipients}
        onCcRecipientsChange={setCcRecipients}
      />

      {/* No Primary Guardian Warning Dialog */}
      <NoPrimaryGuardianDialog
        open={showNoPrimaryDialog}
        onOpenChange={(open) => {
          setShowNoPrimaryDialog(open);
          if (open) {
            continueSendAfterWarning();
          }
        }}
        familiesWithoutPrimary={familiesWithoutPrimary}
      />
    </>
  );
};

export default FamilyMessaging;