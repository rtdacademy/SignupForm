import React, { forwardRef, useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { 
  FileText, 
  Edit, 
  Link2, 
  Wrench, 
  Mail, 
  Info, 
  AlertTriangle, 
  HelpCircle, 
  BellRing,
  ArrowRight,
  Database,
  FileText as FileTextIcon,
  MapPin,
  ExternalLink,
  FileCheck
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getDatabase, ref as databaseRef, get } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';
import ProfileHistory from '../StudentManagement/ProfileHistory';

// Helper function to calculate age from birthday
const calculateAge = (birthday) => {
  if (!birthday) return 'N/A';
  
  try {
    const birthDate = new Date(birthday);
    const today = new Date();
    
    // Check if birthDate is valid
    if (isNaN(birthDate.getTime())) return 'N/A';
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // If birthday hasn't occurred yet this year, subtract one year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.error("Error calculating age:", error);
    return 'N/A';
  }
};

// Helper function to format dates in a user-friendly way
const formatUserFriendlyDate = (dateValue, isFormatted = false) => {
  if (!dateValue || dateValue === 'N/A') return 'N/A';
  
  try {
    let dateToFormat = dateValue;
    
    // Create a Date object from the string
    const date = new Date(dateValue);
    
    // Check if the date is valid
    if (!isNaN(date.getTime())) {
      // Format date in "Month DD, YYYY" format
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
    
    // Return original value if parsing fails
    return dateValue;
  } catch (error) {
    console.error("Error formatting user-friendly date:", error);
    return dateValue;
  }
};

// No comparison logic needed

// DataField component for displaying labeled data with source indicator
const DataField = ({ 
  label, 
  yourWayValue, 
  pasiValue, 
  onClick, 
  yourWayLabel = "YourWay",
  pasiLabel = "PASI",
  sourceType = "both" // Options: "yourway", "pasi", "both", "none"
}) => {
  return (
    <>
      <dt className="font-medium text-gray-500">{label}:</dt>
      <dd className="grid grid-cols-2 gap-2">
        {/* YourWay Value */}
        {(sourceType === "yourway" || sourceType === "both") && (
          <div className="cursor-pointer hover:text-blue-600" 
            onClick={() => onClick && yourWayValue && onClick(yourWayValue, label)}>
            <div className="flex items-center gap-1">
              {sourceType === "both" && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                >
                  {yourWayLabel}
                </Badge>
              )}
              <span>{yourWayValue || 'N/A'}</span>
            </div>
          </div>
        )}
        
        {/* PASI Value */}
        {(sourceType === "pasi" || sourceType === "both") && (
          <div className="cursor-pointer hover:text-blue-600" 
            onClick={() => onClick && pasiValue && onClick(pasiValue, label)}>
            <div className="flex items-center gap-1">
              {sourceType === "both" && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                >
                  {pasiLabel}
                </Badge>
              )}
              <span>{pasiValue || 'N/A'}</span>
            </div>
          </div>
        )}
        
        {/* Single value with no source indicator */}
        {sourceType === "none" && (
          <div className="col-span-2 cursor-pointer hover:text-blue-600"
            onClick={() => onClick && yourWayValue && onClick(yourWayValue, label)}>
            <span>{yourWayValue || 'N/A'}</span>
          </div>
        )}
      </dd>
    </>
  );
};

// SingleDataField component for displaying labeled data without source indicators
const SingleDataField = ({ 
  label, 
  value, 
  onClick
}) => {
  return (
    <>
      <dt className="font-medium text-gray-500">{label}:</dt>
      <dd className="cursor-pointer hover:text-blue-600" 
        onClick={() => onClick && value && onClick(value, label)}>
        <span>{value || 'N/A'}</span>
      </dd>
    </>
  );
};

// PasiRecordDetails component with forwardRef to allow parent components to pass a ref
const PasiRecordDetails = forwardRef(({ 
  record, 
  onClose, 
  onStaffReviewChange, 
  onEmailEdit,
  handleCellClick,
  isMissingPasi = false 
}, ref) => {
  if (!record) return null;
  
  // Log record to inspect available properties
  console.log('PasiRecordDetails - record:', record);
  
  // State for profile history
  const [isProfileHistoryOpen, setIsProfileHistoryOpen] = useState(false);
  const [hasProfileHistory, setHasProfileHistory] = useState(false);
  const [studentEmailKey, setStudentEmailKey] = useState('');
  
  // Calculate age from birthday if available
  const age = calculateAge(record.birthday);
  
  // Check if profile history exists
  useEffect(() => {
    const checkProfileHistory = async () => {
      if (!record.StudentEmail) {
        console.log("No StudentEmail found in record");
        return;
      }
      
      const db = getDatabase();
      const emailKey = sanitizeEmail(record.StudentEmail);
      console.log("Checking profile history for:", {
        originalEmail: record.StudentEmail,
        sanitizedKey: emailKey,
        path: `students/${emailKey}/profileHistory`
      });
      setStudentEmailKey(emailKey);
      
      const profileHistoryRef = databaseRef(db, `students/${emailKey}/profileHistory`);
      
      try {
        const snapshot = await get(profileHistoryRef);
        setHasProfileHistory(snapshot.exists());
        console.log("Profile history exists:", snapshot.exists());
      } catch (error) {
        console.error("Error checking profile history:", error);
        setHasProfileHistory(false);
      }
    };

    checkProfileHistory();
  }, [record.StudentEmail]);
  
  // Determine which data comes from which system
  const yourWayData = {
    asn: record.asn,
    firstName: record.firstName,
    lastName: record.lastName,
    preferredFirstName: record.preferredFirstName,
    email: record.StudentEmail,
    birthday: record.birthday,
    studentType: record.StudentType_Value,
    primarySchool: record.primarySchoolName,
    schoolYear: record.School_x0020_Year_Value,
    scheduleStartDate: record.ScheduleStartDate,
    scheduleEndDate: record.ScheduleEndDate,
    courseId: record.CourseID,
    courseName: record.Course_Value,
    term: record.Term,
    status: record.Status_Value,
    grade: undefined, // YourWay doesn't store final grades
    exitDate: undefined,
    gender: record.gender,
    payment_status: record.payment_status,
    resumingOnDate: record.resumingOnDate,
    studentPhone: record.StudentPhone
  };
  
  const pasiData = {
    asn: record.asn,
    studentName: record.studentName,
    email: record.email,
    courseCode: record.courseCode,
    courseDescription: record.courseDescription,
    term: record.pasiTerm,
    status: record.status,
    grade: record.value,
    exitDate: record.exitDate,
    schoolYear: record.schoolYear,
    assignmentDate: record.assignmentDate,
    approved: record.approved,
    deleted: record.deleted,
    dualEnrolment: record.dualEnrolment,
    schoolEnrolment: record.schoolEnrolment,
    creditsAttempted: record.creditsAttempted,
    fundingRequested: record.fundingRequested
  };
  
  // Parse PASI student name into first and last
  let pasiFirstName = '';
  let pasiLastName = '';
  if (pasiData.studentName) {
    const parts = pasiData.studentName.split(', ');
    if (parts.length > 1) {
      pasiLastName = parts[0];
      pasiFirstName = parts[1];
    }
  }
  
  // Format PASI school year to match YourWay format
  if (pasiData.schoolYear && pasiData.schoolYear.includes('_')) {
    pasiData.schoolYear = pasiData.schoolYear.replace('_', '/');
  }
  
  return (
    <>
      <Card className="mt-4" ref={ref}>
      <CardHeader className="py-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> 
              {isMissingPasi ? 'Student Details' : 'PASI Record Details'}
              {isMissingPasi && (
                <Badge className="ml-2 bg-amber-100 text-amber-800 border-amber-300 text-xs">
                  Not in PASI
                </Badge>
              )}
              {record.isSubRecord && (
                <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-300 text-xs">
                  Additional Record {record.subRecordIndex}
                </Badge>
              )}
            </CardTitle>
        <CardDescription className="text-xs flex justify-between">
          <span>
            {isMissingPasi ? 
              `${record.studentName || `${record.lastName}, ${record.firstName}`} - ${record.Course_Value || record.courseValue}` :
              `${record.studentName} - ${record.courseCode} (${record.courseDescription})`
            }
          </span>
          {!isMissingPasi && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="flex items-center bg-blue-50 text-blue-700 border-blue-200 text-xs"
              >
                <Database className="h-3 w-3 mr-1" /> YourWay
              </Badge>
              <ArrowRight className="h-3 w-3 text-gray-400" />
              <Badge 
                variant="outline" 
                className="flex items-center bg-green-50 text-green-700 border-green-200 text-xs"
              >
                <Database className="h-3 w-3 mr-1" /> PASI
              </Badge>
            </div>
          )}
        </CardDescription>
          </div>
          {/* Student Photo */}
          {record.studentPhoto && (
            <div className="flex-shrink-0">
              <img 
                src={record.studentPhoto} 
                alt="Student photo" 
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                onClick={() => window.open(record.studentPhoto, '_blank')}
                style={{ cursor: 'pointer' }}
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="text-xs py-2">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h3 className="font-medium mb-2 text-sm flex items-center">
              <span>Student Information</span>
            </h3>
            <dl className="grid grid-cols-[1fr_3fr] gap-2">
              <SingleDataField 
                label="ASN" 
                value={record.asn} 
                onClick={handleCellClick}
              />
              
              {/* Name Fields */}
              <dt className="font-medium text-gray-500">First Name:</dt>
              <dd className="cursor-pointer hover:text-blue-600" 
                onClick={() => handleCellClick && yourWayData.firstName && handleCellClick(yourWayData.firstName, "First Name")}>
                {isMissingPasi ? (
                  <span>{yourWayData.firstName || 'N/A'}</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      YourWay
                    </Badge>
                    <span>{yourWayData.firstName || 'N/A'}</span>
                  </div>
                )}
              </dd>
              
              <dt className="font-medium text-gray-500">Last Name:</dt>
              <dd className="cursor-pointer hover:text-blue-600" 
                onClick={() => handleCellClick && yourWayData.lastName && handleCellClick(yourWayData.lastName, "Last Name")}>
                {isMissingPasi ? (
                  <span>{yourWayData.lastName || 'N/A'}</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      YourWay
                    </Badge>
                    <span>{yourWayData.lastName || 'N/A'}</span>
                  </div>
                )}
              </dd>
              
              
              {/* Preferred Name - YourWay only */}
              {yourWayData.preferredFirstName && (
                <SingleDataField 
                  label="Preferred Name" 
                  value={yourWayData.preferredFirstName} 
                  onClick={handleCellClick}
                />
              )}
              
              {/* Email */}
              <dt className="font-medium text-gray-500">Email:</dt>
              <dd className={isMissingPasi ? "" : "grid grid-cols-2 gap-2"}>
                {isMissingPasi ? (
                  <div className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && yourWayData.email && handleCellClick(yourWayData.email, "Email")}>
                    <span>{yourWayData.email || 'N/A'}</span>
                  </div>
                ) : (
                  <>
                    <div className="cursor-pointer hover:text-blue-600" 
                      onClick={() => handleCellClick && yourWayData.email && handleCellClick(yourWayData.email, "Email")}>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <span>{yourWayData.email || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="cursor-pointer hover:text-blue-600" 
                      onClick={() => handleCellClick && pasiData.email && handleCellClick(pasiData.email, "Email")}>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                        >
                          PASI
                        </Badge>
                        <span>{pasiData.email || 'N/A'}</span>
                        {onEmailEdit && (
                          <Button 
                            variant="ghost" 
                            size="xs" 
                            className="h-5 w-5 p-0" 
                            onClick={() => onEmailEdit(record)}
                          >
                            <Edit className="h-3 w-3 text-blue-500" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </dd>
              
              {/* Birthday - YourWay only */}
              <dt className="font-medium text-gray-500">Birthday:</dt>
              <dd className="cursor-pointer hover:text-blue-600" 
                onClick={() => handleCellClick && record.birthday && handleCellClick(record.birthday, "Birthday")}>
                {isMissingPasi ? (
                  <span>{record.birthday ? formatUserFriendlyDate(record.birthday) : 'N/A'}</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      YourWay
                    </Badge>
                    <span>{record.birthday ? formatUserFriendlyDate(record.birthday) : 'N/A'}</span>
                  </div>
                )}
              </dd>
              
              <dt className="font-medium text-gray-500">Age:</dt>
              <dd>{age}</dd>
              
              {/* Phone - YourWay only */}
              {yourWayData.studentPhone && (
                <>
                  <dt className="font-medium text-gray-500">Phone:</dt>
                  <dd className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && yourWayData.studentPhone && handleCellClick(yourWayData.studentPhone, "Phone")}>
                    {isMissingPasi ? (
                      <span>{yourWayData.studentPhone || 'N/A'}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <span>{yourWayData.studentPhone || 'N/A'}</span>
                      </div>
                    )}
                  </dd>
                </>
              )}
              
              {/* Full Address - YourWay only */}
              {record.address && record.address.formattedAddress && (
                <>
                  <dt className="font-medium text-gray-500">Address:</dt>
                  <dd>
                    <div className="flex items-center gap-2">
                      {!isMissingPasi && (
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                      )}
                      <span className="cursor-pointer" 
                        onClick={() => handleCellClick && record.address.formattedAddress && handleCellClick(record.address.formattedAddress, "Address")}>
                        {record.address.formattedAddress}
                      </span>
                      {record.address.placeId && (
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-6 px-2 text-xs flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${record.address.placeId}`, '_blank')}
                          title="View on Google Maps"
                        >
                          <MapPin className="h-3 w-3" />
                          Maps
                        </Button>
                      )}
                    </div>
                  </dd>
                </>
              )}
              
              {/* Student Type - YourWay only */}
              <dt className="font-medium text-gray-500">Student Type:</dt>
              <dd className="cursor-pointer hover:text-blue-600" 
                onClick={() => handleCellClick && yourWayData.studentType && handleCellClick(yourWayData.studentType, "Student Type")}>
                {isMissingPasi ? (
                  <span>{yourWayData.studentType || 'N/A'}</span>
                ) : (
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant="outline" 
                      className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      YourWay
                    </Badge>
                    <span>{yourWayData.studentType || 'N/A'}</span>
                  </div>
                )}
              </dd>
              
              {/* Primary School - YourWay only (if exists) */}
              {yourWayData.primarySchool && (
                <>
                  <dt className="font-medium text-gray-500">Primary School:</dt>
                  <dd className="col-span-2 cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && yourWayData.primarySchool && handleCellClick(yourWayData.primarySchool, "Primary School")}>
                    {isMissingPasi ? (
                      <span>{yourWayData.primarySchool}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <span>{yourWayData.primarySchool}</span>
                      </div>
                    )}
                  </dd>
                </>
              )}
              
              {/* School Year */}
              <dt className="font-medium text-gray-500">School Year:</dt>
              <dd className="cursor-pointer hover:text-blue-600"
                onClick={() => handleCellClick && yourWayData.schoolYear && handleCellClick(yourWayData.schoolYear, "School Year")}>
                {isMissingPasi ? (
                  <span>{yourWayData.schoolYear || 'N/A'}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        YourWay
                      </Badge>
                      <span>{yourWayData.schoolYear || 'N/A'}</span>
                    </div>
                    {pasiData.schoolYear && (
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                        >
                          PASI
                        </Badge>
                        <span>{pasiData.schoolYear || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                )}
              </dd>
              
              {/* Registration Date */}
              <dt className="font-medium text-gray-500">Registration Date:</dt>
              <dd className="cursor-pointer hover:text-blue-600" 
                onClick={() => handleCellClick && record.startDateFormatted && handleCellClick(record.startDateFormatted, "Registration Date")}>
                <span>
                  {record.startDateFormatted && record.startDateFormatted !== 'N/A' ? 
                    formatUserFriendlyDate(record.startDateFormatted, true) : 'N/A'}
                </span>
                {record.startDateSource && (
                  <span className="text-xs text-gray-500 ml-1">
                    (Source: {record.startDateSource})
                  </span>
                )}
              </dd>
            </dl>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-sm flex items-center">
              <span>Course Information</span>
            </h3>
            <dl className="grid grid-cols-[1fr_3fr] gap-2">
              {/* Course ID / Code */}
              <dt className="font-medium text-gray-500">{isMissingPasi ? 'Course ID:' : 'Course ID/Code:'}</dt>
              <dd className={isMissingPasi ? "" : "grid grid-cols-2 gap-2"}>
                {isMissingPasi ? (
                  <div className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && yourWayData.courseId && handleCellClick(yourWayData.courseId, "Course ID")}>
                    <span>{yourWayData.courseId || 'N/A'}</span>
                  </div>
                ) : (
                  <>
                    <div className="cursor-pointer hover:text-blue-600" 
                      onClick={() => handleCellClick && yourWayData.courseId && handleCellClick(yourWayData.courseId, "Course ID")}>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <span>{yourWayData.courseId || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="cursor-pointer hover:text-blue-600" 
                      onClick={() => handleCellClick && pasiData.courseCode && handleCellClick(pasiData.courseCode, "Course Code")}>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                        >
                          PASI
                        </Badge>
                        <span>{pasiData.courseCode || 'N/A'}</span>
                      </div>
                    </div>
                  </>
                )}
              </dd>
              
              {/* Course Name / Description */}
              <dt className="font-medium text-gray-500">{isMissingPasi ? 'Course Name:' : 'Description:'}</dt>
              <dd className={isMissingPasi ? "" : "grid grid-cols-2 gap-2"}>
                {isMissingPasi ? (
                  <div className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && yourWayData.courseName && handleCellClick(yourWayData.courseName, "Course Name")}>
                    <span>{yourWayData.courseName || 'N/A'}</span>
                  </div>
                ) : (
                  <>
                    <div className="cursor-pointer hover:text-blue-600" 
                      onClick={() => handleCellClick && yourWayData.courseName && handleCellClick(yourWayData.courseName, "Course Name")}>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <span>{yourWayData.courseName || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="cursor-pointer hover:text-blue-600" 
                      onClick={() => handleCellClick && pasiData.courseDescription && handleCellClick(pasiData.courseDescription, "Course Description")}>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                        >
                          PASI
                        </Badge>
                        <span>{pasiData.courseDescription || 'N/A'}</span>
                      </div>
                    </div>
                  </>
                )}
              </dd>
              
              {/* Term - PASI only - hide in MissingPasi mode */}
              {!isMissingPasi && (
                <>
                  <dt className="font-medium text-gray-500">Term:</dt>
                  <dd className="cursor-pointer hover:text-blue-600"
                    onClick={() => handleCellClick && pasiData.term && handleCellClick(pasiData.term, "Term")}
                  >
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                      >
                        PASI
                      </Badge>
                      <Badge className="text-xs py-0 px-1.5 bg-green-50 text-green-700 border-green-200">
                        {pasiData.term || 'N/A'}
                      </Badge>
                    </div>
                  </dd>
                </>
              )}
              
              {/* Status */}
              <dt className="font-medium text-gray-500">Status:</dt>
              <dd className={isMissingPasi ? "" : "grid grid-cols-2 gap-2"}>
                {isMissingPasi ? (
                  <div className="cursor-pointer hover:text-blue-600"
                    onClick={() => handleCellClick && yourWayData.status && handleCellClick(yourWayData.status, "Status")}
                  >
                    <Badge 
                      variant={yourWayData.status === 'Completed' ? 'success' : 'secondary'}
                      className={`
                        text-xs py-0 px-1.5
                        ${yourWayData.status === 'Completed' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : yourWayData.status === 'Active'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      `}
                    >
                      {yourWayData.status || 'N/A'}
                    </Badge>
                  </div>
                ) : (
                  <>
                    <div className="cursor-pointer hover:text-blue-600"
                      onClick={() => handleCellClick && yourWayData.status && handleCellClick(yourWayData.status, "Status")}
                    >
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <Badge 
                          variant={yourWayData.status === 'Completed' ? 'success' : 'secondary'}
                          className={`
                            text-xs py-0 px-1.5
                            ${yourWayData.status === 'Completed' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : yourWayData.status === 'Active'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }
                          `}
                        >
                          {yourWayData.status || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                    <div className="cursor-pointer hover:text-blue-600"
                      onClick={() => handleCellClick && pasiData.status && handleCellClick(pasiData.status, "Status")}
                    >
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                        >
                          PASI
                        </Badge>
                        <Badge 
                          variant={pasiData.status === 'Completed' ? 'success' : 'secondary'}
                          className={`
                            text-xs py-0 px-1.5
                            ${pasiData.status === 'Completed' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : pasiData.status === 'Active'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }
                          `}
                        >
                          {pasiData.status || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}
              </dd>
              
              {/* Grade - PASI only - hide in MissingPasi mode */}
              {!isMissingPasi && (
                <>
                  <dt className="font-medium text-gray-500">Grade:</dt>
                  <dd className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && pasiData.grade && handleCellClick(pasiData.grade, "Grade")}>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                      >
                        PASI
                      </Badge>
                      <span>{pasiData.grade && pasiData.grade !== '-' ? pasiData.grade : 'N/A'}</span>
                    </div>
                  </dd>
                </>
              )}
              
              {/* Assignment Date - PASI only - hide in MissingPasi mode */}
              {!isMissingPasi && pasiData.assignmentDate && (
                <>
                  <dt className="font-medium text-gray-500">Assignment Date:</dt>
                  <dd className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && pasiData.assignmentDate && handleCellClick(pasiData.assignmentDate, "Assignment Date")}>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                      >
                        PASI
                      </Badge>
                      <span>{pasiData.assignmentDate ? formatUserFriendlyDate(pasiData.assignmentDate) : 'N/A'}</span>
                    </div>
                  </dd>
                </>
              )}
              
              {/* Exit Date - PASI only - hide in MissingPasi mode */}
              {!isMissingPasi && (
                <>
                  <dt className="font-medium text-gray-500">Exit Date:</dt>
                  <dd className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && pasiData.exitDate && pasiData.exitDate !== 'N/A' && handleCellClick(pasiData.exitDate, "Exit Date")}>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                      >
                        PASI
                      </Badge>
                      <span>
                        {pasiData.exitDate && pasiData.exitDate !== 'N/A' ? 
                          formatUserFriendlyDate(pasiData.exitDate) : 'N/A'}
                      </span>
                    </div>
                  </dd>
                </>
              )}
              
              {/* Schedule Start/End Dates - YourWay only */}
              {yourWayData.scheduleStartDate && (
                <>
                  <dt className="font-medium text-gray-500">Schedule Period:</dt>
                  <dd className="cursor-pointer hover:text-blue-600"
                    onClick={() => handleCellClick && yourWayData.scheduleStartDate && handleCellClick(`${formatUserFriendlyDate(yourWayData.scheduleStartDate)} to ${formatUserFriendlyDate(yourWayData.scheduleEndDate)}`, "Schedule Period")}>
                    {isMissingPasi ? (
                      <span>
                        {formatUserFriendlyDate(yourWayData.scheduleStartDate)}
                        {yourWayData.scheduleEndDate && (
                          <> to {formatUserFriendlyDate(yourWayData.scheduleEndDate)}</>
                        )}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <span>
                          {formatUserFriendlyDate(yourWayData.scheduleStartDate)}
                          {yourWayData.scheduleEndDate && (
                            <> to {formatUserFriendlyDate(yourWayData.scheduleEndDate)}</>
                          )}
                        </span>
                      </div>
                    )}
                  </dd>
                </>
              )}
              
              {/* Resuming On Date - YourWay only */}
              {yourWayData.resumingOnDate && (
                <>
                  <dt className="font-medium text-gray-500">Resuming On:</dt>
                  <dd className="cursor-pointer hover:text-blue-600" 
                    onClick={() => handleCellClick && yourWayData.resumingOnDate && handleCellClick(yourWayData.resumingOnDate, "Resuming On")}>
                    {isMissingPasi ? (
                      <span>{formatUserFriendlyDate(yourWayData.resumingOnDate)}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <span>{formatUserFriendlyDate(yourWayData.resumingOnDate)}</span>
                      </div>
                    )}
                  </dd>
                </>
              )}
              
              {/* PASI-specific fields - hide in MissingPasi mode */}
              {!isMissingPasi && pasiData.creditsAttempted && (
                <>
                  <dt className="font-medium text-gray-500">Credits:</dt>
                  <dd className="cursor-pointer hover:text-blue-600">
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                      >
                        PASI
                      </Badge>
                      <span>{pasiData.creditsAttempted}</span>
                    </div>
                  </dd>
                </>
              )}
              
              {!isMissingPasi && pasiData.approved && (
                <>
                  <dt className="font-medium text-gray-500">Approved:</dt>
                  <dd className="cursor-pointer hover:text-blue-600">
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                      >
                        PASI
                      </Badge>
                      <span>{pasiData.approved}</span>
                    </div>
                  </dd>
                </>
              )}
              
              {!isMissingPasi && pasiData.fundingRequested && (
                <>
                  <dt className="font-medium text-gray-500">Funding Requested:</dt>
                  <dd className="cursor-pointer hover:text-blue-600">
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                      >
                        PASI
                      </Badge>
                      <span>{pasiData.fundingRequested}</span>
                    </div>
                  </dd>
                </>
              )}
              
              {/* Payment Status - YourWay only */}
              {yourWayData.payment_status && (
                <>
                  <dt className="font-medium text-gray-500">Payment Status:</dt>
                  <dd className="cursor-pointer hover:text-blue-600"
                    onClick={() => handleCellClick && yourWayData.payment_status && handleCellClick(yourWayData.payment_status, "Payment Status")}>
                    {isMissingPasi ? (
                      <span>{yourWayData.payment_status}</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] py-0 px-1 bg-blue-50 text-blue-700 border-blue-200"
                        >
                          YourWay
                        </Badge>
                        <span>{yourWayData.payment_status}</span>
                      </div>
                    )}
                  </dd>
                </>
              )}
              
              {/* Reference # - PASI only - hide in MissingPasi mode */}
              {!isMissingPasi && (
                <>
                  <dt className="font-medium text-gray-500">Reference #:</dt>
                  <dd className="cursor-pointer hover:text-blue-600 break-all" 
                    onClick={() => handleCellClick && record.referenceNumber && handleCellClick(record.referenceNumber, "Reference Number")}>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className="text-[10px] py-0 px-1 bg-green-50 text-green-700 border-green-200"
                      >
                        PASI
                      </Badge>
                      <span>{record.referenceNumber || 'N/A'}</span>
                    </div>
                  </dd>
                </>
              )}
              
              {/* SummaryKey (for reference only) */}
              {record.summaryKey && (
                <>
                  <dt className="font-medium text-gray-500">Summary Key:</dt>
                  <dd className="cursor-pointer hover:text-blue-600 break-all" 
                    onClick={() => handleCellClick && record.summaryKey && handleCellClick(record.summaryKey, "Summary Key")}>
                    <span className="text-xs text-gray-600">{record.summaryKey}</span>
                    {onEmailEdit && (
                      <Button 
                        variant="ghost" 
                        size="xs"
                        className="ml-1 h-5 w-5 p-0"
                        onClick={() => onEmailEdit(record)}
                      >
                        <Edit className="h-3 w-3 text-blue-500" />
                      </Button>
                    )}
                  </dd>
                </>
              )}
              
              {/* Work Items - hide in MissingPasi mode */}
              {!isMissingPasi && record.workItems && (
                <>
                  <dt className="font-medium text-gray-500">Work Items:</dt>
                  <dd className="flex items-center gap-1">
                    {(() => {
                      if (record.workItems === 'Advice') {
                        return <Info className="h-3 w-3 text-blue-500" />;
                      } else if (record.workItems === 'Warning') {
                        return <AlertTriangle className="h-3 w-3 text-amber-500" />;
                      } else if (record.workItems === 'Unknown') {
                        return <HelpCircle className="h-3 w-3 text-purple-500" />;
                      } else {
                        return <BellRing className="h-3 w-3 text-gray-500" />;
                      }
                    })()}
                    {record.workItems}
                  </dd>
                </>
              )}
            </dl>
          </div>
          
          {/* Documents Section */}
          {(record.citizenshipDocuments?.length > 0 || record.internationalDocuments) && (
            <div>
              <h3 className="font-medium mb-2 text-sm flex items-center">
                <span>Documents</span>
              </h3>
              <dl className="grid grid-cols-[1fr_3fr] gap-2">
                {/* Citizenship Documents */}
                {record.citizenshipDocuments?.length > 0 && (
                  <>
                    <dt className="font-medium text-gray-500">Citizenship:</dt>
                    <dd>
                      <div className="flex flex-wrap gap-2">
                        {record.citizenshipDocuments.map((doc, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="xs"
                            className="text-xs flex items-center gap-1"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <FileCheck className="h-3 w-3" />
                            {doc.typeLabel || doc.type}
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        ))}
                      </div>
                    </dd>
                  </>
                )}
                
                {/* International Documents */}
                {record.internationalDocuments && (
                  <>
                    <dt className="font-medium text-gray-500">International:</dt>
                    <dd>
                      <div className="flex flex-wrap gap-2">
                        {record.internationalDocuments.passport && (
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-xs flex items-center gap-1"
                            onClick={() => window.open(record.internationalDocuments.passport, '_blank')}
                          >
                            <FileCheck className="h-3 w-3" />
                            Passport
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        {record.internationalDocuments.additionalID && (
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-xs flex items-center gap-1"
                            onClick={() => window.open(record.internationalDocuments.additionalID, '_blank')}
                          >
                            <FileCheck className="h-3 w-3" />
                            Additional ID
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                        {record.internationalDocuments.residencyProof && (
                          <Button
                            variant="outline"
                            size="xs"
                            className="text-xs flex items-center gap-1"
                            onClick={() => window.open(record.internationalDocuments.residencyProof, '_blank')}
                          >
                            <FileCheck className="h-3 w-3" />
                            Residency Proof
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </dd>
                  </>
                )}
              </dl>
            </div>
          )}
        </div>
        
        {/* Additional Information about Multiple Records - hide in MissingPasi mode */}
        {!isMissingPasi && !record.isSubRecord && record.multipleRecords && record.multipleRecords.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2 text-sm">Multiple PASI Records</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-amber-800 flex items-center mb-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                This student has multiple PASI records for this course
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {record.multipleRecords.map((subRecord, index) => (
                  <div key={subRecord.referenceNumber || index} className="bg-white border border-gray-200 rounded-md p-2">
                    <div className="flex justify-between items-center mb-1">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        Record {index + 1}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {subRecord.referenceNumber === record.referenceNumber ? '(Current)' : ''}
                      </span>
                    </div>
                    <dl className="grid grid-cols-[1fr_1.5fr] gap-1 text-xs">
                      <dt className="font-medium text-gray-500">Status:</dt>
                      <dd>{subRecord.status || 'N/A'}</dd>
                      
                      <dt className="font-medium text-gray-500">Term:</dt>
                      <dd>{subRecord.term || 'N/A'}</dd>
                      
                      <dt className="font-medium text-gray-500">Exit Date:</dt>
                      <dd>{subRecord.exitDateFormatted ? 
                          formatUserFriendlyDate(subRecord.exitDateFormatted, true) : 
                          (subRecord.exitDate ? formatUserFriendlyDate(subRecord.exitDate) : 'N/A')}
                      </dd>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Related PASI Records - hide in MissingPasi mode */}
        {!isMissingPasi && record.pasiRecords && Object.keys(record.pasiRecords).length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2 text-sm">Other PASI Records</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-blue-800 flex items-center mb-2">
                <Info className="h-3 w-3 mr-1" />
                This student has additional PASI records for other courses
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(record.pasiRecords).map(([courseCode, pasiRecord]) => (
                  <div key={courseCode} className="bg-white border border-gray-200 rounded-md p-2">
                    <div className="flex justify-between items-center mb-1">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {courseCode.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {pasiRecord.pasiRecordID === record.id ? '(Current)' : ''}
                      </span>
                    </div>
                    <dl className="grid grid-cols-[1fr_1.5fr] gap-1 text-xs">
                      <dt className="font-medium text-gray-500">Description:</dt>
                      <dd>{pasiRecord.courseDescription || 'N/A'}</dd>
                      
                      <dt className="font-medium text-gray-500">Term:</dt>
                      <dd>{pasiRecord.term || 'N/A'}</dd>
                      
                      <dt className="font-medium text-gray-500">Credits:</dt>
                      <dd>{pasiRecord.creditsAttempted || 'N/A'}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 py-2">
        <Button 
          variant="outline" 
          size="sm"
          className="text-purple-600 hover:text-purple-700"
          onClick={() => setIsProfileHistoryOpen(true)}
        >
          <FileTextIcon className="w-4 h-4 mr-1" />
          History
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>
      </CardFooter>
    </Card>
    
    {/* Profile History Dialog */}
    <Dialog open={isProfileHistoryOpen} onOpenChange={setIsProfileHistoryOpen}>
      <DialogContent className="max-w-[90vw] w-[800px] h-[80vh] max-h-[700px] p-4 flex flex-col">
        <DialogHeader className="mb-4 bg-white">
          <DialogTitle>
            Profile Change History - {record.firstName} {record.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-auto">
          <ProfileHistory studentEmailKey={studentEmailKey} />
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
});

// Add display name for React DevTools
PasiRecordDetails.displayName = 'PasiRecordDetails';

export default PasiRecordDetails;