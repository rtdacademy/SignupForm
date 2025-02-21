import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { AlertTriangle } from "lucide-react";
import YourWayScheduleCreator from '../../Schedule/YourWayScheduleCreator';

const UpdateScheduleSheet = ({
    isOpen,
    onOpenChange,
    course,
    validationError
  }) => {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Schedule Update Required</SheetTitle>
            <SheetDescription>
              <Alert variant="warning" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationError.reason}: {validationError.details}
                  <p className="mt-2">
                    The course structure has been updated since your schedule was created. 
                    Please create a new schedule to ensure everything is properly aligned.
                  </p>
                </AlertDescription>
              </Alert>
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            <YourWayScheduleCreator
              course={course}
              onScheduleSaved={() => onOpenChange(false)}
              isScheduleUpdate={true} // Add this prop
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  };
  
  export default UpdateScheduleSheet;