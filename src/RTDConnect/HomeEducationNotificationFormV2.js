import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getCurrentSchoolYear, formatImportantDate } from '../config/calendarConfig';
import { LEGAL_TEXT, FORM_CONSTANTS, PART_D_QUESTIONS, ABORIGINAL_OPTIONS, FRANCOPHONE_OPTIONS } from './utils/homeEducationFormConstants';
import { generatePartCData, REGULATORY_TEXT } from '../config/signatures';
import SchoolBoardSelector from '../components/SchoolBoardSelector';
import AddressPicker from '../components/AddressPicker';
import { formatDateForDisplay } from '../utils/timeZoneUtils';
import { determineFundingEligibility } from '../utils/fundingEligibilityUtils';

// Helper function to get previous school year
const getPreviousSchoolYear = (currentYear) => {
  const [startYear, endYear] = currentYear.split('/');
  const prevStart = (parseInt(startYear) - 1).toString().padStart(2, '0');
  const prevEnd = (parseInt(endYear) - 1).toString().padStart(2, '0');
  return `${prevStart}/${prevEnd}`;
};

// Form completeness detection helpers
const isFormComplete = (formData) => {
  return !!(
    formData?.PART_A && 
    formData?.PART_B?.declaration && 
    formData?.PART_C?.acceptanceStatus
  );
};

const getMissingParts = (formData) => {
  const missing = [];
  if (!formData?.PART_A) {
    missing.push({ 
      part: 'PART_A', 
      description: 'Basic student and family information',
      action: 'Complete the form fields'
    });
  }
  if (!formData?.PART_B?.declaration) {
    missing.push({ 
      part: 'PART_B', 
      description: 'Parent/guardian declaration and signature',
      action: 'Complete declaration and provide signature'
    });
  }
  if (!formData?.PART_C?.acceptanceStatus) {
    missing.push({ 
      part: 'PART_C', 
      description: 'School board approval and signature',
      action: 'Simply resubmit form to add our approval signature'
    });
  }
  return missing;
};

import { 
  FileText, 
  Save, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  GraduationCap,
  Loader2,
  Calendar,
  User,
  Building2,
  Shield,
  X,
  Copy,
  Clock,
  RefreshCw,
  Info,
  MapPin,
  Eye
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';

// InfoSheet component for displaying detailed legal/help information
const InfoSheet = ({ isOpen, onOpenChange, title, content }) => (
  <Sheet open={isOpen} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-500" />
          {title}
        </SheetTitle>
        <SheetDescription className="text-left">
          Detailed information and guidance
        </SheetDescription>
      </SheetHeader>
      <div className="mt-6 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
        {content}
      </div>
    </SheetContent>
  </Sheet>
);

const FormField = ({ label, error, children, required = false, readOnly = false, icon: Icon, legalText }) => {
  const [infoSheetOpen, setInfoSheetOpen] = React.useState(false);
  
  return (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <label className={`flex items-center text-sm font-medium ${readOnly ? 'text-gray-500' : 'text-gray-900'}`}>
        {Icon && <Icon className="w-4 h-4 mr-2 text-purple-500" />}
        {label}
        {required && !readOnly && <span className="text-red-500 ml-1">*</span>}
        {readOnly && <span className="text-xs text-gray-500 ml-2">(from family profile)</span>}
      </label>
      {legalText && (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5"
            onClick={() => setInfoSheetOpen(true)}
            type="button"
          >
            <Info className="h-4 w-4 text-gray-400" />
          </Button>
          <InfoSheet
            isOpen={infoSheetOpen}
            onOpenChange={setInfoSheetOpen}
            title={label}
            content={legalText}
          />
        </>
      )}
    </div>
    {children}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
  );
};

const ReadOnlyField = ({ label, value, icon: Icon, legalText }) => (
  <FormField label={label} readOnly icon={Icon} legalText={legalText}>
    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm">
      {value || 'Not provided'}
    </div>
  </FormField>
);

// Smart Copy Button Component
const CopyButton = ({ 
  source, 
  value, 
  onCopy, 
  disabled = false,
  className = "ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors flex items-center space-x-1"
}) => {
  const [showPreview, setShowPreview] = useState(false);
  
  if (!value || disabled) return null;
  
  return (
    <div className="relative">
      <button
        type="button"
        className={className}
        onClick={() => onCopy(value)}
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        title={`Copy from ${source}`}
      >
        <Copy className="w-3 h-3" />
        <span>{source}</span>
      </button>
      
      {showPreview && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 max-w-xs">
          <strong>Will copy:</strong> {value}
        </div>
      )}
    </div>
  );
};

// Enhanced FormField with copy functionality
const SmartFormField = ({ 
  label, 
  error, 
  children, 
  required = false, 
  icon: Icon,
  copyOptions = [],
  onCopy,
  fieldName,
  legalText,
  readOnly = false
}) => {
  const [infoSheetOpen, setInfoSheetOpen] = React.useState(false);
  
  return (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <label className={`flex items-center text-sm font-medium text-gray-900`}>
          {Icon && <Icon className="w-4 h-4 mr-2 text-purple-500" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {legalText && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => setInfoSheetOpen(true)}
              type="button"
            >
              <Info className="h-4 w-4 text-gray-400" />
            </Button>
            <InfoSheet
              isOpen={infoSheetOpen}
              onOpenChange={setInfoSheetOpen}
              title={label}
              content={legalText}
            />
          </>
        )}
      </div>
      
      {copyOptions.length > 0 && !readOnly && (
        <div className="flex items-center space-x-1">
          <span className="text-xs text-gray-500">Copy from:</span>
          {copyOptions.map((option, index) => (
            <CopyButton
              key={index}
              source={option.source}
              value={option.value}
              onCopy={(value) => onCopy(fieldName, value)}
            />
          ))}
        </div>
      )}
    </div>
    {children}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
  );
};


const HomeEducationNotificationFormV2 = ({ 
  isOpen, 
  onOpenChange, 
  familyId, 
  familyData,
  selectedStudent,
  schoolYear,
  readOnly = false,
  staffMode = false
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [albertaProgramsInfoOpen, setAlbertaProgramsInfoOpen] = useState(false);
  const [soloInfoOpen, setSoloInfoOpen] = useState(false);
  
  // Data for smart copying
  const [familyFormData, setFamilyFormData] = useState({});
  const [copyOptions, setCopyOptions] = useState({});
  const [paymentEligibility, setPaymentEligibility] = useState(null);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      formType: '',
      citizenship: '',
      residentSchoolBoard: '',
      previousSchoolProgram: '',
      assistanceRequired: false,
      additionalInstructor: '',
      aboriginalDeclaration: '',
      francophoneEligible: '',
      francophoneExercise: '',
      programAlberta: true,
      programSchedule: false,
      signatureAgreed: false,
      programAddressDifferent: false,
      programAddress: null,
    }
  });

  // Load existing form data and family data for copying
  useEffect(() => {
    if (!familyId || !isOpen || !selectedStudent || !schoolYear) return;

    const loadFormData = async () => {
      setLoading(true);
      try {
        const db = getDatabase();
        
        // Load current student's form
        const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${schoolYear.replace('/', '_')}/${selectedStudent.id}`);
        const snapshot = await get(formRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setExistingSubmission(data);
          
          // Only load editable fields from the previous submission
          // Student and guardian info should always come from live familyData
          if (data.PART_A) {
            // New structure - only load editable fields
            setValue('formType', data.PART_A.formType);
            
            // Load only the editable fields (not studentInfo or guardianInfo)
            Object.keys(data.PART_A.editableFields || {}).forEach(key => {
              console.log(`Loading editable field ${key}:`, data.PART_A.editableFields[key]);
              setValue(key, data.PART_A.editableFields[key]);
            });
            
            // Load program address settings if different
            if (data.PART_A.addresses) {
              setValue('programAddressDifferent', data.PART_A.addresses.programAddressDifferent);
              setValue('programAddress', data.PART_A.addresses.programAddress);
            }
            
            // Load declaration settings
            if (data.PART_B?.declaration) {
              console.log('Loading PART_B declaration data:', data.PART_B.declaration);
              setValue('programAlberta', data.PART_B.declaration.programAlberta);
              setValue('programSchedule', data.PART_B.declaration.programSchedule);
              setValue('signatureAgreed', data.PART_B.declaration.signatureAgreed);
            }
            // Note: PART_D is handled separately by SOLOEducationPlanForm.js
          } else {
            // Legacy structure support - only load editable fields
            setValue('formType', data.formType);
            Object.keys(data.editableFields || {}).forEach(key => {
              setValue(key, data.editableFields[key]);
            });
          }
        } else {
          // Check previous year for renewal determination
          const prevYear = getPreviousSchoolYear(schoolYear);
          if (prevYear) {
            const prevFormRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${prevYear.replace('/', '_')}/${selectedStudent.id}`);
            const prevSnapshot = await get(prevFormRef);
            if (prevSnapshot.exists()) {
              setValue('formType', 'renewal');
            } else {
              setValue('formType', 'new');
            }
          } else {
            setValue('formType', 'new');
          }
        }
        
        // Load all family forms for copy options
        await loadFamilyFormData();
        
        // Calculate payment eligibility for this student and school year
        if (selectedStudent.birthday) {
          const eligibility = determineFundingEligibility(selectedStudent.birthday, schoolYear);
          setPaymentEligibility(eligibility);
        }
        
      } catch (error) {
        console.error('Error loading form data:', error);
        toast.error('Failed to load existing form data');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [familyId, isOpen, selectedStudent, schoolYear, setValue]);

  // Load family form data for copy functionality
  const loadFamilyFormData = async () => {
    try {
      const db = getDatabase();
      const familyFormsData = {};
      const copyOpts = {};
      
      // Get all years to check
      const yearsToCheck = [schoolYear, getPreviousSchoolYear(schoolYear)];
      
      for (const year of yearsToCheck) {
        familyFormsData[year] = {};
        
        for (const student of familyData.students || []) {
          try {
            const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${year.replace('/', '_')}/${student.id}`);
            const snapshot = await get(formRef);
            
            if (snapshot.exists()) {
              const formData = snapshot.val();
              familyFormsData[year][student.id] = {
                ...formData,
                studentName: `${student.preferredName || student.firstName} ${student.lastName}`,
                // Normalize data structure for copy functionality
                editableFields: formData.PART_A?.editableFields || formData.editableFields || {},
                addresses: formData.PART_A?.addresses || {},
                declaration: formData.PART_B?.declaration || {},
                partD: formData.PART_D || {}
              };
            }
          } catch (error) {
            console.error(`Error loading form for student ${student.id} year ${year}:`, error);
          }
        }
      }
      
      // Build copy options for each field
      const fieldsToCopy = [
        'citizenship',
        'residentSchoolBoard', 
        'formType',
        'additionalInstructor',
        'assistanceRequired',
        'aboriginalDeclaration',
        'francophoneEligible',
        'francophoneExercise',
        'previousSchoolProgram',
        'programAlberta',
        'programSchedule',
        'programAddress'
        // Note: partD fields removed - handled by SOLOEducationPlanForm.js
      ];
      
      fieldsToCopy.forEach(fieldName => {
        copyOpts[fieldName] = [];
        
        // Current year - other siblings
        Object.entries(familyFormsData[schoolYear] || {}).forEach(([studentId, formData]) => {
          let value = null;
          
          // Check different sections for the field
          if (formData.editableFields?.[fieldName]) {
            value = formData.editableFields[fieldName];
          } else if (formData.addresses?.[fieldName]) {
            value = formData.addresses[fieldName];
          } else if (formData.declaration?.[fieldName]) {
            value = formData.declaration[fieldName];
          } else if (formData.partD?.[fieldName]) {
            value = formData.partD[fieldName];
          }
          
          if (studentId !== selectedStudent.id && value) {
            copyOpts[fieldName].push({
              source: formData.studentName,
              value: value,
              type: 'sibling-current'
            });
          }
        });
        
        // Previous year - same student
        const prevYearData = familyFormsData[getPreviousSchoolYear(schoolYear)]?.[selectedStudent.id];
        if (prevYearData) {
          let value = null;
          
          if (prevYearData.editableFields?.[fieldName]) {
            value = prevYearData.editableFields[fieldName];
          } else if (prevYearData.addresses?.[fieldName]) {
            value = prevYearData.addresses[fieldName];
          } else if (prevYearData.declaration?.[fieldName]) {
            value = prevYearData.declaration[fieldName];
          } else if (prevYearData.partD?.[fieldName]) {
            value = prevYearData.partD[fieldName];
          }
          
          if (value) {
            copyOpts[fieldName].push({
              source: 'Last Year',
              value: value,
              type: 'self-previous'
            });
          }
        }
        
        // Previous year - other siblings
        Object.entries(familyFormsData[getPreviousSchoolYear(schoolYear)] || {}).forEach(([studentId, formData]) => {
          let value = null;
          
          if (formData.editableFields?.[fieldName]) {
            value = formData.editableFields[fieldName];
          } else if (formData.addresses?.[fieldName]) {
            value = formData.addresses[fieldName];
          } else if (formData.declaration?.[fieldName]) {
            value = formData.declaration[fieldName];
          } else if (formData.partD?.[fieldName]) {
            value = formData.partD[fieldName];
          }
          
          if (studentId !== selectedStudent.id && value) {
            copyOpts[fieldName].push({
              source: `${formData.studentName} (Last Year)`,
              value: value,
              type: 'sibling-previous'
            });
          }
        });
        
        // Remove duplicates
        copyOpts[fieldName] = copyOpts[fieldName].filter((option, index, self) => 
          index === self.findIndex(o => o.value === option.value)
        );
      });
      
      setFamilyFormData(familyFormsData);
      setCopyOptions(copyOpts);
      
    } catch (error) {
      console.error('Error loading family form data:', error);
    }
  };

  // Handle copying values from other forms
  const handleCopyValue = (fieldName, value) => {
    setValue(fieldName, value);
    toast.success(`Copied ${fieldName} successfully!`);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    try {
      setGeneratingPDF(true);
      
      // Create submission data structure for PDF generation
      const submissionData = {
        submissionId: existingSubmission?.submissionId || `sub_${Date.now()}`,
        schoolYear,
        
        PART_A: {
          formType: watch('formType'),
          studentInfo: getStudentInfo(),
          guardianInfo: getPrimaryGuardian(),
          addresses: {
            studentAddress: getStudentInfo().addressInfo,
            parentGuardianAddress: getPrimaryGuardian().address,
            programAddressDifferent: watch('programAddressDifferent'),
            programAddress: watch('programAddressDifferent') ? (watch('programAddress') || null) : null
          },
          editableFields: {
            registrationDate: new Date().toISOString().split('T')[0],
            citizenship: watch('citizenship'),
            residentSchoolBoard: watch('residentSchoolBoard'),
            previousSchoolProgram: watch('previousSchoolProgram'),
            assistanceRequired: watch('assistanceRequired'),
            additionalInstructor: watch('additionalInstructor'),
            aboriginalDeclaration: watch('aboriginalDeclaration'),
            francophoneEligible: watch('francophoneEligible'),
            francophoneExercise: watch('francophoneExercise')
          }
        },
        
        PART_B: {
          declaration: {
            programAlberta: watch('programAlberta'),
            programSchedule: watch('programSchedule'),
            signatureAgreed: watch('signatureAgreed'),
            guardianSignature: `${getPrimaryGuardian().firstName} ${getPrimaryGuardian().lastName} (Digital Signature)`,
            signatureDate: new Date().toISOString().split('T')[0],
            authenticatedUser: getPrimaryGuardian().email
          }
        },
        
        PART_C: generatePartCData('accepted'),
        
        PART_D: {
          isRequired: false // Always false - handled by SOLOEducationPlanForm.js
        }
      };

      // Generate and download PDF
      const pdfDoc = await generatePDF(submissionData);
      pdfDoc.save(`HomeEducation_NotificationForm_${schoolYear}_${selectedStudent.firstName}_${selectedStudent.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('PDF downloaded successfully!');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };


  // Get primary guardian information
  const getPrimaryGuardian = () => {
    return familyData?.guardians?.find(g => g.guardianType === 'primary_guardian') || 
           familyData?.guardians?.[0] || {};
  };

  // Get student address information
  const getStudentAddress = () => {
    const primaryGuardian = getPrimaryGuardian();
    
    // If student uses primary address, get it from primary guardian
    if (selectedStudent.usePrimaryAddress) {
      return {
        fullAddress: primaryGuardian.address?.formattedAddress || primaryGuardian.address?.fullAddress || '',
        phone: primaryGuardian.phone || '',
        source: 'Primary Guardian Address'
      };
    }
    
    // Otherwise use student's own address
    if (selectedStudent.address) {
      return {
        fullAddress: selectedStudent.address.formattedAddress || selectedStudent.address.fullAddress || '',
        phone: selectedStudent.phone || primaryGuardian.phone || '',
        source: 'Student Address'
      };
    }
    
    // Fallback to guardian address
    return {
      fullAddress: primaryGuardian.address?.formattedAddress || primaryGuardian.address?.fullAddress || '',
      phone: primaryGuardian.phone || '',
      source: 'Primary Guardian Address (Fallback)'
    };
  };

  // Get student information with enhanced pre-population
  const getStudentInfo = () => {
    const primaryGuardian = getPrimaryGuardian();
    const studentAddress = getStudentAddress();
    
    return {
      ...selectedStudent,
      alsoKnownAs: selectedStudent.preferredName || '',
      estimatedGradeLevel: selectedStudent.grade || '',
      genderDisplay: selectedStudent.gender === 'M' ? 'Male' : selectedStudent.gender === 'F' ? 'Female' : selectedStudent.gender === 'X' ? 'Other' : selectedStudent.gender || '',
      phoneWithFallback: selectedStudent.phone || primaryGuardian.phone || '',
      addressInfo: studentAddress
    };
  };

  // Generate timestamp for file naming
  const generateTimestamp = () => {
    return Date.now();
  };

  // Generate PDF
  const generatePDF = async (submissionData) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Document Header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(FORM_CONSTANTS.FORM_TITLE, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      doc.setFontSize(12);
      doc.text(FORM_CONSTANTS.FORM_SUBTITLE, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(FORM_CONSTANTS.REGULATION, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      
      doc.text(FORM_CONSTANTS.EDUCATION_ACT, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`School Year: ${submissionData.schoolYear}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Legal Information Table
      doc.autoTable({
        startY: yPosition,
        head: [['Legal Information']],
        body: [
          [LEGAL_TEXT.PRIVACY_COLLECTION],
          [LEGAL_TEXT.IMPORTANT_NOTES],
          [LEGAL_TEXT.FORM_INSTRUCTIONS]
        ],
        styles: { 
          fontSize: 8,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        margin: { left: 15, right: 15 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // PART A Header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PART A - Student Information', 20, yPosition);
      yPosition += 8;

      // Form Type Table
      const student = submissionData.PART_A.studentInfo;
      const guardian = submissionData.PART_A.guardianInfo;
      const editable = submissionData.PART_A.editableFields;
      const addresses = submissionData.PART_A.addresses;
      const partD = submissionData.PART_D;
      
      const formTypeLabel = submissionData.PART_A.formType === 'new' ? 
        FORM_CONSTANTS.FORM_TYPE_LABELS.NEW : 
        FORM_CONSTANTS.FORM_TYPE_LABELS.RENEWAL;

      doc.autoTable({
        startY: yPosition,
        head: [['Form Type', 'Selected']],
        body: [
          ['Form Type', formTypeLabel]
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 110 }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Student Information Table
      doc.autoTable({
        startY: yPosition,
        head: [['Student Information', 'Details']],
        body: [
          ['Legal Surname', student.lastName || ''],
          ['Legal Given Name(s)', student.firstName || ''],
          ['Birthdate', student.birthday ? formatDateForDisplay(student.birthday) : ''],
          ['Gender', student.genderDisplay || ''],
          ['Student Also Known As - Surname', student.alsoKnownAs ? student.lastName : ''],
          ['Alberta Student Number (ASN)', student.asn || '(To be provided by the school)'],
          ['Estimated Grade Level', student.estimatedGradeLevel || ''],
          ['Student Phone Number', student.phoneWithFallback || ''],
          ['Citizenship', editable.citizenship || ''],
          ['Resident School Board', editable.residentSchoolBoard || ''],
          ['Previous School Program', editable.previousSchoolProgram || ''],
          ['Assistance Required', editable.assistanceRequired ? 'Yes' : 'No'],
          ['Additional Instructor', editable.additionalInstructor || 'N/A'],
          ['Aboriginal Declaration', editable.aboriginalDeclaration || 'Not declared'],
          ['Francophone Education Eligible', editable.francophoneEligible || 'Not specified'],
          ['Exercise Francophone Right', editable.francophoneExercise || 'Not specified']
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // Guardian Information Table
      doc.autoTable({
        startY: yPosition,
        head: [['Parent/Guardian Information', 'Details']],
        body: [
          ['Parent/Guardian 1 - Last Name', guardian.lastName || ''],
          ['Parent/Guardian 1 - First Name', guardian.firstName || ''],
          ['Parent/Guardian 1 - Home Phone', guardian.phone || ''],
          ['Parent/Guardian Email Address', guardian.email || ''],
          ['Registration Date', editable.registrationDate || '']
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Address Information Table
      doc.autoTable({
        startY: yPosition,
        head: [['Address Information', 'Details']],
        body: [
          ['Student Address', `${student.addressInfo?.fullAddress || ''}\nPhone: ${student.addressInfo?.phone || ''}`],
          ['Parent/Guardian Address', addresses.parentGuardianAddress?.fullAddress || 'Same as student'],
          ['Program Location Address', addresses.programAddressDifferent ? 
            (addresses.programAddress?.fullAddress || addresses.programAddress?.formattedAddress || 'Address not provided') : 
            'Same as student address']
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      // PART B - Declaration
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('PART B - Declaration by Parent/Guardian', 20, yPosition);
      yPosition += 10;

      const declaration = submissionData.PART_B.declaration;
      
      // Declaration Table
      doc.autoTable({
        startY: yPosition,
        head: [['Declaration Information', 'Details']],
        body: [
          ['Parent/Guardian Name', `${guardian.firstName} ${guardian.lastName}`],
          ['Student Name', `${student.firstName} ${student.lastName}`],
          ['Program Outcomes Selected', `${declaration.programAlberta ? '✓ Alberta Programs of Study' : ''}\n${declaration.programSchedule ? '✓ Schedule included in the Home Education Regulation' : ''}`],
          ['Declaration Text', LEGAL_TEXT.PART_B_DECLARATION],
          ['Signature', declaration.guardianSignature || `${guardian.firstName} ${guardian.lastName} (Digital Signature)`],
          ['Date', new Date(declaration.signatureDate).toLocaleDateString()],
          ['Authenticated User', declaration.authenticatedUser || guardian.email]
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [230, 230, 230],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Alberta Programs Implications (if applicable)
      if (declaration.programSchedule) {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.autoTable({
          startY: yPosition,
          head: [['Important Notice - Alberta Programs Implications']],
          body: [
            [LEGAL_TEXT.ALBERTA_PROGRAMS_IMPLICATIONS]
          ],
          styles: { 
            fontSize: 8,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.5
          },
          headStyles: { 
            fillColor: [255, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            halign: 'center'
          },
          margin: { left: 20, right: 20 }
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      // PART C - Associate School Board Notification of Acceptance
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(REGULATORY_TEXT.PART_C_HEADER, 20, yPosition);
      yPosition += 8;

      // Add regulatory compliance text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const regulatoryText = submissionData.PART_C?.regulatoryCompliance?.responseRequirement || REGULATORY_TEXT.RESPONSE_REQUIREMENT;
      const splitRegText = doc.splitTextToSize(regulatoryText, pageWidth - 40);
      doc.text(splitRegText, 20, yPosition);
      yPosition += (splitRegText.length * 3) + 10;

      // Format acceptance status
      const acceptanceStatus = submissionData.PART_C?.acceptanceStatus || 'accepted';
      const acceptanceText = acceptanceStatus === 'accepted' ? '✓ is accepted' : 
                            acceptanceStatus === 'provisionally_accepted' ? '✓ is provisionally accepted' :
                            acceptanceStatus === 'not_accepted' ? '✓ is not accepted' : '✓ is accepted';

      doc.autoTable({
        startY: yPosition,
        head: [['Associate Board/Private School Response', 'Details']],
        body: [
          ['Agreement Status', `This agreement ${acceptanceText} by`],
          ['School Authority', submissionData.PART_C?.schoolFullName || submissionData.PART_C?.schoolName || 'RTD Academy'],
          ['School Address', submissionData.PART_C?.schoolAddress || '[School Address]'],
          ['Alberta School Code', submissionData.PART_C?.schoolCode || '2444'],
          ['Authority Code', submissionData.PART_C?.authorityCode || '0402'],
          ['Response Message', submissionData.PART_C?.schoolResponse || 'This home education program is accepted for supervision.'],
          ['Executive Director', submissionData.PART_C?.schoolContact || 'Kyle Brown, Executive Director'],
          ['Digital Signature', submissionData.PART_C?.schoolSignature || 'Kyle Brown (Digital Signature - Executive Director)'],
          ['Response Date', submissionData.PART_C?.responseDate || new Date().toLocaleDateString()],
          ['Approval Notes', submissionData.PART_C?.schoolNotes || 'Program approved in accordance with Alberta Home Education Regulation A.R. 89/2019.'],
          ['Authenticated By', submissionData.PART_C?.authenticatedUser || 'kyle@rtdacademy.com']
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [220, 255, 220],
          textColor: [0, 0, 0],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 100 }
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // PART D - Program Plan Attachment
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('PART D - Required Descriptions for Home Education Program', 20, yPosition);
      yPosition += 10;

      // Part D Attachment Notice
      doc.autoTable({
        startY: yPosition,
        head: [['Program Plan Attachment']],
        body: [
          ['The detailed program descriptions required for Part D (instructional methods, resources, evaluation, and facilities) are provided in the separate Program Plan document attached to this notification form.']
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 4,
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        headStyles: { 
          fillColor: [240, 248, 255],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Footer
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, pageHeight - 20);
      doc.text(`Family ID: ${familyId}`, 20, pageHeight - 15);
      doc.text(`Submission ID: ${submissionData.submissionId || 'NEW'}`, 20, pageHeight - 10);

      return doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  // Save to cloud storage
  const savePDFToStorage = async (pdfDoc, submissionData) => {
    try {
      const timestamp = generateTimestamp();
      const filename = `notification_form_${timestamp}_${familyId}.pdf`;
      const pdfBlob = pdfDoc.output('blob');
      
      const storage = getStorage();
      const fileRef = storageRef(storage, `rtdAcademy/homeEducationForms/${familyId}/${schoolYear.replace('/', '_')}/${selectedStudent.id}/${filename}`);
      
      const snapshot = await uploadBytes(fileRef, pdfBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        filename,
        generatedAt: timestamp,
        size: pdfBlob.size
      };
    } catch (error) {
      console.error('Error saving PDF to storage:', error);
      throw error;
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    if (!data.programAlberta && !data.programSchedule) {
      toast.error('Please select at least one program type.');
      return;
    }
    
    // Note: PART_D is handled separately by SOLOEducationPlanForm.js

    if (data.programAddressDifferent && (!data.programAddress || !data.programAddress.fullAddress)) {
      toast.error('Please select the address where the education program will be conducted.');
      return;
    }


    setSaving(true);
    
    try {
      const timestamp = Date.now();
      const submissionId = existingSubmission?.submissionId || `sub_${timestamp}`;
      
      // Create data structure for saving to database (without redundant info)
      const dataToSave = {
        submissionId,
        schoolYear,
        submittedAt: existingSubmission?.submittedAt || timestamp,
        lastUpdated: timestamp,
        submittedBy: user.uid,
        
        PART_A: {
          formType: data.formType,
          // Don't save studentInfo/guardianInfo - they should always come from live data
          // Only save references for tracking purposes
          studentId: selectedStudent.id,
          guardianId: getPrimaryGuardian().id || user.uid,
          addresses: {
            // Only save the program address if different, other addresses come from live data
            programAddressDifferent: data.programAddressDifferent,
            programAddress: data.programAddressDifferent ? (data.programAddress || null) : null
          },
          editableFields: {
            registrationDate: new Date().toISOString().split('T')[0],
            citizenship: data.citizenship,
            residentSchoolBoard: data.residentSchoolBoard,
            previousSchoolProgram: data.previousSchoolProgram,
            assistanceRequired: data.assistanceRequired,
            additionalInstructor: data.additionalInstructor,
            aboriginalDeclaration: data.aboriginalDeclaration,
            francophoneEligible: data.francophoneEligible,
            francophoneExercise: data.francophoneExercise
          }
        },
        
        PART_B: {
          declaration: {
            programAlberta: data.programAlberta,
            programSchedule: data.programSchedule,
            signatureAgreed: data.signatureAgreed,
            guardianSignature: `${getPrimaryGuardian().firstName} ${getPrimaryGuardian().lastName} (Digital Signature)`,
            signatureDate: new Date().toISOString().split('T')[0],
            authenticatedUser: getPrimaryGuardian().email
          }
        },
        
        PART_C: generatePartCData('accepted'),
        
        PART_D: {
          isRequired: false // Always false - handled by SOLOEducationPlanForm.js
        }
      };

      // Create submission data with live student/guardian info for PDF generation
      const pdfSubmissionData = {
        ...dataToSave,
        PART_A: {
          ...dataToSave.PART_A,
          // Include live student and guardian info for PDF
          studentInfo: getStudentInfo(),
          guardianInfo: getPrimaryGuardian(),
          addresses: {
            studentAddress: getStudentInfo().addressInfo,
            parentGuardianAddress: getPrimaryGuardian().address,
            programAddressDifferent: data.programAddressDifferent,
            programAddress: data.programAddressDifferent ? (data.programAddress || null) : null
          }
        }
      };

      // Generate PDF with live data
      setGeneratingPDF(true);
      const pdfDoc = await generatePDF(pdfSubmissionData);
      
      // Save PDF to cloud storage
      const pdfInfo = await savePDFToStorage(pdfDoc, pdfSubmissionData);
      
      // Add PDF info to submission data
      dataToSave.pdfVersions = [
        ...(existingSubmission?.pdfVersions || []),
        {
          ...pdfInfo,
          version: (existingSubmission?.pdfVersions?.length || 0) + 1
        }
      ];

      // Add submission status
      dataToSave.submissionStatus = 'submitted';
      dataToSave.submissionCompletedAt = new Date().toISOString();

      // Calculate payment eligibility based on school year
      const eligibility = determineFundingEligibility(selectedStudent.birthday, schoolYear);
      
      // Create payment eligibility data
      const paymentEligibilityData = {
        determinedAt: timestamp,
        schoolYear,
        birthday: selectedStudent.birthday,
        ageOnSept1: eligibility.ageDetails?.ageOnSept1 || null,
        ageOnDec31: eligibility.ageDetails?.ageOnDec31 || null,
        eligibilityStatus: eligibility.ageCategory, // 'kindergarten', 'grades_1_12', 'too_young', 'too_old', or 'unknown'
        fundingAmount: eligibility.fundingAmount,
        fundingEligible: eligibility.fundingEligible,
        reason: eligibility.message || `Funding amount: $${eligibility.fundingAmount}`,
        sourceForm: submissionId,
        studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
        studentId: selectedStudent.id,
        overrides: {
          applied: false,
          reason: null,
          authorizedBy: null,
          timestamp: null
        }
      };

      // Save to database
      const db = getDatabase();
      const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${schoolYear.replace('/', '_')}/${selectedStudent.id}`);
      await set(formRef, dataToSave);
      
      // Save payment eligibility
      const paymentRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/PAYMENT_ELIGIBILITY/${schoolYear.replace('/', '_')}/${selectedStudent.id}`);
      await set(paymentRef, paymentEligibilityData);

      toast.success('Home Education Notification Form submitted successfully!', {
        description: `Form for ${selectedStudent.firstName} ${selectedStudent.lastName} has been completed and saved. You can download the PDF anytime from your dashboard.`
      });

      setExistingSubmission(dataToSave);
      
      // Close the sheet on successful submission
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setSaving(false);
      setGeneratingPDF(false);
    }
  };

  const student = getStudentInfo();
  const guardian = getPrimaryGuardian();

  if (loading) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading form data...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-6xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>Home Education Notification Form</span>
              <span className="text-sm text-gray-600">- {selectedStudent.firstName} {selectedStudent.lastName} ({schoolYear})</span>
              {staffMode && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Eye className="w-3 h-3 mr-1" />
                  Staff View (Read-Only)
                </span>
              )}
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            {staffMode ? 
              `Viewing the Alberta Home Education Notification Form for ${selectedStudent?.firstName} ${selectedStudent?.lastName} for the ${schoolYear} school year.` :
              `Complete the official Alberta Home Education Notification Form for ${selectedStudent?.firstName} ${selectedStudent?.lastName} for the {schoolYear} school year. Use the copy buttons to quickly fill fields from other family members or previous years. Hover over info icons for full legal wording.`
            }
          </SheetDescription>
        </SheetHeader>

        {/* Legal Information Accordion */}
        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="legal-info">
              <AccordionTrigger className="text-left">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Legal Information & Regulations</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <div className="text-center space-y-2 border-b pb-4">
                    <h3 className="font-bold text-lg text-gray-900">HOME EDUCATION REGULATION A.R. 89/2019</h3>
                    <h4 className="font-semibold text-base text-gray-800">NOTIFICATION FORM FOR HOME EDUCATION PROGRAM</h4>
                    <h4 className="font-semibold text-base text-gray-800">SUPERVISED BY A SCHOOL AUTHORITY</h4>
                    <p className="font-medium text-gray-700">Education Act, Section 20</p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-justify">
                      The personal information collected on this form is collected pursuant to the provisions of Section 33(c) of the Freedom of Information and Protection of Privacy Act, R.S.A. 2000, c F-25, the Student Record Regulation, A.R. 97/2019 and Section 2 of the Home Education Regulation, A.R.89/2019 (in the case where the collection is done by an associate board) and pursuant to the provisions of the Personal Information Protection Act, the Private Schools Regulation, A.R. 93/2019 and Section 2 of the Home Education Regulation, A.R. 89/2019 (in the case where the collection is done by an associate private school) for the purposes of:
                    </p>
                    
                    <ul className="list-disc list-inside space-y-1 pl-4">
                      <li>(a) notifying a School Board or an Accredited Private School that a parent/guardian wishes to educate a student in a home education program,</li>
                      <li>(b) verifying that a student is eligible for a home education program,</li>
                      <li>(c) and for providing further particulars on the home education program in which the student will be participating so that the associate board or accredited private school can supervise the program to ensure compliance with the Education Act.</li>
                    </ul>
                    
                    <p className="text-justify">
                      This information will be treated in accordance with the Freedom of Information and Protection of Privacy Act and the Personal Information Protection Act as applicable and depending on whether the personal information is in the custody of an associate board or an associate private school. Should you have any questions regarding this activity, please contact Alberta Education, Field Services, 9th Floor, 44 Capital Boulevard, 10044 – 108 Street NW, Edmonton, Alberta, T5J 5E6 Telephone: 780-427-6272 (toll-free by first dialing 310-0000).
                    </p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h5 className="font-semibold text-blue-900 mb-2">Important Notes:</h5>
                      <ul className="space-y-2 text-blue-800">
                        <li>• Alberta Education does not require parents/guardians who complete a Notification Form to complete a registration form for the associate board or associate private school.</li>
                        <li>• Parents/guardians choosing shared responsibility programs may be required by the school to complete additional forms.</li>
                        <li>• Part A and B must be completed by the parents/guardians and submitted to the proposed associate board or associate private school.</li>
                        <li>• Part C must be completed by the associate board or private school. Parents/guardians must be notified in writing of the decision of the associate board or private school to supervise or continue to supervise the home education program within 15 school days of the associate board or private school receiving the Notification Form.</li>
                        <li>• Part D must be completed by the parent/guardian and submitted to the proposed associate board or associate private school. This part relates to the required descriptions of those components of the proposed Home Education Program that relate to Learning Outcomes referred to in the Home Education Regulation.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-8">
          {/* School Year Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                School Year: {schoolYear}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm text-blue-900">
                    You are completing the Home Education Notification Form for the <strong>{schoolYear}</strong> school year.
                    {existingSubmission ? (
                      <span className="text-green-700"> This form has been previously submitted and can be updated.</span>
                    ) : (
                      <span className="text-blue-700"> This is a new submission for this school year.</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                Form Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SmartFormField 
                label="Notification Type" 
                required
                copyOptions={copyOptions.formType || []}
                onCopy={handleCopyValue}
                fieldName="formType"
              >
                <RadioGroup 
                  value={watch('formType')} 
                  onValueChange={(value) => !readOnly && setValue('formType', value)}
                  disabled={readOnly}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" disabled={readOnly} />
                    <Label htmlFor="new" className={readOnly ? 'text-gray-500' : ''}>New notification with a new associate board or private school</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="renewal" id="renewal" disabled={readOnly} />
                    <Label htmlFor="renewal" className={readOnly ? 'text-gray-500' : ''}>Renewal with the same associate board or private school</Label>
                  </div>
                </RadioGroup>
                <input
                  type="hidden"
                  {...register('formType', { required: 'Form type is required' })}
                />
              </SmartFormField>
            </CardContent>
          </Card>

          {/* Pre-populated Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
                Student Information (Pre-populated)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField label="Legal Surname" value={student.lastName} />
              <ReadOnlyField label="Legal Given Name(s)" value={student.firstName} />
              <ReadOnlyField label="Birthdate" value={student.birthday ? formatDateForDisplay(student.birthday) : ''} />
              <ReadOnlyField label="Gender" value={student.genderDisplay} />
              <ReadOnlyField label="Student Also Known As" value={student.alsoKnownAs} />
              <ReadOnlyField label="Alberta Student Number (ASN)" value={student.asn} />
              <ReadOnlyField label="Estimated Grade Level" value={student.estimatedGradeLevel} />
              <div className="md:col-span-2">
                <ReadOnlyField 
                  label={`Student Phone ${!selectedStudent.phone ? '(Using Primary Guardian Phone)' : ''}`} 
                  value={student.phoneWithFallback} 
                />
              </div>
              
              {/* Funding Eligibility Display */}
              {paymentEligibility && (
                <div className="md:col-span-2 mt-4">
                  <div className={`p-4 rounded-lg border ${
                    paymentEligibility.fundingEligible === false
                      ? 'bg-red-50 border-red-200'
                      : paymentEligibility.ageCategory === 'kindergarten'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 p-2 rounded-full ${
                        paymentEligibility.fundingEligible === false
                          ? 'bg-red-100'
                          : paymentEligibility.ageCategory === 'kindergarten'
                          ? 'bg-amber-100'
                          : 'bg-green-100'
                      }`}>
                        {paymentEligibility.fundingEligible === false ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${
                          paymentEligibility.fundingEligible === false
                            ? 'text-red-900'
                            : paymentEligibility.ageCategory === 'kindergarten'
                            ? 'text-amber-900'
                            : 'text-green-900'
                        }`}>
                          Funding Eligibility for {schoolYear}
                        </h4>
                        <p className={`mt-1 text-sm ${
                          paymentEligibility.fundingEligible === false
                            ? 'text-red-800'
                            : paymentEligibility.ageCategory === 'kindergarten'
                            ? 'text-amber-800'
                            : 'text-green-800'
                        }`}>
                          {paymentEligibility.message || `Eligible for $${paymentEligibility.fundingAmount} in funding`}
                        </p>
                        {paymentEligibility.ageDetails && (
                          <div className="mt-2 text-xs text-gray-600">
                            <p>Age on Sept 1, {schoolYear.split('/')[0]}: {paymentEligibility.ageDetails.ageOnSept1.years} years, {paymentEligibility.ageDetails.ageOnSept1.months} months</p>
                            <p>Age on Dec 31, {schoolYear.split('/')[0]}: {paymentEligibility.ageDetails.ageOnDec31.years} years, {paymentEligibility.ageDetails.ageOnDec31.months} months</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pre-populated Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Parent/Guardian Information (Pre-populated)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField label="Parent/Guardian Last Name" value={guardian.lastName} />
              <ReadOnlyField label="Parent/Guardian First Name" value={guardian.firstName} />
              <ReadOnlyField label="Email Address" value={guardian.email} />
              <ReadOnlyField label="Phone Number" value={guardian.phone} />
              <div className="md:col-span-2">
                <ReadOnlyField label="Address" value={guardian.address?.fullAddress} />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-orange-500" />
                Address Information (From Family Profile)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReadOnlyField 
                  label="Student Address" 
                  value={student.addressInfo.fullAddress}
                  legalText="The address and telephone number of the student: Street address or legal description (Area code) Telephone number Community Province Postal Code"
                />
                <ReadOnlyField 
                  label="Student Phone" 
                  value={student.addressInfo.phone}
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Address Source: {student.addressInfo.source}</p>
                    <p className="mt-1">
                      To update address information, please use the Family Management section in your RTD Connect dashboard.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="programAddressDifferent" 
                      checked={watch('programAddressDifferent')}
                      onCheckedChange={(checked) => !readOnly && setValue('programAddressDifferent', checked)}
                      className="mt-1"
                      disabled={readOnly}
                    />
                    <div className="flex-1">
                      <Label htmlFor="programAddressDifferent" className="text-sm font-medium text-gray-900">
                        Education program will be conducted at a different location
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Check this box if the home education program will take place at an address different from the student's home address listed above.
                      </p>
                    </div>
                  </div>
                </div>
                
                {watch('programAddressDifferent') && (
                  <div className="p-4 border border-purple-200 rounded-lg bg-purple-50 space-y-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <Label className="text-sm font-medium text-gray-900">Education Program Location Address</Label>
                      <span className="text-red-500 text-sm">*</span>
                    </div>
                    
                    <div className="space-y-2">
                      <AddressPicker
                        value={watch('programAddress')}
                        onAddressSelect={(address) => {
                          if (!readOnly) {
                            setValue('programAddress', address);
                            // Clear any validation errors when address is selected
                            if (address) {
                              setValue('programAddress', address, { shouldValidate: true });
                            }
                          }
                        }}
                        placeholder="Start typing the education program location address..."
                        error={errors.programAddress?.message}
                        disabled={readOnly}
                      />
                      
                      <div className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                        <div className="flex items-start space-x-2">
                          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Program Location Requirements:</p>
                            <ul className="text-xs space-y-1">
                              <li>• Specify the complete address where instruction will primarily take place</li>
                              <li>• This may include home offices, dedicated learning spaces, or other educational facilities</li>
                              <li>• The location must be suitable for educational activities and meet local regulations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hidden input for validation */}
                    <input
                      type="hidden"
                      {...register('programAddress', {
                        validate: (value) => {
                          if (watch('programAddressDifferent') && (!value || !value.fullAddress)) {
                            return 'Please select the address where the education program will be conducted';
                          }
                          return true;
                        }
                      })}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Editable Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-500" />
                Additional Required Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <SmartFormField 
                label="Student's citizenship and immigration status" 
                required
                copyOptions={copyOptions.citizenship || []}
                onCopy={handleCopyValue}
                fieldName="citizenship"
                legalText={LEGAL_TEXT.CITIZENSHIP}
                readOnly={readOnly}
              >
                <Textarea
                  {...register('citizenship', { required: !readOnly && 'Citizenship information is required' })}
                  placeholder="e.g., Canadian citizen, or Permanent resident (expires: MM/DD/YYYY)"
                  rows={3}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className={readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}
                />
              </SmartFormField>

              <SmartFormField 
                label="Resident school board" 
                required 
                icon={Building2}
                copyOptions={copyOptions.residentSchoolBoard || []}
                onCopy={handleCopyValue}
                fieldName="residentSchoolBoard"
                legalText={LEGAL_TEXT.RESIDENT_SCHOOL_BOARD}
              >
                {readOnly ? (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {watch('residentSchoolBoard') || 'Not specified'}
                  </div>
                ) : (
                  <SchoolBoardSelector
                    value={watch('residentSchoolBoard') || ''}
                    onChange={(value) => setValue('residentSchoolBoard', value)}
                    error={errors.residentSchoolBoard?.message}
                    placeholder="Search by school board name or code (e.g. 2245)..."
                    required
                  />
                )}
                <input
                  type="hidden"
                  {...register('residentSchoolBoard', { required: 'Resident school board is required' })}
                />
              </SmartFormField>

              <SmartFormField 
                label="Previous year's education program and school"
                copyOptions={copyOptions.previousSchoolProgram || []}
                onCopy={handleCopyValue}
                fieldName="previousSchoolProgram"
                legalText={LEGAL_TEXT.PREVIOUS_EDUCATION}
              >
                <Textarea
                  {...register('previousSchoolProgram')}
                  placeholder="Enter previous school or program (if applicable)"
                  rows={2}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className={readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}
                />
              </SmartFormField>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assistanceRequired"
                    checked={watch('assistanceRequired')}
                    onCheckedChange={(checked) => !readOnly && setValue('assistanceRequired', checked)}
                    disabled={readOnly}
                  />
                  <Label htmlFor="assistanceRequired" className={readOnly ? 'text-gray-500' : ''}>Do you need help preparing the home education program plan?</Label>
                </div>
                
                {copyOptions.assistanceRequired?.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Copy from:</span>
                    {copyOptions.assistanceRequired.map((option, index) => (
                      <CopyButton
                        key={index}
                        source={option.source}
                        value={option.value}
                        onCopy={(value) => handleCopyValue('assistanceRequired', value)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <SmartFormField 
                label="Additional instructor information"
                copyOptions={copyOptions.additionalInstructor || []}
                onCopy={handleCopyValue}
                fieldName="additionalInstructor"
              >
                <Textarea
                  {...register('additionalInstructor')}
                  placeholder="If someone other than the parent/guardian will be providing instruction, provide their name(s) here"
                  rows={3}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className={readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}
                />
              </SmartFormField>

              <SmartFormField 
                label="Aboriginal declaration (optional)"
                copyOptions={copyOptions.aboriginalDeclaration || []}
                onCopy={handleCopyValue}
                fieldName="aboriginalDeclaration"
                legalText={LEGAL_TEXT.ABORIGINAL_DECLARATION}
              >
                <RadioGroup 
                  value={watch('aboriginalDeclaration')} 
                  onValueChange={(value) => !readOnly && setValue('aboriginalDeclaration', value)}
                  disabled={readOnly}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="status-indian" id="status-indian" disabled={readOnly} />
                    <Label htmlFor="status-indian" className={readOnly ? 'text-gray-500' : ''}>Status Indian/First Nations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-status-indian" id="non-status-indian" disabled={readOnly} />
                    <Label htmlFor="non-status-indian" className={readOnly ? 'text-gray-500' : ''}>Non-Status Indian/First Nations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metis" id="metis" disabled={readOnly} />
                    <Label htmlFor="metis" className={readOnly ? 'text-gray-500' : ''}>Métis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inuit" id="inuit" disabled={readOnly} />
                    <Label htmlFor="inuit" className={readOnly ? 'text-gray-500' : ''}>Inuit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-applicable" id="not-applicable" disabled={readOnly} />
                    <Label htmlFor="not-applicable" className={readOnly ? 'text-gray-500' : ''}>Prefer not to declare</Label>
                  </div>
                </RadioGroup>
                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  {...register('aboriginalDeclaration')}
                  value={watch('aboriginalDeclaration') || ''}
                />
              </SmartFormField>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Francophone education eligibility</h4>
                
                <SmartFormField 
                  label="According to the criteria above as set out in the Canadian Charter of Rights and Freedoms, are you eligible to have your child receive a French first language (Francophone) education?"
                  copyOptions={copyOptions.francophoneEligible || []}
                  onCopy={handleCopyValue}
                  fieldName="francophoneEligible"
                  legalText={LEGAL_TEXT.FRANCOPHONE_EDUCATION}
                >
                  <RadioGroup 
                    value={watch('francophoneEligible')} 
                    onValueChange={(value) => !readOnly && setValue('francophoneEligible', value)}
                    disabled={readOnly}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="franco-yes" disabled={readOnly} />
                      <Label htmlFor="franco-yes" className={readOnly ? 'text-gray-500' : ''}>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="franco-no" disabled={readOnly} />
                      <Label htmlFor="franco-no" className={readOnly ? 'text-gray-500' : ''}>No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id="franco-unknown" disabled={readOnly} />
                      <Label htmlFor="franco-unknown" className={readOnly ? 'text-gray-500' : ''}>Do not know</Label>
                    </div>
                  </RadioGroup>
                  {/* Hidden input for form validation */}
                  <input
                    type="hidden"
                    {...register('francophoneEligible')}
                    value={watch('francophoneEligible') || ''}
                  />
                </SmartFormField>

                {watch('francophoneEligible') === 'yes' && (
                  <SmartFormField 
                    label="If yes, do you wish to exercise your right to have your child receive a French first language (Francophone) education?"
                    copyOptions={copyOptions.francophoneExercise || []}
                    onCopy={handleCopyValue}
                    fieldName="francophoneExercise"
                  >
                    <RadioGroup 
                      value={watch('francophoneExercise')} 
                      onValueChange={(value) => !readOnly && setValue('francophoneExercise', value)}
                      disabled={readOnly}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="exercise-yes" disabled={readOnly} />
                        <Label htmlFor="exercise-yes" className={readOnly ? 'text-gray-500' : ''}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="exercise-no" disabled={readOnly} />
                        <Label htmlFor="exercise-no" className={readOnly ? 'text-gray-500' : ''}>No</Label>
                      </div>
                    </RadioGroup>
                    {/* Hidden input for form validation */}
                    <input
                      type="hidden"
                      {...register('francophoneExercise')}
                      value={watch('francophoneExercise') || ''}
                    />
                  </SmartFormField>
                )}
              </div>


              {/* Part B - Declaration */}
              <div className="border-t pt-6 space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">PART B - Declaration by Parent/Guardian</h3>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
                  <div className="text-sm text-gray-800 leading-relaxed">
                    <p className="mb-4">
                      I/We, <strong>{guardian.firstName} {guardian.lastName}</strong>, the parent(s)/guardian(s) of <strong>{student.firstName} {student.lastName}</strong>, 
                      the student, declare to the best of my/our knowledge that the home education program and the activities selected for the 
                      home education program will enable the student (check as applicable):
                    </p>
                    
                    <div className="space-y-3 ml-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="programAlberta" 
                          checked={watch('programAlberta')}
                          onCheckedChange={(checked) => !readOnly && setValue('programAlberta', checked)}
                          className="mt-1"
                          disabled={readOnly}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="programAlberta" className="text-sm leading-relaxed">
                              to achieve the outcomes contained in the Alberta Programs of Study.
                            </Label>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5" 
                              type="button"
                              onClick={() => setAlbertaProgramsInfoOpen(true)}
                            >
                              <Info className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          id="programSchedule" 
                          checked={watch('programSchedule')}
                          onCheckedChange={(checked) => !readOnly && setValue('programSchedule', checked)}
                          className="mt-1"
                          disabled={readOnly}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="programSchedule" className="text-sm leading-relaxed">
                              to achieve the outcomes contained in the Schedule included in the Home Education Regulation.
                            </Label>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5" 
                              type="button"
                              onClick={() => setSoloInfoOpen(true)}
                            >
                              <Info className="h-4 w-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hidden inputs for form validation */}
                      <input
                        type="hidden"
                        {...register('programAlberta')}
                        value={watch('programAlberta')}
                      />
                      <input
                        type="hidden"
                        {...register('programSchedule')}
                        value={watch('programSchedule')}
                      />
                    </div>
                    
                    <div className="mt-6 space-y-4 text-sm">
                      <p>
                        In addition, I/We understand and agree that the instruction and evaluation of my/our child's progress is my/our responsibility 
                        and that the associate board or private school will supervise and evaluate my/our child's progress in accordance with the 
                        Home Education Regulation.
                      </p>
                      
                      <p>
                        I/We understand and agree that the development, administration and management of the home education program is our 
                        responsibility.
                      </p>
                    </div>
                  </div>
                </div>
              </div>


              {watch('programSchedule') && (
                <Alert className="border-blue-200 bg-blue-50 mt-4">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <p className="font-medium text-blue-800 mb-2">Part D - Program Descriptions</p>
                    <p className="text-blue-700 text-sm">
                      The detailed program descriptions required for Part D (instructional methods, resources, evaluation, and facilities) 
                      are handled through our separate <strong>Program Plan Form</strong>. You do not need to complete Part D here.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              

              {/* Digital Signature Section */}
              <div className="border-t pt-6 space-y-4">
                <h4 className="font-medium text-gray-900">Digital Signature</h4>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="space-y-3">
                    <p className="text-sm text-blue-800">
                      <strong>Signature(s) of Supervising Parent(s) or Legal Guardian(s)</strong>
                    </p>
                    
                    <div className="bg-white p-3 border border-blue-300 rounded">
                      <p className="text-sm font-medium text-gray-900">
                        {guardian.firstName} {guardian.lastName} (Digital Signature)
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Authenticated User: {guardian.email}
                      </p>
                      <p className="text-xs text-gray-600">
                        Date: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="signatureAgreed"
                        checked={watch('signatureAgreed')}
                        onCheckedChange={(checked) => !readOnly && setValue('signatureAgreed', checked)}
                        className="mt-1"
                        disabled={readOnly}
                      />
                      <Label htmlFor="signatureAgreed" className="text-sm leading-relaxed">
                        By checking this box, I hereby provide my digital signature and certify that I am the parent/guardian named above. 
                        I confirm that all information provided in this form is true and accurate to the best of my knowledge, and I agree 
                        to all terms and declarations contained in this Home Education Notification Form.
                      </Label>
                    </div>
                    
                    {/* Hidden field for validation */}
                    <input
                      type="hidden"
                      {...register('signatureAgreed', { required: 'You must provide your digital signature by checking this box' })}
                    />
                    
                    {errors.signatureAgreed && (
                      <p className="text-red-600 text-sm">{errors.signatureAgreed.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Status and Downloads */}
          {existingSubmission && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-500" />
                  Form Status & Downloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Form Status - with completeness check */}
                  {(() => {
                    const formIsComplete = isFormComplete(existingSubmission);
                    const missingParts = getMissingParts(existingSubmission);
                    
                    if (formIsComplete) {
                      return (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-sm text-green-800">
                                Form Complete & Approved
                              </p>
                              <p className="text-xs text-green-600">
                                {existingSubmission.submissionCompletedAt ? 
                                  `Completed: ${new Date(existingSubmission.submissionCompletedAt).toLocaleString()}` :
                                  `Last Updated: ${new Date(existingSubmission.lastUpdated).toLocaleString()}`
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="space-y-3">
                          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-5 h-5 text-orange-600" />
                              <div>
                                <p className="font-medium text-sm text-orange-800">
                                  Form Needs Updates
                                </p>
                                <p className="text-xs text-orange-600">
                                  Last Updated: {new Date(existingSubmission.lastUpdated).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <Alert className="border-orange-200 bg-orange-50">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <AlertDescription>
                              <p className="font-medium text-orange-800 mb-2">Missing Required Sections:</p>
                              <ul className="list-disc list-inside text-orange-700 text-sm space-y-1">
                                {missingParts.map((missing, idx) => (
                                  <li key={idx}>
                                    <strong>{missing.part}:</strong> {missing.description}
                                    <br />
                                    <span className="text-xs text-orange-600 ml-4">→ {missing.action}</span>
                                  </li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        </div>
                      );
                    }
                  })()}

                  {/* Download Current PDF */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-sm text-blue-800">Download Current Form</p>
                      <p className="text-xs text-blue-600">
                        Generate PDF with current form data
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={generatingPDF}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {generatingPDF ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Previous PDF Versions */}
                  {existingSubmission.pdfVersions && existingSubmission.pdfVersions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Previous PDF Versions</h4>
                      {existingSubmission.pdfVersions.map((pdf, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">Version {pdf.version}</p>
                            <p className="text-xs text-gray-500">
                              Generated: {new Date(pdf.generatedAt).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(pdf.url, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            {staffMode ? (
              // Staff mode: Show PDF download button
              <Button
                type="button"
                onClick={generatePDF}
                disabled={generatingPDF}
                className="flex-1"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Form PDF
                  </>
                )}
              </Button>
            ) : (
              // Regular mode: Show save button
              <Button
                type="submit"
                disabled={saving || generatingPDF}
                className="flex-1"
              >
                {saving || generatingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {generatingPDF ? 'Generating PDF...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isFormComplete(existingSubmission) ? 'Update Form' : 'Complete Form'}
                  </>
                )}
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving || generatingPDF}
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </form>
      </SheetContent>
      
      {/* Alberta Programs of Study Info Sheet */}
      <Sheet open={albertaProgramsInfoOpen} onOpenChange={setAlbertaProgramsInfoOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
              Alberta Programs of Study
            </SheetTitle>
            <SheetDescription className="text-left">
              Detailed information about Alberta's standard curriculum
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">What are the Alberta Programs of Study?</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                The Alberta Programs of Study are the detailed curriculum guidelines used by public schools across Alberta. 
                They outline exactly what students should learn at each grade level in every subject.
              </p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Key Features:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Comprehensive:</strong> Approximately 1,400 specific learning outcomes per grade level</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Structured:</strong> Covers core subjects like English Language Arts, Mathematics, Science, and Social Studies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Grade-specific:</strong> Learning objectives are organized by grade level from Kindergarten to Grade 12</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">Benefits for Home Education:</h4>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>High School Credits:</strong> Students can earn official Alberta high school credits</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Alberta High School Diploma:</strong> Students can receive the official Alberta High School Diploma</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>University Preparation:</strong> Follows the same standards as public schools for post-secondary admission</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Clear Structure:</strong> Provides detailed guidance on what to teach and when</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3">What This Means for You:</h4>
              <p className="text-sm text-yellow-800 leading-relaxed">
                If you choose this option, your home education program will follow the same curriculum as Alberta public schools. 
                You'll need to cover the specific learning outcomes for your child's grade level in each subject area. This provides 
                a structured approach but requires more adherence to prescribed content and timelines.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Official Resources:</h4>
              <div className="space-y-2">
                <a 
                  href="https://www.alberta.ca/programs-of-study" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm hover:underline"
                >
                  Alberta Programs of Study - Official Government Page →
                </a>
                <br />
                <a 
                  href="https://www.learnalberta.ca" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm hover:underline"
                >
                  LearnAlberta - Curriculum Resources for Parents →
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* SOLO Info Sheet */}
      <Sheet open={soloInfoOpen} onOpenChange={setSoloInfoOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-left flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-500" />
              Schedule of Learning Outcomes (SOLO)
            </SheetTitle>
            <SheetDescription className="text-left">
              Flexible home education option with broad learning goals
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-900">What is the Schedule of Learning Outcomes?</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                The Schedule of Learning Outcomes (SOLO) is a flexible alternative to the Alberta Programs of Study. 
                Instead of following 1,400+ specific outcomes per grade, SOLO provides just 22 broad learning outcomes 
                that students should achieve by age 20 across their entire K-12 education.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">Key Features:</h4>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Simple:</strong> Only 22 general learning outcomes to achieve over 12+ years</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Flexible:</strong> No grade-level requirements - learn at your child's pace</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Personalized:</strong> Focus on your child's interests, strengths, and learning style</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Balanced:</strong> Half academic skills, half personal/social development</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Benefits for Home Education:</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Maximum Freedom:</strong> Choose your own curriculum, methods, and timeline</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Child-Led Learning:</strong> Follow your child's natural interests and curiosity</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Less Pressure:</strong> No grade-level expectations or rigid timelines</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Real-World Focus:</strong> Emphasizes practical life skills and personal development</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3">Important Considerations:</h4>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>No High School Diploma:</strong> Students cannot receive an Alberta High School Diploma</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>No Course Credits:</strong> Students cannot earn individual high school course credits</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>Diploma Exams Available:</strong> Students can still write Alberta diploma exams, but marks stand alone</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span><strong>University Planning:</strong> May require alternative routes for post-secondary admission</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3">What This Means for You:</h4>
              <p className="text-sm text-purple-800 leading-relaxed">
                If you choose SOLO, you have the freedom to create a completely customized education for your child. 
                You can use any resources, follow any approach, and learn at any pace - as long as you work toward 
                the 22 broad outcomes by age 20. This is ideal for families who want maximum flexibility and prefer 
                child-led or alternative educational approaches.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Official Resources:</h4>
              <div className="space-y-2">
                <a 
                  href="https://open.alberta.ca/publications/2019_089" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm hover:underline"
                >
                  Home Education Regulation - Official Document →
                </a>
                <br />
                <a 
                  href="https://albertahomeschooling.ca/resources.html" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm hover:underline"
                >
                  Alberta Homeschooling Association - SOLO Resources →
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </Sheet>
  );
};

export default HomeEducationNotificationFormV2;