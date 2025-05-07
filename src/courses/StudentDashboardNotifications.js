import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, get, set, push, remove, update } from 'firebase/database';
import { toast } from 'sonner';
import { filterStudentsByNotificationConditions } from '../utils/notificationFilterUtils';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter,
  CardDescription
} from '../components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator
} from "../components/ui/dropdown-menu";
import { 
  Alert, 
  AlertDescription,
  AlertTitle 
} from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from '../components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../components/ui/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Save, 
  Calendar,
  CalendarClock,
  BellRing,
  CheckCircle,
  Eye,
  EyeOff,
  Edit,
  Filter,
  FileText,
  RefreshCw,
  MessageSquare,
  Users,
  ClipboardList,
  HelpCircle,
  PlusCircle,
  X,
  Circle,
  UsersRound,
  MailPlus,
  ChevronDown,
  Grid2X2,
  Square,
  Triangle,
  GraduationCap,
  Trophy,
  Target,
  Brain,
  Lightbulb,
  Clock,
  TrendingUp,
  AlertCircle,
  Presentation,
  Bookmark,
  Star,
  BarChart,
  Search
} from 'lucide-react';
import { 
  STUDENT_TYPE_OPTIONS,
  DIPLOMA_MONTH_OPTIONS,
  COURSE_OPTIONS,
  ACTIVE_FUTURE_ARCHIVED_OPTIONS,
  getSchoolYearOptions
} from '../config/DropdownOptions';
import { useSchoolYear } from '../context/SchoolYearContext';
import StudentMessaging from '../StudentManagement/StudentMessaging';
import StudentSelectionDialog from './StudentSelectionDialog';

// Enhanced Quill editor modules and formats configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ],
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'script',
  'color', 'background',
  'link'
];

// Background colors for accordion styling
const ACCORDION_COLORS = [
  'bg-blue-50',
  'bg-emerald-50', 
  'bg-purple-50',
  'bg-amber-50',
  'bg-rose-50',
  'bg-cyan-50',
  'bg-lime-50'
];

// Map of category icons to Lucide components
const iconMap = {
  'circle': Circle,
  'square': Square,
  'triangle': Triangle,
  'book-open': FileText,
  'graduation-cap': GraduationCap,
  'trophy': Trophy,
  'target': Target,
  'clipboard-check': ClipboardList,
  'brain': Brain,
  'lightbulb': Lightbulb,
  'clock': Clock,
  'calendar': Calendar,
  'bar-chart': BarChart,
  'trending-up': TrendingUp,
  'alert-circle': AlertCircle,
  'help-circle': HelpCircle,
  'message-circle': MessageSquare,
  'users': UsersRound,
  'presentation': Presentation,
  'file-text': FileText,
  'bookmark': Bookmark,
  'star': Star,
  'grid-2x2': Grid2X2,
};

// Save Confirmation Dialog Component
const SaveConfirmationDialog = ({ open, onOpenChange, onEmailStudents, onJustSave, matchingStudentCount }) => {
  // Use a custom onOpenChange handler that prevents closing by clicking outside or pressing escape
  const handleOpenChange = (isOpen) => {
    // Only allow the dialog to close through the button actions
    if (isOpen === false) {
      return; // Prevent closing
    }
    onOpenChange(isOpen);
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
          onPointerDownOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Notification Saved Successfully</DialogTitle>
            <DialogDescription>
              Your notification has been saved. Would you like to email these {matchingStudentCount} matching students now?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Opening the email editor will allow you to compose and send an email to all students who match this notification's criteria.
            </p>
          </div>
          <DialogFooter className="flex sm:justify-between">
            <Button variant="outline" onClick={onJustSave}>
              Just Save
            </Button>
            <Button onClick={onEmailStudents} className="gap-2">
              <MailPlus className="h-4 w-4" />
              Open Email Editor
            </Button>
          </DialogFooter>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
};

function StudentDashboardNotifications({ teacherCategories = {}, categoryTypes = [], teacherNames = {} }) {
  // Context for student data
  const { studentSummaries } = useSchoolYear();
  
  // State for notifications list
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for editing
  const [editMode, setEditMode] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for notification form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isImportant, setIsImportant] = useState(false);
  const [type, setType] = useState('recurring'); // Changed from 'frequency' to 'type'
  const [conditionLogic, setConditionLogic] = useState('and');
  
  // State for repeat interval (for weekly surveys)
  const [repeatIntervalValue, setRepeatIntervalValue] = useState('1');
  const [repeatIntervalUnit, setRepeatIntervalUnit] = useState('week');
  
  // State for active/future/archived filters
  const [selectedActiveFutureArchivedValues, setSelectedActiveFutureArchivedValues] = useState(['Active']);
  
  // Function to group categories by type for the dropdown
  const groupCategoriesByType = useMemo(() => {
    return () => {
      const grouped = {};
      
      // Initialize groups for each type
      categoryTypes.forEach(type => {
        grouped[type.id] = [];
      });
      
      // Add uncategorized group
      grouped['uncategorized'] = [];
      
      // Group categories
      Object.entries(teacherCategories).forEach(([teacherEmailKey, categories]) => {
        categories
          .filter(category => !category.archived)
          .forEach(category => {
            const categoryWithTeacher = {
              ...category,
              teacherEmailKey,
              teacherName: teacherNames[teacherEmailKey] || teacherEmailKey
            };
            
            if (category.type && grouped[category.type]) {
              grouped[category.type].push(categoryWithTeacher);
            } else {
              grouped['uncategorized'].push(categoryWithTeacher);
            }
          });
      });
      
      return grouped;
    };
  }, [categoryTypes, teacherCategories, teacherNames]);
  
  // State for survey questions
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  // State for survey question type
  const [questionType, setQuestionType] = useState("multiple-choice");
  // State for categories list
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // State for filtering conditions
  const [selectedStudentTypes, setSelectedStudentTypes] = useState([]);
  const [selectedDiplomaMonths, setSelectedDiplomaMonths] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedSchoolYears, setSelectedSchoolYears] = useState([]);
  const [scheduleEndDateRange, setScheduleEndDateRange] = useState({ start: '', end: '' });
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });
  // Keep the selectedEmails state but don't expose UI for it (needed to prevent reference errors)
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  
  // State for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  
  // State for view mode
  const [activeTab, setActiveTab] = useState('all');
  
  // State for student messaging sheet
  const [messagingSheetOpen, setMessagingSheetOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  
  // State for save confirmation dialog
  const [saveConfirmationOpen, setSaveConfirmationOpen] = useState(false);
  const [savedNotification, setSavedNotification] = useState(null);
  
  // State for student selection dialog
  const [studentSelectionDialogOpen, setStudentSelectionDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [matchingStudentCount, setMatchingStudentCount] = useState(0);
  
  // Track when conditions change to recalculate matched students
  const [conditionsChanged, setConditionsChanged] = useState(false);
  
  // School year options
  const schoolYearOptions = getSchoolYearOptions();
  
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    fetchAllCategories();
  }, []);
  
  // Fetch all categories from Firebase
  const fetchAllCategories = async () => {
    try {
      const db = getDatabase();
      const categoriesRef = ref(db, 'teacherCategories');
      const snapshot = await get(categoriesRef);
      
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const formattedCategories = [];
        
        // Process categories from all teachers
        Object.entries(categoriesData).forEach(([teacherKey, teacherCategories]) => {
          Object.entries(teacherCategories).forEach(([categoryId, category]) => {
            // Only include non-archived categories
            if (!category.archived) {
              formattedCategories.push({
                id: categoryId,
                teacherKey,
                name: category.name,
                color: category.color || '#CBD5E1',
                icon: category.icon || 'circle',
                type: category.type
              });
            }
          });
        });
        
        // Sort by name
        formattedCategories.sort((a, b) => a.name.localeCompare(b.name));
        setAvailableCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };
  
  // Custom quill initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Quill) {
      const Quill = window.Quill;
      const ListClass = Quill.import('formats/list');
      
      const originalCreateElement = ListClass.prototype.createElement;
      ListClass.prototype.createElement = function(value) {
        const element = originalCreateElement.call(this, value);
        if (value === 'ordered') {
          element.setAttribute('type', '1');
        }
        return element;
      };
      
      Quill.register('formats/list', ListClass, true);
    }
  }, []);
  
  // Filter students based on conditions (can use either a notification object or current form state)
  // Using the utility function from notificationFilterUtils.js
  const filterStudentsByConditions = (conditionsSource, useCurrentFormState = false) => {
    if (!studentSummaries || !studentSummaries.length) {
      return [];
    }
    
    // Create a form state object for the utility function if needed
    const formState = useCurrentFormState ? {
      selectedStudentTypes,
      selectedDiplomaMonths,
      selectedCourses,
      selectedSchoolYears,
      selectedEmails, // Keep for backend compatibility
      selectedCategories,
      selectedActiveFutureArchivedValues,
      ageRange,
      scheduleEndDateRange,
      conditionLogic
    } : null;
    
    // Use the utility function
    return filterStudentsByNotificationConditions(conditionsSource, studentSummaries, useCurrentFormState, formState);
  };
  
  // Function to update the matched student count
  const updateMatchedStudentCount = () => {
    const matchedStudents = filterStudentsByConditions(null, true);
    setSelectedStudents(matchedStudents);
    setMatchingStudentCount(matchedStudents.length);
    return matchedStudents.length;
  };
  
  // Show the student selection dialog
  const handleOpenStudentSelectionDialog = () => {
    updateMatchedStudentCount();
    setStudentSelectionDialogOpen(true);
  };
  
  // Keep track of student count when conditions change
  useEffect(() => {
    if (editMode) {
      updateMatchedStudentCount();
    }
  }, [
    selectedStudentTypes, 
    selectedDiplomaMonths, 
    selectedCourses,
    selectedSchoolYears,
    scheduleEndDateRange,
    ageRange.min,
    ageRange.max,
    selectedEmails,
    selectedCategories,
    selectedActiveFutureArchivedValues,
    conditionLogic,
    editMode
  ]);
  
  // Handle opening the messaging sheet
  const handleOpenMessagingSheet = (notification) => {
    const students = filterStudentsByConditions(notification);
    setFilteredStudents(students);
    setSelectedNotification(notification);
    setMessagingSheetOpen(true);
  };
  
  // Fetch all notifications from Firebase
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const notificationsRef = ref(db, 'studentDashboardNotifications');
      const snapshot = await get(notificationsRef);
      
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        let notificationsArray = Object.keys(notificationsData).map(key => ({
          id: key,
          ...notificationsData[key]
        }));
        
        // Sort by createdAt (newest first)
        notificationsArray.sort((a, b) => b.createdAt - a.createdAt);
        
        // For active notifications, calculate and store the current matching student count
        notificationsArray = await Promise.all(notificationsArray.map(async notification => {
          if (notification.active) {
            // Calculate the current count for active notifications
            const matchCount = filterStudentsByConditions(notification).length;
            
            // Store the count in the database for future reference
            const notificationRef = ref(db, `studentDashboardNotifications/${notification.id}/lastMatchCount`);
            try {
              await set(notificationRef, matchCount);
            } catch (error) {
              console.error('Error updating notification count:', error);
            }
            
            // Update the notification object with the current count
            return {
              ...notification,
              lastMatchCount: matchCount
            };
          }
          return notification;
        }));
        
        setNotifications(notificationsArray);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form to initial state
  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsActive(true);
    setIsImportant(false);
    setType('recurring'); // Changed from 'frequency'
    setConditionLogic('and');
    setSelectedStudentTypes([]);
    setSelectedDiplomaMonths([]);
    setSelectedCourses([]);
    setSelectedSchoolYears([]);
    setScheduleEndDateRange({ start: '', end: '' });
    setAgeRange({ min: '', max: '' });
    // Email filtering removed
    setSelectedCategories([]); // Reset selected categories
    setSelectedActiveFutureArchivedValues(['Active']); // Reset to default 'Active'
    setSurveyQuestions([]); // Reset survey questions
    setQuestionType("multiple-choice"); // Reset question type
    setRepeatIntervalValue('1'); // Reset to default 1
    setRepeatIntervalUnit('week'); // Reset to default week
    setCurrentNotification(null);
    setEditMode(false);
  };
  
  // Add a new survey question
  const addSurveyQuestion = () => {
    setSurveyQuestions([
      ...surveyQuestions,
      {
        id: Date.now().toString(),
        question: '',
        questionType: questionType,
        options: questionType === "text-input" 
          ? []  // No options for text input type
          : [
              { id: Date.now().toString() + '-1', text: '', category: 'none', staffKey: 'none' },
              { id: Date.now().toString() + '-2', text: '', category: 'none', staffKey: 'none' }
            ]
      }
    ]);
  };
  
  // Update survey question text
  const updateSurveyQuestion = (questionId, newQuestion) => {
    setSurveyQuestions(surveyQuestions.map(q => 
      q.id === questionId 
        ? { ...q, question: newQuestion } 
        : q
    ));
  };
  
  // Remove a survey question
  const removeSurveyQuestion = (questionId) => {
    setSurveyQuestions(surveyQuestions.filter(q => q.id !== questionId));
  };
  
  // Add a new option to a question
  const addOptionToQuestion = (questionId) => {
    setSurveyQuestions(surveyQuestions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: [
              ...q.options, 
              { id: Date.now().toString(), text: '', category: 'none', staffKey: 'none' }
            ] 
          } 
        : q
    ));
  };
  
  // Update option text
  const updateOption = (questionId, optionId, newText) => {
    setSurveyQuestions(surveyQuestions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map(opt => 
              opt.id === optionId 
                ? { ...opt, text: newText } 
                : opt
            ) 
          } 
        : q
    ));
  };
  
  // Update option category
  const updateOptionCategory = (questionId, optionId, newCategory, staffKey) => {
    setSurveyQuestions(surveyQuestions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map(opt => 
              opt.id === optionId 
                ? { 
                    ...opt, 
                    category: newCategory,
                    staffKey: staffKey || 'none' // Store the staff key along with the category
                  } 
                : opt
            ) 
          } 
        : q
    ));
  };
  
  // Remove an option from a question
  const removeOptionFromQuestion = (questionId, optionId) => {
    setSurveyQuestions(surveyQuestions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.filter(opt => opt.id !== optionId) 
          } 
        : q
    ));
  };
  
  // Move a question up or down in the list
  const moveQuestion = (questionId, direction) => {
    const currentIndex = surveyQuestions.findIndex(q => q.id === questionId);
    
    // If moving up and not already at the top
    if (direction === 'up' && currentIndex > 0) {
      const newQuestions = [...surveyQuestions];
      const temp = newQuestions[currentIndex];
      newQuestions[currentIndex] = newQuestions[currentIndex - 1];
      newQuestions[currentIndex - 1] = temp;
      setSurveyQuestions(newQuestions);
    } 
    // If moving down and not already at the bottom
    else if (direction === 'down' && currentIndex < surveyQuestions.length - 1) {
      const newQuestions = [...surveyQuestions];
      const temp = newQuestions[currentIndex];
      newQuestions[currentIndex] = newQuestions[currentIndex + 1];
      newQuestions[currentIndex + 1] = temp;
      setSurveyQuestions(newQuestions);
    }
  };
  
  // Handle editing an existing notification
  const handleEditNotification = (notification) => {
    setCurrentNotification(notification);
    setTitle(notification.title);
    setContent(notification.content);
    setIsActive(notification.active);
    setIsImportant(notification.important || false);
    
    // Handle type (previously frequency)
    setType(notification.type || notification.frequency || 'recurring');
    
    setConditionLogic(notification.conditions?.logic || 'and');
    
    // Set survey questions if any
    setSurveyQuestions(notification.surveyQuestions || []);
    
    // Set question type if available in the first question, or default to multiple-choice
    if (notification.surveyQuestions && notification.surveyQuestions.length > 0) {
      setQuestionType(notification.surveyQuestions[0].questionType || "multiple-choice");
    } else {
      setQuestionType("multiple-choice");
    }
    
    // Handle repeat interval for any notification type
    if (notification.repeatInterval) {
      // This is a repeating notification - load the interval values
      setRepeatIntervalValue(notification.repeatInterval.value || '1');
      setRepeatIntervalUnit(notification.repeatInterval.unit || 'week');
    } else {
      // This is a one-time notification - clear the interval values
      setRepeatIntervalValue('');
      setRepeatIntervalUnit('');
    }
    
    // Set filtering conditions
    setSelectedStudentTypes(notification.conditions?.studentTypes || []);
    setSelectedDiplomaMonths(notification.conditions?.diplomaMonths || []);
    setSelectedCourses(notification.conditions?.courses || []);
    setSelectedSchoolYears(notification.conditions?.schoolYears || []);
    // Email filtering removed
    setSelectedCategories(notification.conditions?.categories || []);
    setSelectedActiveFutureArchivedValues(notification.conditions?.activeFutureArchivedValues || ['Active']);
    
    if (notification.conditions?.scheduleEndDateRange) {
      setScheduleEndDateRange({
        start: notification.conditions.scheduleEndDateRange.start || '',
        end: notification.conditions.scheduleEndDateRange.end || ''
      });
    } else {
      setScheduleEndDateRange({ start: '', end: '' });
    }
    
    if (notification.conditions?.ageRange) {
      setAgeRange({
        min: notification.conditions.ageRange.min || '',
        max: notification.conditions.ageRange.max || ''
      });
    } else {
      setAgeRange({ min: '', max: '' });
    }
    
    setEditMode(true);
  };
  
  // Sanitize HTML content
  const sanitizeHtml = (html) => {
    if (!html) return '';
    
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.innerHTML;
    } catch (error) {
      console.error('Error sanitizing HTML:', error);
      return html;
    }
  };
  
  // Validate form before saving
  const validateForm = () => {
    if (!title.trim()) {
      toast.error('Please enter a notification title');
      return false;
    }
    
    if (!content.trim()) {
      toast.error('Please enter notification content');
      return false;
    }
    
    // Check for survey type (either direct 'survey' type or legacy 'weekly-survey' type)
    const isSurveyType = type === 'survey' || type === 'weekly-survey';
    
    // Validate survey questions if this is a survey type
    if (isSurveyType) {
      if (surveyQuestions.length === 0) {
        toast.error('Please add at least one survey question');
        return false;
      }
      
      // Check for empty questions or options
      for (const q of surveyQuestions) {
        if (!q.question.trim()) {
          toast.error('Survey questions cannot be empty');
          return false;
        }
        
        // For multiple-choice questions, validate options
        if (q.questionType === "multiple-choice" || !q.questionType) {
          if (q.options.length < 2) {
            toast.error('Multiple choice questions must have at least 2 options');
            return false;
          }
          
          for (const opt of q.options) {
            if (!opt.text.trim()) {
              toast.error('Survey options cannot be empty');
              return false;
            }
          }
        }
        // Text input questions don't need option validation
      }
    }
    
    // Validate repeat interval if specified for any notification type
    if (repeatIntervalValue && repeatIntervalUnit) {
      const intervalValue = parseInt(repeatIntervalValue);
      if (isNaN(intervalValue) || intervalValue < 1) {
        toast.error('Please enter a valid repeat interval value (minimum 1)');
        return false;
      }
    }
    
    // Check if at least one condition is set
    const hasStudentTypes = selectedStudentTypes.length > 0;
    const hasDiplomaMonths = selectedDiplomaMonths.length > 0;
    const hasCourses = selectedCourses.length > 0;
    const hasSchoolYears = selectedSchoolYears.length > 0;
    const hasScheduleEndDateRange = scheduleEndDateRange.start && scheduleEndDateRange.end;
    const hasAgeRange = ageRange.min && ageRange.max;
    const hasEmails = selectedEmails.length > 0;
    const hasCategories = selectedCategories.length > 0;
    
    if (!hasStudentTypes && !hasDiplomaMonths && !hasCourses && !hasSchoolYears && 
        !hasScheduleEndDateRange && !hasAgeRange && !hasEmails && !hasCategories) {
      toast.error('Please set at least one condition for the notification');
      return false;
    }
    
    // Validate date range if provided
    if ((scheduleEndDateRange.start && !scheduleEndDateRange.end) || 
        (!scheduleEndDateRange.start && scheduleEndDateRange.end)) {
      toast.error('Please provide both start and end dates for schedule end date range');
      return false;
    }
    
    if (scheduleEndDateRange.start && scheduleEndDateRange.end) {
      const startDate = new Date(scheduleEndDateRange.start);
      const endDate = new Date(scheduleEndDateRange.end);
      
      if (startDate > endDate) {
        toast.error('Schedule end date range start must be before end date');
        return false;
      }
    }
    
    // Validate age range if provided
    if ((ageRange.min && !ageRange.max) || (!ageRange.min && ageRange.max)) {
      toast.error('Please provide both minimum and maximum age values');
      return false;
    }
    
    if (ageRange.min && ageRange.max) {
      const minAge = parseInt(ageRange.min);
      const maxAge = parseInt(ageRange.max);
      
      if (isNaN(minAge) || isNaN(maxAge)) {
        toast.error('Age range must contain valid numbers');
        return false;
      }
      
      if (minAge > maxAge) {
        toast.error('Minimum age must be less than or equal to maximum age');
        return false;
      }
      
      if (minAge < 5 || maxAge > 100) {
        toast.error('Age range must be between 5 and 100');
        return false;
      }
    }
    
    return true;
  };
  
  // Save notification to Firebase
  const saveNotification = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const db = getDatabase();
      const sanitizedContent = sanitizeHtml(content);
      
      // Handle transition between legacy and new notification types
      let finalType = type;
      
      // Convert old type to new consolidated type if needed
      if (type === 'once' || type === 'recurring') {
        finalType = 'notification';
      }
      
      // If weekly-survey is selected, convert to survey with repeat interval
      if (type === 'weekly-survey') {
        finalType = 'survey';
      }
      
      // Build notification object
      const notificationData = {
        title: title.trim(),
        content: sanitizedContent, // Always save content for all notification types
        active: isActive,
        important: isImportant,
        type: finalType, // Use the consolidated type
        conditions: {
          logic: conditionLogic
        },
        updatedAt: Date.now()
      };
      
      // Add survey questions for survey types
      if (finalType === 'survey') {
        notificationData.surveyQuestions = surveyQuestions;
        notificationData.surveyCompleted = false;
      }
      
      // Add repeat interval if specified for any notification type
      if (repeatIntervalValue && repeatIntervalUnit) {
        notificationData.repeatInterval = {
          value: parseInt(repeatIntervalValue),
          unit: repeatIntervalUnit
        };
      }
      
      // Add filtering conditions (only include non-empty arrays/values)
      if (selectedStudentTypes.length > 0) {
        notificationData.conditions.studentTypes = selectedStudentTypes;
      }
      
      if (selectedDiplomaMonths.length > 0) {
        notificationData.conditions.diplomaMonths = selectedDiplomaMonths;
      }
      
      if (selectedCourses.length > 0) {
        notificationData.conditions.courses = selectedCourses;
      }
      
      if (selectedSchoolYears.length > 0) {
        notificationData.conditions.schoolYears = selectedSchoolYears;
      }
      
      // Include empty emails array for backward compatibility
      if (selectedEmails.length > 0) {
        notificationData.conditions.emails = selectedEmails;
      }
      
      if (selectedCategories.length > 0) {
        notificationData.conditions.categories = selectedCategories;
      }
      
      if (scheduleEndDateRange.start && scheduleEndDateRange.end) {
        notificationData.conditions.scheduleEndDateRange = {
          start: scheduleEndDateRange.start,
          end: scheduleEndDateRange.end
        };
      }
      
      if (ageRange.min && ageRange.max) {
        notificationData.conditions.ageRange = {
          min: parseInt(ageRange.min),
          max: parseInt(ageRange.max)
        };
      }
      
      if (selectedActiveFutureArchivedValues.length > 0) {
        notificationData.conditions.activeFutureArchivedValues = selectedActiveFutureArchivedValues;
      }
      
      let savedNotificationObject;
      
      if (editMode && currentNotification) {
        // Update existing notification
        const notificationRef = ref(db, `studentDashboardNotifications/${currentNotification.id}`);
        await update(notificationRef, notificationData);
        savedNotificationObject = { ...notificationData, id: currentNotification.id };
      } else {
        // Create new notification
        const notificationsRef = ref(db, 'studentDashboardNotifications');
        const newNotificationRef = push(notificationsRef);
        
        // Add creation time for new notifications
        notificationData.createdAt = Date.now();
        
        await set(newNotificationRef, notificationData);
        savedNotificationObject = { ...notificationData, id: newNotificationRef.key };
      }
      
      // Refresh the notifications list
      await fetchNotifications();
      
      // Show save confirmation dialog with matching student count
      const matchingStudents = filterStudentsByConditions(savedNotificationObject);
      setSavedNotification(savedNotificationObject);
      setSaveConfirmationOpen(true);
      
      // Don't reset form yet - wait for dialog result
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error('Failed to save notification');
      setIsSaving(false);
    }
  };
  
  // Handle confirmation dialog actions
  const handleJustSave = () => {
    setSaveConfirmationOpen(false);
    resetForm();
    setIsSaving(false);
    toast.success('Notification saved successfully');
  };
  
  const handleEmailStudents = () => {
    setSaveConfirmationOpen(false);
    setIsSaving(false);
    
    if (savedNotification) {
      handleOpenMessagingSheet(savedNotification);
      resetForm();
    }
  };
  
  // Delete notification
  const deleteNotification = async () => {
    if (!notificationToDelete) return;
    
    try {
      const db = getDatabase();
      const notificationRef = ref(db, `studentDashboardNotifications/${notificationToDelete.id}`);
      await remove(notificationRef);
      
      toast.success('Notification deleted successfully');
      await fetchNotifications();
      setDeleteDialogOpen(false);
      setNotificationToDelete(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };
  
  // Toggle notification active status
  const toggleNotificationStatus = async (notification) => {
    try {
      const db = getDatabase();
      const notificationRef = ref(db, `studentDashboardNotifications/${notification.id}`);
      
      const newActiveStatus = !notification.active;
      
      // Create a new complete notification object with updated active status
      const updatedNotification = {
        ...notification,
        active: newActiveStatus,
        updatedAt: Date.now(),
        id: undefined // Remove the id property as it's not part of the data structure
      };
      
      // If activating a notification, calculate and store current student count
      if (newActiveStatus) {
        const matchCount = filterStudentsByConditions(notification).length;
        updatedNotification.lastMatchCount = matchCount;
      }
      
      // Set the complete object instead of just updating fields
      await set(notificationRef, updatedNotification);
      
      toast.success(`Notification ${newActiveStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Refresh to ensure UI is updated correctly
      await fetchNotifications();
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast.error('Failed to update notification status');
    }
  };
  
  // Handle multi-select changes
  const handleMultiSelectChange = (field, value) => {
    setConditionsChanged(true);
    
    switch (field) {
      case 'studentTypes':
        if (selectedStudentTypes.includes(value)) {
          setSelectedStudentTypes(selectedStudentTypes.filter(type => type !== value));
        } else {
          setSelectedStudentTypes([...selectedStudentTypes, value]);
        }
        break;
        
      case 'diplomaMonths':
        if (selectedDiplomaMonths.includes(value)) {
          setSelectedDiplomaMonths(selectedDiplomaMonths.filter(month => month !== value));
        } else {
          setSelectedDiplomaMonths([...selectedDiplomaMonths, value]);
        }
        break;
        
      case 'courses':
        if (selectedCourses.includes(value)) {
          setSelectedCourses(selectedCourses.filter(course => course !== value));
        } else {
          setSelectedCourses([...selectedCourses, value]);
        }
        break;
        
      case 'schoolYears':
        if (selectedSchoolYears.includes(value)) {
          setSelectedSchoolYears(selectedSchoolYears.filter(year => year !== year));
        } else {
          setSelectedSchoolYears([...selectedSchoolYears, value]);
        }
        break;
        
      default:
        break;
    }
  };
  
  // Filter notifications based on active tab
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'active':
        return notifications.filter(notification => notification.active);
      case 'inactive':
        return notifications.filter(notification => !notification.active);
      default:
        return notifications;
    }
  };
  
  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Email filtering UI removed, but keep functions for backend compatibility
  const handleAddEmail = () => {
    // Disabled in UI but keep functionality for future reference
    if (!emailInput.trim()) return;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (selectedEmails.includes(emailInput.trim().toLowerCase())) {
      toast.error('This email is already in the list');
      return;
    }
    
    setConditionsChanged(true);
    setSelectedEmails([...selectedEmails, emailInput.trim().toLowerCase()]);
    setEmailInput('');
  };
  
  const handleRemoveEmail = (email) => {
    setConditionsChanged(true);
    setSelectedEmails(selectedEmails.filter(e => e !== email));
  };

  // Handle category selection for notifications
  const handleCategoryChange = (categoryId, teacherEmailKey) => {
    setConditionsChanged(true);
    
    setSelectedCategories(prevCategories => {
      // Find the teacher entry
      const existingTeacherIndex = prevCategories.findIndex(
        teacherCat => Object.keys(teacherCat)[0] === teacherEmailKey
      );
      
      if (existingTeacherIndex > -1) {
        // Teacher exists, check if the category is already selected
        const existingCategories = prevCategories[existingTeacherIndex][teacherEmailKey];
        
        if (existingCategories.includes(categoryId)) {
          // Category is already selected, remove it
          const updatedCategories = [...prevCategories];
          updatedCategories[existingTeacherIndex] = {
            [teacherEmailKey]: existingCategories.filter(id => id !== categoryId)
          };
          
          // If there are no more categories for this teacher, remove the entry
          if (updatedCategories[existingTeacherIndex][teacherEmailKey].length === 0) {
            updatedCategories.splice(existingTeacherIndex, 1);
          }
          
          return updatedCategories;
        } else {
          // Category not selected yet, add it
          const updatedCategories = [...prevCategories];
          updatedCategories[existingTeacherIndex] = {
            [teacherEmailKey]: [...existingCategories, categoryId]
          };
          return updatedCategories;
        }
      } else {
        // Teacher doesn't exist yet, add a new entry
        return [...prevCategories, { [teacherEmailKey]: [categoryId] }];
      }
    });
  };
  
  // Handle removing a category
  const handleRemoveCategory = (categoryId, teacherEmailKey) => {
    setConditionsChanged(true);
    
    setSelectedCategories(prevCategories => {
      // Find the teacher entry
      const existingTeacherIndex = prevCategories.findIndex(
        teacherCat => Object.keys(teacherCat)[0] === teacherEmailKey
      );
      
      if (existingTeacherIndex > -1) {
        // Make a copy of the categories array
        const updatedCategories = [...prevCategories];
        const existingCategories = prevCategories[existingTeacherIndex][teacherEmailKey];
        
        // Remove the category
        updatedCategories[existingTeacherIndex] = {
          [teacherEmailKey]: existingCategories.filter(id => id !== categoryId)
        };
        
        // If there are no more categories for this teacher, remove the entry
        if (updatedCategories[existingTeacherIndex][teacherEmailKey].length === 0) {
          updatedCategories.splice(existingTeacherIndex, 1);
        }
        
        return updatedCategories;
      }
      
      // If not found, return unchanged
      return prevCategories;
    });
  };

  // Render badges for notification conditions
  const renderConditionBadges = (notification) => {
    const conditions = notification.conditions || {};
    const badges = [];
    
    if (conditions.studentTypes && conditions.studentTypes.length > 0) {
      badges.push(
        <Badge key="studentTypes" variant="outline" className="mr-1 mb-1">
          {conditions.studentTypes.length} Student {conditions.studentTypes.length === 1 ? 'Type' : 'Types'}
        </Badge>
      );
    }
    
    if (conditions.diplomaMonths && conditions.diplomaMonths.length > 0) {
      badges.push(
        <Badge key="diplomaMonths" variant="outline" className="mr-1 mb-1">
          {conditions.diplomaMonths.length} Diploma {conditions.diplomaMonths.length === 1 ? 'Month' : 'Months'}
        </Badge>
      );
    }
    
    if (conditions.courses && conditions.courses.length > 0) {
      badges.push(
        <Badge key="courses" variant="outline" className="mr-1 mb-1">
          {conditions.courses.length} {conditions.courses.length === 1 ? 'Course' : 'Courses'}
        </Badge>
      );
    }
    
    if (conditions.schoolYears && conditions.schoolYears.length > 0) {
      badges.push(
        <Badge key="schoolYears" variant="outline" className="mr-1 mb-1">
          {conditions.schoolYears.length} School {conditions.schoolYears.length === 1 ? 'Year' : 'Years'}
        </Badge>
      );
    }
    
    // Email filtering removed
    
    if (conditions.categories && conditions.categories.length > 0) {
      const categoryCount = conditions.categories.reduce((count, teacherCat) => {
        const categories = Object.values(teacherCat)[0];
        return count + (categories ? categories.length : 0);
      }, 0);
      
      badges.push(
        <Badge key="categories" variant="outline" className="mr-1 mb-1 bg-purple-50 text-purple-700 border-purple-200">
          {categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}
        </Badge>
      );
    }
    
    if (conditions.scheduleEndDateRange) {
      badges.push(
        <Badge key="dateRange" variant="outline" className="mr-1 mb-1">
          Date Range
        </Badge>
      );
    }
    
    if (conditions.ageRange) {
      badges.push(
        <Badge key="age-range" variant="secondary" className="mr-1 mb-1">
          Age: {conditions.ageRange.min}-{conditions.ageRange.max}
        </Badge>
      );
    }

    if (conditions.activeFutureArchivedValues && conditions.activeFutureArchivedValues.length > 0) {
      badges.push(
        <Badge key="active-future-archived" variant="outline" className="mr-1 mb-1">
          State: {conditions.activeFutureArchivedValues.join(', ')}
        </Badge>
      );
    }

    // Add survey badge
    if (notification.type === 'survey' || notification.type === 'weekly-survey') {
      if (notification.repeatInterval || notification.type === 'weekly-survey') {
        // This is a repeating survey
        const interval = notification.repeatInterval || 
                        (notification.type === 'weekly-survey' ? { value: 1, unit: 'week' } : null);
        if (interval) {
          badges.push(
            <Badge key="repeating-survey" variant="secondary" className="mr-1 mb-1 bg-green-100 text-green-800">
              Repeating Survey (every {interval.value} {interval.unit}{interval.value !== 1 ? 's' : ''})
            </Badge>
          );
        }
      } else {
        // This is a one-time survey
        badges.push(
          <Badge key="survey" variant="secondary" className="mr-1 mb-1 bg-purple-100 text-purple-800">
            One-time Survey ({notification.surveyQuestions?.length || 0} questions)
          </Badge>
        );
      }
    } 
    
    // Add notification type badge for regular notifications
    if (notification.type === 'notification' || notification.type === 'once' || notification.type === 'recurring') {
      if (notification.repeatInterval || notification.type === 'recurring') {
        // This is a repeating notification
        const interval = notification.repeatInterval || null;
        if (interval) {
          badges.push(
            <Badge key="repeating-notification" variant="secondary" className="mr-1 mb-1 bg-green-100 text-green-800">
              Repeating Notification (every {interval.value} {interval.unit}{interval.value !== 1 ? 's' : ''})
            </Badge>
          );
        } else {
          badges.push(
            <Badge key="recurring" variant="secondary" className="mr-1 mb-1 bg-green-100 text-green-800">
              Recurring Notification
            </Badge>
          );
        }
      } else {
        // This is a one-time notification
        badges.push(
          <Badge key="once" variant="secondary" className="mr-1 mb-1 bg-blue-100 text-blue-800">
            One-time Notification
          </Badge>
        );
      }
    }
    
    return badges.length > 0 ? (
      <div className="flex flex-wrap mt-1">
        <Badge variant="secondary" className="mr-1 mb-1">
          {conditions.logic === 'and' ? 'ALL' : 'ANY'}
        </Badge>
        {badges}
      </div>
    ) : (
      <span className="text-gray-500 text-sm">No conditions</span>
    );
  };
  
  // Truncate content for display
  const truncateContent = (htmlContent, maxLength = 100) => {
    if (!htmlContent) return '';
    
    // Create a temporary div to extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Render survey content preview
  const renderSurveyPreview = (notification) => {
    const questions = notification.surveyQuestions || [];
    if (questions.length === 0) return 'No survey questions';
    
    return `${questions.length} question${questions.length > 1 ? 's' : ''}: ${questions[0].question}${questions.length > 1 ? '...' : ''}`;
  };

  // Get count of matching students
  const getMatchingStudentCount = (notification) => {
    // Only calculate real-time counts for active notifications
    if (notification.active) {
      return filterStudentsByConditions(notification).length;
    } else {
      // For inactive notifications, use cached count or display a placeholder
      return notification.lastMatchCount || "—";
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 mb-2">
        <Card className="mx-auto max-w-7xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center">
                  <BellRing className="mr-2 h-5 w-5" />
                  Student Dashboard Notifications
                </CardTitle>
                <CardDescription>
                  Create targeted notifications for students that will appear on their dashboard
                </CardDescription>
              </div>
              <Button 
                onClick={() => {
                  if (editMode) {
                    resetForm();
                  } else {
                    setEditMode(true);
                  }
                }}
              >
                {editMode ? (
                  <>Cancel Editing</>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Notification
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
      
      <div className="flex-1 overflow-hidden p-4">
        <div className="mx-auto max-w-7xl h-full flex flex-col gap-4">
          {editMode ? (
            <Card className="flex-1 overflow-auto">
              <CardHeader>
                <CardTitle>
                  {currentNotification ? 'Edit Notification' : 'Create New Notification'}
                </CardTitle>
                <CardDescription>
                  Fill in the details below to {currentNotification ? 'update the' : 'create a new'} notification
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Notification Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <Label htmlFor="notification-title">Notification Title</Label>
                      <Input 
                        id="notification-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter notification title"
                        className="mt-1"
                      />
                    </div>
                    
                    {/* Active Switch */}
                    <div className="flex flex-col justify-center items-start space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="notification-active"
                          checked={isActive}
                          onCheckedChange={setIsActive}
                        />
                        <Label htmlFor="notification-active">
                          {isActive ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        {isActive ? 'This notification will be shown to students' : 'This notification is disabled'}
                      </p>
                      
                      {/* Important Switch */}
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch 
                          id="notification-important"
                          checked={isImportant}
                          onCheckedChange={setIsImportant}
                        />
                        <Label htmlFor="notification-important">
                          {isImportant ? 'Important' : 'Standard'}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        {isImportant ? 'Will force student to see notification each time' : 'Will appear as a standard notification'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Consolidated Notification Types */}
                  <div>
                    <Label>Notification Type</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                      {/* Notification Option */}
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
                        onClick={() => setType('notification')}
                        style={{ 
                          backgroundColor: type === 'notification' || type === 'once' || type === 'recurring' ? '#f0f9ff' : 'transparent',
                          borderColor: type === 'notification' || type === 'once' || type === 'recurring' ? '#3b82f6' : '#e5e7eb'
                        }}
                      >
                        <div className={`h-4 w-4 rounded-full ${type === 'notification' || type === 'once' || type === 'recurring' ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                        <div>
                          <p className="font-medium">Regular Notification</p>
                          <p className="text-sm text-gray-500">Informational message for students</p>
                        </div>
                      </div>
                      
                      {/* Survey Option */}
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
                        onClick={() => setType('survey')}
                        style={{ 
                          backgroundColor: type === 'survey' || type === 'weekly-survey' ? '#f0f8ff' : 'transparent',
                          borderColor: type === 'survey' || type === 'weekly-survey' ? '#8a2be2' : '#e5e7eb'
                        }}
                      >
                        <div className={`h-4 w-4 rounded-full ${type === 'survey' || type === 'weekly-survey' ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                        <div>
                          <p className="font-medium">Survey</p>
                          <p className="text-sm text-gray-500">Collect student feedback</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Repeat interval settings for all notification types */}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center">
                        <CalendarClock className="h-5 w-5 text-blue-700 mr-2" />
                        <h3 className="font-medium text-blue-900">Display Frequency</h3>
                      </div>
                      <p className="text-sm text-blue-700 mt-1 mb-3">
                        {type === 'survey' 
                          ? "Set whether this is a one-time survey or repeating survey."
                          : "Set whether this is a one-time notification or repeating notification."
                        }
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* One-time Option */}
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
                          onClick={() => {
                            // Clear repeat interval to make this a one-time notification
                            setRepeatIntervalValue("");
                            setRepeatIntervalUnit("");
                          }}
                          style={{ 
                            backgroundColor: !repeatIntervalValue || !repeatIntervalUnit ? '#f0f9ff' : 'transparent',
                            borderColor: !repeatIntervalValue || !repeatIntervalUnit ? '#3b82f6' : '#e5e7eb'
                          }}
                        >
                          <div className={`h-4 w-4 rounded-full ${!repeatIntervalValue || !repeatIntervalUnit ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                          <div>
                            <p className="font-medium">One-time</p>
                            <p className="text-sm text-gray-500">
                              {type === 'survey' 
                                ? "Show survey once per student"
                                : "Show notification once per student"
                              }
                            </p>
                          </div>
                        </div>
                        
                        {/* Recurring Option */}
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
                          onClick={() => {
                            // Set default repeat interval if currently empty
                            if (!repeatIntervalValue || !repeatIntervalUnit) {
                              setRepeatIntervalValue('1');
                              setRepeatIntervalUnit('week');
                            }
                          }}
                          style={{ 
                            backgroundColor: repeatIntervalValue && repeatIntervalUnit ? '#f0f9ff' : 'transparent',
                            borderColor: repeatIntervalValue && repeatIntervalUnit ? '#3b82f6' : '#e5e7eb'
                          }}
                        >
                          <div className={`h-4 w-4 rounded-full ${repeatIntervalValue && repeatIntervalUnit ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                          <div>
                            <p className="font-medium">Repeating</p>
                            <p className="text-sm text-gray-500">
                              {type === 'survey' 
                                ? "Allow retaking the survey periodically"
                                : "Show notification with a repeat interval"
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Show interval settings only if repeating is selected */}
                      {repeatIntervalValue && repeatIntervalUnit && (
                        <div className="flex items-center space-x-2 border-t pt-4">
                          <Label htmlFor="repeat-interval-text" className="shrink-0">Repeat every</Label>
                          <Input 
                            id="repeat-interval-value"
                            type="number"
                            min="1"
                            max="52"
                            value={repeatIntervalValue}
                            onChange={(e) => setRepeatIntervalValue(e.target.value)}
                            className="w-16"
                          />
                          <Select value={repeatIntervalUnit} onValueChange={setRepeatIntervalUnit}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="day">Day(s)</SelectItem>
                              <SelectItem value="week">Week(s)</SelectItem>
                              <SelectItem value="month">Month(s)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Rich Text Content (for all notification types) */}
                  <div className="space-y-2">
                    <Label htmlFor="notification-content">Notification Content</Label>
                    <div className="quill-container">
                      <ReactQuill
                        id="notification-content"
                        value={content}
                        onChange={setContent}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        placeholder="Enter notification content"
                        style={{ minHeight: '200px', marginBottom: '40px' }}
                      />
                    </div>
                  </div>
                  
                  {/* Survey Questions Editor (shown for both survey and weekly-survey types) */}
                  {(type === 'survey' || type === 'weekly-survey') && (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium flex items-center">
                          <ClipboardList className="mr-2 h-5 w-5" />
                          Survey Questions
                        </Label>
                        <div className="flex items-center space-x-2">
                          <div className="border rounded-md overflow-hidden flex h-10">
                            <div className="border-r bg-gray-50 flex items-center">
                              <Label htmlFor="question-type" className="sr-only">Question Type</Label>
                              <Select value={questionType} onValueChange={setQuestionType}>
                                <SelectTrigger className="w-[180px] border-0 shadow-none focus:ring-0 h-10">
                                  <SelectValue placeholder="Question Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                  <SelectItem value="text-input">Text Input</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={addSurveyQuestion} 
                              className="rounded-none bg-purple-600 hover:bg-purple-700 h-10 flex-shrink-0"
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add Question
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {surveyQuestions.length === 0 ? (
                        <div className="text-center py-8 border rounded-md bg-gray-50">
                          <HelpCircle className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">No questions added yet</p>
                          <div className="mt-4 inline-flex border rounded-md overflow-hidden h-10">
                            <div className="border-r bg-gray-50 flex items-center">
                              <Select value={questionType} onValueChange={setQuestionType}>
                                <SelectTrigger className="w-[180px] border-0 shadow-none focus:ring-0 h-10">
                                  <SelectValue placeholder="Question Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                  <SelectItem value="text-input">Text Input</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={addSurveyQuestion} 
                              className="rounded-none bg-purple-600 hover:bg-purple-700 h-10 flex-shrink-0"
                            >
                              <PlusCircle className="h-4 w-4 mr-1" />
                              Add Your First Question
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {surveyQuestions.map((question, qIndex) => (
                            <div key={question.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                              {/* Question Header */}
                              <div className="bg-purple-100 p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center mr-3">
                                    {qIndex + 1}
                                  </span>
                                  <h3 className="font-medium">Question {qIndex + 1}</h3>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => moveQuestion(question.id, 'up')}
                                    disabled={qIndex === 0}
                                    className={qIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                  >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M18 15l-6-6-6 6" />
                                    </svg>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => moveQuestion(question.id, 'down')}
                                    disabled={qIndex === surveyQuestions.length - 1}
                                    className={qIndex === surveyQuestions.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}
                                  >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M6 9l6 6 6-6" />
                                    </svg>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => removeSurveyQuestion(question.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </Button>
                                </div>
                              </div>
                              
                              {/* Question Content */}
                              <div className="p-4">
                                {/* Question Text */}
                                <div className="mb-4">
                                  <Label htmlFor={`question-${question.id}`} className="mb-1 block">
                                    Question Text
                                  </Label>
                                  <Textarea
                                    id={`question-${question.id}`}
                                    value={question.question}
                                    onChange={(e) => updateSurveyQuestion(question.id, e.target.value)}
                                    placeholder="Enter your question"
                                    className="w-full min-h-[80px]"
                                  />
                                </div>
                                
                                {/* Answer Options - only show for multiple choice questions */}
                                {(!question.questionType || question.questionType === "multiple-choice") && (
                                  <div className="mb-3">
                                    <Label className="mb-2 block">
                                      Answer Options
                                    </Label>
                                    
                                    <div className="space-y-2 mb-4">
                                      {question.options.map((option, index) => (
                                        <div key={option.id} className="flex items-center space-x-2">
                                          <Circle className="h-4 w-4 text-purple-500" />
                                          <Input
                                            value={option.text}
                                            onChange={(e) => updateOption(question.id, option.id, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1"
                                          />
                                          
                                          {/* Category dropdown - only show for survey and weekly-survey types */}
                                          {(type === 'survey' || type === 'weekly-survey') && (
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-[180px]">
                                                  <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center space-x-2">
                                                      {option.category && option.category !== 'none' && availableCategories.some(cat => cat.id === option.category) ? (
                                                        <>
                                                          <div 
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ 
                                                              backgroundColor: availableCategories.find(cat => cat.id === option.category)?.color || '#CBD5E1' 
                                                            }}
                                                          />
                                                          <span className="truncate">
                                                            {availableCategories.find(cat => cat.id === option.category)?.name || 'Category'}
                                                          </span>
                                                        </>
                                                      ) : (
                                                        <span className="text-muted-foreground">Select category</span>
                                                      )}
                                                    </div>
                                                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                                  </div>
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end" className="w-[220px]">
                                                <DropdownMenuItem 
                                                  onClick={() => updateOptionCategory(question.id, option.id, 'none', 'none')}
                                                  className="cursor-pointer"
                                                >
                                                  No category
                                                </DropdownMenuItem>
                                                
                                                <DropdownMenuSeparator />
                                                
                                                {/* By Type option */}
                                                <DropdownMenuSub>
                                                  <DropdownMenuSubTrigger>
                                                    <Grid2X2 className="h-4 w-4 mr-2" />
                                                    By Type
                                                  </DropdownMenuSubTrigger>
                                                  <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                                    {categoryTypes.map((type) => {
                                                      const categoryData = groupCategoriesByType 
                                                                          ? groupCategoriesByType()[type.id] || [] 
                                                                          : [];
                                                      
                                                      if (categoryData.length === 0) return null;
                                                      
                                                      return (
                                                        <DropdownMenuSub key={type.id}>
                                                          <DropdownMenuSubTrigger className="w-full">
                                                            <div className="flex items-center">
                                                              {React.createElement(
                                                                iconMap[type.icon] || Circle,
                                                                { 
                                                                  className: "h-4 w-4 mr-2 flex-shrink-0",
                                                                  style: { color: type.color }
                                                                }
                                                              )}
                                                              <span className="truncate">{type.name}</span>
                                                            </div>
                                                          </DropdownMenuSubTrigger>
                                                          <DropdownMenuSubContent>
                                                            {categoryData.map((category) => {
                                                              const isSelected = option.category === category.id;
                                                              
                                                              return (
                                                                <DropdownMenuItem
                                                                  key={`${category.teacherEmailKey}-${category.id}`}
                                                                  onSelect={() => updateOptionCategory(question.id, option.id, category.id, category.teacherEmailKey)}
                                                                  className="flex items-center"
                                                                  style={{
                                                                    backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                                                                  }}
                                                                >
                                                                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                                                    style: { color: category.color }, 
                                                                    size: 16, 
                                                                    className: 'mr-2' 
                                                                  })}
                                                                  <span className="truncate">{category.name}</span>
                                                                  <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                                                    ({teacherNames[category.teacherEmailKey] || category.teacherEmailKey})
                                                                  </span>
                                                                </DropdownMenuItem>
                                                              );
                                                            })}
                                                          </DropdownMenuSubContent>
                                                        </DropdownMenuSub>
                                                      );
                                                    })}
                                                    
                                                    {/* Uncategorized section */}
                                                    <DropdownMenuSub>
                                                      <DropdownMenuSubTrigger>
                                                        <Circle className="h-4 w-4 mr-2" />
                                                        Uncategorized
                                                      </DropdownMenuSubTrigger>
                                                      <DropdownMenuSubContent>
                                                        {groupCategoriesByType && groupCategoriesByType()['uncategorized']?.map((category) => {
                                                          const isSelected = option.category === category.id;
                                                          
                                                          return (
                                                            <DropdownMenuItem
                                                              key={`${category.teacherEmailKey}-${category.id}`}
                                                              onSelect={() => updateOptionCategory(question.id, option.id, category.id, category.teacherEmailKey)}
                                                              className="flex items-center"
                                                              style={{
                                                                backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                                                              }}
                                                            >
                                                              {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                                                style: { color: category.color }, 
                                                                size: 16, 
                                                                className: 'mr-2' 
                                                              })}
                                                              <span className="truncate">{category.name}</span>
                                                              <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                                                ({teacherNames[category.teacherEmailKey] || category.teacherEmailKey})
                                                              </span>
                                                            </DropdownMenuItem>
                                                          );
                                                        })}
                                                      </DropdownMenuSubContent>
                                                    </DropdownMenuSub>
                                                  </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                
                                                {/* By Staff option */}
                                                <DropdownMenuSub>
                                                  <DropdownMenuSubTrigger>
                                                    <Users className="h-4 w-4 mr-2" />
                                                    By Staff
                                                  </DropdownMenuSubTrigger>
                                                  <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                                    {Object.entries(teacherCategories).map(([teacherEmailKey, categories]) => (
                                                      <DropdownMenuSub key={teacherEmailKey}>
                                                        <DropdownMenuSubTrigger className="w-full">
                                                          <div className="truncate">
                                                            {teacherNames[teacherEmailKey] || teacherEmailKey}
                                                          </div>
                                                        </DropdownMenuSubTrigger>
                                                        <DropdownMenuSubContent>
                                                          {categories
                                                            .filter(category => !category.archived)
                                                            .map(category => {
                                                              const isSelected = option.category === category.id;
                                                              
                                                              return (
                                                                <DropdownMenuItem
                                                                  key={category.id}
                                                                  onSelect={() => updateOptionCategory(question.id, option.id, category.id, teacherEmailKey)}
                                                                  className="flex items-center"
                                                                  style={{
                                                                    backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                                                                  }}
                                                                >
                                                                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                                                    style: { color: category.color }, 
                                                                    size: 16, 
                                                                    className: 'mr-2' 
                                                                  })}
                                                                  <span>{category.name}</span>
                                                                </DropdownMenuItem>
                                                              );
                                                            })}
                                                        </DropdownMenuSubContent>
                                                      </DropdownMenuSub>
                                                    ))}
                                                  </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          )}
                                          
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => removeOptionFromQuestion(question.id, option.id)}
                                            disabled={question.options.length <= 2}
                                            className={question.options.length <= 2 ? 'opacity-50 cursor-not-allowed' : 'text-red-500 hover:text-red-700'}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => addOptionToQuestion(question.id)}
                                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Option
                                    </Button>
                                  </div>
                                )}
                                
                                {/* Text Input Configuration - show for text input questions */}
                                {question.questionType === "text-input" && (
                                  <div className="mb-3">
                                    <Alert className="bg-blue-50 border-blue-200">
                                      <ClipboardList className="h-4 w-4 text-blue-500" />
                                      <AlertDescription className="text-blue-700">
                                        Students will be able to enter multi-line text responses to this question.
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                )}
                              </div>
                              
                              {/* Add Question Button after the last question */}
                              {qIndex === surveyQuestions.length - 1 && (
                                <div className="border-t px-4 py-3 bg-gray-50 flex justify-center">
                                  <div className="inline-flex border rounded-md overflow-hidden h-10">
                                    <div className="border-r bg-gray-50 flex items-center">
                                      <Select value={questionType} onValueChange={setQuestionType}>
                                        <SelectTrigger className="w-[180px] border-0 shadow-none focus:ring-0 h-10">
                                          <SelectValue placeholder="Question Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                          <SelectItem value="text-input">Text Input</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button 
                                      onClick={addSurveyQuestion} 
                                      className="rounded-none bg-purple-600 hover:bg-purple-700 h-10 flex-shrink-0"
                                    >
                                      <PlusCircle className="h-4 w-4 mr-1" />
                                      Add Question
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Notification Conditions */}
                <div className="space-y-4 mt-12">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Notification Target Conditions</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium mb-1 text-gray-600">Condition Logic:</div>
                        <Select 
                          value={conditionLogic} 
                          onValueChange={setConditionLogic}
                        >
                          <SelectTrigger className="w-80 border-2 font-medium" style={{ 
                            borderColor: conditionLogic === 'and' ? '#2563eb' : '#f59e0b',
                            background: conditionLogic === 'and' ? '#eff6ff' : '#fffbeb',
                            color: conditionLogic === 'and' ? '#1e40af' : '#b45309'
                          }}>
                            <SelectValue placeholder="Select logic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and" className="font-medium text-blue-700 bg-blue-50">ALL conditions must match (AND)</SelectItem>
                            <SelectItem value="or" className="font-medium text-amber-700 bg-amber-50">ANY condition can match (OR)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Alert className={conditionLogic === 'and' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}>
                    <div className="flex flex-col space-y-2 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Filter className={`h-4 w-4 ${conditionLogic === 'and' ? 'text-blue-500' : 'text-amber-500'}`} />
                          <AlertTitle className="ml-2">Targeting Logic: <span className={`font-bold ${conditionLogic === 'and' ? 'text-blue-700' : 'text-amber-700'}`}>
                            {conditionLogic === 'and' ? 'ALL CONDITIONS (AND)' : 'ANY CONDITION (OR)'}
                          </span></AlertTitle>
                        </div>
                        {editMode && matchingStudentCount > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`flex items-center gap-1 hover:bg-opacity-90 ${
                              conditionLogic === 'and' 
                                ? 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200' 
                                : 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200'
                            }`}
                            onClick={handleOpenStudentSelectionDialog}
                          >
                            <UsersRound className="h-3.5 w-3.5" />
                            <span>{matchingStudentCount} student{matchingStudentCount !== 1 ? 's' : ''}</span>
                            <Search className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        )}
                      </div>
                      <AlertDescription className={conditionLogic === 'and' ? 'text-blue-700' : 'text-amber-700'}>
                        {conditionLogic === 'and' 
                          ? 'Students must match ALL selected conditions below to see this notification' 
                          : 'Students will see this notification if they match ANY of the selected conditions below'}
                      </AlertDescription>
                    </div>
                  </Alert>
                  
                  <Accordion type="multiple">
                    {/* Student State - Featured at the very top */}
                    <AccordionItem value="active-future-archived" className="mb-6 border-2 border-teal-300 rounded-lg overflow-hidden shadow-md">
                      <AccordionTrigger className="text-base font-medium px-4 py-4 bg-teal-100 hover:bg-teal-200 transition-colors">
                        <div className="flex items-center">
                          <div className="bg-teal-200 p-1.5 rounded-md mr-2">
                            <Circle className="h-5 w-5 text-teal-700" />
                          </div>
                          <span className="text-teal-900">State</span>
                        </div>
                        {selectedActiveFutureArchivedValues.length > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-teal-200 text-teal-800">
                            {selectedActiveFutureArchivedValues.length} selected
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="space-y-4">
                          <Alert variant="info" className="bg-teal-50 border-teal-200">
                            <AlertDescription className="text-sm text-teal-700">
                              Select state options to target specific student statuses. Students will be included if they match any of the selected states.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 pt-2">
                            {ACTIVE_FUTURE_ARCHIVED_OPTIONS.map(option => {
                              const isSelected = selectedActiveFutureArchivedValues.includes(option.value);
                              
                              return (
                                <div 
                                  key={option.value}
                                  className={`border rounded-md p-3 cursor-pointer transition-colors flex items-center ${
                                    isSelected ? 'bg-teal-50 border-teal-300' : 'hover:bg-gray-50'
                                  }`}
                                  onClick={() => {
                                    setConditionsChanged(true);
                                    
                                    if (isSelected) {
                                      // Remove if already selected
                                      setSelectedActiveFutureArchivedValues(
                                        selectedActiveFutureArchivedValues.filter(val => val !== option.value)
                                      );
                                    } else {
                                      // Add if not selected
                                      setSelectedActiveFutureArchivedValues([
                                        ...selectedActiveFutureArchivedValues,
                                        option.value
                                      ]);
                                    }
                                  }}
                                >
                                  <div 
                                    className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                                      isSelected ? 'bg-teal-500 text-white' : 'border border-gray-300'
                                    }`}
                                  >
                                    {isSelected && <CheckCircle className="w-4 h-4" />}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: option.color }}
                                    ></div>
                                    <span>{option.value}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {selectedActiveFutureArchivedValues.length > 0 && (
                            <div className="mt-3 flex">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setConditionsChanged(true);
                                  setSelectedActiveFutureArchivedValues(['Active']);
                                }}
                              >
                                Reset to Default (Active)
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Student Categories */}
                    <AccordionItem value="student-categories" className="mb-6 border-2 border-indigo-300 rounded-lg overflow-hidden shadow-md">
                      <AccordionTrigger className="text-base font-medium px-4 py-4 bg-indigo-100 hover:bg-indigo-200 transition-colors">
                        <div className="flex items-center">
                          <div className="bg-indigo-200 p-1.5 rounded-md mr-2">
                            <Grid2X2 className="h-5 w-5 text-indigo-700" />
                          </div>
                          <span className="text-indigo-900">Student Categories</span>
                        </div>
                        {selectedCategories.length > 0 && (
                          <Badge variant="secondary" className="ml-2 bg-indigo-200 text-indigo-800">
                            {selectedCategories.reduce((count, cat) => {
                              const categoryIds = Object.values(cat)[0];
                              return count + (categoryIds ? categoryIds.length : 0);
                            }, 0)} selected
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="space-y-4">
                          <Alert variant="info" className="bg-indigo-50 border-indigo-200">
                            <AlertDescription className="text-sm text-indigo-700">
                              Select categories to target specific groups of students. Students with any of the selected categories will receive this notification.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="flex flex-wrap gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                                  <div className="flex items-center">
                                    <Filter className="h-4 w-4 mr-1" />
                                    Select Categories
                                    <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                                  </div>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-56">
                                {/* By Staff option */}
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Users className="h-4 w-4 mr-2" />
                                    By Staff
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                    {Object.entries(teacherCategories).map(([teacherEmailKey, categories]) => (
                                      <DropdownMenuSub key={teacherEmailKey}>
                                        <DropdownMenuSubTrigger className="w-full">
                                          <div className="truncate">
                                            {teacherNames[teacherEmailKey] || teacherEmailKey}
                                          </div>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuSubContent>
                                          {categories
                                            .filter(category => !category.archived)
                                            .map(category => {
                                              const isSelected = selectedCategories.some(cat => 
                                                cat[teacherEmailKey] && 
                                                cat[teacherEmailKey].includes(category.id)
                                              );
                                              
                                              return (
                                                <DropdownMenuItem
                                                  key={category.id}
                                                  onSelect={() => handleCategoryChange(category.id, teacherEmailKey)}
                                                  className="flex items-center"
                                                  style={{
                                                    backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                                                  }}
                                                >
                                                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                                    style: { color: category.color }, 
                                                    size: 16, 
                                                    className: 'mr-2' 
                                                  })}
                                                  <span>{category.name}</span>
                                                </DropdownMenuItem>
                                              );
                                            })}
                                        </DropdownMenuSubContent>
                                      </DropdownMenuSub>
                                    ))}
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                {/* By Type option */}
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Grid2X2 className="h-4 w-4 mr-2" />
                                    By Type
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                                    {categoryTypes.map((type) => {
                                      const categoryData = groupCategoriesByType 
                                                          ? groupCategoriesByType()[type.id] || [] 
                                                          : [];
                                      
                                      if (categoryData.length === 0) return null;
                                      
                                      return (
                                        <DropdownMenuSub key={type.id}>
                                          <DropdownMenuSubTrigger className="w-full">
                                            <div className="flex items-center">
                                              {React.createElement(
                                                iconMap[type.icon] || Circle,
                                                { 
                                                  className: "h-4 w-4 mr-2 flex-shrink-0",
                                                  style: { color: type.color }
                                                }
                                              )}
                                              <span className="truncate">{type.name}</span>
                                            </div>
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent>
                                            {categoryData.map((category) => {
                                              const isSelected = selectedCategories.some(cat => 
                                                cat[category.teacherEmailKey] && 
                                                cat[category.teacherEmailKey].includes(category.id)
                                              );
                                              
                                              return (
                                                <DropdownMenuItem
                                                  key={`${category.teacherEmailKey}-${category.id}`}
                                                  onSelect={() => handleCategoryChange(category.id, category.teacherEmailKey)}
                                                  className="flex items-center"
                                                  style={{
                                                    backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                                                  }}
                                                >
                                                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                                    style: { color: category.color }, 
                                                    size: 16, 
                                                    className: 'mr-2' 
                                                  })}
                                                  <span className="truncate">{category.name}</span>
                                                  <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                                    ({teacherNames[category.teacherEmailKey] || category.teacherEmailKey})
                                                  </span>
                                                </DropdownMenuItem>
                                              );
                                            })}
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                      );
                                    })}
                                    
                                    {/* Uncategorized section */}
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger>
                                        <Circle className="h-4 w-4 mr-2" />
                                        Uncategorized
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        {groupCategoriesByType && groupCategoriesByType()['uncategorized']?.map((category) => {
                                          const isSelected = selectedCategories.some(cat => 
                                            cat[category.teacherEmailKey] && 
                                            cat[category.teacherEmailKey].includes(category.id)
                                          );
                                          
                                          return (
                                            <DropdownMenuItem
                                              key={`${category.teacherEmailKey}-${category.id}`}
                                              onSelect={() => handleCategoryChange(category.id, category.teacherEmailKey)}
                                              className="flex items-center"
                                              style={{
                                                backgroundColor: isSelected ? `${category.color}20` : 'transparent',
                                              }}
                                            >
                                              {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                                style: { color: category.color }, 
                                                size: 16, 
                                                className: 'mr-2' 
                                              })}
                                              <span className="truncate">{category.name}</span>
                                              <span className="ml-2 text-xs text-gray-500 flex-shrink-0">
                                                ({teacherNames[category.teacherEmailKey] || category.teacherEmailKey})
                                              </span>
                                            </DropdownMenuItem>
                                          );
                                        })}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {selectedCategories.length > 0 && (
                            <div className="mt-4 border rounded-md p-4 bg-indigo-50 border-indigo-200">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium text-indigo-900">Selected Categories</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedCategories([])}
                                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                                >
                                  Clear All
                                </Button>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {selectedCategories.flatMap(teacherCat => {
                                  const teacherEmailKey = Object.keys(teacherCat)[0];
                                  const categoryIds = teacherCat[teacherEmailKey] || [];
                                  
                                  return categoryIds.map(categoryId => {
                                    // Find the category details
                                    const category = teacherCategories[teacherEmailKey]?.find(c => c.id === categoryId);
                                    if (!category) return null;
                                    
                                    return (
                                      <div
                                        key={`${teacherEmailKey}-${categoryId}`}
                                        className="flex items-center rounded-full px-3 py-1.5 text-sm shadow-sm"
                                        style={{ color: category.color, backgroundColor: `${category.color}20` }}
                                      >
                                        {iconMap[category.icon] && React.createElement(iconMap[category.icon], { 
                                          size: 14,
                                          className: 'mr-1.5',
                                        })}
                                        <span className="mr-1.5">{category.name}</span>
                                        <X 
                                          className="h-3.5 w-3.5 cursor-pointer opacity-70 hover:opacity-100" 
                                          onClick={() => handleCategoryChange(categoryId, teacherEmailKey)}
                                        />
                                      </div>
                                    );
                                  });
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Student Types */}
                    <AccordionItem value="student-types" className="mb-4 border border-blue-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors">
                        Student Types
                        {selectedStudentTypes.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedStudentTypes.length} selected
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                          {STUDENT_TYPE_OPTIONS.map(option => {
                            const Icon = option.icon;
                            const isSelected = selectedStudentTypes.includes(option.value);
                            
                            return (
                              <div 
                                key={option.value}
                                className={`border rounded-md p-3 cursor-pointer transition-colors flex items-center ${
                                  isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleMultiSelectChange('studentTypes', option.value)}
                              >
                                <div 
                                  className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                                    isSelected ? 'bg-blue-500 text-white' : 'border border-gray-300'
                                  }`}
                                >
                                  {isSelected && <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {Icon && <Icon style={{ color: option.color }} className="w-4 h-4" />}
                                  <span>{option.value}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {selectedStudentTypes.length > 0 && (
                          <div className="mt-3 flex">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedStudentTypes([])}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Student State section moved to the top */}
                    {/* Schedule End Date Range */}
                    <AccordionItem value="date-range" className="mb-4 border border-rose-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-3 bg-rose-50 hover:bg-rose-100 transition-colors">
                        Schedule End Date Range
                        {scheduleEndDateRange.start && scheduleEndDateRange.end && (
                          <Badge variant="secondary" className="ml-2">
                            Range Set
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="date-range-start">Start Date</Label>
                            <div className="relative">
                              <Input 
                                id="date-range-start"
                                type="date" 
                                value={scheduleEndDateRange.start} 
                                onChange={(e) => setScheduleEndDateRange({
                                  ...scheduleEndDateRange,
                                  start: e.target.value
                                })}
                                className="w-full pr-10"
                              />
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="date-range-end">End Date</Label>
                            <div className="relative">
                              <Input 
                                id="date-range-end"
                                type="date" 
                                value={scheduleEndDateRange.end} 
                                onChange={(e) => setScheduleEndDateRange({
                                  ...scheduleEndDateRange,
                                  end: e.target.value
                                })}
                                className="w-full pr-10"
                              />
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Alert variant="info" className="bg-blue-50">
                            <CalendarClock className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-sm text-blue-700">
                              This will target students whose schedule end date falls within this range (format: YYYY-MM-DD)
                            </AlertDescription>
                          </Alert>
                        </div>
                        
                        {(scheduleEndDateRange.start || scheduleEndDateRange.end) && (
                          <div className="mt-3 flex">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setScheduleEndDateRange({ start: '', end: '' })}
                            >
                              Clear Date Range
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Age Range */}
                    <AccordionItem value="age-range" className="mb-4 border border-cyan-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-3 bg-cyan-50 hover:bg-cyan-100 transition-colors">
                        Age Range
                        {ageRange.min && ageRange.max && (
                          <Badge variant="secondary" className="ml-2">
                            {ageRange.min}-{ageRange.max} years
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="age-min">Minimum Age</Label>
                            <Input 
                              id="age-min"
                              type="number" 
                              min="5"
                              max="100"
                              value={ageRange.min} 
                              onChange={(e) => setAgeRange({
                                ...ageRange,
                                min: e.target.value
                              })}
                              placeholder="e.g. 14"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="age-max">Maximum Age</Label>
                            <Input 
                              id="age-max"
                              type="number"
                              min="5"
                              max="100" 
                              value={ageRange.max} 
                              onChange={(e) => setAgeRange({
                                ...ageRange,
                                max: e.target.value
                              })}
                              placeholder="e.g. 18"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <Alert variant="info" className="bg-blue-50">
                            <Users className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-sm text-blue-700">
                              This will target students whose age falls within this range
                            </AlertDescription>
                          </Alert>
                        </div>
                        
                        {(ageRange.min || ageRange.max) && (
                          <div className="mt-3 flex">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setAgeRange({ min: '', max: '' })}
                            >
                              Clear Age Range
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Email filtering removed */}
                  </Accordion>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveNotification}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {currentNotification ? 'Update' : 'Save'} Notification
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="all">All Notifications</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="inactive">Inactive</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={fetchNotifications}
                    className="ml-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Refreshing Counts...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh Student Counts
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-auto pt-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
                      <p className="mt-4 text-gray-600">Loading notifications...</p>
                    </div>
                  </div>
                ) : getFilteredNotifications().length === 0 ? (
                  <div className="text-center py-12 border rounded-md bg-gray-50">
                    <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-600 mb-1">No Notifications</h3>
                    <p className="text-gray-500 mb-6">
                      {activeTab === 'all' 
                        ? 'No notifications have been created yet' 
                        : activeTab === 'active'
                          ? 'No active notifications found'
                          : 'No inactive notifications found'}
                    </p>
                    <Button onClick={() => setEditMode(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Notification
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Title</TableHead>
                          <TableHead>Content Preview</TableHead>
                          <TableHead>Conditions</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="w-[100px]">Students</TableHead>
                          <TableHead className="w-[180px]">Last Updated</TableHead>
                          <TableHead className="text-right w-[180px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getFilteredNotifications().map(notification => {
                          const matchingStudentCount = getMatchingStudentCount(notification);
                          
                          return (
                            <TableRow key={notification.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span>{notification.title}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 flex items-center space-x-2">
                                  <Badge variant="outline" className={`
                                    ${notification.type === 'survey' && !notification.repeatInterval
                                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                      : notification.type === 'survey' && notification.repeatInterval
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                      : notification.type === 'weekly-survey'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                      : notification.type === 'once' || 
                                        (notification.type === 'notification' && !notification.repeatInterval)
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-green-50 text-green-700 border-green-200'
                                    }
                                  `}>
                                    {notification.type === 'survey' && !notification.repeatInterval
                                      ? 'One-time Survey' 
                                      : notification.type === 'survey' && notification.repeatInterval
                                        ? 'Repeating Survey'
                                      : notification.type === 'weekly-survey'
                                        ? 'Weekly Survey'
                                      : notification.type === 'once' || 
                                        (notification.type === 'notification' && !notification.repeatInterval)
                                        ? 'One-time'
                                        : 'Recurring'
                                    }
                                  </Badge>
                                  
                                  {notification.important && (
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                      Important
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-700 max-w-xs truncate">
                                  {notification.type === 'survey' || notification.type === 'weekly-survey'
                                    ? renderSurveyPreview(notification)
                                    : truncateContent(notification.content)
                                  }
                                </div>
                              </TableCell>
                              <TableCell>
                                {renderConditionBadges(notification)}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={notification.active ? "success" : "secondary"}
                                  className={notification.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                                >
                                  {notification.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {isLoading && notification.active ? (
                                  <div className="flex items-center">
                                    <Badge variant="outline" className="bg-blue-50 border-blue-200 flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Refreshing...
                                    </Badge>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className={`${notification.active 
                                    ? "bg-blue-50 border-blue-200" 
                                    : "bg-gray-50 border-gray-200 text-gray-500"}`}
                                  >
                                    {typeof matchingStudentCount === 'number' 
                                      ? `${matchingStudentCount} ${matchingStudentCount === 1 ? 'student' : 'students'}`
                                      : `${matchingStudentCount}`
                                    }
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {formatDate(notification.updatedAt || notification.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => toggleNotificationStatus(notification)}
                                    title={notification.active ? 'Deactivate' : 'Activate'}
                                  >
                                    {notification.active ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEditNotification(notification)}
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleOpenMessagingSheet(notification)}
                                    title="Message Students"
                                    disabled={matchingStudentCount === 0}
                                    className={matchingStudentCount === 0 ? 'opacity-50' : ''}
                                  >
                                    <MailPlus className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setNotificationToDelete(notification);
                                      setDeleteDialogOpen(true);
                                    }}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {notificationToDelete && (
            <div className="py-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium">{notificationToDelete.title}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  {notificationToDelete.type === 'survey' || notificationToDelete.type === 'weekly-survey'
                    ? `${notificationToDelete.type === 'weekly-survey' ? 'Weekly ' : ''}Survey with ${notificationToDelete.surveyQuestions?.length || 0} questions`
                    : truncateContent(notificationToDelete.content, 150)
                  }
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteNotification}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Save Confirmation Dialog */}
      <SaveConfirmationDialog
        open={saveConfirmationOpen}
        onOpenChange={setSaveConfirmationOpen}
        onEmailStudents={handleEmailStudents}
        onJustSave={handleJustSave}
        matchingStudentCount={savedNotification ? getMatchingStudentCount(savedNotification) : 0}
      />
      
      {/* Student Messaging Sheet */}
      <Sheet open={messagingSheetOpen} onOpenChange={setMessagingSheetOpen}>
      <SheetContent side="right" className="w-[90%] p-0 max-w-screen overflow-hidden flex flex-col">
          <SheetHeader className="px-6 py-4 border-b flex-shrink-0">
            <div className="flex items-center">
              <UsersRound className="h-5 w-5 mr-2 text-blue-600" />
              <SheetTitle>Student Messaging</SheetTitle>
            </div>
            <SheetDescription>
              {selectedNotification && (
                <div className="flex flex-wrap items-center mt-1">
                  <span className="text-sm text-gray-500 mr-2">Notification:</span>
                  <Badge variant="outline">{selectedNotification.title}</Badge>
                  <span className="text-sm text-gray-500 mx-2">•</span>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} selected
                  </Badge>
                </div>
              )}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-grow overflow-auto">
            {filteredStudents.length > 0 ? (
              <StudentMessaging 
                selectedStudents={filteredStudents} 
                onClose={() => setMessagingSheetOpen(false)}
                notificationTitle={selectedNotification?.title || ''}
                notificationContent={selectedNotification?.content || ''}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <UsersRound className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-center max-w-md">
                  No students match the selected notification conditions. Try adjusting the conditions to include more students.
                </p>
              </div>
            )}
          </div>
          <SheetFooter className="px-6 py-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => setMessagingSheetOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      {/* Student Selection Dialog */}
      <StudentSelectionDialog
        open={studentSelectionDialogOpen}
        onOpenChange={setStudentSelectionDialogOpen}
        students={selectedStudents}
        title="Selected Students" 
        description="These students match your notification criteria"
      />
      
      {/* Add CSS for the ReactQuill editor to ensure proper styling */}
      <style jsx global>{`
        .quill-container {
          margin-bottom: 30px;
        }
        
        .ql-container {
          min-height: 100px;
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }
        
        .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          background-color: #f9fafb;
        }
        
        .ql-editor {
          min-height: 100px;
          font-size: 0.875rem;
        }
        
        /* Improved styling for list formatting */
        .ql-editor ol, .ql-editor ul {
          padding-left: 1.5em;
        }
        
        .ql-editor li {
          padding-left: 0.5em;
        }
        
        /* Nested list styling */
        .ql-editor li > ol, .ql-editor li > ul {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
        
        /* Style for different list types */
        .ql-editor ol {
          list-style-type: decimal;
        }
        
        .ql-editor ol ol {
          list-style-type: lower-alpha;
        }
        
        .ql-editor ol ol ol {
          list-style-type: lower-roman;
        }
      `}</style>
    </div>
  );
}

export default StudentDashboardNotifications;