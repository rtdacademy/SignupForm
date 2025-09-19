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
      grades1to12: 901, // Annual reimbursement for grades 1-12
      kindergarten: 450 // Annual reimbursement for kindergarten
    },
    adultStudent: {
      oneTimePrice: 650, // One-time payment for adult students
      monthlyPayment: 233.33, // Monthly payment amount
      monthlyPaymentMonths: 3, // Number of months for payment plan
      monthlyPaymentTotal: 700, // Total cost for monthly payment plan
      trialPeriodDays: 7, // Trial period length
      gracePeriodDays: 10, // Days behind schedule before lockout
      rejoinFee: 100 // Fee to reset schedule after lockout
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

// Important dates and deadlines
const dates = {
  currentSchoolYear: '2025-2026',
  currentSchoolYearShort: '25/26',
  nextSchoolYear: '2026-2027',
  nextSchoolYearShort: '26/27',
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
    endDate: 'August 31',
    startMonth: 'July',
    endMonth: 'August'
  }
};

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
          question: 'How is my term decided?',
          answer: `Your student type and term are determined by when you plan to finish your course:

**Key Points:**
- You can usually start whenever you'd like
- Your END date determines your term
- For most students, the specific term doesn't significantly impact academic goals

**Term 1:** Ends in Semester 1 (by ${dates.term1.endDate})
**Term 2:** Ends in Semester 2 (${dates.term2.startDate} - ${dates.term2.endDate})
**Summer School:** Ends in July/August

Important: If you start after September count day, you cannot plan to finish in January.`,
          priority: 'low'
        },
        {
          question: 'What if I don\'t finish my course at my scheduled time?',
          answer: `We encourage students to finish by their scheduled end date. Deadlines help you stay on track and avoid procrastination.

If something unexpected happens, you can continue in the next available term:
- Term 1 Student → moves to Term 2
- Term 2 Student → moves to Summer School
- Summer School Student → may need to pay to continue (depends on your situation)

Your marks will only be reported once you finish. Students who repeatedly delay may be required to pay to continue.`,
          priority: 'low'
        },
        {
          question: 'When will my marks be submitted to Alberta Education?',
          answer: `Your marks are typically submitted to Alberta Education within a week of completing your course.

If you follow a standard schedule and complete your course by the end of each term:
- **Term 1:** Marks appear on transcript in February
- **Term 2:** Marks appear by June 30 (if completed by ${dates.term2.pasiDeadline})
- **Summer School:** Marks appear in September

**Remember:** The sooner you complete your course, the sooner your mark can be submitted!`,
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

**Note:** Equivalent knowledge from quality programs (like Saxon Math) is recognized. Contact us to discuss your preparation.`,
          priority: 'low'
        },
        {
          question: 'How many credits can I take for free?',
          answer: `The number of free credits depends on your student type:

**Non-Primary & Home Education Students:**
- Up to ${config.credits.maxPerYear} credits during the school year (September-June)
- Additional ${config.credits.maxSummer} credits in summer school
- Maximum ${config.credits.maxTotalPerYear} free credits per year total

**Summer School Students:**
- Up to ${config.credits.maxSummer} free credits (July-August)

**Extra Credits:**
- Additional credits cost $${config.pricing.pricePerExtraCredit} per credit
- Or wait for the next term/summer for more free credits

**Adult & International Students:**
- Courses require payment (see specific category for pricing)`,
          priority: 'high'
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
- For students already registered with another school/home education program
- Up to ${config.credits.maxPerYear} free credits per year through Distance Education grant
- These are the courses you're looking at on this website`,
          priority: 'high'
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
- We provide detailed MyPass registration instructions`,
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
- Important: If you start after the September count day, you cannot plan to finish in January
- Example: A student who starts in October cannot end in January`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 2 Students?',
          answer: `Term 2 Students:
- End date is in ${config.semesters.semester2.name} (${config.semesters.semester2.startDate} - ${config.semesters.semester2.endDate})
- May start earlier (even in ${config.semesters.semester1.name}), but end date must be in ${config.semesters.semester2.name}
- Must register by ${dates.term2.registrationDeadline}
- To have your mark submitted to Alberta Education (PASI), must finish by ${dates.term2.pasiDeadline}
- If you finish after ${dates.term2.pasiDeadline}, you will be considered a Summer School Student`,
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

If you are school-age (under ${config.ages.adultStudentMinAge} before ${config.ages.ageVerificationDate}) but not primarily enrolled elsewhere:
- You may qualify as a Summer School Student for courses taken in July/August
- Otherwise, you would need to register as an Adult Student`,
          priority: 'low'
        },
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
- If you start after the September count day, you cannot plan to finish in January`,
          priority: 'low'
        },
        {
          question: 'What are the requirements for Term 2 Students?',
          answer: `Term 2 Students:
- End date is in ${config.semesters.semester2.name} (${config.semesters.semester2.startDate} - ${config.semesters.semester2.endDate})
- May start earlier, but end date must be in ${config.semesters.semester2.name}
- Must register by ${dates.term2.homeEducationDeadline} 
- Must finish by ${dates.term2.pasiDeadline}
- If you finish after ${dates.term2.pasiDeadline}, you become a Summer School Student`,
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
          answer: `RTD Academy receives $${config.pricing.distanceEducationGrant} per student per year through the Distance Education grant for Home Education students. This government funding allows us to offer up to ${config.credits.maxPerYear} credits per year completely free to home education families. This is how we can provide quality courses at no cost to you!`,
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

- **Must be school-aged** (under ${config.ages.adultStudentMinAge} as of ${config.ages.ageVerificationDate} of the school year)
- **Must be an Alberta resident**

That's it! You don't need:
- A primary registration at another school
- To be enrolled in home education program

**Not sure if you're school-aged?** Use our age calculator tool on this page to check your eligibility for the current school year.`,
          priority: 'low'
        },
        {
          question: 'Am I too old to be a Summer School Student?',
          answer: `You're considered school-aged if you're under ${config.ages.adultStudentMinAge} as of ${config.ages.ageVerificationDate} of the school year you want to take courses.

**Examples for ${dates.currentSchoolYear}:**
- Turn ${config.ages.adultStudentMinAge} on September 1? ✓ Just made it!
- Turn ${config.ages.adultStudentMinAge} before September 1? ✗ Would be an Adult Student

**Use the age calculator tool** above to instantly check if you qualify as school-aged for any school year.`,
          priority: 'low'
        },
        {
          question: "I'm 18-19 and not enrolled anywhere full-time. Can I still get free courses?",
          answer: `**Yes! This is exactly what Summer School is perfect for.**

If you're 18-19 and not enrolled at another school, you likely can't register as a Non-Primary student (which requires a primary registration elsewhere). However, you CAN register as a Summer School Student and receive up to ${config.credits.maxSummer} credits completely free!

**Why this works:**
- Summer School only requires you to be school-aged (under ${config.ages.adultStudentMinAge} on Sept 1)
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
          answer: `Yes, absolutely!`,
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

**⚠️ IMPORTANT WARNING:**
If you don't finish in summer AND you won't have a primary enrollment the following school year, RTD Academy will receive NO funding for you! This means:
- You would need to pay full tuition to continue
- The course would no longer be free
- You'd be responsible for Adult Student fees

**Our strong advice:** If you're in this category (especially 18-19 year olds not planning to enroll anywhere), please work extra hard to complete your courses during the summer. This is your opportunity for free courses - don't let it slip away!`,
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
- School-aged students (under ${config.ages.adultStudentMinAge})
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
          priority: 'high'
        },
        {
          question: 'How much does it cost for International Students?',
          answer: `**One-time payment:** $${config.pricing.adultStudent.oneTimePrice} CAD per course

**Monthly payment:** $${config.pricing.adultStudent.monthlyPayment}/month for ${config.pricing.adultStudent.monthlyPaymentMonths} months (total $${config.pricing.adultStudent.monthlyPaymentTotal})

All prices in Canadian dollars. ${config.pricing.adultStudent.trialPeriodDays}-day trial period included.`,
          priority: 'high'
        },
        {
          question: 'What payment methods are accepted?',
          answer: `We accept Visa, Mastercard, and other major credit cards through Stripe. Automatic currency conversion to Canadian dollars.`,
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
- Send email updates to all current families
- Post messages in the Learning Management System (LMS)
- Keep this FAQ page updated with the latest information
- Your teachers will also be available to answer any questions directly`,
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