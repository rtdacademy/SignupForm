// src/config/DropdownOptions.js

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



export const COURSE_OPTIONS = [
  { value: "Math 10-4", color: "#EF4444" },  // Red
  { value: "Math 10-3", color: "#F59E0B" },  // Amber
  { value: "Math 10C", color: "#10B981" },   // Green
  { value: "Math 20-4", color: "#3B82F6" },  // Blue
  { value: "Math 20-3", color: "#6366F1" },  // Indigo
  { value: "Math 20-2", color: "#8B5CF6" },  // Purple
  { value: "Math 20-1", color: "#EC4899" },  // Pink
  { value: "Math 30-3", color: "#14B8A6" },  // Teal
  { value: "Math 30-2", color: "#06B6D4" },  // Cyan
  { value: "Math 30-1", color: "#2563EB" },  // Blue
  { value: "Math 31 (Calculus)", color: "#7C3AED" },  // Violet
  { value: "Coding", color: "#059669" },     // Green
  { value: "Math 15", color: "#DC2626" }     // Red
];

export const ACTIVE_FUTURE_ARCHIVED_OPTIONS = [
  { value: "Active", color: "#10B981" },    // Green
  { value: "Archived", color: "#6B7280" }   // Gray
];

export const PASI_OPTIONS = [
  { value: "Yes", color: "#10B981" },   // Green
  { value: "No", color: "#EF4444" }     // Red
];

export const STUDENT_TYPE_OPTIONS = [
  { value: "Non-Primary", color: "#3B82F6" },        // Blue
  { value: "Home Education", color: "#F59E0B" },     // Amber
  { value: "Summer School", color: "#10B981" },      // Green
  { value: "Adult Student", color: "#8B5CF6" },      // Purple
  { value: "International Student", color: "#EC4899" }  // Pink
];

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


// Helper functions to get color for each option type
export const getCourseColor = (course) => {
  const option = COURSE_OPTIONS.find(opt => opt.value === course);
  return option ? option.color : "#6B7280";  // Default to gray if course not found
};

export const getActiveFutureArchivedColor = (status) => {
  const option = ACTIVE_FUTURE_ARCHIVED_OPTIONS.find(opt => opt.value === status);
  return option ? option.color : "#6B7280";  // Default to gray if status not found
};

export const getPasiColor = (pasi) => {
  const option = PASI_OPTIONS.find(opt => opt.value === pasi);
  return option ? option.color : "#6B7280";  // Default to gray if PASI status not found
};

export const getStudentTypeColor = (type) => {
  const option = STUDENT_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.color : "#6B7280";  // Default to gray if student type not found
};

export const getSchoolYearColor = (year) => {
  const options = getSchoolYearOptions();
  const option = options.find(opt => opt.value === year);
  return option ? option.color : "#6B7280";  // Default to gray if school year not found
};
