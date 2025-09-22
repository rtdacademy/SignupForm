import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import PortfolioManager from './PortfolioManager';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

/**
 * Standalone portfolio view with URL-based navigation
 * Used for direct access via URL: /portfolio/{familyId}/{studentId}/{schoolYear}/{structureId?}
 */
const StandalonePortfolioView = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Extract parameters from URL
  const { familyId, studentId, schoolYear: urlSchoolYear, structureId } = params;
  // Convert school year back from URL format "25_26" to "25/26"
  const schoolYear = urlSchoolYear ? urlSchoolYear.replace('_', '/') : '';

  useEffect(() => {
    if (!user || authLoading) return;

    const loadStudentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check access permissions
        const isStaff = user.email?.includes('@rtdacademy.com') ||
                       user.email?.includes('@rtdlearning.ca') ||
                       user.customClaims?.role === 'staff';

        // For non-staff, verify they belong to the family
        if (!isStaff) {
          const db = getDatabase();
          const familyRef = ref(db, `users/parents/${user.uid}/familyId`);
          const familySnapshot = await get(familyRef);

          if (!familySnapshot.exists() || familySnapshot.val() !== familyId) {
            setError('You do not have permission to view this portfolio.');
            setLoading(false);
            return;
          }
        }

        // Load student information from the family structure
        const db = getDatabase();

        // Load student from family path - this is where the data actually is
        const studentRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/students/${studentId}`);
        const studentSnapshot = await get(studentRef);

        if (!studentSnapshot.exists()) {
          console.error('Student not found at path:', `homeEducationFamilies/familyInformation/${familyId}/students/${studentId}`);
          setError('Student not found.');
          setLoading(false);
          return;
        }

        const studentData = studentSnapshot.val();

        // The student data should have an 'id' property that matches studentId
        // But we'll use the studentId from the URL as the authoritative source

        setStudent({
          id: studentId,
          ...studentData,
          firstName: studentData.firstName || studentData.name || 'Student',
          lastName: studentData.lastName || ''
        });
        setHasAccess(true);
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError('Failed to load portfolio. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user, authLoading, familyId, studentId]);

  // Handle navigation back to dashboard
  const handleBack = () => {
    navigate('/rtd-connect');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Authentication Required</h2>
          <p className="mt-2 text-gray-600">Please log in to view this portfolio.</p>
          <Button
            onClick={() => navigate('/login')}
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Error Loading Portfolio</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Button
            onClick={handleBack}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">You do not have permission to view this portfolio.</p>
          <Button
            onClick={handleBack}
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Render portfolio manager in standalone mode
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="gap-2"
        >
          ← Back to Dashboard
        </Button>
        <div className="text-sm text-gray-500">
          Viewing Portfolio: {student?.firstName} {student?.lastName}
        </div>
      </div>

      {/* Portfolio Manager */}
      <div className="h-[calc(100vh-57px)]">
        <PortfolioManager
          student={student}
          familyId={familyId}
          schoolYear={schoolYear}
          onClose={handleBack}
          isStandalone={true}
        />
      </div>
    </div>
  );
};

export default StandalonePortfolioView;