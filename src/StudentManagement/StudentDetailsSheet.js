import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getDatabase, ref, get, update } from 'firebase/database';
import { 
  getSchoolYearOptions,
  STUDENT_TYPE_OPTIONS, 
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  getStatusColor,
  DIPLOMA_MONTH_OPTIONS,
} from '../config/DropdownOptions';
import { SheetHeader, SheetTitle } from "../components/ui/sheet";
import { cn } from "../lib/utils";
import GuardianManager from './GuardianManager';
import { EmailChangeDialog } from './EmailChangeDialog';
import ProfileHistory from './ProfileHistory';

function StudentDetailsSheet({ studentData, courseData, courseId, studentKey, onUpdate }) {
  const [isDiplomaCourse, setIsDiplomaCourse] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const schoolYearOptions = useMemo(() => getSchoolYearOptions(), []);

  const GENDER_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say'}
  ];

  useEffect(() => {
    const fetchCourseInfo = async () => {
      const db = getDatabase();
      try {
        const diplomaCourseSnapshot = await get(ref(db, `courses/${courseId}/DiplomaCourse`));
        setIsDiplomaCourse(diplomaCourseSnapshot.val() === 'Yes');

        const courseTitleSnapshot = await get(ref(db, `courses/${courseId}/Title`));
        setCourseTitle(courseTitleSnapshot.val() || '');
      } catch (error) {
        console.error("Error fetching course info:", error);
      }
    };

    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId]);

  const handleFieldUpdate = async (field, value) => {
    const db = getDatabase();
    const updates = {};

    if (['School_x0020_Year_Value', 'StudentType_Value', 'ActiveFutureArchived_Value', 'DiplomaMonthChoices_Value'].includes(field)) {
      const fieldName = field.replace('_Value', '');
      updates[`students/${studentKey}/courses/${courseId}/${fieldName}/Value`] = value;
    } else if (field === 'ParentPermission_x003f_') {
      updates[`students/${studentKey}/profile/ParentPermission_x003f_/Value`] = value;
    } else if (field === 'Parent_x002f_Guardian') {
      updates[`students/${studentKey}/profile/Parent_x002f_Guardian`] = value;
    } else {
      updates[`students/${studentKey}/profile/${field}`] = value;
    }

    try {
      await update(ref(db), updates);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const renderEditableField = (label, field, options, readOnly = false) => {
    let value;

    if (['School_x0020_Year_Value', 'StudentType_Value', 'ActiveFutureArchived_Value', 'DiplomaMonthChoices_Value'].includes(field)) {
      const fieldName = field.replace('_Value', '');
      value = courseData[fieldName]?.Value || '';
    } else if (field === 'ParentPermission_x003f_') {
      value = studentData.profile?.ParentPermission_x003f_?.Value || '';
    } else if (field === 'Parent_x002f_Guardian') {
      value = studentData.profile?.Parent_x002f_Guardian || '';
    } else {
      value = studentData.profile?.[field] || courseData[field] || '';
      if (value && typeof value === 'object' && 'Value' in value) {
        value = value.Value;
      }
    }

    if (options) {
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium">{label}</label>
          <Select 
            value={value}
            onValueChange={(newValue) => handleFieldUpdate(field, newValue)}
            disabled={readOnly}
          >
            <SelectTrigger className={cn("w-full", !readOnly && "bg-white")}>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <span style={{ color: option.color }}>{option.value}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    } else {
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium">{label}</label>
          <Input 
            value={value || ''}
            onChange={(e) => handleFieldUpdate(field, e.target.value)}
            disabled={readOnly}
            className={cn(!readOnly && "bg-white")}
          />
        </div>
      );
    }
  };

  const displayName = studentData.profile.preferredFirstName || studentData.profile.firstName;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-xl font-bold text-[#315369]">
          {displayName} {studentData.profile.lastName} - {courseTitle}
        </SheetTitle>
      </SheetHeader>
      <Tabs defaultValue="profile" className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile Data</TabsTrigger>
          <TabsTrigger value="course">Course Data</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6">
              <Card className="bg-[#f0f4f7]">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-[#315369]">
                    {displayName} {studentData.profile.lastName}
                  </h3>
                  {renderEditableField("First Name", "firstName")}
                  {renderEditableField("Preferred First Name", "preferredFirstName")}
                  {renderEditableField("Last Name", "lastName")}
                  {renderEditableField("Gender", "gender", GENDER_OPTIONS)}
                  {renderEditableField("Student Age", "StudentAge", null, true)}
                  {renderEditableField("Student Email", "StudentEmail", null, true)}
                  <EmailChangeDialog 
                    studentData={studentData}
                    studentKey={studentKey}
                    onComplete={(newSanitizedEmail, newEmail) => {
                      if (onUpdate) onUpdate();
                    }}
                  />
                  {renderEditableField("Student Phone", "StudentPhone")}
                  {renderEditableField("ASN", "asn", null, true)}
                </CardContent>
              </Card>

              <Card className="bg-[#f0f4f7]">
                <CardContent className="p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-[#315369]">Primary Guardian</h3>
                  {renderEditableField("Parent Email", "ParentEmail")}
                  {renderEditableField("Parent Permission", "ParentPermission_x003f_", [
                    { value: "Yes", color: "#10B981" },
                    { value: "No", color: "#EF4444" },
                  ])}
                  {renderEditableField("Parent Phone", "ParentPhone_x0023_")}
                  {renderEditableField("Parent/Guardian", "Parent_x002f_Guardian")}
                </CardContent>
              </Card>

              <Card className="bg-[#f0f4f7]">
                <CardContent className="p-4">
                  <GuardianManager 
                    studentKey={studentKey}
                    onUpdate={onUpdate}
                  />
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="course">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <Card className="bg-[#f0f4f7]">
              <CardContent className="p-4 space-y-4">
                <p className="text-sm">
                  <span className="font-semibold">Last Week Status:</span>{' '}
                  <span style={{ color: getStatusColor(courseData.StatusCompare) }}>
                    {courseData.StatusCompare}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Course:</span>{' '}
                  {courseData.Course_Value}
                </p>
                {renderEditableField("School Year", "School_x0020_Year_Value", schoolYearOptions)}
                {renderEditableField("Student Type", "StudentType_Value", STUDENT_TYPE_OPTIONS)}
                {renderEditableField("Active", "ActiveFutureArchived_Value", ACTIVE_FUTURE_ARCHIVED_OPTIONS)}
                
                {isDiplomaCourse && renderEditableField("Diploma Month", "DiplomaMonthChoices_Value", DIPLOMA_MONTH_OPTIONS)}
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="history">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <ProfileHistory studentEmailKey={studentKey} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default StudentDetailsSheet;