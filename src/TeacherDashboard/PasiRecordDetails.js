import React, { forwardRef } from 'react';
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
  BellRing 
} from 'lucide-react';

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

// PasiRecordDetails component with forwardRef to allow parent components to pass a ref
const PasiRecordDetails = forwardRef(({ 
  record, 
  onClose, 
  onStaffReviewChange, 
  onEmailEdit,
  handleCellClick 
}, ref) => {
  if (!record) return null;
  
  // Calculate age from birthday if available
  const age = calculateAge(record.birthday);
  
  return (
    <Card className="mt-4" ref={ref}>
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> 
          PASI Record Details
          {record.isSubRecord && (
            <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-300 text-xs">
              Additional Record {record.subRecordIndex}
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          {record.studentName} - {record.courseCode} ({record.courseDescription})
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-xs py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2 text-sm">Student Information</h3>
            <dl className="grid grid-cols-[1fr_2fr] gap-1">
              <dt className="font-medium text-gray-500">ASN:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.asn, "ASN")}>
                {record.asn || 'N/A'}
              </dd>
              
              <dt className="font-medium text-gray-500">Name:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.studentName, "Name")}>
                {record.studentName || 'N/A'}
              </dd>
              
              <dt className="font-medium text-gray-500">Email:</dt>
              <dd className="flex items-center gap-1">
                <span 
                  className="cursor-pointer hover:text-blue-600" 
                  onClick={() => handleCellClick(record.email, "Email")}
                >
                  {record.email || 'N/A'}
                </span>
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
              </dd>
              
              <dt className="font-medium text-gray-500">Birthday:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.birthday, "Birthday")}>
                {record.birthday ? formatUserFriendlyDate(record.birthday) : 'N/A'}
              </dd>
              
              <dt className="font-medium text-gray-500">Age:</dt>
              <dd>{age}</dd>
              
              <dt className="font-medium text-gray-500">Student Type:</dt>
              <dd>{record.studentType_Value || record.displayStudentType || 'N/A'}</dd>
              
              {record.primarySchoolName && record.primarySchoolName.trim() !== '' && (
                <>
                  <dt className="font-medium text-gray-500">Primary School:</dt>
                  <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.primarySchoolName, "Primary School")}>
                    {record.primarySchoolName}
                  </dd>
                </>
              )}
              
              <dt className="font-medium text-gray-500">School Year:</dt>
              <dd>{record.schoolYear || record.School_x0020_Year_Value || 'N/A'}</dd>
              
              <dt className="font-medium text-gray-500">Registration Date:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.startDateFormatted, "Registration Date")}>
                {record.startDateFormatted && record.startDateFormatted !== 'N/A' ? 
                  formatUserFriendlyDate(record.startDateFormatted, true) : 'N/A'}
              </dd>
            </dl>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-sm">Course Information</h3>
            <dl className="grid grid-cols-[1fr_2fr] gap-1">
              <dt className="font-medium text-gray-500">Course Code:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.courseCode, "Course Code")}>
                {record.courseCode || 'N/A'}
              </dd>
              
              <dt className="font-medium text-gray-500">Description:</dt>
              <dd>{record.courseDescription || 'N/A'}</dd>
              
              <dt className="font-medium text-gray-500">Term:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.pasiTerm || record.displayTerm || record.term, "Term")}>
                <Badge className="text-xs py-0 px-1.5">
                  {record.pasiTerm || record.displayTerm || record.term || 'N/A'}
                </Badge>
              </dd>
              
              <dt className="font-medium text-gray-500">Status:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.status, "Status")}>
                <Badge 
                  variant={record.status === 'Completed' ? 'success' : 'secondary'}
                  className={`
                    text-xs py-0 px-1.5
                    ${record.status === 'Completed' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : record.status === 'Active'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }
                  `}
                >
                  {record.status || 'N/A'}
                </Badge>
              </dd>
              
              <dt className="font-medium text-gray-500">Grade:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.value, "Grade")}>
                {record.value && record.value !== '-' ? record.value : 'N/A'}
              </dd>
              
              <dt className="font-medium text-gray-500">Exit Date:</dt>
              <dd className="cursor-pointer hover:text-blue-600" onClick={() => handleCellClick(record.exitDateFormatted || record.exitDate, "Exit Date")}>
                {record.exitDateFormatted && record.exitDateFormatted !== 'N/A' ? 
                  formatUserFriendlyDate(record.exitDateFormatted, true) : 'N/A'}
              </dd>
              
              <dt className="font-medium text-gray-500">Reference #:</dt>
              <dd className="cursor-pointer hover:text-blue-600 break-all" onClick={() => handleCellClick(record.referenceNumber, "Reference Number")}>
                {record.referenceNumber || 'N/A'}
              </dd>
              
              {/* Link Status */}
              <dt className="font-medium text-gray-500">Link Status:</dt>
              <dd className="flex items-center gap-2">
                {record.summaryKey ? (
                  <>
                    <Link2 className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Linked</span>
                    <span className="text-xs text-gray-500 ml-1">({record.summaryKey})</span>
                    {onEmailEdit && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs h-6 ml-1"
                        onClick={() => onEmailEdit(record)}
                      >
                        Edit
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <Wrench className="h-4 w-4 text-amber-600" />
                      <span className="text-amber-600 ml-1">Not linked</span>
                    </div>
                    {onEmailEdit && (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-6 flex items-center gap-1"
                          onClick={() => onEmailEdit(record)}
                        >
                          <Mail className="h-3 w-3" />
                          Link Now
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </dd>
              
              {/* Staff Review Status */}
              {onStaffReviewChange && (
                <>
                  <dt className="font-medium text-gray-500">Staff Review:</dt>
                  <dd className="flex items-center gap-2">
                    <Checkbox 
                      checked={record.staffReview === true}
                      onCheckedChange={(checked) => onStaffReviewChange(checked, record)}
                      className="h-4 w-4 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <span>{record.staffReview ? 'Reviewed' : 'Not reviewed'}</span>
                  </dd>
                </>
              )}
              
              {/* Work Items */}
              {record.workItems && (
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
        </div>
        
        {/* Additional Information about Multiple Records */}
        {!record.isSubRecord && record.multipleRecords && record.multipleRecords.length > 0 && (
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
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 py-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
        >
          Close
        </Button>
      </CardFooter>
    </Card>
  );
});

// Add display name for React DevTools
PasiRecordDetails.displayName = 'PasiRecordDetails';

export default PasiRecordDetails;