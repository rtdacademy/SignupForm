// src/config/DropdownOptions.js

import { 
  GraduationCap,
  Home,
  Sun,
  User,
  Globe ,
  Calculator,  // for Math courses
  Code,        // for Coding courses
  Beaker,      // for Science courses
  BookOpen     // for other course types
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

export const STATUS_OPTIONS = [
  { value: "Newly Enrolled", color: "#3B82F6", category: "Administrative", allowAutoStatusChange: false },
  { value: "On Track", color: "#10B981", category: "Progress", allowAutoStatusChange: true },
  { value: "Rocking it!", color: "#059669", category: "Progress", allowAutoStatusChange: true },
  { value: "Updated Schedule", color: "#6366F1", category: "Schedule-related", allowAutoStatusChange: true },
  { value: "Behind", color: "#EF4444", category: "Progress", allowAutoStatusChange: true },
  { value: "Not Active", color: "#6B7280", category: "Progress", allowAutoStatusChange: true },
  { value: "No Orientation Yet", color: "#F59E0B", category: "Schedule-related", allowAutoStatusChange: false },
  { value: "Waiting on Schedule", color: "#8B5CF6", category: "Schedule-related", allowAutoStatusChange: false },
  { value: "On Hold", color: "#EC4899", category: "Schedule-related", allowAutoStatusChange: false },
  { value: "Hasn't Started", color: "#9CA3AF", category: "Schedule-related", allowAutoStatusChange: false },
  { value: "Starting on (Date)", color: "#14B8A6", category: "Administrative", allowAutoStatusChange: false },
  { value: "Resuming on (date)", color: "#06B6D4", category: "Schedule-related", allowAutoStatusChange: false },
  { value: "Unenrolled", color: "#DC2626", category: "Progress", allowAutoStatusChange: false },
  { value: "Final Teacher Approval", color: "#2563EB", category: "Progress", allowAutoStatusChange: false },
  { value: "Course Completed", color: "#16A34A", category: "Progress", allowAutoStatusChange: false },
  { value: "Default", color: "#6B7280", category: "Progress", allowAutoStatusChange: false },
  { value: "Awaiting Response", color: "#D97706", category: "Administrative", allowAutoStatusChange: false },
  { value: "🔒 Locked Out - No Payment", color: "#7C3AED", category: "Administrative", allowAutoStatusChange: false },
  { value: "✅ Mark Added to PASI", color: "#059669", category: "Administrative", allowAutoStatusChange: false },
  { value: "☑️ Removed From PASI (Funded)", color: "#9333EA", category: "Administrative", allowAutoStatusChange: false },
  { value: "✗ Removed (Not Funded)", color: "#DC2626", category: "Administrative", allowAutoStatusChange: false }
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
    courseId: 82
  },
  { 
    value: "Math 10-3",
    label: "Math 10-3", 
    courseType: "Math",
    grade: 10,
    color: "#3B82F6",
    icon: Calculator,
    courseId: 78
  },
  { 
    value: "Math 10C",
    label: "Math 10C", 
    courseType: "Math",
    grade: 10,
    color: "#3B82F6",
    icon: Calculator,
    courseId: 97
  },
  { 
    value: "Math 15",
    label: "Math 15", 
    courseType: "Math",
    grade: 10,
    color: "#3B82F6",
    icon: Calculator,
    courseId: 90
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
    courseId: 84
  },
  { 
    value: "Math 20-3",
    label: "Math 20-3", 
    courseType: "Math",
    grade: 11,
    color: "#8B5CF6",
    icon: Calculator,
    courseId: 96
  },
  { 
    value: "Math 20-2",
    label: "Math 20-2", 
    courseType: "Math",
    grade: 11,
    color: "#8B5CF6",
    icon: Calculator,
    courseId: 98
  },
  { 
    value: "Math 20-1",
    label: "Math 20-1", 
    courseType: "Math",
    grade: 11,
    color: "#8B5CF6",
    icon: Calculator,
    courseId: 95
  },

  // Grade 12 Courses - Green theme
  { 
    value: "Math 30-3",
    label: "Math 30-3", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 86
  },
  { 
    value: "Math 30-2",
    label: "Math 30-2", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 87
  },
  { 
    value: "Math 30-1",
    label: "Math 30-1", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 89
  },
  { 
    value: "Math 31 (Calculus)",
    label: "Math 31 (Calculus)", 
    courseType: "Math",
    grade: 12,
    color: "#10B981",
    icon: Calculator,
    courseId: 93
  }
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

export const ACTIVE_FUTURE_ARCHIVED_OPTIONS = [
  { value: "Active", color: "#10B981" },     // Green
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


export const getSchoolYearOptions = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  let startYear = currentMonth >= 9 ? currentYear : currentYear - 1;

  return [
    {
      value: `${(startYear - 1).toString().substr(-2)}/${startYear.toString().substr(-2)}`,
      color: "#6B7280",
    }, // Gray for last year
    {
      value: `${startYear.toString().substr(-2)}/${(startYear + 1).toString().substr(-2)}`,
      color: "#10B981",
    }, // Green for current year
    {
      value: `${(startYear + 1).toString().substr(-2)}/${(startYear + 2).toString().substr(-2)}`,
      color: "#3B82F6",
    }, // Blue for next year
  ];
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
