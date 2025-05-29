import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Clock, 
  User, 
  ChevronDown, 
  ChevronUp,
  FileText,
  History,
  Users,
  ClipboardCheck
} from 'lucide-react';
import { formatDateForDisplay } from '../utils/timeZoneUtils';
import { 
  getStatusColor,
  getCourseInfo,
  getStudentTypeInfo,
  getActiveFutureArchivedColor,
  getPasiColor,
  getSchoolYearColor,
  getDiplomaMonthColor,
  STATUS_OPTIONS,
  COURSE_OPTIONS,
  STUDENT_TYPE_OPTIONS,
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  PASI_OPTIONS,
  DIPLOMA_MONTH_OPTIONS
} from '../config/DropdownOptions';

const ProfileHistory = ({ studentEmailKey }) => {
  const [history, setHistory] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [courseNames, setCourseNames] = useState({});

  useEffect(() => {
    if (!studentEmailKey) return;

    const db = getDatabase();
    const historyRef = ref(db, `students/${studentEmailKey}/profileHistory`);

    const unsubscribe = onValue(historyRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Separate summaries from individual changes
        const summariesData = data.summaries || {};
        const historyData = { ...data };
        delete historyData.summaries;

        // Convert summaries to array and sort by timestamp
        const summariesArray = Object.entries(summariesData).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => b.timestamp - a.timestamp);

        // Convert history to array and sort by timestamp
        // Filter out entries where the original value was not set
        const historyArray = Object.entries(historyData)
          .map(([key, value]) => ({
            id: key,
            ...value
          }))
          .filter(item => {
            // Only include items where previousValue was actually set
            return item.previousValue !== null && 
                   item.previousValue !== undefined && 
                   item.previousValue !== '';
          })
          .sort((a, b) => b.changedAt - a.changedAt);

        setSummaries(summariesArray);
        setHistory(historyArray);
        
        // Fetch course names for all unique course IDs
        const uniqueCourseIds = new Set();
        [...summariesArray, ...historyArray].forEach(item => {
          if (item.courseId) {
            uniqueCourseIds.add(item.courseId);
          }
        });
        
        if (uniqueCourseIds.size > 0) {
          fetchCourseNames(Array.from(uniqueCourseIds), studentEmailKey);
        }
      } else {
        setSummaries([]);
        setHistory([]);
      }
      setLoading(false);
    });

    return () => {
      off(historyRef);
    };
  }, [studentEmailKey]);

  // Helper function to format date with time
  const formatDateWithTime = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const fetchCourseNames = async (courseIds, studentKey) => {
    const db = getDatabase();
    const courseNamesMap = {};
    
    try {
      // Fetch course names from the student's course data
      const promises = courseIds.map(async (courseId) => {
        const courseRef = ref(db, `students/${studentKey}/courses/${courseId}/Course/Value`);
        const snapshot = await get(courseRef);
        if (snapshot.exists()) {
          courseNamesMap[courseId] = snapshot.val();
        } else {
          // If not found in student data, try the courses node
          const globalCourseRef = ref(db, `courses/${courseId}/Title`);
          const globalSnapshot = await get(globalCourseRef);
          if (globalSnapshot.exists()) {
            courseNamesMap[courseId] = globalSnapshot.val();
          }
        }
      });
      
      await Promise.all(promises);
      setCourseNames(courseNamesMap);
    } catch (error) {
      console.error('Error fetching course names:', error);
    }
  };

  const formatFieldName = (fieldName) => {
    const fieldLabels = {
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'preferredFirstName': 'Preferred First Name',
      'StudentPhone': 'Phone Number',
      'gender': 'Gender',
      'birthday': 'Birthday',
      'address': 'Address',
      'asn': 'Alberta Student Number',
      'ParentFirstName': 'Parent First Name',
      'ParentLastName': 'Parent Last Name',
      'ParentPhone_x0023_': 'Parent Phone',
      'ParentEmail': 'Parent Email',
      'studentPhoto': 'Student Photo',
      'albertaResident': 'Alberta Resident',
      'parentRelationship': 'Parent Relationship',
      'isLegalGuardian': 'Legal Guardian',
      'hasLegalRestrictions': 'Legal Restrictions',
      'legalDocumentUrl': 'Legal Document',
      'indigenousIdentification': 'Indigenous Identification',
      'indigenousStatus': 'Indigenous Status',
      'citizenshipDocuments': 'Citizenship Documents',
      'howDidYouHear': 'How Did You Hear',
      'whyApplying': 'Why Applying',
      'internationalDocuments': 'International Documents',
      // Course enrollment fields
      'ActiveFutureArchived_Value': 'Enrollment Status',
      'Course_Value': 'Course',
      'PASI_Value': 'PASI Status',
      'ScheduleEndDate': 'Schedule End Date',
      'School_x0020_Year_Value': 'School Year',
      'Status_Value': 'Student Status',
      'StudentType_Value': 'Student Type',
      'DiplomaMonthChoices_Value': 'Diploma Month',
      'showStats': 'Show Statistics',
      'LMSStudentID': 'LMS Student ID',
      'primarySchoolAddress': 'Primary School',
      'pasiReferenceNumber': 'PASI Reference Number',
      'pasiEnrollmentStatus': 'PASI Enrollment Status',
      'pasiRequestFunding': 'PASI Request Funding',
      'pasiSubmittedFinalMark': 'PASI Submitted Final Mark'
    };
    return fieldLabels[fieldName] || fieldName;
  };

  // Helper function to get color and icon for specific field values
  const getFieldValueStyle = (value, fieldName) => {
    let color = null;
    let Icon = null;
    
    switch(fieldName) {
      case 'Status_Value':
        const statusOption = STATUS_OPTIONS.find(opt => opt.value === value);
        if (statusOption) {
          color = statusOption.color;
        }
        break;
      case 'Course_Value':
        const courseInfo = getCourseInfo(value);
        color = courseInfo.color;
        Icon = courseInfo.icon;
        break;
      case 'StudentType_Value':
        const studentTypeInfo = getStudentTypeInfo(value);
        color = studentTypeInfo.color;
        Icon = studentTypeInfo.icon;
        break;
      case 'ActiveFutureArchived_Value':
        color = getActiveFutureArchivedColor(value);
        break;
      case 'PASI_Value':
        color = getPasiColor(value);
        break;
      case 'School_x0020_Year_Value':
        color = getSchoolYearColor(value);
        break;
      case 'DiplomaMonthChoices_Value':
        color = getDiplomaMonthColor(value);
        break;
      case 'showStats':
        color = value ? '#10B981' : '#EF4444'; // Green for true, red for false
        break;
    }
    
    return { color, Icon };
  };

  const formatValue = (value, fieldName) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not set</span>;
    }

    // Get style for this field value
    const { color, Icon } = getFieldValueStyle(value, fieldName);

    // Handle boolean values
    if (typeof value === 'boolean') {
      const displayValue = value ? 'Yes' : 'No';
      return (
        <span style={{ color: color || 'inherit' }}>
          {displayValue}
        </span>
      );
    }

    // Handle address objects
    if (fieldName === 'address' && typeof value === 'object') {
      if (value.fullAddress) {
        return value.fullAddress;
      }
      return JSON.stringify(value);
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400 italic">None</span>;
      }
      return value.join(', ');
    }

    // Handle objects
    if (typeof value === 'object') {
      return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
    }

    // Render with color and icon if available
    return (
      <span className="inline-flex items-center gap-1" style={{ color: color || 'inherit' }}>
        {Icon && <Icon className="h-4 w-4" />}
        {value}
      </span>
    );
  };

  const toggleItemExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (loading) {
    return <div className="text-center py-4">Loading history...</div>;
  }

  if (history.length === 0 && summaries.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No history available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h3 className="text-lg font-semibold">History</h3>
            <Badge variant="secondary">{history.length} changes</Badge>
          </div>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.slice(0, 20).map((item) => (
                <div 
                  key={item.id} 
                  className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleItemExpanded(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-sm">
                          {formatFieldName(item.fieldName)}
                        </span>
                        {item.courseId && courseNames[item.courseId] && (
                          <span className="text-xs text-gray-500">
                            • {courseNames[item.courseId]}
                          </span>
                        )}
                      </div>
                      {!expandedItems[item.id] && (
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="text-gray-500">From:</span>
                          {formatValue(item.previousValue, item.fieldName)}
                          <span className="text-gray-400">→</span>
                          <span className="text-gray-500">To:</span>
                          {formatValue(item.newValue, item.fieldName)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-xs text-gray-500">
                        {formatDateWithTime(new Date(item.changedAt))}
                      </span>
                      {expandedItems[item.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {expandedItems[item.id] && (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-medium text-gray-600 mb-1">Previous Value:</div>
                          <div className="bg-red-50 p-2 rounded">
                            {formatValue(item.previousValue, item.fieldName)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600 mb-1">New Value:</div>
                          <div className="bg-green-50 p-2 rounded">
                            {formatValue(item.newValue, item.fieldName)}
                          </div>
                        </div>
                      </div>
                      {item.metadata && (
                        <div className="text-xs text-gray-500 mt-2 space-y-1">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Changed by: {item.metadata.userEmail || 'Unknown'}
                          </div>
                          {item.courseId && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Course Enrollment Change ({courseNames[item.courseId] || `Course ID: ${item.courseId}`})
                            </div>
                          )}
                          {item.metadata.isMassUpdate && item.metadata.massUpdateDetails && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Users className="h-3 w-3" />
                              Mass Update: {item.metadata.massUpdateDetails.totalStudents} students
                              {item.metadata.massUpdateDetails.propertyName && 
                                ` - ${item.metadata.massUpdateDetails.propertyName}`}
                              {item.metadata.massUpdateDetails.categoryName && 
                                ` - ${item.metadata.massUpdateDetails.categoryName} ${item.metadata.massUpdateDetails.action}`}
                            </div>
                          )}
                          {item.metadata.isFinalization && item.metadata.finalizationDetails && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <ClipboardCheck className="h-3 w-3" />
                              Finalization: {item.metadata.finalizationDetails.action}
                              {item.metadata.finalizationDetails.finalMark !== null && 
                                ` - Final Mark: ${item.metadata.finalizationDetails.finalMark}%`}
                            </div>
                          )}
                          {item.metadata.isResumingOn && item.metadata.resumingOnDetails && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <Clock className="h-3 w-3" />
                              Resuming On: {item.metadata.resumingOnDetails.displayDate}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {history.length > 20 && (
              <p className="text-sm text-gray-500 text-center mt-4">
                Showing most recent 20 changes of {history.length} total
              </p>
            )}
        </CardContent>
      )}
    </Card>
  );
};

export default ProfileHistory;