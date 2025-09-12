import React, { useState } from 'react';
import { getDatabase, ref, update } from 'firebase/database';
import { getAllFacilitators, getFacilitatorByEmail } from '../config/facilitators';
import { Loader2, AlertTriangle, User } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

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

  // Get facilitator initials
  const getFacilitatorInitials = (facilitator) => {
    if (!facilitator) return 'UN';
    const names = facilitator.name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return facilitator.name.substring(0, 2).toUpperCase();
  };

  // Get avatar background gradient
  const getAvatarGradient = (facilitatorId) => {
    switch(facilitatorId) {
      case 'golda-david':
        return 'from-purple-500 to-blue-500';
      case 'grace-anne-post':
        return 'from-green-500 to-teal-500';
      case 'marian-johnson':
        return 'from-blue-500 to-cyan-500';
      case 'elise':
        return 'from-pink-500 to-purple-500';
      case 'kari-luther':
        return 'from-emerald-500 to-teal-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  const handleSelectFacilitator = async (email) => {
    await handleFacilitatorChange(email);
    setIsOpen(false);
  };

  // Compact badge display with avatar
  return (
    <div className="relative">
      <TooltipProvider>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button 
                  className="flex items-center space-x-1.5 hover:opacity-80 transition-opacity"
                  disabled={isUpdating}
                >
                  {currentFacilitator ? (
                    <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                      <AvatarImage 
                        src={currentFacilitator.image} 
                        alt={currentFacilitator.name}
                        className="object-cover object-center"
                      />
                      <AvatarFallback 
                        className={`bg-gradient-to-br ${getAvatarGradient(currentFacilitator.id)} text-white text-xs font-medium`}
                      >
                        {getFacilitatorInitials(currentFacilitator)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  {isUpdating && (
                    <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                  )}
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="text-xs">
                <p className="font-medium">
                  {currentFacilitator ? currentFacilitator.name : 'Unassigned'}
                  {isMyFamily && currentFacilitator && ' (My Family)'}
                </p>
                {currentFacilitator && (
                  <p className="text-gray-500">Click to change</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
          
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-1">
              <button
                onClick={() => handleSelectFacilitator('unassigned')}
                className="w-full flex items-center space-x-3 px-2 py-2 hover:bg-gray-50 rounded-md transition-colors text-left"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 italic">Unassigned</p>
                  <p className="text-xs text-gray-400">No facilitator selected</p>
                </div>
              </button>
              
              {facilitators.map((facilitator) => (
                <button
                  key={facilitator.contact.email}
                  onClick={() => handleSelectFacilitator(facilitator.contact.email)}
                  className="w-full flex items-center space-x-3 px-2 py-2 hover:bg-gray-50 rounded-md transition-colors text-left"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={facilitator.image} 
                      alt={facilitator.name}
                      className="object-cover object-center"
                    />
                    <AvatarFallback 
                      className={`bg-gradient-to-br ${getAvatarGradient(facilitator.id)} text-white text-xs font-medium`}
                    >
                      {getFacilitatorInitials(facilitator)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {facilitator.name}
                      {facilitator.contact.email === currentUserEmail && (
                        <span className="ml-1 text-xs text-purple-600">(Me)</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {facilitator.isAvailable === false ? 'Currently Full' : 'Available'}
                    </p>
                  </div>
                  {facilitator.contact.email === currentFacilitatorEmail && (
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
      
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