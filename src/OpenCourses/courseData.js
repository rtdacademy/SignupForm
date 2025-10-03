// Centralized course data for Open Courses
export const courses = {
  mathematics: [
    {
      id: 'math10-3',
      name: 'Math 10-3',
      description: 'Workplace and apprenticeship preparation',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=170&view=iframe&guestaccess=true'
    },
    {
      id: 'math10c',
      name: 'Math 10C',
      description: 'Foundation for Mathematics 20-1 and 20-2',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=166&view=iframe&guestaccess=true'
    },
    {
      id: 'math20-1',
      name: 'Math 20-1',
      description: 'Pre-calculus path for sciences and engineering',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=173&view=iframe&guestaccess=true'
    },
    {
      id: 'math20-2',
      name: 'Math 20-2',
      description: 'For students entering non-science post-secondary',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=168&view=iframe&guestaccess=true'
    },
    {
      id: 'math20-3',
      name: 'Math 20-3',
      description: 'Trades and workplace mathematics',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=171&view=iframe&guestaccess=true'
    },
    {
      id: 'math30-1',
      name: 'Math 30-1',
      description: 'Pre-calculus mathematics',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=165&view=iframe&guestaccess=true',
      diplomaExam: true
    },
    {
      id: 'math30-2',
      name: 'Math 30-2',
      description: 'Mathematics for various post-secondary programs',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=169&view=iframe&guestaccess=true',
      diplomaExam: true
    },
    {
      id: 'math30-3',
      name: 'Math 30-3',
      description: 'Apprenticeship and workplace mathematics',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=172&view=iframe&guestaccess=true'
    },
    {
      id: 'math31',
      name: 'Math 31 (Calculus)',
      description: 'Introduction to calculus for engineering and sciences',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=174&view=iframe&guestaccess=true'
    },
  ],
  physics: [
    {
      id: 'physics20',
      name: 'Physics 20',
      description: 'Motion, forces, energy, and waves',
      url: 'https://edge.rtdacademy.com/course/course.php?folder=0&cid=175&view=iframe&guestaccess=true'
    },
    {
      id: 'physics30',
      name: 'Physics 30',
      description: 'Advanced physics including modern physics concepts',
      url: '#',
      comingSoon: true,
      diplomaExam: true
    },
  ]
};

// Helper function to get course by ID
export const getCourseByIdFromData = (courseId) => {
  const allCourses = [...courses.mathematics, ...courses.physics];
  return allCourses.find(course => course.id === courseId);
};
