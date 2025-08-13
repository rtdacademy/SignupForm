import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDatabase, ref, set, get, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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
  Minus,
  Eye,
  Maximize2,
  Download,
  RefreshCw
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
  budgetInfo = null,
  analyzingReceipt = false
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
        <label className={`flex items-center space-x-3 ${analyzingReceipt ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleStudent(student.id, e.target.checked)}
            disabled={analyzingReceipt}
            className={`h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 ${
              analyzingReceipt ? 'opacity-50 cursor-not-allowed' : ''
            }`}
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
          {/* AI Suggestion Badge */}
          {allocation.isAISuggested && (
            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2 text-xs">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  AI Suggested Category ({Math.round((allocation.aiConfidence || 0) * 100)}% confidence)
                </span>
              </div>
              {allocation.relevantItems && allocation.relevantItems.length > 0 && (
                <p className="text-xs text-blue-700 mt-1">
                  Based on: {allocation.relevantItems.join(', ')}
                </p>
              )}
            </div>
          )}
          
          {/* No Matching Category Warning */}
          {allocation.isAISuggested && allocation.aiConfidence === 0 && !allocation.soloCategories?.length && (
            <div className="mb-3 p-2 bg-orange-50 border border-orange-300 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-orange-800">
                    No Matching Category Available
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    This purchase doesn't match any categories in this student's program plan. 
                    You'll need to select "Other" or update the program plan to include an appropriate category.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Percentage Input with Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <FormField 
              label="Percentage" 
              error={errors.percentage}
              required
            >
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={allocation.percentage || ''}
                    onChange={(e) => handlePercentageChange(e.target.value)}
                    disabled={analyzingReceipt}
                    className={`w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      analyzingReceipt 
                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                        : errors.percentage 
                          ? 'border-red-300' 
                          : 'border-gray-300'
                    }`}
                    placeholder={analyzingReceipt ? "Wait..." : "0"}
                  />
                  <span className={`absolute right-3 top-2 ${analyzingReceipt ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                </div>
                {/* Quick Action Buttons */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handlePercentageChange('100')}
                    disabled={analyzingReceipt}
                    className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                      analyzingReceipt
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    100%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(allocation.percentage) || 0;
                      handlePercentageChange(Math.min(100, current + 10).toString());
                    }}
                    disabled={analyzingReceipt}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      analyzingReceipt
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(allocation.percentage) || 0;
                      handlePercentageChange(Math.max(0, current - 10).toString());
                    }}
                    disabled={analyzingReceipt}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      analyzingReceipt
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    -10%
                  </button>
                </div>
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
                <Select
                  value={allocation.soloCategories?.[0] || ''}
                  onValueChange={(value) => handleCategoryChange(value ? [value] : [])}
                  disabled={analyzingReceipt}
                >
                  <SelectTrigger 
                    className={`w-full ${
                      analyzingReceipt 
                        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                        : errors.soloCategories 
                          ? 'border-red-300 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-purple-500'
                    }`}
                  >
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent className="max-w-[500px]">
                    {studentSOLOCategories.map((category) => (
                      <SelectItem 
                        key={category.key} 
                        value={category.key}
                        className="cursor-pointer"
                      >
                        <span className="block truncate pr-2" title={category.name}>
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              disabled={analyzingReceipt}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                analyzingReceipt 
                  ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed' 
                  : errors.categoryJustification 
                    ? 'border-red-300' 
                    : 'border-gray-300'
              }`}
              rows={3}
              placeholder={analyzingReceipt ? "Please wait for AI analysis to complete..." : "Describe how this purchase will be used for this student's education..."}
            />
          </FormField>
        </div>
      )}
    </div>
  );
};

const ReceiptUploadForm = ({ isOpen, onOpenChange, familyData, schoolYear, familyId, customClaims, onClaimSubmitted }) => {
  const { user } = useAuth();
  
  // Auto-determine school year based on deadline
  const schoolYearInfo = determineReceiptSchoolYear();
  const selectedSchoolYear = schoolYearInfo.schoolYear;
  
  // Password protection state
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const UNLOCK_PASSWORD = 'connect';
  
  const [formData, setFormData] = useState({
    purchaseDate: '',
    vendor: '',
    totalAmount: '',
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
  const [aiAnalysisFailed, setAiAnalysisFailed] = useState(false);
  
  // Receipt workflow state
  const [hasUploadedReceipt, setHasUploadedReceipt] = useState(false);
  const [userHasOverridden, setUserHasOverridden] = useState({
    purchaseDate: false,
    vendor: false,
    totalAmount: false,
    description: false
  });
  
  // Manual entry state
  const [manualEntryEnabled, setManualEntryEnabled] = useState(false);
  const [manualEntryReason, setManualEntryReason] = useState('');
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  
  // Preview state
  const [previewReceipt, setPreviewReceipt] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Mixed receipt state
  const [isMixedReceipt, setIsMixedReceipt] = useState(false);
  const [selectedEducationalItems, setSelectedEducationalItems] = useState(new Set());
  const [mixedReceiptAnalysis, setMixedReceiptAnalysis] = useState(null);

  // Load student data when form opens
  useEffect(() => {
    if (isOpen && familyData?.students && familyId) {
      loadStudentData();
    }
  }, [isOpen, familyData?.students, familyId]);

  const loadStudentData = async () => {
    if (!familyData?.students || !familyId) return;

    try {
      const db = getDatabase();
      const soloPlans = {};
      const budgets = {};

      for (const student of familyData.students) {
        // Load program plan categories
        try {
          const dbSchoolYear = formatSchoolYearForDatabase(selectedSchoolYear);
          console.log(`Loading program plan for student ${student.id}, school year: ${selectedSchoolYear} -> ${dbSchoolYear}`);
          const soloRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${dbSchoolYear}/${student.id}`);
          const soloSnapshot = await get(soloRef);
          
          if (soloSnapshot.exists()) {
            const soloData = soloSnapshot.val();
            console.log(`✅ Found program plan for student ${student.id}:`, soloData);
            const categories = [];
            
            // Extract resource categories from program plan
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
            console.log(`❌ No program plan found for student ${student.id} at path: homeEducationFamilies/familyInformation/${familyId}/SOLO_EDUCATION_PLANS/${dbSchoolYear}/${student.id}`);
            soloPlans[student.id] = [];
          }
        } catch (error) {
          console.error(`Error loading program plan for student ${student.id}:`, error);
          soloPlans[student.id] = [];
        }

        // Load budget information
        try {
          const dbSchoolYear = formatSchoolYearForDatabase(selectedSchoolYear);
          console.log(`Loading budget for student ${student.id}, school year: ${selectedSchoolYear} -> ${dbSchoolYear}`);
          const reimbursementRef = ref(db, `homeEducationFamilies/familyInformation/${familyId}/REIMBURSEMENT_CLAIMS/${dbSchoolYear}`);
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

  const handleInputChange = (field, value, isUserInput = true) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track user overrides for purchase info fields
    if (isUserInput && ['purchaseDate', 'vendor', 'totalAmount', 'description'].includes(field)) {
      setUserHasOverridden(prev => ({ ...prev, [field]: true }));
    }
    
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
      const fileRef = storageRef(storage, `rtdAcademy/reimbursementReceipts/${familyId}/${dbSchoolYear}/${fileName}`);
      
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
      
      // Set receipt uploaded state
      setHasUploadedReceipt(true);

      // Note: AI analysis is now triggered manually by user after selecting receipt type
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
    // Reset receipt uploaded state if no receipts remain
    if (formData.receipts.length <= 1) {
      setHasUploadedReceipt(false);
    }
  };

  const analyzeReceiptWithAI = async (receipt) => {
    setAnalyzingReceipt(true);
    setShowAnalysisResults(false);
    setAiAnalysisFailed(false);
    
    // Clear previous mixed receipt analysis
    setMixedReceiptAnalysis(null);
    setSelectedEducationalItems(new Set());
    
    // Show loading toast based on receipt type
    const toastId = toast.loading(
      isMixedReceipt ? 'Analyzing mixed receipt with AI...' : 'Analyzing receipt with AI...', 
      {
        description: isMixedReceipt 
          ? 'Breaking down individual items and classifying educational vs non-educational'
          : 'Extracting purchase details from your receipt'
      }
    );
    
    try {
      const functions = getFunctions();
      
      // Prepare student plan data for AI
      const studentPlanData = familyData.students
        .filter(student => studentSOLOPlans[student.id]?.length > 0)
        .map(student => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          grade: student.grade,
          approvedCategories: studentSOLOPlans[student.id].map(cat => ({
            key: cat.key,
            name: cat.name,
            description: cat.description,
            hasFundingLimit: cat.hasFundingLimit || false,
            fundingLimitPercentage: cat.fundingLimitPercentage || null
          }))
        }));
      
      console.log('Sending student plans to AI:', studentPlanData.length, 'students with program plans');
      console.log('Student plan data being sent:', studentPlanData);
      
      // Choose the appropriate cloud function based on receipt type
      const analyzeFunc = isMixedReceipt 
        ? httpsCallable(functions, 'analyzeMixedReceipt')
        : httpsCallable(functions, 'analyzeReceipt');
      
      console.log(`Analyzing ${isMixedReceipt ? 'mixed' : 'standard'} receipt:`, receipt.fileName);
      
      const result = await analyzeFunc({
        fileUrl: receipt.fileUrl,
        fileName: receipt.fileName,
        mimeType: receipt.fileType,
        studentPlans: studentPlanData
      });
      
      if (result.data.success) {
        const analysis = result.data.analysis;
        
        // Log the full AI response to see if suggestedAllocations is present
        console.log('Full AI analysis response:', analysis);
        console.log('Suggested allocations from AI:', analysis.suggestedAllocations);
        
        if (isMixedReceipt) {
          // Handle mixed receipt results
          setMixedReceiptAnalysis({
            ...analysis,
            receiptId: receipt.fileId
          });
          
          // Pre-select all educational items
          if (analysis.items && analysis.items.length > 0) {
            const educationalItemIndices = new Set(
              analysis.items
                .map((item, index) => item.isEducational ? index : null)
                .filter(index => index !== null)
            );
            setSelectedEducationalItems(educationalItemIndices);
            
            // Set total amount to recommended claim amount (educational items only)
            if (analysis.recommendedClaimAmount && !userHasOverridden.totalAmount) {
              handleInputChange('totalAmount', analysis.recommendedClaimAmount.toString(), false);
            }
          }
          
          // Auto-populate common fields
          console.log('Mixed receipt - AI analysis purchaseDate:', analysis.purchaseDate, 'Current formData.purchaseDate:', formData.purchaseDate, 'User overridden:', userHasOverridden.purchaseDate);
          if (analysis.purchaseDate && !userHasOverridden.purchaseDate) {
            console.log('Mixed receipt - Setting purchaseDate from AI analysis:', analysis.purchaseDate);
            handleInputChange('purchaseDate', analysis.purchaseDate, false);
          }
          
          if (analysis.vendor && !formData.vendor && !userHasOverridden.vendor) {
            handleInputChange('vendor', analysis.vendor, false);
          }
          
          // For mixed receipts, generate description from educational items
          if (analysis.items && !formData.description && !userHasOverridden.description) {
            const educationalItems = analysis.items.filter(item => item.isEducational);
            if (educationalItems.length > 0) {
              const description = educationalItems
                .map(item => item.description)
                .join(', ');
              handleInputChange('description', description, false);
            }
          }
          
          // Auto-populate category suggestions for mixed receipts if available
          if (analysis.suggestedAllocations && analysis.suggestedAllocations.length > 0) {
            const newAllocations = {};
            const newSelectedStudents = new Set();

            analysis.suggestedAllocations.forEach(suggestion => {
              // Only apply high-confidence suggestions automatically (70% or higher)
              if (suggestion.confidence >= 0.7) {
                newSelectedStudents.add(suggestion.studentId);

                newAllocations[suggestion.studentId] = {
                  studentId: suggestion.studentId,
                  studentName: suggestion.studentName,
                  percentage: 0, // User still needs to set percentage
                  amount: 0,
                  totalAmount: analysis.recommendedClaimAmount || analysis.educationalTotal || 0,
                  soloCategories: suggestion.suggestedCategory ? [suggestion.suggestedCategory] : [],
                  categoryJustification: suggestion.suggestedJustification || '',
                  isAISuggested: true,
                  aiConfidence: suggestion.confidence,
                  relevantItems: suggestion.relevantItems || []
                };
              }
            });

            // Update state with suggestions
            if (Object.keys(newAllocations).length > 0) {
              setSelectedStudents(newSelectedStudents);
              setStudentAllocations(prev => ({
                ...prev,
                ...newAllocations
              }));

              toast.info(`AI suggested categories for ${Object.keys(newAllocations).length} students based on educational items`, {
                description: 'Review and adjust percentages as needed'
              });
            }
          }
          
          // Show mixed receipt success toast
          const educationalCount = analysis.items?.filter(item => item.isEducational)?.length || 0;
          const totalCount = analysis.items?.length || 0;
          
          toast.success('Mixed receipt analyzed successfully!', {
            id: toastId,
            description: `Found ${educationalCount} educational items out of ${totalCount} total items. Educational total: $${(analysis.educationalTotal || 0).toFixed(2)}`
          });
          
        } else {
          // Handle standard receipt results (existing logic)
          setReceiptAnalysis({
            ...analysis,
            receiptId: receipt.fileId
          });
          
          // Auto-populate form fields ONLY if data was extracted AND user hasn't overridden
          console.log('Standard receipt - AI analysis purchaseDate:', analysis.purchaseDate, 'Current formData.purchaseDate:', formData.purchaseDate, 'User overridden:', userHasOverridden.purchaseDate);
          if (analysis.purchaseDate && !userHasOverridden.purchaseDate) {
            console.log('Standard receipt - Setting purchaseDate from AI analysis:', analysis.purchaseDate);
            handleInputChange('purchaseDate', analysis.purchaseDate, false); // false = not user input
          }
          
          if (analysis.totalAmount && !formData.totalAmount && !userHasOverridden.totalAmount) {
            handleInputChange('totalAmount', analysis.totalAmount.toString(), false);
          }
          
          if (analysis.vendor && !formData.vendor && !userHasOverridden.vendor) {
            handleInputChange('vendor', analysis.vendor, false);
          }
          
          if (analysis.purchaseDescription && !formData.description && !userHasOverridden.description) {
            handleInputChange('description', analysis.purchaseDescription, false);
          }
          
          // Check for category mismatch warning
          if (analysis.categoryMismatchWarning) {
            console.warn('Category mismatch warning:', analysis.categoryMismatchWarning);
          }
          
          // Auto-populate category suggestions if available
          if (analysis.suggestedAllocations && analysis.suggestedAllocations.length > 0) {
            console.log('Processing AI suggestions for standard receipt:', analysis.suggestedAllocations);
            const newAllocations = {};
            const newSelectedStudents = new Set();
            let hasNoCategoryMatches = true;

            analysis.suggestedAllocations.forEach(suggestion => {
              console.log('Processing suggestion:', suggestion);
              // Only apply suggestions with a valid category and confidence >= 0.7
              if (suggestion.suggestedCategory && suggestion.suggestedCategory !== 'null' && suggestion.confidence >= 0.7) {
                hasNoCategoryMatches = false;
                console.log('High confidence suggestion accepted for student:', suggestion.studentId);
                newSelectedStudents.add(suggestion.studentId);

                newAllocations[suggestion.studentId] = {
                  studentId: suggestion.studentId,
                  studentName: suggestion.studentName,
                  percentage: 0, // User still needs to set percentage
                  amount: 0,
                  totalAmount: parseFloat(formData.totalAmount) || 0,
                  soloCategories: [suggestion.suggestedCategory],
                  categoryJustification: suggestion.suggestedJustification || '',
                  isAISuggested: true,
                  aiConfidence: suggestion.confidence
                };
              } else if (!suggestion.suggestedCategory) {
                console.log('No matching category found for student:', suggestion.studentId, '- Reason:', suggestion.categoryMatchReasoning);
              } else {
                console.log('Low confidence suggestion for student:', suggestion.studentId, '- Confidence:', suggestion.confidence);
              }
            });

            // Update state with suggestions
            if (Object.keys(newAllocations).length > 0) {
              setSelectedStudents(newSelectedStudents);
              setStudentAllocations(prev => ({
                ...prev,
                ...newAllocations
              }));

              toast.info(`AI suggested categories for ${Object.keys(newAllocations).length} students`, {
                description: 'Review and adjust percentages as needed'
              });
            } else if (hasNoCategoryMatches) {
              // No categories matched - show warning toast
              toast.warning('No matching categories found in program plans', {
                description: 'This purchase doesn\'t match any approved categories. Consider updating your program plan or this claim may be rejected.',
                duration: 8000
              });
            }
          }
          
          // Show standard success toast with extracted info
          const extractedFields = [];
          if (analysis.vendor) extractedFields.push('vendor');
          if (analysis.totalAmount) extractedFields.push('amount');
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
        }
        
        setShowAnalysisResults(true);
        
        // Clear any previous AI analysis errors
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.aiAnalysis;
          return newErrors;
        });
        
      } else {
        throw new Error(result.data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      setAiAnalysisFailed(true);
      
      // Store a minimal analysis result for failed cases to prevent UI issues
      setReceiptAnalysis({
        receiptId: receipt.fileId,
        validationScore: 0,
        educationComplianceScore: 0,
        educationCategory: 'unclear',
        educationReasoning: 'AI analysis failed - manual review required',
        reimbursementEligibility: 'requires-review'
      });
      
      setErrors(prev => ({ 
        ...prev, 
        aiAnalysis: `AI analysis failed: ${error.message}. You can continue filling out the form manually.` 
      }));
      
      // Show error toast with recovery guidance
      toast.error('AI analysis failed', {
        id: toastId,
        description: 'No worries! You can fill in the purchase details manually and continue.'
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
        studentErrors.soloCategories = 'A program plan category is required';
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

    // Manual validation check for low-quality receipts (only if AI analysis succeeded)
    if (receiptAnalysis && !aiAnalysisFailed && receiptAnalysis.validationScore < 50) {
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
      const claimRef = push(ref(db, `homeEducationFamilies/familyInformation/${familyId}/REIMBURSEMENT_CLAIMS/${dbSchoolYear}`));
      
      const claimData = {
        claimId: claimRef.key,
        familyId: familyId,
        schoolYear: selectedSchoolYear,
        
        purchaseInfo: {
          date: formData.purchaseDate,
          vendor: formData.vendor,
          totalAmount: parseFloat(formData.totalAmount),
          description: formData.description
        },
        
        receipts: formData.receipts,
        
        // AI Analysis Results
        aiAnalysis: receiptAnalysis || null,
        
        // Manual Validation (if required for low-quality receipts)
        manualValidationNotes: formData.manualValidationNotes?.trim() || null,
        
        // Review flags for staff
        requiresManualReview: receiptAnalysis?.requiresManualReview || receiptAnalysis?.validationScore < 50 || manualEntryEnabled || receiptAnalysis?.categoryMismatchWarning || false,
        reviewPriority: manualEntryEnabled ? 'high' : 
                       receiptAnalysis?.categoryMismatchWarning ? 'high' : // High priority if no categories match
                       (receiptAnalysis?.reviewPriority || (receiptAnalysis?.validationScore < 30 ? 'high' : receiptAnalysis?.validationScore < 70 ? 'medium' : 'low')),
        
        // Manual entry information
        hasManualOverrides: manualEntryEnabled,
        manualEntryReason: manualEntryEnabled ? manualEntryReason : null,
        
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
        purchaseDate: '',
        vendor: '',
        totalAmount: '',
        description: '',
        receipts: [],
        manualValidationNotes: ''
      });
      setStudentAllocations({});
      setSelectedStudents(new Set());
      
      // Reset workflow states
      setHasUploadedReceipt(false);
      setUserHasOverridden({
        purchaseDate: false,
        vendor: false,
        totalAmount: false,
        description: false
      });
      setReceiptAnalysis(null);
      setShowAnalysisResults(false);
      setAiAnalysisFailed(false);
      
      // Reset manual entry states
      setManualEntryEnabled(false);
      setManualEntryReason('');
      setShowManualEntryModal(false);
      
      // Reset mixed receipt states
      setIsMixedReceipt(false);
      setSelectedEducationalItems(new Set());
      setMixedReceiptAnalysis(null);

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
  
  // Step completion logic
  const isStep1Complete = hasUploadedReceipt;
  const isStep2Complete = hasUploadedReceipt && (Object.values(userHasOverridden).some(Boolean) || showAnalysisResults);
  const canProceedToStep3 = isStep1Complete && isStep2Complete;

  // Helper function for receipt quality
  const getScoreMessage = (score) => {
    if (score >= 80) return 'High quality receipt - all information extracted';
    if (score >= 50) return 'Partial extraction - please verify details';
    return 'Poor quality - manual entry recommended';
  };
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
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

  // Check if all required student fields are filled
  const areStudentFieldsComplete = () => {
    // If no students selected, fields are not complete
    if (selectedStudents.size === 0) return false;
    
    // Check each selected student
    for (const studentId of selectedStudents) {
      const allocation = studentAllocations[studentId];
      
      // Check if allocation exists and has required fields
      if (!allocation) return false;
      if (!allocation.percentage || allocation.percentage <= 0) return false;
      if (!allocation.soloCategories || allocation.soloCategories.length === 0) return false;
      if (!allocation.categoryJustification || allocation.categoryJustification.trim() === '') return false;
    }
    
    return true;
  };

  const studentFieldsComplete = areStudentFieldsComplete();

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
        <div className="relative group w-16 h-16">
          <img
            src={receipt.fileUrl}
            alt={receipt.fileName}
            className="w-full h-full object-cover rounded-lg border border-purple-200 cursor-pointer hover:border-purple-400 transition-colors"
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
          className="relative w-16 h-16 bg-red-100 border border-red-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-200 transition-colors group"
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
    <>
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

        {/* Under Construction Notice or Form */}
        {!isUnlocked ? (
          <div className="mt-6 space-y-6">
            {/* Under Construction Message */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-8 text-center">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-amber-900 mb-3">
                  Receipt Upload System Under Construction
                </h2>
                <p className="text-lg text-amber-800 mb-4">
                  We're excited to announce that receipt uploads will be available soon!
                </p>
                <div className="bg-white border border-amber-200 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
                  <h3 className="font-semibold text-amber-900 mb-2">Important Information:</h3>
                  <ul className="text-left space-y-2 text-amber-700">
                    <li className="flex items-start">
                      <Calendar className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
                      <span>Receipt upload functionality will be ready in the coming weeks</span>
                    </li>
                    <li className="flex items-start">
                      <DollarSign className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
                      <span><strong>Reimbursement payments cannot be issued until after October 31st</strong> when we receive funding from Alberta Education</span>
                    </li>
                    <li className="flex items-start">
                      <Info className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-amber-600" />
                      <span>Please save your receipts - you'll be able to upload them once the system is ready</span>
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-amber-600 italic">
                  Thank you for your patience as we prepare this feature for you!
                </p>
              </div>
            </div>

            {/* Developer Access (Hidden Password Field) */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="max-w-xs mx-auto">
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && passwordInput === UNLOCK_PASSWORD) {
                        setIsUnlocked(true);
                      }
                    }}
                    placeholder="Developer access"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {passwordInput === UNLOCK_PASSWORD && (
                    <button
                      type="button"
                      onClick={() => setIsUnlocked(true)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Developer Mode Banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800 font-medium">
                  Developer Mode - Testing Environment Only
                </p>
              </div>
            </div>

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

          {/* Workflow Steps Indicator */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-3 text-center">Complete Your Claim in 3 Easy Steps</h3>
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {/* Step 1: Upload Receipt */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  hasUploadedReceipt 
                    ? 'bg-green-500 text-white' 
                    : 'bg-purple-500 text-white'
                }`}>
                  {hasUploadedReceipt ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </div>
                <div className="text-center mt-2">
                  <p className={`text-sm font-medium ${hasUploadedReceipt ? 'text-green-700' : 'text-purple-700'}`}>
                    Upload Receipt
                  </p>
                  <p className="text-xs text-gray-600">
                    {hasUploadedReceipt ? 'Receipt uploaded!' : 'Start here'}
                  </p>
                </div>
              </div>
              
              {/* Connector */}
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              
              {/* Step 2: Review Details */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isStep2Complete
                    ? 'bg-green-500 text-white'
                    : isStep1Complete
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {isStep2Complete ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </div>
                <div className="text-center mt-2">
                  <p className={`text-sm font-medium ${
                    isStep2Complete 
                      ? 'text-green-700' 
                      : isStep1Complete
                        ? 'text-purple-700'
                        : 'text-gray-500'
                  }`}>
                    Review Details
                  </p>
                  <p className="text-xs text-gray-600">
                    {!isStep1Complete 
                      ? 'Waiting...'
                      : analyzingReceipt 
                        ? 'AI is analyzing...'
                        : isStep2Complete
                          ? 'Details ready!'
                          : 'Fill in details'
                    }
                  </p>
                </div>
              </div>
              
              {/* Connector */}
              <div className="flex-1 h-px bg-gray-300 mx-4"></div>
              
              {/* Step 3: Allocate to Students */}
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedStudents.size > 0 && isPercentageValid && canProceedToStep3
                    ? 'bg-green-500 text-white'
                    : canProceedToStep3
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {(selectedStudents.size > 0 && isPercentageValid && canProceedToStep3) ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                </div>
                <div className="text-center mt-2">
                  <p className={`text-sm font-medium ${
                    selectedStudents.size > 0 && isPercentageValid && canProceedToStep3
                      ? 'text-green-700'
                      : canProceedToStep3
                        ? 'text-purple-700'
                        : 'text-gray-500'
                  }`}>
                    Allocate to Students
                  </p>
                  <p className="text-xs text-gray-600">
                    {!canProceedToStep3
                      ? 'Waiting...'
                      : selectedStudents.size > 0 && isPercentageValid
                        ? 'Ready to submit!'
                        : 'Select students'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Upload - Moved to Top */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                hasUploadedReceipt ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'
              }`}>
                {hasUploadedReceipt ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </div>
              <Upload className="w-5 h-5 mr-2" />
              Step 1: Upload Your Receipt
            </h3>
            
            <FormField label="Upload Receipt" error={errors.receipts} required>
              <div className="space-y-4">
                {/* Uploaded Receipt - Show at top when uploaded */}
                {formData.receipts.length > 0 && (
                  <div className="space-y-3">
                    {/* Receipt Card - Show first */}
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
                              <div className="flex items-center space-x-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewReceipt(receipt);
                                    setShowPreviewModal(true);
                                  }}
                                  className="text-xs text-purple-600 hover:text-purple-800 underline flex items-center"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Preview
                                </button>
                                <span className="text-xs text-gray-400">•</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    // Clear all receipt-related data
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      receipts: [],
                                      purchaseDate: '',
                                      vendor: '',
                                      totalAmount: '',
                                      description: ''
                                    }));
                                    setReceiptAnalysis(null);
                                    setShowAnalysisResults(false);
                                    setHasUploadedReceipt(false);
                                    setSelectedStudentId('');
                                    setStudentAllocations({});
                                    setMixedReceiptAnalysis(null);
                                    setSelectedEducationalItems(new Set());
                                    setIsMixedReceipt(false);
                                    setManualEntryEnabled(false);
                                    setManualEntryReason('');
                                    setShowManualEntryModal(false);
                                    setAiAnalysisFailed(false);
                                    setUserHasOverridden({
                                      purchaseDate: false,
                                      vendor: false,
                                      totalAmount: false,
                                      description: false
                                    });
                                  }}
                                  className="text-xs text-gray-500 hover:text-red-600 underline flex items-center"
                                  title="Clear receipt and start over"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Clear
                                </button>
                              </div>
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
                    
                    {/* Receipt Type Selector - Only show before AI analysis */}
                    {!analyzingReceipt && !showAnalysisResults && (
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          Tell us about your receipt
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="single-receipt"
                              name="receiptType"
                              checked={!isMixedReceipt}
                              onChange={() => {
                                setIsMixedReceipt(false);
                                setMixedReceiptAnalysis(null);
                                setSelectedEducationalItems(new Set());
                              }}
                              className="mt-1 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <label htmlFor="single-receipt" className="block text-sm font-medium text-purple-800 cursor-pointer">
                                Single educational purchase
                              </label>
                              <p className="text-xs text-purple-600 mt-1">
                                Everything on this receipt is for educational purposes (books, art supplies, etc.)
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <input
                              type="radio"
                              id="mixed-receipt"
                              name="receiptType"
                              checked={isMixedReceipt}
                              onChange={() => {
                                setIsMixedReceipt(true);
                                setReceiptAnalysis(null);
                                setShowAnalysisResults(false);
                              }}
                              className="mt-1 h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <label htmlFor="mixed-receipt" className="block text-sm font-medium text-purple-800 cursor-pointer">
                                Mixed purchase (educational + other items)
                              </label>
                              <p className="text-xs text-purple-600 mt-1">
                                This receipt has both educational items AND other items (groceries, personal items, etc.)
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {isMixedReceipt && (
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>Mixed Receipt Mode:</strong> AI will analyze each item individually and help you select only the educational items for reimbursement.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Analyze with AI Button - Full Width */}
                    {!analyzingReceipt && !showAnalysisResults && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            // Start analysis with the selected receipt type
                            if (formData.receipts.length > 0) {
                              analyzeReceiptWithAI(formData.receipts[0]);
                            }
                          }}
                          disabled={formData.receipts.length === 0 || analyzingReceipt}
                          className={`w-full px-4 py-3 text-sm font-medium rounded-md transition-colors flex items-center justify-center ${
                            formData.receipts.length === 0 || analyzingReceipt
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500'
                          }`}
                        >
                          {analyzingReceipt ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Analyze with AI
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
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
              </div>
            </FormField>
          </div>

          {/* Step 2: Purchase Information */}
          <div className={`border rounded-lg p-4 ${
            isStep1Complete 
              ? 'bg-purple-50 border-purple-200' 
              : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-semibold flex items-center ${
                isStep1Complete ? 'text-purple-900' : 'text-gray-600'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                  isStep2Complete 
                    ? 'bg-green-500 text-white'
                    : isStep1Complete
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {isStep2Complete ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </div>
                <FileText className="w-5 h-5 mr-2" />
                Step 2: Purchase Information
                {(analyzingReceipt || !isStep1Complete) && (
                  <span className="ml-2 text-sm font-normal">
                    {analyzingReceipt 
                      ? '(AI is analyzing...)' 
                      : '(Upload receipt first)'
                    }
                  </span>
                )}
              </h3>
              {analyzingReceipt && (
                <div className="flex items-center space-x-2 text-sm text-purple-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is extracting data...</span>
                </div>
              )}
            </div>
            
            {/* Step 2 Content */}
            {!isStep1Complete ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">Purchase Information Locked</h4>
                  <p className="text-sm text-gray-500">
                    Upload a receipt in Step 1 to continue
                  </p>
                </div>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className={`flex items-center justify-center ${isStep1Complete ? 'text-green-600' : 'text-gray-500'}`}>
                    {isStep1Complete ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <span className="w-6 h-4 flex items-center justify-center mr-2">1.</span>}
                    Upload receipt to continue
                  </div>
                </div>
              </div>
            ) : (
              <>
                {analyzingReceipt && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      <Info className="w-4 h-4 inline mr-2" />
                      AI is analyzing your receipt and extracting purchase information...
                    </p>
                  </div>
                )}
                
                {aiAnalysisFailed && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800 mb-2">
                          {errors.aiAnalysis}
                        </p>
                        <div className="text-xs text-red-700">
                          <p className="mb-1"><strong>What to do:</strong></p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>You can continue filling out the form manually</li>
                            <li>Try uploading a clearer photo of your receipt</li>
                            <li>Make sure the receipt shows all key information clearly</li>
                            <li>Contact support if the problem persists</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Purchase Date and Vendor Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Purchase Date" error={errors.purchaseDate} required>
                    <input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                      disabled={!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        (!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled))
                          ? 'bg-gray-100 cursor-not-allowed'
                          : ''
                      } ${
                        errors.purchaseDate 
                          ? 'border-red-300' 
                          : userHasOverridden.purchaseDate
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300'
                      }`}
                      placeholder={!hasUploadedReceipt ? "Upload receipt first" : analyzingReceipt ? "Analyzing..." : "Select date"}
                    />
                  </FormField>

                  <FormField label="Vendor/Store" error={errors.vendor} required>
                    <input
                      type="text"
                      value={formData.vendor}
                      onChange={(e) => handleInputChange('vendor', e.target.value)}
                      disabled={!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        (!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled))
                          ? 'bg-gray-100 cursor-not-allowed'
                          : ''
                      } ${
                        errors.vendor 
                          ? 'border-red-300' 
                          : userHasOverridden.vendor
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300'
                      }`}
                      placeholder={!hasUploadedReceipt ? "Upload receipt first" : analyzingReceipt ? "AI is analyzing..." : "e.g., Amazon, Staples, Local Bookstore"}
                    />
                  </FormField>

                  <FormField label="Total Amount" error={errors.totalAmount} required>
                    <div className="relative">
                      <span className={`absolute left-3 top-2 ${(!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled)) ? 'text-gray-400' : 'text-gray-500'}`}>$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.totalAmount}
                        onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                        disabled={!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled)}
                        className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          (!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled))
                            ? 'bg-gray-100 cursor-not-allowed'
                            : ''
                        } ${
                          errors.totalAmount 
                            ? 'border-red-300' 
                            : userHasOverridden.totalAmount
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-300'
                        }`}
                        placeholder={!hasUploadedReceipt ? "Upload receipt first" : analyzingReceipt ? "Analyzing..." : "0.00"}
                      />
                    </div>
                  </FormField>
                </div>
                
                {/* Description field - full width below other fields */}
                <div className="mt-4">
                  <FormField 
                    label="Description" 
                    error={errors.description} 
                    required
                    description="Brief description of what was purchased (you can edit this after AI analysis)"
                  >
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        (!hasUploadedReceipt || analyzingReceipt || (hasUploadedReceipt && !manualEntryEnabled))
                          ? 'bg-gray-100 cursor-not-allowed'
                          : ''
                      } ${
                        errors.description 
                          ? 'border-red-300' 
                          : userHasOverridden.description
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300'
                      }`}
                      rows={3}
                      placeholder={!hasUploadedReceipt ? "Upload receipt first" : analyzingReceipt ? "AI is analyzing..." : "e.g., Science equipment and art supplies for Grade 5 curriculum. Includes beakers, test tubes, watercolor paints, and sketch pads."}
                    />
                  </FormField>
                </div>
              </>
            )}
          </div>

          {/* Mixed Receipt Analysis Results */}
          {showAnalysisResults && mixedReceiptAnalysis && isMixedReceipt && (
                  <div className="mt-4 space-y-4">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                        <Calculator className="w-4 h-4 mr-2" />
                        Mixed Receipt Analysis - Item Breakdown
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-blue-600 font-medium">Total Items</p>
                          <p className="text-lg font-bold text-blue-900">{mixedReceiptAnalysis.items?.length || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-green-600 font-medium">Educational</p>
                          <p className="text-lg font-bold text-green-900">
                            {mixedReceiptAnalysis.items?.filter(item => item.isEducational)?.length || 0}
                          </p>
                          <p className="text-xs text-green-600">${(mixedReceiptAnalysis.educationalTotal || 0).toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600 font-medium">Non-Educational</p>
                          <p className="text-lg font-bold text-gray-900">
                            {mixedReceiptAnalysis.items?.filter(item => !item.isEducational)?.length || 0}
                          </p>
                          <p className="text-xs text-gray-600">${(mixedReceiptAnalysis.nonEducationalTotal || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Item Selection Table */}
                    {mixedReceiptAnalysis.items && mixedReceiptAnalysis.items.length > 0 && (
                      <div className="bg-white border border-purple-200 rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-purple-50 border-b border-purple-200">
                          <h5 className="text-sm font-semibold text-purple-900 flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Select Educational Items to Claim
                          </h5>
                          <p className="text-xs text-purple-600 mt-1">
                            Check only the items that are for educational purposes. The total amount will update automatically.
                          </p>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                                  Claim
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Item Description
                                </th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                  Amount
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                  Educational
                                </th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                  Confidence
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {mixedReceiptAnalysis.items.map((item, index) => (
                                <tr 
                                  key={index}
                                  className={`hover:bg-gray-50 ${
                                    selectedEducationalItems.has(index) ? 'bg-green-50' : ''
                                  }`}
                                >
                                  <td className="px-4 py-3">
                                    <input
                                      type="checkbox"
                                      checked={selectedEducationalItems.has(index)}
                                      onChange={(e) => {
                                        const newSelected = new Set(selectedEducationalItems);
                                        if (e.target.checked) {
                                          newSelected.add(index);
                                        } else {
                                          newSelected.delete(index);
                                        }
                                        setSelectedEducationalItems(newSelected);
                                        
                                        // Update total amount based on selected items
                                        const selectedTotal = mixedReceiptAnalysis.items
                                          .filter((_, idx) => newSelected.has(idx))
                                          .reduce((sum, item) => sum + (item.amount || 0), 0);
                                        handleInputChange('totalAmount', selectedTotal.toFixed(2), true);
                                      }}
                                      className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.description}
                                      </p>
                                      {item.complianceReasoning && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {item.complianceReasoning}
                                        </p>
                                      )}
                                      {item.educationCategory && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1 w-fit">
                                          {item.educationCategory.replace(/_/g, ' ')}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <span className="text-sm font-medium text-gray-900">
                                      ${(item.amount || 0).toFixed(2)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      item.isEducational 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {item.isEducational ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-8 h-2 rounded-full ${
                                        (item.confidence || 0) >= 0.8 ? 'bg-green-400' :
                                        (item.confidence || 0) >= 0.6 ? 'bg-yellow-400' :
                                        'bg-red-400'
                                      }`}></div>
                                      <span className="text-xs text-gray-500 mt-1">
                                        {Math.round((item.confidence || 0) * 100)}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Selection Summary */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button
                                type="button"
                                onClick={() => {
                                  const educationalIndices = new Set(
                                    mixedReceiptAnalysis.items
                                      .map((item, index) => item.isEducational ? index : null)
                                      .filter(index => index !== null)
                                  );
                                  setSelectedEducationalItems(educationalIndices);
                                  
                                  const educationalTotal = mixedReceiptAnalysis.items
                                    .filter(item => item.isEducational)
                                    .reduce((sum, item) => sum + (item.amount || 0), 0);
                                  handleInputChange('totalAmount', educationalTotal.toFixed(2), true);
                                }}
                                className="text-xs text-green-600 hover:text-green-800 underline"
                              >
                                Select All Educational
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedEducationalItems(new Set());
                                  handleInputChange('totalAmount', '0.00', true);
                                }}
                                className="text-xs text-gray-600 hover:text-gray-800 underline"
                              >
                                Clear All
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                Selected: ${
                                  mixedReceiptAnalysis.items
                                    ?.filter((_, idx) => selectedEducationalItems.has(idx))
                                    ?.reduce((sum, item) => sum + (item.amount || 0), 0)
                                    ?.toFixed(2) || '0.00'
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                {selectedEducationalItems.size} of {mixedReceiptAnalysis.items?.length || 0} items
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Standard Receipt Analysis Results */}
                {showAnalysisResults && receiptAnalysis && !isMixedReceipt && (
                  <div className="mt-4 space-y-3">
                    {/* Detailed Extraction Results */}
                    <div className="p-4 bg-white border border-purple-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold text-purple-900 flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          Receipt Analysis Results
                        </h4>
                        <p className={`text-xs font-medium ${getScoreColor(receiptAnalysis.validationScore)}`}>
                          {getScoreMessage(receiptAnalysis.validationScore)}
                        </p>
                      </div>
                      
                      {/* Validation Issues if any */}
                      {receiptAnalysis.validationIssues && receiptAnalysis.validationIssues.length > 0 && (
                        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-xs font-medium text-yellow-800 mb-1">Quality issues detected:</p>
                          <ul className="text-xs text-yellow-700 space-y-0.5">
                            {receiptAnalysis.validationIssues.map((issue, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{issue}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
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
                              <span className="text-green-700 font-semibold flex items-center">
                                {receiptAnalysis.vendor}
                                <CheckCircle2 className="w-4 h-4 ml-1" />
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold flex items-center">
                                Not found
                                <X className="w-4 h-4 ml-1" />
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
                              <span className="text-green-700 font-semibold flex items-center">
                                ${receiptAnalysis.totalAmount.toFixed(2)}
                                <CheckCircle2 className="w-4 h-4 ml-1" />
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold flex items-center">
                                Not found
                                <X className="w-4 h-4 ml-1" />
                              </span>
                            )}
                            {receiptAnalysis.confidence && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {Math.round(receiptAnalysis.confidence.amount * 100)}% confident
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
                              <span className="text-green-700 font-semibold flex items-center">
                                {receiptAnalysis.purchaseDate}
                                <CheckCircle2 className="w-4 h-4 ml-1" />
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold flex items-center">
                                Not found
                                <X className="w-4 h-4 ml-1" />
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
                              <span className="text-green-700 font-semibold flex items-center">
                                {receiptAnalysis.purchaseDescription}
                                <CheckCircle2 className="w-4 h-4 ml-1" />
                              </span>
                            ) : (
                              <span className="text-red-600 font-semibold flex items-center">
                                Not detected
                                <X className="w-4 h-4 ml-1" />
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
                                <span>
                                  {typeof item === 'string' ? item : 
                                   item.description ? `${item.description}${item.quantity > 1 ? ` (x${item.quantity})` : ''}${item.lineTotal ? ` - $${item.lineTotal}` : ''}` : 
                                   'Unknown item'}
                                </span>
                              </li>
                            ))}
                            {receiptAnalysis.items.length > 5 && (
                              <li className="text-purple-500 italic">...and {receiptAnalysis.items.length - 5} more items</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Education Compliance Assessment */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Alberta Education Standards Compliance
                      </h4>
                      
                      {/* Category */}
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                         
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            receiptAnalysis.educationCategory === 'recommended' ? 'bg-green-100 text-green-700' :
                            receiptAnalysis.educationCategory === 'not-recommended' ? 'bg-red-100 text-red-700' :
                            receiptAnalysis.educationCategory === 'requires-review' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {receiptAnalysis.educationCategory === 'recommended' ? 'Recommended for Reimbursement' :
                             receiptAnalysis.educationCategory === 'not-recommended' ? 'Not Recommended' :
                             receiptAnalysis.educationCategory === 'requires-review' ? 'Requires Manual Review' :
                             'Unclear - Needs Assessment'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Reasoning */}
                      {receiptAnalysis.educationReasoning && (
                        <div className="p-3 bg-white bg-opacity-60 rounded-md">
                          <p className="text-sm font-medium text-green-800 mb-1">Assessment Reasoning:</p>
                          <p className="text-sm text-green-700">{receiptAnalysis.educationReasoning}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Manual Entry Button */}
                    {showAnalysisResults && !manualEntryEnabled && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-orange-900 mb-1">
                              Need to correct AI-extracted information?
                            </h4>
                            <p className="text-sm text-orange-700">
                              The AI has extracted purchase details. If any information is incorrect, you can enable manual editing.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowManualEntryModal(true)}
                            className="ml-4 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center whitespace-nowrap"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Edit Manually
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Manual Entry Active Banner */}
                    {manualEntryEnabled && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">
                              Manual Entry Mode Active
                            </h4>
                            <p className="text-sm text-blue-700 mb-2">
                              You can now edit the purchase information. This claim will be flagged for staff review.
                            </p>
                            <div className="bg-blue-100 p-2 rounded text-sm text-blue-800">
                              <strong>Reason:</strong> {manualEntryReason}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* User Override Indicators */}
                    {showAnalysisResults && Object.values(userHasOverridden).some(Boolean) && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Manual Overrides Active
                        </h4>
                        <div className="text-sm text-blue-800">
                          <p className="mb-2">You have manually edited the following fields:</p>
                          <div className="flex flex-wrap gap-2">
                            {userHasOverridden.purchaseDate && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Purchase Date
                              </span>
                            )}
                            {userHasOverridden.vendor && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Vendor
                              </span>
                            )}
                            {userHasOverridden.totalAmount && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Total Amount
                              </span>
                            )}
                            {userHasOverridden.description && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                Description
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-blue-600 mt-2">
                            Your manual entries will be used instead of AI suggestions.
                          </p>
                        </div>
                      </div>
                    )}
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
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-red-800 mb-2">
                          {errors.aiAnalysis}
                        </p>
                        <div className="text-xs text-red-700">
                          <p className="mb-1"><strong>What to do:</strong></p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>You can continue filling out the form manually</li>
                            <li>Try uploading a clearer photo of your receipt</li>
                            <li>Make sure the receipt shows all key information clearly</li>
                            <li>Contact support if the problem persists</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


          {/* Student Allocation */}
          <div className={`border rounded-lg p-4 ${
            canProceedToStep3 
              ? 'bg-purple-50 border-purple-200' 
              : 'bg-gray-50 border-gray-200 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold flex items-center ${
                canProceedToStep3 ? 'text-purple-900' : 'text-gray-600'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                  selectedStudents.size > 0 && isPercentageValid && canProceedToStep3
                    ? 'bg-green-500 text-white'
                    : canProceedToStep3
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                }`}>
                  {(selectedStudents.size > 0 && isPercentageValid && canProceedToStep3) ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                </div>
                <Calculator className="w-5 h-5 mr-2" />
                Step 3: Student Allocation
                {(analyzingReceipt || !canProceedToStep3) && (
                  <span className="ml-2 text-sm font-normal">
                    {analyzingReceipt 
                      ? '(Disabled during AI analysis)' 
                      : '(Locked)'
                    }
                  </span>
                )}
              </h3>
              <div className={`text-sm font-medium ${
                isPercentageValid ? 'text-green-600' : 'text-red-600'
              }`}>
                Total: {totalAllocatedPercentage.toFixed(1)}%
                {isPercentageValid && <CheckCircle2 className="w-4 h-4 ml-1 inline" />} {!isPercentageValid && ' (needs to be 100%)'}
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

            {/* Step 3 Content */}
            {!canProceedToStep3 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">Student Allocation Locked</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Complete the previous steps before allocating funds to students.
                  </p>
                </div>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className={`flex items-center justify-center ${isStep1Complete ? 'text-green-600' : 'text-gray-500'}`}>
                    {isStep1Complete ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <span className="w-6 h-4 flex items-center justify-center mr-2">1.</span>}
                    Upload receipt
                  </div>
                  <div className={`flex items-center justify-center ${isStep2Complete ? 'text-green-600' : 'text-gray-500'}`}>
                    {isStep2Complete ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <span className="w-6 h-4 flex items-center justify-center mr-2">2.</span>}
                    Complete purchase information (via AI analysis or manual entry)
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(() => {
                  // Filter students who have program plans for this school year
                  const studentsWithSOLO = familyData?.students?.filter(student => 
                    studentSOLOPlans[student.id] && studentSOLOPlans[student.id].length > 0
                  ) || [];
                  
                  const studentsWithoutSOLO = familyData?.students?.filter(student => 
                    !studentSOLOPlans[student.id] || studentSOLOPlans[student.id].length === 0
                  ) || [];

                  // Handler for distribute evenly button
                  const handleDistributeEvenly = () => {
                    if (studentsWithSOLO.length === 0 || analyzingReceipt) return;
                    
                    const equalPercentage = (100 / studentsWithSOLO.length).toFixed(1);
                    const totalAmount = parseFloat(formData.totalAmount) || 0;
                    
                    // Create new set with all student IDs
                    const allStudentIds = new Set(studentsWithSOLO.map(s => s.id));
                    setSelectedStudents(allStudentIds);
                    
                    // Create allocations for all students
                    const newAllocations = {};
                    studentsWithSOLO.forEach((student) => {
                      newAllocations[student.id] = {
                        studentId: student.id,
                        studentName: `${student.firstName} ${student.lastName}`,
                        percentage: parseFloat(equalPercentage),
                        amount: (parseFloat(equalPercentage) / 100) * totalAmount,
                        totalAmount: totalAmount,
                        soloCategories: studentAllocations[student.id]?.soloCategories || [],
                        categoryJustification: studentAllocations[student.id]?.categoryJustification || ''
                      };
                    });
                    
                    // Update all allocations at once
                    setStudentAllocations(prev => ({
                      ...prev,
                      ...newAllocations
                    }));
                    
                    toast.success(`Distributed evenly among ${studentsWithSOLO.length} students (${equalPercentage}% each)`);
                  };

                  return (
                    <>
                      {studentsWithSOLO.length > 0 && (
                        <>
                          {/* Distribute Evenly Toolbar */}
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Calculator className="w-4 h-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-900">Quick Actions</span>
                              </div>
                              <button
                                type="button"
                                onClick={handleDistributeEvenly}
                                disabled={analyzingReceipt || !formData.totalAmount || studentsWithSOLO.length === 0}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center space-x-2 ${
                                  analyzingReceipt || !formData.totalAmount || studentsWithSOLO.length === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                }`}
                              >
                                <Sparkles className="w-4 h-4" />
                                <span>Distribute Evenly ({studentsWithSOLO.length} students)</span>
                              </button>
                            </div>
                            {!formData.totalAmount && (
                              <p className="text-xs text-orange-600 mt-2">
                                <AlertCircle className="w-3 h-3 inline mr-1" />
                                Enter the total amount first to use this feature
                              </p>
                            )}
                          </div>
                          
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
                              analyzingReceipt={analyzingReceipt}
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
            )}
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

          {!studentFieldsComplete && selectedStudents.size > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Incomplete Student Information:</strong> Please fill in all required fields (percentage, category, and justification) for each selected student.
              </p>
            </div>
          )}

          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || uploadingFiles || !isPercentageValid || hasViolations || !studentFieldsComplete}
              className={`w-full py-3 px-4 border border-transparent rounded-md text-white font-medium ${
                isSubmitting || uploadingFiles || !isPercentageValid || hasViolations || !studentFieldsComplete
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting Claim...
                </>
              ) : analyzingReceipt ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse mr-2" />
                  Submit Reimbursement Claim (AI Still Processing)
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Reimbursement Claim
                </>
              )}
            </button>
            
            {analyzingReceipt && (
              <p className="text-sm text-gray-600 text-center mt-2">
                You can submit now or wait for AI analysis to complete
              </p>
            )}
          </div>
        </form>
        )}
        
      </SheetContent>
    </Sheet>

    {/* Receipt Preview Sheet */}
    <Sheet open={showPreviewModal} onOpenChange={setShowPreviewModal}>
      <SheetContent side="right" className="w-full sm:w-[90vw] max-w-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <span>Receipt Preview</span>
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            {previewReceipt?.fileName || 'Receipt preview'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          {previewReceipt && (() => {
            const isImage = previewReceipt.fileType?.startsWith('image/') || false;
            const isPDF = previewReceipt.fileType === 'application/pdf' || false;

            if (isImage) {
              return (
                <div className="text-center">
                  <img
                    src={previewReceipt.fileUrl}
                    alt={previewReceipt.fileName}
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200"
                    style={{ maxHeight: 'calc(90vh - 200px)' }}
                  />
                  <p className="text-sm text-gray-600 mt-4">
                    <strong>File:</strong> {previewReceipt.fileName} • {formatFileSize(previewReceipt.fileSize)}
                  </p>
                </div>
              );
            } else if (isPDF) {
              return (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">{previewReceipt.fileName}</p>
                        <p className="text-sm text-red-600">PDF • {formatFileSize(previewReceipt.fileSize)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <iframe
                      src={previewReceipt.fileUrl}
                      title={previewReceipt.fileName}
                      className="w-full rounded-lg shadow-sm border border-gray-200"
                      style={{ height: 'calc(90vh - 250px)', minHeight: '500px' }}
                    />
                    <p className="text-sm text-gray-600 mt-4">
                      <a 
                        href={previewReceipt.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 underline font-medium"
                      >
                        Open PDF in new tab →
                      </a>
                    </p>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Preview not available for this file type</p>
                  <p className="text-sm text-gray-500 mb-4">
                    <strong>File:</strong> {previewReceipt.fileName} • {formatFileSize(previewReceipt.fileSize)}
                  </p>
                  <a 
                    href={previewReceipt.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download file to view
                  </a>
                </div>
              );
            }
          })()}
        </div>
      </SheetContent>
    </Sheet>

    {/* Manual Entry Confirmation Modal */}
    <Sheet open={showManualEntryModal} onOpenChange={setShowManualEntryModal}>
      <SheetContent side="right" className="w-full sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="text-left">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <span>Enable Manual Entry</span>
            </div>
          </SheetTitle>
          <SheetDescription className="text-left">
            Manual changes will flag your claim for staff review and may delay processing.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notice</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Manual changes will be reviewed by staff before approval</li>
                  <li>• This may increase processing time for your claim</li>
                  <li>• Only edit if the AI extracted incorrect information</li>
                  <li>• You must provide a reason for the changes</li>
                </ul>
              </div>
            </div>
          </div>

          <FormField 
            label="Reason for Manual Changes" 
            error="" 
            required
            description="Please explain why you need to modify the AI-extracted information"
          >
            <textarea
              value={manualEntryReason}
              onChange={(e) => setManualEntryReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows={4}
              placeholder="e.g., AI incorrectly read the date as 2023 but it's actually 2024, or AI missed the tax amount..."
            />
          </FormField>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowManualEntryModal(false);
                setManualEntryReason('');
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (manualEntryReason.trim().length >= 10) {
                  setManualEntryEnabled(true);
                  setShowManualEntryModal(false);
                } else {
                  // Could add error handling here
                  alert('Please provide a detailed reason (at least 10 characters)');
                }
              }}
              disabled={manualEntryReason.trim().length < 10}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enable Manual Entry
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
};

export default ReceiptUploadForm;