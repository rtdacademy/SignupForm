// Alberta Programs of Study Course Configuration
// Based on Alberta Education course offerings for home education students

export const albertaCourses = {
  english_language_arts: {
    title: "English Language Arts",
    description: "Language arts courses focusing on reading, writing, speaking, and listening skills",
    courses: [
      {
        id: 'ela-not-credit',
        name: 'ELA not for credit',
        code: 'N/A',
        description: 'English Language Arts developmental/preparatory course',
        grade: 'Various',
        credits: 0,
        prerequisite: null
      },
      {
        id: 'ela-10-1',
        name: 'ELA 10-1',
        code: 'ELA1105',
        description: 'English Language Arts 10-1 (Academic)',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'ela-10-2',
        name: 'ELA 10-2',
        code: 'ELA1104',
        description: 'English Language Arts 10-2 (General)',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'ela-20-1',
        name: 'ELA 20-1',
        code: 'ELA2105',
        description: 'English Language Arts 20-1 (Academic)',
        grade: 11,
        credits: 5,
        prerequisite: 'ELA1105'
      },
      {
        id: 'ela-20-2',
        name: 'ELA 20-2',
        code: 'ELA2104',
        description: 'English Language Arts 20-2 (General)',
        grade: 11,
        credits: 5,
        prerequisite: 'ELA1104'
      },
      {
        id: 'ela-30-1',
        name: 'ELA 30-1',
        code: 'ELA3105',
        description: 'English Language Arts 30-1 (Academic)',
        grade: 12,
        credits: 5,
        prerequisite: 'ELA2105'
      },
      {
        id: 'ela-30-2',
        name: 'ELA 30-2',
        code: 'ELA3104',
        description: 'English Language Arts 30-2 (General)',
        grade: 12,
        credits: 5,
        prerequisite: 'ELA2104'
      },
      {
        id: 'ke-ela-10-4',
        name: 'K&E ELA 10-4',
        code: 'KAE1780',
        description: 'Knowledge & Employability English 10-4',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'ke-ela-20-4',
        name: 'K&E ELA 20-4',
        code: 'KAE2780',
        description: 'Knowledge & Employability English 20-4',
        grade: 11,
        credits: 5,
        prerequisite: 'KAE1780'
      },
      {
        id: 'ke-ela-30-4',
        name: 'K&E ELA 30-4',
        code: 'KAE3780',
        description: 'Knowledge & Employability English 30-4',
        grade: 12,
        credits: 5,
        prerequisite: 'KAE2780'
      }
    ]
  },
  
  mathematics: {
    title: "Mathematics",
    description: "Mathematics courses covering various pathways from foundational to advanced levels",
    courses: [
      {
        id: 'math-not-credit',
        name: 'Math not for credit',
        code: 'N/A',
        description: 'Mathematics developmental/preparatory course',
        grade: 'Various',
        credits: 0,
        prerequisite: null
      },
      {
        id: 'math-10c',
        name: 'MATH 10C',
        code: 'MAT1791',
        description: 'Mathematics 10C (Combined academic/applied)',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'math-10-3',
        name: 'MATH 10-3',
        code: 'MAT1793',
        description: 'Mathematics 10-3 (Foundational)',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'math-20-1',
        name: 'MATH 20-1',
        code: 'MAT2791',
        description: 'Mathematics 20-1 (Academic pathway)',
        grade: 11,
        credits: 5,
        prerequisite: 'MAT1791'
      },
      {
        id: 'math-20-2',
        name: 'MATH 20-2',
        code: 'MAT2792',
        description: 'Mathematics 20-2 (Applied pathway)',
        grade: 11,
        credits: 5,
        prerequisite: 'MAT1791'
      },
      {
        id: 'math-20-3',
        name: 'MATH 20-3',
        code: 'MAT2793',
        description: 'Mathematics 20-3 (Foundational)',
        grade: 11,
        credits: 5,
        prerequisite: 'MAT1793'
      },
      {
        id: 'math-30-1',
        name: 'MATH 30-1',
        code: 'MAT3791',
        description: 'Mathematics 30-1 (Pre-calculus)',
        grade: 12,
        credits: 5,
        prerequisite: 'MAT2791'
      },
      {
        id: 'math-30-2',
        name: 'MATH 30-2',
        code: 'MAT3792',
        description: 'Mathematics 30-2 (Applied)',
        grade: 12,
        credits: 5,
        prerequisite: 'MAT2792'
      },
      {
        id: 'math-30-3',
        name: 'MATH 30-3',
        code: 'MAT3793',
        description: 'Mathematics 30-3 (Foundational)',
        grade: 12,
        credits: 5,
        prerequisite: 'MAT2793'
      },
      {
        id: 'math-31',
        name: 'MATH 31',
        code: 'MAT3211',
        description: 'Mathematics 31 (Advanced calculus)',
        grade: 12,
        credits: 5,
        prerequisite: 'MAT3791'
      },
      {
        id: 'ke-math-10-4',
        name: 'K&E MATH 10-4',
        code: 'KAE1781',
        description: 'Knowledge & Employability Math 10-4',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'ke-math-20-4',
        name: 'K&E MATH 20-4',
        code: 'KAE2781',
        description: 'Knowledge & Employability Math 20-4',
        grade: 11,
        credits: 5,
        prerequisite: 'KAE1781'
      }
    ]
  },
  
  social_studies: {
    title: "Social Studies",
    description: "Social studies courses exploring history, geography, civics, and global perspectives",
    courses: [
      {
        id: 'soc-not-credit',
        name: 'SOC not for credit',
        code: 'N/A',
        description: 'Social Studies developmental/preparatory course',
        grade: 'Various',
        credits: 0,
        prerequisite: null
      },
      {
        id: 'soc-10-1',
        name: 'SOC 10-1',
        code: 'SOC1105',
        description: 'Social Studies 10-1 (Academic)',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'soc-10-2',
        name: 'SOC 10-2',
        code: 'SOC1104',
        description: 'Social Studies 10-2 (General)',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'soc-20-1',
        name: 'SOC 20-1',
        code: 'SOC2105',
        description: 'Social Studies 20-1 (Academic)',
        grade: 11,
        credits: 5,
        prerequisite: 'SOC1105'
      },
      {
        id: 'soc-20-2',
        name: 'SOC 20-2',
        code: 'SOC2104',
        description: 'Social Studies 20-2 (General)',
        grade: 11,
        credits: 5,
        prerequisite: 'SOC1104'
      },
      {
        id: 'soc-30-1',
        name: 'SOC 30-1',
        code: 'SOC3105',
        description: 'Social Studies 30-1 (Academic)',
        grade: 12,
        credits: 5,
        prerequisite: 'SOC2105'
      },
      {
        id: 'soc-30-2',
        name: 'SOC 30-2',
        code: 'SOC3104',
        description: 'Social Studies 30-2 (General)',
        grade: 12,
        credits: 5,
        prerequisite: 'SOC2104'
      },
      {
        id: 'ke-soc-10-4',
        name: 'K&E SOC 10-4',
        code: 'KAE1782',
        description: 'Knowledge & Employability Social Studies 10-4',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'ke-soc-20-4',
        name: 'K&E SOC 20-4',
        code: 'KAE2782',
        description: 'Knowledge & Employability Social Studies 20-4',
        grade: 11,
        credits: 5,
        prerequisite: 'KAE1782'
      }
    ]
  },
  
  science: {
    title: "Science",
    description: "Science courses including general science and specialized subjects like biology, chemistry, and physics",
    courses: [
      {
        id: 'science-not-credit',
        name: 'Science not for credit',
        code: 'N/A',
        description: 'Science developmental/preparatory course',
        grade: 'Various',
        credits: 0,
        prerequisite: null
      },
      {
        id: 'science-10',
        name: 'Science 10',
        code: 'SCN1270',
        description: 'Science 10 (Integrated science)',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'science-14',
        name: 'Science 14',
        code: 'SCN1288',
        description: 'Science 14 (Applied science)',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'science-24',
        name: 'Science 24',
        code: 'SCN2288',
        description: 'Science 24 (Foundational pathway)',
        grade: 11,
        credits: 5,
        prerequisite: 'SCN1288'
      },
      {
        id: 'science-20',
        name: 'Science 20',
        code: 'SCN2270',
        description: 'Science 20 (General integrated science)',
        grade: 11,
        credits: 5,
        prerequisite: 'SCN1270'
      },
      {
        id: 'science-30',
        name: 'Science 30',
        code: 'SCN3270',
        description: 'Science 30 (General integrated science)',
        grade: 12,
        credits: 5,
        prerequisite: 'SCN2270'
      },
      {
        id: 'biology-20',
        name: 'Biology 20',
        code: 'SCN2231',
        description: 'Biology 20 (Specialized biology)',
        grade: 11,
        credits: 5,
        prerequisite: 'SCN1270'
      },
      {
        id: 'biology-30',
        name: 'Biology 30',
        code: 'SCN3230',
        description: 'Biology 30 (Advanced biology)',
        grade: 12,
        credits: 5,
        prerequisite: 'SCN2231'
      },
      {
        id: 'chemistry-20',
        name: 'Chemistry 20',
        code: 'SCN2796',
        description: 'Chemistry 20 (Specialized chemistry)',
        grade: 11,
        credits: 5,
        prerequisite: 'SCN1270'
      },
      {
        id: 'chemistry-30',
        name: 'Chemistry 30',
        code: 'SCN3796',
        description: 'Chemistry 30 (Advanced chemistry)',
        grade: 12,
        credits: 5,
        prerequisite: 'SCN2796'
      },
      {
        id: 'physics-20',
        name: 'Physics 20',
        code: 'SCN2797',
        description: 'Physics 20 (Specialized physics)',
        grade: 11,
        credits: 5,
        prerequisite: 'SCN1270'
      },
      {
        id: 'physics-30',
        name: 'Physics 30',
        code: 'SCN3797',
        description: 'Physics 30 (Advanced physics)',
        grade: 12,
        credits: 5,
        prerequisite: 'SCN2797'
      },
      {
        id: 'ke-science-10-4',
        name: 'K&E SCIENCE 10-4',
        code: 'KAE1783',
        description: 'Knowledge & Employability Science 10-4',
        grade: 10,
        credits: 5,
        prerequisite: null
      },
      {
        id: 'ke-science-20-4',
        name: 'K&E SCIENCE 20-4',
        code: 'KAE2783',
        description: 'Knowledge & Employability Science 20-4',
        grade: 11,
        credits: 5,
        prerequisite: 'KAE1783'
      }
    ]
  },
  
  physical_education: {
    title: "Physical Education",
    description: "Physical education courses focusing on health, fitness, and active living",
    courses: [
      {
        id: 'pe-not-credit',
        name: 'PE not for credit',
        code: 'N/A',
        description: 'Physical Education developmental/preparatory course',
        grade: 'Various',
        credits: 0,
        prerequisite: null
      },
      {
        id: 'pe-10',
        name: 'PE 10',
        code: 'PED1445',
        description: 'Physical Education 10',
        grade: 10,
        credits: '3, 4, or 5',
        prerequisite: null,
        note: 'Waiver of prerequisite provision does not apply'
      },
      {
        id: 'pe-20',
        name: 'PE 20',
        code: 'PED2445',
        description: 'Physical Education 20',
        grade: 11,
        credits: '3, 4, or 5',
        prerequisite: 'PED1445'
      },
      {
        id: 'pe-30',
        name: 'PE 30',
        code: 'PED3445',
        description: 'Physical Education 30',
        grade: 12,
        credits: '3, 4, or 5',
        prerequisite: 'PED2445'
      }
    ]
  },
  
  career_life_management: {
    title: "Career and Life Management (CALM)",
    description: "Career and life management course focusing on personal development and life skills",
    courses: [
      {
        id: 'calm-not-credit',
        name: 'CALM not for credit',
        code: 'N/A',
        description: 'Career and Life Management developmental/preparatory course',
        grade: 'Various',
        credits: 0,
        prerequisite: null
      },
      {
        id: 'calm',
        name: 'CALM',
        code: 'PED0770',
        description: 'Career and Life Management (Required course)',
        grade: '10-12',
        credits: 3,
        prerequisite: null,
        note: 'Required for high school graduation'
      }
    ]
  }
};

// Career & Technology Studies (CTS) courses
export const ctsCourses = {
  title: "Career & Technology Studies (CTS)",
  description: "CTS courses are 1-credit modular courses in various occupational areas. Special Projects allowed for grades 10-12 only.",
  note: "These are examples of common CTS courses. Many more specialized courses are available.",
  courses: [
    {
      id: 'foods-1010',
      name: 'Foods 1010',
      code: 'Various',
      description: 'Food Basics (CTS Foods strand)',
      grade: '10-12',
      credits: 1,
      prerequisite: null
    },
    {
      id: 'art-1400',
      name: 'Art 1400',
      code: 'Various',
      description: 'Art fundamentals (CTS or Fine Arts)',
      grade: '10-12',
      credits: 1,
      prerequisite: null
    },
    {
      id: 'photography',
      name: 'Photography',
      code: 'Various',
      description: 'Photography courses (CTS Communication Technology)',
      grade: '10-12',
      credits: 1,
      prerequisite: null
    },
    {
      id: 'welding',
      name: 'Welding',
      code: 'Various',
      description: 'Welding courses (CTS Fabrication Studies)',
      grade: '10-12',
      credits: 1,
      prerequisite: null
    },
    {
      id: 'special-projects-10',
      name: 'Special Projects 10',
      code: 'OTH1999',
      description: 'Student-directed learning projects',
      grade: 10,
      credits: '1-5',
      prerequisite: null,
      note: 'Grades 10-12 only'
    },
    {
      id: 'special-projects-20',
      name: 'Special Projects 20',
      code: 'OTH2999',
      description: 'Student-directed learning projects',
      grade: 11,
      credits: '1-5',
      prerequisite: null,
      note: 'Grades 10-12 only'
    },
    {
      id: 'special-projects-30',
      name: 'Special Projects 30',
      code: 'OTH3999',
      description: 'Student-directed learning projects',
      grade: 12,
      credits: '1-5',
      prerequisite: null,
      note: 'Grades 10-12 only'
    }
  ]
};

// Helper functions
export const getAllAlbertaCourses = () => {
  const allCourses = [];
  Object.values(albertaCourses).forEach(subject => {
    if (subject.courses) {
      allCourses.push(...subject.courses);
    }
  });
  // Add CTS courses
  allCourses.push(...ctsCourses.courses);
  return allCourses;
};

export const getAlbertaCourseById = (courseId) => {
  return getAllAlbertaCourses().find(course => course.id === courseId);
};

export const getSubjectCourses = (subjectKey) => {
  if (subjectKey === 'career_technology_studies') {
    return ctsCourses.courses;
  }
  return albertaCourses[subjectKey]?.courses || [];
};

export const getSubjectInfo = (subjectKey) => {
  if (subjectKey === 'career_technology_studies') {
    return ctsCourses;
  }
  return albertaCourses[subjectKey] || {};
};

// Pathway information for better understanding
export const pathwayNotes = {
  academic_pathway: "Courses ending in -1 (ELA 30-1, Math 30-1, etc.) for university preparation",
  general_pathway: "Courses ending in -2 (ELA 30-2, Math 30-2, etc.) for post-secondary/workforce",
  foundational_pathway: "Courses ending in -3 or -4 for workplace preparation or further learning support",
  knowledge_employability: "K&E courses (ending in -4) focus on workplace readiness and life skills",
  graduation_requirements: "Students need 100 credits total with specific course requirements in each subject area"
};

export default albertaCourses;