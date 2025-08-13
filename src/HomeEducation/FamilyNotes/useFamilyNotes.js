import { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../../context/AuthContext';

export const useFamilyNotes = (familyId) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    searchNotes
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