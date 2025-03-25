import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, MessageCircle } from 'lucide-react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import { useAuth } from '../context/AuthContext';

const ParticipantInfo = React.memo(({ email, chatId, onError }) => {
  // Get current user's staff status from AuthContext
  const { user, isStaff } = useAuth();

  // Determine if current user is staff
  const currentUserIsStaff = isStaff(user);

  console.log('ParticipantInfo - Auth Context Values:', {
    user: user?.email,
    currentUserIsStaff,
    isStaffType: typeof currentUserIsStaff
  });

  const [details, setDetails] = useState(null);
  const [mustRead, setMustRead] = useState(false);
  const [mustRespond, setMustRespond] = useState(false);
  const [isUpdatingRead, setIsUpdatingRead] = useState(false);
  const [isUpdatingRespond, setIsUpdatingRespond] = useState(false);

  useEffect(() => {
    console.log(`ParticipantInfo: Loading details for email: ${email}`);
    const loadDetails = async () => {
      const db = getDatabase();
      const sanitizedEmail = sanitizeEmail(email).toLowerCase();

      try {
        // Attempt to fetch student profile
        const studentRef = ref(db, `students/${sanitizedEmail}/profile`);
        const studentSnapshot = await get(studentRef);
        console.log(
          `ParticipantInfo: Fetched student profile for ${sanitizedEmail}:`,
          studentSnapshot.exists()
        );

        if (studentSnapshot.exists()) {
          const profile = studentSnapshot.val();
          setDetails({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
          });
          console.log(
            `ParticipantInfo: Student details set for ${sanitizedEmail}:`,
            profile
          );
        } else {
          // If not a student, attempt to fetch staff profile
          const staffRef = ref(db, `staff/${sanitizedEmail}`);
          const staffSnapshot = await get(staffRef);
          console.log(
            `ParticipantInfo: Fetched staff profile for ${sanitizedEmail}:`,
            staffSnapshot.exists()
          );

          if (staffSnapshot.exists()) {
            const profile = staffSnapshot.val();
            setDetails({
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
            });
            console.log(
              `ParticipantInfo: Staff details set for ${sanitizedEmail}:`,
              profile
            );
          } else {
            // Fallback to using the email prefix as the name
            setDetails({
              firstName: email.split('@')[0],
              lastName: '',
            });
            console.log(
              `ParticipantInfo: Fallback name set for ${email.split('@')[0]}`
            );
          }
        }

        // Check for must read and must respond flags
        if (chatId) {
          const notificationRef = ref(db, `notifications/${sanitizedEmail}/${chatId}`);
          const notificationSnapshot = await get(notificationRef);

          if (notificationSnapshot.exists()) {
            const data = notificationSnapshot.val();
            setMustRead(!!data.mustRead);
            setMustRespond(!!data.mustRespond);
            console.log(
              `ParticipantInfo: Status flags for ${sanitizedEmail}:`,
              { mustRead: !!data.mustRead, mustRespond: !!data.mustRespond }
            );
          }
        }
      } catch (error) {
        console.error(`ParticipantInfo: Error loading details for ${email}:`, error);
        setDetails({
          firstName: email.split('@')[0],
          lastName: '',
        });
        onError?.('Failed to load participant details');
      }
    };

    loadDetails();
  }, [email, chatId, onError]);

  const handleToggleStatus = useCallback(async (type) => {
    console.log('ParticipantInfo - handleToggleStatus called with:', {
      type,
      currentUserIsStaff,
      chatId
    });

    if (!currentUserIsStaff || !chatId) {
      console.log('ParticipantInfo - Toggle status blocked:', {
        isStaff: currentUserIsStaff,
        hasChatId: !!chatId
      });
      return;
    }

    const isRead = type === 'read';
    const setUpdating = isRead ? setIsUpdatingRead : setIsUpdatingRespond;
    const currentValue = isRead ? mustRead : mustRespond;
    const setValue = isRead ? setMustRead : setMustRespond;

    setUpdating(true);
    console.log(`ParticipantInfo: Toggling ${type} status for ${email}`);

    const db = getDatabase();
    const sanitizedEmail = sanitizeEmail(email).toLowerCase();

    try {
      const notificationRef = ref(
        db,
        `notifications/${sanitizedEmail}/${chatId}/${isRead ? 'mustRead' : 'mustRespond'}`
      );

      await set(notificationRef, !currentValue);
      setValue(!currentValue);
      console.log(
        `ParticipantInfo: Updated ${type} status for ${email} to ${!currentValue}`
      );
    } catch (error) {
      console.error(`ParticipantInfo: Error updating ${type} status:`, error);
      onError?.(`Failed to update ${type} status`);
    } finally {
      setUpdating(false);
    }
  }, [chatId, currentUserIsStaff, mustRead, mustRespond, email, onError]);

  if (!details) {
    console.log(`ParticipantInfo: Details not loaded yet for ${email}`);
    return <p>Loading...</p>;
  }

  // Log render condition values
  console.log('ParticipantInfo - Render conditions:', {
    currentUserIsStaff,
    chatId,
    showButtons: currentUserIsStaff && chatId
  });

  return (
    <div className="mb-2 flex items-center justify-between">
      <p>
        <strong>Name:</strong> {details.firstName} {details.lastName}
      </p>
      {currentUserIsStaff && chatId && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleStatus('read')}
            disabled={isUpdatingRead}
            className={`flex items-center focus:outline-none transition-colors duration-200 ${
              isUpdatingRead ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'
            } ${mustRead ? 'text-red-500' : 'text-gray-400'}`}
            title={mustRead ? 'Remove Must Read status' : 'Mark as Must Read'}
          >
            <BookOpen size={16} />
            <span className="ml-1 text-xs whitespace-nowrap">Must Read</span>
          </button>
          <button
            onClick={() => handleToggleStatus('respond')}
            disabled={isUpdatingRespond}
            className={`flex items-center focus:outline-none transition-colors duration-200 ${
              isUpdatingRespond ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-500'
            } ${mustRespond ? 'text-red-500' : 'text-gray-400'}`}
            title={mustRespond ? 'Remove Must Respond status' : 'Mark as Must Respond'}
          >
            <MessageCircle size={16} />
            <span className="ml-1 text-xs whitespace-nowrap">Must Respond</span>
          </button>
        </div>
      )}
    </div>
  );
});

export default ParticipantInfo;
