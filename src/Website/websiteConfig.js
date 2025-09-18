// Website Configuration File
// This file contains all FAQ content, dates, and configuration for easy updates

// QUICK ACTIVATION: Change this to true to show teacher strike FAQ section
const SHOW_TEACHER_STRIKE_INFO = false;

// Configuration values for easy updates
const config = {
  pricing: {
    pricePerExtraCredit: 100, // Cost per credit beyond free limits
    distanceEducationGrant: 650, // DE grant per student per year
    rtdConnectReimbursement: {
      grades1to12: 1700, // Annual reimbursement for grades 1-12
      kindergarten: 850 // Annual reimbursement for kindergarten
    }
  },
  credits: {
    maxPerYear: 10, // Maximum free credits during school year
    maxSummer: 10, // Maximum free credits during summer
    maxTotalPerYear: 20 // Total possible free credits (school year + summer)
  },
  ages: {
    adultStudentMinAge: 20, // Age cutoff for adult students
    ageVerificationDate: 'September 1' // Date to check age for student type
  },
  grades: {
    highSchoolStart: 10, // First high school grade
    highSchoolEnd: 12, // Last high school grade
    elementaryStart: 1, // First elementary grade
    kindergarten: 'K' // Kindergarten designation
  },
  semesters: {
    semester1: {
      name: 'Semester 1',
      startDate: 'September 1',
      endDate: 'January 31'
    },
    semester2: {
      name: 'Semester 2',
      startDate: 'February 1',
      endDate: 'June 19'
    }
  }
};

export const websiteConfig = {
  config, // Reference the config object defined above

  // Important dates and deadlines
  dates: {
    currentSchoolYear: '2025-2026',
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

  // FAQ Categories and their questions
  categories: {
    nonPrimary: {
      title: 'Non-Primary Students',
      icon: 'GraduationCap',
      description: 'For Alberta students taking extra courses while enrolled at another school',
      color: '#3B82F6', // Blue
      faqs: [
        {
          question: 'What does it mean to be a Non-Primary Student?',
          answer: 'Non-primary students are Alberta students who attend another school full-time but take extra courses with RTD Academy. These courses are free because they are funded by Alberta Education.',
          priority: 'low'
        },
        {
          question: 'Who is eligible?',
          answer: `To be a non-primary student at RTD Academy:
• You must have a primary enrollment with another school in Alberta
• This option is only for students in Grades ${config.grades.highSchoolStart}–${config.grades.highSchoolEnd}
• In some cases, school-age students without primary enrollment may qualify as Summer School Students`,
          priority: 'low'
        },
        {
          question: 'How many credits can I take?',
          answer: `• Up to ${config.credits.maxPerYear} credits during the school year (September–June) for free
• Up to ${config.credits.maxSummer} additional credits during summer school (July–August) for free
• This means you can take up to ${config.credits.maxTotalPerYear} credits total per year at no cost!
• If you want more than ${config.credits.maxPerYear} credits during the school year specifically, you can either:
  - Pay for extra credits ($${config.pricing.pricePerExtraCredit} per credit), or
  - Wait and take additional courses as a Summer School Student for free`,
          priority: 'low'
        },
        {
          question: 'How is my term decided?',
          answer: `At RTD Academy, your student type is determined by your end date. You can usually start whenever you'd like, but when you plan to finish makes the difference. For most students, the specific term you finish in doesn't significantly impact your academic goals, as long as you complete your course within the school year.`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 1 Students?',
          answer: `Term 1 Students:
• End date is in ${config.semesters.semester1.name} (ending ${config.semesters.semester1.endDate})
• Must register by September 29
• Important: If you start after the September count day, you cannot plan to finish in January
• Example: A student who starts in October cannot end in January`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 2 Students?',
          answer: `Term 2 Students:
• End date is in ${config.semesters.semester2.name} (${config.semesters.semester2.startDate} - ${config.semesters.semester2.endDate})
• May start earlier (even in ${config.semesters.semester1.name}), but end date must be in ${config.semesters.semester2.name}
• Must register by April 15
• To have your mark submitted to Alberta Education (PASI), must finish by June 19
• If you finish after June 19, you will be considered a Summer School Student`,
          priority: 'low'
        },
        {
          question: 'How does Summer School work for Non-Primary Students?',
          answer: `If you're a non-primary student who doesn't complete your course by ${websiteConfig.dates.term2.pasiDeadline}, you automatically transition to Summer School:
• Your course continues into July/August
• Your final mark will be submitted after summer school ends
• Marks appear on your transcript in September instead of June`,
          priority: 'low'
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
          question: 'Can I take courses if I\'m not enrolled with a Primary Registration in another Alberta school?',
          answer: `If you are school-age (under ${config.ages.adultStudentMinAge} before ${config.ages.ageVerificationDate}) but not primarily enrolled elsewhere, you may still qualify as a Summer School Student for the current school year. Otherwise, you would need to register as an Adult Student.`,
          priority: 'low'
        },
        {
          question: 'When will my marks be submitted to Alberta Education?',
          answer: `Your marks are submitted based on when you complete your course:
• Term 1: Marks submitted in February
• Term 2: Marks submitted by June 30 (if completed by ${websiteConfig.dates.term2.pasiDeadline})
• Summer School: Marks submitted in September`,
          priority: 'low'
        },
        {
          question: 'Do you take on primary registrations?',
          answer: `Not yet, but we are working on creating all high school level courses and a lot of options. We will hopefully be able to take on full-time students with a primary registration soon!`,
          priority: 'low'
        }
      ]
    },

    homeEducation: {
      title: 'Home Education Students',
      icon: 'Home',
      description: 'For students registered in Alberta home education programs taking high school courses',
      color: '#10B981', // Green
      faqs: [
        {
          question: 'What does it mean to be a Home Education Non-Primary Student?',
          answer: 'These students are enrolled in a home education program with a school authority in Alberta, but take extra high school courses with RTD Academy. These courses are free to Home education students through Alberta Education funding',
          priority: 'low'
        },
        {
          question: 'Who is eligible?',
          answer: `To be a home education non-primary student at RTD Academy:
• You must be registered in a home education program in Alberta
• This is only available for grades 10–12 courses.`,
          priority: 'low'
        },
        {
          question: 'How many credits can I take?',
          answer: `• Up to ${config.credits.maxPerYear} credits during the school year (September–June) for free
• Up to ${config.credits.maxSummer} additional credits during summer school (July–August) for free
• This means you can take up to ${config.credits.maxTotalPerYear} credits total per year at no cost!
• If you want more than ${config.credits.maxPerYear} credits during the school year specifically, you can either:
  - Pay for extra credits ($${config.pricing.pricePerExtraCredit} per credit), or
  - Wait and take additional courses as a Summer School Student for free`,
          priority: 'low'
        },
        {
          question: 'How is my term decided?',
          answer: 'Your end date determines your term, similar to non-primary students. You can start when convenient, but your planned completion date determines your student type.',
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 1 Students?',
          answer: `Term 1 Students:
• End date is in ${config.semesters.semester1.name} (ending ${config.semesters.semester1.endDate})
• Must register by September 29
• If you start after the September count day, you cannot plan to finish in January`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 2 Students?',
          answer: `Term 2 Students:
• End date is in Semester 2 (February 1 - June 19)
• May start earlier, but end date must be in Semester 2
• Must register by February 28 (different from regular non-primary students)
• To have your mark submitted to PASI, must finish by June 19
• If you finish after June 19, you become a Summer School Student`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Summer School Students?',
          answer: `Summer School Students:
• End date is in July or August
• Up to ${config.credits.maxSummer} credits free during summer
• May start earlier in the year, but final mark only goes on transcript after summer ends`,
          priority: 'low'
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
        },
        {
          question: 'Can younger home education students take high school courses?',
          answer: `Yes, home education students can enroll in high school courses at a younger age, but there are important considerations:

**Prerequisite Approval Required:**
Our principal must confirm that each student has the necessary prerequisites for their chosen courses. This ensures students are set up for success.

**What This Means for Parents:**
• We review each registration to verify prerequisite completion
• This applies to ALL students, but is especially important for younger learners
• We may contact you to discuss course readiness if needed

**Our Strong Recommendation:**
While we support flexible learning paths, we strongly advise parents to carefully consider:
• Your child's academic readiness for high school-level content
• Whether prerequisites have been thoroughly covered
• The importance of placing students in courses where they can succeed

**Why This Matters:**
High school courses build on foundational knowledge. Starting a course without proper prerequisites can lead to frustration and may impact your child's confidence and love of learning.

If you're unsure about course placement, please contact us to discuss the best path for your child's success.`,
          priority: 'high'
        },
        {
          question: 'What prerequisites are needed for high school courses?',
          answer: `Prerequisites vary by course level and subject. Here are common examples:

**Grade ${config.grades.highSchoolStart} Courses:**
• Generally require Grade ${config.grades.highSchoolStart - 1} completion or equivalent knowledge
• Math 10C requires strong foundation in Grade ${config.grades.highSchoolStart - 1} mathematics
• Science 10 requires Grade ${config.grades.highSchoolStart - 1} science concepts

**Grade ${config.grades.highSchoolStart + 1} Courses:**
• Require successful completion of related Grade ${config.grades.highSchoolStart} courses
• Example: Physics 20 requires Science 10 and Math 10C

**Grade ${config.grades.highSchoolEnd} Courses:**
• Require the Grade ${config.grades.highSchoolEnd - 1} course in the same subject
• Example: Chemistry 30 requires Chemistry 20

**For Home Education Families:**
If your child has covered the material through your home education program but hasn't taken formal courses, please contact us. We can discuss equivalent preparation and help determine if your child is ready for the course.

Remember: Prerequisites exist to ensure student success. They're not arbitrary barriers, but important building blocks for learning.`,
          priority: 'low'
        },
        {
          question: 'How is RTD Academy funded for Home Education students?',
          answer: `RTD Academy receives $${config.pricing.distanceEducationGrant} per student per year through the Distance Education grant for Home Education students. This government funding allows us to offer up to ${config.credits.maxPerYear} credits per year completely free to home education families. This is how we can provide quality courses at no cost to you!`,
          priority: 'high'
        },
        {
          question: 'Does taking RTD Academy courses affect my home education grant funding?',
          answer: `No! This is important to understand: The $${config.pricing.distanceEducationGrant} Distance Education grant that RTD Academy receives is completely separate from and on top of any grant funding your family receives through your home education organization.

RTD Academy receives this funding directly from the government - it does NOT come out of your family's grant funding portion. Your home education funding remains exactly the same whether you take our courses or not.`,
          priority: 'high'
        },
        {
          question: 'Why is there sometimes confusion about this grant funding?',
          answer: `Great question! Many home education families aren't aware that the Distance Education grant exists on top of their regular home education funding. This can cause confusion because:

• It's additional funding they might not have known about
• They worry it might reduce their home education grant (it doesn't!)
• They're unsure if this is part of their regular grant from their home education organization (it's not!)

To be clear: This is separate government funding that goes directly to RTD Academy, allowing us to offer you free courses without any impact on your other funding.`,
          priority: 'high'
        },
        {
          question: 'What should I know about how grant funding works between schools?',
          answer: `There's an important provision in the grant funding rules: When a student is registered with multiple schools, the school with the higher number of credits receives the entire Distance Education grant funding.

With this in mind, we encourage you to:
• Connect with your home education organization to discuss your course plans
• Ensure all schools are aware of where you're taking credits
• Coordinate so that each school receives the funding they expect

This coordination helps ensure smooth funding for all schools involved in your education!`,
          priority: 'high'
        },
        {
          question: 'Do I need to pay anything or apply for special funding?',
          answer: `No! The courses are truly free for you. You don't need to:
• Pay any fees (for up to ${config.credits.maxPerYear} credits)
• Apply for special funding
• Fill out grant applications
• Do any extra paperwork

Simply register with us and we handle all the funding details with the government. The Distance Education grant covers everything!`,
          priority: 'low'
        },
        {
          question: 'How should I coordinate with my home education organization about RTD Academy courses?',
          answer: `We recommend open communication with your home education organization:

• Let them know you're planning to take courses with RTD Academy
• Discuss how many credits you'll be taking with us
• Ensure they understand this won't affect their funding or your relationship with them
• Coordinate to make sure funding flows properly to all schools

Remember: Schools work together to support your education! Clear communication helps everyone plan appropriately and ensures you get the best educational experience possible.`,
          priority: 'low'
        },
        {
          question: 'What is the difference between RTD Connect and RTD Academy courses?',
          answer: `Great question! These are two completely different programs we offer:

**RTD Connect** (https://rtd-connect.com)
• Our complete HOME EDUCATION program
• You register your child with us as your home education provider
• We provide facilitator support, learning plan development, and reimbursements
• You receive up to $${config.pricing.rtdConnectReimbursement.grades1to12}/year (Gr ${config.grades.elementaryStart}-${config.grades.highSchoolEnd}) or $${config.pricing.rtdConnectReimbursement.kindergarten}/year (${config.grades.kindergarten}) in reimbursements for educational materials
• We are your primary home education organization
• Visit https://rtd-connect.com to learn more

**RTD Academy Distance Education Courses**
• Individual HIGH SCHOOL COURSES (Grades ${config.grades.highSchoolStart}-${config.grades.highSchoolEnd} only)
• For students already registered with another home education program
• Up to ${config.credits.maxPerYear} free credits per year through Distance Education grant
• You remain with your current home education provider
• We only provide the specific courses, not full home education support`,
          priority: 'high'
        },
        {
          question: 'Can I use both RTD Connect and take RTD Academy courses?',
          answer: `This depends on your situation:

**If you choose RTD Connect as your home education provider:**
• You're already part of our family!
• You can access RTD Academy high school courses as part of your home education program
• Your RTD Connect facilitator can help you navigate course options
• Everything is coordinated through one organization

**If you're with another home education provider:**
• You can take RTD Academy courses as a non-primary student
• You keep your current home education provider and facilitator
• RTD Academy provides only the specific courses you register for
• You'll need to coordinate between your home education provider and RTD Academy`,
          priority: 'high'
        },
        {
          question: 'Should I switch to RTD Connect for my home education?',
          answer: `RTD Connect might be a great fit if you're looking for:

✓ Alberta-certified teacher facilitators with home education experience
✓ Flexible, parent-directed approach to learning
✓ Support for diverse learners and all educational philosophies
✓ Easy online platform for plans, portfolios, and reimbursements
✓ Up to $${config.pricing.rtdConnectReimbursement.grades1to12}/year in reimbursements (Grades ${config.grades.elementaryStart}-${config.grades.highSchoolEnd})
✓ Access to digital tools and subscriptions
✓ Supportive community of home educating families

Learn more at: https://rtd-connect.com

However, if you're happy with your current home education provider, you can simply take our Distance Education courses while staying with them. We support whatever works best for your family!`,
          priority: 'low'
        },
        {
          question: 'How does this affect my Shared Responsibility Grant?',
          answer: `Important: According to the funding manual, students who receive Distance Education grant funding may not be eligible for the Shared Responsibility Grant as well.

If you're currently part of a shared responsibility program with your home school facilitator, please check with them before registering for courses with us. While the Distance Education grant is separate from your regular home education funding, it may impact specific grant programs like Shared Responsibility.

Note: If you're interested in a different approach, RTD Connect (our home education program) offers full support with facilitators and reimbursements. Learn more at https://rtd-connect.com

We love our fellow home education programs and want to ensure there are no surprises with your funding arrangements! 😊`,
          priority: 'high'
        }
      ]
    },

    summerStudents: {
      title: 'Summer Students',
      icon: 'Sun',
      description: 'For students taking courses during July and August',
      color: '#F59E0B', // Amber
      faqs: [
        {
          question: 'Coming Soon',
          answer: 'Summer student information will be available soon. Please check back later or contact us for more information.',
          priority: 'low'
        }
      ]
    },

    adultStudents: {
      title: 'Adult Students',
      icon: 'UserCheck',
      description: `For students aged ${config.ages.adultStudentMinAge}+ pursuing high school completion`,
      color: '#8B5CF6', // Purple
      faqs: [
        {
          question: 'Coming Soon',
          answer: 'Adult student information will be available soon. Please check back later or visit our Adult Students page for current information.',
          priority: 'low'
        }
      ]
    },

    internationalStudents: {
      title: 'International Students',
      icon: 'Globe',
      description: 'For students outside of Alberta accessing our courses',
      color: '#EF4444', // Red
      faqs: [
        {
          question: 'Coming Soon',
          answer: 'International student information will be available soon. Please check back later or contact us for more information.',
          priority: 'low'
        }
      ]
    },

    rtdConnect: {
      title: 'RTD Connect - Home Education Program',
      icon: 'Home',
      description: 'Our complete home education program with facilitator support and reimbursements',
      color: '#8B5CF6', // Purple to match RTD Connect branding
      isExternalLink: true,
      externalUrl: 'https://rtd-connect.com',
      faqs: [] // Empty - this category just links to external site
    },

    teacherStrike: {
      title: 'Teacher Strike Information',
      icon: 'Info',
      description: 'Important information about how the ATA teacher strike affects RTD Academy students',
      color: '#DC2626', // Red
      faqs: [
        {
          question: 'Is RTD Academy affected by the teachers\' strike?',
          answer: `No, RTD Academy is not affected by the ATA teachers' strike. As an independent online school, all our courses, resources, and teacher support will continue to be fully available without interruption.`,
          priority: 'low'
        },
        {
          question: 'Will my courses and teacher support continue during the strike?',
          answer: `Yes, absolutely. All RTD Academy courses will continue as usual, and your teachers will remain fully available to support you throughout any potential strike action. There will be no disruption to your learning.`,
          priority: 'low'
        },
        {
          question: 'Why is RTD Academy not affected by the strike?',
          answer: `RTD Academy is an independent school, which means we operate separately from the public school system. The ATA (Alberta Teachers' Association) strike only affects teachers in public and separate school divisions, not independent schools like ours.`,
          priority: 'low'
        },
        {
          question: 'Can I still register for new courses during the strike?',
          answer: `Yes, registration remains open and fully operational. We have additional staff ready to help manage any increased volume of registrations during this time. You can register for courses as normal.`,
          priority: 'low'
        },
        {
          question: 'What if my home routine is disrupted because of the strike?',
          answer: `We understand that the strike may affect your household, especially if you have siblings in public schools or parents who are teachers. If you need adjustments to pacing or deadlines, please reach out to your teacher. We're committed to being flexible and supporting each student's unique situation.`,
          priority: 'low'
        },
        {
          question: 'Will there be any changes to course deadlines or requirements?',
          answer: `Course requirements remain the same, but we understand that some families may need flexibility. If the strike affects your ability to maintain your regular study schedule, contact your teacher to discuss adjustments to deadlines or pacing.`,
          priority: 'low'
        },
        {
          question: 'Can I transfer from my public school to RTD Academy during the strike?',
          answer: `While we can accept non-primary registrations (students taking extra courses), we are not yet able to accept primary registrations. This means you would need to maintain your enrollment at your current school while taking additional courses with us.`,
          priority: 'low'
        },
        {
          question: 'How will RTD Academy communicate updates during the strike?',
          answer: `If the strike occurs, we will:
• Send email updates to all current families
• Post messages in the Learning Management System (LMS)
• Keep this FAQ page updated with the latest information
• Your teachers will also be available to answer any questions directly`,
          priority: 'low'
        },
        {
          question: 'What should I do if I have questions about how the strike affects me?',
          answer: `Please reach out to your course teacher directly if you have any questions or concerns. They are fully informed about our policies during the strike and can provide personalized support for your situation.`,
          priority: 'low'
        },
        {
          question: 'Will RTD Academy support students returning after the strike ends?',
          answer: `Yes, our goal is to help all students get back on track for course completion once the strike ends. We'll work with any students who may have had disruptions to ensure they can successfully complete their courses.`,
          priority: 'low'
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
      { text: 'RTD Connect Program', url: 'https://rtd-connect.com', external: true },
      { text: 'Home Education Resources', url: '/home-education' },
      { text: 'Course Catalog', url: '/courses' },
      { text: 'Parent Portal', url: '/parent-login' }
    ],
    rtdConnect: [
      { text: 'Visit RTD Connect', url: 'https://rtd-connect.com', external: true },
      { text: 'Meet Our Facilitators', url: 'https://rtd-connect.com/bio', external: true },
      { text: 'RTD Academy Courses', url: '/courses' }
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
    ],
    teacherStrike: [
      { text: 'Course Registration', url: '/get-started' },
      { text: 'Contact Your Teacher', url: '/login' }
    ]
  }
};

// Helper function to get FAQs by category
export const getFAQsByCategory = (category) => {
  return websiteConfig.categories[category]?.faqs || [];
};

// Helper function to get visible categories (filters out teacher strike if disabled)
export const getVisibleCategories = () => {
  const categories = { ...websiteConfig.categories };
  if (!SHOW_TEACHER_STRIKE_INFO) {
    delete categories.teacherStrike;
  }
  return categories;
};

// Helper function to get all FAQs for search
export const getAllFAQs = () => {
  const allFAQs = [];
  const visibleCategories = getVisibleCategories();
  Object.keys(visibleCategories).forEach(category => {
    // Skip external link categories (like RTD Connect)
    if (visibleCategories[category].isExternalLink) {
      return;
    }
    const categoryFAQs = visibleCategories[category].faqs.map(faq => ({
      ...faq,
      category: visibleCategories[category].title,
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