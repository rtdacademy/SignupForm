import React, { useMemo, useState } from 'react';
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
  Download,
  Eye,
  Copy,
  ChevronDown,
  ChevronUp,
  School,
  Users,
  FileDown,
  ClipboardCopy,
  Info,
  Home,
  Brain,
  Sparkles
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
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Separator } from '../../components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '../../components/ui/sheet';
import { 
  copyToClipboard,
  getSchoolBoardCode,
  formatAddressForCopy,
  formatDate,
  getNotificationFormData,
  getEducationPlanData,
  getCitizenshipDocsData,
  getPrimaryGuardian,
  getFacilitatorName,
  buildStudentInfoText,
  checkDocumentStatus,
  getPreviousDocumentVersions,
  formatAiAnalysis,
  getAiAnalysisStatus
} from './utils/registrationUtils';
import { calculateAge } from '../../utils/timeZoneUtils';

// Component for copyable field with visual feedback
const CopyableField = ({ label, value, fieldName, icon: Icon, className = "" }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(value, fieldName || label);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!value) return null;
  
  return (
    <div 
      className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all min-w-0 ${className}`}
      onClick={handleCopy}
      title={value} // Show full text on hover
    >
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        {Icon && <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
        <div className="min-w-0 flex-1">
          <span className="text-xs text-gray-500 block">{label}</span>
          <p className="text-sm font-medium truncate">{value}</p>
        </div>
      </div>
      <div className="flex items-center ml-2 flex-shrink-0">
        {copied ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
        )}
      </div>
    </div>
  );
};

// Component for document download button
const DocumentButton = ({ document, type, onView, label }) => {
  if (!document) return null;
  
  const handleDownload = () => {
    window.open(document.url, '_blank');
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="flex items-center"
      >
        <Download className="w-3 h-3 mr-1" />
        {label || 'Download'}
      </Button>
      {onView && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(document)}
        >
          <Eye className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

// Component for AI Analysis Sheet
const AiAnalysisSheet = ({ document, studentName }) => {
  const [imageError, setImageError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  if (!document?.aiAnalysis) return null;
  
  const analysis = formatAiAnalysis(document.aiAnalysis);
  if (!analysis) return null;
  
  const statusColor = getAiAnalysisStatus(document.aiAnalysis);
  const iconColors = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600'
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <Brain className={`w-4 h-4 ${iconColors[statusColor]} hover:scale-110 transition-transform`} />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[500px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className={`w-5 h-5 ${iconColors[statusColor]}`} />
              <span>AI Document Analysis</span>
            </div>
            <Badge className={`
              ${statusColor === 'green' ? 'bg-green-100 text-green-800' : 
                statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                statusColor === 'red' ? 'bg-red-100 text-red-800' :
                statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'}
            `}>
              {analysis.overallScore}% Match
            </Badge>
          </SheetTitle>
          <SheetDescription>
            Automated analysis of {document.name || 'citizenship document'} for {studentName}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 mt-6">
          
          {/* Document Type Analysis */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Document Type</h4>
            <div className="bg-gray-50 rounded-lg p-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Expected:</span>
                <span className="font-medium">{analysis.documentType.expected}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Detected:</span>
                <span className={`font-medium ${analysis.documentType.match ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.documentType.detected}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Confidence:</span>
                <span className="font-medium">{analysis.documentType.confidence}%</span>
              </div>
            </div>
          </div>
          
          {/* Name Match Analysis */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Name Verification</h4>
            <div className="bg-gray-50 rounded-lg p-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Student Name:</span>
                <span className="font-medium">{studentName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Document Name:</span>
                <span className={`font-medium ${analysis.nameMatch.match ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.nameMatch.detected}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Match Confidence:</span>
                <span className="font-medium">{analysis.nameMatch.confidence}%</span>
              </div>
              {analysis.nameMatch.reasoning && (
                <div className="text-xs text-gray-600 mt-1 pt-1 border-t">
                  {analysis.nameMatch.reasoning}
                </div>
              )}
            </div>
          </div>
          
          {/* Document Details */}
          {analysis.documentDetails && Object.values(analysis.documentDetails).some(v => v) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Document Details</h4>
              <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                {analysis.documentDetails.number && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Document Number:</span>
                    <span className="font-medium">{analysis.documentDetails.number}</span>
                  </div>
                )}
                {analysis.documentDetails.issueDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="font-medium">{formatDate(analysis.documentDetails.issueDate)}</span>
                  </div>
                )}
                {analysis.documentDetails.expiryDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Expiry Date:</span>
                    <span className="font-medium">{formatDate(analysis.documentDetails.expiryDate)}</span>
                  </div>
                )}
                {analysis.documentDetails.birthDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Birth Date:</span>
                    <span className="font-medium">{formatDate(analysis.documentDetails.birthDate)}</span>
                  </div>
                )}
                {analysis.documentDetails.issuingAuthority && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Issuing Authority:</span>
                    <span className="font-medium">{analysis.documentDetails.issuingAuthority}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Confidence Scores */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Confidence Scores</h4>
            <div className="space-y-2">
              {Object.entries(analysis.confidence).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                    </span>
                    <span className="font-medium">{value}%</span>
                  </div>
                  <Progress value={value} className="h-1" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Validation Issues */}
          {analysis.issues && analysis.issues.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-600">Issues Detected</h4>
              <ul className="space-y-1">
                {analysis.issues.map((issue, index) => (
                  <li key={index} className="text-xs text-red-600 flex items-start">
                    <XCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Document Preview */}
          {document.url && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Document Preview</h4>
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                {/* Check if the document is a PDF */}
                {document.name?.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full h-96 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-base text-gray-600 font-medium">PDF Document</p>
                      <p className="text-sm text-gray-500 mt-1">{document.name}</p>
                      <p className="text-xs text-gray-400 mt-2">PDF preview not available in browser</p>
                    </div>
                  </div>
                ) : 
                /* Check if it's a known image format */
                (document.name?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) || 
                 document.url?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) ? (
                  imageError ? (
                    /* Show fallback if image failed to load */
                    <div className="w-full h-96 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                        <p className="text-base text-gray-600">Preview unavailable</p>
                        <p className="text-sm text-gray-500 mt-1">Click below to view the full document</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={document.url} 
                      alt="Document preview"
                      className="w-full h-96 object-contain"
                      onError={() => setImageError(true)}
                    />
                  )
                ) : (
                  /* For other file types, show a generic file icon */
                  <div className="w-full h-96 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-base text-gray-600">Document File</p>
                      <p className="text-sm text-gray-500 mt-1">{document.name || 'Unknown file type'}</p>
                      <p className="text-xs text-gray-400 mt-2">Click below to view</p>
                    </div>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(document.url, '_blank')}
                className="w-full"
              >
                <Download className="w-3 h-3 mr-2" />
                View Full Document
              </Button>
            </div>
          )}
          
          {/* Review Priority */}
          {analysis.requiresReview && (
            <div className={`p-2 rounded-lg ${
              analysis.reviewPriority === 'high' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertTriangle className={`w-4 h-4 ${
                  analysis.reviewPriority === 'high' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <span className="text-xs font-medium">
                  {analysis.reviewPriority === 'high' ? 'High Priority Review Required' : 'Manual Review Recommended'}
                </span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const StudentRegistrationCard = ({ 
  student, 
  familyData, 
  schoolYear, 
  onSelect, 
  onMarkRegistered,
  compact = false 
}) => {
  const [showVersionHistory, setShowVersionHistory] = useState({});
  const [showAllGuardians, setShowAllGuardians] = useState(false);
  
  // Get all processed data using utility functions
  const notificationData = useMemo(() => 
    getNotificationFormData(familyData, schoolYear, student.id),
    [familyData, schoolYear, student.id]
  );
  
  const educationData = useMemo(() => 
    getEducationPlanData(familyData, schoolYear, student.id),
    [familyData, schoolYear, student.id]
  );
  
  const citizenshipData = useMemo(() => 
    getCitizenshipDocsData(familyData, student.id),
    [familyData, student.id]
  );
  
  const primaryGuardian = useMemo(() => 
    getPrimaryGuardian(familyData),
    [familyData]
  );
  
  const allGuardians = useMemo(() => 
    familyData?.guardians ? Object.values(familyData.guardians) : [],
    [familyData]
  );
  
  const facilitatorName = useMemo(() => 
    getFacilitatorName(familyData?.facilitatorEmail),
    [familyData?.facilitatorEmail]
  );
  
  const documentStatus = useMemo(() => 
    checkDocumentStatus(notificationData, citizenshipData, educationData),
    [notificationData, citizenshipData, educationData]
  );
  
  // Calculate registration progress
  const registrationProgress = useMemo(() => {
    let completed = 0;
    let total = 5;
    
    if (student.asn || student.readyForPASI) completed++;
    if (notificationData?.submitted) completed++;
    if (citizenshipData?.approved) completed++;
    if (educationData?.submitted) completed++;
    if (primaryGuardian?.address) completed++;
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  }, [student.asn, student.readyForPASI, notificationData, citizenshipData, educationData, primaryGuardian]);
  
  // Get school board code for copying
  const schoolBoardCode = useMemo(() => {
    if (!notificationData?.residentSchoolBoard) return null;
    return getSchoolBoardCode(notificationData.residentSchoolBoard);
  }, [notificationData?.residentSchoolBoard]);
  
  // Copy all student info
  const handleCopyAll = async () => {
    const text = buildStudentInfoText(student, notificationData, primaryGuardian);
    await copyToClipboard(text, 'All Student Information');
  };
  
  // Get status styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ready':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'missing-asn':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'missing-notification':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'incomplete':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'ready':
        return <Clock className="w-4 h-4" />;
      case 'missing-asn':
        return <Hash className="w-4 h-4" />;
      case 'missing-notification':
        return <FileText className="w-4 h-4" />;
      case 'incomplete':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };
  
  if (compact) {
    return (
      <Card 
        className="hover:shadow-md transition-all cursor-pointer"
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
                  {!student.asn && !student.readyForPASI && <AlertCircle className="inline w-3 h-3 ml-1 text-red-500" />}
                  {!student.asn && student.readyForPASI && <Info className="inline w-3 h-3 ml-1 text-blue-500" />}
                </div>
                <div className="text-xs text-gray-500">
                  Grade {student.grade} • {familyData?.familyName}
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(student.registrationStatus.status)}>
              {getStatusIcon(student.registrationStatus.status)}
              <span className="ml-1">{student.registrationStatus.label}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-lg transition-all border-2">
      <CardContent className="p-0">
        {/* Header with status */}
        <div className={`p-4 border-b ${getStatusColor(student.registrationStatus.status)} bg-opacity-10`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg flex items-center">
                {student.firstName} {student.lastName}
                {student.preferredName && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({student.preferredName})
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600">
                Grade {student.grade} • {familyData?.familyName} Family
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={`${getStatusColor(student.registrationStatus.status)} border`}>
                {getStatusIcon(student.registrationStatus.status)}
                <span className="ml-1">{student.registrationStatus.label}</span>
              </Badge>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAll}
                  className="text-xs"
                >
                  <ClipboardCopy className="w-3 h-3 mr-1" />
                  Copy All
                </Button>
                <Button
                  onClick={onSelect}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View Details
                </Button>
                {student.registrationStatus.status === 'ready' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRegistered();
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Registered in PASI
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Registration Progress</span>
              <span>{registrationProgress.percentage}%</span>
            </div>
            <Progress value={registrationProgress.percentage} className="h-2" />
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* 2x2 Grid for main sections - responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Information Section - Top Left */}
            <div className="bg-blue-50 rounded-lg p-3 flex flex-col">
              <h4 className="font-medium text-sm text-blue-900 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Student Information
              </h4>
              <div className="flex-1 space-y-2">
                {/* Names grid - auto-sizing columns */}
                <div className="grid grid-cols-2 gap-1" style={{ gridTemplateColumns: 'minmax(0, auto) minmax(0, auto)' }}>
                  <CopyableField
                    label="First Name"
                    value={student.firstName}
                    fieldName="First Name"
                    className="min-w-0"
                  />
                  <CopyableField
                    label="Last Name"
                    value={student.lastName}
                    fieldName="Last Name"
                    className="min-w-0"
                  />
                </div>
                
                {/* Preferred name - full width if exists */}
                {student.preferredName && (
                  <CopyableField
                    label="Preferred Name"
                    value={student.preferredName}
                    fieldName="Preferred Name"
                    icon={User}
                  />
                )}
                
                {/* Birthday and Age on same row */}
                <div className="grid grid-cols-2 gap-1">
                  <CopyableField
                    label="Birthday"
                    value={formatDate(student.birthday)}
                    fieldName="Birthday"
                    icon={Calendar}
                  />
                  <CopyableField
                    label="Age"
                    value={calculateAge(student.birthday) !== null ? `${calculateAge(student.birthday)} years` : 'N/A'}
                    fieldName="Age"
                    icon={Clock}
                  />
                </div>
                
                {/* ASN - full width at bottom */}
                <CopyableField
                  label="ASN (Alberta Student Number)"
                  value={student.asn}
                  fieldName="ASN"
                  icon={Hash}
                  className={!student.asn && !student.readyForPASI ? "bg-red-50 border border-red-200" : 
                            (!student.asn && student.readyForPASI ? "bg-blue-50 border border-blue-200" : "")}
                />
                
                {!student.asn && student.readyForPASI && (
                  <p className="text-xs text-blue-600 flex items-center">
                    <Info className="w-3 h-3 mr-1" />
                    ASN Needs to be created
                  </p>
                )}
                
                {!student.asn && !student.readyForPASI && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    ASN required for PASI registration
                  </p>
                )}
              </div>
            </div>
            
            {/* Registration Information Section - Top Right */}
            <div className="bg-purple-50 rounded-lg p-3 flex flex-col">
              <h4 className="font-medium text-sm text-purple-900 mb-2 flex items-center">
                <School className="w-4 h-4 mr-2" />
                Registration Information
              </h4>
              <div className="flex-1 space-y-1">
                {notificationData ? (
                  <>
                    {notificationData.studentAddress && (
                      <CopyableField
                        label="Student Address"
                        value={formatAddressForCopy(notificationData.studentAddress)}
                        fieldName="Address"
                        icon={MapPin}
                      />
                    )}
                    {notificationData.registrationDate && (
                      <CopyableField
                        label="Registration Date"
                        value={formatDate(notificationData.registrationDate)}
                        fieldName="Registration Date"
                        icon={Calendar}
                      />
                    )}
                    {notificationData.residentSchoolBoard && (
                      <div 
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-purple-100 cursor-pointer transition-all"
                        onClick={() => copyToClipboard(schoolBoardCode || notificationData.residentSchoolBoard, 'Resident Board Code')}
                      >
                        <div className="flex items-center space-x-2">
                          <School className="w-4 h-4 text-gray-500" />
                          <div className="min-w-0 flex-1">
                            <span className="text-xs text-gray-500">Resident Board (copies code)</span>
                            <p className="text-sm font-medium truncate">
                              {notificationData.residentSchoolBoard}
                              {schoolBoardCode && ` [${schoolBoardCode}]`}
                            </p>
                          </div>
                        </div>
                        <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600 flex-shrink-0" />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-purple-600">No registration data available</p>
                )}
              </div>
            </div>
            
            {/* Guardian Information Section - Bottom Left */}
            <div className="bg-green-50 rounded-lg p-3 flex flex-col">
              <h4 className="font-medium text-sm text-green-900 mb-2 flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Guardian Information
                </span>
                {allGuardians.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllGuardians(!showAllGuardians)}
                    className="text-xs h-6 px-2"
                  >
                    {showAllGuardians ? 'Primary' : `+${allGuardians.length - 1}`}
                  </Button>
                )}
              </h4>
              
              <div className="flex-1 space-y-1 overflow-y-auto max-h-48">
                {primaryGuardian ? (
                  <>
                    {/* Primary Guardian */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-700">Primary</span>
                        <Badge className="bg-green-100 text-green-800 text-xs h-4">Primary</Badge>
                      </div>
                      <CopyableField
                        label="Name"
                        value={`${primaryGuardian.firstName} ${primaryGuardian.lastName}`}
                        fieldName="Guardian Name"
                        icon={UserCheck}
                      />
                      <CopyableField
                        label="Email"
                        value={primaryGuardian.email}
                        fieldName="Guardian Email"
                        icon={Mail}
                      />
                      <CopyableField
                        label="Phone"
                        value={primaryGuardian.phone}
                        fieldName="Guardian Phone"
                        icon={Phone}
                      />
                    </div>
                    
                    {/* Other Guardians */}
                    {showAllGuardians && allGuardians.length > 1 && (
                      <div className="pt-2 border-t border-green-200 space-y-2">
                        {allGuardians.filter(g => g !== primaryGuardian).map((guardian, idx) => (
                          <div key={idx} className="space-y-1">
                            <span className="text-xs font-medium text-green-700">Guardian {idx + 2}</span>
                            <CopyableField
                              label="Name"
                              value={`${guardian.firstName} ${guardian.lastName}`}
                              fieldName={`Guardian ${idx + 2} Name`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-green-600">No guardian information</p>
                )}
              </div>
            </div>
            
            {/* Documents Section - Bottom Right */}
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
              <h4 className="font-medium text-sm text-gray-900 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </h4>
              <div className="flex-1 space-y-1">
                {/* Notification Form */}
                <div className="flex items-center justify-between p-1 bg-white rounded">
                  <div className="flex items-center space-x-2">
                    {documentStatus.notification.present ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600" />
                    )}
                    <span className="text-xs">Notification</span>
                  </div>
                  {notificationData?.latestPdf && (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(notificationData.latestPdf.url, '_blank')}
                        className="h-6 px-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      {notificationData.pdfVersions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVersionHistory({
                            ...showVersionHistory,
                            notification: !showVersionHistory.notification
                          })}
                          className="h-6 px-1"
                        >
                          {showVersionHistory.notification ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Version history for notification */}
                {showVersionHistory.notification && notificationData?.pdfVersions.length > 1 && (
                  <div className="ml-4 space-y-1 text-xs">
                    {getPreviousDocumentVersions(notificationData.pdfVersions).map((version, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1 bg-gray-100 rounded">
                        <span className="text-xs">V{notificationData.pdfVersions.length - idx - 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(version.url, '_blank')}
                          className="h-4 px-1"
                        >
                          <Download className="w-2 h-2" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Education Plan */}
                <div className="flex items-center justify-between p-1 bg-white rounded">
                  <div className="flex items-center space-x-2">
                    {documentStatus.education.present ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600" />
                    )}
                    <span className="text-xs">Education Plan</span>
                  </div>
                  {educationData?.latestPdf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(educationData.latestPdf.url, '_blank')}
                      className="h-6 px-2"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                {/* Citizenship Documents */}
                <div className="flex items-center justify-between p-1 bg-white rounded">
                  <div className="flex items-center space-x-2">
                    {documentStatus.citizenship.approved ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : documentStatus.citizenship.needsReview ? (
                      <AlertTriangle className="w-3 h-3 text-yellow-600" />
                    ) : documentStatus.citizenship.present ? (
                      <Clock className="w-3 h-3 text-blue-600" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-600" />
                    )}
                    <span className="text-xs">Citizenship</span>
                    {citizenshipData?.hasAiAnalysis && citizenshipData?.documents?.[0] && (
                      <AiAnalysisSheet 
                        document={citizenshipData.documents[0]} 
                        studentName={`${student.firstName} ${student.lastName}`}
                      />
                    )}
                  </div>
                  {citizenshipData?.documents?.length > 0 && (
                    <span className="text-xs text-gray-500">{citizenshipData.documents.length}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Facilitator Section - Full width below grid */}
          {familyData?.facilitatorEmail && (
            <div className="bg-indigo-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <p className="text-xs text-indigo-700">Facilitator:</p>
                  <p className="font-medium text-sm text-indigo-900">{facilitatorName}</p>
                </div>
                <CopyableField
                  value={familyData.facilitatorEmail}
                  fieldName="Facilitator Email"
                  className="p-1"
                />
              </div>
            </div>
          )}
          
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentRegistrationCard;