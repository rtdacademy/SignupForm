import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Users, UserPlus, Mail, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "../components/ui/alert";
import Select from 'react-select';
import { useAuth } from '../context/AuthContext';
import { toast } from "sonner";

const EmailRecipientSelector = ({ 
  open, 
  onOpenChange, 
  students, 
  ccRecipients, 
  onCcRecipientsChange 
}) => {
  const { staffMembers } = useAuth();
  const [selectAllPrimary, setSelectAllPrimary] = useState(false);
  const [selectAllGuardians, setSelectAllGuardians] = useState(false);
  const [staffSelections, setStaffSelections] = useState([]);
  const [selectedTab, setSelectedTab] = useState('primary');

  // Check if staff tab should be available
  const isSingleStudent = students.length === 1;
  
  // Transform staff members for react-select
  const staffOptions = Object.entries(staffMembers)
    .filter(([_, staff]) => staff.email) // Ensure we only include staff with emails
    .map(([key, staff]) => ({
      value: staff.email,
      label: `${staff.firstName} ${staff.lastName} (${staff.email})`,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName
    }));

  // Initialize or clear staff selections based on student count
  useEffect(() => {
    if (!isSingleStudent && ccRecipients['staff']) {
      const newCcRecipients = { ...ccRecipients };
      delete newCcRecipients['staff'];
      onCcRecipientsChange(newCcRecipients);
      setStaffSelections([]);
    } else if (isSingleStudent && ccRecipients['staff']) {
      const { cc = [] } = ccRecipients['staff'];
      const matchedStaff = staffOptions.filter(option => 
        cc.some(staff => staff.email === option.email)
      );
      if (JSON.stringify(matchedStaff) !== JSON.stringify(staffSelections)) {
        setStaffSelections(matchedStaff);
      }
    }
  }, [isSingleStudent, ccRecipients, staffOptions, staffSelections, onCcRecipientsChange]);

  // Update select all states
  useEffect(() => {
    const primaryEmails = getAllPrimaryEmails();
    const guardianEmails = getAllGuardianEmails();

    const allPrimarySelected = primaryEmails.every(
      ({ studentId, email }) => ccRecipients[studentId]?.[email]
    );
    const allGuardiansSelected = guardianEmails.every(
      ({ studentId, email }) => ccRecipients[studentId]?.[email]
    );

    setSelectAllPrimary(allPrimarySelected && primaryEmails.length > 0);
    setSelectAllGuardians(allGuardiansSelected && guardianEmails.length > 0);
  }, [ccRecipients, students]);

  // Helper functions
  const getAllPrimaryEmails = () => {
    return students
      .filter(student => student.ParentEmail && 
        student.ParentEmail.toLowerCase() !== student.StudentEmail?.toLowerCase())
      .map(student => ({
        studentId: student.id,
        email: student.ParentEmail,
        studentName: `${student.firstName} ${student.lastName}`
      }));
  };

  const getAllGuardianEmails = () => {
    return students.flatMap(student => 
      Array.from({ length: 10 }, (_, i) => i + 1)
        .map(i => student[`guardianEmail${i}`])
        .filter(email => email && 
          email.toLowerCase() !== student.StudentEmail?.toLowerCase())
        .map(email => ({
          studentId: student.id,
          email,
          studentName: `${student.firstName} ${student.lastName}`
        }))
    );
  };

  const handleSelectAllPrimary = (checked) => {
    setSelectAllPrimary(checked);
    const newCcRecipients = { ...ccRecipients };
    
    getAllPrimaryEmails().forEach(({ studentId, email }) => {
      if (!newCcRecipients[studentId]) {
        newCcRecipients[studentId] = {};
      }
      newCcRecipients[studentId][email] = checked;
    });
    
    onCcRecipientsChange(newCcRecipients);
  };

  const handleSelectAllGuardians = (checked) => {
    setSelectAllGuardians(checked);
    const newCcRecipients = { ...ccRecipients };
    
    getAllGuardianEmails().forEach(({ studentId, email }) => {
      if (!newCcRecipients[studentId]) {
        newCcRecipients[studentId] = {};
      }
      newCcRecipients[studentId][email] = checked;
    });
    
    onCcRecipientsChange(newCcRecipients);
  };

  const handleRecipientChange = (studentId, email, checked) => {
    // Find the student's email
    const student = students.find(s => s.id === studentId);
    const studentEmail = student?.StudentEmail?.toLowerCase();
    const emailToCheck = email.toLowerCase();
    
    console.log('Comparing emails:', {
      studentEmail,
      emailToCheck,
      matches: emailToCheck === studentEmail
    });
    
    // If attempting to CC the student's own email, show warning and don't add
    if (checked && emailToCheck === studentEmail) {
      toast.warning(
        <div className="flex flex-col gap-1">
          <div className="font-semibold">Cannot CC Student's Own Email</div>
          <div className="text-sm">
            {student.firstName} {student.lastName}'s email ({email}) cannot be CC'd as they are the main recipient.
          </div>
        </div>
      );
      return;
    }
  
    const newCcRecipients = {
      ...ccRecipients,
      [studentId]: {
        ...ccRecipients[studentId],
        [email]: checked
      }
    };
    onCcRecipientsChange(newCcRecipients);
  };

  const handleStaffSelectionChange = (selected) => {
    if (!isSingleStudent) return;
    
    setStaffSelections(selected || []);
    const newCcRecipients = { ...ccRecipients };
    
    // Update staff recipients to always be CC
    const staffList = (selected || []).map(staff => ({
      email: staff.email,
      name: `${staff.firstName} ${staff.lastName}`
    }));

    newCcRecipients['staff'] = {
      cc: staffList
    };
    
    onCcRecipientsChange(newCcRecipients);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: 'white',
      borderColor: 'hsl(var(--input))',
      '&:hover': {
        borderColor: 'hsl(var(--input))'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'white',
      zIndex: 50
    })
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>CC Recipients 1</DialogTitle>
          <DialogDescription>
            Select which recipients you want to CC for each student. Added teachers will be CC'd.
          </DialogDescription>
        </DialogHeader>

        {students.some(student => {
    const studentEmail = student.StudentEmail?.toLowerCase();
    return (
      (student.ParentEmail?.toLowerCase() === studentEmail) ||
      Array.from({ length: 10 }, (_, i) => student[`guardianEmail${i}`])
        .some(email => email?.toLowerCase() === studentEmail)
    );
  }) && (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Some email addresses match their student's email and have been excluded from CC options to prevent duplicate emails.
      </AlertDescription>
    </Alert>
  )}

        <div className="space-y-4">
          {/* Select All Checkboxes */}
          <div className="flex gap-6 p-2 bg-gray-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-primary"
                checked={selectAllPrimary}
                onCheckedChange={handleSelectAllPrimary}
              />
              <label htmlFor="select-all-primary" className="text-sm font-medium">
                Select All Primary Parents
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-guardians"
                checked={selectAllGuardians}
                onCheckedChange={handleSelectAllGuardians}
              />
              <label htmlFor="select-all-guardians" className="text-sm font-medium">
                Select All Additional Guardians
              </label>
            </div>
          </div>

          {/* Staff CC Notice when multiple students selected */}
          {!isSingleStudent && staffSelections.length > 0 && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Staff CC is only available when sending to a single student. Your staff recipient selections have been cleared.
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className={`grid w-full ${isSingleStudent ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="primary" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Primary Parents
              </TabsTrigger>
              <TabsTrigger value="guardians" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Additional Guardians
              </TabsTrigger>
              {isSingleStudent && (
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Staff Members
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="primary" className="mt-4 space-y-4">
  <div className="max-h-[300px] overflow-y-auto space-y-4">
    {students.map(student => student.ParentEmail && (
      <div key={`primary-${student.id}`} className="space-y-2">
        <h4 className="font-medium text-sm">{student.firstName} {student.lastName}</h4>
        {student.ParentEmail.toLowerCase() === student.StudentEmail?.toLowerCase() ? (
          <div className="pl-4 text-sm text-gray-500 italic">
            {student.ParentEmail} (Cannot be CC'd - matches student email)
          </div>
        ) : (
          <div className="flex items-center space-x-2 pl-4">
            <Checkbox
              id={`cc-parent-${student.id}`}
              checked={ccRecipients[student.id]?.[student.ParentEmail] || false}
              onCheckedChange={checked => handleRecipientChange(student.id, student.ParentEmail, checked)}
            />
            <label htmlFor={`cc-parent-${student.id}`} className="text-sm text-gray-700">
              {student.ParentEmail}
            </label>
          </div>
        )}
      </div>
    ))}
  </div>
</TabsContent>

<TabsContent value="guardians" className="mt-4 space-y-4">
  <div className="max-h-[300px] overflow-y-auto space-y-4">
    {students.map(student => (
      <div key={`guardian-${student.id}`} className="space-y-2">
        <h4 className="font-medium text-sm">{student.firstName} {student.lastName}</h4>
        <div className="space-y-2 pl-4">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(i => {
            const email = student[`guardianEmail${i}`];
            const isStudentEmail = email?.toLowerCase() === student.StudentEmail?.toLowerCase();
            
            return email && (
              <div key={i}>
                {isStudentEmail ? (
                  <div className="text-sm text-gray-500 italic">
                    {email} (Cannot be CC'd - matches student email)
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`cc-guardian-${student.id}-${i}`}
                      checked={ccRecipients[student.id]?.[email] || false}
                      onCheckedChange={checked => handleRecipientChange(student.id, email, checked)}
                    />
                    <label htmlFor={`cc-guardian-${student.id}-${i}`} className="text-sm text-gray-700">
                      {email}
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
</TabsContent>

            {isSingleStudent && (
              <TabsContent value="staff" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <Alert variant="info" className="mb-4">
                    <Mail className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      Added teachers will be automatically CC'd.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Staff Members to CC
                    </label>
                    <Select
                      isMulti
                      options={staffOptions}
                      value={staffSelections}
                      onChange={handleStaffSelectionChange}
                      placeholder={`Select staff members to CC...`}
                      styles={selectStyles}
                    />
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailRecipientSelector;
