import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { ScrollArea } from "../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Users, 
  GraduationCap, 
  Mail,
  Crown,
  UserCheck
} from 'lucide-react';
import { Badge } from "../components/ui/badge";

const FamilyEmailRecipientSelector = ({
  open,
  onOpenChange,
  families, // Set of selected family IDs
  familiesData, // Full family data object
  ccRecipients,
  onCcRecipientsChange
}) => {
  const [localCcRecipients, setLocalCcRecipients] = useState(ccRecipients || {});
  const [activeTab, setActiveTab] = useState('all');

  // Initialize local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalCcRecipients(ccRecipients || {});
      // Set initial tab based on number of families
      setActiveTab(families.size === 1 ? 'all' : 'all');
    }
  }, [open, ccRecipients, families]);

  // Process families data for display
  const processedFamilies = Array.from(families).map(familyId => {
    const family = familiesData[familyId];
    if (!family) return null;

    const guardians = family.guardians ? Object.values(family.guardians) : [];
    const students = family.students ? Object.values(family.students) : [];
    
    // Identify primary guardian to exclude from CC options
    const primaryGuardian = guardians.find(g => g.guardianType === 'primary_guardian') || guardians[0];
    
    // Get additional guardians (not primary)
    const additionalGuardians = guardians.filter(g => 
      g.email && g.email !== primaryGuardian?.email
    ).map(g => ({
      ...g,
      name: `${g.firstName} ${g.lastName}`
    }));
    
    // Get students with emails
    const studentsWithEmails = students.filter(s => s.email).map(s => ({
      ...s,
      name: `${s.firstName} ${s.lastName}`
    }));

    return {
      familyId,
      primaryGuardian: primaryGuardian ? {
        ...primaryGuardian,
        name: `${primaryGuardian.firstName} ${primaryGuardian.lastName}`
      } : null,
      additionalGuardians,
      studentsWithEmails,
      displayName: `Family ${familyId.slice(-8)}`
    };
  }).filter(Boolean);

  // Handle checkbox change for a specific recipient
  const handleRecipientChange = (familyId, recipientType, email, checked) => {
    setLocalCcRecipients(prev => ({
      ...prev,
      [familyId]: {
        ...prev[familyId],
        [recipientType]: {
          ...prev[familyId]?.[recipientType],
          [email]: checked
        }
      }
    }));
  };

  // Handle select all for a specific type
  const handleSelectAllType = (familyId, recipientType, recipients, checked) => {
    const updates = {};
    recipients.forEach(recipient => {
      updates[recipient.email] = checked;
    });

    setLocalCcRecipients(prev => ({
      ...prev,
      [familyId]: {
        ...prev[familyId],
        [recipientType]: updates
      }
    }));
  };

  // Handle select all across all families
  const handleSelectAllFamilies = (recipientType, checked) => {
    const updates = { ...localCcRecipients };
    
    processedFamilies.forEach(family => {
      const recipients = recipientType === 'guardians' 
        ? family.additionalGuardians 
        : family.studentsWithEmails;
      
      if (!updates[family.familyId]) {
        updates[family.familyId] = {};
      }
      
      updates[family.familyId][recipientType] = {};
      recipients.forEach(recipient => {
        updates[family.familyId][recipientType][recipient.email] = checked;
      });
    });

    setLocalCcRecipients(updates);
  };

  // Apply changes
  const handleApply = () => {
    onCcRecipientsChange(localCcRecipients);
    onOpenChange(false);
  };

  // Count selected recipients
  const getSelectionCount = () => {
    let guardianCount = 0;
    let studentCount = 0;

    Object.values(localCcRecipients).forEach(family => {
      if (family.guardians) {
        guardianCount += Object.values(family.guardians).filter(Boolean).length;
      }
      if (family.students) {
        studentCount += Object.values(family.students).filter(Boolean).length;
      }
    });

    return { guardianCount, studentCount, total: guardianCount + studentCount };
  };

  const counts = getSelectionCount();

  // Render family CC options
  const renderFamilyOptions = (family) => {
    const familyCc = localCcRecipients[family.familyId] || {};
    
    return (
      <div key={family.familyId} className="space-y-4 p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{family.displayName}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Crown className="h-3 w-3" />
            Primary: {family.primaryGuardian?.name || 'None'}
          </div>
        </div>

        {/* Additional Guardians */}
        {family.additionalGuardians.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Additional Guardians ({family.additionalGuardians.length})
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleSelectAllType(
                  family.familyId,
                  'guardians',
                  family.additionalGuardians,
                  !family.additionalGuardians.every(g => 
                    familyCc.guardians?.[g.email]
                  )
                )}
              >
                {family.additionalGuardians.every(g => 
                  familyCc.guardians?.[g.email]
                ) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="space-y-2 pl-6">
              {family.additionalGuardians.map(guardian => (
                <div key={guardian.email} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${family.familyId}-guardian-${guardian.email}`}
                    checked={familyCc.guardians?.[guardian.email] || false}
                    onCheckedChange={(checked) => 
                      handleRecipientChange(family.familyId, 'guardians', guardian.email, checked)
                    }
                  />
                  <label
                    htmlFor={`${family.familyId}-guardian-${guardian.email}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{guardian.name}</span>
                      <span className="text-xs text-gray-500">{guardian.email}</span>
                      {guardian.guardianType && guardian.guardianType !== 'guardian' && (
                        <Badge variant="outline" className="text-xs">
                          {guardian.guardianType.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Students */}
        {family.studentsWithEmails.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Students ({family.studentsWithEmails.length})
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleSelectAllType(
                  family.familyId,
                  'students',
                  family.studentsWithEmails,
                  !family.studentsWithEmails.every(s => 
                    familyCc.students?.[s.email]
                  )
                )}
              >
                {family.studentsWithEmails.every(s => 
                  familyCc.students?.[s.email]
                ) ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="space-y-2 pl-6">
              {family.studentsWithEmails.map(student => (
                <div key={student.email} className="flex items-center space-x-3">
                  <Checkbox
                    id={`${family.familyId}-student-${student.email}`}
                    checked={familyCc.students?.[student.email] || false}
                    onCheckedChange={(checked) => 
                      handleRecipientChange(family.familyId, 'students', student.email, checked)
                    }
                  />
                  <label
                    htmlFor={`${family.familyId}-student-${student.email}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{student.name}</span>
                      <span className="text-xs text-gray-500">{student.email}</span>
                      {student.grade && (
                        <Badge variant="outline" className="text-xs">
                          Grade {student.grade}
                        </Badge>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No additional recipients message */}
        {family.additionalGuardians.length === 0 && family.studentsWithEmails.length === 0 && (
          <div className="text-sm text-gray-500 italic py-2">
            No additional recipients available for CC
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-lg overflow-hidden" 
        side="right"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            CC Recipients
          </SheetTitle>
          <SheetDescription className="mt-2">
            Select additional recipients to CC on the email. The primary guardian of each family 
            will receive the email directly.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Selection Summary */}
            {counts.total > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Selected:</span>
                  </div>
                  {counts.guardianCount > 0 && (
                    <span>{counts.guardianCount} guardian{counts.guardianCount !== 1 ? 's' : ''}</span>
                  )}
                  {counts.studentCount > 0 && (
                    <span>{counts.studentCount} student{counts.studentCount !== 1 ? 's' : ''}</span>
                  )}
                  <span className="font-medium">({counts.total} total)</span>
                </div>
              </div>
            )}

            {/* Quick Actions for Multiple Families */}
            {processedFamilies.length > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAllFamilies('guardians', true)}
                >
                  Select All Guardians
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAllFamilies('students', true)}
                >
                  Select All Students
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalCcRecipients({});
                  }}
                >
                  Clear All
                </Button>
              </div>
            )}

            {/* Families List */}
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-4 pr-4">
                {processedFamilies.length === 1 ? (
                  // Single family - show directly
                  renderFamilyOptions(processedFamilies[0])
                ) : (
                  // Multiple families - use tabs or list
                  <div className="space-y-4">
                    {processedFamilies.map(family => renderFamilyOptions(family))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <SheetFooter className="px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply CC Recipients
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FamilyEmailRecipientSelector;