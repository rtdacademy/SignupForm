import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Check } from 'lucide-react';
import { useUserPreferences } from '../../context/UserPreferencesContext';

const NewFeatureDialog = ({ 
  isOpen, 
  onOpenChange, 
  featureId,
  title, 
  description, 
  icon: Icon,
  sections = [],
  note
}) => {
  const { preferences, updatePreferences } = useUserPreferences();

  // Function to mark feature as seen in user preferences
  const handleDontShowAgain = () => {
    const seenFeatures = preferences?.seenFeatures || {};
    updatePreferences({
      ...preferences,
      seenFeatures: {
        ...seenFeatures,
        [featureId]: true
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <DialogHeader className="p-4 pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <DialogTitle className="text-xl flex items-center">
            {Icon && (
              <div className="mr-2 bg-blue-100 text-blue-600 rounded-full p-1">
                <Icon className="h-5 w-5" />
              </div>
            )}
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-gray-600 mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="px-4 py-3 space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-medium text-blue-700 flex items-center">
                {section.icon && React.createElement(section.icon, { className: "inline h-4 w-4 mr-2" })}
                {section.title}
              </h3>
              <p className="text-sm text-gray-600 ml-6">
                {section.content}
              </p>
            </div>
          ))}
          
          {note && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                {note}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row-reverse gap-2">
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
          >
            <Check className="h-4 w-4 mr-2" />
            Got it
          </Button>
          <Button
            variant="outline"
            onClick={handleDontShowAgain}
          >
            Don't show again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewFeatureDialog;
