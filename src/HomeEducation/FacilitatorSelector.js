import React, { useState } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import { getAllFacilitators, getFacilitatorByEmail } from '../config/facilitators';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const FacilitatorSelector = ({ 
  family, 
  familyId, 
  isAdmin, // Kept for backwards compatibility but not used
  currentUserEmail, 
  isMyFamily 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const facilitators = getAllFacilitators();
  const currentFacilitatorEmail = family.facilitatorEmail || '';
  const currentFacilitator = getFacilitatorByEmail(currentFacilitatorEmail);

  // Define color mappings for each facilitator
  const getFacilitatorColor = (email) => {
    const facilitator = getFacilitatorByEmail(email);
    if (!facilitator) return 'text-gray-600';
    
    switch(facilitator.id) {
      case 'golda-david':
        return 'text-purple-600';
      case 'grace-anne-post':
        return 'text-green-600';
      case 'marian-johnson':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getFacilitatorBadgeColors = (email) => {
    const facilitator = getFacilitatorByEmail(email);
    if (!facilitator) return 'bg-gray-100 text-gray-700 border-gray-200';
    
    switch(facilitator.id) {
      case 'golda-david':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'grace-anne-post':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'marian-johnson':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const updateFamilyFacilitator = async (newFacilitatorEmail) => {
    setIsUpdating(true);
    setShowError(false);
    
    try {
      const db = getDatabase();
      const familyRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}`);
      
      const updates = {
        facilitatorEmail: newFacilitatorEmail || null,
        lastFacilitatorUpdate: Date.now(),
        facilitatorUpdatedBy: currentUserEmail
      };

      await update(familyRef, updates);
      console.log('✅ Facilitator updated successfully:', { familyId, newFacilitatorEmail });
    } catch (error) {
      console.error('❌ Error updating facilitator:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFacilitatorChange = async (newEmail) => {
    // Convert "unassigned" to empty string for database
    const emailToSave = newEmail === 'unassigned' ? '' : newEmail;
    await updateFamilyFacilitator(emailToSave);
  };

  // All staff members get the full dropdown with colors
  return (
    <div className="relative">
      <Select
        value={currentFacilitatorEmail || 'unassigned'}
        onValueChange={handleFacilitatorChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="h-7 text-xs w-[180px] focus:ring-1 focus:ring-purple-500">
          <SelectValue>
            {currentFacilitatorEmail ? (
              <span className={getFacilitatorColor(currentFacilitatorEmail)}>
                {currentFacilitator?.name || currentFacilitatorEmail}
                {isMyFamily && ' (Me)'}
              </span>
            ) : (
              <span className="text-gray-500 italic">Unassigned</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned" className="text-xs">
            <span className="text-gray-500 italic">Unassigned</span>
          </SelectItem>
          {facilitators.map((facilitator) => (
            <SelectItem 
              key={facilitator.contact.email} 
              value={facilitator.contact.email}
              className="text-xs"
            >
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    facilitator.id === 'golda-david' ? 'bg-purple-500' :
                    facilitator.id === 'grace-anne-post' ? 'bg-green-500' :
                    facilitator.id === 'marian-johnson' ? 'bg-blue-500' :
                    'bg-gray-500'
                  }`}
                />
                <span className={getFacilitatorColor(facilitator.contact.email)}>
                  {facilitator.name}
                  {facilitator.contact.email === currentUserEmail && ' (Me)'}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {isUpdating && (
        <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-3 h-3 animate-spin text-purple-500" />
      )}
      
      {showError && (
        <div className="absolute top-full left-0 mt-1 bg-red-50 border border-red-200 rounded px-2 py-1 z-10">
          <div className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-700">Update failed</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitatorSelector;