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
  RefreshCw
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

const FormField = ({ label, error, children, required = false, readOnly = false, icon: Icon }) => (
  <div className="space-y-2">
    <label className={`flex items-center text-sm font-medium ${readOnly ? 'text-gray-500' : 'text-gray-900'}`}>
      {Icon && <Icon className="w-4 h-4 mr-2 text-purple-500" />}
      {label}
      {required && !readOnly && <span className="text-red-500 ml-1">*</span>}
      {readOnly && <span className="text-xs text-gray-500 ml-2">(from family profile)</span>}
    </label>
    {children}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const ReadOnlyField = ({ label, value, icon: Icon }) => (
  <FormField label={label} readOnly icon={Icon}>
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
  fieldName
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className={`flex items-center text-sm font-medium text-gray-900`}>
        {Icon && <Icon className="w-4 h-4 mr-2 text-purple-500" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
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
      formType: 'new',
      registrationDate: new Date().toISOString().split('T')[0],
      citizenship: '',
      residentSchoolBoard: '',
      previousSchoolProgram: '',
      assistanceRequired: false,
      additionalInstructor: '',
      aboriginalDeclaration: '',
      francophoneEligible: '',
      francophoneExercise: '',
      programType: 'alberta',
      signatureAgreed: false
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
            }
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
        'registrationDate',
        'residentSchoolBoard', 
        'formType',
        'programType',
        'additionalInstructor',
        'assistanceRequired',
        'aboriginalDeclaration',
        'francophoneEligible',
        'francophoneExercise',
        'citizenship',
        'previousSchoolProgram'
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

  // Get student information with enhanced pre-population
  const getStudentInfo = () => {
    const primaryGuardian = getPrimaryGuardian();
    return {
      ...selectedStudent,
      alsoKnownAs: selectedStudent.preferredName || '',
      estimatedGradeLevel: selectedStudent.grade || '',
      genderDisplay: selectedStudent.gender === 'M' ? 'Male' : selectedStudent.gender === 'F' ? 'Female' : selectedStudent.gender === 'X' ? 'Other' : selectedStudent.gender || '',
      phoneWithFallback: selectedStudent.phone || primaryGuardian.phone || ''
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
      
      doc.autoTable({
        startY: yPosition,
        head: [['Field', 'Information']],
        body: [
          ['Legal Surname', student.lastName || ''],
          ['Legal Given Name(s)', student.firstName || ''],
          ['Birthdate', student.birthday ? new Date(student.birthday).toLocaleDateString() : ''],
          ['Gender', student.genderDisplay],
          ['Registration Date', submissionData.editableFields.registrationDate || ''],
          ['Student Also Known As - Surname', student.alsoKnownAs ? student.lastName : ''],
          ['Student Also Known As - Given Name(s)', student.alsoKnownAs || ''],
          ['Parent/Guardian 1 - Last Name', guardian.lastName || ''],
          ['Parent/Guardian 1 - First Name', guardian.firstName || ''],
          ['Parent/Guardian 1 - Home Phone', guardian.phone || ''],
          ['Parent/Guardian Email Address', guardian.email || ''],
          ['Student Phone Number', student.phoneWithFallback || ''],
          ['Alberta Student Number (ASN)', student.asn || '(To be provided by the school)'],
          ['Student Address', guardian.address?.fullAddress || ''],
          ['Citizenship', submissionData.editableFields.citizenship || ''],
          ['Estimated Grade Level', student.estimatedGradeLevel],
          ['Resident School Board', submissionData.editableFields.residentSchoolBoard || ''],
          ['Previous School Program', submissionData.editableFields.previousSchoolProgram || ''],
          ['Assistance Required', submissionData.editableFields.assistanceRequired ? 'Yes' : 'No'],
          ['Additional Instructor', submissionData.editableFields.additionalInstructor || 'N/A'],
          ['Aboriginal Declaration', submissionData.editableFields.aboriginalDeclaration || 'Not declared'],
          ['Francophone Education Eligible', submissionData.editableFields.francophoneEligible || 'Not specified'],
          ['Exercise Francophone Right', submissionData.editableFields.francophoneExercise || 'Not specified']
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
      const declarationText = `I/We, ${guardian.firstName} ${guardian.lastName}, the parent(s)/guardians(s) of ${student.firstName} ${student.lastName}, the student, declare to the best of my/our knowledge that the home education program and the activities selected for the home education program will enable the student to achieve the outcomes contained in the ${submissionData.editableFields.programType === 'alberta' ? 'Alberta Programs of Study' : 'Schedule included in the Home Education Regulation'}.`;
      
      const splitDeclaration = doc.splitTextToSize(declarationText, pageWidth - 40);
      doc.text(splitDeclaration, 20, yPosition);
      yPosition += splitDeclaration.length * 4 + 10;

      // Signature section
      doc.text('Signature of Supervising Parent(s) or Legal Guardian(s):', 20, yPosition);
      yPosition += 8;
      doc.text(`${guardian.firstName} ${guardian.lastName} (Digital Signature)`, 20, yPosition);
      yPosition += 6;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 15;

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
          registrationDate: data.registrationDate,
          citizenship: data.citizenship,
          residentSchoolBoard: data.residentSchoolBoard,
          previousSchoolProgram: data.previousSchoolProgram,
          assistanceRequired: data.assistanceRequired,
          additionalInstructor: data.additionalInstructor,
          aboriginalDeclaration: data.aboriginalDeclaration,
          francophoneEligible: data.francophoneEligible,
          francophoneExercise: data.francophoneExercise,
          programType: data.programType,
          signatureAgreed: data.signatureAgreed
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
            Complete the official Alberta Home Education Notification Form for {selectedStudent?.firstName} {selectedStudent?.lastName} for the {schoolYear} school year. Use the copy buttons to quickly fill fields from other family members or previous years.
          </SheetDescription>
        </SheetHeader>

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
                <RadioGroup {...register('formType', { required: 'Form type is required' })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new">Notification of Intention to Home Educate with a new associate board or associate private school</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="renewal" id="renewal" />
                    <Label htmlFor="renewal">Notification of Renewal of Intention to Home Educate with the same associate board or associate private school</Label>
                  </div>
                </RadioGroup>
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
                  label="Registration Date" 
                  required 
                  icon={Calendar}
                  copyOptions={copyOptions.registrationDate || []}
                  onCopy={handleCopyValue}
                  fieldName="registrationDate"
                >
                  <Input
                    type="date"
                    {...register('registrationDate', { required: 'Registration date is required' })}
                    error={errors.registrationDate}
                  />
                </SmartFormField>

                <SmartFormField 
                  label="Citizenship/Immigration Status" 
                  required
                  copyOptions={copyOptions.citizenship || []}
                  onCopy={handleCopyValue}
                  fieldName="citizenship"
                >
                  <Textarea
                    {...register('citizenship', { required: 'Citizenship information is required' })}
                    placeholder="e.g., Canadian citizen, Permanent resident, Work permit holder, etc."
                    rows={3}
                  />
                </SmartFormField>

                <SmartFormField 
                  label="Resident School Board" 
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
                  label="Previous School Program"
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

              <SmartFormField 
                label="Additional Instructor Information"
                copyOptions={copyOptions.additionalInstructor || []}
                onCopy={handleCopyValue}
                fieldName="additionalInstructor"
              >
                <Textarea
                  {...register('additionalInstructor')}
                  placeholder="If someone other than the parent/guardian will be providing instruction, provide their information here"
                  rows={3}
                />
              </SmartFormField>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assistanceRequired"
                    {...register('assistanceRequired')}
                  />
                  <Label htmlFor="assistanceRequired">Is assistance required in preparing the home education program plan?</Label>
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
                label="Aboriginal Person Declaration"
                copyOptions={copyOptions.aboriginalDeclaration || []}
                onCopy={handleCopyValue}
                fieldName="aboriginalDeclaration"
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
                    <Label htmlFor="not-applicable">Not applicable</Label>
                  </div>
                </RadioGroup>
              </SmartFormField>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Section 23 Francophone Education Eligibility Declaration</h4>
                
                <SmartFormField 
                  label="Are you eligible to have your child receive a French first language (Francophone) education?"
                  copyOptions={copyOptions.francophoneEligible || []}
                  onCopy={handleCopyValue}
                  fieldName="francophoneEligible"
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
                    label="Do you wish to exercise your right to have your child receive a French first language (Francophone) education?"
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

              <SmartFormField 
                label="Program Type" 
                required
                copyOptions={copyOptions.programType || []}
                onCopy={handleCopyValue}
                fieldName="programType"
              >
                <RadioGroup {...register('programType', { required: 'Program type is required' })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alberta" id="alberta" />
                    <Label htmlFor="alberta">Achieve the outcomes contained in the Alberta Programs of Study</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="schedule" id="schedule" />
                    <Label htmlFor="schedule">Achieve the outcomes contained in the Schedule included in the Home Education Regulation</Label>
                  </div>
                </RadioGroup>
              </SmartFormField>
              
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
                    I understand and agree that the instruction and evaluation of my child's progress is my responsibility and that the associate board or private school will supervise and evaluate my child's progress in accordance with the Home Education Regulation.
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