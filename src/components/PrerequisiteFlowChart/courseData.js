// Alberta Education Course Prerequisites Data Structure
// This data represents the official Alberta high school course sequences and prerequisites

export const courseData = {
  // Mathematics Courses
  mathematics: {
    grade10: [
      {
        id: 'math10c',
        code: 'Mathematics 10C',
        name: 'Mathematics 10 Combined',
        credits: 5,
        description: 'Foundation for Mathematics 20-1 and 20-2',
        prerequisites: [],
        leadsTo: ['math20-1', 'math20-2'],
        nonStandardLeadsTo: ['math20-3'], // Non-standard pathway (dotted line)
        grade: 10,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 0, col: 0 }, // Top row (academic path), Grade 10
        careerPathways: [
          'Engineering programs',
          'Computer Science',
          'Medicine and Health Sciences',
          'Physical Sciences',
          'Mathematics and Statistics'
        ],
        universityPrograms: [
          'Engineering (all disciplines)',
          'Computer Science',
          'Physics',
          'Chemistry',
          'Mathematics',
          'Pre-medicine programs'
        ],
        detailedInfo: {
          skills: [
            'Real-world problem-solving applications',
            'Mathematical reasoning and communication',
            'Spatial visualization and measurement',
            'Algebraic thinking and manipulation',
            'Trigonometric problem solving',
            'Abstract reasoning development'
          ],
          importance: 'Foundation course that opens pathways to both Mathematics 20-1 (university preparation) and 20-2 (college/diverse programs). Students need 65%+ to succeed in Math 20-1.',
          recommendedFor: 'Students planning university sciences, engineering, or wanting flexibility in post-secondary options.'
        }
      },
      {
        id: 'math10-3',
        code: 'Mathematics 10-3',
        name: 'Mathematics 10-3',
        credits: 5,
        description: 'Workplace and apprenticeship preparation',
        prerequisites: [],
        leadsTo: ['math20-3'],
        grade: 10,
        stream: 'workplace',
        diplomaExam: false,
        gridPosition: { row: 2, col: 0 }, // Third row (workplace path), Grade 10
        careerPathways: [
          'Skilled trades and apprenticeships',
          'Construction and building trades',
          'Automotive and transportation',
          'Manufacturing and production',
          'Service industry careers',
          'Direct workforce entry'
        ],
        universityPrograms: [
          'Technical college programs',
          'Trade certification programs',
          'Some business certificates',
          'Community college diplomas'
        ],
        detailedInfo: {
          skills: [
            'Practical problem-solving for workplace',
            'Financial literacy and consumer math',
            'Measurement and estimation skills',
            'Data interpretation and analysis',
            'Mathematical communication in work contexts'
          ],
          importance: 'Designed for students planning to enter the workforce or apprenticeship programs directly after high school.',
          recommendedFor: 'Students interested in trades, apprenticeships, or immediate workforce entry.'
        }
      },
      {
        id: 'math10-4',
        code: 'Mathematics 10-4',
        name: 'Mathematics 10-4',
        credits: 5,
        description: 'Knowledge and employability mathematics',
        prerequisites: [],
        leadsTo: ['math20-4'],
        grade: 10,
        stream: 'knowledge',
        diplomaExam: false,
        gridPosition: { row: 3, col: 0 }, // Fourth row (knowledge and employability), Grade 10
        careerPathways: [
          'Entry-level service positions',
          'Supported employment opportunities',
          'Community-based work programs',
          'Life skills-focused careers',
          'Personal care and support services'
        ],
        universityPrograms: [
          'Adult learning programs',
          'Life skills training',
          'Supported education programs',
          'Community college preparatory programs'
        ],
        detailedInfo: {
          skills: [
            'Practical life mathematics',
            'Financial awareness and budgeting',
            'Problem-solving for daily living',
            'Basic numeracy skills',
            'Mathematical communication'
          ],
          importance: 'Modified programming for diverse learners focusing on practical mathematics for independent living and employment.',
          recommendedFor: 'Students requiring modified programming or additional support to achieve success in mathematics.'
        }
      }
    ],
    grade11: [
      {
        id: 'math20-1',
        code: 'Mathematics 20-1',
        name: 'Mathematics 20-1',
        credits: 5,
        description: 'Pre-calculus path for sciences and engineering',
        prerequisites: ['math10c'],
        recommendedGrade: 65,
        leadsTo: ['math30-1'],
        nonStandardLeadsTo: ['math30-2'], // Non-standard pathway down to 30-2
        grade: 11,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 0, col: 1 }, // Top row, Grade 11
        careerPathways: [
          'Engineering (all disciplines)',
          'Computer Science and Software Development',
          'Medicine and Health Sciences',
          'Physical Sciences and Research',
          'Architecture and Design',
          'Advanced Mathematics and Statistics',
          'Actuarial Science and Finance'
        ],
        universityPrograms: [
          'All Engineering programs',
          'Computer Science',
          'Pure and Applied Mathematics',
          'Physics and Astronomy',
          'Chemistry',
          'Pre-medical and pre-dental programs',
          'Architecture',
          'Advanced Business programs'
        ],
        detailedInfo: {
          skills: [
            'Abstract reasoning and algebraic manipulation',
            'Trigonometric problem-solving',
            'Function analysis and graphing',
            'Mathematical modeling and applications',
            'Preparation for calculus concepts'
          ],
          importance: 'Pre-calculus sequence essential for STEM fields. Prepares students for Math 30-1 and calculus. Required for most engineering and science programs.',
          recommendedFor: 'Students planning to take calculus in high school (Math 31) and university. Essential for engineering, computer science, and physical sciences.'
        }
      },
      {
        id: 'math20-2',
        code: 'Mathematics 20-2',
        name: 'Mathematics 20-2',
        credits: 5,
        description: 'For students entering non-science post-secondary',
        prerequisites: ['math10c'],
        leadsTo: ['math30-2'],
        nonStandardLeadsTo: ['math30-3'], // Non-standard pathway down to 30-3
        grade: 11,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 1, col: 1 }, // Second row, Grade 11
        careerPathways: [
          'Business and Management',
          'Arts and Humanities',
          'Social Services and Psychology',
          'Education and Teaching',
          'Medical Technologies',
          'Civil Engineering Technology',
          'Marketing and Communications',
          'Criminal Justice and Law Enforcement'
        ],
        universityPrograms: [
          'Business Administration',
          'Arts programs (English, History, etc.)',
          'Education (Elementary and Secondary)',
          'Psychology and Social Work',
          'Medical technology programs',
          'Engineering technology diplomas',
          'Communications and Media Studies',
          'Many college diploma programs'
        ],
        detailedInfo: {
          skills: [
            'Statistical analysis and data interpretation',
            'Logical reasoning and proof strategies',
            'Real-world mathematical applications',
            'Problem-solving across diverse contexts',
            'Mathematical communication and reasoning'
          ],
          importance: 'Broader mathematical content including statistics and reasoning. Accepted by most colleges and universities for diverse programs. Provides flexibility for various career paths.',
          recommendedFor: 'Students planning diverse post-secondary programs including arts, business, education, and some technical programs. Good option for those not pursuing pure sciences.'
        }
      },
      {
        id: 'math20-3',
        code: 'Mathematics 20-3',
        name: 'Mathematics 20-3',
        credits: 5,
        description: 'Trades and workplace mathematics',
        prerequisites: ['math10-3'],
        leadsTo: ['math30-3'],
        grade: 11,
        stream: 'workplace',
        diplomaExam: false,
        gridPosition: { row: 2, col: 1 }, // Third row, Grade 11
        careerPathways: [
          'Skilled trades (electrician, plumber, carpenter)',
          'Automotive and mechanical trades',
          'Construction and building trades',
          'Manufacturing and production',
          'Heavy equipment operation',
          'Welding and fabrication',
          'HVAC and refrigeration',
          'Food service and hospitality'
        ],
        universityPrograms: [
          'Apprenticeship programs (all trades)',
          'Technical training institutes',
          'College trade certification',
          'Workplace training programs',
          'Some business certificates',
          'Community college diplomas'
        ],
        detailedInfo: {
          skills: [
            'Practical mathematical applications',
            'Measurement and calculation for trades',
            'Problem-solving in work contexts',
            'Blueprint reading and interpretation',
            'Financial planning and budgeting',
            'Technical communication and documentation'
          ],
          importance: 'Workplace-focused mathematics preparing students for apprenticeship programs and direct workforce entry. Emphasizes practical applications.',
          recommendedFor: 'Students planning to enter trades, apprenticeships, or technical careers immediately after high school.'
        }
      },
      {
        id: 'math20-4',
        code: 'Mathematics 20-4',
        name: 'Mathematics 20-4',
        credits: 5,
        description: 'Knowledge and employability mathematics',
        prerequisites: ['math10-4'],
        leadsTo: [],
        grade: 11,
        stream: 'knowledge',
        diplomaExam: false,
        gridPosition: { row: 3, col: 1 }, // Fourth row, Grade 11
        careerPathways: [
          'Supported employment programs',
          'Community service roles',
          'Entry-level retail and service',
          'Personal care assistant roles',
          'Food service positions',
          'Custodial and maintenance work'
        ],
        universityPrograms: [
          'Life skills programs',
          'Adult education and literacy',
          'Supported learning programs',
          'Community college preparatory',
          'Vocational training with support'
        ],
        detailedInfo: {
          skills: [
            'Independent living mathematics',
            'Personal budgeting and finance',
            'Workplace safety calculations',
            'Communication of mathematical ideas',
            'Problem-solving for daily life'
          ],
          importance: 'Final mathematics course for Knowledge and Employability stream. Focuses on practical mathematics for independent living and supported employment.',
          recommendedFor: 'Students requiring additional support and modified programming. Prepares for independent living and supported employment opportunities.'
        }
      }
    ],
    grade12: [
      {
        id: 'math30-1',
        code: 'Mathematics 30-1',
        name: 'Mathematics 30-1',
        credits: 5,
        description: 'Pre-calculus mathematics',
        prerequisites: ['math20-1'],
        recommendedGrade: 60,
        leadsTo: ['math31'],
        grade: 12,
        stream: 'academic',
        diplomaExam: true,
        gridPosition: { row: 0, col: 2 }, // Top row, Grade 12
        careerPathways: [
          'Engineering (all fields)',
          'Computer Science and Technology',
          'Medicine and Dentistry',
          'Pharmacy',
          'Physics and Astronomy',
          'Architecture',
          'Actuarial Science'
        ],
        universityPrograms: [
          'All Engineering programs',
          'Computer Science',
          'Mathematics',
          'Physics',
          'Chemistry',
          'Pre-med/Pre-dent programs',
          'Business (some programs)',
          'Architecture'
        ],
        detailedInfo: {
          skills: [
            'Advanced algebraic manipulation',
            'Trigonometric problem solving',
            'Function analysis and graphing',
            'Mathematical modeling'
          ],
          importance: 'Required for most STEM university programs. Prepares students for calculus and advanced mathematics.'
        }
      },
      {
        id: 'math30-2',
        code: 'Mathematics 30-2',
        name: 'Mathematics 30-2',
        credits: 5,
        description: 'Mathematics for various post-secondary programs',
        prerequisites: ['math20-2'],
        leadsTo: [],
        nonStandardLeadsTo: ['math30-1'], // Non-standard pathway up to 30-1
        grade: 12,
        stream: 'academic',
        diplomaExam: true,
        gridPosition: { row: 1, col: 2 }, // Second row, Grade 12
        careerPathways: [
          'Business and Finance',
          'Education and Training',
          'Social Work and Human Services',
          'Marketing and Sales',
          'Healthcare Technology',
          'Criminal Justice',
          'Media and Communications',
          'Public Administration'
        ],
        universityPrograms: [
          'Business Administration',
          'Education degrees',
          'Arts and Humanities',
          'Social Sciences',
          'Nursing and Health Sciences',
          'Psychology and Counseling',
          'Communications and Journalism',
          'Most college and university programs'
        ],
        detailedInfo: {
          skills: [
            'Statistical analysis and interpretation',
            'Mathematical modeling in various contexts',
            'Problem-solving with technology',
            'Financial mathematics applications',
            'Logical reasoning and proof',
            'Data analysis and decision making'
          ],
          importance: 'Diploma exam course accepted by most post-secondary institutions. Provides mathematical foundation for diverse career paths. Often preferred over 30-1 for non-STEM programs.',
          recommendedFor: 'Students entering business, arts, education, or social sciences. Good choice for those not requiring calculus but wanting strong mathematical background.'
        }
      },
      {
        id: 'math30-3',
        code: 'Mathematics 30-3',
        name: 'Mathematics 30-3',
        credits: 5,
        description: 'Apprenticeship and workplace mathematics',
        prerequisites: ['math20-3'],
        leadsTo: [],
        grade: 12,
        stream: 'workplace',
        diplomaExam: false,
        gridPosition: { row: 2, col: 2 }, // Third row, Grade 12
        careerPathways: [
          'Journeyman tradesperson (all trades)',
          'Construction supervisor and foreman',
          'Automotive technician and mechanic',
          'Manufacturing technician',
          'Heavy equipment operator',
          'Welding and fabrication specialist',
          'Electrical and electronics technician',
          'Small business ownership (trades-based)'
        ],
        universityPrograms: [
          'Red River College technical programs',
          'SAIT trades and technology',
          'NAIT technical training',
          'Apprenticeship completion programs',
          'Technical diploma programs',
          'Some business and entrepreneurship programs'
        ],
        detailedInfo: {
          skills: [
            'Advanced technical calculations',
            'Business planning and financial analysis',
            'Quality control and statistical analysis',
            'Project planning and cost estimation',
            'Leadership and supervisory mathematics',
            'Entrepreneurship and business mathematics'
          ],
          importance: 'Culminating workplace mathematics course. Prepares students for advanced technical careers, supervisory roles, and business ownership in trades.',
          recommendedFor: 'Students completing apprenticeships or entering advanced technical careers. Essential for those planning supervisory roles or business ownership in trades.'
        }
      },
      {
        id: 'math31',
        code: 'Mathematics 31',
        name: 'Calculus',
        credits: 5,
        description: 'Introduction to calculus for engineering and sciences',
        prerequisites: ['math30-1'],
        leadsTo: [],
        grade: 12,
        stream: 'advanced',
        diplomaExam: false,
        gridPosition: { row: 0, col: 3 }, // Top row, Post-Grade 12 (column 3)
        careerPathways: [
          'Advanced Engineering (all disciplines)',
          'Pure and Applied Mathematics',
          'Theoretical Physics and Research',
          'Quantitative Finance and Economics',
          'Data Science and Analytics',
          'Research and Development',
          'Actuarial Science',
          'Computer Science and AI Research'
        ],
        universityPrograms: [
          'Engineering (with advanced standing)',
          'Pure Mathematics and Statistics',
          'Physics and Astronomy',
          'Computer Science (research focus)',
          'Economics (quantitative programs)',
          'Actuarial Science',
          'Mathematical Finance',
          'Research-focused science programs'
        ],
        detailedInfo: {
          skills: [
            'Advanced mathematical modeling',
            'Analytical and abstract thinking',
            'Complex problem-solving strategies',
            'Mathematical proof and reasoning',
            'Advanced computational skills',
            'Research and investigation methods'
          ],
          importance: 'Advanced mathematics course providing university-level calculus. Gives students significant advantage in STEM programs and may provide university credit.',
          recommendedFor: 'Top mathematics students planning engineering, pure sciences, or mathematics programs. Provides advanced standing and preparation for university calculus sequences.'
        }
      }
    ]
  },

  // Science Courses
  sciences: {
    grade10: [
      {
        id: 'science10',
        code: 'Science 10',
        name: 'Science 10',
        credits: 5,
        description: 'Foundation for all 20-level sciences',
        prerequisites: [],
        recommendedGrade: 65,
        leadsTo: ['biology20', 'chemistry20', 'physics20', 'science20'],
        nonStandardLeadsTo: ['science14'], // Non-standard pathway to Science 14
        grade: 10,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 2.5, col: 0 }, // Centered between academic and applied streams, Grade 10
        careerPathways: [
          'Health Sciences and Medicine',
          'Engineering and Technology',
          'Environmental Sciences',
          'Research and Development',
          'Science Education',
          'Laboratory Technology',
          'Veterinary Medicine'
        ],
        universityPrograms: [
          'All science-based university programs',
          'Medicine and Health Sciences',
          'Engineering (all disciplines)',
          'Environmental Science',
          'Agriculture and Life Sciences',
          'Science Education',
          'Veterinary Medicine'
        ],
        detailedInfo: {
          skills: [
            'Scientific inquiry and investigation',
            'Laboratory techniques and safety',
            'Data collection and analysis',
            'Scientific communication',
            'Problem-solving using scientific method',
            'Understanding of biological, chemical, and physical concepts'
          ],
          importance: 'Foundation course that opens pathways to all Grade 11 sciences. Students need 60%+ for success in Biology 20, Chemistry 20, or Physics 20.',
          recommendedFor: 'All students planning to take any Grade 11 science courses. Essential for students considering science-based post-secondary programs.'
        }
      },
      {
        id: 'science14',
        code: 'Science 14',
        name: 'Science 14',
        credits: 5,
        description: 'Applied science course with practical focus',
        prerequisites: [],
        recommendedGrade: 50,
        leadsTo: ['science24'],
        grade: 10,
        stream: 'applied',
        diplomaExam: false,
        gridPosition: { row: 4, col: 0 }, // Applied stream row, Grade 10
        careerPathways: [
          'Applied technology careers',
          'Technical support roles',
          'Environmental technology',
          'Laboratory assistant positions',
          'Science-related trades',
          'Community health services'
        ],
        universityPrograms: [
          'Technical college programs',
          'Applied science diplomas',
          'Environmental technology programs',
          'Some health technology programs',
          'Community college science programs'
        ],
        detailedInfo: {
          skills: [
            'Practical application of scientific concepts',
            'Hands-on laboratory experiences',
            'Technology use in science',
            'Environmental awareness',
            'Basic scientific problem-solving',
            'Science communication skills'
          ],
          importance: 'Designed for students who learn best through practical applications. Provides foundational science knowledge with hands-on approach.',
          recommendedFor: 'Students who prefer practical, hands-on learning and may be considering technical or applied science careers.'
        }
      }
    ],
    grade11: [
      {
        id: 'biology20',
        code: 'Biology 20',
        name: 'Biology 20',
        credits: 5,
        description: 'Study of living systems and biological processes',
        prerequisites: ['science10'],
        recommendedGrade: 60,
        leadsTo: ['biology30'],
        nonStandardLeadsTo: ['science30'], // Can contribute to Science 30 requirement
        grade: 11,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 0, col: 1 }, // Top row, Grade 11
        careerPathways: [
          'Medicine and Healthcare',
          'Veterinary Medicine',
          'Research and Laboratory Sciences',
          'Environmental Biology',
          'Biotechnology',
          'Pharmacy and Pharmaceutical Sciences',
          'Nursing and Allied Health',
          'Conservation and Wildlife Biology',
          'Agriculture and Food Sciences',
          'Science Education'
        ],
        universityPrograms: [
          'Medicine and Dentistry',
          'Nursing and Health Sciences',
          'Biological Sciences',
          'Environmental Science',
          'Agriculture and Life Sciences',
          'Veterinary Medicine',
          'Pharmacy',
          'Biotechnology',
          'Kinesiology and Exercise Science',
          'Education (Science Teaching)'
        ],
        detailedInfo: {
          skills: [
            'Understanding of cellular biology and genetics',
            'Ecosystem and environmental interactions',
            'Human body systems and physiology',
            'Scientific research and investigation methods',
            'Laboratory techniques and microscopy',
            'Data analysis and interpretation',
            'Scientific communication and reporting'
          ],
          importance: 'Essential for students planning health sciences, medicine, or biological research careers. Strong foundation for Biology 30 and university biology programs.',
          recommendedFor: 'Students interested in medicine, health sciences, environmental science, or biological research. Required for most health-related university programs.'
        }
      },
      {
        id: 'chemistry20',
        code: 'Chemistry 20',
        name: 'Chemistry 20',
        credits: 5,
        description: 'Matter, chemical change, and atomic theory',
        prerequisites: ['science10'],
        recommendedGrade: 60,
        corequisite: 'Academic math course (Math 20-1 or 20-2) recommended',
        leadsTo: ['chemistry30'],
        nonStandardLeadsTo: ['science30'], // Can contribute to Science 30 requirement
        grade: 11,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 1, col: 1 }, // Second row, Grade 11
        careerPathways: [
          'Chemical Engineering',
          'Pharmaceutical Sciences',
          'Materials Science and Engineering',
          'Environmental Chemistry',
          'Forensic Science',
          'Research and Development',
          'Chemical Manufacturing',
          'Quality Control and Analysis',
          'Petroleum and Energy Industries',
          'Food Science and Technology'
        ],
        universityPrograms: [
          'Chemical Engineering',
          'Chemistry and Biochemistry',
          'Pharmacy',
          'Materials Engineering',
          'Environmental Engineering',
          'Medicine and Health Sciences',
          'Forensic Science',
          'Food Science',
          'Petroleum Engineering',
          'Nanotechnology'
        ],
        detailedInfo: {
          skills: [
            'Understanding atomic structure and bonding',
            'Chemical reactions and stoichiometry',
            'Laboratory techniques and safety protocols',
            'Mathematical problem-solving in chemistry',
            'Data collection and analysis',
            'Scientific reasoning and hypothesis testing',
            'Chemical nomenclature and formula writing'
          ],
          importance: 'Critical for students planning engineering, medicine, or pure sciences. Develops mathematical and analytical thinking skills essential for STEM fields.',
          recommendedFor: 'Students interested in engineering, medicine, pharmacy, or chemical sciences. Strong mathematical skills recommended for success.'
        }
      },
      {
        id: 'physics20',
        code: 'Physics 20',
        name: 'Physics 20',
        credits: 5,
        description: 'Motion, forces, energy, and waves',
        prerequisites: ['science10'],
        recommendedGrade: 60,
        corequisite: 'Academic math course (Math 20-1 recommended) strongly advised',
        leadsTo: ['physics30'],
        nonStandardLeadsTo: ['science30'], // Can contribute to Science 30 requirement
        grade: 11,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 2, col: 1 }, // Third row, Grade 11
        careerPathways: [
          'Engineering (all disciplines)',
          'Physics and Astronomy',
          'Computer Science and Technology',
          'Aerospace and Aviation',
          'Nuclear and Energy Industries',
          'Medical Physics and Imaging',
          'Research and Development',
          'Telecommunications',
          'Robotics and Automation',
          'Data Science and Analytics'
        ],
        universityPrograms: [
          'All Engineering programs',
          'Physics and Applied Physics',
          'Computer Science',
          'Astronomy and Astrophysics',
          'Geophysics',
          'Engineering Physics',
          'Medical Physics',
          'Mathematics and Statistics',
          'Meteorology',
          'Nuclear Science'
        ],
        detailedInfo: {
          skills: [
            'Mathematical modeling and problem-solving',
            'Understanding of motion and forces',
            'Energy conservation and transformations',
            'Wave properties and behavior',
            'Laboratory investigation techniques',
            'Data analysis and graphical interpretation',
            'Abstract thinking and logical reasoning'
          ],
          importance: 'Essential for all engineering programs and physics-based careers. Develops strong mathematical and analytical thinking skills.',
          recommendedFor: 'Students planning engineering, computer science, or physics. Strong mathematics background (Math 20-1) highly recommended.'
        }
      },
      {
        id: 'science20',
        code: 'Science 20',
        name: 'Science 20',
        credits: 5,
        description: 'General science with emphasis on applications',
        prerequisites: ['science10'],
        recommendedGrade: 50,
        leadsTo: ['science30'],
        grade: 11,
        stream: 'general',
        diplomaExam: false,
        gridPosition: { row: 3, col: 1 }, // Fourth row, Grade 11
        careerPathways: [
          'Science Education',
          'Environmental Technology',
          'Science Communication',
          'Technical Writing',
          'Science Policy and Administration',
          'Community Health Services',
          'Science-related Business',
          'Museum and Science Center Work'
        ],
        universityPrograms: [
          'General Science programs',
          'Science Education',
          'Environmental Studies',
          'Science Communication',
          'Interdisciplinary Science programs',
          'Some Arts and Science programs',
          'Education programs with science focus'
        ],
        detailedInfo: {
          skills: [
            'Broad understanding of scientific concepts',
            'Integration of biology, chemistry, and physics',
            'Scientific literacy and communication',
            'Critical thinking about science in society',
            'Environmental awareness and stewardship',
            'Problem-solving across scientific disciplines'
          ],
          importance: 'Provides broad scientific literacy for students not specializing in specific sciences. Good foundation for Science 30.',
          recommendedFor: 'Students wanting general science background without specializing in biology, chemistry, or physics. Good for future teachers or science communicators.'
        }
      },
      {
        id: 'science24',
        code: 'Science 24',
        name: 'Science 24',
        credits: 5,
        description: 'Applied science with workplace applications',
        prerequisites: ['science14'],
        recommendedGrade: 50,
        leadsTo: [],
        grade: 11,
        stream: 'applied',
        diplomaExam: false,
        gridPosition: { row: 4, col: 1 }, // Applied stream, Grade 11
        note: 'Does not serve as prerequisite for Science 30',
        careerPathways: [
          'Environmental technology careers',
          'Science technician roles',
          'Laboratory assistant positions',
          'Quality control in manufacturing',
          'Science-related trades',
          'Community health and safety roles',
          'Applied research support'
        ],
        universityPrograms: [
          'Applied science diploma programs',
          'Environmental technology programs',
          'Technical college certificates',
          'Some health technology programs',
          'Community college applied science programs'
        ],
        detailedInfo: {
          skills: [
            'Practical application of scientific principles',
            'Workplace safety and environmental awareness',
            'Use of scientific instruments and technology',
            'Data collection and basic analysis',
            'Technical communication skills',
            'Problem-solving in applied contexts'
          ],
          importance: 'Terminal applied science course focusing on workplace applications. Does not lead to Science 30 or other academic sciences.',
          recommendedFor: 'Students in applied stream who want practical science knowledge for technical careers or direct workforce entry.'
        }
      }
    ],
    grade12: [
      {
        id: 'biology30',
        code: 'Biology 30',
        name: 'Biology 30',
        credits: 5,
        description: 'Advanced biological systems and processes',
        prerequisites: ['biology20'],
        recommendedGrade: 60,
        leadsTo: [],
        grade: 12,
        stream: 'academic',
        diplomaExam: true,
        gridPosition: { row: 0, col: 2 }, // Top row, Grade 12
        careerPathways: [
          'Medicine and Dentistry',
          'Veterinary Medicine',
          'Biomedical Research',
          'Genetic Counseling',
          'Biotechnology and Pharmaceuticals',
          'Environmental Biology and Conservation',
          'Marine and Wildlife Biology',
          'Microbiology and Immunology',
          'Neuroscience and Psychology',
          'Agriculture and Food Sciences'
        ],
        universityPrograms: [
          'Medicine and Dentistry (required)',
          'Veterinary Medicine (required)',
          'Biological Sciences (required)',
          'Nursing and Health Sciences',
          'Pharmacy (required)',
          'Environmental Science',
          'Agriculture and Life Sciences',
          'Biotechnology',
          'Psychology (recommended)',
          'Kinesiology and Exercise Science'
        ],
        detailedInfo: {
          skills: [
            'Advanced understanding of molecular biology',
            'Genetics and heredity principles',
            'Population biology and evolution',
            'Human anatomy and physiology',
            'Research design and methodology',
            'Advanced laboratory techniques',
            'Scientific writing and communication'
          ],
          importance: 'Diploma exam course required for most health sciences and biological research programs. Essential for medical school admission.',
          recommendedFor: 'Students planning medicine, dentistry, veterinary medicine, or advanced biological sciences. Required for most health science university programs.'
        }
      },
      {
        id: 'chemistry30',
        code: 'Chemistry 30',
        name: 'Chemistry 30',
        credits: 5,
        description: 'Advanced chemistry concepts and applications',
        prerequisites: ['chemistry20'],
        recommendedGrade: 60,
        corequisite: 'Math 30-1 or 30-2 recommended for success',
        leadsTo: [],
        grade: 12,
        stream: 'academic',
        diplomaExam: true,
        gridPosition: { row: 1, col: 2 }, // Second row, Grade 12
        careerPathways: [
          'Chemical and Materials Engineering',
          'Pharmaceutical Research and Development',
          'Environmental Chemistry and Engineering',
          'Forensic Chemistry and Analysis',
          'Petroleum and Energy Industries',
          'Food Science and Quality Control',
          'Chemical Manufacturing and Process Engineering',
          'Medical Laboratory Technology',
          'Research and Academic Chemistry',
          'Patent Law (chemistry focus)'
        ],
        universityPrograms: [
          'Chemical Engineering (required)',
          'Chemistry and Biochemistry (required)',
          'Materials Engineering',
          'Environmental Engineering',
          'Pharmacy (required)',
          'Medicine (recommended)',
          'Forensic Science',
          'Food Science',
          'Petroleum Engineering',
          'Chemical Physics'
        ],
        detailedInfo: {
          skills: [
            'Advanced chemical calculations and stoichiometry',
            'Thermodynamics and kinetics',
            'Organic and inorganic chemistry principles',
            'Analytical chemistry techniques',
            'Advanced laboratory skills and instrumentation',
            'Mathematical modeling of chemical processes',
            'Research methodology and data analysis'
          ],
          importance: 'Diploma exam course required for engineering and chemistry programs. Develops advanced mathematical and analytical skills essential for STEM careers.',
          recommendedFor: 'Students planning chemical engineering, chemistry, pharmacy, or medicine. Strong mathematics background essential for success.'
        }
      },
      {
        id: 'physics30',
        code: 'Physics 30',
        name: 'Physics 30',
        credits: 5,
        description: 'Advanced physics including modern physics concepts',
        prerequisites: ['physics20'],
        recommendedGrade: 60,
        corequisite: 'Math 30-1 strongly recommended',
        leadsTo: [],
        grade: 12,
        stream: 'academic',
        diplomaExam: true,
        gridPosition: { row: 2, col: 2 }, // Third row, Grade 12
        careerPathways: [
          'Engineering (all disciplines)',
          'Physics and Applied Physics Research',
          'Aerospace and Defense Industries',
          'Nuclear Engineering and Technology',
          'Medical Physics and Imaging',
          'Computer Science and Software Engineering',
          'Robotics and Automation',
          'Renewable Energy Technology',
          'Telecommunications and Electronics',
          'Quantitative Finance and Data Science'
        ],
        universityPrograms: [
          'All Engineering programs (highly recommended)',
          'Physics and Applied Physics (required)',
          'Computer Science (recommended)',
          'Astronomy and Astrophysics',
          'Geophysics',
          'Engineering Physics',
          'Medical Physics',
          'Mathematics and Statistics',
          'Meteorology and Atmospheric Science',
          'Nuclear Engineering'
        ],
        detailedInfo: {
          skills: [
            'Advanced mathematical modeling and problem-solving',
            'Understanding of electromagnetic theory',
            'Modern physics concepts (quantum and relativity)',
            'Advanced laboratory techniques and instrumentation',
            'Computer modeling and simulation',
            'Research design and methodology',
            'Abstract thinking and theoretical reasoning'
          ],
          importance: 'Diploma exam course essential for engineering and physics programs. Provides strongest preparation for university-level physics and mathematics.',
          recommendedFor: 'Students planning engineering, physics, computer science, or mathematics. Math 30-1 co-enrollment strongly recommended.'
        }
      },
      {
        id: 'science30',
        code: 'Science 30',
        name: 'Science 30',
        credits: 5,
        description: 'Integrated science for diploma requirements',
        prerequisites: ['science20'], // Primary pathway from Science 20
        // Note: Also accepts Biology 20, Chemistry 20, or Physics 20 as alternatives
        prerequisiteNote: 'Any ONE 20-level science (Science 20, Biology 20, Chemistry 20, or Physics 20)',
        recommendedGrade: 50,
        leadsTo: [],
        grade: 12,
        stream: 'general',
        diplomaExam: true,
        gridPosition: { row: 3, col: 2 }, // Fourth row, Grade 12
        careerPathways: [
          'Science Education and Teaching',
          'Science Communication and Journalism',
          'Environmental Policy and Administration',
          'Science Museum and Center Work',
          'Technical Writing and Documentation',
          'Science-related Business and Sales',
          'Community Health and Safety',
          'Science Consulting and Policy'
        ],
        universityPrograms: [
          'Education programs (Science Teaching)',
          'General Science programs',
          'Environmental Studies',
          'Science Communication',
          'Arts and Science (interdisciplinary)',
          'Some Business programs',
          'Public Administration',
          'Community and Regional Planning'
        ],
        detailedInfo: {
          skills: [
            'Integration of biological, chemical, and physical concepts',
            'Scientific literacy and critical thinking',
            'Understanding science in societal contexts',
            'Environmental awareness and stewardship',
            'Science communication and public understanding',
            'Problem-solving across scientific disciplines'
          ],
          importance: 'Diploma exam course meeting science requirement for Alberta High School Diploma. Provides broad scientific literacy for diverse career paths.',
          recommendedFor: 'Students who need a science diploma exam but are not specializing in specific sciences. Good for future teachers, communicators, or those in arts/humanities.'
        }
      }
    ]
  },

  // English Language Arts
  englishLanguageArts: {
    grade10: [
      {
        id: 'ela10-1',
        code: 'English Language Arts 10-1',
        name: 'ELA 10-1',
        credits: 5,
        description: 'Academic English for university-bound students',
        prerequisites: [],
        leadsTo: ['ela20-1'],
        grade: 10,
        stream: 'academic',
        diplomaExam: false
      },
      {
        id: 'ela10-2',
        code: 'English Language Arts 10-2',
        name: 'ELA 10-2',
        credits: 5,
        description: 'English for college and workplace',
        prerequisites: [],
        leadsTo: ['ela20-2'],
        grade: 10,
        stream: 'general',
        diplomaExam: false
      }
    ],
    grade11: [
      {
        id: 'ela20-1',
        code: 'English Language Arts 20-1',
        name: 'ELA 20-1',
        credits: 5,
        description: 'Continued academic English studies',
        prerequisites: ['ela10-1'],
        leadsTo: ['ela30-1'],
        grade: 11,
        stream: 'academic',
        diplomaExam: false
      },
      {
        id: 'ela20-2',
        code: 'English Language Arts 20-2',
        name: 'ELA 20-2',
        credits: 5,
        description: 'Practical English skills development',
        prerequisites: ['ela10-2'],
        leadsTo: ['ela30-2'],
        grade: 11,
        stream: 'general',
        diplomaExam: false
      }
    ],
    grade12: [
      {
        id: 'ela30-1',
        code: 'English Language Arts 30-1',
        name: 'ELA 30-1',
        credits: 5,
        description: 'University preparation English',
        prerequisites: ['ela20-1'],
        leadsTo: [],
        grade: 12,
        stream: 'academic',
        diplomaExam: true
      },
      {
        id: 'ela30-2',
        code: 'English Language Arts 30-2',
        name: 'ELA 30-2',
        credits: 5,
        description: 'English for college and career',
        prerequisites: ['ela20-2'],
        leadsTo: [],
        grade: 12,
        stream: 'general',
        diplomaExam: true
      }
    ]
  },

  // Social Studies
  socialStudies: {
    grade10: [
      {
        id: 'social10-1',
        code: 'Social Studies 10-1',
        name: 'Social Studies 10-1',
        credits: 5,
        description: 'Globalization and nationalism',
        prerequisites: [],
        leadsTo: ['social20-1'],
        grade: 10,
        stream: 'academic',
        diplomaExam: false
      },
      {
        id: 'social10-2',
        code: 'Social Studies 10-2',
        name: 'Social Studies 10-2',
        credits: 5,
        description: 'Living in a globalizing world',
        prerequisites: [],
        leadsTo: ['social20-2'],
        grade: 10,
        stream: 'general',
        diplomaExam: false
      }
    ],
    grade11: [
      {
        id: 'social20-1',
        code: 'Social Studies 20-1',
        name: 'Social Studies 20-1',
        credits: 5,
        description: 'Nationalism and internationalism',
        prerequisites: ['social10-1'],
        leadsTo: ['social30-1'],
        grade: 11,
        stream: 'academic',
        diplomaExam: false
      },
      {
        id: 'social20-2',
        code: 'Social Studies 20-2',
        name: 'Social Studies 20-2',
        credits: 5,
        description: 'Understandings of nationalism',
        prerequisites: ['social10-2'],
        leadsTo: ['social30-2'],
        grade: 11,
        stream: 'general',
        diplomaExam: false
      }
    ],
    grade12: [
      {
        id: 'social30-1',
        code: 'Social Studies 30-1',
        name: 'Social Studies 30-1',
        credits: 5,
        description: 'Ideologies and citizenship',
        prerequisites: ['social20-1'],
        leadsTo: [],
        grade: 12,
        stream: 'academic',
        diplomaExam: true
      },
      {
        id: 'social30-2',
        code: 'Social Studies 30-2',
        name: 'Social Studies 30-2',
        credits: 5,
        description: 'Understandings of ideologies',
        prerequisites: ['social20-2'],
        leadsTo: [],
        grade: 12,
        stream: 'general',
        diplomaExam: true
      }
    ]
  }
};

// Helper function to get all courses as a flat array
export const getAllCourses = () => {
  const courses = [];
  Object.values(courseData).forEach(subject => {
    Object.values(subject).forEach(gradeLevel => {
      courses.push(...gradeLevel);
    });
  });
  return courses;
};

// Helper function to get course by ID
export const getCourseById = (courseId) => {
  return getAllCourses().find(course => course.id === courseId);
};

// Helper function to get prerequisites for a course
export const getPrerequisites = (courseId) => {
  const course = getCourseById(courseId);
  if (!course || !course.prerequisites) return [];
  
  return course.prerequisites.map(prereqId => getCourseById(prereqId)).filter(Boolean);
};

// Helper function to get courses that lead from a specific course
export const getNextCourses = (courseId) => {
  const course = getCourseById(courseId);
  if (!course || !course.leadsTo) return [];
  
  return course.leadsTo.map(nextId => getCourseById(nextId)).filter(Boolean);
};

// Color schemes for different subjects
export const subjectColors = {
  mathematics: {
    primary: '#3B82F6', // blue
    secondary: '#93C5FD',
    light: '#DBEAFE'
  },
  sciences: {
    primary: '#10B981', // green
    secondary: '#86EFAC',
    light: '#D1FAE5'
  },
  englishLanguageArts: {
    primary: '#8B5CF6', // purple
    secondary: '#C4B5FD',
    light: '#EDE9FE'
  },
  socialStudies: {
    primary: '#F59E0B', // amber
    secondary: '#FCD34D',
    light: '#FEF3C7'
  }
};

// Stream indicators
export const streamInfo = {
  academic: {
    label: 'Academic',
    description: 'University preparation',
    icon: '🎓'
  },
  general: {
    label: 'General',
    description: 'College and career preparation',
    icon: '📚'
  },
  workplace: {
    label: 'Workplace',
    description: 'Direct to workforce or apprenticeship',
    icon: '🔧'
  },
  applied: {
    label: 'Applied',
    description: 'Practical application focus',
    icon: '⚡'
  },
  advanced: {
    label: 'Advanced',
    description: 'Beyond grade 12 level',
    icon: '🚀'
  },
  knowledge: {
    label: 'Knowledge & Employability',
    description: 'Modified programming for diverse learners',
    icon: '🎯'
  }
};

// Notes for special cases
export const specialNotes = {
  adultLearners: 'Adult students (20+) may enroll in any course regardless of prerequisites. Completing a higher-level course automatically grants credit for prerequisites.',
  recommendedGrades: 'Recommended grades are suggestions for success. Students with lower grades may still enroll but should be prepared for additional challenges.',
  diplomaExams: 'Diploma exams are worth 30% of the final grade and are required for these courses.',
  courseChanges: 'Students can change between -1 and -2 streams at each grade level with counselor approval.'
};