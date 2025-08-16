import React, { useState, useEffect, useRef } from 'react';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off
} from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import {
  Edit2,
  Trash2,
  Mail,
  ChevronDown,
  ChevronUp,
  Star,
  // Icons for statuses
  CheckCircle2,
  Eye,
  XCircle,
  AlertCircle,
  Clock,
  Ban,
  Circle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useStaffClaims } from '../customClaims/useStaffClaims';


/**
 * Tailwind badge classes based on the email status.
 * Used for the expanded "Recipients Status" display.
 */
function getStatusBadgeClasses(status) {
  const statusColors = {
    processed: 'bg-yellow-100 text-yellow-800',
    delivered: 'bg-blue-100 text-blue-800',
    opened: 'bg-green-100 text-green-800',
    bounce: 'bg-red-100 text-red-800',
    dropped: 'bg-red-100 text-red-800',
    deferred: 'bg-yellow-100 text-yellow-800',
    spamreport: 'bg-red-100 text-red-800',
    unsubscribe: 'bg-yellow-100 text-yellow-800',
    group_unsubscribe: 'bg-yellow-100 text-yellow-800',
    group_resubscribe: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800'
  };

  return `inline-block px-2 py-1 text-xs font-semibold rounded ${
    statusColors[status] || statusColors.default
  }`;
}

/**
 * Returns a Lucide icon component corresponding to each status.
 */
function getStatusIcon(status) {
  switch (status) {
    case 'processed':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'delivered':
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    case 'opened':
      return <Eye className="h-4 w-4 text-green-600" />;
    case 'bounce':
    case 'dropped':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'deferred':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'spamreport':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    case 'unsubscribe':
    case 'group_unsubscribe':
      return <Ban className="h-4 w-4 text-yellow-600" />;
    case 'group_resubscribe':
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    default:
      // Default/fallback icon
      return <Circle className="h-4 w-4 text-gray-600" />;
  }
}

/**
 * Formats a numeric timestamp (in seconds) into a friendly string,
 * including day of the week, e.g. "Thursday, June 21, 2025, 2:16 PM"
 */
function formatRecipientTimestamp(timestampInSeconds) {
  // Multiply by 1000 to convert seconds => milliseconds
  const date = new Date(timestampInSeconds * 1000);
  return date.toLocaleString('en-US', {
    weekday: 'long',   // e.g. "Thursday"
    year: 'numeric',   // e.g. "2025"
    month: 'long',     // e.g. "June"
    day: 'numeric',    // e.g. "21"
    hour: 'numeric',   // e.g. "2 PM"
    minute: 'numeric'  // e.g. "16"
  });
}

/**
 * Truncates long continuous strings (like URLs) to prevent layout breaking
 * Preserves normal words and only truncates very long continuous strings
 */
function truncateLongWords(text, maxLength = 50) {
  if (!text) return text;
  
  // Split by spaces and newlines to preserve structure
  const lines = text.split('\n');
  
  return lines.map(line => {
    // Process each word in the line
    return line.split(' ').map(word => {
      // Only truncate if it's a very long continuous string (likely a URL)
      if (word.length > maxLength) {
        // Keep first 40 chars and add ellipsis
        return word.substring(0, 40) + '...';
      }
      return word;
    }).join(' ');
  }).join('\n');
}

/**
 * Formats standard note timestamps (ISO strings) into a compact friendly date/time.
 */
function formatTimestamp(timestamp) {
  // Handle any "Legacy Note" scenario
  if (timestamp === 'Legacy Note') return timestamp;

  // Check if the timestamp is a numeric string (milliseconds timestamp)
  if (/^\d+$/.test(timestamp)) {
    timestamp = parseInt(timestamp);
  }

  // For standard notes
  const date = new Date(timestamp);
  
  // Get day of week (3 letters)
  const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
  
  // Get month (3 letters)
  const month = date.toLocaleString('en-US', { month: 'short' });
  
  // Get day and year
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(2); // Just the last 2 digits
  
  // Get time
  const time = date.toLocaleString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  // Format: "Mon, Mar 3/25 at 10:59 AM"
  return `${dayOfWeek}, ${month} ${day}/${year} at ${time}`;
}

/**
 * StudentNotes Component
 *
 * Props:
 * - studentEmail (string): Student's email address
 * - studentName (string): Student's display name
 * - courseId (string|number): Course ID
 * - initialNotes (array): Array of existing notes
 * - onNotesUpdate (function): Callback when notes are updated
 * - showAddButton (boolean): Whether to show "Add Note" button
 * - allowEdit (boolean): Whether to allow editing/deleting notes
 * - singleNoteMode (boolean): If true, only one text area for the first note
 * - isExpanded (boolean): If true, component is rendered in expanded view (sheet)
 */
const StudentNotes = ({
  studentEmail,
  studentName,
  courseId,
  initialNotes = [],
  onNotesUpdate,
  showAddButton = true,
  allowEdit = true,
  singleNoteMode = false,
  isExpanded = false,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteIsImportant, setNewNoteIsImportant] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // For expanding/collapsing the actual email HTML/text
  const [expandedEmails, setExpandedEmails] = useState({});
  const [emailContents, setEmailContents] = useState({});

  // Store the tracking data from /sendGridTracking/{emailId} in real time
  const [emailTracking, setEmailTracking] = useState({});

  // Get user preferences
  const { preferences } = useUserPreferences();

  const { user } = useAuth();
  
  // Get staff claims to check admin privileges
  const { isAdmin } = useStaffClaims({ readOnly: true });
  const hasAdminPrivileges = isAdmin();

  // A ref to store unsubscribes for each emailId so we don't attach multiple listeners
  const unsubscribeMapRef = useRef({});
  const containerRef = useRef(null);


  // --------------------------------------------------------------------------
  // Load initial notes, handle single-note mode
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Ensure all notes have the isImportant property
    const notesWithImportant = initialNotes.map(note => ({
      ...note,
      isImportant: note.isImportant || false
    }));
    
    setNotes(notesWithImportant);
    if (singleNoteMode && notesWithImportant.length > 0) {
      setNewNoteContent(notesWithImportant[0].content);
      setNewNoteIsImportant(notesWithImportant[0].isImportant || false);
    }
  }, [initialNotes, singleNoteMode]);

  // --------------------------------------------------------------------------
  // Realtime Listeners for /sendGridTracking/{emailId}
  // --------------------------------------------------------------------------
  useEffect(() => {
    const db = getDatabase();

    // For each note, if it's an email note, attach an onValue listener
    notes.forEach((note) => {
      if (note.metadata?.type === 'email' && note.metadata?.emailId) {
        const eId = note.metadata.emailId;

        // Only attach a listener if we haven't done so yet
        if (!unsubscribeMapRef.current[eId]) {
          const trackingRef = ref(db, `sendGridTracking/${eId}`);

          const handleValueChange = (snapshot) => {
            if (snapshot.exists()) {
              setEmailTracking((prev) => ({
                ...prev,
                [eId]: snapshot.val()
              }));
            }
          };

          // Attach the listener
          onValue(trackingRef, handleValueChange);

          // Store the unsubscribe function
          unsubscribeMapRef.current[eId] = () => {
            off(trackingRef, 'value', handleValueChange);
          };
        }
      }
    });

    // Cleanup when notes array changes or component unmounts
    return () => {
      // Clean up listeners
      Object.values(unsubscribeMapRef.current).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      unsubscribeMapRef.current = {};
    };
  }, [notes]);

  // --------------------------------------------------------------------------
  // Update the notes array in the Realtime Database
  // --------------------------------------------------------------------------
  const updateStudentNotesInDatabase = async (updatedNotes) => {
    if (!courseId) {
      console.error('Course ID is missing');
      return;
    }
    const db = getDatabase();
    const notesRef = ref(
      db,
      `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/jsonStudentNotes`
    );
    try {
      await set(notesRef, updatedNotes);
      if (onNotesUpdate) {
        onNotesUpdate(updatedNotes);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  // --------------------------------------------------------------------------
  // Note Add/Edit/Delete
  // --------------------------------------------------------------------------
  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      content: newNoteContent.trim(),
      timestamp: new Date().toISOString(),
      author: user.displayName || user.email,
      noteType: '📝',
      isImportant: newNoteIsImportant
    };

    // Fetch current notes
    const db = getDatabase();
    const notesRef = ref(
      db,
      `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/jsonStudentNotes`
    );
    const snapshot = await get(notesRef);
    const currentNotes = snapshot.val() || [];

    // Ensure all notes have the isImportant property
    const notesWithImportant = currentNotes.map(note => ({
      ...note,
      isImportant: note.isImportant || false
    }));

    const mergedNotes = [newNote, ...notesWithImportant];
    await updateStudentNotesInDatabase(mergedNotes);

    setNotes(mergedNotes);
    setNewNoteContent('');
    setNewNoteIsImportant(false);
  };

  const handleEditNote = async (noteId, updatedContent, isImportant) => {
    const updatedNotes = notes.map((note) =>
      note.id === noteId 
        ? { 
            ...note, 
            content: updatedContent, 
            isImportant: isImportant,
            lastEditedBy: user.displayName || user.email,
            lastEditedAt: new Date().toISOString()
          } 
        : note
    );

    await updateStudentNotesInDatabase(updatedNotes);
    setNotes(updatedNotes);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    await updateStudentNotesInDatabase(updatedNotes);

    setNotes(updatedNotes);
    setIsDeleteDialogOpen(false);
  };

  const handleNoteContentChange = (content) => {
    setNewNoteContent(content);
    if (singleNoteMode && onNotesUpdate && notes.length > 0) {
      onNotesUpdate([{ ...notes[0], content, isImportant: newNoteIsImportant }]);
    }
  };

  // --------------------------------------------------------------------------
  // Toggle Email Content
  // --------------------------------------------------------------------------
  const toggleEmailView = async (noteId, emailId) => {
    setExpandedEmails((prev) => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));

    // Fetch the email body from /userEmails if not already loaded
    if (!emailContents[emailId] && !expandedEmails[noteId]) {
      const db = getDatabase();
      const emailRef = ref(db, `userEmails/${sanitizeEmail(studentEmail)}/${emailId}`);
      try {
        const snapshot = await get(emailRef);
        if (snapshot.exists()) {
          setEmailContents((prev) => ({
            ...prev,
            [emailId]: snapshot.val()
          }));
        }
      } catch (error) {
        console.error('Error fetching email:', error);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Toggle Important Status
  // --------------------------------------------------------------------------
  const toggleImportantStatus = async (note) => {
    const updatedNotes = notes.map((n) =>
      n.id === note.id ? { ...n, isImportant: !n.isImportant } : n
    );

    await updateStudentNotesInDatabase(updatedNotes);
    setNotes(updatedNotes);
  };

  // --------------------------------------------------------------------------
  // Renders Email Body
  // --------------------------------------------------------------------------
  const renderEmailContent = (note) => {
    const emailId = note.metadata.emailId;
    const email = emailContents[emailId];
    if (!email) return null;

    return (
      <div className="mt-2 p-3 bg-white rounded border space-y-2 w-full max-w-full overflow-hidden">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            <strong>From:</strong>{' '}
            {email.sentAsNoReply ? (
              <span className="text-amber-600">RTD Academy (Do Not Reply)</span>
            ) : (
              <>
                {email.senderName} ({email.sender})
              </>
            )}
          </div>
          <div 
            className="text-sm font-medium mt-2 break-all max-w-full"
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          >
            {email.subject}
          </div>
        </div>

        <div
          className="text-sm text-gray-700 prose prose-sm max-w-none pt-2 border-t break-all"
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          dangerouslySetInnerHTML={{ __html: email.html || email.text }}
        />

        {email.sentAsNoReply && (
          <div className="mt-4 pt-2 border-t text-sm text-amber-600">
            This was sent as a do-not-reply message. Replies to this email will not be received.
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // Show All Recipients' Statuses (Real-time). Student first, then CC/BCC
  // --------------------------------------------------------------------------
  const renderRecipientsStatus = (note) => {
    const emailId = note.metadata.emailId;
    const trackingData = emailTracking[emailId];
    if (!trackingData) {
      return <div className="mt-2 text-sm text-gray-500">Loading tracking data...</div>;
    }

    const { recipients } = trackingData;
    if (!recipients) {
      return <div className="mt-2 text-sm text-gray-500">No recipient data found.</div>;
    }

    const sanitizedStudentEmail = sanitizeEmail(studentEmail);

    // Student's object
    const studentObj = recipients[sanitizedStudentEmail] || null;

    // Other recipients
    const otherRecipients = Object.entries(recipients).filter(
      ([key]) => key !== sanitizedStudentEmail
    );

    return (
      <div className="mt-2 p-3 border rounded bg-gray-50 text-sm">
        <div className="font-semibold mb-2">Recipients Status:</div>

        {/* 1) Student's own status (with icon + text + friendly date) */}
        {studentObj ? (
          <div className="border p-2 rounded mb-3">
            <div className="text-sm mb-1 font-medium">Student's Own Status</div>
            <div className="text-sm">
              <strong>Recipient:</strong> {studentObj.email}
            </div>
            <div className="text-sm">
              <strong>Status:</strong>{' '}
              <span
                className={`${getStatusBadgeClasses(studentObj.status)} inline-flex items-center space-x-1`}
              >
                {getStatusIcon(studentObj.status)}
                <span>{studentObj.status}</span>
              </span>
            </div>
            {studentObj.timestamp && (
              <div className="text-xs text-gray-500 mt-1">
                Last Updated: {formatRecipientTimestamp(studentObj.timestamp)}
              </div>
            )}
          </div>
        ) : (
          <div className="border p-2 rounded mb-3">
            <em className="text-sm text-gray-500">No direct status for this student.</em>
          </div>
        )}

        {/* 2) Other recipients (CC/BCC) - smaller, more discrete */}
        {otherRecipients.length > 0 && (
          <div className="text-xs text-gray-700 border-t pt-3 mt-3 space-y-2">
            <div className="font-medium text-sm mb-1">CC Recipients</div>
            {otherRecipients.map(([sanitizedRecip, data]) => {
              const { email, status, timestamp } = data;
              return (
                <div key={sanitizedRecip} className="border p-2 rounded bg-white">
                  <div className="text-xs">
                    <strong>Recipient:</strong> {email}
                  </div>
                  <div className="text-xs">
                    <strong>Status:</strong>{' '}
                    <span
                      className={`${getStatusBadgeClasses(status)} inline-flex items-center space-x-1`}
                    >
                      {getStatusIcon(status)}
                      <span>{status}</span>
                    </span>
                  </div>
                  {timestamp && (
                    <div className="text-[11px] text-gray-500 mt-1">
                      Last Updated: {formatRecipientTimestamp(timestamp)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Filter notes based on the active tab
  const filteredNotes = notes.filter(note => {
    if (activeTab === 'important') {
      return note.isImportant;
    }
    return true; // 'all' tab shows everything
  });

  // Get count for the important filter
  const importantNotesCount = notes.filter(note => note.isImportant).length;


  // --------------------------------------------------------------------------
  // Main Render
  // --------------------------------------------------------------------------
  return (
    <div className={`flex flex-col w-full max-w-full ${isExpanded ? 'h-full overflow-hidden' : 'space-y-2'}`} ref={containerRef}>
      {/* Header with student name */}
      {studentName && !singleNoteMode && (
        <div className="mb-3">
          <h3 className="text-lg font-medium text-gray-900">{studentName}</h3>
        </div>
      )}
      
      {/* SINGLE NOTE MODE */}
      {singleNoteMode ? (
        <div className="flex flex-col w-full max-w-full">
          <div className="flex items-center mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNewNoteIsImportant(!newNoteIsImportant)}
              className={`p-0 h-6 w-6 ${newNoteIsImportant ? 'text-yellow-500' : 'text-gray-400'}`}
              title="Mark as important"
            >
              <Star className={`h-4 w-4 ${newNoteIsImportant ? 'fill-yellow-500' : ''}`} />
            </Button>
          </div>
          <Textarea
            value={newNoteContent}
            onChange={(e) => handleNoteContentChange(e.target.value)}
            className="mb-2"
            readOnly={!allowEdit && !hasAdminPrivileges}
          />
        </div>
      ) : (
        <div className={`flex flex-col w-full max-w-full ${isExpanded ? 'h-full' : ''}`}>

          {/* ADD NOTE SECTION */}
          <div className="flex mb-1 space-x-1 items-center flex-shrink-0">
            <Textarea
              placeholder="Add a note..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="text-sm min-h-8"
              size="sm"
            />
            <div className="flex flex-col space-y-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNewNoteIsImportant(!newNoteIsImportant)}
                className={`p-0 h-6 w-6 ${newNoteIsImportant ? 'text-yellow-500' : 'text-gray-400'}`}
                title="Mark as important"
              >
                <Star className={`h-4 w-4 ${newNoteIsImportant ? 'fill-yellow-500' : ''}`} />
              </Button>
              
              {showAddButton && (
                <Button 
                  onClick={handleAddNote} 
                  size="sm" 
                  className="h-6 text-xs px-4 py-0 w-16"
                >
                  Add
                </Button>
              )}
            </div>
          </div>

          {/* FILTER TABS */}
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className={`w-full ${isExpanded ? 'flex flex-col flex-1 overflow-hidden' : ''}`}
          >
            <TabsList className="grid grid-cols-2 mb-2 w-full flex-shrink-0">
              <TabsTrigger value="all" className="flex justify-center items-center">
                All Notes
                <Badge variant="secondary" className="ml-2">{notes.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="important" className="flex justify-center items-center">
                Important
                <Badge variant="secondary" className="ml-2">{importantNotesCount}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* NOTES LIST */}
            <TabsContent 
              value={activeTab} 
              className={`mt-0 ${isExpanded ? 'flex-1 overflow-hidden' : ''}`}
            >
              <ScrollArea 
                className={`${isExpanded ? 'h-[calc(100vh-250px)]' : 'h-[350px]'} w-full`}
              >
                <div className="space-y-2 pb-24 pr-4 w-full">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center text-gray-500 p-2 text-sm">
                      {activeTab === 'important' 
                        ? 'No important notes yet' 
                        : 'No notes found'}
                    </div>
                  ) : (
                    filteredNotes.map((note) => {
                      const isEmailNote = note.metadata?.type === 'email' && note.metadata?.emailId;
                      const noteId = note.id;
                      const emailId = note.metadata?.emailId;
                      const isImportant = note.isImportant || false;

                      // For the dropdown label (only icon, no text)
                      let studentStatusIconOnly = null;
                      if (isEmailNote && emailTracking[emailId]?.recipients) {
                        const stEmail = sanitizeEmail(studentEmail);
                        const studentObj = emailTracking[emailId].recipients[stEmail];
                        if (studentObj && studentObj.status) {
                          studentStatusIconOnly = getStatusIcon(studentObj.status);
                        }
                      }

                      return (
                        <div 
                          key={noteId} 
                          className={`p-2 rounded relative w-full max-w-full ${
                            isImportant 
                              ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                              : 'bg-gray-100'
                          }`}
                        >
                          {/* Compact Header with Important/Controls */}
                          <div className="flex justify-between items-start gap-2 w-full">
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p 
                              className="text-sm font-medium leading-tight break-all max-w-full"
                              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            >
  {note.noteType} - {formatTimestamp(note.timestamp)}{' '}
  {note.author ? `- ${note.author.split('@')[0]}` : ''}
  {note.lastEditedBy && (
    <span className="text-xs text-gray-500 italic">
      {' (edited by ' + note.lastEditedBy.split('@')[0] + ')'}
    </span>
  )}
</p>
                          </div>
                            
                            {/* Controls as a compact row */}
                            <div className="flex space-x-1 flex-shrink-0">
                              {(allowEdit || hasAdminPrivileges) && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => toggleImportantStatus(note)}
                                    className={`p-0 h-6 w-6 ${isImportant ? 'text-yellow-500' : 'text-gray-400'}`}
                                    title={isImportant ? "Unmark as important" : "Mark as important"}
                                  >
                                    <Star className={`h-4 w-4 ${isImportant ? 'fill-yellow-500' : ''}`} />
                                  </Button>
                                  
                                  {noteId !== 'legacy-note' && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingNote({...note, isImportant: isImportant})}
                                        className="p-0 h-6 w-6 text-gray-500"
                                        title="Edit note"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          setNoteToDelete(note);
                                          setIsDeleteDialogOpen(true);
                                        }}
                                        className="p-0 h-6 w-6 text-gray-500"
                                        title="Delete note"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Note content */}
                          <p 
                            className="text-sm text-gray-700 whitespace-pre-wrap break-all mt-1 max-w-full"
                            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                            title={note.content} // Show full content on hover
                          >
                            {/* Use truncateLongWords if CSS word-break doesn't work: {truncateLongWords(note.content)} */}
                            {note.content}
                          </p>

                          {/* Email-related controls/content */}
                          {isEmailNote && (
                            <>
                              {/* Compact email button */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-1 py-0 h-6 text-xs flex items-center"
                                onClick={() => toggleEmailView(noteId, emailId)}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                {expandedEmails[noteId] ? (
                                  <>
                                    Hide
                                    {studentStatusIconOnly && (
                                      <span className="ml-1">{studentStatusIconOnly}</span>
                                    )}
                                    <ChevronUp className="h-3 w-3 ml-1" />
                                  </>
                                ) : (
                                  <>
                                    View
                                    {studentStatusIconOnly && (
                                      <span className="ml-1">{studentStatusIconOnly}</span>
                                    )}
                                    <ChevronDown className="h-3 w-3 ml-1" />
                                  </>
                                )}
                              </Button>

                              {/* Render email content + recipients' status if expanded */}
                              {expandedEmails[noteId] && (
                                <>
                                  {renderEmailContent(note)}
                                  {renderRecipientsStatus(note)}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}


      {/* Edit Note Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="flex items-center mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingNote({
                  ...editingNote, 
                  isImportant: !editingNote.isImportant
                })}
                className={`p-1 ${editingNote.isImportant ? 'text-yellow-500' : 'text-gray-400'}`}
              >
                <Star className={`h-4 w-4 ${editingNote.isImportant ? 'fill-yellow-500' : ''}`} />
              </Button>
              <span className="text-sm ml-1">Mark as important</span>
            </div>
            <Textarea
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleEditNote(
                  editingNote.id, 
                  editingNote.content, 
                  editingNote.isImportant
                )}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Note Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={() => setIsDeleteDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this note?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => noteToDelete && handleDeleteNote(noteToDelete.id)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentNotes;