import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, set, get, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { toast } from 'sonner';
import { 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Calendar, 
  Building2,
  Loader2,
  Plus,
  Trash2,
  Calculator,
  Sparkles,
  Info,
  Eye,
  Maximize2
} from 'lucide-react';
import { getEdmontonTimestamp, formatEdmontonTimestamp, toDateString } from '../utils/timeZoneUtils';
import { FUNDING_RATES, REIMBURSEMENT_SETTINGS } from '../config/HomeEducation';
import { 
  getCurrentSchoolYear, 
  getAllOpenRegistrationSchoolYears,
  getOpenRegistrationSchoolYear
} from '../config/importantDates';

// Helper function to convert school year to database path format (underscore)
const formatSchoolYearForDatabase = (schoolYear) => {
  if (!schoolYear) return '';
  // Convert both "25/26" and "25_26" formats to "25_26"
  return schoolYear.replace('/', '_');
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Helper function to determine which school year to use for receipts
const determineReceiptSchoolYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const deadline = new Date(currentYear, REIMBURSEMENT_SETTINGS.RECEIPT_UPLOAD_DEADLINE.month, REIMBURSEMENT_SETTINGS.RECEIPT_UPLOAD_DEADLINE.day);
  
  // If we're past the deadline, allow submitting for next school year
  // Otherwise, submit for current school year
  if (now > deadline) {
    // Past deadline - get next school year
    const nextYear = `${String(currentYear).slice(2)}/${String(currentYear + 1).slice(2)}`;
    return {
      schoolYear: nextYear,
      isNextYear: true,
      deadline: REIMBURSEMENT_SETTINGS.RECEIPT_UPLOAD_DEADLINE.formatted
    };
  } else {
    // Before deadline - use current school year
    const currentSchoolYear = getCurrentSchoolYear();
    return {
      schoolYear: currentSchoolYear,
      isNextYear: false,
      deadline: REIMBURSEMENT_SETTINGS.RECEIPT_UPLOAD_DEADLINE.formatted
    };
  }
};

// Helper function to calculate student budget based on grade
const calculateStudentBudget = (grade) => {
  // Convert grade to normalized format for comparison
  const gradeStr = grade?.toString().toLowerCase().trim();
  
  // Check for kindergarten variations
  if (gradeStr === 'k' || 
      gradeStr === 'kindergarten' || 
      gradeStr === '0' ||
      gradeStr === 'kg') {
    return FUNDING_RATES.KINDERGARTEN.amount; // $450.50
  } else {
    return FUNDING_RATES.GRADES_1_TO_12.amount; // $901.00
  }
};

// Helper function to get funding type for display
const getFundingType = (grade) => {
  const gradeStr = grade?.toString().toLowerCase().trim();
  
  if (gradeStr === 'k' || 
      gradeStr === 'kindergarten' || 
      gradeStr === '0' ||
      gradeStr === 'kg') {
    return {
      type: 'kindergarten',
      label: 'Kindergarten',
      formatted: FUNDING_RATES.KINDERGARTEN.formatted
    };
  } else {
    return {
      type: 'grades_1_12',
      label: 'Grades 1-12',
      formatted: FUNDING_RATES.GRADES_1_TO_12.formatted
    };
  }
};

// Resource options mapping for category name display
const resourceOptions = [
  { value: 'internet', label: 'Internet (50% of monthly fee from Sept. to end of Aug.)' },
  { value: 'books', label: 'Books / Novels' },
  { value: 'field_trips', label: 'Field trips / Admissions (max. 50% of funding)' },
  { value: 'art_supplies', label: 'Art / Craft supplies and equipment (e.g. sewing machine, camera)' },
  { value: 'science_supplies', label: 'Science supplies and equipment (e.g., microscopes, telescopes, kits)' },
  { value: 'workbooks', label: 'Workbooks / Textbooks / Curriculum' },
  { value: 'tutoring', label: 'Tutoring (group of individual lessons necessary for the student\'s program delivered by a subject matter expert who is not an immediate family member)' },
  { value: 'lessons', label: 'Lessons (including but not limited to, music, swimming, and language lessons taught by a certified instructor)' },
  { value: 'games_puzzles', label: 'Games / Puzzles / Manipulatives / Learning Aids' },
  { value: 'online_courses_resource', label: 'Online Courses' },
  { value: 'technology', label: 'Computers / Technology ie. printers, computers, tablets' },
  { value: 'pe_equipment', label: 'Phys Ed Equipment' },
  { value: 'instruments', label: 'Musical Instruments' },
  { value: 'home_ec', label: 'Home Economic Edibles (groceries used for children\'s cooking and baking projects)' }
];

const FormField = ({ label, error, children, required = false, description = null }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-900">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {description && (
      <p className="text-sm text-gray-600">{description}</p>
    )}
    {children}
    {error && (
      <div className="flex items-center space-x-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const StudentAllocationCard = ({ 
  student, 
  allocation, 
  onAllocationChange, 
  onToggleStudent,
  isSelected,
  studentSOLOCategories = [],
  errors = {},
  remainingBudget = 901.00,
  budgetInfo = null
}) => {
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const handlePercentageChange = (percentage) => {
    const numPercentage = Math.max(0, Math.min(100, parseFloat(percentage) || 0));
    const calculatedAmount = (numPercentage / 100) * (allocation.totalAmount || 0);
    
    // Check if selected category has funding limits
    const selectedCategory = studentSOLOCategories.find(cat => cat.key === allocation.soloCategories?.[0]);
    let finalAmount = calculatedAmount;
    
    if (selectedCategory?.hasFundingLimit) {
      const maxAllowedAmount = remainingBudget * (selectedCategory.fundingLimitPercentage / 100);
      finalAmount = Math.min(calculatedAmount, maxAllowedAmount);
    }
    
    onAllocationChange(student.id, { 
      ...allocation, 
      percentage: numPercentage,
      amount: finalAmount,
      calculatedAmount: calculatedAmount,
      isLimited: selectedCategory?.hasFundingLimit && calculatedAmount > finalAmount
    });
  };

  const handleCategoryChange = (categories) => {
    const newAllocation = { ...allocation, soloCategories: categories };
    
    // Recalculate amount based on new category limits
    if (allocation.percentage) {
      const calculatedAmount = (allocation.percentage / 100) * (allocation.totalAmount || 0);
      const selectedCategory = studentSOLOCategories.find(cat => cat.key === categories[0]);
      let finalAmount = calculatedAmount;
      
      if (selectedCategory?.hasFundingLimit) {
        const maxAllowedAmount = remainingBudget * (selectedCategory.fundingLimitPercentage / 100);
        finalAmount = Math.min(calculatedAmount, maxAllowedAmount);
      }
      
      newAllocation.amount = finalAmount;
      newAllocation.calculatedAmount = calculatedAmount;
      newAllocation.isLimited = selectedCategory?.hasFundingLimit && calculatedAmount > finalAmount;
    }
    
    onAllocationChange(student.id, newAllocation);
  };

  const handleJustificationChange = (justification) => {
    onAllocationChange(student.id, { 
      ...allocation, 
      categoryJustification: justification 
    });
  };

  const budgetAfterThisAllocation = remainingBudget - (allocation.amount || 0);
  const budgetWarning = budgetAfterThisAllocation < 50; // Warning when under $50 remaining
  const budgetCritical = budgetAfterThisAllocation < 0; // Critical when over budget

  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isSelected 
        ? 'border-purple-300 bg-purple-50' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      {/* Student Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleStudent(student.id, e.target.checked)}
            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <div>
            <span className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </span>
            <p className="text-sm text-gray-600">Grade {student.grade}</p>
          </div>
        </label>
        
        {/* Budget Display */}
        <div className={`text-right text-sm ${
          budgetCritical ? 'text-red-600' : budgetWarning ? 'text-yellow-600' : 'text-green-600'
        }`}>
          <p className="font-medium">${remainingBudget.toFixed(2)} available</p>
          {budgetInfo && (
            <p className="text-xs text-gray-500">
              {budgetInfo.fundingFormatted} ({budgetInfo.fundingLabel})
            </p>
          )}
          {isSelected && (
            <p className="text-xs">
              After: ${budgetAfterThisAllocation.toFixed(2)}
              {budgetCritical && ' ⚠️ Over budget!'}
            </p>
          )}
        </div>
      </div>

      {/* Allocation Details (only show if selected) */}
      {isSelected && (
        <div className="space-y-4 border-t border-purple-200 pt-4">
          {/* Percentage Input */}
          <div className="grid grid-cols-2 gap-4">
            <FormField 
              label="Percentage" 
              error={errors.percentage}
              required
            >
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={allocation.percentage || ''}
                  onChange={(e) => handlePercentageChange(e.target.value)}
                  className={`w-full px-3 py-2 pr-8 border ${
                    errors.percentage ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
            </FormField>

            <FormField label="Amount" required>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={(allocation.amount || 0).toFixed(2)}
                  readOnly
                  className={`w-full pl-8 pr-3 py-2 border rounded-md bg-gray-50 ${
                    allocation.isLimited ? 'border-orange-300 text-orange-700' : 'border-gray-300 text-gray-700'
                  }`}
                />
              </div>
              {allocation.isLimited && (
                <p className="text-xs text-orange-600 mt-1">
                  Amount limited to 50% of funding (${allocation.calculatedAmount?.toFixed(2)} reduced to ${allocation.amount?.toFixed(2)})
                </p>
              )}
            </FormField>
          </div>

          {/* Program Plan Categories */}
          <FormField 
            label="Program Plan Category" 
            error={errors.soloCategories}
            required
            description="Select which approved category this purchase falls under for this student"
          >
            <div className="space-y-2">
              {studentSOLOCategories.length > 0 ? (
                <select
                  value={allocation.soloCategories?.[0] || ''}
                  onChange={(e) => handleCategoryChange(e.target.value ? [e.target.value] : [])}
                  className={`w-full px-3 py-2 border ${
                    errors.soloCategories ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">Select a category...</option>
                  {studentSOLOCategories.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    No program plan found for this student for the selected school year. They need to complete their Program Plan first.
                  </p>
                </div>
              )}
            </div>
          </FormField>

          {/* Selected Category Description */}
          {allocation.soloCategories?.[0] && (() => {
            const selectedCategory = studentSOLOCategories.find(cat => cat.key === allocation.soloCategories[0]);
            return selectedCategory ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Category:</strong> {selectedCategory.name}
                  {selectedCategory.hasFundingLimit && (
                    <span className="ml-2 text-orange-600 font-medium">(Max 50% of ${budgetInfo?.fundingFormatted || '$901'} = ${((budgetInfo?.limit || 901) * 0.5).toFixed(2)})</span>
                  )}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Description:</strong> {selectedCategory.description}
                </p>
              </div>
            ) : null;
          })()}

          {/* Justification */}
          <FormField 
            label="Justification for this student" 
            error={errors.categoryJustification}
            required
            description="Explain how this purchase specifically benefits this student's education"
          >
            <textarea
              value={allocation.categoryJustification || ''}
              onChange={(e) => handleJustificationChange(e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.categoryJustification ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
              rows={3}
              placeholder="Describe how this purchase will be used for this student's education..."
            />
          </FormField>
        </div>
      )}
    </div>
  );
};

const ReceiptUploadForm = ({ isOpen, onOpenChange, familyData, schoolYear, customClaims, onClaimSubmitted }) => {
  const { user } = useAuth();
  
  // Auto-determine school year based on deadline
  const schoolYearInfo = determineReceiptSchoolYear();
  const selectedSchoolYear = schoolYearInfo.schoolYear;
  
  const [formData, setFormData] = useState({
    purchaseDate: toDateString(new Date()),
    vendor: '',
    totalAmount: '',
    taxAmount: '',
    description: '',
    receipts: [],
    manualValidationNotes: ''
  });

  const [studentAllocations, setStudentAllocations] = useState({});
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [studentSOLOPlans, setStudentSOLOPlans] = useState({});
  const [studentBudgets, setStudentBudgets] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  // AI Analysis state
  const [analyzingReceipt, setAnalyzingReceipt] = useState(false);
  const [receiptAnalysis, setReceiptAnalysis] = useState(null);
  const [showAnalysisResults, setShowAnalysisResults] = useState(false);
  
  // Preview state
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load student data when form opens
  useEffect(() => {
    if (isOpen && familyData?.students && customClaims?.familyId) {
      loadStudentData();
    }
  }, [isOpen, familyData?.students, customClaims?.familyId]);

  const loadStudentData = async () => {
    if (!familyData?.students || !customClaims?.familyId) return;

    try {
      const db = getDatabase();
      const soloPlans = {};
      const budgets = {};

      for (const student of familyData.students) {
        // Load SOLO plan categories
        try {
          const dbSchoolYear = formatSchoolYearForDatabase(selectedSchoolYear);
          console.log(`Loading SOLO plan for student ${student.id}, school year: ${selectedSchoolYear} -> ${dbSchoolYear}`);
          const soloRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/SOLO_EDUCATION_PLANS/${dbSchoolYear}/${student.id}`);
          const soloSnapshot = await get(soloRef);
          
          if (soloSnapshot.exists()) {
            const soloData = soloSnapshot.val();
            console.log(`✅ Found SOLO plan for student ${student.id}:`, soloData);
            const categories = [];
            
            // Extract resource categories from SOLO plan
            if (soloData.resourcesAndMaterials && soloData.resourceDescriptions) {
              soloData.resourcesAndMaterials.forEach(resourceKey => {
                const description = soloData.resourceDescriptions[resourceKey];
                if (description) {
                  // Find the display name from resourceOptions or custom resources
                  let categoryName = resourceKey;
                  
                  // Try to find in custom resources first
                  const customResource = soloData.customResources?.find(cr => cr.key === resourceKey);
                  if (customResource) {
                    categoryName = customResource.name;
                  } else {
                    // Try to find in standard resource options
                    const standardResource = resourceOptions.find(ro => ro.value === resourceKey);
                    if (standardResource) {
                      categoryName = standardResource.label;
                    } else {
                      // Convert key to readable name if no mapping found
                      categoryName = resourceKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    }
                  }
                  
                  // Check if this category has funding limitations
                  const hasFundingLimit = (resourceKey === 'internet' || resourceKey === 'field_trips');
                  
                  categories.push({
                    key: resourceKey,
                    name: categoryName,
                    description: description,
                    section: 'Resources and Materials',
                    hasFundingLimit: hasFundingLimit,
                    fundingLimitPercentage: hasFundingLimit ? 50 : 100
                  });
                }
              });
            }
            
            soloPlans[student.id] = categories;
            console.log(`✅ Processed ${categories.length} categories for student ${student.id}:`, categories);
          } else {
            console.log(`❌ No SOLO plan found for student ${student.id} at path: homeEducationFamilies/familyInformation/${customClaims.familyId}/SOLO_EDUCATION_PLANS/${dbSchoolYear}/${student.id}`);
            soloPlans[student.id] = [];
          }
        } catch (error) {
          console.error(`Error loading SOLO plan for student ${student.id}:`, error);
          soloPlans[student.id] = [];
        }

        // Load budget information
        try {
          const dbSchoolYear = formatSchoolYearForDatabase(selectedSchoolYear);
          console.log(`Loading budget for student ${student.id}, school year: ${selectedSchoolYear} -> ${dbSchoolYear}`);
          const reimbursementRef = ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/REIMBURSEMENT_CLAIMS/${dbSchoolYear}`);
          const reimbursementSnapshot = await get(reimbursementRef);
          
          let spentAmount = 0;
          if (reimbursementSnapshot.exists()) {
            const allClaims = reimbursementSnapshot.val();
            Object.values(allClaims).forEach(claim => {
              if (claim.studentAllocations) {
                claim.studentAllocations.forEach(allocation => {
                  if (allocation.studentId === student.id && 
                      (claim.status === 'approved' || claim.status === 'paid')) {
                    spentAmount += allocation.amount || 0;
                  }
                });
              }
            });
          }

          const studentBudgetLimit = calculateStudentBudget(student.grade);
          const fundingInfo = getFundingType(student.grade);
          const remaining = studentBudgetLimit - spentAmount;
          
          budgets[student.id] = {
            limit: studentBudgetLimit,
            spent: spentAmount,
            remaining: Math.max(0, remaining),
            percentageUsed: (spentAmount / studentBudgetLimit) * 100,
            gradeLevel: student.grade,
            fundingType: fundingInfo.type,
            fundingLabel: fundingInfo.label,
            fundingFormatted: fundingInfo.formatted
          };
        } catch (error) {
          console.error(`Error loading budget for student ${student.id}:`, error);
          const defaultLimit = calculateStudentBudget(student.grade);
          const defaultFundingInfo = getFundingType(student.grade);
          budgets[student.id] = {
            limit: defaultLimit,
            spent: 0,
            remaining: defaultLimit,
            percentageUsed: 0,
            gradeLevel: student.grade,
            fundingType: defaultFundingInfo.type,
            fundingLabel: defaultFundingInfo.label,
            fundingFormatted: defaultFundingInfo.formatted
          };
        }
      }

      setStudentSOLOPlans(soloPlans);
      setStudentBudgets(budgets);
    } catch (error) {
      console.error('Error loading student data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update allocations when total amount changes
    if (field === 'totalAmount') {
      const totalAmount = parseFloat(value) || 0;
      setStudentAllocations(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(studentId => {
          updated[studentId] = {
            ...updated[studentId],
            totalAmount,
            amount: (updated[studentId].percentage || 0) / 100 * totalAmount
          };
        });
        return updated;
      });
    }

    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = async (files) => {
    if (!files.length) return;

    // Only allow one receipt - take the first file if multiple are selected
    const file = files[0];

    setUploadingFiles(true);
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not supported. Please use JPG, PNG, WEBP, or PDF.`);
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
      }

      const timestamp = Date.now();
      const fileName = `receipt_${timestamp}_${file.name}`;
      
      const storage = getStorage();
      const dbSchoolYear = formatSchoolYearForDatabase(selectedSchoolYear);
      const fileRef = storageRef(storage, `rtdAcademy/reimbursementReceipts/${customClaims.familyId}/${dbSchoolYear}/${fileName}`);
      
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const uploadedFile = {
        fileId: `receipt_${timestamp}`,
        fileName: file.name,
        fileUrl: downloadURL,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size,
        fileType: file.type
      };

      // Replace any existing receipt with the new one
      setFormData(prev => ({
        ...prev,
        receipts: [uploadedFile]
      }));

      // Automatically analyze the receipt with AI
      analyzeReceiptWithAI(uploadedFile);
    } catch (error) {
      console.error('Error uploading files:', error);
      setErrors(prev => ({ ...prev, receipts: error.message }));
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeReceipt = (fileId) => {
    setFormData(prev => ({
      ...prev,
      receipts: prev.receipts.filter(receipt => receipt.fileId !== fileId)
    }));
    // Clear analysis if the analyzed receipt is removed
    if (receiptAnalysis && receiptAnalysis.receiptId === fileId) {
      setReceiptAnalysis(null);
      setShowAnalysisResults(false);
    }
  };

  const analyzeReceiptWithAI = async (receipt) => {
    setAnalyzingReceipt(true);
    setShowAnalysisResults(false);
    
    // Show loading toast
    const toastId = toast.loading('Analyzing receipt with AI...', {
      description: 'Extracting purchase details from your receipt'
    });
    
    try {
      const functions = getFunctions();
      const analyzeReceiptFunc = httpsCallable(functions, 'analyzeReceipt');
      
      console.log('Analyzing receipt:', receipt.fileName);
      
      const result = await analyzeReceiptFunc({
        fileUrl: receipt.fileUrl,
        fileName: receipt.fileName,
        mimeType: receipt.fileType
      });
      
      if (result.data.success) {
        const analysis = result.data.analysis;
        
        // Store the analysis with the receipt ID
        setReceiptAnalysis({
          ...analysis,
          receiptId: receipt.fileId
        });
        
        // Auto-populate form fields if data was extracted
        if (analysis.purchaseDate && !formData.purchaseDate) {
          handleInputChange('purchaseDate', analysis.purchaseDate);
        }
        
        if (analysis.totalAmount && !formData.totalAmount) {
          handleInputChange('totalAmount', analysis.totalAmount.toString());
        }
        
        if (analysis.taxAmount && !formData.taxAmount) {
          handleInputChange('taxAmount', analysis.taxAmount.toString());
        }
        
        if (analysis.vendor && !formData.vendor) {
          handleInputChange('vendor', analysis.vendor);
        }
        
        if (analysis.purchaseDescription && !formData.description) {
          handleInputChange('description', analysis.purchaseDescription);
        }
        
        setShowAnalysisResults(true);
        
        // Show success toast with extracted info
        const extractedFields = [];
        if (analysis.vendor) extractedFields.push('vendor');
        if (analysis.totalAmount) extractedFields.push('amount');
        if (analysis.taxAmount) extractedFields.push('tax');
        if (analysis.purchaseDate) extractedFields.push('date');
        if (analysis.purchaseDescription) extractedFields.push('description');
        
        if (extractedFields.length > 0) {
          toast.success('Receipt analyzed successfully!', {
            id: toastId,
            description: `Extracted: ${extractedFields.join(', ')}. Quality score: ${analysis.validationScore}%`
          });
        } else {
          toast.warning('Receipt analyzed, but no data could be extracted', {
            id: toastId,
            description: 'Please fill in the purchase details manually'
          });
        }
      } else {
        throw new Error(result.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      setErrors(prev => ({ 
        ...prev, 
        aiAnalysis: `Failed to analyze receipt: ${error.message}` 
      }));
      
      // Show error toast
      toast.error('Failed to analyze receipt', {
        id: toastId,
        description: error.message
      });
    } finally {
      setAnalyzingReceipt(false);
    }
  };

  const handleStudentToggle = (studentId, isSelected) => {
    const newSelectedStudents = new Set(selectedStudents);
    
    if (isSelected) {
      newSelectedStudents.add(studentId);
      // Initialize allocation for this student
      if (!studentAllocations[studentId]) {
        setStudentAllocations(prev => ({
          ...prev,
          [studentId]: {
            studentId,
            studentName: familyData.students.find(s => s.id === studentId)?.firstName + ' ' + familyData.students.find(s => s.id === studentId)?.lastName,
            percentage: 0,
            amount: 0,
            totalAmount: parseFloat(formData.totalAmount) || 0,
            soloCategories: [],
            categoryJustification: ''
          }
        }));
      }
    } else {
      newSelectedStudents.delete(studentId);
      // Remove allocation for this student
      setStudentAllocations(prev => {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      });
    }
    
    setSelectedStudents(newSelectedStudents);
  };

  const handleAllocationChange = (studentId, allocation) => {
    setStudentAllocations(prev => ({
      ...prev,
      [studentId]: allocation
    }));

    // Clear related errors
    if (errors[`student_${studentId}`]) {
      setErrors(prev => ({ ...prev, [`student_${studentId}`]: {} }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic purchase info validation
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Vendor name is required';
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Valid total amount is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Purchase description is required';
    }

    if (formData.receipts.length === 0) {
      newErrors.receipts = 'A receipt is required';
    }

    // Student allocation validation
    if (selectedStudents.size === 0) {
      newErrors.students = 'At least one student must be selected';
    }

    // Validate percentages total 100%
    const totalPercentage = Object.values(studentAllocations).reduce((sum, allocation) => {
      return sum + (allocation.percentage || 0);
    }, 0);

    if (Math.abs(totalPercentage - 100) > 0.01) { // Allow for small floating point differences
      newErrors.percentages = `Percentages must total 100%. Current total: ${totalPercentage.toFixed(1)}%`;
    }

    // Validate each student allocation
    selectedStudents.forEach(studentId => {
      const allocation = studentAllocations[studentId];
      const studentErrors = {};

      if (!allocation.percentage || allocation.percentage <= 0) {
        studentErrors.percentage = 'Percentage must be greater than 0';
      }

      if (!allocation.soloCategories?.length) {
        studentErrors.soloCategories = 'A SOLO plan category is required';
      }

      if (!allocation.categoryJustification?.trim()) {
        studentErrors.categoryJustification = 'Justification is required';
      }

      // Budget validation
      const studentBudget = studentBudgets[studentId];
      if (studentBudget && allocation.amount > studentBudget.remaining) {
        studentErrors.amount = `Amount exceeds remaining budget of $${studentBudget.remaining.toFixed(2)}`;
      }

      // Funding limit validation for categories with restrictions
      const selectedCategory = studentSOLOPlans[studentId]?.find(cat => cat.key === allocation.soloCategories?.[0]);
      if (selectedCategory?.hasFundingLimit && studentBudget && allocation.calculatedAmount) {
        const maxAllowedForCategory = studentBudget.limit * (selectedCategory.fundingLimitPercentage / 100);
        if (allocation.calculatedAmount > maxAllowedForCategory) {
          studentErrors.amount = `Amount exceeds ${selectedCategory.fundingLimitPercentage}% funding limit of $${maxAllowedForCategory.toFixed(2)} for this category`;
        }
      }

      if (Object.keys(studentErrors).length > 0) {
        newErrors[`student_${studentId}`] = studentErrors;
      }
    });

    // Manual validation check for low-quality receipts
    if (receiptAnalysis && receiptAnalysis.validationScore < 50) {
      if (!formData.manualValidationNotes?.trim()) {
        newErrors.manualValidationNotes = 'Manual validation explanation is required for this document';
      } else if (formData.manualValidationNotes.trim().length < 50) {
        newErrors.manualValidationNotes = 'Please provide a more detailed explanation (at least 50 characters)';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const db = getDatabase();
      const dbSchoolYear = formatSchoolYearForDatabase(selectedSchoolYear);
      console.log(`Submitting claim for school year: ${selectedSchoolYear} -> ${dbSchoolYear}`);
      const claimRef = push(ref(db, `homeEducationFamilies/familyInformation/${customClaims.familyId}/REIMBURSEMENT_CLAIMS/${dbSchoolYear}`));
      
      const claimData = {
        claimId: claimRef.key,
        familyId: customClaims.familyId,
        schoolYear: selectedSchoolYear,
        
        purchaseInfo: {
          date: formData.purchaseDate,
          vendor: formData.vendor,
          totalAmount: parseFloat(formData.totalAmount),
          taxAmount: formData.taxAmount ? parseFloat(formData.taxAmount) : null,
          description: formData.description
        },
        
        receipts: formData.receipts,
        
        // AI Analysis Results
        aiAnalysis: receiptAnalysis || null,
        
        // Manual Validation (if required for low-quality receipts)
        manualValidationNotes: formData.manualValidationNotes?.trim() || null,
        
        // Review flags for staff
        requiresManualReview: receiptAnalysis?.requiresManualReview || receiptAnalysis?.validationScore < 50 || false,
        reviewPriority: receiptAnalysis?.reviewPriority || (receiptAnalysis?.validationScore < 30 ? 'high' : receiptAnalysis?.validationScore < 70 ? 'medium' : 'low'),
        
        studentAllocations: Object.values(studentAllocations).map(allocation => ({
          ...allocation,
          amount: parseFloat(allocation.amount.toFixed(2))
        })),
        
        status: 'pending_review',
        submittedAt: getEdmontonTimestamp(),
        submittedBy: user.uid,
        lastUpdated: getEdmontonTimestamp()
      };

      await set(claimRef, claimData);

      // Notify parent component
      if (onClaimSubmitted) {
        onClaimSubmitted(claimData);
      }

      // Reset form
      setFormData({
        purchaseDate: toDateString(new Date()),
        vendor: '',
        totalAmount: '',
        taxAmount: '',
        description: '',
        receipts: [],
        manualValidationNotes: ''
      });
      setStudentAllocations({});
      setSelectedStudents(new Set());

      // Close form
      onOpenChange(false);

    } catch (error) {
      console.error('Error submitting claim:', error);
      setErrors({ submit: 'Failed to submit claim. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAllocatedPercentage = Object.values(studentAllocations).reduce((sum, allocation) => {
    return sum + (allocation.percentage || 0);
  }, 0);

  const isPercentageValid = Math.abs(totalAllocatedPercentage - 100) < 0.01;

  // Validation Score Indicator Component
  const ValidationScoreIndicator = ({ score, issues = [] }) => {
    const getScoreColor = (score) => {
      if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
      if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
    };
    
    const getScoreIcon = (score) => {
      if (score >= 80) return <CheckCircle2 className="w-4 h-4" />;
      if (score >= 50) return <AlertCircle className="w-4 h-4" />;
      return <X className="w-4 h-4" />;
    };
    
    const getScoreMessage = (score) => {
      if (score >= 80) return 'High quality receipt - all information extracted';
      if (score >= 50) return 'Partial extraction - please verify details';
      return 'Poor quality - manual entry recommended';
    };
    
    return (
      <div className={`p-3 rounded-lg border ${getScoreColor(score)}`}>
        <div className="flex items-start space-x-2">
          {getScoreIcon(score)}
          <div className="flex-1">
            <p className="text-sm font-medium flex items-center">
              Receipt Quality: {score}%
            </p>
            <p className="text-xs mt-1">{getScoreMessage(score)}</p>
            {issues.length > 0 && (
              <ul className="text-xs mt-2 space-y-1">
                {issues.map((issue, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Check if any allocations exceed funding limits
  const hasFundingLimitViolations = () => {
    return Object.keys(studentAllocations).some(studentId => {
      const allocation = studentAllocations[studentId];
      const studentBudget = studentBudgets[studentId];
      const selectedCategory = studentSOLOPlans[studentId]?.find(cat => cat.key === allocation.soloCategories?.[0]);
      
      if (selectedCategory?.hasFundingLimit && studentBudget && allocation.calculatedAmount) {
        const maxAllowedForCategory = studentBudget.limit * (selectedCategory.fundingLimitPercentage / 100);
        console.log(`Checking funding limit for student ${studentId}:`, {
          category: selectedCategory.name,
          calculatedAmount: allocation.calculatedAmount,
          finalAmount: allocation.amount,
          maxAllowed: maxAllowedForCategory,
          isViolation: allocation.calculatedAmount > maxAllowedForCategory
        });
        return allocation.calculatedAmount > maxAllowedForCategory;
      }
      
      return false;
    });
  };

  const hasViolations = hasFundingLimitViolations();

  // Receipt Preview Modal Component
  const ReceiptPreviewModal = ({ receipt, isOpen, onClose }) => {
    if (!receipt || !isOpen) return null;

    const isImage = receipt.fileType?.startsWith('image/') || false;
    const isPDF = receipt.fileType === 'application/pdf' || false;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="relative max-w-4xl max-h-full bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              {receipt.fileName}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 max-h-[80vh] overflow-auto">
            {isImage ? (
              <img
                src={receipt.fileUrl}
                alt={receipt.fileName}
                className="max-w-full h-auto rounded-lg shadow-sm"
                style={{ maxHeight: 'calc(80vh - 100px)' }}
              />
            ) : isPDF ? (
              <div className="text-center">
                <iframe
                  src={receipt.fileUrl}
                  title={receipt.fileName}
                  className="w-full rounded-lg shadow-sm"
                  style={{ height: 'calc(80vh - 100px)', minHeight: '500px' }}
                />
                <p className="text-sm text-gray-600 mt-2">
                  <a 
                    href={receipt.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 underline"
                  >
                    Open PDF in new tab
                  </a>
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                <a 
                  href={receipt.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 underline"
                >
                  Download file to view
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Receipt Thumbnail Component
  const ReceiptThumbnail = ({ receipt }) => {
    const isImage = receipt.fileType?.startsWith('image/') || false;
    const isPDF = receipt.fileType === 'application/pdf' || false;

    const handlePreview = () => {
      setPreviewReceipt(receipt);
      setShowPreviewModal(true);
    };

    if (isImage) {
      return (
        <div className="relative group">
          <img
            src={receipt.fileUrl}
            alt={receipt.fileName}
            className="w-16 h-16 object-cover rounded-lg border border-purple-200 cursor-pointer hover:border-purple-400 transition-colors"
            onClick={handlePreview}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center rounded-lg cursor-pointer" onClick={handlePreview}>
            <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      );
    } else if (isPDF) {
      return (
        <div 
          className="w-16 h-16 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-200 transition-colors group"
          onClick={handlePreview}
        >
          <FileText className="w-8 h-8 text-red-600" />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center rounded-lg">
            <Maximize2 className="w-3 h-3 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
      );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[90vw] max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-purple-500" />
              <span>Submit Reimbursement Claim</span>
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            Upload receipts and allocate educational expenses across your students.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* School Year Info Banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900">
                  Submitting for {selectedSchoolYear} School Year
                </h3>
                <p className="text-sm text-purple-700 mt-1">
                  {schoolYearInfo.isNextYear 
                    ? `Since we're past the ${schoolYearInfo.deadline} deadline, you're submitting receipts for the upcoming school year.`
                    : `Submit receipts for the current school year until ${schoolYearInfo.deadline}.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Upload - Moved to Top */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload Your Receipt
            </h3>
            
            <FormField label="Upload Receipt" error={errors.receipts} required>
              <div className="space-y-4">
                {/* File Input - Only show if no receipt is uploaded */}
                {formData.receipts.length === 0 && (
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors bg-white">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                      className="hidden"
                      id="receipt-upload"
                      disabled={uploadingFiles}
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-purple-700 mb-1 font-medium">
                        {uploadingFiles ? 'Uploading...' : 'Click to upload your receipt'}
                      </p>
                      <p className="text-xs text-purple-600">
                        JPG, PNG, WEBP, or PDF up to 10MB
                      </p>
                    </label>
                    {uploadingFiles && (
                      <div className="mt-2">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto text-purple-600" />
                      </div>
                    )}
                  </div>
                )}

                {/* Uploaded Receipt */}
                {formData.receipts.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-purple-800">Your Receipt:</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, receipts: [] }));
                          setReceiptAnalysis(null);
                          setShowAnalysisResults(false);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-800 underline flex items-center"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Upload different receipt
                      </button>
                    </div>
                    {formData.receipts.map((receipt) => (
                      <div key={receipt.fileId} className="flex items-start space-x-3 p-3 bg-white border border-purple-200 rounded-lg">
                        {/* Receipt Thumbnail */}
                        <ReceiptThumbnail receipt={receipt} />
                        
                        {/* Receipt Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-purple-800 truncate">{receipt.fileName}</p>
                              <p className="text-xs text-purple-600 mt-0.5">
                                {receipt.fileType} • {formatFileSize(receipt.fileSize)}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewReceipt(receipt);
                                  setShowPreviewModal(true);
                                }}
                                className="text-xs text-purple-600 hover:text-purple-800 underline mt-1 flex items-center"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Click to preview
                              </button>
                            </div>
                            
                            {/* AI Analysis Status Badge */}
                            <div className="flex items-center space-x-2 ml-3">
                              {analyzingReceipt && receiptAnalysis?.receiptId === receipt.fileId ? (
                                <div className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md bg-purple-100 text-purple-700">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Analyzing...</span>
                                </div>
                              ) : receiptAnalysis && receiptAnalysis.receiptId === receipt.fileId ? (
                                <div className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 border border-green-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>AI Analyzed</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* AI Analysis Results */}
                {showAnalysisResults && receiptAnalysis && (
                  <div className="mt-4 space-y-3">
                    <ValidationScoreIndicator 
                      score={receiptAnalysis.validationScore} 
                      issues={receiptAnalysis.validationIssues}
                    />
                    
                    {/* Review Priority Indicator */}
                    <div className={`p-3 rounded-lg border ${
                      receiptAnalysis.reviewPriority === 'high' || receiptAnalysis.validationScore < 30
                        ? 'bg-red-50 border-red-200' 
                        : receiptAnalysis.reviewPriority === 'medium' || receiptAnalysis.validationScore < 70
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          receiptAnalysis.reviewPriority === 'high' || receiptAnalysis.validationScore < 30
                            ? 'bg-red-100 text-red-800' 
                            : receiptAnalysis.reviewPriority === 'medium' || receiptAnalysis.validationScore < 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {receiptAnalysis.reviewPriority?.toUpperCase() || 
                           (receiptAnalysis.validationScore < 30 ? 'HIGH' : 
                            receiptAnalysis.validationScore < 70 ? 'MEDIUM' : 'LOW')} PRIORITY
                        </div>
                        <span className={`text-sm font-medium ${
                          receiptAnalysis.reviewPriority === 'high' || receiptAnalysis.validationScore < 30
                            ? 'text-red-700' 
                            : receiptAnalysis.reviewPriority === 'medium' || receiptAnalysis.validationScore < 70
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}>
                          {receiptAnalysis.reviewPriority === 'high' || receiptAnalysis.validationScore < 30
                            ? 'Will be reviewed first by staff due to quality concerns'
                            : receiptAnalysis.reviewPriority === 'medium' || receiptAnalysis.validationScore < 70
                            ? 'Standard review process - may require staff verification'
                            : 'Low priority review - likely to be approved quickly'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Detailed Extraction Results */}
                    <div className="p-4 bg-white border border-purple-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Receipt Analysis Results
                      </h4>
                      
                      {/* Analysis Items List */}
                      <div className="space-y-3">
                        {/* Vendor/Store */}
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-purple-700 flex items-center font-medium">
                            <Building2 className="w-3 h-3 mr-1" />
                            Vendor/Store:
                          </span>
                          <div className="text-right">
                            {receiptAnalysis.vendor ? (
                              <span className="text-green-700 font-semibold">
                                {receiptAnalysis.vendor} ✓
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                Not found ✗
                              </span>
                            )}
                            {receiptAnalysis.confidence && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {Math.round(receiptAnalysis.confidence.vendor * 100)}% confident
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Purchase Price */}
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-purple-700 flex items-center font-medium">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Purchase Price:
                          </span>
                          <div className="text-right">
                            {receiptAnalysis.totalAmount !== null ? (
                              <span className="text-green-700 font-semibold">
                                ${receiptAnalysis.totalAmount.toFixed(2)} ✓
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                Not found ✗
                              </span>
                            )}
                            {receiptAnalysis.confidence && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {Math.round(receiptAnalysis.confidence.amount * 100)}% confident
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Tax Amount */}
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-purple-700 flex items-center font-medium">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Tax Amount:
                          </span>
                          <div className="text-right">
                            {receiptAnalysis.taxAmount !== null ? (
                              <span className="text-green-700 font-semibold">
                                ${receiptAnalysis.taxAmount.toFixed(2)} ✓
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                Not found ✗
                              </span>
                            )}
                            {receiptAnalysis.confidence?.tax !== undefined && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {Math.round(receiptAnalysis.confidence.tax * 100)}% confident
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Purchase Date */}
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-purple-700 flex items-center font-medium">
                            <Calendar className="w-3 h-3 mr-1" />
                            Purchase Date:
                          </span>
                          <div className="text-right">
                            {receiptAnalysis.purchaseDate ? (
                              <span className="text-green-700 font-semibold">
                                {receiptAnalysis.purchaseDate} ✓
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                Not found ✗
                              </span>
                            )}
                            {receiptAnalysis.confidence && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {Math.round(receiptAnalysis.confidence.date * 100)}% confident
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Purchase Description */}
                        <div className="flex items-start justify-between text-sm">
                          <span className="text-purple-700 flex items-center font-medium">
                            <FileText className="w-3 h-3 mr-1" />
                            Description:
                          </span>
                          <div className="text-right max-w-xs">
                            {receiptAnalysis.purchaseDescription ? (
                              <span className="text-green-700 font-semibold">
                                {receiptAnalysis.purchaseDescription} ✓
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                Not detected ✗
                              </span>
                            )}
                            {receiptAnalysis.confidence?.description !== undefined && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {Math.round(receiptAnalysis.confidence.description * 100)}% confident
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Items List if available */}
                      {receiptAnalysis.items && receiptAnalysis.items.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-purple-100">
                          <p className="text-xs font-semibold text-purple-800 mb-2">Detected Items:</p>
                          <ul className="text-xs text-purple-700 space-y-1">
                            {receiptAnalysis.items.slice(0, 5).map((item, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-2 text-purple-400">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                            {receiptAnalysis.items.length > 5 && (
                              <li className="text-purple-500 italic">...and {receiptAnalysis.items.length - 5} more items</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Manual Validation Required */}
                {showAnalysisResults && receiptAnalysis && receiptAnalysis.validationScore < 50 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-800 mb-2">
                          Manual Validation Required
                        </h4>
                        <p className="text-sm text-orange-700 mb-3">
                          This {receiptAnalysis.documentType || 'document'} has quality issues or concerns that require your attention. 
                          {receiptAnalysis.documentType === 'invoice' && ' Invoices require manual review as they are bills rather than proof of payment.'}
                          {receiptAnalysis.validationScore < 30 && ' The document quality is very poor and may not be suitable for reimbursement.'}
                        </p>
                        {receiptAnalysis.validationIssues && receiptAnalysis.validationIssues.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-orange-800 mb-1">Issues detected:</p>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {receiptAnalysis.validationIssues.map((issue, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-2 text-orange-500">•</span>
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <FormField 
                          label="Explain why this should be accepted for reimbursement" 
                          error={errors.manualValidationNotes}
                          required
                          description="Please address the concerns above and explain why this document should be approved for reimbursement"
                        >
                          <textarea
                            value={formData.manualValidationNotes}
                            onChange={(e) => handleInputChange('manualValidationNotes', e.target.value)}
                            className={`w-full px-3 py-2 border ${
                              errors.manualValidationNotes ? 'border-red-300' : 'border-orange-300'
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500`}
                            rows={4}
                            placeholder="Example: This is an invoice from our approved vendor for educational supplies. Payment was made via purchase order and this invoice serves as our receipt for tax purposes..."
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* AI Analysis Error */}
                {errors.aiAnalysis && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.aiAnalysis}
                    </p>
                  </div>
                )}
              </div>
            </FormField>
          </div>
          {/* Purchase Information */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Purchase Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Purchase Date" error={errors.purchaseDate} required>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.purchaseDate ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                />
              </FormField>

              <FormField label="Vendor/Store" error={errors.vendor} required>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.vendor ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="e.g., Amazon, Staples, Local Bookstore"
                />
              </FormField>

              <FormField label="Total Amount" error={errors.totalAmount} required>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border ${
                      errors.totalAmount ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="0.00"
                  />
                </div>
              </FormField>

              <FormField 
                label="Tax Amount" 
                error={errors.taxAmount}
                description="Tax portion of the purchase (GST, HST, PST, etc.)"
              >
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.taxAmount}
                    onChange={(e) => handleInputChange('taxAmount', e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border ${
                      errors.taxAmount ? 'border-red-300' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="0.00"
                  />
                </div>
              </FormField>

              <FormField 
                label="Description" 
                error={errors.description} 
                required
                description="Brief description of what was purchased"
              >
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="e.g., Science equipment and art supplies"
                />
              </FormField>
            </div>
          </div>


          {/* Student Allocation */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-900 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Student Allocation
          </h3>
              <div className={`text-sm font-medium ${
                isPercentageValid ? 'text-green-600' : 'text-red-600'
              }`}>
                Total: {totalAllocatedPercentage.toFixed(1)}%
                {isPercentageValid ? ' ✓' : ` (needs to be 100%)`}
              </div>
            </div>

            {errors.students && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{errors.students}</p>
              </div>
            )}

            {errors.percentages && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{errors.percentages}</p>
              </div>
            )}

            <div className="space-y-4">
              {(() => {
                // Filter students who have SOLO plans for this school year
                const studentsWithSOLO = familyData?.students?.filter(student => 
                  studentSOLOPlans[student.id] && studentSOLOPlans[student.id].length > 0
                ) || [];
                
                const studentsWithoutSOLO = familyData?.students?.filter(student => 
                  !studentSOLOPlans[student.id] || studentSOLOPlans[student.id].length === 0
                ) || [];

                return (
                  <>
                    {studentsWithSOLO.length > 0 && (
                      <>
                        {studentsWithSOLO.map((student) => (
                          <StudentAllocationCard
                            key={student.id}
                            student={student}
                            allocation={studentAllocations[student.id] || {}}
                            onAllocationChange={handleAllocationChange}
                            onToggleStudent={handleStudentToggle}
                            isSelected={selectedStudents.has(student.id)}
                            studentSOLOCategories={studentSOLOPlans[student.id] || []}
                            errors={errors[`student_${student.id}`] || {}}
                            remainingBudget={studentBudgets[student.id]?.remaining || 901.00}
                            budgetInfo={studentBudgets[student.id]}
                          />
                        ))}
                      </>
                    )}
                    
                    {studentsWithoutSOLO.length > 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800 mb-2">
                              Students Need Program Plans
                            </h4>
                            <p className="text-sm text-yellow-700 mb-3">
                              The following students don't have Program Plans for the {selectedSchoolYear} school year and cannot be included in reimbursement claims:
                            </p>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {studentsWithoutSOLO.map((student) => (
                                <li key={student.id} className="flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                                  <span className="font-medium">
                                    {student.firstName} {student.lastName} (Grade {student.grade})
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <p className="text-sm text-yellow-700 mt-3">
                              Please complete their Program Plans first before submitting reimbursement claims.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {studentsWithSOLO.length === 0 && studentsWithoutSOLO.length === 0 && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <p className="text-gray-600">No students found for this family.</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Submit */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {hasViolations && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
              <p className="text-sm text-orange-800">
                <strong>Funding Limit Exceeded:</strong> Some student allocations exceed the 50% funding limit for their selected categories. Please adjust the amounts before submitting.
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || uploadingFiles || !isPercentageValid || hasViolations}
              className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
                isSubmitting || uploadingFiles || !isPercentageValid || hasViolations
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting Claim...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Reimbursement Claim
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Receipt Preview Modal */}
        <ReceiptPreviewModal 
          receipt={previewReceipt}
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewReceipt(null);
          }}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ReceiptUploadForm;