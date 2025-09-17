// Website Configuration File
// This file contains all FAQ content, dates, and configuration for easy updates

export const websiteConfig = {
  // Important dates and deadlines
  dates: {
    currentSchoolYear: '2024-2025',
    term1: {
      registrationDeadline: 'September 29',
      countDay: 'September 30',
      endDate: 'January 31'
    },
    term2: {
      registrationDeadline: 'April 15',
      homeEducationDeadline: 'February 28',
      endDate: 'June 19',
      pasiDeadline: 'June 19'
    },
    summerSchool: {
      startDate: 'July 1',
      endDate: 'August 31'
    }
  },

  // Credit and pricing information
  credits: {
    maxCreditsPerYear: 10,
    maxCreditsSummer: 10,
    pricePerExtraCredit: 100
  },

  // FAQ Categories and their questions
  categories: {
    nonPrimary: {
      title: 'Non-Primary Students',
      icon: '🎓',
      description: 'For Alberta students taking extra courses while enrolled at another school',
      color: '#3B82F6', // Blue
      faqs: [
        {
          question: 'What does it mean to be a Non-Primary Student?',
          answer: 'Non-primary students are Alberta students who attend another school full-time but take extra courses with RTD Academy. These courses are free because they are funded by Alberta Education.',
          priority: 'high'
        },
        {
          question: 'Who is eligible?',
          answer: `To be a non-primary student at RTD Academy:
• You must have a primary enrollment with another school in Alberta
• This option is only for students in Grades 10–12
• In some cases, school-age students without primary enrollment may qualify as Summer School Students`,
          priority: 'high'
        },
        {
          question: 'How many credits can I take?',
          answer: `• Up to 10 credits during the school year (September–June) for free
• If you want more than 10 credits during the school year, you can either:
  - Pay for extra credits ($100 per credit), or
  - Register as a Summer School Student and finish your course(s) in July or August for free`,
          priority: 'high'
        },
        {
          question: 'How is my term decided?',
          answer: `At RTD Academy, your student type is determined by your end date. You can usually start whenever you'd like, but when you plan to finish makes the difference.`,
          priority: 'medium'
        },
        {
          question: 'What are the requirements for Term 1 Students?',
          answer: `Term 1 Students:
• End date is in Semester 1 (ending January 31)
• Must register by September 29
• Important: If you start after the September count day, you cannot plan to finish in January
• Example: A student who starts in October cannot end in January`,
          priority: 'medium'
        },
        {
          question: 'What are the requirements for Term 2 Students?',
          answer: `Term 2 Students:
• End date is in Semester 2 (February 1 - June 19)
• May start earlier (even in Semester 1), but end date must be in Semester 2
• Must register by April 15
• To have your mark submitted to Alberta Education (PASI), must finish by June 19
• If you finish after June 19, you will be considered a Summer School Student`,
          priority: 'medium'
        },
        {
          question: 'What are the requirements for Summer School Students?',
          answer: `Summer School Students:
• End date is in July or August
• Up to 10 credits free during summer
• May start earlier in the year, but final mark only goes on transcript after summer school ends
• Great option for students without primary enrollment`,
          priority: 'medium'
        },
        {
          question: "What if I don't finish my course at my scheduled time?",
          answer: `We encourage students to finish by their scheduled end date. Deadlines help you stay on track and avoid procrastination.

If something unexpected happens, you can continue in the next available term:
• Term 1 Student → moves to Term 2
• Term 2 Student → moves to Summer School
• Your marks will only be reported once you finish
• Students who repeatedly delay may be required to pay to continue`,
          priority: 'low'
        },
        {
          question: 'Can I take courses if I\'m not enrolled in another Alberta school?',
          answer: `If you are school-age (under 20 before September 1) but not primarily enrolled elsewhere, you may still qualify as a Summer School Student. The summer school grant is less restrictive and may allow you to take a course for free.`,
          priority: 'low'
        },
        {
          question: 'When will my marks be submitted to Alberta Education?',
          answer: `Your marks are submitted based on when you complete your course:
• Term 1: Marks submitted in February
• Term 2: Marks submitted by June 30 (if completed by June 19)
• Summer School: Marks submitted in September`,
          priority: 'low'
        }
      ]
    },

    homeEducation: {
      title: 'Home Education Students',
      icon: '🏠',
      description: 'For students registered in Alberta home education programs taking high school courses',
      color: '#10B981', // Green
      faqs: [
        {
          question: 'What does it mean to be a Home Education Non-Primary Student?',
          answer: 'These students are enrolled in a home education program but take extra high school courses with RTD Academy. Like non-primary students, these courses are free through Alberta Education funding.',
          priority: 'high'
        },
        {
          question: 'Who is eligible?',
          answer: `To be a home education non-primary student at RTD Academy:
• You must be registered in a home education program in Alberta
• This option is only for students in Grades 10–12
• If you are school-age (under 20 before September 1), you may qualify as a Summer School Student`,
          priority: 'high'
        },
        {
          question: 'How many credits can I take?',
          answer: `• Up to 10 credits during the school year (September–June) for free
• If you want more than 10 credits during the school year, you can either:
  - Pay for extra credits ($100 per credit), or
  - Register as a Summer School Student and finish your course(s) in July or August for free`,
          priority: 'high'
        },
        {
          question: 'How is my term decided?',
          answer: 'Your end date determines your term, similar to non-primary students. You can start when convenient, but your planned completion date determines your student type.',
          priority: 'medium'
        },
        {
          question: 'What are the requirements for Term 1 Students?',
          answer: `Term 1 Students:
• End date is in Semester 1 (ending January 31)
• Must register by September 29
• If you start after the September count day, you cannot plan to finish in January`,
          priority: 'medium'
        },
        {
          question: 'What are the requirements for Term 2 Students?',
          answer: `Term 2 Students:
• End date is in Semester 2 (February 1 - June 19)
• May start earlier, but end date must be in Semester 2
• Must register by February 28 (different from regular non-primary students)
• To have your mark submitted to PASI, must finish by June 19
• If you finish after June 19, you become a Summer School Student`,
          priority: 'medium'
        },
        {
          question: 'What are the requirements for Summer School Students?',
          answer: `Summer School Students:
• End date is in July or August
• Up to 10 credits free during summer
• May start earlier in the year, but final mark only goes on transcript after summer ends`,
          priority: 'medium'
        },
        {
          question: "What if I don't finish my course at my scheduled time?",
          answer: `The same rules apply as for non-primary students:
• If you don't finish in Term 1, you move to Term 2
• If you don't finish in Term 2, you move to Summer School
• Marks are only reported once you finish
• Students who repeatedly delay may be required to pay to continue`,
          priority: 'low'
        },
        {
          question: 'What\'s the difference between home education and regular non-primary students?',
          answer: 'The main difference is the Term 2 registration deadline: Home Education students must register by February 28, while regular non-primary students have until April 15. All other requirements are the same.',
          priority: 'low'
        },
        {
          question: 'Can home education students take courses during regular school hours?',
          answer: 'Yes! Since our courses are asynchronous (self-paced), you can complete coursework at any time that fits your home education schedule. There are no scheduled class times.',
          priority: 'low'
        }
      ]
    },

    summerStudents: {
      title: 'Summer Students',
      icon: '☀️',
      description: 'For students taking courses during July and August',
      color: '#F59E0B', // Amber
      faqs: [
        {
          question: 'Coming Soon',
          answer: 'Summer student information will be available soon. Please check back later or contact us for more information.',
          priority: 'high'
        }
      ]
    },

    adultStudents: {
      title: 'Adult Students',
      icon: '👨‍🎓',
      description: 'For students aged 20+ pursuing high school completion',
      color: '#8B5CF6', // Purple
      faqs: [
        {
          question: 'Coming Soon',
          answer: 'Adult student information will be available soon. Please check back later or visit our Adult Students page for current information.',
          priority: 'high'
        }
      ]
    },

    internationalStudents: {
      title: 'International Students',
      icon: '🌍',
      description: 'For students outside of Alberta accessing our courses',
      color: '#EF4444', // Red
      faqs: [
        {
          question: 'Coming Soon',
          answer: 'International student information will be available soon. Please check back later or contact us for more information.',
          priority: 'high'
        }
      ]
    }
  },

  // Contact information
  contact: {
    email: 'info@rtdacademy.com',
    phone: '1-888-123-4567',
    hours: 'Monday - Friday, 8:30 AM - 4:30 PM MST'
  },

  // Related links
  relatedLinks: {
    nonPrimary: [
      { text: 'Course Catalog', url: '/courses' },
      { text: 'Registration Guide', url: '/get-started' },
      { text: 'Academic Calendar', url: '/calendar' }
    ],
    homeEducation: [
      { text: 'Home Education Resources', url: '/home-education' },
      { text: 'Course Catalog', url: '/courses' },
      { text: 'Parent Portal', url: '/parent-login' }
    ],
    summerStudents: [
      { text: 'Summer Course Options', url: '/summer-courses' },
      { text: 'Registration', url: '/get-started' }
    ],
    adultStudents: [
      { text: 'Adult Student Information', url: '/adult-students' },
      { text: 'Course Catalog', url: '/courses' }
    ],
    internationalStudents: [
      { text: 'International Student Guide', url: '/international' },
      { text: 'Course Catalog', url: '/courses' }
    ]
  }
};

// Helper function to get FAQs by category
export const getFAQsByCategory = (category) => {
  return websiteConfig.categories[category]?.faqs || [];
};

// Helper function to get all FAQs for search
export const getAllFAQs = () => {
  const allFAQs = [];
  Object.keys(websiteConfig.categories).forEach(category => {
    const categoryFAQs = websiteConfig.categories[category].faqs.map(faq => ({
      ...faq,
      category: websiteConfig.categories[category].title,
      categoryKey: category
    }));
    allFAQs.push(...categoryFAQs);
  });
  return allFAQs;
};

// Helper function to get important dates
export const getImportantDates = () => {
  const dates = [];
  const { term1, term2, summerSchool } = websiteConfig.dates;

  dates.push(
    { label: 'Term 1 Registration Deadline', date: term1.registrationDeadline, type: 'deadline' },
    { label: 'Term 2 Registration Deadline', date: term2.registrationDeadline, type: 'deadline' },
    { label: 'Home Ed Term 2 Registration', date: term2.homeEducationDeadline, type: 'deadline' },
    { label: 'Summer School Starts', date: summerSchool.startDate, type: 'start' },
    { label: 'Summer School Ends', date: summerSchool.endDate, type: 'end' }
  );

  return dates;
};

export default websiteConfig;