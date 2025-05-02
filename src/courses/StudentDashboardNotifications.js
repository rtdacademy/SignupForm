import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, push, remove, update } from 'firebase/database';
import { toast } from 'sonner';
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
} from '../components/ui/dialog';
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
  AlertTriangle,
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
  BarChart,
  Move,
  PlusCircle,
  X,
  CircleCheck,
  Circle,
  Mail,
  UsersRound,
  MailPlus
} from 'lucide-react';
import { 
  STUDENT_TYPE_OPTIONS,
  DIPLOMA_MONTH_OPTIONS,
  COURSE_OPTIONS,
  getSchoolYearOptions
} from '../config/DropdownOptions';
import { useSchoolYear } from '../context/SchoolYearContext';
import StudentMessaging from '../StudentManagement/StudentMessaging';

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

// Save Confirmation Dialog Component
const SaveConfirmationDialog = ({ open, onOpenChange, onEmailStudents, onJustSave, matchingStudentCount }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
      </DialogContent>
    </Dialog>
  );
};

function StudentDashboardNotifications() {
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
  const [type, setType] = useState('recurring'); // Changed from 'frequency' to 'type'
  const [conditionLogic, setConditionLogic] = useState('and');
  
  // State for survey questions
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  // State for survey question type
  const [questionType, setQuestionType] = useState("multiple-choice");
  
  // State for filtering conditions
  const [selectedStudentTypes, setSelectedStudentTypes] = useState([]);
  const [selectedDiplomaMonths, setSelectedDiplomaMonths] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedSchoolYears, setSelectedSchoolYears] = useState([]);
  const [scheduleEndDateRange, setScheduleEndDateRange] = useState({ start: '', end: '' });
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  
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
  
  // School year options
  const schoolYearOptions = getSchoolYearOptions();
  
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);
  
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
  
  // Filter students based on notification conditions
  const filterStudentsByConditions = (notification) => {
    if (!studentSummaries || !studentSummaries.length) {
      return [];
    }
    
    const conditions = notification.conditions || {};
    const isAndLogic = conditions.logic !== 'or'; // Default to 'and' logic if not specified
    
    // Check if we have specific emails first - if so, this is our primary filter
    if (conditions.emails && conditions.emails.length > 0) {
      // Only return students with matching emails, regardless of other conditions
      return studentSummaries.filter(student => 
        student.StudentEmail && conditions.emails.includes(student.StudentEmail.toLowerCase())
      );
    }
    
    // If no emails specified, proceed with normal filtering
    return studentSummaries.filter(student => {
      // Array to track which conditions are met
      const conditionResults = [];
      
      // Check student type condition
      if (conditions.studentTypes && conditions.studentTypes.length > 0) {
        const studentTypesMatch = conditions.studentTypes.includes(student.StudentType_Value);
        conditionResults.push(studentTypesMatch);
      }
      
      // Check diploma month condition
      if (conditions.diplomaMonths && conditions.diplomaMonths.length > 0) {
        const diplomaMonthsMatch = conditions.diplomaMonths.includes(student.DiplomaMonthChoices_Value);
        conditionResults.push(diplomaMonthsMatch);
      }
      
      // Check course condition
      if (conditions.courses && conditions.courses.length > 0) {
        const coursesMatch = conditions.courses.includes(student.CourseID);
        conditionResults.push(coursesMatch);
      }
      
      // Check school year condition
      if (conditions.schoolYears && conditions.schoolYears.length > 0) {
        const schoolYearsMatch = conditions.schoolYears.includes(student.School_x0020_Year_Value);
        conditionResults.push(schoolYearsMatch);
      }
      
      // Check schedule end date range condition
      if (conditions.scheduleEndDateRange && 
          conditions.scheduleEndDateRange.start && 
          conditions.scheduleEndDateRange.end && 
          student.ScheduleEndDate) {
        
        const scheduleEndDate = new Date(student.ScheduleEndDate);
        const rangeStart = new Date(conditions.scheduleEndDateRange.start);
        const rangeEnd = new Date(conditions.scheduleEndDateRange.end);
        
        const dateInRange = scheduleEndDate >= rangeStart && scheduleEndDate <= rangeEnd;
        conditionResults.push(dateInRange);
      }
      
      // Check age range condition
      if (conditions.ageRange && 
          typeof conditions.ageRange.min === 'number' && 
          typeof conditions.ageRange.max === 'number' && 
          typeof student.age === 'number') {
        
        const ageInRange = student.age >= conditions.ageRange.min && student.age <= conditions.ageRange.max;
        conditionResults.push(ageInRange);
      }
      
      // If no conditions were evaluated, return false
      if (conditionResults.length === 0) {
        return false;
      }
      
      // Check all conditions based on logic
      if (isAndLogic) {
        // AND logic - all conditions must be true
        return conditionResults.every(result => result === true);
      } else {
        // OR logic - at least one condition must be true
        return conditionResults.some(result => result === true);
      }
    });
  };
  
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
        const notificationsArray = Object.keys(notificationsData).map(key => ({
          id: key,
          ...notificationsData[key]
        }));
        
        // Sort by createdAt (newest first)
        notificationsArray.sort((a, b) => b.createdAt - a.createdAt);
        
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
    setType('recurring'); // Changed from 'frequency'
    setConditionLogic('and');
    setSelectedStudentTypes([]);
    setSelectedDiplomaMonths([]);
    setSelectedCourses([]);
    setSelectedSchoolYears([]);
    setScheduleEndDateRange({ start: '', end: '' });
    setAgeRange({ min: '', max: '' });
    setSelectedEmails([]);
    setEmailInput('');
    setSurveyQuestions([]); // Reset survey questions
    setQuestionType("multiple-choice"); // Reset question type
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
              { id: Date.now().toString() + '-1', text: '' },
              { id: Date.now().toString() + '-2', text: '' }
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
              { id: Date.now().toString(), text: '' }
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
    
    // Set filtering conditions
    setSelectedStudentTypes(notification.conditions?.studentTypes || []);
    setSelectedDiplomaMonths(notification.conditions?.diplomaMonths || []);
    setSelectedCourses(notification.conditions?.courses || []);
    setSelectedSchoolYears(notification.conditions?.schoolYears || []);
    setSelectedEmails(notification.conditions?.emails || []);
    
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
    
    // Validate survey questions if type is 'survey'
    if (type === 'survey') {
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
    
    // Check if at least one condition is set
    const hasStudentTypes = selectedStudentTypes.length > 0;
    const hasDiplomaMonths = selectedDiplomaMonths.length > 0;
    const hasCourses = selectedCourses.length > 0;
    const hasSchoolYears = selectedSchoolYears.length > 0;
    const hasScheduleEndDateRange = scheduleEndDateRange.start && scheduleEndDateRange.end;
    const hasAgeRange = ageRange.min && ageRange.max;
    const hasEmails = selectedEmails.length > 0;
    
    if (!hasStudentTypes && !hasDiplomaMonths && !hasCourses && !hasSchoolYears && 
        !hasScheduleEndDateRange && !hasAgeRange && !hasEmails) {
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
      
      // Build notification object
      const notificationData = {
        title: title.trim(),
        content: sanitizedContent, // Always save content for all notification types
        active: isActive,
        type: type, // Changed from 'frequency'
        conditions: {
          logic: conditionLogic
        },
        updatedAt: Date.now()
      };
      
      // Add survey questions and always set surveyCompleted to false
      if (type === 'survey') {
        notificationData.surveyQuestions = surveyQuestions;
        notificationData.surveyCompleted = false;
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
      
      if (selectedEmails.length > 0) {
        notificationData.conditions.emails = selectedEmails;
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
      await update(notificationRef, { 
        active: !notification.active,
        updatedAt: Date.now()
      });
      
      toast.success(`Notification ${!notification.active ? 'activated' : 'deactivated'} successfully`);
      await fetchNotifications();
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast.error('Failed to update notification status');
    }
  };
  
  // Handle multi-select changes
  const handleMultiSelectChange = (field, value) => {
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
          setSelectedSchoolYears(selectedSchoolYears.filter(year => year !== value));
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
  
  // Handle email input and validation
  const handleAddEmail = () => {
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
    
    setSelectedEmails([...selectedEmails, emailInput.trim().toLowerCase()]);
    setEmailInput('');
  };
  
  const handleRemoveEmail = (email) => {
    setSelectedEmails(selectedEmails.filter(e => e !== email));
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
    
    if (conditions.emails && conditions.emails.length > 0) {
      badges.push(
        <Badge key="emails" variant="outline" className="mr-1 mb-1">
          {conditions.emails.length} {conditions.emails.length === 1 ? 'Email' : 'Emails'}
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
        <Badge key="ageRange" variant="outline" className="mr-1 mb-1">
          Age {conditions.ageRange.min}-{conditions.ageRange.max}
        </Badge>
      );
    }

    // Add survey badge if type is survey
    if (notification.type === 'survey') {
      badges.push(
        <Badge key="survey" variant="secondary" className="mr-1 mb-1 bg-purple-100 text-purple-800">
          Survey ({notification.surveyQuestions?.length || 0} questions)
        </Badge>
      );
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
    return filterStudentsByConditions(notification).length;
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
                    </div>
                  </div>
                  
                  {/* Type (previously Frequency) */}
                  <div>
                    <Label>Notification Type</Label>
                    <div className="grid grid-cols-3 gap-4 mt-1">
                      {/* One-time Option */}
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
                        onClick={() => setType('once')}
                        style={{ 
                          backgroundColor: type === 'once' ? '#f0f9ff' : 'transparent',
                          borderColor: type === 'once' ? '#3b82f6' : '#e5e7eb'
                        }}
                      >
                        <div className={`h-4 w-4 rounded-full ${type === 'once' ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                        <div>
                          <p className="font-medium">One-time</p>
                          <p className="text-sm text-gray-500">Show once per student, then never again</p>
                        </div>
                      </div>
                      
                      {/* Recurring Option */}
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
                        onClick={() => setType('recurring')}
                        style={{ 
                          backgroundColor: type === 'recurring' ? '#f0f9ff' : 'transparent',
                          borderColor: type === 'recurring' ? '#3b82f6' : '#e5e7eb'
                        }}
                      >
                        <div className={`h-4 w-4 rounded-full ${type === 'recurring' ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                        <div>
                          <p className="font-medium">Recurring</p>
                          <p className="text-sm text-gray-500">Show every time student logs in</p>
                        </div>
                      </div>
                      
                      {/* Survey Option */}
                      <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer"
                        onClick={() => setType('survey')}
                        style={{ 
                          backgroundColor: type === 'survey' ? '#f0f8ff' : 'transparent',
                          borderColor: type === 'survey' ? '#8a2be2' : '#e5e7eb'
                        }}
                      >
                        <div className={`h-4 w-4 rounded-full ${type === 'survey' ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                        <div>
                          <p className="font-medium">Survey</p>
                          <p className="text-sm text-gray-500">Collect responses from students</p>
                        </div>
                      </div>
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
                  
                  {/* Survey Questions Editor (only shown for survey type) */}
                  {type === 'survey' && (
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
                    <Select 
                      value={conditionLogic} 
                      onValueChange={setConditionLogic}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select logic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="and">ALL conditions (AND)</SelectItem>
                        <SelectItem value="or">ANY condition (OR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Alert>
                    <Filter className="h-4 w-4" />
                    <AlertTitle>Targeting Logic:</AlertTitle>
                    <AlertDescription>
                      {conditionLogic === 'and' 
                        ? 'Students must match ALL selected conditions to see this notification' 
                        : 'Students will see this notification if they match ANY of the selected conditions'}
                    </AlertDescription>
                  </Alert>
                  
                  <Accordion type="multiple">
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
                    
                    {/* Diploma Months */}
                    <AccordionItem value="diploma-months" className="mb-4 border border-emerald-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-3 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                        Diploma Months
                        {selectedDiplomaMonths.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedDiplomaMonths.length} selected
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                          {DIPLOMA_MONTH_OPTIONS.map(option => {
                            const isSelected = selectedDiplomaMonths.includes(option.value);
                            
                            return (
                              <div 
                                key={option.value}
                                className={`border rounded-md p-3 cursor-pointer transition-colors flex items-center ${
                                  isSelected ? 'bg-emerald-50 border-emerald-300' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleMultiSelectChange('diplomaMonths', option.value)}
                              >
                                <div 
                                  className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                                    isSelected ? 'bg-emerald-500 text-white' : 'border border-gray-300'
                                  }`}
                                >
                                  {isSelected && <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: option.color }}
                                  ></div>
                                  <span>{option.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {selectedDiplomaMonths.length > 0 && (
                          <div className="mt-3 flex">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedDiplomaMonths([])}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* Courses */}
                    <AccordionItem value="courses" className="mb-4 border border-purple-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-3 bg-purple-50 hover:bg-purple-100 transition-colors">
                        Courses
                        {selectedCourses.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedCourses.length} selected
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="border rounded-md mb-3">
                          <Input
                            placeholder="Search courses..."
                            className="border-0 focus:ring-0"
                            onChange={(e) => {
                              // Filter courses could be added here if needed
                            }}
                          />
                        </div>
                        
                        <div className="max-h-72 overflow-y-auto border rounded-md">
                          {COURSE_OPTIONS.map(option => {
                            const Icon = option.icon;
                            const isSelected = selectedCourses.includes(option.courseId);
                            
                            return (
                              <div 
                                key={option.courseId}
                                className={`p-2 border-b cursor-pointer transition-colors flex items-center ${
                                  isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleMultiSelectChange('courses', option.courseId)}
                              >
                                <div 
                                  className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                                    isSelected ? 'bg-purple-500 text-white' : 'border border-gray-300'
                                  }`}
                                >
                                  {isSelected && <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div className="flex items-center space-x-2">
                                  {Icon && <Icon style={{ color: option.color }} className="w-4 h-4" />}
                                  <span>{option.label}</span>
                                  <span className="text-xs text-gray-500">({option.courseId})</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {selectedCourses.length > 0 && (
                          <div className="mt-3 flex justify-between items-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedCourses([])}
                            >
                              Clear Selection
                            </Button>
                            <span className="text-sm text-gray-500">
                              {selectedCourses.length} courses selected
                            </span>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    
                    {/* School Years */}
                    <AccordionItem value="school-years" className="mb-4 border border-amber-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-3 bg-amber-50 hover:bg-amber-100 transition-colors">
                        School Years
                        {selectedSchoolYears.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedSchoolYears.length} selected
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                          {schoolYearOptions.map(option => {
                            const isSelected = selectedSchoolYears.includes(option.value);
                            
                            return (
                              <div 
                                key={option.value}
                                className={`border rounded-md p-3 cursor-pointer transition-colors flex items-center ${
                                  isSelected ? 'bg-amber-50 border-amber-300' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleMultiSelectChange('schoolYears', option.value)}
                              >
                                <div 
                                  className={`w-5 h-5 rounded mr-3 flex items-center justify-center ${
                                    isSelected ? 'bg-amber-500 text-white' : 'border border-gray-300'
                                  }`}
                                >
                                  {isSelected && <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: option.color }}
                                  ></div>
                                  <span>{option.value} {option.isDefault ? '(Current)' : ''}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        {selectedSchoolYears.length > 0 && (
                          <div className="mt-3 flex">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSchoolYears([])}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                    
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
                    
                    {/* Specific Student Emails */}
                    <AccordionItem value="specific-emails" className="mb-4 border border-lime-200 rounded-lg overflow-hidden">
                      <AccordionTrigger className="text-base font-medium px-4 py-3 bg-lime-50 hover:bg-lime-100 transition-colors">
                        Specific Student Emails
                        {selectedEmails.length > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {selectedEmails.length} {selectedEmails.length === 1 ? 'email' : 'emails'}
                          </Badge>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="p-4 bg-white">
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Enter student email"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddEmail();
                                }
                              }}
                            />
                            <Button onClick={handleAddEmail}>Add</Button>
                          </div>
                          
                          <div className="mt-3">
                            <Alert variant="info" className="bg-blue-50">
                              <AlertDescription className="text-sm text-blue-700">
                                This notification will only be shown to students with these specific email addresses.
                                Use this for targeting specific students or for testing with your own email.
                              </AlertDescription>
                            </Alert>
                          </div>
                          
                          {selectedEmails.length > 0 && (
                            <div className="mt-4 space-y-2 border rounded-md p-4">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">Selected Emails ({selectedEmails.length})</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedEmails([])}
                                >
                                  Clear All
                                </Button>
                              </div>
                              <div className="max-h-40 overflow-y-auto mt-2">
                                {selectedEmails.map(email => (
                                  <div 
                                    key={email} 
                                    className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 border-b last:border-b-0"
                                  >
                                    <span className="text-sm">{email}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleRemoveEmail(email)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
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
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
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
                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                  <Badge variant="outline" className={`
                                    ${notification.type === 'survey' 
                                      ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                      : notification.type === 'once' || notification.frequency === 'once'
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-green-50 text-green-700 border-green-200'
                                    }
                                  `}>
                                    {notification.type === 'survey' 
                                      ? 'Survey' 
                                      : notification.type === 'once' || notification.frequency === 'once'
                                        ? 'One-time'
                                        : 'Recurring'
                                    }
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-700 max-w-xs truncate">
                                  {notification.type === 'survey' 
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
                                <Badge variant="outline" className="bg-blue-50 border-blue-200">
                                  {matchingStudentCount} {matchingStudentCount === 1 ? 'student' : 'students'}
                                </Badge>
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
                  {notificationToDelete.type === 'survey'
                    ? `Survey with ${notificationToDelete.surveyQuestions?.length || 0} questions`
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
      <SheetContent side="right" className="w-[80%] p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-center">
              <UsersRound className="h-5 w-5 mr-2 text-blue-600" />
              <SheetTitle>Student Messaging</SheetTitle>
            </div>
            <SheetDescription>
              {selectedNotification && (
                <div className="flex items-center mt-1">
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
          <div className="h-[calc(100vh-10rem)] overflow-hidden">
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
          <SheetFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setMessagingSheetOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
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