import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, get, set, onValue, off } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getCurrentSchoolYear, formatImportantDate } from '../config/importantDates';
import CitizenshipDocuments from '../Registration/CitizenshipDocuments';

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
  ChevronDown,
  ChevronRight,
  Settings,
  Copy,
  ArrowRight,
  ArrowLeft
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

const HomeEducationNotificationForm = ({ 
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
  const [formData, setFormData] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  
  // Multi-student form state
  const [formMode, setFormMode] = useState('single'); // 'single' or 'multiple'
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [bulkSettings, setBulkSettings] = useState({});
  const [studentFormData, setStudentFormData] = useState({});
  const [studentCitizenshipDocs, setStudentCitizenshipDocs] = useState({});
  const [expandedStudents, setExpandedStudents] = useState({});
  
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

  // Initialize form mode based on props
  useEffect(() => {
    if (selectedStudent) {
      setFormMode('single');
      setSelectedStudents([selectedStudent]);
    } else if (familyData?.students) {
      setFormMode('multiple');
      setSelectedStudents([]);
    }
  }, [selectedStudent, familyData?.students]);

  // Load existing form data
  useEffect(() => {
    if (!familyId || !isOpen || !schoolYear) return;
    if (formMode === 'single' && !selectedStudent) return;
    // For multiple mode, we can load even with no students selected initially

    const loadFormData = async () => {
      setLoading(true);
      try {
        const db = getDatabase();
        const studentsToLoad = formMode === 'single' ? [selectedStudent] : selectedStudents;
        const newStudentFormData = {};
        const newStudentCitizenshipDocs = {};
        
        // Only load data if we have students to load
        if (studentsToLoad.length > 0) {
          for (const student of studentsToLoad) {
            if (!student?.id) continue;
            
            const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${schoolYear}/${student.id}`);
            const snapshot = await get(formRef);
            
            if (snapshot.exists()) {
              const data = snapshot.val();
              newStudentFormData[student.id] = data;
              newStudentCitizenshipDocs[student.id] = data.citizenshipDocuments || [];
              
              // For single mode, populate main form
              if (formMode === 'single') {
                setExistingSubmission(data);
                Object.keys(data.editableFields || {}).forEach(key => {
                  setValue(key, data.editableFields[key]);
                });
              }
            } else {
              // Check previous year for renewal determination
              const prevYear = getPreviousSchoolYear(schoolYear);
              if (prevYear) {
                const prevFormRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${prevYear}/${student.id}`);
                const prevSnapshot = await get(prevFormRef);
                if (prevSnapshot.exists()) {
                  newStudentFormData[student.id] = { 
                    editableFields: { formType: 'renewal' },
                    citizenshipDocuments: []
                  };
                  if (formMode === 'single') {
                    setValue('formType', 'renewal');
                  }
                }
              }
              newStudentCitizenshipDocs[student.id] = [];
            }
          }
        }
        
        setStudentFormData(newStudentFormData);
        setStudentCitizenshipDocs(newStudentCitizenshipDocs);
        
      } catch (error) {
        console.error('Error loading form data:', error);
        toast.error('Failed to load existing form data');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [familyId, isOpen, schoolYear, selectedStudent, selectedStudents, formMode, setValue]);

  // Generate timestamp for file naming
  const generateTimestamp = () => {
    return Date.now();
  };

  // Helper functions for multi-student form
  const handleStudentSelection = (student, isSelected) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, student]);
      setExpandedStudents(prev => ({ ...prev, [student.id]: false }));
    } else {
      setSelectedStudents(prev => prev.filter(s => s.id !== student.id));
      setExpandedStudents(prev => {
        const updated = { ...prev };
        delete updated[student.id];
        return updated;
      });
    }
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === familyData.students.length) {
      setSelectedStudents([]);
      setExpandedStudents({});
    } else {
      setSelectedStudents(familyData.students);
      const expanded = {};
      familyData.students.forEach(student => {
        expanded[student.id] = false;
      });
      setExpandedStudents(expanded);
    }
  };

  const handleBulkSettingChange = (field, value) => {
    setBulkSettings(prev => ({ ...prev, [field]: value }));
    
    // Apply to all selected students
    selectedStudents.forEach(student => {
      setStudentFormData(prev => ({
        ...prev,
        [student.id]: {
          ...prev[student.id],
          editableFields: {
            ...prev[student.id]?.editableFields,
            [field]: value
          }
        }
      }));
    });
  };

  const handleStudentFieldChange = (studentId, field, value) => {
    setStudentFormData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        editableFields: {
          ...prev[studentId]?.editableFields,
          [field]: value
        }
      }
    }));
  };

  const handleStudentCitizenshipUpdate = (studentId, documents) => {
    setStudentCitizenshipDocs(prev => ({
      ...prev,
      [studentId]: documents
    }));
  };

  const toggleStudentExpanded = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const getStudentFormProgress = (studentId) => {
    const formData = studentFormData[studentId];
    const citizenshipDocs = studentCitizenshipDocs[studentId] || [];
    const requiredFields = ['formType', 'registrationDate', 'citizenship', 'residentSchoolBoard', 'programType', 'signatureAgreed'];
    
    const completedFields = requiredFields.filter(field => {
      const value = formData?.editableFields?.[field];
      return value !== undefined && value !== '' && value !== false;
    });
    
    const hasRequiredDocs = citizenshipDocs.length > 0;
    const fieldProgress = completedFields.length / requiredFields.length;
    const docProgress = hasRequiredDocs ? 1 : 0;
    
    return {
      overall: (fieldProgress + docProgress) / 2,
      fields: fieldProgress,
      documents: docProgress,
      isComplete: fieldProgress === 1 && docProgress === 1
    };
  };

  // Get primary guardian information
  const getPrimaryGuardian = () => {
    return familyData?.guardians?.find(g => g.guardianType === 'primary_guardian') || 
           familyData?.guardians?.[0] || {};
  };

  // Get available students (those not yet completed for this school year)
  const getAvailableStudents = () => {
    return familyData?.students?.filter(student => {
      const progress = getStudentFormProgress(student.id);
      return !progress.isComplete;
    }) || [];
  };

  // Get completed students
  const getCompletedStudents = () => {
    return familyData?.students?.filter(student => {
      const progress = getStudentFormProgress(student.id);
      return progress.isComplete;
    }) || [];
  };

  // Get student information with enhanced pre-population
  const getStudentInfo = (student = null) => {
    const targetStudent = student || selectedStudent || {};
    return {
      ...targetStudent,
      alsoKnownAs: targetStudent.preferredName || '',
      estimatedGradeLevel: targetStudent.grade || '',
      genderDisplay: targetStudent.gender === 'M' ? 'Male' : targetStudent.gender === 'F' ? 'Female' : targetStudent.gender === 'X' ? 'Other' : targetStudent.gender || ''
    };
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

  // Handle single form submission
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
        citizenshipDocuments: studentCitizenshipDocs[selectedStudent.id] || [],
        submittedAt: existingSubmission?.submittedAt || timestamp,
        lastUpdated: timestamp,
        submittedBy: user.uid
      };

      // Generate PDF
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
    }
  };

  // Handle multiple forms submission
  const handleMultipleSubmit = async () => {
    setSaving(true);
    setGeneratingPDF(true);
    
    try {
      const db = getDatabase();
      const timestamp = Date.now();
      const successfulSubmissions = [];
      const failedSubmissions = [];
      
      for (const student of selectedStudents) {
        try {
          const studentData = studentFormData[student.id];
          const citizenshipDocs = studentCitizenshipDocs[student.id] || [];
          
          // Validate required fields
          const requiredFields = ['formType', 'registrationDate', 'citizenship', 'residentSchoolBoard', 'programType', 'signatureAgreed'];
          const missingFields = requiredFields.filter(field => {
            const value = studentData?.editableFields?.[field];
            return !value || (field === 'signatureAgreed' && value !== true);
          });
          
          if (missingFields.length > 0 || citizenshipDocs.length === 0) {
            failedSubmissions.push({
              student,
              reason: missingFields.length > 0 
                ? `Missing required fields: ${missingFields.join(', ')}`
                : 'Missing citizenship documents'
            });
            continue;
          }
          
          const submissionId = studentData?.submissionId || `sub_${timestamp}_${student.id}`;
          
          const submissionData = {
            submissionId,
            schoolYear,
            formType: studentData.editableFields.formType,
            studentInfo: getStudentInfo(student),
            guardianInfo: getPrimaryGuardian(),
            editableFields: studentData.editableFields,
            citizenshipDocuments: citizenshipDocs,
            submittedAt: studentData?.submittedAt || timestamp,
            lastUpdated: timestamp,
            submittedBy: user.uid
          };

          // Generate PDF
          const pdfDoc = await generatePDF(submissionData);
          
          // Save PDF to cloud storage
          const pdfInfo = await savePDFToStorage(pdfDoc, submissionData);
          
          // Add PDF info to submission data
          submissionData.pdfVersions = [
            ...(studentData?.pdfVersions || []),
            {
              ...pdfInfo,
              version: (studentData?.pdfVersions?.length || 0) + 1
            }
          ];

          // Save to database
          const formRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/NOTIFICATION_FORMS/${schoolYear}/${student.id}`);
          await set(formRef, submissionData);
          
          // Download PDF
          pdfDoc.save(`HomeEducation_NotificationForm_${schoolYear}_${student.firstName}_${student.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);
          
          successfulSubmissions.push(student);
          
        } catch (error) {
          console.error(`Error submitting form for ${student.firstName} ${student.lastName}:`, error);
          failedSubmissions.push({
            student,
            reason: error.message
          });
        }
      }
      
      // Show results
      if (successfulSubmissions.length > 0) {
        toast.success(`Successfully submitted ${successfulSubmissions.length} form${successfulSubmissions.length !== 1 ? 's' : ''}!`, {
          description: 'PDFs generated and saved to cloud storage'
        });
      }
      
      if (failedSubmissions.length > 0) {
        toast.error(`Failed to submit ${failedSubmissions.length} form${failedSubmissions.length !== 1 ? 's' : ''}`, {
          description: 'Please check the individual student forms for missing information'
        });
      }
      
      // Close form if all successful
      if (failedSubmissions.length === 0) {
        onOpenChange(false);
      }
      
    } catch (error) {
      console.error('Error in bulk submission:', error);
      toast.error('Failed to submit forms. Please try again.');
    } finally {
      setSaving(false);
      setGeneratingPDF(false);
    }
  };

  // Render student selection step for multiple mode
  const renderStudentSelection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Select Students for {schoolYear} Registration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              Select which students you want to register for the {schoolYear} school year.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllStudents}
            >
              {selectedStudents.length === familyData.students.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          <div className="space-y-3">
            {familyData.students.map((student) => {
              const isSelected = selectedStudents.some(s => s.id === student.id);
              const progress = getStudentFormProgress(student.id);
              
              return (
                <div
                  key={student.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleStudentSelection(student, checked)}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {student.preferredName || student.firstName} {student.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Grade {student.grade} • ASN: {student.asn}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {progress.isComplete ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Complete</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${progress.overall * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(progress.overall * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {selectedStudents.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={() => setCurrentStep(2)}
                className="w-full"
              >
                Continue with {selectedStudents.length} Student{selectedStudents.length !== 1 ? 's' : ''}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Render bulk settings step
  const renderBulkSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Settings className="w-5 h-5 mr-2 text-purple-500" />
          Bulk Settings - Apply to All Selected Students
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-purple-50 border-purple-200">
          <AlertDescription className="text-purple-800">
            Configure settings that will apply to all {selectedStudents.length} selected students. 
            You can customize individual student settings in the next step if needed.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Form Type" required>
            <RadioGroup 
              value={bulkSettings.formType || ''}
              onValueChange={(value) => handleBulkSettingChange('formType', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="bulk-new" />
                <Label htmlFor="bulk-new">New Registration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="renewal" id="bulk-renewal" />
                <Label htmlFor="bulk-renewal">Renewal</Label>
              </div>
            </RadioGroup>
          </FormField>

          <FormField label="Registration Date" required>
            <Input
              type="date"
              value={bulkSettings.registrationDate || ''}
              onChange={(e) => handleBulkSettingChange('registrationDate', e.target.value)}
            />
          </FormField>

          <FormField label="Resident School Board" required>
            <Input
              value={bulkSettings.residentSchoolBoard || ''}
              onChange={(e) => handleBulkSettingChange('residentSchoolBoard', e.target.value)}
              placeholder="Enter the name of your resident school board"
            />
          </FormField>

          <FormField label="Program Type" required>
            <RadioGroup 
              value={bulkSettings.programType || ''}
              onValueChange={(value) => handleBulkSettingChange('programType', value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="alberta" id="bulk-alberta" />
                <Label htmlFor="bulk-alberta">Alberta Programs of Study</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="schedule" id="bulk-schedule" />
                <Label htmlFor="bulk-schedule">Home Education Regulation Schedule</Label>
              </div>
            </RadioGroup>
          </FormField>
        </div>

        <FormField label="Additional Instructor Information">
          <Textarea
            value={bulkSettings.additionalInstructor || ''}
            onChange={(e) => handleBulkSettingChange('additionalInstructor', e.target.value)}
            placeholder="If someone other than the parent/guardian will be providing instruction"
            rows={3}
          />
        </FormField>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="bulk-assistance"
            checked={bulkSettings.assistanceRequired || false}
            onCheckedChange={(checked) => handleBulkSettingChange('assistanceRequired', checked)}
          />
          <Label htmlFor="bulk-assistance">Assistance required in preparing home education program plan?</Label>
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Student Selection
          </Button>
          <Button
            onClick={() => setCurrentStep(3)}
            className="flex-1"
          >
            Continue to Individual Forms
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Render individual student forms step
  const renderIndividualForms = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
            Individual Student Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200 mb-4">
            <AlertDescription className="text-green-800">
              Review and complete individual information for each student. 
              Bulk settings have been applied, but you can customize them below.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {selectedStudents.map((student) => {
              const isExpanded = expandedStudents[student.id];
              const progress = getStudentFormProgress(student.id);
              const studentData = studentFormData[student.id] || {};
              
              return (
                <div key={student.id} className="border rounded-lg">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleStudentExpanded(student.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          progress.isComplete ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {student.preferredName || student.firstName} {student.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Grade {student.grade} • ASN: {student.asn}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                progress.isComplete ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress.overall * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(progress.overall * 100)}%
                          </span>
                        </div>
                        
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t p-4 bg-gray-50">
                      <div className="space-y-6">
                        {/* Student specific form fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ReadOnlyField 
                            label="Legal Name" 
                            value={`${student.firstName} ${student.lastName}`}
                          />
                          <ReadOnlyField 
                            label="ASN" 
                            value={student.asn}
                          />
                          
                          <FormField label="Citizenship/Immigration Status" required>
                            <Textarea
                              value={studentData.editableFields?.citizenship || ''}
                              onChange={(e) => handleStudentFieldChange(student.id, 'citizenship', e.target.value)}
                              placeholder="e.g., Canadian citizen, Permanent resident, etc."
                              rows={2}
                            />
                          </FormField>
                          
                          <FormField label="Previous School Program">
                            <Input
                              value={studentData.editableFields?.previousSchoolProgram || ''}
                              onChange={(e) => handleStudentFieldChange(student.id, 'previousSchoolProgram', e.target.value)}
                              placeholder="Enter previous school or program name"
                            />
                          </FormField>
                        </div>
                        
                        {/* Citizenship Documents */}
                        <div className="mt-6">
                          <CitizenshipDocuments
                            ref={null}
                            onUploadComplete={(field, documents) => handleStudentCitizenshipUpdate(student.id, documents)}
                            initialDocuments={studentCitizenshipDocs[student.id] || []}
                            error={null}
                          />
                        </div>
                        
                        {/* Signature Agreement */}
                        <div className="border-t pt-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`signature-${student.id}`}
                              checked={studentData.editableFields?.signatureAgreed || false}
                              onCheckedChange={(checked) => handleStudentFieldChange(student.id, 'signatureAgreed', checked)}
                            />
                            <Label htmlFor={`signature-${student.id}`} className="text-sm">
                              I understand and agree that the instruction and evaluation of {student.firstName}'s progress is my responsibility.
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-4 pt-6 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bulk Settings
            </Button>
            <Button
              onClick={handleMultipleSubmit}
              disabled={saving || generatingPDF}
              className="flex-1"
            >
              {saving || generatingPDF ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {generatingPDF ? 'Generating PDFs...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Submit All Forms & Generate PDFs
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
              {formMode === 'single' && selectedStudent && (
                <span className="text-sm text-gray-600">- {selectedStudent.firstName} {selectedStudent.lastName} ({schoolYear})</span>
              )}
              {formMode === 'multiple' && (
                <span className="text-sm text-gray-600">- Multiple Students ({schoolYear})</span>
              )}
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            {formMode === 'single' ? (
              `Complete the official Alberta Home Education Notification Form for ${selectedStudent?.firstName} ${selectedStudent?.lastName} for the ${schoolYear} school year.`
            ) : (
              `Complete Home Education Notification Forms for multiple students for the ${schoolYear} school year. Select students and configure bulk settings to streamline the process.`
            )}
          </SheetDescription>
        </SheetHeader>

        {formMode === 'multiple' ? (
          <div className="mt-6 space-y-6">
            {/* Step Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step ? 'bg-blue-600 text-white' :
                    currentStep > step ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle2 className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentStep === 1 && 'Step 1: Select Students'}
                {currentStep === 2 && 'Step 2: Configure Bulk Settings'}
                {currentStep === 3 && 'Step 3: Complete Individual Forms'}
              </h3>
            </div>
            
            {currentStep === 1 && renderStudentSelection()}
            {currentStep === 2 && renderBulkSettings()}
            {currentStep === 3 && renderIndividualForms()}
          </div>
        ) : (
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
                <FormField label="Notification Type" required>
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
                </FormField>
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
                  <FormField label="Registration Date" required icon={Calendar}>
                    <Input
                      type="date"
                      {...register('registrationDate', { required: 'Registration date is required' })}
                      error={errors.registrationDate}
                    />
                  </FormField>

                  <FormField label="Citizenship/Immigration Status" required>
                    <Textarea
                      {...register('citizenship', { required: 'Citizenship information is required' })}
                      placeholder="e.g., Canadian citizen, Permanent resident, Work permit holder, etc."
                      rows={3}
                    />
                  </FormField>

                  <FormField label="Resident School Board" required icon={Building2}>
                    <Input
                      {...register('residentSchoolBoard', { required: 'Resident school board is required' })}
                      placeholder="Enter the name of your resident school board"
                    />
                  </FormField>

                  <FormField label="Previous School Program">
                    <Input
                      {...register('previousSchoolProgram')}
                      placeholder="Enter previous school or program name (if applicable)"
                    />
                  </FormField>
                </div>

                <FormField label="Additional Instructor Information">
                  <Textarea
                    {...register('additionalInstructor')}
                    placeholder="If someone other than the parent/guardian will be providing instruction, provide their information here"
                    rows={3}
                  />
                </FormField>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="assistanceRequired"
                    {...register('assistanceRequired')}
                  />
                  <Label htmlFor="assistanceRequired">Is assistance required in preparing the home education program plan?</Label>
                </div>

                <FormField label="Aboriginal Person Declaration">
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
                </FormField>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Section 23 Francophone Education Eligibility Declaration</h4>
                  
                  <FormField label="Are you eligible to have your child receive a French first language (Francophone) education?">
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
                  </FormField>

                  {watch('francophoneEligible') === 'yes' && (
                    <FormField label="Do you wish to exercise your right to have your child receive a French first language (Francophone) education?">
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
                    </FormField>
                  )}
                </div>

                <FormField label="Program Type" required>
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
                </FormField>
                
                {/* Citizenship Documents Section */}
                <div className="border-t pt-6">
                  <CitizenshipDocuments
                    ref={null}
                    onUploadComplete={(field, documents) => handleStudentCitizenshipUpdate(selectedStudent?.id, documents)}
                    initialDocuments={studentCitizenshipDocs[selectedStudent?.id] || []}
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
        )}
      </SheetContent>
    </Sheet>
  );
};

export default HomeEducationNotificationForm;