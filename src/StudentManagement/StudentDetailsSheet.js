import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getDatabase, ref, update } from 'firebase/database';
import { 
  // STATUS_OPTIONS, // Removed since Status dropdown is no longer needed
  getSchoolYearOptions,
  STUDENT_TYPE_OPTIONS, 
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  getStatusColor,
} from '../config/DropdownOptions';
import { SheetHeader, SheetTitle } from "../components/ui/sheet"; // Ensure these are imported

function StudentDetailsSheet({ studentData, courseData, changedFields, courseId, studentKey, onUpdate, onClose }) {
  const [editedData, setEditedData] = useState({});
  const schoolYearOptions = useMemo(() => getSchoolYearOptions(), []);

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const db = getDatabase();
    const updates = {};

    Object.entries(editedData).forEach(([field, value]) => {
      if (['School_x0020_Year_Value', 'StudentType_Value', 'ActiveFutureArchived_Value'].includes(field)) {
        const fieldName = field.replace('_Value', '');
        updates[`students/${studentKey}/courses/${courseId}/${fieldName}/Value`] = value;
      } else if (field === 'ParentPermission_x003f_') {
        updates[`students/${studentKey}/profile/ParentPermission_x003f_/Value`] = value;
      } else if (field === 'Parent_x002f_Guardian') {
        updates[`students/${studentKey}/profile/Parent_x002f_Guardian`] = value;
      } else {
        updates[`students/${studentKey}/profile/${field}`] = value;
      }
    });

    try {
      await update(ref(db), updates);
      onUpdate();
      setEditedData({});
      onClose(); // Close the sheet after saving
    } catch (error) {
      console.error("Error updating student data:", error);
    }
  };

  const renderEditableField = (label, field, options) => {
    let value;

    if (editedData[field] !== undefined) {
      value = editedData[field];
    } else {
      if (['School_x0020_Year_Value', 'StudentType_Value', 'ActiveFutureArchived_Value'].includes(field)) {
        const fieldName = field.replace('_Value', '');
        value = courseData[fieldName]?.Value || '';
      } else if (field === 'ParentPermission_x003f_') {
        value = studentData.profile?.ParentPermission_x003f_?.Value || '';
      } else if (field === 'Parent_x002f_Guardian') {
        value = studentData.profile?.Parent_x002f_Guardian || '';
      } else {
        // Handle other fields
        value = studentData.profile?.[field] || courseData[field] || '';
        if (value && typeof value === 'object' && 'Value' in value) {
          value = value.Value;
        }
      }
    }

    if (options) {
      return (
        <div className="space-y-1">
          <label className="text-sm font-medium">{label}</label>
          <Select onValueChange={(value) => handleInputChange(field, value)} value={value}>
            <SelectTrigger className="w-full">
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
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
        </div>
      );
    }
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-xl font-bold text-[#315369]">
          Student Details
        </SheetTitle>
      </SheetHeader>
      <Tabs defaultValue="course" className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="course">Course Data</TabsTrigger>
          <TabsTrigger value="profile">Profile Data</TabsTrigger>
        </TabsList>
        <TabsContent value="course">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <Card className="bg-[#f0f4f7]">
              <CardContent className="p-4 space-y-4">
                {/* Removed the Status dropdown */}
                {/* {renderEditableField("Status", "Status_Value", STATUS_OPTIONS)} */}
                
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
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="profile">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <Card className="bg-[#f0f4f7]">
              <CardContent className="p-4 space-y-4">
                <h3 className="text-lg font-semibold text-[#315369]">
                  {studentData.profile.firstName} {studentData.profile.lastName}
                </h3>
                {renderEditableField("Student Age", "StudentAge")}
                {renderEditableField("Student Email", "StudentEmail")}
                {renderEditableField("Student Phone", "StudentPhone")}
                {renderEditableField("ASN", "asn")}
                {renderEditableField("First Name", "firstName")}
                {renderEditableField("Last Name", "lastName")}
                {renderEditableField("Parent Email", "ParentEmail")}
                {renderEditableField("Parent Permission", "ParentPermission_x003f_", [
                  { value: "Yes", color: "#10B981" },
                  { value: "No", color: "#EF4444" },
                ])}
                {renderEditableField("Parent Phone", "ParentPhone_x0023_")}
                {renderEditableField("Parent/Guardian", "Parent_x002f_Guardian")}
              </CardContent>
            </Card>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      <div className="mt-4">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </>
  );
}

export default StudentDetailsSheet;
