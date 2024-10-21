import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { STATUS_OPTIONS, STATUS_CATEGORIES, getStatusColor, getStatusAllowsAutoStatus } from '../config/DropdownOptions';
import { ChevronDown, Plus, CheckCircle, BookOpen, MessageSquare, X, Calendar, Zap, History, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { getDatabase, ref, set, get, child, push } from 'firebase/database';
import { Button } from "../components/ui/button";
import { Toggle } from "../components/ui/toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../components/ui/dropdown-menu";
import ChatApp from '../chat/ChatApp';

// Import specific icon components
import {
  Circle, Square, Triangle, BookOpen as BookOpenIcon, GraduationCap, Trophy, Target, ClipboardCheck, Brain, Lightbulb, Clock, Calendar as CalendarIcon, BarChart, TrendingUp, AlertCircle, HelpCircle, MessageCircle, Users, Presentation, FileText, Bookmark
} from 'lucide-react';

// Import useAuth from AuthContext
import { useAuth } from '../context/AuthContext';

// Map icon names to icon components
const iconMap = {
  'circle': Circle,
  'square': Square,
  'triangle': Triangle,
  'book-open': BookOpenIcon,
  'graduation-cap': GraduationCap,
  'trophy': Trophy,
  'target': Target,
  'clipboard-check': ClipboardCheck,
  'brain': Brain,
  'lightbulb': Lightbulb,
  'clock': Clock,
  'calendar': CalendarIcon,
  'bar-chart': BarChart,
  'trending-up': TrendingUp,
  'alert-circle': AlertCircle,
  'help-circle': HelpCircle,
  'message-circle': MessageCircle,
  'users': Users,
  'presentation': Presentation,
  'file-text': FileText,
  'bookmark': Bookmark,
};

// Define color palette outside the component
const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
  '#9575CD', '#4DD0E1', '#81C784', '#DCE775', '#FFB74D',
  '#F06292', '#BA68C8', '#4FC3F7', '#4DB6AC', '#FFF176',
  '#FF8A65', '#A1887F', '#90A4AE', '#E57373', '#64B5F6'
];

const getColorFromInitials = (initials) => {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colorPalette[Math.abs(hash) % colorPalette.length];
};

const ProgressBar = ({ percent, icon, label }) => {
  const isValidPercent = typeof percent === 'number' && !isNaN(percent);
  
  if (!isValidPercent) return null;

  return (
    <div className="flex items-center mt-2">
      {icon}
      <div className="ml-2 flex-grow">
        <div className="text-[10px] text-gray-500 mb-1">{label}</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
      <div className="ml-2 text-[10px] font-semibold">{percent}%</div>
    </div>
  );
};

const StudentCard = React.memo(({ 
  student, 
  index, 
  selectedStudentId, 
  onStudentSelect, 
  teacherCategories,
  user_email_key
}) => {
  const isSelected = student.id === selectedStudentId;
  const bgColor = isSelected ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  const initials = `${student.firstName[0]}${student.lastName[0]}`;
  const avatarColor = getColorFromInitials(initials);

  // Initialize statusValue from student.Status_Value
  const [statusValue, setStatusValue] = useState(student.Status_Value);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [teacherNames, setTeacherNames] = useState({});
  const [autoStatus, setAutoStatus] = useState(student.autoStatus || false);

  // State variables for status history dialog
  const [isStatusHistoryOpen, setIsStatusHistoryOpen] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loadingStatusHistory, setLoadingStatusHistory] = useState(false);

  // Access the logged-in teacher's info
  const { user } = useAuth();

  const customHoverStyle = "hover:bg-accent hover:text-accent-foreground";

  useEffect(() => {
    setStatusValue(student.Status_Value);
    setAutoStatus(student.autoStatus || false);
  }, [student.Status_Value, student.autoStatus]);

  useEffect(() => {
    const fetchTeacherNames = async () => {
      const db = getDatabase();
      const staffRef = ref(db, 'staff');
      try {
        const snapshot = await get(staffRef);
        if (snapshot.exists()) {
          const staffData = snapshot.val();
          const names = Object.entries(staffData).reduce((acc, [email, data]) => {
            acc[email] = `${data.firstName} ${data.lastName}`;
            return acc;
          }, {});
          setTeacherNames(names);
        }
      } catch (error) {
        console.error("Error fetching teacher names:", error);
      }
    };

    fetchTeacherNames();
  }, []);

  const handleStatusChange = useCallback(async (newStatus) => {
    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const statusRef = ref(db, `students/${studentKey}/courses/${courseId}/Status/Value`);
    const autoStatusRef = ref(db, `students/${studentKey}/courses/${courseId}/autoStatus`);

    try {
      const previousStatus = statusValue;

      await set(statusRef, newStatus);
      setStatusValue(newStatus);

      // Find the selected status option
      const selectedStatusOption = STATUS_OPTIONS.find(option => option.value === newStatus);
      
      // Check if the selected status allows auto status
      let newAutoStatus;
      if (selectedStatusOption && selectedStatusOption.allowAutoStatusChange === true) {
        await set(autoStatusRef, true);
        setAutoStatus(true);
        newAutoStatus = true;
      } else {
        await set(autoStatusRef, false);
        setAutoStatus(false);
        newAutoStatus = false;
      }

      // Create a new log entry in statusLog
      const statusLogRef = ref(db, `students/${studentKey}/courses/${courseId}/statusLog`);
      const newLogRef = push(statusLogRef);
      await set(newLogRef, {
        timestamp: new Date().toISOString(),
        status: newStatus,
        previousStatus: previousStatus || '',
        updatedBy: {
          name: user.displayName || user.email,
          email: user.email,
        },
        updatedByType: 'teacher',
        autoStatus: newAutoStatus,
      });

    } catch (error) {
      console.error("Error updating status:", error);
    }
  }, [student.id, statusValue, user]);

  const handleAutoStatusToggle = useCallback(async () => {
    if (!getStatusAllowsAutoStatus(statusValue)) return;

    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const autoStatusRef = ref(db, `students/${studentKey}/courses/${courseId}/autoStatus`);

    try {
      const newAutoStatus = !autoStatus;
      await set(autoStatusRef, newAutoStatus);
      setAutoStatus(newAutoStatus);
    } catch (error) {
      console.error("Error updating auto status:", error);
    }
  }, [student.id, autoStatus, statusValue]);

  const groupedTeacherCategories = useMemo(() => {
    if (!teacherCategories || typeof teacherCategories !== 'object') {
      console.error('teacherCategories is not an object:', teacherCategories);
      return {};
    }

    if (Object.values(teacherCategories).every(Array.isArray)) {
      const grouped = teacherCategories;
      return grouped;
    }

    if (Array.isArray(teacherCategories)) {
      const grouped = { [user_email_key]: teacherCategories };
      return grouped;
    }

    console.error('Unexpected teacherCategories format:', teacherCategories);
    return {};
  }, [teacherCategories, user_email_key]);

  const filteredTeacherCategories = useMemo(() => {
    if (!teacherCategories || typeof teacherCategories !== 'object') {
      console.error('teacherCategories is not an object:', teacherCategories);
      return {};
    }

    const studentCategories = student.categories || {};

    const filtered = Object.entries(teacherCategories).reduce((acc, [teacherEmailKey, categories]) => {
      if (Array.isArray(categories)) {
        const filteredCategories = categories.filter(category => {
          const isAlreadyAdded = studentCategories[teacherEmailKey] && 
                                 studentCategories[teacherEmailKey][category.id] === true;
          return !isAlreadyAdded;
        });
        if (filteredCategories.length > 0) {
          acc[teacherEmailKey] = filteredCategories;
        }
      }
      return acc;
    }, {});

    return filtered;
  }, [teacherCategories, student.categories]);

  const handleCardClick = useCallback(() => {
    onStudentSelect(student);
  }, [onStudentSelect, student]);

  const handleSelectClick = useCallback((event) => {
    event.stopPropagation();
    if (!isSelected) {
      onStudentSelect(student);
    }
  }, [isSelected, onStudentSelect, student]);

  const handleOpenChat = useCallback((event) => {
    event.stopPropagation();
    setIsChatOpen(true);
  }, []);

  const initialParticipantsMemo = useMemo(() => {
    return [
      {
        email: student.StudentEmail,
        displayName: `${student.firstName} ${student.lastName}`,
        type: 'student',
      },
    ];
  }, [student.StudentEmail, student.firstName, student.lastName]);

  const lastWeekStatus = student.StatusCompare;
  const lastWeekColor = getStatusColor(lastWeekStatus);

  // Compute selectedCategories from student.categories
  const selectedCategories = useMemo(() => {
    if (student.categories) {
      const activeCategoriesSet = new Set();
      const activeCategories = Object.entries(student.categories).flatMap(([teacherEmailKey, categories]) =>
        Object.entries(categories)
          .filter(([_, value]) => value === true)
          .map(([categoryId]) => {
            const uniqueKey = `${categoryId}-${teacherEmailKey}`;
            if (!activeCategoriesSet.has(uniqueKey)) {
              activeCategoriesSet.add(uniqueKey);
              return { id: categoryId, teacherEmailKey };
            }
            return null; // Skip duplicates
          })
      ).filter(Boolean); // Remove nulls

      return activeCategories;
    } else {
      return [];
    }
  }, [student.categories]);

  const currentStatusColor = useMemo(() => getStatusColor(statusValue), [statusValue]);

  const StatusOption = React.memo(({ option }) => (
    <div className="flex items-center w-full">
      <div 
        className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
        style={{ backgroundColor: option.color }}
      />
      <span style={{ color: option.color }}>{option.value}</span>
    </div>
  ));

  const isAutoStatusAllowed = useMemo(() => getStatusAllowsAutoStatus(statusValue), [statusValue]);

  const handleCategoryChange = useCallback(async (categoryId, teacherEmailKey) => {
    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const categoryRef = ref(db, `students/${studentKey}/courses/${courseId}/categories/${teacherEmailKey}/${categoryId}`);

    try {
      await set(categoryRef, true);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  }, [student.id]);

  const handleRemoveCategory = useCallback(async (categoryId, teacherEmailKey) => {
    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const categoryRef = ref(db, `students/${studentKey}/courses/${courseId}/categories/${teacherEmailKey}/${categoryId}`);

    try {
      await set(categoryRef, null);
    } catch (error) {
      console.error("Error removing category:", error);
    }
  }, [student.id]);

  // Handle opening the status history dialog
  const handleOpenStatusHistory = useCallback(async () => {
    setIsStatusHistoryOpen(true);
    setLoadingStatusHistory(true);

    const db = getDatabase();
    const lastUnderscoreIndex = student.id.lastIndexOf('_');
    const studentKey = student.id.slice(0, lastUnderscoreIndex);
    const courseId = student.id.slice(lastUnderscoreIndex + 1);
    const statusLogRef = ref(db, `students/${studentKey}/courses/${courseId}/statusLog`);

    try {
      const snapshot = await get(statusLogRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const historyArray = Object.values(data).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setStatusHistory(historyArray);
      } else {
        setStatusHistory([]);
      }
    } catch (error) {
      console.error("Error fetching status history:", error);
    } finally {
      setLoadingStatusHistory(false);
    }
  }, [student.id]);

  // New function to determine grade color and icon
  const getGradeColorAndIcon = useCallback((grade) => {
    if (grade < 50) return { color: 'text-red-500', icon: <AlertTriangle className="w-4 h-4" /> };
    if (grade < 70) return { color: 'text-black', icon: null };
    return { color: 'text-green-500', icon: <CheckCircle className="w-4 h-4" /> };
  }, []);

  // function to format grade
  const formatGrade = useCallback((grade) => {
    if (grade === undefined || grade === null) return 'N/A';
    const roundedGrade = Math.round(grade);
    return `${roundedGrade}%`;
  }, []);

  // New function to format lessons behind/ahead
  const formatLessons = useCallback((lessonsBehind) => {
    if (lessonsBehind === undefined || lessonsBehind === null) return null;
    const absValue = Math.abs(lessonsBehind);
    if (lessonsBehind < 0) {
      return { value: absValue, icon: <ArrowUp className="w-4 h-4 text-green-500" /> };
    }
    return { value: absValue, icon: <ArrowDown className="w-4 h-4 text-red-500" /> };
  }, []);

  return (
    <>
      <Card
        className={`cursor-pointer transition-shadow duration-200 ${bgColor} hover:shadow-md mb-3`}
        onClick={handleCardClick}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback 
                className="text-sm font-medium" 
                style={{ backgroundColor: avatarColor, color: '#FFFFFF' }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-medium truncate">
                {student.firstName} {student.lastName}
              </CardTitle>
              <p className="text-xs text-gray-500 truncate">{student.StudentEmail}</p>
            </div>
            {isSelected && <CheckCircle className="w-5 h-5 text-blue-500" />}
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
         {/* Course, Grade, and Progress on the same line */}
<div className="flex items-center text-xs mb-2">
  <span className="flex-grow">{student.Course_Value}</span>
  {student.grade !== undefined && student.grade !== null && (
    <span className={`text-xs font-bold ${getGradeColorAndIcon(student.grade).color} flex items-center mr-2`}>
      Gr. {formatGrade(student.grade)}
      {getGradeColorAndIcon(student.grade).icon}
    </span>
  )}
  {student.adherenceMetrics && formatLessons(student.adherenceMetrics.lessonsBehind) && (
    <span className="text-xs font-bold flex items-center">
      {formatLessons(student.adherenceMetrics.lessonsBehind).value}
      {formatLessons(student.adherenceMetrics.lessonsBehind).icon}
    </span>
  )}
</div>
          
          {/* Status Dropdown, Last Week Status, and Auto Status Toggle */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex-grow">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                    style={{ borderColor: currentStatusColor, color: currentStatusColor }}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: currentStatusColor }}
                      />
                      {statusValue}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {STATUS_CATEGORIES.map(category => (
                    <DropdownMenuSub key={category}>
                      <DropdownMenuSubTrigger className={customHoverStyle}>
                        {category}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {STATUS_OPTIONS.filter(option => option.category === category).map(option => (
                          <DropdownMenuItem
                            key={option.value}
                            onSelect={() => handleStatusChange(option.value)}
                            className={`${customHoverStyle} hover:bg-opacity-10`}
                            style={{ 
                              backgroundColor: option.value === statusValue ? `${option.color}20` : 'transparent',
                            }}
                          >
                            <StatusOption option={option} />
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-shrink-0 text-center" style={{ minWidth: '50px' }}>
              <div className="text-[9px] text-gray-500 leading-tight">LW</div>
              <div className="text-[10px] font-semibold" style={{ color: lastWeekColor }}>
                {lastWeekStatus}
              </div>
            </div>
            {/* Auto Status Toggle */}
            <Toggle
              pressed={autoStatus}
              onPressedChange={handleAutoStatusToggle}
              size="sm"
              className={`h-10 px-2 flex items-center justify-center ${!isAutoStatusAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!isAutoStatusAllowed}
            >
              <span className="text-[10px] leading-tight">Auto</span>
              {autoStatus ? (
                <Zap className="h-3 w-3 text-yellow-500 ml-1" />
              ) : (
                <X className="h-3 w-3 text-red-500 ml-1" />
              )}
            </Toggle>
          </div>

          {/* Category Selection */}
          <div className="mt-2 flex items-center">
            <DropdownMenu open={categoryMenuOpen} onOpenChange={setCategoryMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 text-xs font-normal"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                  <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {Object.entries(filteredTeacherCategories).map(([teacherEmailKey, categories]) => (
                  <DropdownMenuSub key={teacherEmailKey}>
                    <DropdownMenuSubTrigger className={customHoverStyle}>
                      {teacherNames[teacherEmailKey] || teacherEmailKey}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {Array.isArray(categories) && categories.length > 0 ? categories.map(category => (
                        <DropdownMenuItem
                          key={category.id}
                          onSelect={() => handleCategoryChange(category.id, teacherEmailKey)}
                          className={customHoverStyle}
                        >
                          <div className="flex items-center">
                            {iconMap[category.icon] && React.createElement(iconMap[category.icon], { style: { color: category.color }, size: 16, className: 'mr-2' })}
                            <span>{category.name}</span>
                          </div>
                        </DropdownMenuItem>
                      )) : (
                        <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
                      )}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Display selected categories */}
          <div className="flex flex-wrap mt-2">
            {selectedCategories.map(({ id, teacherEmailKey }) => {
              const category = groupedTeacherCategories[teacherEmailKey]?.find(c => c.id === id);
              if (!category) {
                console.warn(`Category not found: id=${id}, teacherEmailKey=${teacherEmailKey}`);
                return null;
              }

              const uniqueKey = `${id}-${teacherEmailKey}-${student.id}`;

              return (
                <div 
                  key={uniqueKey}
                  className="flex items-center bg-gray-100 rounded-full px-2 py-1 text-xs mr-1 mb-1"
                  style={{ color: category.color }}
                >
                  {iconMap[category.icon] && React.createElement(iconMap[category.icon], { size: 12, className: 'mr-1' })}
                  {category.name}
                  <X
                    className="ml-1 cursor-pointer"
                    size={12}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCategory(id, teacherEmailKey);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Conditional Progress Bars */}
          {(!student.adherenceMetrics || student.adherenceMetrics.lessonsBehind === undefined) && (
            <>
              {student.PercentScheduleComplete > 0 && (
                <ProgressBar
                  percent={student.PercentScheduleComplete}
                  icon={<Calendar className="w-4 h-4 text-blue-500" />}
                  label="Schedule Progress"
                />
              )}
              {student.PercentCompleteGradebook > 0 && (
                <ProgressBar
                  percent={student.PercentCompleteGradebook}
                  icon={<BookOpen className="w-4 h-4 text-green-500" />}
                  label="Gradebook Progress"
                />
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end mt-2 space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleOpenChat}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleOpenStatusHistory}
            >
              <History className="w-4 h-4 mr-1" />
              Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-[90vw] w-[1000px] h-[80vh] max-h-[800px] p-4 flex flex-col">
          <DialogHeader className="mb-4 bg-white">
            <DialogTitle>
              Messaging
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden rounded-lg border border-gray-200">
            <ChatApp
              mode="popup"
              courseInfo={null}
              courseTeachers={[]}
              courseSupportStaff={[]}
              initialParticipants={initialParticipantsMemo}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Status History Dialog */}
      <Dialog open={isStatusHistoryOpen} onOpenChange={setIsStatusHistoryOpen}>
        <DialogContent className="max-w-[90vw] w-[600px] h-[70vh] max-h-[600px] p-4 flex flex-col">
          <DialogHeader className="mb-4 bg-white">
            <DialogTitle>
              Status Update History
            </DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-auto">
            {loadingStatusHistory ? (
              <div className="text-center">Loading...</div>
            ) : statusHistory.length > 0 ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Timestamp</th>
                    <th className="px-2 py-1 text-left">Status</th>
                    <th className="px-2 py-1 text-left">Previous Status</th>
                    <th className="px-2 py-1 text-left">Updated By</th>
                    {/* Removed Auto Status Column */}
                  </tr>
                </thead>
                <tbody>
                  {statusHistory.map((logEntry, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="px-2 py-1">{new Date(logEntry.timestamp).toLocaleString()}</td>
                      <td className="px-2 py-1">{logEntry.status}</td>
                      <td className="px-2 py-1">
                        {typeof logEntry.previousStatus === 'object' && logEntry.previousStatus !== null
                          ? logEntry.previousStatus.Value
                          : logEntry.previousStatus}
                      </td>
                      <td className="px-2 py-1">
                        {logEntry.updatedByType === 'teacher' ? (
                          <>
                            {logEntry.updatedBy.name} ({logEntry.updatedBy.email})
                          </>
                        ) : (
                          'Auto Status'
                        )}
                      </td>
                      {/* Removed Auto Status Cell */}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center">No status history available.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default StudentCard;
