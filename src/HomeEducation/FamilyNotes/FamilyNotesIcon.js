import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const FamilyNotesIcon = ({ familyId, onClick, className = '' }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPersonalNotes, setHasPersonalNotes] = useState(false);
  const [hasSharedNotes, setHasSharedNotes] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!familyId || !user) {
      setLoading(false);
      return;
    }

    const firestore = getFirestore();
    const notesRef = collection(firestore, `familyNotes/${familyId}/notes`);
    const q = query(notesRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let unread = 0;
        let personalNotes = false;
        let sharedNotes = false;

        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // Check note visibility
          if (data.visibility === 'shared') {
            sharedNotes = true;
            // Count unread shared notes (not from current user)
            if (data.authorEmail !== user.email && !data.readBy?.includes(user.email)) {
              unread++;
            }
          } else if (data.visibility === 'personal' && data.authorEmail === user.email) {
            personalNotes = true;
          }
        });

        setUnreadCount(unread);
        setHasPersonalNotes(personalNotes);
        setHasSharedNotes(sharedNotes);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching notes count:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId, user]);

  // Determine icon color based on note status
  const getIconColor = () => {
    if (unreadCount > 0) return 'text-blue-600';
    if (hasSharedNotes) return 'text-green-600';
    if (hasPersonalNotes) return 'text-gray-600';
    return 'text-gray-400';
  };

  // Get tooltip content
  const getTooltipContent = () => {
    if (loading) return 'Loading notes...';
    if (unreadCount > 0) return `${unreadCount} unread note${unreadCount !== 1 ? 's' : ''}`;
    if (hasSharedNotes || hasPersonalNotes) return 'View family notes';
    return 'No notes yet';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`relative p-1 hover:bg-gray-50 rounded transition-colors ${className}`}
            title="Family Notes"
          >
            <MessageSquare className={`w-4 h-4 ${getIconColor()}`} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
            {!loading && !unreadCount && hasSharedNotes && (
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-500 rounded-full" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FamilyNotesIcon;