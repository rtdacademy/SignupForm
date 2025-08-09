import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import { getDatabase, ref, set, get } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';

// Version numbers for tracking updates
export const LEGAL_VERSIONS = {
  terms: '1.0.0',
  privacy: '1.0.0',
  lastUpdated: '2025-08-08'
};

/**
 * Component for displaying and tracking legal document acceptance
 * Can be used in registration flows and for re-acceptance when terms update
 */
export const LegalAcceptanceCheckbox = ({ 
  onAcceptanceChange, 
  required = true,
  showError = false,
  errorMessage = "You must accept the Terms and Conditions and Privacy Statement to continue."
}) => {
  const [accepted, setAccepted] = useState(false);

  const handleChange = (checked) => {
    setAccepted(checked);
    if (onAcceptanceChange) {
      onAcceptanceChange(checked);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <Checkbox
          id="legal-acceptance"
          checked={accepted}
          onCheckedChange={handleChange}
          className="mt-1"
        />
        <label 
          htmlFor="legal-acceptance" 
          className="text-sm text-gray-700 cursor-pointer select-none"
        >
          I have read and agree to the{' '}
          <Link 
            to="/terms" 
            target="_blank"
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            Terms and Conditions
          </Link>
          {' '}and{' '}
          <Link 
            to="/privacy" 
            target="_blank"
            className="text-blue-600 hover:text-blue-800 underline"
            onClick={(e) => e.stopPropagation()}
          >
            Privacy Statement
          </Link>
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {showError && !accepted && (
        <p className="text-sm text-red-600 ml-6">{errorMessage}</p>
      )}
    </div>
  );
};

/**
 * Records legal acceptance in Firebase
 * @param {string} userId - Firebase user ID
 * @param {string} userEmail - User's email address
 * @param {object} additionalData - Any additional data to store with acceptance
 */
export const recordLegalAcceptance = async (userId, userEmail, additionalData = {}) => {
  const db = getDatabase();
  const sanitizedEmail = sanitizeEmail(userEmail);
  
  const acceptanceData = {
    termsVersion: LEGAL_VERSIONS.terms,
    privacyVersion: LEGAL_VERSIONS.privacy,
    acceptedAt: Date.now(),
    acceptedBy: userId,
    email: userEmail,
    ipAddress: await getClientIP(), // Helper function to get IP if needed
    userAgent: navigator.userAgent,
    ...additionalData
  };

  try {
    // Store in user's profile
    await set(ref(db, `users/${userId}/legalAcceptance`), acceptanceData);
    
    // Also store in a dedicated legal acceptance log for compliance
    await set(
      ref(db, `legalAcceptanceLog/${sanitizedEmail}/${Date.now()}`), 
      acceptanceData
    );
    
    return { success: true, data: acceptanceData };
  } catch (error) {
    console.error('Error recording legal acceptance:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Checks if user has accepted current versions of legal documents
 * @param {string} userId - Firebase user ID
 * @returns {object} - Acceptance status and details
 */
export const checkLegalAcceptance = async (userId) => {
  const db = getDatabase();
  
  try {
    const snapshot = await get(ref(db, `users/${userId}/legalAcceptance`));
    
    if (!snapshot.exists()) {
      return {
        hasAccepted: false,
        needsUpdate: false,
        data: null
      };
    }
    
    const acceptanceData = snapshot.val();
    
    // Check if accepted versions match current versions
    const termsMatch = acceptanceData.termsVersion === LEGAL_VERSIONS.terms;
    const privacyMatch = acceptanceData.privacyVersion === LEGAL_VERSIONS.privacy;
    
    return {
      hasAccepted: true,
      needsUpdate: !termsMatch || !privacyMatch,
      data: acceptanceData,
      currentVersions: LEGAL_VERSIONS
    };
  } catch (error) {
    console.error('Error checking legal acceptance:', error);
    return {
      hasAccepted: false,
      needsUpdate: false,
      error: error.message
    };
  }
};

/**
 * Helper function to get client IP (optional - implement based on your needs)
 */
const getClientIP = async () => {
  try {
    // You could use a service like ipify or get it from your backend
    // For now, returning a placeholder
    return 'IP_NOT_COLLECTED';
  } catch {
    return 'IP_UNAVAILABLE';
  }
};

/**
 * Component for prompting re-acceptance when terms update
 */
export const LegalUpdatePrompt = ({ userId, onAccept, onDecline }) => {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (!accepted) {
      alert('Please check the box to accept the updated terms.');
      return;
    }

    setLoading(true);
    try {
      const user = { uid: userId }; // Get actual user object as needed
      const result = await recordLegalAcceptance(userId, user.email, {
        updateReason: 'terms_updated'
      });
      
      if (result.success) {
        onAccept();
      } else {
        alert('Error accepting terms. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error accepting terms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Legal Documents Updated</h2>
        
        <Alert className="mb-4">
          <AlertDescription>
            We've updated our Terms and Conditions and/or Privacy Statement. 
            Please review and accept the updated documents to continue using our services.
          </AlertDescription>
        </Alert>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Last updated: {LEGAL_VERSIONS.lastUpdated}
          </p>
          
          <div className="space-y-2 mb-4">
            <Link 
              to="/terms" 
              target="_blank"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              View Terms and Conditions →
            </Link>
            <Link 
              to="/privacy" 
              target="_blank"
              className="block text-blue-600 hover:text-blue-800 underline"
            >
              View Privacy Statement →
            </Link>
          </div>

          <LegalAcceptanceCheckbox 
            onAcceptanceChange={setAccepted}
            required={true}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleAccept}
            disabled={loading || !accepted}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Accept and Continue'}
          </button>
          <button
            onClick={onDecline}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Decline and Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalAcceptanceCheckbox;