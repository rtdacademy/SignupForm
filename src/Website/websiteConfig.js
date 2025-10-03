// Website Configuration File
// This file contains FAQ content and website-specific configuration
//
// IMPORTANT: Date configuration lives in src/config/calendarConfig.js
// IMPORTANT: Pricing configuration lives in src/config/pricingConfig.js

import {
  TERMS,
  getCurrentSchoolYear,
  getNextSchoolYear,
  getImportantDatesForYear,
  formatImportantDate,
  getCurrentRegistrationPeriod,
  getActiveDeadlines,
  getRegistrationStatus
} from '../config/calendarConfig';

import {
  PRICING,
  CREDITS,
  AGES_GRADES
} from '../config/pricingConfig';

// QUICK ACTIVATION: Change this to true to show teacher strike FAQ section
const SHOW_TEACHER_STRIKE_INFO = true;

// Configuration values imported from importantDates.js
// These are re-exported here for backward compatibility with existing components
const config = {
  pricing: PRICING,
  credits: CREDITS,
  ages: {
    adultStudentMinAge: AGES_GRADES.adultStudentMinAge,
    ageVerificationDate: AGES_GRADES.ageVerificationDate
  },
  grades: {
    highSchoolStart: AGES_GRADES.highSchoolStart,
    highSchoolEnd: AGES_GRADES.highSchoolEnd,
    elementaryStart: AGES_GRADES.elementaryStart,
    kindergarten: AGES_GRADES.kindergarten
  },
  semesters: {
    semester1: TERMS.semester1,
    semester2: TERMS.semester2
  }
};

/**
 * Gets dynamically formatted dates for website display
 * @returns {Object} Object with formatted date strings
 */
const getDatesForDisplay = () => {
  const currentYear = getCurrentSchoolYear();
  const nextYear = getNextSchoolYear();
  const currentYearDates = getImportantDatesForYear(currentYear);

  // Format school year displays
  const yearParts = currentYear.split('/');
  const currentSchoolYear = `20${yearParts[0]}-20${yearParts[1]}`;
  const nextYearParts = nextYear.split('/');
  const nextSchoolYear = `20${nextYearParts[0]}-20${nextYearParts[1]}`;

  // Helper to format dates as "Month Day" format
  const formatShortDate = (date) => {
    return date ? formatImportantDate(date, { month: 'long', day: 'numeric', year: undefined }) : '';
  };

  return {
    currentSchoolYear,
    currentSchoolYearShort: currentYear,
    nextSchoolYear,
    nextSchoolYearShort: nextYear,
    term1: {
      registrationDeadline: formatShortDate(currentYearDates.term1RegistrationDeadline),
      countDay: formatShortDate(currentYearDates.term1CountDay),
      endDate: formatShortDate(currentYearDates.term1End)
    },
    term2: {
      registrationDeadline: formatShortDate(currentYearDates.term2RegistrationDeadline),
      homeEducationDeadline: formatShortDate(currentYearDates.term2HomeEducationDeadline),
      endDate: formatShortDate(currentYearDates.term2End),
      pasiDeadline: formatShortDate(currentYearDates.term2PasiDeadline)
    },
    summerSchool: {
      startDate: formatShortDate(currentYearDates.summerStart),
      endDate: formatShortDate(currentYearDates.summerEnd),
      startMonth: currentYearDates.summerStart ? currentYearDates.summerStart.toLocaleDateString('en-US', { month: 'long' }) : 'July',
      endMonth: currentYearDates.summerEnd ? currentYearDates.summerEnd.toLocaleDateString('en-US', { month: 'long' }) : 'August'
    }
  };
};

// Get dates dynamically (this will be called each time the config is accessed)
const dates = getDatesForDisplay();

export const websiteConfig = {
  config, // Reference the config object defined above
  dates, // Reference the dates object defined above

  // FAQ Categories and their questions
  categories: {
    general: {
      title: 'General Information',
      icon: 'BookOpen',
      description: 'Common questions about courses, schedules, and requirements',
      color: '#6B7280', // Gray
      faqs: [
        {
          question: 'When will my marks be submitted to Alberta Education?',
          answer: `Your marks will be submitted to Alberta Education within 1 week of course completion.`,
          priority: 'low'
        },
        {
          question: 'What prerequisites are needed for high school courses?',
          answer: `Prerequisites vary by course level and subject. **[View our interactive prerequisite flowchart here](/prerequisite-flowchart)** to see the complete pathway through Alberta high school courses.

**Grade ${config.grades.highSchoolStart} Courses:**
- Generally require Grade ${config.grades.highSchoolStart - 1} completion or equivalent knowledge
- Math 10C requires strong foundation in Grade ${config.grades.highSchoolStart - 1} mathematics
- Science 10 requires Grade ${config.grades.highSchoolStart - 1} science concepts

**Grade ${config.grades.highSchoolStart + 1} Courses:**
- Require successful completion of related Grade ${config.grades.highSchoolStart} courses
- Example: Physics 20 requires Science 10 and Math 10C

**Grade ${config.grades.highSchoolEnd} Courses:**
- Require the Grade ${config.grades.highSchoolEnd - 1} course in the same subject
- Example: Chemistry 30 requires Chemistry 20

**Note:** Equivalent knowledge from programs (like Saxon Math) is recognized for Home Education students.`,
          priority: 'low'
        },
        {
          question: 'How does course pricing work?',
          answer: `Course pricing depends on your student type and eligibility for government funding:

**Funded Students** (Non-Primary, Home Education, Summer School):
- Courses are FREE through Alberta Education grants
- Credit limits apply based on your category
- See "Understanding Grant Funding & Course Access" for details

**Paid Students** (Adult, International):
- $${config.pricing.adultStudent.oneTimePrice} per course (one-time payment)
- Payment plans available
- See your specific student category for full pricing details

To determine your student type and pricing, check the category descriptions above or contact us for assistance.`,
          priority: 'low'
        },
        {
          question: 'Do you take on primary registrations?',
          answer: `Not yet, but we are working on creating all high school level courses and a lot of options. We will hopefully be able to take on full-time students with a primary registration soon!

Currently, we offer:
- Non-primary registrations (for students enrolled elsewhere)
- Home education support through RTD Academy courses
- Summer school courses
- Adult student programs`,
          priority: 'low'
        },
        {
          question: 'What is the difference between RTD Connect and RTD Academy courses?',
          answer: `These are two completely different programs we offer:

**[RTD Connect](https://rtd-connect.com)**
- Our complete HOME EDUCATION program
- You register your child with us as your home education provider
- We provide facilitator support, learning plan development, and reimbursements
- You receive up to $${config.pricing.rtdConnectReimbursement.grades1to12}/year (Gr ${config.grades.elementaryStart}-${config.grades.highSchoolEnd}) or $${config.pricing.rtdConnectReimbursement.kindergarten}/year (${config.grades.kindergarten}) in reimbursements
- We are your primary home education organization
- Visit [rtd-connect.com](https://rtd-connect.com) to learn more

**RTD Academy Distance Education Courses**
- Individual HIGH SCHOOL COURSES (Grades ${config.grades.highSchoolStart}-${config.grades.highSchoolEnd} only)
- For students registered with another school/home education program (including RTD Connect students)
- Up to ${config.credits.maxPerYear} free credits per year through Distance Education grant
- These are the courses you're looking at on this website`,
          priority: 'low'
        },
        {
          question: 'Can I use both RTD Connect and take RTD Academy courses?',
          answer: `Yes! Home education students can register for distance education courses, even from their own organization.

**If you choose RTD Connect as your home education provider:**
- You're already part of our family!
- Access RTD Academy high school courses as part of your program
- Your RTD Connect facilitator helps navigate course options
- Everything coordinated through one organization
- Get both home education support AND structured high school courses

This is ideal for families wanting comprehensive support with both their home education program and access to structured high school courses.`,
          priority: 'low'
        },
        {
          question: 'How do assessments and exams work?',
          answer: `All students complete the same assessment structure:

**Online Assessments:**
- Multiple assessments throughout each course
- Complete from home at your convenience
- Immediate feedback on most questions
- Part of your course grade

**Section Exams:**
- Three comprehensive exams per course
- Cover 2-3 units each
- Scheduled online with proctoring
- Multiple time slots available (including evenings/weekends)

**Diploma Exams (where applicable):**
- Worth 30% of final grade for diploma courses
- Written at official Alberta Education test centers
- Can use previous diploma marks or rewrite to improve
- Exam fees paid directly to Alberta Education
- We provide detailed MyPass registration instructions

**Want to see how it works?**
Check out our **[Open Courses](/#open-courses)** - free access to our full course content (without assignments or exams). It's a great way to get a feel for how everything works. The assessments aren't included, but they follow the same format as the practice homework questions you'll see in the courses.`,
          priority: 'low'
        },
        {
          question: 'How can I get help and contact my teacher?',
          answer: `We provide multiple ways to get help and stay connected with your teacher:

**Built-in Question Chat:**
- Every practice question and assessment has a built-in chat feature
- Ask questions directly within the specific problem you're working on
- Your teacher can see exactly what you're struggling with - nothing gets lost in translation
- All context is preserved, making it easier for teachers to provide targeted help

**One-on-One Teacher Meetings:**
- Book personal help sessions with your instructor
- Simple booking page built right into your course
- Available time slots for individual support
- Get help with challenging concepts or any other needs
- Face-to-face virtual support when you need it most

**Regular Communication:**
- Receive progress emails from your instructor
- Updates about your course performance and important information
- Parents are automatically CC'd on all communications
- Stay informed about your student's progress every step of the way`,
          priority: 'low'
        },
        {
          question: 'What is the difference between Open Courses and regular courses?',
          answer: `For a complete comparison and detailed information about our Open Courses, please visit our **[Open Courses section](/#open-courses)**.

In brief: Open Courses provide free access to our full course content for anyone to explore and learn, while regular courses include assessments, teacher support, and official credit toward your Alberta high school diploma.`,
          priority: 'low'
        },
        {
          question: 'What happens if I fall behind my schedule?',
          answer: `

**Flexibility is Built In:**
- Missing an assessment date by a few days is completely fine
- The schedule helps you stay on track but allows for life's unexpected moments
- You won't be penalized for reasonable delays

**When We Reach Out:**
- If you fall significantly behind (2-4 lessons) or stop progressing, your teacher will be contacting you
- This isn't to scold you - we genuinely want to help you succeed
- We'll work together to understand what's happening and find solutions

**Taking Initiative (We Love This!):**
We strongly encourage students to take ownership of their learning. If you're falling behind, reaching out first shows incredible maturity and responsibility. Your teacher will appreciate and respect this!

**How to Communicate Effectively:**
When contacting your teacher about falling behind:
1. Be honest about what happened (illness, family situation, struggling with material, etc.)
2. Suggest a realistic plan to catch up
3. Ask for any support you might need

**Remember:**
- Your teacher is on your team - they want you to succeed
- There's no judgment, only support
- Taking responsibility and communicating proactively are valuable life skills you're developing
- Every student faces challenges; what matters is how you handle them`,
          priority: 'low'
        },
        {
          question: 'What if I fall significantly behind?',
          answer: `If you've fallen substantially behind, don't worry - we have systems in place to help you get back on track.

**Creating a New Schedule:**
- After discussing with your teacher, you may be permitted to create a new schedule
- This updated schedule will show clear, achievable milestones with proper lesson spacing
- Having a realistic path forward often relieves stress and renews motivation

**Important Accountability Measures:**
While we're supportive, we also believe in healthy accountability:
- Teachers will work hard to keep you on your new schedule
- This prevents endless procrastination and schedule adjustments
- Some pressure helps ensure you meet your goals and succeed

**Multiple Schedule Resets:**
- Students who require excessive schedule changes will not be allowed to create a new schedule and may be required to pay to continue
- This policy ensures commitment and prevents abuse of the free course system

**For Adult Students:**
We're accommodating but will still hold you accountable - this balance helps combat procrastination and ensures you reach your goals:
- We understand you're juggling work, family, and education
- Your teacher will send regular check-in messages to keep you on track
- We provide flexibility when you communicate your challenges
- **Critical:** If you fall behind without communicating, your teacher won't know what's happening in your life
- Share your situation openly - we can only accommodate what we know about
- This accountability combined with support has proven most effective for adult learner success`,
          priority: 'low'
        }
      ]
    },

    grantFunding: {
      title: 'Understanding Grant Funding & Course Access',
      icon: 'DollarSign',
      description: 'How provincial funding affects course access and timing',
      color: '#059669', // Emerald
      faqs: [
        {
          question: 'How does grant funding affect when I can start my course?',
          answer: `Alberta Education provides grant funding that allows us to offer free courses to eligible students. These grants come with specific requirements about when formal instruction can occur.

**For Funded Students** (Non-Primary, Home Education, Summer School):
- The government funds these courses through specific grants
- Formal instruction must occur within designated terms
- Early registration provides access to explore and prepare
- Exams and instructor communication begin with your official term

**For Paid Students** (Adult, International):
- No grant restrictions apply
- Full immediate access to everything upon registration
- Complete flexibility in pacing and timing

We work within these provincial guidelines to maximize flexibility while maintaining compliance for continued funding.`,
          priority: 'low'
        },
        {
          question: 'What\'s the difference between registration and my official term start?',
          answer: `**Registration** gives you immediate access to:
- All course materials and content
- Video lessons and reading materials
- Practice questions with unlimited attempts
- Course navigation and exploration
- Support staff assistance

**Official Term Start** activates:
- Exam access
- Instructor communication
- Graded assignment submission
- Formal academic support`,
          priority: 'low'
        },
        {
          question: 'What can I do with early registration access?',
          answer: `With early registration, you get immediate access to explore and work through the entire course at your own pace. You can watch all lessons, complete practice questions, and truly prepare for success. Our support staff is available to help with any navigation questions.

The only restrictions due to grant requirements:
- Exams and quizzes for marks begin with your official term
- Graded assignments are submitted after term start
- Instructor communication opens when your term begins

**Important:** This means you're not just "reviewing" - you can make real progress through the course content. Many students complete a significant portion of their coursework before their term officially starts!`,
          priority: 'low'
        },
        {
          question: 'Why do these restrictions exist?',
          answer: `These restrictions aren't our rules - they're provincial requirements tied to the grants that keep courses free for Alberta families.

**The Reality:**
- Alberta Education provides specific grants for distance education
- These grants require that formal instruction occurs within defined terms
- Without compliance, we could lose funding that keeps courses free
- This would mean all students would need to pay

**Our Commitment:**
- We maximize flexibility within these guidelines
- Early registration access lets you prepare
- Our support team helps you navigate the system
- We advocate for students while maintaining compliance

We understand these restrictions can be frustrating, but they ensure continued free access to quality education for thousands of Alberta students.`,
          priority: 'low'
        },
        {
          question: 'When do terms start and end?',
          answer: `For funded students, courses must align with provincial term dates:

**Term 1:**
- Official start: September 1
- Must finish by: ${dates.term1.endDate}
- Registration deadline: ${dates.term1.registrationDeadline}

**Term 2:**
- Official start: February 1
- Must finish by: ${dates.term2.endDate}
- Registration deadlines vary by student type (see your category)

**Summer School:**
- Official start: July 1
- Must finish by: ${dates.summerSchool.endDate}
- Open to all school-aged Alberta residents

**Remember:** You can register early and access course materials immediately, but exams and instructor communication begin on the official term start date.`,
          priority: 'low'
        },
        {
          question: 'What happens if I don\'t finish by my term deadline?',
          answer: `Life happens, and we understand that. If you're a funded student who can't finish by your term deadline:

**Automatic progression:**
- Term 1 students → continue in Term 2
- Term 2 students → continue in Summer School
- Summer students → may need to pay (depends on your fall enrollment status)

**Important considerations:**
- Your marks are only submitted once you complete the course
- Continuing beyond summer may require payment if you're no longer eligible for funding
- Students who repeatedly delay may be asked to pay to continue

We encourage meeting deadlines when possible, as they help you stay on track and ensure you receive your credits in a timely manner.`,
          priority: 'low'
        },
        {
          question: 'How many free credits can funded students take?',
          answer: `Credit limits for funded students:

**Non-Primary & Home Education Students:**
- Up to ${config.credits.maxPerYear} credits during the school year (Sept-June)
- Additional ${config.credits.maxSummer} credits in summer
- Maximum ${config.credits.maxTotalPerYear} free credits per year total

**Summer School Students:**
- Up to ${config.credits.maxSummer} free credits (July-August)

**Extra Credits:**
- Additional credits beyond these limits cost $${config.pricing.pricePerExtraCredit} per credit
- Or you can wait for the next term/summer for more free credits

These limits exist because Alberta Education provides a fixed amount of funding per student per year.`,
          priority: 'low'
        }
      ]
    },

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
- You must have a primary enrollment with another school in Alberta
- This option is only for students in Grades ${config.grades.highSchoolStart}–${config.grades.highSchoolEnd}`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 1 Students?',
          answer: `Term 1 Students:
- End date is in ${config.semesters.semester1.name} (ending ${config.semesters.semester1.endDate})
- Must register by ${dates.term1.registrationDeadline}
- May register early to access course materials for review and preparation
- Due to grant funding compliance, exams and instructor communication begin September 1
- Support staff available anytime for navigation assistance
- Important: If you start after the September count day, you cannot plan to finish in January

**See "Understanding Grant Funding & Course Access" section for details on early access benefits.**`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 2 Students?',
          answer: `Term 2 Students:
- End date is in ${config.semesters.semester2.name} (${config.semesters.semester2.startDate} - ${config.semesters.semester2.endDate})
- May register early to access course materials for review and preparation
- Due to grant funding compliance, exams and instructor communication begin February 1
- Must register by ${dates.term2.registrationDeadline}
- To have your mark submitted to Alberta Education (PASI), must finish by ${dates.term2.pasiDeadline}
- If you finish after ${dates.term2.pasiDeadline}, you will be considered a Summer School Student

**See "Understanding Grant Funding & Course Access" section for what you can do with early access.**`,
          priority: 'low'
        },
        {
          question: 'How does Summer School work for Non-Primary Students?',
          answer: `If you're a non-primary student who doesn't complete your course by ${dates.term2.pasiDeadline}, you automatically transition to Summer School:
- Your course continues into ${dates.summerSchool.startMonth}/${dates.summerSchool.endMonth}
- Your final mark will be submitted after summer school ends
- Marks appear on your transcript in September instead of June`,
          priority: 'low'
        },
        {
          question: 'Can I take courses if I\'m not enrolled with a Primary Registration in another Alberta school?',
          answer: `No, you cannot register as a Non-Primary student without having a primary registration at another Alberta school. The "Non-Primary" designation specifically requires that you are already enrolled full-time at another school.

If you are school-aged (19 or younger on ${config.ages.ageVerificationDate}) but not primarily enrolled elsewhere:
- You may qualify as a Summer School Student for courses taken in July/August
- Otherwise, you would need to register as an Adult Student`,
          priority: 'low'
        },
        {
          question: 'I\'m registered at another school - why do these term restrictions apply to me?',
          answer: `Even though you're enrolled at another school, RTD Academy courses are funded through a separate Distance Education grant from Alberta Education. This grant - not your home school - covers the cost of your courses with us.

**Key Points:**
- The $${config.pricing.distanceEducationGrant} per year grant comes directly from Alberta Education
- This funding requires compliance with provincial term requirements
- All funded students (Non-Primary, Home Ed, Summer) follow the same rules
- Your primary school's funding is separate from this grant

We work within these requirements to provide you with free access to quality courses while maintaining compliance for continued funding.`,
          priority: 'low'
        }
      ]
    },

    homeEducation: {
      title: 'Home Education Non-Primary Students',
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
- You must be registered in a home education program in Alberta
- This is only available for grades 10–12 courses.`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 1 Students?',
          answer: `Term 1 Students:
- End date is in ${config.semesters.semester1.name} (ending ${config.semesters.semester1.endDate})
- Must register by ${dates.term1.registrationDeadline}
- May register early to access course materials for review and preparation
- Due to grant funding compliance, exams and instructor communication begin September 1
- Support staff available anytime for navigation assistance
- If you start after the September count day, you cannot plan to finish in January

**See "Understanding Grant Funding & Course Access" section for details on early access benefits.**`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 2 Students?',
          answer: `Term 2 Students:
- End date is in ${config.semesters.semester2.name} (${config.semesters.semester2.startDate} - ${config.semesters.semester2.endDate})
- May register early to access course materials for review and preparation
- Due to grant funding compliance, exams and instructor communication begin February 1
- Must register by ${dates.term2.homeEducationDeadline}
- Must finish by ${dates.term2.pasiDeadline}
- If you finish after ${dates.term2.pasiDeadline}, you become a Summer School Student

**See "Understanding Grant Funding & Course Access" section for what you can do with early access.**`,
          priority: 'low'
        },
     
        {
          question: 'Can younger home education students take high school courses?',
          answer: `Yes, home education students can enroll in high school courses at a younger age, but there are important considerations:

**Prerequisite Approval Required:**
Our principal must confirm that each student has the necessary prerequisites for their chosen courses. This ensures students are set up for success.

**What This Means for Parents:**
- We review each registration to verify prerequisite completion
- This applies to ALL students, but is especially important for younger learners
- We may contact you to discuss course readiness if needed

**Our Strong Recommendation:**
While we support flexible learning paths, we strongly advise parents to carefully consider:
- Your child's academic readiness for high school-level content
- Whether prerequisites have been thoroughly covered
- The importance of placing students in courses where they can succeed

**Why This Matters:**
High school courses build on foundational knowledge. Starting a course without proper prerequisites can lead to frustration and may impact your child's confidence and love of learning.

If you're unsure about course placement, please contact us to discuss the best path for your child's success.`,
          priority: 'low'
        },
        {
          question: 'How is RTD Academy funded for Home Education students?',
          answer: `RTD Academy receives $${config.pricing.distanceEducationGrant} per student per year through the Distance Education grant for Home Education students. This government funding allows us to offer up to ${config.credits.maxPerYear} credits per year completely free to home education families.

**Important:** This funding comes with provincial requirements about when formal instruction can occur. We know homeschool families especially value flexibility in scheduling, and our asynchronous format plus early registration access are designed to work with your family's unique needs while maintaining compliance.

See "Understanding Grant Funding & Course Access" for full details.`,
          priority: 'low'
        },
        {
          question: 'Does taking RTD Academy courses affect my home education grant funding?',
          answer: `No! The $${config.pricing.distanceEducationGrant} Distance Education grant that RTD Academy receives is completely separate from and on top of any grant funding your family receives through your home education organization.`,
          priority: 'low'
        },
   

        {
          question: 'How does this work if I am on a Shared Responsibility Program with my home school organization?',
          answer: `Important: According to the funding manual, students who receive Distance Education grant funding may not be eligible for the Shared Responsibility Grant as well.

If you're currently part of a shared responsibility program with your home school facilitator, please check with them before registering for courses with us. While the Distance Education grant is separate from your regular home education funding, it may impact specific grant programs like Shared Responsibility.

We love our fellow home education programs and want to ensure there are no surprises with your funding arrangements! 😊`,
          priority: 'low'
        }
      ]
    },

    summerStudents: {
      title: 'Summer Students',
      icon: 'Sun',
      description: `For students taking courses during ${dates.summerSchool.startMonth} and ${dates.summerSchool.endMonth}`,
      color: '#F59E0B', // Amber
      faqs: [
        {
          question: 'What is a Summer School Student?',
          answer: `Summer School Students are school-aged Alberta residents who take courses during July and August. 

**Key Benefits:**
- No need for enrollment at another school
- Up to ${config.credits.maxSummer} free credits`,
          priority: 'low'
        },
        {
          question: 'Who is eligible for Summer School?',
          answer: `To register as a Summer School Student, you:

- **Must be school-aged** (aged 6-19 on ${config.ages.ageVerificationDate} of the school year)
- **Must be an Alberta resident**

That's it! You don't need:
- A primary registration at another school
- To be enrolled in home education program

**Not sure if you're school-aged?** Use our age calculator tool on this page to check your eligibility for the current school year.`,
          priority: 'low'
        },
        {
          question: 'Am I too old to be a Summer School Student?',
          answer: `You're considered school-aged if you're 19 or younger on ${config.ages.ageVerificationDate} of the school year you want to take courses.

**Examples for ${dates.currentSchoolYear}:**
- Turn 20 on September 1? ✓ Just made it! (You're still 19 on Sept 1)
- Turn 20 before September 1? ✗ Would be an Adult Student

**Use the age calculator tool** above to instantly check if you qualify as school-aged for any school year.`,
          priority: 'low'
        },
        {
          question: "I'm 18-19 and not enrolled anywhere full-time. Can I still get free courses?",
          answer: `**Yes! This is exactly what Summer School is perfect for.**

If you're 18-19 and not enrolled at another school, you likely can't register as a Non-Primary student (which requires a primary registration elsewhere). However, you CAN register as a Summer School Student and receive up to ${config.credits.maxSummer} credits completely free!

**Why this works:**
- Summer School only requires you to be school-aged (19 or younger on Sept 1)
- No requirement for enrollment elsewhere`,
          priority: 'low'
        },
        {
          question: 'When does Summer School run?',
          answer: `Summer School officially runs from **${dates.summerSchool.startDate} to ${dates.summerSchool.endDate}**.

**Important notes:**
- Your course must END during July or August to count as Summer School
- You can START your course earlier (even in the regular school year!)
- Marks typically appear on transcripts in August/September depending on when you finish`,
          priority: 'low'
        },
        {
          question: 'Can I start my Summer School course before July?',
          answer: `Yes, you can register before July and immediately start working through your course! While exams and instructor communication begin July 1st due to grant requirements, you have full access to all course content, lessons, and practice materials right away.

Many students use this early access to complete a significant portion of their coursework. This means when July arrives, they're ready to write exams and can often finish their course quickly.

Our support staff is available anytime to help you navigate the course platform, even before July 1st.`,
          priority: 'low'
        },
        {
          question: "What if I don't finish my course by August 31?",
          answer: `We strongly encourage all students to complete their courses by ${dates.summerSchool.endDate}. However, if you cannot finish on schedule:

**If you WILL have a primary enrollment elsewhere in the fall:**
- You'll be moved to Non-Primary Student status for the new school year
- You can continue your course at no additional cost
- Your mark will be submitted when you complete the course

**If you WON'T have a primary enrollment elsewhere in the fall:**
- You'll be moved to Home Education status (if registered with a home education program)
- OR you'll need to pay tuition as an Adult Student if you're no longer school-aged

**⚠️ CRITICAL WARNING:**
If you don't finish in summer AND you won't have a primary enrollment the following school year, RTD Academy will receive NO funding for you! This means:
- You would need to pay full tuition to continue ($${config.pricing.adultStudent.oneTimePrice} per course)
- The course would no longer be free
- You'd become an Adult Student

**Our strong advice:** If you're in this category (especially 18-19 year olds not planning to enroll anywhere), please prioritize completing your courses during the summer. This is your opportunity for free courses - we want to help you succeed within the funded timeframe!`,
          priority: 'low'
        },
        {
          question: 'How is Summer School different from being a Non-Primary student?',
          answer: `While both offer free courses, there are key differences:

**Summer School Students:**
- No enrollment required elsewhere
- Must finish courses in July/August
- Up to ${config.credits.maxSummer} free credits
- Perfect for students aged 18-19 not enrolled anywhere
- Simpler requirements overall

**Non-Primary Students:**
- MUST be enrolled at another Alberta school
- Can finish courses anytime during school year
- Up to ${config.credits.maxPerYear} free credits
- Not available if you're not enrolled elsewhere

Summer School is often the better choice for flexibility and accessibility!`,
          priority: 'low'
        },
        {
          question: 'How do I know if I qualify as school-aged?',
          answer: `The easiest way is to **use the Age Calculator tool** at the top of this page!`,
          priority: 'low'
        },
        {
          question: 'Can Grade 9 students take high school courses in Summer School?',
          answer: `Yes! Junior high students can take high school courses if they are taken in the summer semester **before entering Grade 10**.`,
          priority: 'low'
        },
        {
          question: 'Do the same grant restrictions apply to Summer School?',
          answer: `Yes, Summer School students follow the same grant funding requirements as other funded programs:

- **Exams and instructor communication:** Begin July 1st
- **Early registration:** Provides immediate access to explore materials
- **Support staff:** Available anytime for navigation help

These requirements ensure we can continue offering free summer courses to Alberta students. See "Understanding Grant Funding & Course Access" for complete details.`,
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
          question: 'What is an Adult Student?',
          answer: `An Adult Student is someone who takes RTD Academy courses but doesn't qualify for government funding. This includes:

**Students aged ${config.ages.adultStudentMinAge} or older:**
- Anyone who is ${config.ages.adultStudentMinAge}+ as of September 1st of the current school year

**Students who don't qualify for other funded categories:**
- Not enrolled at another Alberta school (can't be Non-Primary)
- Not in a home education program (can't be Home Education)
- Missed Summer School deadlines or requirements`,
          priority: 'low'
        },

        {
          question: 'How much does it cost to be an Adult Student?',
          answer: `Adult Students have two payment options:

**One-time payment:** $${config.pricing.adultStudent.oneTimePrice} per course
- Save $${config.pricing.adultStudent.monthlyPaymentTotal - config.pricing.adultStudent.oneTimePrice} compared to monthly payments
- Full payment after ${config.pricing.adultStudent.trialPeriodDays}-day trial

**Monthly payment plan:** $${config.pricing.adultStudent.monthlyPayment}/month for ${config.pricing.adultStudent.monthlyPaymentMonths} months
- Total of $${config.pricing.adultStudent.monthlyPaymentTotal} per course
- First payment after ${config.pricing.adultStudent.trialPeriodDays}-day trial
- Convenient monthly billing

Note: Alberta Education diploma exam fees are separate and paid directly to Alberta Education.`,
          priority: 'low'
        },
        {
          question: 'Why do I have to pay when others get courses for free?',
          answer: `**It's all about government funding eligibility.**

Free courses are available when Alberta Education provides funding to RTD Academy on your behalf. This happens for:
- School-aged students (aged 6-19 on September 1st)
- Students enrolled at other Alberta schools
- Home education students
- Summer school students meeting specific requirements`,
          priority: 'low'
        },
        {
          question: 'Is there a trial period?',
          answer: `**Yes! You get a ${config.pricing.adultStudent.trialPeriodDays}-day trial period with full course access.**

During your trial:
- Complete access to all course materials
- Experience our learning platform
- Try interactive lessons and practice problems
- See if our learning style works for you
- No payment required upfront

**After ${config.pricing.adultStudent.trialPeriodDays} days:**
- Choose your payment option (one-time or monthly)
- Continue with full course access
- Or decide not to continue with no obligation
- Please note that your course will not appear on your transcript until payment is made.`,
          priority: 'low'
        },
        {
          question: 'What if I fall behind schedule?',
          answer: `We understand that life happens! Please contact your teacher if you find yourself falling behind your schedule and make a plan to get back on track. We do allow our Adults students more grace than our younger students, however, we do push you to keep you motivated. The goal is to keep you moving forward while acknowledging that life can be unpredictable.`,
          priority: 'low'
        },
        {
          question: 'Can I really learn at my own pace?',
          answer: `**Yes! Our asynchronous learning model is perfect for adult learners.**

**What this means:**
- No scheduled class times
- Learn when it works for YOU (morning, evening, weekends)
- Pause and replay video lessons
- Work around job and family commitments
- Take breaks when needed

**Your pace, with structure:**
- YourWay Schedule provides goals and deadlines
- Keeps you accountable and progressing
- Flexibility within a framework
- Adjust speed based on topic difficulty

**Support when you need it:**
- Teachers available via messaging
- Help available throughout your journey

This format is specifically designed for adults balancing multiple responsibilities.`,
          priority: 'low'
        },
   
        {
          question: 'What happens after the trial period?',
          answer: `After your ${config.pricing.adultStudent.trialPeriodDays}-day trial ends:

**If you want to continue:**
- Choose your payment option
- One-time: $${config.pricing.adultStudent.oneTimePrice} (save $${config.pricing.adultStudent.monthlyPaymentTotal - config.pricing.adultStudent.oneTimePrice})
- Monthly: $${config.pricing.adultStudent.monthlyPayment} for ${config.pricing.adultStudent.monthlyPaymentMonths} months ($${config.pricing.adultStudent.monthlyPaymentTotal} total)
- Maintain full course access
- Continue exactly where you left off

**If you decide not to continue:**
- No charges, no obligations
- Simply don't proceed with payment
- Your trial access ends
- You can always come back later`,
          priority: 'low'
        },
        {
          question: 'Can I get a refund?',
          answer: `Our ${config.pricing.adultStudent.trialPeriodDays}-day trial period is designed to help you make an informed decision before paying.

**During the trial:**
- Full access to evaluate the course
- No payment required
- Can discontinue without any charges

**After payment:**
- Refund policies may apply in exceptional circumstances
- Contact our support team to discuss your situation
- Each case reviewed individually`,
          priority: 'low'
        },
        {
          question: 'Do I have any restrictions on when I can start coursework?',
          answer: `**No restrictions at all!** As a paying Adult Student, you have complete flexibility. Full immediate access to everything - course materials, exams, instructor support - from day one. Start and finish on YOUR schedule without any waiting periods.

This is one of the key benefits of paid enrollment: you're not bound by the grant funding restrictions that apply to free courses. You can truly learn at your own pace without artificial barriers.

Your ${config.pricing.adultStudent.trialPeriodDays}-day trial starts immediately upon registration, giving you full access to experience our platform right away.`,
          priority: 'low'
        },
        {
          question: 'What if I fall behind schedule as an Adult Student?',
          answer: `We understand you're balancing education with work, family, and other adult responsibilities. Here's how we approach this:

**Our Philosophy:**
We're accommodating but will hold you accountable. This balance helps you overcome procrastination and achieve your educational goals.

**What to Expect:**
- Your teacher will check in if you fall 2-4 lessons behind
- These aren't scolding messages - they're motivational nudges
- We provide flexibility when life gets overwhelming
- You can adjust your schedule when needed (with communication)

**The Key to Success - Communication:**
- **If you communicate:** We'll work with you to find solutions, adjust deadlines, and provide support
- **If you go silent:** Your teacher can't help with problems they don't know about
- A simple message like "Work is crazy this week, I'll catch up on the weekend" goes a long way

**Why We Take This Approach:**
- Adult learners often struggle with self-pacing without any structure
- Gentle accountability dramatically improves completion rates
- Many adult students tell us they appreciate the "nudges" to stay on track
- The combination of flexibility + accountability helps you succeed

**Real Talk:**
You're investing time and money in your education. We want to ensure you get the diploma you're working toward, not just another unfinished online course. Our teachers are here to be your accountability partners, cheerleaders, and support system - but only if you keep the communication lines open.

Remember: There's no judgment for falling behind, only support to help you get back on track.`,
          priority: 'high'
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
          question: 'What is an International Student?',
          answer: `International Students are learners residing outside of Alberta who take our Alberta High School courses online.`,
          priority: 'low'
        },
        {
          question: 'How much does it cost for International Students?',
          answer: `**One-time payment:** $${config.pricing.adultStudent.oneTimePrice} CAD per course

**Monthly payment:** $${config.pricing.adultStudent.monthlyPayment}/month for ${config.pricing.adultStudent.monthlyPaymentMonths} months (total $${config.pricing.adultStudent.monthlyPaymentTotal})

All prices in Canadian dollars. ${config.pricing.adultStudent.trialPeriodDays}-day trial period included.`,
          priority: 'low'
        },
        {
          question: 'What payment methods are accepted?',
          answer: `We accept Visa, Mastercard, and other major credit cards through Stripe. Automatic currency conversion to Canadian dollars.`,
          priority: 'low'
        },
        {
          question: 'Do I have any restrictions on when I can start coursework?',
          answer: `**No restrictions whatsoever!** As an International Student, you enjoy complete freedom. Full immediate access upon registration - course materials, instructor communication, exams - everything is available from day one. Learn on your schedule, in your timezone, without any waiting periods.

This flexibility is a major advantage: unlike funded Alberta students who must wait for official term dates, you can begin your learning journey immediately. Your ${config.pricing.adultStudent.trialPeriodDays}-day trial provides full access from the moment you register.

This is ideal for international learners who may have different academic calendars or urgent timelines for course completion.`,
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
    grantFunding: [
      { text: 'Student Registration', url: '/get-started' },
      { text: 'Course Catalog', url: '/courses' },
      { text: 'Contact Support', url: '/contact' }
    ],
    nonPrimary: [
      { text: 'Understanding Grant Funding', url: '#grantFunding' },
      { text: 'Course Catalog', url: '/courses' },
      { text: 'Registration Guide', url: '/get-started' },
      { text: 'Academic Calendar', url: '/calendar' }
    ],
    homeEducation: [
      { text: 'Understanding Grant Funding', url: '#grantFunding' },
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
      { text: 'Understanding Grant Funding', url: '#grantFunding' },
      { text: 'Summer Course Options', url: '/summer-courses' },
      { text: 'Registration', url: '/get-started' }
    ],
    adultStudents: [
      { text: 'Adult Student Information', url: '/adult-students' },
      { text: 'Course Catalog', url: '/courses' }
    ],
    internationalStudents: [
      { text: 'International Student Guide', url: '/international' },
      { text: 'Course Catalog', url: '/courses' },
      { text: 'Schedule Demo', url: '/yourway-demo' },
      { text: 'Apply for Credit Transfer', url: '/credit-transfer' }
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

// Helper function to get important dates dynamically
export const getImportantDates = () => {
  const currentYear = getCurrentSchoolYear();
  const currentYearDates = getImportantDatesForYear(currentYear);
  const dates = [];

  // Add all important dates with proper formatting
  if (currentYearDates.term1RegistrationDeadline) {
    dates.push({
      label: 'Term 1 Registration Deadline',
      date: currentYearDates.term1RegistrationDeadline,
      type: 'deadline',
      formattedDate: formatImportantDate(currentYearDates.term1RegistrationDeadline, { month: 'long', day: 'numeric' })
    });
  }

  if (currentYearDates.term1End) {
    dates.push({
      label: 'Term 1 End Date',
      date: currentYearDates.term1End,
      type: 'end',
      formattedDate: formatImportantDate(currentYearDates.term1End, { month: 'long', day: 'numeric' })
    });
  }

  if (currentYearDates.term2HomeEducationDeadline) {
    dates.push({
      label: 'Home Ed Term 2 Registration',
      date: currentYearDates.term2HomeEducationDeadline,
      type: 'deadline',
      formattedDate: formatImportantDate(currentYearDates.term2HomeEducationDeadline, { month: 'long', day: 'numeric' })
    });
  }

  if (currentYearDates.term2RegistrationDeadline) {
    dates.push({
      label: 'Term 2 Registration Deadline',
      date: currentYearDates.term2RegistrationDeadline,
      type: 'deadline',
      formattedDate: formatImportantDate(currentYearDates.term2RegistrationDeadline, { month: 'long', day: 'numeric' })
    });
  }

  if (currentYearDates.term2End) {
    dates.push({
      label: 'Term 2 End Date',
      date: currentYearDates.term2End,
      type: 'end',
      formattedDate: formatImportantDate(currentYearDates.term2End, { month: 'long', day: 'numeric' })
    });
  }

  if (currentYearDates.summerRegistrationDeadline) {
    dates.push({
      label: 'Summer School Registration Deadline',
      date: currentYearDates.summerRegistrationDeadline,
      type: 'deadline',
      formattedDate: formatImportantDate(currentYearDates.summerRegistrationDeadline, { month: 'long', day: 'numeric' })
    });
  }

  if (currentYearDates.summerStart) {
    dates.push({
      label: 'Summer School Starts',
      date: currentYearDates.summerStart,
      type: 'start',
      formattedDate: formatImportantDate(currentYearDates.summerStart, { month: 'long', day: 'numeric' })
    });
  }

  if (currentYearDates.summerEnd) {
    dates.push({
      label: 'Summer School Ends',
      date: currentYearDates.summerEnd,
      type: 'end',
      formattedDate: formatImportantDate(currentYearDates.summerEnd, { month: 'long', day: 'numeric' })
    });
  }

  // Sort by date
  return dates.sort((a, b) => a.date - b.date);
};

// Export dynamic registration functions for use on landing page
export { getRegistrationStatus, getCurrentRegistrationPeriod, getActiveDeadlines };

export default websiteConfig;