import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import FamilyCreationSheet from './FamilyCreationSheet';
import FamilyManagementDirect from './FamilyManagementDirect';

/**
 * Wrapper component that decides whether to show FamilyCreationSheet (for initial creation)
 * or FamilyManagementDirect (for subsequent edits with direct database operations).
 * 
 * This solves the issue where saveFamilyData cloud function was regenerating student IDs
 * on every edit. After initial creation, users have proper permissions and can interact
 * directly with the database for granular updates.
 */
const FamilyManagementWrapper = ({
  isOpen,
  onOpenChange,
  familyKey,
  hasRegisteredFamily,
  initialFamilyData,
  onFamilyDataChange,
  onComplete,
  selectedFacilitator,
  staffMode = false,
  isStaffViewing = false
}) => {
  const { user } = useAuth();
  const [shouldUseDirectMode, setShouldUseDirectMode] = useState(false);
  const [isCheckingFamily, setIsCheckingFamily] = useState(true);

  useEffect(() => {
    const checkFamilyExists = async () => {
      if (!isOpen) {
        setIsCheckingFamily(false);
        return;
      }

      // For new families, always use FamilyCreationSheet
      if (!hasRegisteredFamily || !familyKey) {
        setShouldUseDirectMode(false);
        setIsCheckingFamily(false);
        return;
      }

      try {
        const db = getDatabase();
        const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyKey}`);
        const snapshot = await get(familyRef);
        
        if (snapshot.exists()) {
          const familyData = snapshot.val();
          
          // Check if this is an established family with proper structure
          // If family has students with IDs and guardians, it's safe to use direct mode
          const hasStudentsWithIds = familyData.students && 
            Object.keys(familyData.students).length > 0 &&
            Object.values(familyData.students).every(student => student.id);
          
          const hasGuardians = familyData.guardians && 
            Object.keys(familyData.guardians).length > 0;
          
          // Use direct mode for established families
          const useDirectMode = hasStudentsWithIds && hasGuardians;
          setShouldUseDirectMode(useDirectMode);
          
          console.log('Family check:', {
            familyKey,
            hasStudentsWithIds,
            hasGuardians,
            useDirectMode
          });
        } else {
          // Family doesn't exist yet, use creation mode
          setShouldUseDirectMode(false);
        }
      } catch (error) {
        console.error('Error checking family:', error);
        // Default to creation mode on error
        setShouldUseDirectMode(false);
      } finally {
        setIsCheckingFamily(false);
      }
    };

    checkFamilyExists();
  }, [isOpen, familyKey, hasRegisteredFamily]);

  // Show loading state while checking
  if (isCheckingFamily && isOpen) {
    return null; // Or a loading spinner if preferred
  }

  // For established families with proper permissions, use direct database management
  if (shouldUseDirectMode) {
    return (
      <FamilyManagementDirect
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        familyKey={familyKey}
        isStaffMode={staffMode || isStaffViewing}
      />
    );
  }

  // For new families or initial setup, use the original creation sheet
  return (
    <FamilyCreationSheet
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      familyKey={familyKey}
      hasRegisteredFamily={hasRegisteredFamily}
      initialFamilyData={initialFamilyData}
      onFamilyDataChange={onFamilyDataChange}
      onComplete={onComplete}
      selectedFacilitator={selectedFacilitator}
      staffMode={staffMode}
      isStaffViewing={isStaffViewing}
    />
  );
};

export default FamilyManagementWrapper;