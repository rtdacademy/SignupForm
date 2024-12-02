import React, { useState, useEffect } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Edit2, Trash2, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { ScrollArea } from '../components/ui/scroll-area';

const StudentNotes = ({ 
  studentEmail, 
  courseId,
  initialNotes = [], 
  onNotesUpdate,
  showAddButton = true,
  allowEdit = true,
  singleNoteMode = false
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [expandedEmails, setExpandedEmails] = useState({});
  const [emailContents, setEmailContents] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    setNotes(initialNotes);
    if (singleNoteMode && initialNotes.length > 0) {
      setNewNoteContent(initialNotes[0].content);
    }
  }, [initialNotes, singleNoteMode]);

  const updateStudentNotesInDatabase = async (updatedNotes) => {
    if (!courseId) {
      console.error('Course ID is missing');
      return;
    }
    const db = getDatabase();
    const notesRef = ref(db, `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/jsonStudentNotes`);
    try {
      await set(notesRef, updatedNotes);
      if (onNotesUpdate) {
        onNotesUpdate(updatedNotes);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      content: newNoteContent.trim(),
      timestamp: new Date().toISOString(),
      author: user.displayName || user.email,
      noteType: '📝',
    };

    // Fetch the current notes from the database
    const db = getDatabase();
    const notesRef = ref(db, `students/${sanitizeEmail(studentEmail)}/courses/${courseId}/jsonStudentNotes`);
    const snapshot = await get(notesRef);
    const currentNotes = snapshot.val() || [];

    // Merge the new note with the current notes
    const mergedNotes = [newNote, ...currentNotes];

    await updateStudentNotesInDatabase(mergedNotes);

    setNotes(mergedNotes);
    setNewNoteContent('');
  };

  const handleEditNote = async (noteId, updatedContent) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId ? { ...note, content: updatedContent } : note
    );

    await updateStudentNotesInDatabase(updatedNotes);

    setNotes(updatedNotes);
    setEditingNote(null);
  };

  const handleDeleteNote = async (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
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

  const formatTimestamp = (timestamp) => {
    if (timestamp === 'Legacy Note') return timestamp;
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric' 
    });
  };

  const toggleEmailView = async (noteId, emailId) => {
    setExpandedEmails(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));

    // Fetch email content if not already loaded
    if (!emailContents[emailId] && !expandedEmails[noteId]) {
      const db = getDatabase();
      const emailRef = ref(db, `userEmails/${sanitizeEmail(studentEmail)}/${emailId}`);
      
      try {
        const snapshot = await get(emailRef);
        if (snapshot.exists()) {
          setEmailContents(prev => ({
            ...prev,
            [emailId]: snapshot.val()
          }));
        }
      } catch (error) {
        console.error('Error fetching email:', error);
      }
    }
  };

  const renderEmailContent = (note) => {
    const email = emailContents[note.metadata.emailId];
    if (!email) return null;

    return (
      <div className="mt-2 p-3 bg-white rounded border">
        <div className="text-sm text-gray-600 mb-2">
          <strong>From:</strong> {email.senderName} ({email.sender})
        </div>
        {email.ccParent && (
          <div className="text-sm text-gray-600 mb-2">
            <strong>CC:</strong> Parent
          </div>
        )}
        <div className="text-sm font-medium mb-2">{email.subject}</div>
        <div 
          className="text-sm text-gray-700 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: email.html || email.text }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
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
            <Button onClick={handleAddNote} className="mb-2">Add Note</Button>
          )}
        </>
      )}
      {!singleNoteMode && (
        <ScrollArea className="flex-grow">
          <div className="space-y-4 pr-4">
            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-gray-100 rounded relative">
                {/* Regular note controls */}
                {allowEdit && note.id !== 'legacy-note' && (
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
                
                {/* Note content */}
                <p className="text-sm font-semibold">
                  {note.noteType} - {formatTimestamp(note.timestamp)} {note.author ? `- ${note.author}` : ''}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-line mt-1">{note.content}</p>

                {/* Email view button for email notes */}
                {note.metadata?.type === 'email' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 flex items-center"
                      onClick={() => toggleEmailView(note.id, note.metadata.emailId)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {expandedEmails[note.id] ? (
                        <>
                          Hide Email
                          <ChevronUp className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          View Email
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                    {expandedEmails[note.id] && renderEmailContent(note)}
                  </>
                )}
              </div>
            ))}
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
              <Button
                onClick={() => handleEditNote(editingNote.id, editingNote.content)}
              >
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Note Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={() => setIsDeleteDialogOpen(false)}
      >
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
