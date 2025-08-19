import React, { useMemo } from 'react';
import { 
  Hash, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ChevronRight,
  Phone,
  Mail,
  UserCheck,
  AlertTriangle,
  XCircle,
  BookOpen,
  Shield,
  Edit,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { formatDateForDisplay } from '../../utils/timeZoneUtils';

const StudentRegistrationCard = ({ 
  student, 
  familyData, 
  schoolYear, 
  onSelect, 
  onMarkRegistered,
  compact = false 
}) => {
  const dbSchoolYear = schoolYear.replace('/', '_');
  
  // Calculate registration progress
  const registrationProgress = useMemo(() => {
    let completed = 0;
    let total = 5; // Total required items
    
    // Check ASN
    if (student.asn) completed++;
    
    // Check notification form
    const notificationForm = familyData?.NOTIFICATION_FORMS?.[dbSchoolYear]?.[student.id];
    if (notificationForm?.submissionStatus === 'submitted') completed++;
    
    // Check citizenship docs
    const citizenshipDocs = familyData?.STUDENT_CITIZENSHIP_DOCS?.[student.id];
    if (citizenshipDocs?.staffApproval?.isApproved) completed++;
    
    // Check SOLO plan
    const soloPlan = familyData?.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[student.id];
    if (soloPlan?.submissionStatus === 'submitted') completed++;
    
    // Check address
    const primaryGuardian = familyData?.guardians ? 
      Object.values(familyData.guardians).find(g => g.guardianType === 'primary_guardian') : null;
    if (primaryGuardian?.address) completed++;
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  }, [student, familyData, dbSchoolYear]);
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ready':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'missing-asn':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'missing-notification':
      case 'missing-docs':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'docs-review':
      case 'missing-plan':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'ready':
        return <Clock className="w-4 h-4" />;
      case 'missing-asn':
        return <Hash className="w-4 h-4" />;
      case 'missing-notification':
      case 'missing-docs':
        return <XCircle className="w-4 h-4" />;
      case 'docs-review':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };
  
  // Get student address
  const studentAddress = useMemo(() => {
    const primaryGuardian = familyData?.guardians ? 
      Object.values(familyData.guardians).find(g => g.guardianType === 'primary_guardian') : null;
    
    if (primaryGuardian?.address) {
      return {
        street: primaryGuardian.address.streetAddress,
        city: primaryGuardian.address.city,
        province: primaryGuardian.address.province,
        postalCode: primaryGuardian.address.postalCode,
        full: primaryGuardian.address.fullAddress
      };
    }
    return null;
  }, [familyData]);
  
  // Get SOLO plan info
  const soloPlanInfo = useMemo(() => {
    const soloPlan = familyData?.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[student.id];
    if (!soloPlan) return null;
    
    return {
      followsAlberta: soloPlan.followAlbertaPrograms,
      selectedCourses: soloPlan.selectedAlbertaCourses,
      otherCourses: soloPlan.otherCourses || []
    };
  }, [familyData, dbSchoolYear, student.id]);
  
  // Calculate age
  const age = useMemo(() => {
    if (!student.birthday) return null;
    const birthDate = new Date(student.birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [student.birthday]);
  
  if (compact) {
    return (
      <Card 
        className="hover:shadow-md transition-all cursor-pointer border-l-4"
        style={{ borderLeftColor: student.registrationStatus.color }}
        onClick={onSelect}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium text-sm">
                  {student.firstName} {student.lastName}
                </div>
                <div className="text-xs text-gray-500">
                  Grade {student.grade} • {familyData?.familyName}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(student.registrationStatus.status)}>
              {student.registrationStatus.label}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {student.firstName} {student.lastName}
                  {student.preferredName && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({student.preferredName})
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDateForDisplay(student.birthday)} • Age {age}
                  </span>
                  <span>Grade {student.grade}</span>
                  <span>{student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : 'Other'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                className={`${getStatusColor(student.registrationStatus.status)} flex items-center gap-1`}
              >
                {getStatusIcon(student.registrationStatus.status)}
                {student.registrationStatus.label}
              </Badge>
              {student.registrationStatus.status === 'ready' && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRegistered();
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Mark Registered
                </Button>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Registration Progress</span>
              <span>{registrationProgress.percentage}% Complete</span>
            </div>
            <Progress value={registrationProgress.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{registrationProgress.completed} of {registrationProgress.total} items</span>
            </div>
          </div>
          
          {/* Key Information Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* ASN */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">ASN</span>
                {!student.asn && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>ASN required for PASI registration</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <div className="font-medium text-sm mt-1">
                {student.asn || (
                  <span className="text-red-600">Missing</span>
                )}
              </div>
            </div>
            
            {/* Family */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Family</div>
              <div className="font-medium text-sm mt-1 truncate">
                {familyData?.familyName}
              </div>
            </div>
            
            {/* Facilitator */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Facilitator</div>
              <div className="font-medium text-sm mt-1 truncate">
                {familyData?.facilitatorEmail ? 
                  familyData.facilitatorEmail.split('@')[0] : 
                  <span className="text-orange-600">Unassigned</span>
                }
              </div>
            </div>
            
            {/* Documents */}
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">Documents</div>
              <div className="flex items-center space-x-2 mt-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        familyData?.NOTIFICATION_FORMS?.[dbSchoolYear]?.[student.id]?.submissionStatus === 'submitted' ?
                        'bg-green-100' : 'bg-red-100'
                      }`}>
                        <FileText className={`w-3 h-3 ${
                          familyData?.NOTIFICATION_FORMS?.[dbSchoolYear]?.[student.id]?.submissionStatus === 'submitted' ?
                          'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Notification Form</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        familyData?.STUDENT_CITIZENSHIP_DOCS?.[student.id]?.staffApproval?.isApproved ?
                        'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Shield className={`w-3 h-3 ${
                          familyData?.STUDENT_CITIZENSHIP_DOCS?.[student.id]?.staffApproval?.isApproved ?
                          'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Citizenship Docs</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${
                        familyData?.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[student.id]?.submissionStatus === 'submitted' ?
                        'bg-green-100' : 'bg-red-100'
                      }`}>
                        <BookOpen className={`w-3 h-3 ${
                          familyData?.SOLO_EDUCATION_PLANS?.[dbSchoolYear]?.[student.id]?.submissionStatus === 'submitted' ?
                          'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Education Plan</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          
          {/* Address */}
          {studentAddress && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-blue-700 font-medium mb-1">Current Address</div>
                  <div className="text-sm text-blue-900">
                    {studentAddress.street}<br />
                    {studentAddress.city}, {studentAddress.province} {studentAddress.postalCode}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Program Info */}
          {soloPlanInfo && (
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-xs text-purple-700 font-medium mb-2">
                {soloPlanInfo.followsAlberta ? 'Following Alberta Curriculum' : 'Custom Education Plan'}
              </div>
              {soloPlanInfo.followsAlberta && soloPlanInfo.selectedCourses && (
                <div className="space-y-1">
                  {Object.entries(soloPlanInfo.selectedCourses).map(([category, courses]) => (
                    courses.length > 0 && (
                      <div key={category} className="text-xs">
                        <span className="text-purple-600 font-medium">
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                        </span>
                        <span className="text-purple-800 ml-1">
                          {courses.map(c => c.toUpperCase()).join(', ')}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              )}
              {soloPlanInfo.otherCourses.length > 0 && (
                <div className="text-xs mt-2">
                  <span className="text-purple-600 font-medium">Other Courses:</span>
                  <span className="text-purple-800 ml-1">
                    {soloPlanInfo.otherCourses.length} additional
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              {familyData?.guardians && (
                <>
                  {Object.values(familyData.guardians).find(g => g.guardianType === 'primary_guardian')?.phone && (
                    <span className="flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {Object.values(familyData.guardians).find(g => g.guardianType === 'primary_guardian').phone}
                    </span>
                  )}
                  {Object.values(familyData.guardians).find(g => g.guardianType === 'primary_guardian')?.email && (
                    <span className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {Object.values(familyData.guardians).find(g => g.guardianType === 'primary_guardian').email}
                    </span>
                  )}
                </>
              )}
            </div>
            <Button
              onClick={onSelect}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentRegistrationCard;