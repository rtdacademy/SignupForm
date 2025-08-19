import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { sanitizeEmail } from '../../utils/sanitizeEmail';

export const useFamilyNotes = (familyId) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailTracking, setEmailTracking] = useState({});
  const [emailContents, setEmailContents] = useState({});
  const unsubscribeMapRef = useRef({});

  // Subscribe to notes for this family
  useEffect(() => {
    if (!familyId || !user) {
      setLoading(false);
      return;
    }

    const firestore = getFirestore();
    const notesRef = collection(firestore, `familyNotes/${familyId}/notes`);
    
    // Query to get all notes (both personal and shared)
    // Personal notes are filtered client-side
    const q = query(notesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only include personal notes if they belong to the current user
          if (data.visibility === 'personal' && data.authorEmail !== user.email) {
            return;
          }
          notesData.push({
            id: doc.id,
            ...data,
            // Convert Firestore timestamps to ISO strings
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
          });
        });
        setNotes(notesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching notes:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId, user]);

  // Subscribe to email tracking for email notes
  useEffect(() => {
    if (!familyId) return;

    const db = getDatabase();
    console.log('[DEBUG] Email tracking effect running for familyId:', familyId);
    console.log('[DEBUG] Notes with email metadata:', notes.filter(n => n.metadata?.type === 'email').map(n => ({
      noteId: n.id,
      emailId: n.metadata?.emailId,
      familyId: n.metadata?.familyId
    })));

    // For each note that's an email, attach a listener for tracking
    notes.forEach((note) => {
      if (note.metadata?.type === 'email' && note.metadata?.emailId) {
        const emailId = note.metadata.emailId;

        // Only attach a listener if we haven't done so yet
        if (!unsubscribeMapRef.current[emailId]) {
          const trackingPath = `homeEducationFamilies/emailTracking/${familyId}/emails/${emailId}`;
          console.log('[DEBUG] Attaching tracking listener to path:', trackingPath);
          const trackingRef = ref(db, trackingPath);

          const handleValueChange = (snapshot) => {
            console.log('[DEBUG] Firebase snapshot received for emailId:', emailId, 'exists:', snapshot.exists());
            if (snapshot.exists()) {
              const trackingData = snapshot.val();
              console.log('[DEBUG] Tracking data received for emailId:', emailId, trackingData);
              setEmailTracking((prev) => {
                const newState = {
                  ...prev,
                  [emailId]: trackingData
                };
                console.log('[DEBUG] emailTracking state updated:', newState);
                return newState;
              });
            } else {
              console.log('[DEBUG] No tracking data exists at path:', trackingPath);
            }
          };

          // Attach the listener
          console.log('[DEBUG] About to attach onValue listener for:', emailId);
          const unsubscribe = onValue(trackingRef, handleValueChange, (error) => {
            console.error('[DEBUG] Firebase listener error for emailId:', emailId, error);
          });
          console.log('[DEBUG] Listener attached for:', emailId);

          // Store the unsubscribe function (onValue returns an unsubscribe function)
          unsubscribeMapRef.current[emailId] = unsubscribe;
        }
      }
    });

    // Cleanup when notes array changes or component unmounts
    return () => {
      Object.values(unsubscribeMapRef.current).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      unsubscribeMapRef.current = {};
    };
  }, [notes, familyId]);

  // Function to fetch email content when needed
  const fetchEmailContent = useCallback(async (emailId, recipientEmail) => {
    if (!emailId || emailContents[emailId]) return;

    const db = getDatabase();
    const emailRef = ref(db, `userEmails/${sanitizeEmail(recipientEmail)}/${emailId}`);
    
    try {
      const snapshot = await get(emailRef);
      if (snapshot.exists()) {
        setEmailContents((prev) => ({
          ...prev,
          [emailId]: snapshot.val()
        }));
      }
    } catch (error) {
      console.error('Error fetching email content:', error);
    }
  }, [emailContents]);

  // Automatically fetch email content for email notes
  useEffect(() => {
    notes.forEach(note => {
      if (note.metadata?.type === 'email' && note.metadata?.emailId && note.metadata?.recipientEmail) {
        // Check if we already have this email content
        if (!emailContents[note.metadata.emailId]) {
          fetchEmailContent(note.metadata.emailId, note.metadata.recipientEmail);
        }
      }
    });
    // Note: fetchEmailContent is intentionally not in dependencies to avoid infinite loop
    // since it depends on emailContents which would cause re-renders
  }, [notes]);

  // Create a new note
  const createNote = useCallback(async (noteData) => {
    if (!familyId || !user) {
      throw new Error('Missing familyId or user');
    }

    const firestore = getFirestore();
    const notesRef = collection(firestore, `familyNotes/${familyId}/notes`);

    const newNote = {
      ...noteData,
      authorEmail: user.email,
      authorName: user.displayName || user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      readBy: noteData.visibility === 'personal' ? [user.email] : [user.email],
      mentions: noteData.mentions || []
    };

    try {
      const docRef = await addDoc(notesRef, newNote);
      
      // Update family metadata to track last activity
      const familyDocRef = doc(firestore, 'familyNotes', familyId);
      await setDoc(familyDocRef, {
        lastActivity: serverTimestamp(),
        lastActivityBy: user.email,
        totalNotes: (notes.length + 1)
      }, { merge: true });

      return docRef.id;
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  }, [familyId, user, notes.length]);

  // Update an existing note
  const updateNote = useCallback(async (noteId, updates) => {
    if (!familyId || !noteId) {
      throw new Error('Missing familyId or noteId');
    }

    const firestore = getFirestore();
    const noteRef = doc(firestore, `familyNotes/${familyId}/notes`, noteId);

    try {
      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: user.email
      });

      // Update family metadata
      const familyDocRef = doc(firestore, 'familyNotes', familyId);
      await updateDoc(familyDocRef, {
        lastActivity: serverTimestamp(),
        lastActivityBy: user.email
      });
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  }, [familyId, user]);

  // Delete a note
  const deleteNote = useCallback(async (noteId) => {
    if (!familyId || !noteId) {
      throw new Error('Missing familyId or noteId');
    }

    const firestore = getFirestore();
    const noteRef = doc(firestore, `familyNotes/${familyId}/notes`, noteId);

    try {
      await deleteDoc(noteRef);

      // Update family metadata
      const familyDocRef = doc(firestore, 'familyNotes', familyId);
      await updateDoc(familyDocRef, {
        lastActivity: serverTimestamp(),
        lastActivityBy: user.email,
        totalNotes: Math.max(0, notes.length - 1)
      });
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  }, [familyId, user, notes.length]);

  // Mark a note as read by the current user
  const markAsRead = useCallback(async (noteId) => {
    if (!familyId || !noteId || !user) {
      return;
    }

    const firestore = getFirestore();
    const noteRef = doc(firestore, `familyNotes/${familyId}/notes`, noteId);

    try {
      await updateDoc(noteRef, {
        readBy: arrayUnion(user.email)
      });
    } catch (err) {
      console.error('Error marking note as read:', err);
    }
  }, [familyId, user]);

  // Get unread count for the current user
  const getUnreadCount = useCallback(() => {
    if (!user) return 0;
    
    return notes.filter(note => {
      // Don't count personal notes from other users
      if (note.visibility === 'personal' && note.authorEmail !== user.email) {
        return false;
      }
      // Don't count user's own notes as unread
      if (note.authorEmail === user.email) {
        return false;
      }
      // Check if the user has read this note
      return !note.readBy?.includes(user.email);
    }).length;
  }, [notes, user]);

  // Get notes by category
  const getNotesByCategory = useCallback((category) => {
    return notes.filter(note => note.category === category);
  }, [notes]);

  // Get important notes
  const getImportantNotes = useCallback(() => {
    return notes.filter(note => note.isImportant);
  }, [notes]);

  // Search notes
  const searchNotes = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase();
    return notes.filter(note => {
      const contentText = note.content.replace(/<[^>]*>/g, '').toLowerCase();
      const authorMatch = note.authorName?.toLowerCase().includes(term);
      return contentText.includes(term) || authorMatch;
    });
  }, [notes]);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    markAsRead,
    getUnreadCount,
    getNotesByCategory,
    getImportantNotes,
    searchNotes,
    emailTracking,
    emailContents,
    fetchEmailContent
  };
};

// Hook to get unread counts across all families for a staff member
export const useStaffNotesOverview = () => {
  const { user } = useAuth();
  const [familyUnreadCounts, setFamilyUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const firestore = getFirestore();
    const unsubscribes = [];

    // This would need to be enhanced to track which families the staff member has access to
    // For now, we'll assume this is handled elsewhere and just provide the structure
    
    setLoading(false);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  return {
    familyUnreadCounts,
    loading,
    getTotalUnreadCount: () => Object.values(familyUnreadCounts).reduce((sum, count) => sum + count, 0)
  };
};