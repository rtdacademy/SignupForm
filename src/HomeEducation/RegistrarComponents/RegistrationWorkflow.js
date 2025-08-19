import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const RegistrationWorkflow = ({ isOpen, onClose }) => {
  const workflowSteps = [
    {
      title: 'Review Student Information',
      description: 'Verify student name, birthday, and grade level',
      icon: Circle,
      status: 'pending'
    },
    {
      title: 'Check/Add ASN',
      description: 'Look up ASN in PASI system if missing and add to student record',
      icon: Circle,
      status: 'pending'
    },
    {
      title: 'Download Notification Form',
      description: 'Download the latest version of the notification form PDF',
      icon: Circle,
      status: 'pending'
    },
    {
      title: 'Review Citizenship Documents',
      description: 'Verify citizenship documents are approved and valid',
      icon: Circle,
      status: 'pending'
    },
    {
      title: 'Verify Address',
      description: 'Confirm current address is complete and accurate',
      icon: Circle,
      status: 'pending'
    },
    {
      title: 'Add to PASI System',
      description: 'Enter student information into PASI',
      icon: Circle,
      status: 'pending'
    },
    {
      title: 'Upload Documents to PASI',
      description: 'Upload notification form and citizenship documents',
      icon: Circle,
      status: 'pending'
    },
    {
      title: 'Mark as Completed',
      description: 'Mark student as registered in the system',
      icon: Circle,
      status: 'pending'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>PASI Registration Workflow</DialogTitle>
          <DialogDescription>
            Step-by-step guide for registering students in the PASI system
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {workflowSteps.map((step, index) => (
            <Card key={index} className="border-l-4 border-l-gray-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-xs font-bold">
                    {index + 1}
                  </span>
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 ml-9">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationWorkflow;