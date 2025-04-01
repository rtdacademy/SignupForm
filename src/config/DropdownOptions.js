// src/config/DropdownOptions.js

import { 
  GraduationCap,
  Home,
  Sun,
  User,
  Globe,
  Calculator,  // for Math courses
  Code,        // for Coding courses
  Beaker,      // for Science courses
  BookOpen,    // for other course types
  Play,           // for Active
  CheckCircle,    // for Completed
  ArrowRight,     // for Continuing
  XCircle,        // for Incomplete
  ClipboardList,  // for Registered
  SignalZero,      // for Withdrawn
  CheckCircle2, 
  AlertCircle, 
  AlertOctagon, 
  Archive,
  MinusCircle,
  Calendar,        // for Term 1
  CalendarDays,    // for Term 2
  CalendarClock,   // for Full Year
  Umbrella         // for Summer
} from 'lucide-react';

export const PAYMENT_STATUS_OPTIONS = [
  { value: "paid", color: "#10B981" },     // Green for paid
  { value: "active", color: "#3B82F6" },   // Blue for active
  { value: "unpaid", color: "#EF4444" },   // Red for unpaid
  { value: "not-required", color: "#9CA3AF" }  // Gray for not required
];

// Add the helper function for payment status colors
export const getPaymentStatusColor = (status) => {
  const option = PAYMENT_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.color : "#6B7280";  // Default to gray if status not found
};

export const ALERT_LEVELS = {
  GREEN: {
    value: 'green',
    icon: CheckCircle2,
    color: '#16A34A'  // Using a consistent green from your existing colors
  },
  YELLOW: {
    value: 'yellow',
    icon: AlertCircle,
    color: '#F59E0B'  // Using a consistent yellow from your existing colors
  },
  RED: {
    value: 'red',
    icon: AlertOctagon,
    color: '#DC2626'  // Using a consistent red from your existing colors
  },
  PURPLE: {
    value: 'purple',
    icon: Archive,
    color: '#9333EA'  // Using a consistent purple from your existing colors
  },
  GREY: {
    value: 'grey',
    icon: MinusCircle,
    color: '#6B7280'  // Using Tailwind's gray-500 for consistency
  }
};

export const STATUS_OPTIONS = [
  //{ value: "Newly Enrolled", color: "#3B82F6", category: "Registration", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.YELLOW.value },
  { 
    value: "Starting on (Date)", 
    color: "#14B8A6", 
    category: "Progress", 
    allowAutoStatusChange: false, 
    alertLevel: ALERT_LEVELS.GREEN,
    tooltip: "Initial status set after student is registered in PASI system"
    
  },
  { 
    value: "On Track", 
    color: "#10B981", 
    category: "Progress", 
    allowAutoStatusChange: true, 
    alertLevel: ALERT_LEVELS.GREEN,
    tooltip: "Student is within 2 lessons of their scheduled progress"
  },
  { 
    value: "Rocking it!", 
    color: "#059669", 
    category: "Progress", 
    allowAutoStatusChange: true, 
    alertLevel: ALERT_LEVELS.GREEN,
    tooltip: "Student is 3 or more lessons ahead of schedule"
  },
  { 
    value: "Final Teacher Approval", 
    color: "#2563EB", 
    category: "Progress", 
    allowAutoStatusChange: false, 
    alertLevel: ALERT_LEVELS.GREEN,
    tooltip: "Awaiting teacher review for course completion"
  },
  //{ value: "Updated Schedule", color: "#6366F1", category: "Auto", allowAutoStatusChange: true, alertLevel: ALERT_LEVELS.GREEN.value },
  { 
    value: "⚠️ Behind", 
    color: "#FCD34D", 
    category: "Progress", 
    allowAutoStatusChange: true, 
    alertLevel: ALERT_LEVELS.YELLOW,
    tooltip: "Student is 2-4 lessons behind schedule"
  },
  { 
    value: "❗ Behind", 
    color: "#EF4444", 
    category: "Progress", 
    allowAutoStatusChange: true, 
    alertLevel: ALERT_LEVELS.RED,
    tooltip: "Student is 5 or more lessons behind and at risk of removal"
  },
  { 
    value: "Not Active", 
    color: "#6B7280", 
    category: "Progress", 
    allowAutoStatusChange: true, 
    alertLevel: ALERT_LEVELS.RED,
    tooltip: "Student hasn't completed any lessons recently and is at risk of removal"
  },
  //{ value: "No Orientation Yet", color: "#F59E0B", category: "Schedule-related", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.YELLOW.value },
  //{ value: "Waiting on Schedule", color: "#8B5CF6", category: "Schedule-related", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.YELLOW.value },
  //{ value: "On Hold", color: "#EC4899", category: "Schedule-related", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.YELLOW.value },
  //{ value: "Hasn't Started", color: "#9CA3AF", category: "Schedule-related", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.YELLOW.value },
  { 
    value: "Unenrolled", 
    color: "#DC2626", 
    category: "Final", 
    allowAutoStatusChange: false, 
    alertLevel: ALERT_LEVELS.PURPLE,
    action: "PENDING_FINALIZATION",
    activeFutureArchivedValue: "Pending",
    tooltip: "Student has been removed from the course",
    delay:true
  },
  { 
    value: "Course Completed", 
    color: "#16A34A", 
    category: "Final", 
    allowAutoStatusChange: false, 
    alertLevel: ALERT_LEVELS.PURPLE,
    action: "PENDING_FINALIZATION",
    activeFutureArchivedValue: "Pending",
    tooltip: "Student has successfully completed all course requirements",
    delay:true
  },
  { 
    value: "Exception", 
    color: "#6B7280", 
    category: "Other", 
    allowAutoStatusChange: true, 
    alertLevel: ALERT_LEVELS.GREY,
    tooltip: "Special case status for students with unique circumstances"
  },

  { 
    value: "Resuming on (date)", 
    color: "#06B6D4", 
    category: "Other", 
    allowAutoStatusChange: false, 
    alertLevel: ALERT_LEVELS.GREY,
    tooltip: "Student is on temporary pause with scheduled return date",
    delay:true
  },
  { 
    value: "Locked Out", 
    color: "#7C3AED", 
    category: "Other", 
    allowAutoStatusChange: false, 
    activeFutureArchivedValue: "Pending",
    alertLevel: ALERT_LEVELS.GREY,
    tooltip: "Student access has been temporarily suspended"
  }
 
  //{ value: "Default", color: "#6B7280", category: "Progress", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.YELLOW,tooltip: "Default status when no other status applies"},

  //{ value: "✅ Mark Added to PASI", color: "#059669", category: "Administrative", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.PURPLE.value },
  //{ value: "☑️ Removed From PASI (Funded)", color: "#9333EA", category: "Administrative", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.PURPLE.value },
  //{ value: "✗ Removed (Not Funded)", color: "#DC2626", category: "Administrative", allowAutoStatusChange: false, alertLevel: ALERT_LEVELS.PURPLE.value }
];

export const getStatusColor = (status) => {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.color : "#6B7280";  // Default to gray if status not found
};

export const STATUS_CATEGORIES = [
  "Progress",
  "Schedule-related",
  "Administrative"
];

export const getStatusAllowsAutoStatus = (status) => {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.allowAutoStatusChange : true;  // Default to true if status not found
};

export const COURSE_TYPE_ICONS = {
  Math: Calculator,
  Science: Beaker,
  Options: Code,
  Other: BookOpen
};

export const COURSE_OPTIONS = [
  // Grade 10 Courses - Blue theme
  { 
    value: "Math 10-4",
    label: "Math 10-4", 
    courseType: "Math",
    grade: 10,
    color: "#3B82F6",
    icon: Calculator,
    courseId: 82,
    pasiCode: "KAE1782"
  },
  { 
    value: "Math 10-3",
    label: "Math 10-3", 
    courseType: "Math",
    grade: 10,
    color: "#3B82F6",
    icon: Calculator,
    courseId: 78,
    pasiCode: "MAT1793"
  },
  { 
    value: "Math 10C",
    label: "Math 10C", 
    courseType: "Math",
    grade: 10,
    color: "#3B82F6",
    icon: Calculator,
    courseId: 97,
    pasiCode: "MAT1791"
  },
  { 
    value: "Math 15",
    label: "Math 15", 
    courseType: "Math",
    grade: 10,
    color: "#3B82F6",
    icon: Calculator,
    courseId: 90,
    pasiCode: "LDC1515"
  },

  { 
    value: "Coding",
    label: "Coding", 
    courseType: "Options",
    grade: 10,
    color: "#3B82F6",
    icon: Code,
    courseId: 1111
  },

  // Grade 11 Courses - Purple theme
  { 
    value: "Math 20-4",
    label: "Math 20-4", 
    courseType: "Math",
    grade: 11,
    color: "#8B5CF6",
    icon: Calculator,
    courseId: 84,
    pasiCode: "KAE2782"
  },
  { 
    value: "Math 20-3",
    label: "Math 20-3", 
    courseType: "Math",
    grade: 11,
    color: "#8B5CF6",
    icon: Calculator,
    courseId: 96,
    pasiCode: "MAT2793"
  },
  { 
    value: "Math 20-2",
    label: "Math 20-2", 
    courseType: "Math",
    grade: 11,
    color: "#8B5CF6",
    icon: Calculator,
    courseId: 98,
    pasiCode: "MAT2792"
  },
  { 
    value: "Math 20-1",
    label: "Math 20-1", 
    courseType: "Math",
    grade: 11,
    color: "#8B5CF6",
    icon: Calculator,
    courseId: 95,
    pasiCode: "MAT2791"
  },
  // New Physics 20 Course
  { 
    value: "Physics 20",
    label: "Physics 20", 
    courseType: "Science",
    grade: 11,
    color: "#8B5CF6", // Using the grade 11 color scheme (purple)
    icon: Beaker,
    courseId: 137,
    pasiCode: "SCN2797"
  },

  // Grade 12 Courses - Green theme
  { 
    value: "Math 30-3",
    label: "Math 30-3", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 86,
    pasiCode: "MAT3793"
  },
  { 
    value: "Math 30-2",
    label: "Math 30-2", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 87,
    pasiCode: "MAT3792"
  },
  { 
    value: "Math 30-1",
    label: "Math 30-1", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 89,
    pasiCode: "MAT3791"
  },
  { 
    value: "Math 31",
    label: "Math 31 (Calculus)", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 93,
    pasiCode: "MAT3211"
  },
   { 
    value: "Math 31",
    label: "Math 31 (Calculus)", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 93,
    pasiCode: "MAT3211"
  },
];

// Color scheme reference
export const GRADE_COLORS = {
  10: "#3B82F6", // Blue
  11: "#8B5CF6", // Purple
  12: "#10B981"  // Green
};

// Helper functions
export const getCourseInfo = (courseValue) => {
  const course = COURSE_OPTIONS.find(opt => opt.value === courseValue);
  return {
    color: course ? course.color : "#6B7280",
    icon: course ? course.icon : BookOpen,
    grade: course ? course.grade : null,
    courseType: course ? course.courseType : null,
    courseId: course ? course.courseId : null
  };
};

// Keep your existing getCourseColor function for backward compatibility
export const getCourseColor = (course) => {
  const courseInfo = getCourseInfo(course);
  return courseInfo.color;
};

// Helper function to group courses by type
export const getCoursesByType = () => {
  return COURSE_OPTIONS.reduce((acc, course) => {
    if (!acc[course.courseType]) {
      acc[course.courseType] = [];
    }
    acc[course.courseType].push(course);
    return acc;
  }, {});
};

// Helper function to group courses by grade
export const getCoursesByGrade = () => {
  return COURSE_OPTIONS.reduce((acc, course) => {
    if (!acc[course.grade]) {
      acc[course.grade] = [];
    }
    acc[course.grade].push(course);
    return acc;
  }, {});
};

export const PASI_COURSES = [
  // Grade 10 Math Courses
  {
    pasiCode: "KAE1782",
    description: "Mathematics 10-4",
    credits: 5,
    color: "#3B82F6", // Blue
    courseType: "Math",
    grade: 10,
    courseId: [82]
  },
  {
    pasiCode: "MAT1793",
    description: "Mathematics 10-3",
    credits: 5,
    color: "#3B82F6",
    courseType: "Math",
    grade: 10,
    courseId: [78]
  },
  {
    pasiCode: "MAT1791",
    description: "Mathematics 10C",
    credits: 5,
    color: "#3B82F6",
    courseType: "Math",
    grade: 10,
    courseId: [97]
  },
  {
    pasiCode: "LDC1515",
    description: "Competencies in Math 15",
    credits: 3,
    color: "#3B82F6",
    courseType: "Math",
    grade: 10,
    courseId: [90]
  },

  // Grade 11 Math Courses
  {
    pasiCode: "KAE2782",
    description: "Mathematics 20-4",
    credits: 5,
    color: "#8B5CF6", // Purple
    courseType: "Math",
    grade: 11,
    courseId: [84]
  },
  {
    pasiCode: "MAT2793",
    description: "Mathematics 20-3",
    credits: 5,
    color: "#8B5CF6",
    courseType: "Math",
    grade: 11,
    courseId: [96]
  },
  {
    pasiCode: "MAT2792",
    description: "Mathematics 20-2",
    credits: 5,
    color: "#8B5CF6",
    courseType: "Math",
    grade: 11,
    courseId: [98]
  },
  {
    pasiCode: "MAT2791",
    description: "Mathematics 20-1",
    credits: 5,
    color: "#8B5CF6",
    courseType: "Math",
    grade: 11,
    courseId: [95]
  },
  // New Grade 11 Science Course: Physics 20
  {
    pasiCode: "SCN2797",
    description: "Physics 20",
    credits: 5,
    color: "#8B5CF6", // Same as grade 11 theme (purple)
    courseType: "Science",
    grade: 11,
    courseId: [137]
  },

  // Grade 12 Math Courses
  {
    pasiCode: "MAT3793",
    description: "Mathematics 30-3",
    credits: 5,
    color: "#10B981", // Green
    courseType: "Math",
    grade: 12,
    courseId: [86]
  },
  {
    pasiCode: "MAT3792",
    description: "Mathematics 30-2",
    credits: 5,
    color: "#10B981",
    courseType: "Math",
    grade: 12,
    courseId: [87]
  },
  {
    pasiCode: "MAT3791",
    description: "Mathematics 30-1",
    credits: 5,
    color: "#10B981",
    courseType: "Math",
    grade: 12,
    courseId: [89]
  },
  {
    pasiCode: "MAT3211",
    description: "Mathematics 31",
    credits: 5,
    color: "#10B981",
    courseType: "Math",
    grade: 12,
    courseId: [93]
  },

  // CTS Courses
  {
    pasiCode: "CSE1210",
    description: "Client-side Scripting 1",
    credits: 1,
    color: "#F97316", // Orange
    courseType: "Options",
    grade: 10,
    courseId: [1111]
  },
  {
    pasiCode: "COM1255",
    description: "E-Learning & Learning Management Systems",
    credits: 1,
    color: "#F97316",
    courseType: "Options",
    grade: 10,
    courseId: [82, 78, 97, 90, 84, 96, 98, 95, 86, 87, 89, 93, 1111] 
  },
  {
    pasiCode: "CSE1110",
    description: "Structured Programming 1",
    credits: 1,
    color: "#F97316",
    courseType: "Options",
    grade: 10,
    courseId: [1111]
  },
  {
    pasiCode: "CSE1120",
    description: "Structured Programming 2",
    credits: 1,
    color: "#F97316",
    courseType: "Options",
    grade: 10,
    courseId: [1111]
  },
  {
    pasiCode: "CSE1220",
    description: "Client-side Scripting 2",
    credits: 1,
    color: "#F97316",
    courseType: "Options",
    grade: 10,
    courseId: [1111]
  },
  {
    pasiCode: "CSE2110",
    description: "Client-side Scripting 3",
    credits: 1,
    color: "#F97316",
    courseType: "Options",
    grade: 11,
    courseId: [1111]
  },
  {
    pasiCode: "CSE1910",
    description: "CSE Project A",
    credits: 1,
    color: "#F97316",
    courseType: "Options",
    grade: 10,
    courseId: [1111]
  },
  {
    pasiCode: "INF2020",
    description: "Keyboarding",
    credits: 1,
    color: "#F97316",
    courseType: "Options",
    grade: 10,
    courseId: [82, 78, 97, 90, 84, 96, 98, 95, 86, 87, 89, 93, 1111] 
  }
];

// Helper function to get courses for dropdown
export const getPASICoursesForDropdown = () => {
  return PASI_COURSES.map(course => ({
    value: course.pasiCode,
    label: `${course.pasiCode} - ${course.description} (${course.credits} credits)`
  }));
};

// Helper function to get course info by PASI code
export const getPASICourseInfo = (pasiCode) => {
  return PASI_COURSES.find(course => course.pasiCode === pasiCode);
};

// Helper function to group PASI courses by type
export const getPASICoursesByType = () => {
  return PASI_COURSES.reduce((acc, course) => {
    if (!acc[course.courseType]) {
      acc[course.courseType] = [];
    }
    acc[course.courseType].push(course);
    return acc;
  }, {});
};


export const ACTIVE_FUTURE_ARCHIVED_OPTIONS = [
  { value: "Active", color: "#10B981" },     // Green
  { value: "Pending", color: "#8B5CF6" },  //Purple
  { value: "Registration", color: "#3B82F6" }, // Blue
  { value: "Archived", color: "#6B7280" }    // Gray
];

export const PASI_OPTIONS = [
  { value: "Yes", color: "#10B981" },   // Green
  { value: "No", color: "#EF4444" }     // Red
];



export const STUDENT_TYPE_OPTIONS = [
  { 
    value: "Non-Primary", 
    color: "#3B82F6", 
    icon: GraduationCap,
    description: "Students taking additional courses outside their primary institution"
  },
  { 
    value: "Home Education", 
    color: "#F59E0B", 
    icon: Home,
    description: "Students primarily educated at home"
  },
  { 
    value: "Summer School", 
    color: "#10B981", 
    icon: Sun,
    description: "Students enrolled in summer programs"
  },
  { 
    value: "Adult Student", 
    color: "#8B5CF6", 
    icon: User,
    description: "Adult learners and continuing education students"
  },
  { 
    value: "International Student", 
    color: "#EC4899", 
    icon: Globe,
    description: "Students from international jurisdictions"
  }
];

// Add a new helper function to get both color and icon
export const getStudentTypeInfo = (type) => {
  const option = STUDENT_TYPE_OPTIONS.find(opt => opt.value === type);
  return {
    color: option ? option.color : "#6B7280",
    icon: option ? option.icon : null,
    description: option ? option.description : null
  };
};

export const getStudentTypeColor = (type) => {
  const option = STUDENT_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.color : "#6B7280";  // Default to gray if student type not found
};

export const REGISTRATION_PERIODS = {
  REGULAR: 'REGULAR',
  SUMMER: 'SUMMER',
  NEXT_REGULAR: 'NEXT_REGULAR'
};

// Export the getStudentTypeMessageHTML function to the window object for backward compatibility
if (typeof window !== 'undefined') {
  window.getStudentTypeMessageHTML = getStudentTypeMessageHTML;
}

// Function to get formatted HTML messages for student types with compact styling
export function getStudentTypeMessageHTML(studentType, params) {
  if (!studentType || !params) return "";
  
  const { 
    period, 
    canRegisterForNextYear, 
    regularToSummer, 
    summerToRegular, 
    nextYearOpens, 
    sepCount, 
    homeEdDeadline 
  } = params;

  // Format dates consistently
  const formatDate = (date) => {
    if (!date) return "unknown date";
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
  };
  
  // Legacy message generation logic (keep this for backward compatibility)
  switch (studentType) {
    case 'Non-Primary':
      if (period === REGISTRATION_PERIODS.SUMMER) {
        return `
          <div class="prose prose-sm max-w-none">
            <p><strong>Non-Primary registration for the current year is closed.</strong></p>
            
            <p>You have two options:</p>
            <ol class="mt-1 mb-2 pl-5">
              <li>Register as a Summer School student until ${formatDate(summerToRegular)}</li>
              <li>Register for the next school year as a Non-Primary student</li>
            </ol>
            
            <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
              If you register for next year, you must have a primary registration with another school in September or you'll be classified as an Adult Student requiring payment.
            </p>
            
            <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
              If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
            </p>
          </div>
        `;
      
      } else if (period === REGISTRATION_PERIODS.REGULAR) {
        if (canRegisterForNextYear) {
          return `
            <div class="prose prose-sm max-w-none">
              <p>You have multiple options:</p>
              <ol class="mt-1 mb-2 pl-5">
                <li>Register for the current school year as a Non-Primary student until ${formatDate(regularToSummer)}</li>
                <li>Register as a Summer School student. Please note that your mark would not appear on your transcript until summer.</li>
                <li>Register for the next school year now</li>
              </ol>
              
              <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
                If you register for next year, you must have a primary registration with another school in September or you'll be classified as an Adult Student requiring payment.
              </p>
              
              <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
                If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
              </p>
            </div>
          `;
        }
        return `
          <div class="prose prose-sm max-w-none">
            <p>You have two options:</p>
            <ol class="mt-1 mb-2 pl-5">
              <li>Register for the current school year as a Non-Primary student until ${formatDate(regularToSummer)}</li>
              <li>Register as a Summer School student. Please note that your mark would not appear on your transcript until summer.</li>
            </ol>
            
            <p>Registration for next school year opens on ${formatDate(nextYearOpens)}.</p>
            
            <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
              When registering for next year, you must have a primary registration with another school in September to maintain Non-Primary status.
            </p>
            
            <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
              If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
            </p>
          </div>
        `;
      } else {
        return `
          <div class="prose prose-sm max-w-none">
            <p>Registration is now open for the next school year as a Non-Primary student.</p>
            
            <p>To ensure your courses count for semester one funding, please register before ${formatDate(sepCount)}.</p>
            
            <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
              You must have a primary registration with another school in September to qualify as a Non-Primary student or you'll be classified as an Adult Student requiring payment.
            </p>
          </div>
        `;
      }

      case 'Home Education':
        if (period === REGISTRATION_PERIODS.SUMMER) {
          return `
            <div class="prose prose-sm max-w-none">
              <p><strong>Home Education registration for the current year is closed.</strong></p>
              
              <p>You have two options:</p>
              <ol class="mt-1 mb-2 pl-5">
                <li>Register as a Summer School student until ${formatDate(summerToRegular)}</li>
                <li>Register for the next school year as a Home Education student</li>
              </ol>
              
              <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
                For next year, you must have a home education registration with a home school organization. Shared responsibility programs are not eligible.
              </p>
              
              <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
                If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
              </p>
            </div>
          `;
        } else if (period === REGISTRATION_PERIODS.REGULAR) {
          const today = new Date();
          const currentYear = today.getFullYear();
          const septFirst = new Date(currentYear, 8, 1); // September 1st (months are 0-indexed)
          const isNewAcademicYear = today >= septFirst;
          
          // Check if home education deadline has passed but only consider it if we're not in a new academic year
          if (homeEdDeadline && today > homeEdDeadline && !isNewAcademicYear) {
            return `
              <div class="prose prose-sm max-w-none">
                <p>The deadline for Home Education registration for the current school year has passed (${formatDate(homeEdDeadline)}).</p>
                
                <p>You have two options:</p>
                <ol class="mt-1 mb-2 pl-5">
                  <li>Wait until ${formatDate(regularToSummer)} to register as a Summer School student</li>
                  <li>Register for the next school year as a Home Education student</li>
                </ol>
                
                <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
                  For next year registration, you must have a home education registration with a home school organization, not a shared responsibility program.
                </p>
                
                <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
                  If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
                </p>
              </div>
            `;
          }
          
          if (canRegisterForNextYear) {
            const registrationOptions = [];
            
            // Only include current year registration if we haven't passed the deadline or we're in a new academic year
            if (isNewAcademicYear || !homeEdDeadline || today <= homeEdDeadline) {
              registrationOptions.push(`Register for the current school year as a Home Education student until ${formatDate(homeEdDeadline)}`);
            }
            
            registrationOptions.push(`Wait until ${formatDate(regularToSummer)} to register as a Summer School student`);
            registrationOptions.push(`Register for the next school year now`);
            
            return `
              <div class="prose prose-sm max-w-none">
                <p>You have multiple options:</p>
                <ol class="mt-1 mb-2 pl-5">
                  ${registrationOptions.map(option => `<li>${option}</li>`).join('')}
                </ol>
                
                <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
                  All Home Education registrations require a home school organization. Shared responsibility programs are not eligible.
                </p>
                
                <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
                  If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
                </p>
              </div>
            `;
          }
          
          const registrationOptions = [];
          
          // Only include current year registration if we haven't passed the deadline or we're in a new academic year
          if (isNewAcademicYear || !homeEdDeadline || today <= homeEdDeadline) {
            registrationOptions.push(`Register for the current school year as a Home Education student until ${formatDate(homeEdDeadline)}`);
          }
          
          registrationOptions.push(`Wait until ${formatDate(regularToSummer)} to register as a Summer School student`);
          
          return `
            <div class="prose prose-sm max-w-none">
              ${registrationOptions.length > 1 ? 
                `<p>You have ${registrationOptions.length} options:</p>
                 <ol class="mt-1 mb-2 pl-5">
                   ${registrationOptions.map(option => `<li>${option}</li>`).join('')}
                 </ol>` : 
                `<p>${registrationOptions[0]}</p>`
              }
              
              <p>Registration for next school year opens on ${formatDate(nextYearOpens)}.</p>
              
              <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
                All Home Education registrations require a home school organization, not a shared responsibility program.
              </p>
              
              <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
                  If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
              </p>
            </div>
          `;
        } else {
          return `
            <div class="prose prose-sm max-w-none">
              <p>Registration is now open for the next school year as a Home Education student.</p>
              
              <p>To ensure your courses count for semester one funding, please register before ${formatDate(sepCount)}.</p>
              
              <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
                You must have a home education registration with a home school organization. Shared responsibility programs are not eligible.
              </p>
            </div>
          `;
        }

    case 'Summer School':
      if (period === REGISTRATION_PERIODS.SUMMER) {
        return `
          <div class="prose prose-sm max-w-none">
            <p>Summer School registration is open until ${formatDate(summerToRegular)}.</p>
            
            <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
              All summer courses must be completed by the end of August, and marks won't appear until summer. To qualify for free courses, you must be 19 or younger as of September 1.
            </p>
            
            <p>If you need marks earlier or are older than 19, consider registering as a paid Adult Student.</p>
          </div>
        `;
      } else if (period === REGISTRATION_PERIODS.REGULAR) {
        if (canRegisterForNextYear) {
          return `
            <div class="prose prose-sm max-w-none">
              <p>Summer School registration opens on ${formatDate(regularToSummer)}. Currently, you can:</p>
              <ol class="mt-1 mb-2 pl-5">
                <li>Register as a Non-Primary student (with primary registration elsewhere)</li>
                <li>Register as a Home Education student (with home education registration)</li>
                <li>Register for the next school year</li>
              </ol>
              
              <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
                For next year, you must maintain qualifying status (primary registration elsewhere or home education) to avoid Adult Student status requiring payment.
              </p>
              
              <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
                If you are 19 or younger as of September 1, you qualify for free summer school starting ${formatDate(regularToSummer)}, but marks won't appear until summer.
              </p>
            </div>
          `;
        }
        return `
          <div class="prose prose-sm max-w-none">
            <p>Summer School registration opens on ${formatDate(regularToSummer)}.</p>
            
            <p>Currently, register as a Non-Primary student (with primary registration elsewhere) or Home Education student. Next year registration opens on ${formatDate(nextYearOpens)}.</p>
            
            <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
              If you are 19 or younger as of September 1, you qualify for free summer school, but marks won't appear until summer.
            </p>
          </div>
        `;
      } else {
        return `
          <div class="prose prose-sm max-w-none">
            <p>Summer School registration has ended for this year.</p>
            
            <p>You can now register for courses in the next school year as a Non-Primary student (with primary registration elsewhere) or Home Education student.</p>
            
            <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
              You must maintain qualifying status to avoid Adult Student status requiring payment.
            </p>
          </div>
        `;
      }

    case 'Adult Student':
      if (canRegisterForNextYear) {
        return `
          <div class="prose prose-sm max-w-none">
            <p>As an Adult student, you have flexible registration options:</p>
            <ul class="mt-1 mb-2 pl-5">
              <li>Register for the current school year</li>
              <li>Register as a Summer School student (after ${formatDate(regularToSummer)})</li>
              <li>Register for the next school year</li>
            </ul>
            
            <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
              Adult students must pay for courses. Marks will not be submitted to your transcript until payment is made.
            </p>
            
            <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
              If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
            </p>
          </div>
        `;
      }
      return `
        <div class="prose prose-sm max-w-none">
          <p>As an Adult student, you can register anytime during the current year, including summer school after ${formatDate(regularToSummer)}. Next year registration opens on ${formatDate(nextYearOpens)}.</p>
          
          <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
            Adult students must pay for courses. Marks will not be submitted until payment is made.
          </p>
          
          <p class="bg-blue-50 border-l-2 border-blue-500 pl-2 py-1 text-sm">
            If you are 19 or younger as of September 1, you may qualify for free summer school courses, but marks won't appear until summer.
          </p>
        </div>
      `;

    case 'International Student':
      if (canRegisterForNextYear) {
        return `
          <div class="prose prose-sm max-w-none">
            <p>As an International student, you have flexible registration options:</p>
            <ul class="mt-1 mb-2 pl-5">
              <li>Register for the current school year</li>
              <li>Register as a Summer School student (after ${formatDate(regularToSummer)})</li>
              <li>Register for the next school year</li>
            </ul>
            
            <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
              International students must pay for courses. Marks will not be submitted to your transcript until payment is made.
            </p>
          </div>
        `;
      }
      return `
        <div class="prose prose-sm max-w-none">
          <p>As an International student, you can register anytime during the current year, including summer school after ${formatDate(regularToSummer)}. Next year registration opens on ${formatDate(nextYearOpens)}.</p>
          
          <p class="bg-amber-50 border-l-2 border-amber-500 pl-2 py-1 text-sm">
            International students must pay for courses. Marks will not be submitted until payment is made.
          </p>
        </div>
      `;

    default:
      return "";
  }
};




export const COURSE_ENROLLMENT_STATUS_OPTIONS = [
  { 
    value: "Active",
    label: "Active", 
    color: "#10B981", // Green
    icon: Play,
    iconName: "play",
    description: "Currently taking the course",
    categoryName: "Send Email to Active"
  },
  { 
    value: "Completed",
    label: "Completed", 
    color: "#3B82F6", // Blue
    icon: CheckCircle,
    iconName: "check-circle",
    description: "Successfully finished the course",
    categoryName: "Send Email to Completed"
  },
  { 
    value: "Continuing",
    label: "Continuing", 
    color: "#8B5CF6", // Purple
    icon: ArrowRight,
    iconName: "arrow-right",
    description: "Will continue in the next term",
    categoryName: "Send Email to Continuing"
  },
  { 
    value: "Incomplete",
    label: "Incomplete", 
    color: "#EF4444", // Red
    icon: XCircle,
    iconName: "x-circle",
    description: "Did not complete course requirements",
    categoryName: "Send Email to Incomplete"
  },
  { 
    value: "Registered",
    label: "Registered", 
    color: "#F59E0B", // Amber
    icon: ClipboardList,
    iconName: "clipboard-list",
    description: "Enrolled but not yet started",
    categoryName: "Send Email to Registered"
  },
  { 
    value: "Withdrawn",
    label: "Withdrawn", 
    color: "#FF8C00", // Dark Orange
    icon: SignalZero,
    iconName: "signal-zero",
    description: "Withdrew from the course",
    categoryName: "Send Email to Withdrawn"
  }
];

// Updated helper function to include categoryName
export const getCourseEnrollmentStatusInfo = (status) => {
  const option = COURSE_ENROLLMENT_STATUS_OPTIONS.find(opt => opt.value === status);
  return {
    color: option ? option.color : "#6B7280",
    icon: option ? option.icon : null,
    iconName: option ? option.iconName : null,
    description: option ? option.description : null,
    label: option ? option.label : status,
    categoryName: option ? option.categoryName : null
  };
};

// Helper function to get just the color (unchanged)
export const getCourseEnrollmentStatusColor = (status) => {
  const option = COURSE_ENROLLMENT_STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.color : "#6B7280";  // Default to gray if status not found
};

export const getSchoolYearOptions = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let startYear = currentMonth >= 9 ? currentYear : currentYear - 1;

  const options = [];

  // Add the past 5 years
  for (let i = 5; i > 0; i--) {
    options.push({
      value: `${(startYear - i).toString().substr(-2)}/${(startYear - i + 1).toString().substr(-2)}`,
      color: "#6B7280",
    });
  }

  // Add the current year (default)
  options.push({
    value: `${startYear.toString().substr(-2)}/${(startYear + 1).toString().substr(-2)}`,
    color: "#10B981",
    isDefault: true, 
  });

  // Add the next year
  options.push({
    value: `${(startYear + 1).toString().substr(-2)}/${(startYear + 2).toString().substr(-2)}`,
    color: "#3B82F6",
  });

  return options;
};

export const DIPLOMA_MONTH_OPTIONS = [
  { value: "November", label: "November", color: "#9333EA" },  // Purple
  { value: "January", label: "January", color: "#3B82F6" },   // Blue
  { value: "April", label: "April", color: "#10B981" },       // Green
  { value: "June", label: "June", color: "#F59E0B" },         // Amber
  { value: "August", label: "August", color: "#EC4899" },     // Pink
  { value: "Already Wrote", label: "Already Wrote", color: "#9CA3AF" } // Gray
];

// Add this with the other helper functions
export const getDiplomaMonthColor = (month) => {
  const option = DIPLOMA_MONTH_OPTIONS.find(opt => opt.value === month);
  return option ? option.color : "#6B7280";  // Default to gray if month not found
};

export const TERM_OPTIONS = [
  {
    value: "Term 1",
    label: "Term 1",
    color: "#3B82F6", // Blue
    icon: Calendar,
    description: "First semester (September to January)"
  },
  {
    value: "Term 2",
    label: "Term 2",
    color: "#8B5CF6", // Purple
    icon: CalendarDays,
    description: "Second semester (February to June)"
  },
  {
    value: "Full Year",
    label: "Full Year",
    color: "#10B981", // Green
    icon: CalendarClock,
    description: "Full academic year (September to June)"
  },
  {
    value: "Summer",
    label: "Summer",
    color: "#F59E0B", // Amber
    icon: Umbrella,
    description: "Summer session (July to August)"
  }
];

// Helper function to get term info
export const getTermInfo = (term) => {
  const option = TERM_OPTIONS.find(opt => opt.value === term);
  return {
    color: option ? option.color : "#6B7280",
    icon: option ? option.icon : null,
    description: option ? option.description : null,
    label: option ? option.label : term
  };
};

// Helper function to get just the term color
export const getTermColor = (term) => {
  const option = TERM_OPTIONS.find(opt => opt.value === term);
  return option ? option.color : "#6B7280";  // Default to gray if term not found
};


export const getActiveFutureArchivedColor = (status) => {
  const option = ACTIVE_FUTURE_ARCHIVED_OPTIONS.find(opt => opt.value === status);
  return option ? option.color : "#6B7280";  // Default to gray if status not found
};

export const getPasiColor = (pasi) => {
  const option = PASI_OPTIONS.find(opt => opt.value === pasi);
  return option ? option.color : "#6B7280";  // Default to gray if PASI status not found
};



export const getSchoolYearColor = (year) => {
  const options = getSchoolYearOptions();
  const option = options.find(opt => opt.value === year);
  return option ? option.color : "#6B7280";  // Default to gray if school year not found
};
