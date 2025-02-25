import React, { useState, useCallback, useEffect } from 'react';
import { FaLink } from 'react-icons/fa';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, onValue, off } from 'firebase/database';

const LTI_BASE_URL = 'https://us-central1-rtd-academy.cloudfunctions.net';
const POPUP_WIDTH = 1024;
const POPUP_HEIGHT = 768;

const IMathASSetup = ({ item, courseId, unitIndex, itemIndex, onItemChange, isEditing }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupWindow, setPopupWindow] = useState(null);
  const [deepLinkData, setDeepLinkData] = useState(null);

  // Format timestamp to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Reset deepLinkData when courseId or item changes
  useEffect(() => {
    setDeepLinkData(null);
  }, [courseId, item]);

  // Listen for deep link data
  useEffect(() => {
    const db = getDatabase();
    let deepLinkRef;

    if (item.lti?.deep_link_id) {
      deepLinkRef = ref(db, `lti/deep_links/${item.lti.deep_link_id}`);
      
      const handleDeepLinkUpdate = (snapshot) => {
        const data = snapshot.val();
        setDeepLinkData(data || null);
      };

      onValue(deepLinkRef, handleDeepLinkUpdate);

      return () => {
        if (deepLinkRef) {
          off(deepLinkRef, 'value');
        }
      };
    } else {
      // Explicitly clear deepLinkData when there's no deep_link_id
      setDeepLinkData(null);
    }
  }, [item.lti?.deep_link_id]);

  // Function to handle messages from the popup window
  const handleMessage = useCallback((event) => {
    if (event.origin !== new URL(LTI_BASE_URL).origin) return;

    if (event.data?.subject === 'lti.deep_linking.response.success') {
      const linkData = event.data.links?.[0];
      if (linkData) {
        onItemChange(unitIndex, itemIndex, 'lti', {
          deep_link_id: item.lti?.deep_link_id || `${courseId}-${crypto.randomUUID()}`,
          resource_link_id: linkData.resource_link_id,
          title: linkData.title,
          url: linkData.url
        });
      }
      if (popupWindow) {
        popupWindow.close();
        setPopupWindow(null);
      }
      setLoading(false);
    }
  }, [onItemChange, unitIndex, itemIndex, popupWindow, item.lti, courseId]);

  // Set up and clean up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Clean up popup window if component unmounts
  useEffect(() => {
    return () => {
      if (popupWindow) {
        popupWindow.close();
      }
    };
  }, [popupWindow]);

  const handleLTILaunch = async () => {
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      const deep_link_id = item.lti?.deep_link_id || `${courseId}-${crypto.randomUUID()}`;
      
      // If this is the first setup, set the deep_link_id
      if (!item.lti?.deep_link_id) {
        onItemChange(unitIndex, itemIndex, 'lti', {
          ...(item.lti || {}),
          deep_link_id
        });
      }

      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        user_id: user.uid,
        course_id: courseId,
        role: 'instructor',
        deep_link_id,
        allow_direct_login: "1",
        firstname: user.displayName?.split(' ')[0] || '',
        lastname: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email || ''
      });

      const url = `${LTI_BASE_URL}/ltiLogin?${params.toString()}`;

      // Calculate center position for popup
      const left = window.screen.width / 2 - POPUP_WIDTH / 2;
      const top = window.screen.height / 2 - POPUP_HEIGHT / 2;

      // Open popup window
      const popup = window.open(
        url,
        'IMathAS Setup',
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top}`
      );

      if (popup) {
        setPopupWindow(popup);
        // Poll to check if window was closed
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            setPopupWindow(null);
            setLoading(false);
          }
        }, 500);
      } else {
        throw new Error('Popup was blocked. Please allow popups for this site.');
      }

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReconfigure = useCallback(() => {
    const confirmed = window.confirm(
      'Reconfiguring this assessment will update its settings for all students. ' +
      'Existing student data will be preserved. Do you want to continue?'
    );

    if (confirmed) {
      handleLTILaunch();
    }
  }, [handleLTILaunch]);

  if (item.type === 'info') {
    return null;
  }

  return (
    <div className="flex flex-col space-y-2 mt-2 px-8">
      <div className="flex items-center justify-between">
        <span className="font-medium">IMathAS Integration</span>
        
        {isEditing && !deepLinkData && (
          <Button
            onClick={handleLTILaunch}
            variant="outline"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <FaLink className="w-4 h-4" />
                Setup IMathAS Assessment
              </>
            )}
          </Button>
        )}
      </div>

      {deepLinkData ? (
        <div className="bg-green-50 p-4 rounded-md space-y-2">
          <p className="text-green-700 flex items-center gap-2">
            <FaLink className="w-4 h-4" />
            IMathAS Assessment Connected
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Title:</span> {deepLinkData.title}
            </div>
            <div>
              <span className="font-medium">Course ID:</span> {deepLinkData.course_id}
            </div>
            <div>
              <span className="font-medium">Assessment ID:</span> {deepLinkData.assessment_id}
            </div>
            <div>
              <span className="font-medium">Max Score:</span> {deepLinkData.lineItem?.scoreMaximum || 'N/A'}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Created:</span> {formatDate(deepLinkData.created)}
            </div>
          </div>
          {isEditing && (
            <div className="mt-4">
              <Button
                onClick={handleReconfigure}
                variant="outline"
                size="sm"
              >
                Update Assessment Settings
              </Button>
              <p className="text-xs text-gray-600 mt-2">
                Updating will modify the assessment settings for all students.
                Existing student data will be preserved.
              </p>
            </div>
          )}
        </div>
      ) : (
        <Alert>
          <AlertDescription>
            {isEditing ? 
              "Click the \"Setup IMathAS Assessment\" button to configure this assessment in IMathAS." :
              "This assessment hasn't been configured in IMathAS yet."
            }
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default IMathASSetup;