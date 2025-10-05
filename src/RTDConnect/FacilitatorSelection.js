import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllFacilitators,
  getAllFacilitatorsRandomized,
  getFacilitatorById,
  getFacilitatorProfileUrl,
  getFacilitatorAvailabilityForType,
  AVAILABILITY_STATUS
} from '../config/facilitators';
import { Star, Users, Clock, GraduationCap, Check, ChevronRight, Phone, Mail, BookOpen, Heart, Award, Ban, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

const FacilitatorCard = ({ facilitator, isSelected, onSelect, onViewDetails, selectionType = 'regular' }) => {
  const gradientClass = facilitator.gradients?.card || 'from-purple-500 to-blue-500';
  const isComingSoon = facilitator.experience === 'Profile Coming Soon';

  // Get availability based on selection type (Binary System)
  const availabilityInfo = getFacilitatorAvailabilityForType(facilitator.id, selectionType);
  const isAvailable = availabilityInfo.isAvailable;

  // Map icon names to components
  const iconMap = {
    'Star': Star,
    'Users': Users,
    'Clock': Clock,
    'GraduationCap': GraduationCap,
    'BookOpen': BookOpen,
    'Heart': Heart
  };

  return (
    <div
      className={`relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-purple-500' : ''
      } ${!isAvailable ? 'opacity-60' : ''}`}
    >
      {/* Availability Badge - Show based on availability */}
      {isAvailable && selectionType === 'intent' && (
        <div className="absolute top-4 left-4 z-10 bg-blue-100 border border-blue-300 text-blue-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {availabilityInfo.badge}
        </div>
      )}
      {isAvailable && selectionType === 'regular' && (
        <div className="absolute top-4 left-4 z-10 bg-green-100 border border-green-300 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
          <Check className="w-3 h-3 mr-1" />
          {availabilityInfo.badge}
        </div>
      )}
      {!isAvailable && (
        <div className="absolute top-4 left-4 z-10 bg-red-100 border border-red-300 text-red-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
          <Ban className="w-3 h-3 mr-1" />
          {availabilityInfo.badge}
        </div>
      )}

      {/* Coming Soon Badge */}
      {isAvailable && isComingSoon && (
        <div className="absolute top-4 left-4 z-10 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Coming Soon
        </div>
      )}
      
      {/* Selected Badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 z-10 bg-purple-500 text-white rounded-full p-2">
          <Check className="w-5 h-5" />
        </div>
      )}

      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${gradientClass}`} />
      
      <div className="p-6">
        {/* Profile Section */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            {facilitator.image ? (
              <a 
                href={getFacilitatorProfileUrl(facilitator)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block hover:opacity-80 transition-opacity cursor-pointer"
                title={`View ${facilitator.name}'s profile`}
              >
                <img 
                  src={facilitator.image} 
                  alt={facilitator.name}
                  className={`w-20 h-20 rounded-full object-cover border-4 border-white shadow-md hover:shadow-lg transition-shadow ${facilitator.imageStyle || ''}`}
                />
              </a>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-white shadow-md flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
            )}
            {!isComingSoon && (
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r ${gradientClass} rounded-full flex items-center justify-center`}>
                <Award className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900">{facilitator.name}</h3>
            <p className="text-sm text-gray-600">{facilitator.title}</p>
            <p className="text-xs text-purple-600 font-medium mt-1">{facilitator.experience}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {facilitator.description}
        </p>

        {/* Specializations */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-2">
            {facilitator.specializations.slice(0, 3).map((spec, index) => (
              <span 
                key={index}
                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
              >
                {spec}
              </span>
            ))}
            {facilitator.specializations.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                +{facilitator.specializations.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {facilitator.stats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || Star;
            return (
              <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                <IconComponent className="w-4 h-4 mx-auto text-purple-500 mb-1" />
                <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(facilitator)}
            className="flex-1 px-4 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            View Full Profile
          </button>
          <button
            onClick={() => isAvailable && onSelect(facilitator)}
            disabled={!isAvailable}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              !isAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isSelected
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
            }`}
          >
            {!isAvailable ? 'Not Available' : isSelected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FacilitatorDetailSheet = ({ isOpen, onClose, facilitator }) => {
  if (!facilitator) return null;

  const gradientClass = facilitator.gradients?.card || 'from-purple-500 to-blue-500';
  const isComingSoon = facilitator.experience === 'Profile Coming Soon';
  
  const iconMap = {
    'Star': Star,
    'Users': Users,
    'Clock': Clock,
    'GraduationCap': GraduationCap,
    'BookOpen': BookOpen,
    'Heart': Heart
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Facilitator Profile</SheetTitle>
          <SheetDescription>
            Learn more about {facilitator.name} and their approach to home education support
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Header */}
          <div className="text-center">
            {facilitator.image ? (
              <a 
                href={getFacilitatorProfileUrl(facilitator)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block hover:opacity-80 transition-opacity cursor-pointer"
                title={`View ${facilitator.name}'s profile`}
              >
                <img 
                  src={facilitator.image} 
                  alt={facilitator.name}
                  className={`w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-200 hover:border-gray-300 transition-colors ${facilitator.imageStyle || ''}`}
                />
              </a>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mx-auto mb-4 border-4 border-gray-200 flex items-center justify-center">
                <Users className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{facilitator.name}</h2>
            <p className="text-gray-600">{facilitator.title}</p>
            <p className="text-purple-600 font-medium mt-1">{facilitator.experience}</p>
            {isComingSoon && (
              <div className="inline-flex items-center px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full mt-2">
                <Clock className="w-3 h-3 text-yellow-600 mr-1" />
                <span className="text-xs font-medium text-yellow-800">Full Profile Coming Soon</span>
              </div>
            )}
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {facilitator.description}
            </p>
          </div>

          {/* Specializations */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Areas of Expertise</h3>
            <div className="space-y-2">
              {facilitator.specializations.map((spec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <BookOpen className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Facts</h3>
            <div className="grid grid-cols-2 gap-3">
              {facilitator.stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon] || Star;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <IconComponent className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grade Focus */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Grade Levels Supported</h3>
            <div className="flex flex-wrap gap-2">
              {facilitator.gradeFocus.primary.map((grade) => (
                <span 
                  key={grade}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          {facilitator.contact && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div className="space-y-2">
                {facilitator.contact.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{facilitator.contact.email}</span>
                  </div>
                )}
                {facilitator.contact.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{facilitator.contact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const FacilitatorSelection = ({
  selectedFacilitatorId,
  onFacilitatorSelect,
  showAsStep = false,
  onContinue = null,
  selectionType = 'funded' // 'funded' or 'intent'
}) => {
  // Memoize the randomized facilitator list - only randomize once per selectionType change
  const facilitators = useMemo(() => {
    // Load ALL facilitators (no filtering by availability)
    // We'll show all facilitators but mark unavailable ones visually
    return getAllFacilitatorsRandomized();
  }, [selectionType]); // Only re-randomize if selectionType changes

  const [selectedFacilitator, setSelectedFacilitator] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [viewingFacilitator, setViewingFacilitator] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingFacilitator, setPendingFacilitator] = useState(null);

  useEffect(() => {
    // Set initial selection if provided
    if (selectedFacilitatorId) {
      const facilitator = getFacilitatorById(selectedFacilitatorId);
      if (facilitator) {
        setSelectedFacilitator(facilitator);
      }
    }
  }, [selectedFacilitatorId]);

  const handleSelect = (facilitator) => {
    // Show confirmation dialog instead of immediately selecting
    setPendingFacilitator(facilitator);
    setConfirmDialogOpen(true);
  };

  const handleConfirmSelection = () => {
    if (pendingFacilitator) {
      setSelectedFacilitator(pendingFacilitator);
      if (onFacilitatorSelect) {
        onFacilitatorSelect(pendingFacilitator.id, pendingFacilitator);
      }
      setConfirmDialogOpen(false);
      setPendingFacilitator(null);
    }
  };

  const handleCancelSelection = () => {
    setConfirmDialogOpen(false);
    setPendingFacilitator(null);
  };

  const handleViewDetails = (facilitator) => {
    setViewingFacilitator(facilitator);
    setDetailSheetOpen(true);
  };

  const handleContinue = () => {
    if (onContinue && selectedFacilitator) {
      onContinue();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {showAsStep && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Facilitator</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {selectionType === 'intent'
              ? 'Select a facilitator for your Intent to Register submission. Your facilitator will help guide you through the registration process for the next school year.'
              : "Your facilitator will be your primary support throughout your home education journey. They'll help with curriculum planning, compliance, and provide ongoing guidance."}
          </p>
        </div>
      )}

      {/* Why This Matters */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Why Your Facilitator Choice Matters
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>They'll be your main point of contact for questions and support</li>
          <li>They'll review your education plans and provide feedback</li>
          <li>They'll conduct regular check-ins to ensure your success</li>
          <li>They'll help navigate Alberta's home education requirements</li>
        </ul>
      </div>

      {/* Facilitator Grid - Show all facilitators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilitators.map((facilitator) => (
          <FacilitatorCard
            key={facilitator.id}
            facilitator={facilitator}
            isSelected={selectedFacilitator?.id === facilitator.id}
            onSelect={handleSelect}
            onViewDetails={handleViewDetails}
            selectionType={selectionType}
          />
        ))}
      </div>

      {/* Skip button - only show when no facilitator selected */}
      {showAsStep && !selectedFacilitator && (
        <div className="flex justify-center pt-6">
          <button
            onClick={() => onContinue && onContinue()}
            className="px-8 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center space-x-2"
          >
            <span>Skip for Now</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sticky Bottom Bar - shown when facilitator selected */}
      {selectedFacilitator && showAsStep && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-purple-200 shadow-2xl z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Selected facilitator info */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">Selected Facilitator</p>
                  <p className="text-sm text-gray-600 truncate">{selectedFacilitator.name}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setSelectedFacilitator(null)}
                  className="px-4 py-2 text-sm font-medium border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  Change
                </button>
                <button
                  onClick={handleContinue}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all flex items-center space-x-2 font-medium"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add bottom padding when sticky bar is shown to prevent content from being hidden */}
      {selectedFacilitator && showAsStep && (
        <div className="h-20" />
      )}

      {/* Detail Sheet */}
      <FacilitatorDetailSheet
        isOpen={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        facilitator={viewingFacilitator}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Facilitator Selection</DialogTitle>
            <DialogDescription>
              Are you sure you want to select {pendingFacilitator?.name} as your facilitator?
            </DialogDescription>
          </DialogHeader>

          {pendingFacilitator && (
            <div className="py-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                {pendingFacilitator.image ? (
                  <img
                    src={pendingFacilitator.image}
                    alt={pendingFacilitator.name}
                    className={`w-16 h-16 rounded-full object-cover border-2 border-purple-200 ${pendingFacilitator.imageStyle || ''}`}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-purple-200 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{pendingFacilitator.name}</h3>
                  <p className="text-sm text-gray-600">{pendingFacilitator.title}</p>
                  <p className="text-xs text-purple-600 mt-1">{pendingFacilitator.experience}</p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700">
                <p className="mb-2">Your facilitator will:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Be your main point of contact for support</li>
                  <li>Review your education plans and provide feedback</li>
                  <li>Conduct regular check-ins to ensure your success</li>
                  <li>Help navigate Alberta's home education requirements</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <button
              onClick={handleCancelSelection}
              className="px-4 py-2 text-sm font-medium border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all font-medium"
            >
              Confirm Selection
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacilitatorSelection;