import React, { useState } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from '../components/ui/button';
import StudentTypeSelector from './StudentTypeSelector';
import NonPrimaryStudentForm from './NonPrimaryStudentForm';
import { cn } from "../lib/utils";

const FormDialog = ({ trigger, open, onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState('type-selection');
  const [selectedStudentType, setSelectedStudentType] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const formRef = React.useRef(null);

  const handleStudentTypeSelect = (type) => {
    setSelectedStudentType(type);
  };

  const handleProceed = () => {
    if (currentStep === 'type-selection' && selectedStudentType) {
      setCurrentStep('form');
    }
  };

  const handleBack = () => {
    setCurrentStep('type-selection');
    setSelectedStudentType('');
  };

  const handleClose = () => {
    setCurrentStep('type-selection');
    setSelectedStudentType('');
    setIsFormValid(false);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (formRef.current && typeof formRef.current.submitForm === 'function') {
      const success = await formRef.current.submitForm();
      if (success) {
        handleClose();
      }
    }
  };

  const renderForm = () => {
    switch (selectedStudentType) {
      case 'Non-Primary':
        return (
          <NonPrimaryStudentForm 
            ref={formRef}
            onValidationChange={(isValid) => setIsFormValid(isValid)}
          />
        );
      case 'Home Education':
        return <div>Home Education Form Coming Soon...</div>;
      case 'Summer School':
        return <div>Summer School Form Coming Soon...</div>;
      case 'Adult Student':
        return <div>Adult Student Form Coming Soon...</div>;
      case 'International Student':
        return <div>International Student Form Coming Soon...</div>;
      default:
        return null;
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        {trigger}
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay 
          className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" 
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-[102] grid w-[90vw] max-w-[1000px] max-h-[90vh]",
            "translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          {/* Header */}
          <div className="mb-6">
            <DialogPrimitive.Title className="text-2xl font-semibold">
              Student Information Form
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-gray-600">
              {currentStep === 'type-selection' 
                ? 'Please determine your student type'
                : ''
              }
            </DialogPrimitive.Description>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] py-6">
            {currentStep === 'type-selection' ? (
              <StudentTypeSelector 
                onStudentTypeSelect={handleStudentTypeSelect} 
                selectedType={selectedStudentType}
              />
            ) : (
              renderForm()
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            {currentStep === 'form' && (
              <Button 
                variant="outline" 
                onClick={handleBack}
              >
                Back
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={currentStep === 'type-selection' ? handleProceed : handleSubmit}
              disabled={
                (currentStep === 'type-selection' && !selectedStudentType) ||
                (currentStep === 'form' && !isFormValid)
              }
            >
              {currentStep === 'type-selection' ? 'Proceed' : 'Submit'}
            </Button>
          </div>

          {/* Close Button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default FormDialog;
