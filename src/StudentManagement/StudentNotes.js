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
 * Formats standard note timestamps (ISO strings) into a friendly date/time.
 * (Different from the SendGrid integer timestamps.)
 */
function formatTimestamp(timestamp) {
  // Handle any "Legacy Note" scenario
  if (timestamp === 'Legacy Note') return timestamp;

  // For standard notes, assume an ISO string, e.g. "2023-06-24T15:52:00.000Z"
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}

/**
 * StudentNotes Component
 *
 * Props:
 * - studentEmail (string): Student's email address
 * - courseId (string|number): Course ID
 * - initialNotes (array): Array of existing notes
 * - onNotesUpdate (function): Callback when notes are updated
 * - showAddButton (boolean): Whether to show "Add Note" button
 * - allowEdit (boolean): Whether to allow editing/deleting notes
 * - singleNoteMode (boolean): If true, only one text area for the first note
 */
const StudentNotes = ({
  studentEmail,
  courseId,
  initialNotes = [],
  onNotesUpdate,
  showAddButton = true,
  allowEdit = true,
  singleNoteMode = false,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // For expanding/collapsing the actual email HTML/text
  const [expandedEmails, setExpandedEmails] = useState({});
  const [emailContents, setEmailContents] = useState({});

  // Store the tracking data from /sendGridTracking/{emailId} in real time
  const [emailTracking, setEmailTracking] = useState({});

  const { user } = useAuth();

  // A ref to store unsubscribes for each emailId so we don’t attach multiple listeners
  const unsubscribeMapRef = useRef({});

  // --------------------------------------------------------------------------
  // Load initial notes, handle single-note mode
  // --------------------------------------------------------------------------
  useEffect(() => {
    setNotes(initialNotes);
    if (singleNoteMode && initialNotes.length > 0) {
      setNewNoteContent(initialNotes[0].content);
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
      // Optionally remove any listeners for emailIds we no longer need
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
      noteType: '📝'
    };

    // Fetch current notes
    const db = getDatabase();
    const notesRef = ref(
      db,
      `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/jsonStudentNotes`
    );
    const snapshot = await get(notesRef);
    const currentNotes = snapshot.val() || [];

    const mergedNotes = [newNote, ...currentNotes];
    await updateStudentNotesInDatabase(mergedNotes);

    setNotes(mergedNotes);
    setNewNoteContent('');
  };

  const handleEditNote = async (noteId, updatedContent) => {
    const updatedNotes = notes.map((note) =>
      note.id === noteId ? { ...note, content: updatedContent } : note
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
      onNotesUpdate([{ ...notes[0], content }]);
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
  // Renders Email Body
  // --------------------------------------------------------------------------
  const renderEmailContent = (note) => {
    const emailId = note.metadata.emailId;
    const email = emailContents[emailId];
    if (!email) return null;

    return (
      <div className="mt-2 p-3 bg-white rounded border space-y-2">
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
          <div className="text-sm font-medium mt-2">{email.subject}</div>
        </div>

        <div
          className="text-sm text-gray-700 prose prose-sm max-w-none pt-2 border-t"
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

  // --------------------------------------------------------------------------
  // Main Render
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* SINGLE NOTE MODE */}
      {singleNoteMode ? (
        <Textarea
          value={newNoteContent}
          onChange={(e) => handleNoteContentChange(e.target.value)}
          className="mb-2"
          readOnly={!allowEdit}
        />
      ) : (
        <>
          <Textarea
            placeholder="Add a note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="mb-2"
          />
          {showAddButton && (
            <Button onClick={handleAddNote} className="mb-2">
              Add Note
            </Button>
          )}
        </>
      )}

      {/* NOTES LIST (only when NOT in single-note mode) */}
      {!singleNoteMode && (
        <ScrollArea className="flex-grow">
          <div className="space-y-4 pr-4">
            {notes.map((note) => {
              const isEmailNote = note.metadata?.type === 'email' && note.metadata?.emailId;
              const noteId = note.id;
              const emailId = note.metadata?.emailId;

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
                <div key={noteId} className="p-4 bg-gray-100 rounded relative">
                  {/* Edit/Delete Controls */}
                  {allowEdit && noteId !== 'legacy-note' && (
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingNote(note)}
                        className="text-gray-500 hover:text-gray-700"
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
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Note Header */}
                  <p className="text-sm font-semibold">
                    {note.noteType} - {formatTimestamp(note.timestamp)}
                    {note.author ? ` - ${note.author}` : ''}
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-line mt-1">
                    {note.content}
                  </p>

                  {/* Email-related controls/content */}
                  {isEmailNote && (
                    <>
                      {/* Expand/Collapse email content + show icon only */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 flex items-center"
                        onClick={() => toggleEmailView(noteId, emailId)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        {expandedEmails[noteId] ? (
                          <>
                            Hide Email
                            {/* Icon for the student's status (no text) */}
                            {studentStatusIconOnly && (
                              <span className="ml-2">{studentStatusIconOnly}</span>
                            )}
                            <ChevronUp className="h-4 w-4 ml-2" />
                          </>
                        ) : (
                          <>
                            View Email
                            {/* Icon for the student's status (no text) */}
                            {studentStatusIconOnly && (
                              <span className="ml-2">{studentStatusIconOnly}</span>
                            )}
                            <ChevronDown className="h-4 w-4 ml-2" />
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
            })}
          </div>
        </ScrollArea>
      )}

      {/* Edit Note Dialog */}
      {editingNote && (
        <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editingNote.content}
              onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button onClick={() => handleEditNote(editingNote.id, editingNote.content)}>
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
