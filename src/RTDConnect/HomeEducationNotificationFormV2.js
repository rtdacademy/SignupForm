import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getCurrentSchoolYear, formatImportantDate } from '../config/importantDates';
import CitizenshipDocuments from '../Registration/CitizenshipDocuments';
import SchoolBoardSelector from '../components/SchoolBoardSelector';
import AddressPicker from '../components/AddressPicker';

// Helper function to get previous school year
const getPreviousSchoolYear = (currentYear) => {
  const [startYear, endYear] = currentYear.split('/');
  const prevStart = (parseInt(startYear) - 1).toString().padStart(2, '0');
  const prevEnd = (parseInt(endYear) - 1).toString().padStart(2, '0');
  return `${prevStart}/${prevEnd}`;
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
  MapPin
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
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

const FormField = ({ label, error, children, required = false, readOnly = false, icon: Icon, legalText }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <label className={`flex items-center text-sm font-medium ${readOnly ? 'text-gray-500' : 'text-gray-900'}`}>
        {Icon && <Icon className="w-4 h-4 mr-2 text-purple-500" />}
        {label}
        {required && !readOnly && <span className="text-red-500 ml-1">*</span>}
        {readOnly && <span className="text-xs text-gray-500 ml-2">(from family profile)</span>}
      </label>
      {legalText && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <Info className="h-4 w-4 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-4">
            <p className="text-sm text-gray-600">{legalText}</p>
          </PopoverContent>
        </Popover>
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
  legalText
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <label className={`flex items-center text-sm font-medium text-gray-900`}>
          {Icon && <Icon className="w-4 h-4 mr-2 text-purple-500" />}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {legalText && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Info className="h-4 w-4 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4">
              <p className="text-sm text-gray-600">{legalText}</p>
            </PopoverContent>
          </Popover>
        )}
      </div>
      
      {copyOptions.length > 0 && (
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


const HomeEducationNotificationFormV2 = ({ 
  isOpen, 
  onOpenChange, 
  familyId, 
  familyData,
  selectedStudent,
  schoolYear
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [citizenshipDocuments, setCitizenshipDocuments] = useState([]);
  
  // Data for smart copying
  const [familyFormData, setFamilyFormData] = useState({});
  const [copyOptions, setCopyOptions] = useState({});
  
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
      partDMethod: '',
      partDResources: '',
      partDEvaluation: '',
      partDFacilities: '',
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
        const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${schoolYear}/${selectedStudent.id}`);
        const snapshot = await get(formRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setExistingSubmission(data);
          setCitizenshipDocuments(data.citizenshipDocuments || []);
          
          // Populate form with existing data
          Object.keys(data.editableFields || {}).forEach(key => {
            setValue(key, data.editableFields[key]);
          });
        } else {
          // Check previous year for renewal determination
          const prevYear = getPreviousSchoolYear(schoolYear);
          if (prevYear) {
            const prevFormRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${prevYear}/${selectedStudent.id}`);
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
            const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${year}/${student.id}`);
            const snapshot = await get(formRef);
            
            if (snapshot.exists()) {
              familyFormsData[year][student.id] = {
                ...snapshot.val(),
                studentName: `${student.preferredName || student.firstName} ${student.lastName}`
              };
            }
          } catch (error) {
            console.error(`Error loading form for student ${student.id} year ${year}:`, error);
          }
        }
      }
      
      // Build copy options for each field
      const fieldsToCopy = [
        'residentSchoolBoard', 
        'formType',
        'additionalInstructor',
        'assistanceRequired',
        'aboriginalDeclaration',
        'francophoneEligible',
        'francophoneExercise',
        'citizenship',
        'previousSchoolProgram',
        'programAlberta',
        'programSchedule',
        'programAddress',
        // Add partD fields
        'partDMethod',
        'partDResources',
        'partDEvaluation',
        'partDFacilities'
      ];
      
      fieldsToCopy.forEach(fieldName => {
        copyOpts[fieldName] = [];
        
        // Current year - other siblings
        Object.entries(familyFormsData[schoolYear] || {}).forEach(([studentId, formData]) => {
          if (studentId !== selectedStudent.id && formData.editableFields?.[fieldName]) {
            copyOpts[fieldName].push({
              source: formData.studentName,
              value: formData.editableFields[fieldName],
              type: 'sibling-current'
            });
          }
        });
        
        // Previous year - same student
        const prevYearData = familyFormsData[getPreviousSchoolYear(schoolYear)]?.[selectedStudent.id];
        if (prevYearData?.editableFields?.[fieldName]) {
          copyOpts[fieldName].push({
            source: 'Last Year',
            value: prevYearData.editableFields[fieldName],
            type: 'self-previous'
          });
        }
        
        // Previous year - other siblings
        Object.entries(familyFormsData[getPreviousSchoolYear(schoolYear)] || {}).forEach(([studentId, formData]) => {
          if (studentId !== selectedStudent.id && formData.editableFields?.[fieldName]) {
            copyOpts[fieldName].push({
              source: `${formData.studentName} (Last Year)`,
              value: formData.editableFields[fieldName],
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

      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTIFICATION FORM FOR HOME EDUCATION PROGRAM', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      doc.setFontSize(12);
      doc.text('SUPERVISED BY A SCHOOL AUTHORITY', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text('HOME EDUCATION REGULATION A.R. 89/2019', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      doc.text('Education Act, Section 20', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`School Year: ${submissionData.schoolYear}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Legal text at top
      doc.setFontSize(8);
      const legalText = "The personal information collected on this form is collected pursuant to the provisions of Section 33(c) of the Freedom of Information and Protection of Privacy Act, R.S.A. 2000, c F-25, the Student Record Regulation, A.R. 97/2019 and Section 2 of the Home Education Regulation, A.R. 89/2019 (in the case where the collection is done by an associate board) and pursuant to the provisions of the Personal Information Protection Act, the Private Schools Regulation, A.R. 93/2019 and Section 2 of the Home Education Regulation, A.R. 89/2019 (in the case where the collection is done by an associate private school) for the purposes of (a) notifying a School Board or an Accredited Private School that a parent/guardian wishes to educate a student in a home education program, (b) verifying that a student is eligible for a home education program, (c) and for providing further particulars on the home education program in which the student will be participating so that the associate board or accredited private school can supervise the program to ensure compliance with the Education Act. This information will be treated in accordance with the Freedom of Information and Protection of Privacy Act and the Personal Information Protection Act as applicable and depending on whether the personal information is in the custody of an associate board or an associate private school. Should you have any questions regarding this activity, please contact Alberta Education, Field Services, 9th Floor, 44 Capital Boulevard, 10044 – 108 Street NW, Edmonton, Alberta, T5J 5E6 Telephone: 780-427-6272 (toll-free by first dialing 310-0000).";
      const splitLegal = doc.splitTextToSize(legalText, pageWidth - 40);
      doc.text(splitLegal, 20, yPosition);
      yPosition += splitLegal.length * 4 + 10;

      // Notes
      const notesText = "Alberta Education does not require parents/guardians who complete a Notification Form to complete a registration form for the associate board or associate private school. Parents/guardians choosing shared responsibility programs may be required by the school to complete additional forms.";
      const splitNotes = doc.splitTextToSize(notesText, pageWidth - 40);
      doc.text(splitNotes, 20, yPosition);
      yPosition += splitNotes.length * 4 + 10;

      // Form Type
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('PART A - Student Information', 20, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      const formType = submissionData.editableFields.formType === 'new' ? 
        'Notification of Intention to Home Educate with a new associate board or associate private school.' :
        'Notification of Renewal of Intention to Home Educate with the same associate board or associate private school.';
      doc.text(`☑ ${formType}`, 20, yPosition);
      yPosition += 10;

      // Student Information Table
      const student = submissionData.studentInfo;
      const guardian = submissionData.guardianInfo;
      const editable = submissionData.editableFields;
      
      doc.autoTable({
        startY: yPosition,
        head: [['Field', 'Information']],
        body: [
          ['Legal Surname', student.lastName || ''],
          ['Legal Given Name(s)', student.firstName || ''],
          ['Birthdate', student.birthday ? new Date(student.birthday).toLocaleDateString() : ''],
          ['Gender', student.genderDisplay],
          ['Registration Date', editable.registrationDate || ''],
          ['Student Also Known As - Surname', student.alsoKnownAs ? student.lastName : ''],
          ['Student Also Known As - Given Name(s)', student.alsoKnownAs || ''],
          ['Parent/Guardian 1 - Last Name', guardian.lastName || ''],
          ['Parent/Guardian 1 - First Name', guardian.firstName || ''],
          ['Parent/Guardian 1 - Home Phone', guardian.phone || ''],
          ['Parent/Guardian Email Address', guardian.email || ''],
          ['Student Phone Number', student.phoneWithFallback || ''],
          ['Alberta Student Number (ASN)', student.asn || '(To be provided by the school)'],
          ['Student Address', `${student.addressInfo.fullAddress || ''}\nPhone: ${student.addressInfo.phone || ''}`],
          ['Parent/Guardian Address', guardian.address?.fullAddress || 'Same as student'],
          ['Program Location Address', editable.programAddressDifferent ? (editable.programAddress?.fullAddress || editable.programAddress?.formattedAddress || 'Address provided') : 'Same as above'],
          ['Citizenship', editable.citizenship || ''],
          ['Estimated Grade Level', student.estimatedGradeLevel],
          ['Resident School Board', editable.residentSchoolBoard || ''],
          ['Previous School Program', editable.previousSchoolProgram || ''],
          ['Assistance Required', editable.assistanceRequired ? 'Yes' : 'No'],
          ['Additional Instructor', editable.additionalInstructor || 'N/A'],
          ['Aboriginal Declaration', editable.aboriginalDeclaration || 'Not declared'],
          ['Francophone Education Eligible', editable.francophoneEligible || 'Not specified'],
          ['Exercise Francophone Right', editable.francophoneExercise || 'Not specified'],
          ['Program Outcomes', `${editable.programAlberta ? '✓ Alberta Programs of Study' : ''}\n${editable.programSchedule ? '✓ Schedule included in the Home Education Regulation' : ''}`]
        ],
        styles: { fontSize: 9 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 110 }
        },
        margin: { left: 20, right: 20 }
      });

      // Check if we need a new page
      yPosition = doc.lastAutoTable.finalY + 15;
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Part B - Declaration
      doc.setFont('helvetica', 'bold');
      doc.text('PART B - Declaration by Parent/Guardian', 20, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      const declarationText = `I/We, ${guardian.firstName} ${guardian.lastName}, the parent(s)/guardian(s) of ${student.firstName} ${student.lastName}, declare to the best of my/our knowledge that the home education program and the activities selected for the home education program will enable the student to achieve the outcomes contained in the ${editable.programAlberta ? 'Alberta Programs of Study' : ''}${editable.programAlberta && editable.programSchedule ? ' and ' : ''}${editable.programSchedule ? 'Schedule included in the Home Education Regulation' : ''}.
      
In addition, I/We understand and agree that the instruction and evaluation of my/our child's progress is my/our responsibility and that the associate board or private school will supervise and evaluate my/our child's progress in accordance with the Home Education Regulation.

I/We understand and agree that the development, administration and management of the home education program is our responsibility.`;
      
      const splitDeclaration = doc.splitTextToSize(declarationText, pageWidth - 40);
      doc.text(splitDeclaration, 20, yPosition);
      yPosition += splitDeclaration.length * 4 + 10;

      // Implications note
      const implicationsText = "Parents/guardians who provide home education programs acknowledge that there are implications when they choose to use programs different from the Alberta Programs of Study:\n1. Students may not apply to a high school principal for high school credits.\n2. Students may not receive an Alberta High School Diploma.\n\nAny student in a home education program may write a high school diploma examination. However, the diploma examination mark achieved will stand alone and will not result in a final course mark unless accompanied by a recommendation for credit by a high school principal. A final course mark requires both a school awarded mark and a diploma examination mark. Arrangements to write diploma examinations should be made well in advance of the writing date by contacting the associate school board or associate private school for assistance or Exam Administration at 780-427-0010.";
      const splitImplications = doc.splitTextToSize(implicationsText, pageWidth - 40);
      doc.text(splitImplications, 20, yPosition);
      yPosition += splitImplications.length * 4 + 10;

      // Signature section
      doc.text('Signature of Supervising Parent(s) or Legal Guardian(s):', 20, yPosition);
      yPosition += 8;
      doc.text(`${guardian.firstName} ${guardian.lastName} (Digital Signature)`, 20, yPosition);
      yPosition += 6;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 15;

      // PART D if applicable
      if (editable.programSchedule) {
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.text('PART D Requirements for the Home Education Program for Components of the Program that Do Not Follow the Alberta Programs of Study', 20, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        doc.text('1. Describe the instructional method to be used, the activities planned for the program and how the instructional method and the activities will enable the student to achieve the learning outcomes contained in the Schedule.', 20, yPosition);
        yPosition += 10;
        const splitMethod = doc.splitTextToSize(editable.partDMethod || 'Not provided', pageWidth - 40);
        doc.text(splitMethod, 20, yPosition);
        yPosition += splitMethod.length * 4 + 10;

        doc.text('2. Identify the resource materials, if different from provincially authorized materials, to be used for instruction.', 20, yPosition);
        yPosition += 10;
        const splitResources = doc.splitTextToSize(editable.partDResources || 'Not provided', pageWidth - 40);
        doc.text(splitResources, 20, yPosition);
        yPosition += splitResources.length * 4 + 10;

        doc.text('3. Describe the methods and nature of the evaluation to be used to assess the student\'s progress, the number of evaluations and how the evaluation addresses the learning outcomes in Question 1.', 20, yPosition);
        yPosition += 10;
        const splitEvaluation = doc.splitTextToSize(editable.partDEvaluation || 'Not provided', pageWidth - 40);
        doc.text(splitEvaluation, 20, yPosition);
        yPosition += splitEvaluation.length * 4 + 10;

        doc.text('4. Describe the associate board or associate private school facilities and services that the parent/guardian wishes to use.', 20, yPosition);
        yPosition += 10;
        const splitFacilities = doc.splitTextToSize(editable.partDFacilities || 'Not provided', pageWidth - 40);
        doc.text(splitFacilities, 20, yPosition);
        yPosition += splitFacilities.length * 4 + 10;
      }

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
      const fileRef = storageRef(storage, `rtdAcademy/homeEducationForms/${familyId}/${schoolYear}/${selectedStudent.id}/${filename}`);
      
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
    
    if (data.programSchedule && (!data.partDMethod || !data.partDEvaluation)) {
      toast.error('Please complete the required descriptions in Part D for programs following the Schedule.');
      return;
    }

    setSaving(true);
    
    try {
      const timestamp = Date.now();
      const submissionId = existingSubmission?.submissionId || `sub_${timestamp}`;
      
      const submissionData = {
        submissionId,
        schoolYear,
        formType: data.formType,
        studentInfo: getStudentInfo(),
        guardianInfo: getPrimaryGuardian(),
        editableFields: {
          registrationDate: new Date().toISOString().split('T')[0],
          citizenship: data.citizenship,
          residentSchoolBoard: data.residentSchoolBoard,
          previousSchoolProgram: data.previousSchoolProgram,
          assistanceRequired: data.assistanceRequired,
          additionalInstructor: data.additionalInstructor,
          aboriginalDeclaration: data.aboriginalDeclaration,
          francophoneEligible: data.francophoneEligible,
          francophoneExercise: data.francophoneExercise,
          programAlberta: data.programAlberta,
          programSchedule: data.programSchedule,
          partDMethod: data.partDMethod,
          partDResources: data.partDResources,
          partDEvaluation: data.partDEvaluation,
          partDFacilities: data.partDFacilities,
          signatureAgreed: data.signatureAgreed,
          programAddressDifferent: data.programAddressDifferent,
          programAddress: data.programAddress,
        },
        citizenshipDocuments: citizenshipDocuments,
        submittedAt: existingSubmission?.submittedAt || timestamp,
        lastUpdated: timestamp,
        submittedBy: user.uid
      };

      // Generate PDF
      setGeneratingPDF(true);
      const pdfDoc = await generatePDF(submissionData);
      
      // Save PDF to cloud storage
      const pdfInfo = await savePDFToStorage(pdfDoc, submissionData);
      
      // Add PDF info to submission data
      submissionData.pdfVersions = [
        ...(existingSubmission?.pdfVersions || []),
        {
          ...pdfInfo,
          version: (existingSubmission?.pdfVersions?.length || 0) + 1
        }
      ];

      // Save to database
      const db = getDatabase();
      const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${schoolYear}/${selectedStudent.id}`);
      await set(formRef, submissionData);

      toast.success('Form submitted successfully!', {
        description: 'PDF generated and saved to cloud storage'
      });

      setExistingSubmission(submissionData);
      
      // Download PDF automatically
      pdfDoc.save(`HomeEducation_NotificationForm_${schoolYear}_${selectedStudent.firstName}_${selectedStudent.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
      
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
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            Complete the official Alberta Home Education Notification Form for {selectedStudent?.firstName} {selectedStudent?.lastName} for the {schoolYear} school year. Use the copy buttons to quickly fill fields from other family members or previous years. Hover over info icons for full legal wording.
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
                  onValueChange={(value) => setValue('formType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">New notification with a new associate board or private school</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="renewal" id="renewal" />
                    <Label htmlFor="renewal">Renewal with the same associate board or private school</Label>
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
              <ReadOnlyField label="Birthdate" value={student.birthday ? new Date(student.birthday).toLocaleDateString() : ''} />
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
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="programAddressDifferent" {...register('programAddressDifferent')} />
                  <Label htmlFor="programAddressDifferent">Education program will be conducted at a different location</Label>
                </div>
                
                {watch('programAddressDifferent') && (
                  <div className="p-4 border border-gray-200 rounded-md space-y-3">
                    <Label className="text-sm font-medium text-gray-900">Education Program Location</Label>
                    <AddressPicker
                      value={watch('programAddress')}
                      onAddressSelect={(address) => setValue('programAddress', address)}
                      placeholder="Start typing the education program location address..."
                    />
                    <p className="text-xs text-gray-500">
                      Select the address where the home education program will be conducted.
                    </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SmartFormField 
                  label="Student's citizenship status" 
                  required
                  copyOptions={copyOptions.citizenship || []}
                  onCopy={handleCopyValue}
                  fieldName="citizenship"
                  legalText="The citizenship of the student and, if the student is not a Canadian citizen, the type of visa or other document by which the student is lawfully admitted to Canada for permanent or temporary residence, and the expiry date of that visa or other document:"
                >
                  <Textarea
                    {...register('citizenship', { required: 'Citizenship information is required' })}
                    placeholder="e.g., Canadian citizen, or Permanent resident (expiry: mm/dd/yyyy), etc."
                    rows={3}
                  />
                </SmartFormField>

                <SmartFormField 
                  label="Resident school board" 
                  required 
                  icon={Building2}
                  copyOptions={copyOptions.residentSchoolBoard || []}
                  onCopy={handleCopyValue}
                  fieldName="residentSchoolBoard"
                >
                  <SchoolBoardSelector
                    value={watch('residentSchoolBoard') || ''}
                    onChange={(value) => setValue('residentSchoolBoard', value)}
                    error={errors.residentSchoolBoard?.message}
                    placeholder="Search by school board name or code (e.g. 2245)..."
                    required
                  />
                  <input
                    type="hidden"
                    {...register('residentSchoolBoard', { required: 'Resident school board is required' })}
                  />
                </SmartFormField>

                <SmartFormField 
                  label="Previous year's education program"
                  copyOptions={copyOptions.previousSchoolProgram || []}
                  onCopy={handleCopyValue}
                  fieldName="previousSchoolProgram"
                >
                  <Input
                    {...register('previousSchoolProgram')}
                    placeholder="Enter previous school or program name (if applicable)"
                  />
                </SmartFormField>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assistanceRequired"
                    {...register('assistanceRequired')}
                  />
                  <Label htmlFor="assistanceRequired">Do you need help preparing the home education program plan?</Label>
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
                />
              </SmartFormField>

              <SmartFormField 
                label="Aboriginal declaration (optional)"
                copyOptions={copyOptions.aboriginalDeclaration || []}
                onCopy={handleCopyValue}
                fieldName="aboriginalDeclaration"
                legalText="If you wish to declare that you are an Aboriginal person, please specify: Status Indian/First Nations Non-Status Indian/First Nations Métis Inuit Alberta Education is collecting this personal information pursuant to section 33(c) of the Freedom of Information and Protection of Privacy Act (FOIP Act) as the information relates directly to and is necessary to meet its mandate and responsibilities to measure system effectiveness over time and develop policies, programs and services to improve Aboriginal learner success. Pursuant to section 13 and 14 of the Personal Information Protection Act (PIPA), Level 2 accredited private schools in Alberta are collecting this information in order to develop policies, programs and services to improve Aboriginal learner success. For more information, please contact the office of the Director, Strategy and System Supports, First Nations, Métis and Inuit Education Directorate, Alberta Education at 780-427-8501 (toll-free by first dialing 310-0000). If you have questions regarding the collection activity by the school, please contact the school principal."
              >
                <RadioGroup {...register('aboriginalDeclaration')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="status-indian" id="status-indian" />
                    <Label htmlFor="status-indian">Status Indian/First Nations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-status-indian" id="non-status-indian" />
                    <Label htmlFor="non-status-indian">Non-Status Indian/First Nations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metis" id="metis" />
                    <Label htmlFor="metis">Métis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inuit" id="inuit" />
                    <Label htmlFor="inuit">Inuit</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-applicable" id="not-applicable" />
                    <Label htmlFor="not-applicable">Prefer not to declare</Label>
                  </div>
                </RadioGroup>
              </SmartFormField>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Francophone education eligibility</h4>
                
                <SmartFormField 
                  label="Are you eligible for French first language education?"
                  copyOptions={copyOptions.francophoneEligible || []}
                  onCopy={handleCopyValue}
                  fieldName="francophoneEligible"
                  legalText="Section 23 Francophone Education Eligibility Declaration Section 2 (1) of the Student Record Regulation states that: The student record for a student or child must contain all information affecting the decisions made about the education of the student or child that is collected or maintained by a board or an private early childhood services program operator, regardless of the manner in which the student record is contained all information. (s) in the case of a student record maintained by a board, other than a person responsible for the operation of a private school, if the parent/guardian of the student or child has the right to have the student or child receive primary and secondary school instruction in the French language under section 23 of the Canadian Charter of Rights and Freedoms, a notation to indicate that and a notation to indicate whether the parent/guardian wishes to exercise that right. Pursuant to Section 23 of the Canadian Charter of Rights and Freedoms: Citizens of Canada - whose first language learned and still understood is French: or - who have received their primary school instruction in Canada in French have the right to have their children receive primary and secondary instruction in French: or - of whom any child has received or is receiving primary or secondary school instruction in French in Canada, have the right to have all their children receive primary and secondary school instruction in the same language. In Alberta, parents/guardians can only exercise this right by enrolling their child in a French first language (Francophone) program offered by a Francophone Regional authority. A. According to the criteria above as set out in the Canadian Charter of Rights and Freedoms, are you eligible to have your child receive a French first language (Francophone) education? (Please place an X in the appropriate box) Yes No Do not know"
                >
                  <RadioGroup {...register('francophoneEligible')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="franco-yes" />
                      <Label htmlFor="franco-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="franco-no" />
                      <Label htmlFor="franco-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id="franco-unknown" />
                      <Label htmlFor="franco-unknown">Do not know</Label>
                    </div>
                  </RadioGroup>
                </SmartFormField>

                {watch('francophoneEligible') === 'yes' && (
                  <SmartFormField 
                    label="Do you wish to exercise this right?"
                    copyOptions={copyOptions.francophoneExercise || []}
                    onCopy={handleCopyValue}
                    fieldName="francophoneExercise"
                  >
                    <RadioGroup {...register('francophoneExercise')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="exercise-yes" />
                        <Label htmlFor="exercise-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="exercise-no" />
                        <Label htmlFor="exercise-no">No</Label>
                      </div>
                    </RadioGroup>
                  </SmartFormField>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Program outcomes the student will achieve</Label>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="programAlberta" {...register('programAlberta')} />
                    <Label htmlFor="programAlberta">Outcomes in the Alberta Programs of Study</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="programSchedule" {...register('programSchedule')} />
                    <Label htmlFor="programSchedule">Outcomes in the Schedule included in the Home Education Regulation</Label>
                  </div>
                </div>
              </div>

              {watch('programSchedule') && (
                <Alert variant="warning" className="my-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Parents/guardians who provide home education programs acknowledge that there are implications when they choose to use programs different from the Alberta Programs of Study:
                    <ol className="list-decimal pl-4 mt-2">
                      <li>Students may not apply to a high school principal for high school credits.</li>
                      <li>Students may not receive an Alberta High School Diploma.</li>
                    </ol>
                    <p className="mt-2">Any student in a home education program may write a high school diploma examination. However, the diploma examination mark achieved will stand alone and will not result in a final course mark unless accompanied by a recommendation for credit by a high school principal. A final course mark requires both a school awarded mark and a diploma examination mark. Arrangements to write diploma examinations should be made well in advance of the writing date by contacting the associate school board or associate private school for assistance or Exam Administration at 780-427-0010.</p>
                  </AlertDescription>
                </Alert>
              )}

              {watch('programSchedule') && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-900">Part D: Description for components not following Alberta Programs of Study</h4>
                  
                  <FormField 
                    label="Instructional methods and activities"
                  >
                    <Textarea
                      {...register('partDMethod')}
                      placeholder="Describe methods, activities, and how they achieve outcomes..."
                      rows={4}
                    />
                  </FormField>

                  <FormField 
                    label="Resource materials"
                  >
                    <Textarea
                      {...register('partDResources')}
                      placeholder="List any non-standard resource materials..."
                      rows={3}
                    />
                  </FormField>

                  <FormField 
                    label="Evaluation methods"
                  >
                    <Textarea
                      {...register('partDEvaluation')}
                      placeholder="Describe evaluation methods, number, and relation to outcomes..."
                      rows={4}
                    />
                  </FormField>

                  <FormField 
                    label="Facilities and services"
                  >
                    <Textarea
                      {...register('partDFacilities')}
                      placeholder="List desired facilities and services..."
                      rows={3}
                    />
                  </FormField>
                </div>
              )}
              
              {/* Citizenship Documents Section */}
              <div className="border-t pt-6">
                <CitizenshipDocuments
                  ref={null}
                  onUploadComplete={(field, documents) => setCitizenshipDocuments(documents)}
                  initialDocuments={citizenshipDocuments}
                  error={null}
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signatureAgreed"
                    {...register('signatureAgreed', { required: 'You must agree to the declaration' })}
                  />
                  <Label htmlFor="signatureAgreed" className="text-sm">
                    I agree to the parent/guardian declaration and understand my responsibilities.
                  </Label>
                </div>
                {errors.signatureAgreed && (
                  <p className="text-red-600 text-sm mt-1">{errors.signatureAgreed.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Submissions */}
          {existingSubmission && existingSubmission.pdfVersions && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-500" />
                  Previous Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
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
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
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
                  {existingSubmission ? 'Update & Generate New PDF' : 'Submit & Generate PDF'}
                </>
              )}
            </Button>
            
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
    </Sheet>
  );
};

export default HomeEducationNotificationFormV2;