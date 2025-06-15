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
        nonStandardLeadsTo: ['ela20-2'], // Can move down to -2 stream
        grade: 10,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 0, col: 0 }, // Top row (academic path), Grade 10
        careerPathways: [
          'University academic programs',
          'Law and Legal Studies',
          'Journalism and Communications',
          'Education and Teaching',
          'Publishing and Editorial',
          'Public Relations and Marketing',
          'Research and Academia',
          'Government and Public Administration',
          'Creative Writing and Literature',
          'Literary Criticism and Analysis'
        ],
        universityPrograms: [
          'Arts and Humanities degrees',
          'Law programs (required)',
          'Education degrees (required)',
          'Journalism and Communications',
          'English Literature and Linguistics',
          'Philosophy and Religious Studies',
          'History and Political Science',
          'Psychology and Social Work',
          'Pre-professional programs (medicine, dentistry)',
          'All university programs requiring ELA 30-1'
        ],
        detailedInfo: {
          skills: [
            'Advanced literary analysis and interpretation',
            'Critical thinking and analytical reasoning',
            'Academic essay writing and composition',
            'Research and citation skills',
            'Close reading and textual analysis',
            'Creative and expository writing',
            'Oral presentation and discussion skills',
            'Media literacy and critical evaluation'
          ],
          importance: 'Rigorous academic course preparing students for university-level English studies. Students entering with below 65% historically struggle with intense expectations. Builds critical reading and writing skills essential for academic success.',
          recommendedFor: 'Students planning university degrees requiring strong literary analysis and critical writing skills. Essential for those pursuing humanities, law, education, or other academic programs.'
        }
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
        diplomaExam: false,
        gridPosition: { row: 1, col: 0 }, // Second row (general path), Grade 10
        careerPathways: [
          'Business and Administration',
          'Technical and Skilled Trades',
          'Customer Service and Sales',
          'Healthcare Support Services',
          'Community and Social Services',
          'Media and Creative Arts',
          'Tourism and Hospitality',
          'Emergency Services and Public Safety',
          'Manufacturing and Production',
          'Direct workforce entry positions'
        ],
        universityPrograms: [
          'College diploma programs',
          'Technical and vocational training',
          'Applied degree programs',
          'Business certificates and diplomas',
          'Health technology programs',
          'Creative arts and media programs',
          'Apprenticeship programs',
          'Community college programs',
          'Some university programs (with ELA 30-2)',
          'Adult education and upgrading programs'
        ],
        detailedInfo: {
          skills: [
            'Practical communication for daily living and careers',
            'Workplace writing and documentation',
            'Effective spoken communication',
            'Basic literary analysis and interpretation',
            'Media literacy and critical thinking',
            'Collaborative and teamwork skills',
            'Problem-solving through language arts',
            'Personal and professional writing formats'
          ],
          importance: 'Focuses on basic communication skills and practical application of English language arts for personal and working life. Designed for students pursuing college diploma programs or technical trades.',
          recommendedFor: 'Students planning college diploma programs, technical trades, or direct workforce entry. Good foundation for those not requiring intensive literary analysis.'
        }
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
        nonStandardLeadsTo: ['ela30-2'], // Can move down to -2 stream
        grade: 11,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 0, col: 1 }, // Top row, Grade 11
        careerPathways: [
          'Advanced academic and research careers',
          'Law and Legal Professions',
          'Journalism and Media Communications',
          'Publishing and Editorial Services',
          'Education and Academic Teaching',
          'Government Policy and Administration',
          'Corporate Communications and PR',
          'Literary and Cultural Analysis',
          'Professional Writing and Editing',
          'Research and Think Tank Work'
        ],
        universityPrograms: [
          'Competitive university programs',
          'Pre-law and Legal Studies',
          'Advanced English and Literature',
          'Communications and Journalism',
          'Education and Teacher Training',
          'Philosophy and Critical Studies',
          'International Relations and Politics',
          'Graduate school preparation',
          'Honours and research programs',
          'Professional degree prerequisites'
        ],
        detailedInfo: {
          skills: [
            'Advanced literary and textual analysis',
            'Sophisticated academic writing and argumentation',
            'Critical evaluation of complex texts',
            'Research methodology and source analysis',
            'Advanced composition and rhetoric',
            'Comparative literature and cultural studies',
            'Independent critical thinking and inquiry',
            'Advanced presentation and seminar skills'
          ],
          importance: 'Continuation of rigorous academic English stream. Develops sophisticated analytical and writing skills required for ELA 30-1 and university success in humanities and professional programs.',
          recommendedFor: 'Students committed to university-bound academic pathway requiring advanced literary analysis and critical writing. Prepares for ELA 30-1 diploma exam and competitive post-secondary programs.'
        }
      },
      {
        id: 'ela20-2',
        code: 'English Language Arts 20-2',
        name: 'ELA 20-2',
        credits: 5,
        description: 'Practical English skills development',
        prerequisites: ['ela10-2'], // Primary pathway from ELA 10-2
        // Note: Also accepts ELA 10-1 (students moving down from -1 stream)
        leadsTo: ['ela30-2'],
        grade: 11,
        stream: 'general',
        diplomaExam: false,
        gridPosition: { row: 1, col: 1 }, // Second row, Grade 11
        careerPathways: [
          'Applied business and administration',
          'Technical and skilled trade careers',
          'Healthcare and support services',
          'Education and training support',
          'Community and social services',
          'Media production and technical arts',
          'Customer service and retail management',
          'Public safety and emergency services',
          'Tourism and hospitality management',
          'Entrepreneurship and small business'
        ],
        universityPrograms: [
          'Applied degree programs',
          'College diploma and certificate programs',
          'Business and management programs',
          'Technical and vocational training',
          'Health sciences technology programs',
          'Creative arts and media production',
          'Adult education and continuing studies',
          'Apprenticeship preparation programs',
          'Community college transfer programs',
          'Professional development certificates'
        ],
        detailedInfo: {
          skills: [
            'Advanced practical communication skills',
            'Workplace writing and professional documentation',
            'Critical analysis applied to real-world contexts',
            'Collaborative problem-solving and teamwork',
            'Media production and presentation skills',
            'Business and professional communication',
            'Community engagement and civic participation',
            'Applied research and information literacy'
          ],
          importance: 'Develops advanced practical English skills for career and post-secondary success. Offers pathway to ELA 30-2 while building confidence in communication and critical thinking.',
          recommendedFor: 'Students planning college programs, technical careers, or applied post-secondary education. Provides strong foundation for ELA 30-2 and practical communication needs.'
        }
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
        diplomaExam: true,
        gridPosition: { row: 0, col: 2 }, // Top row, Grade 12
        careerPathways: [
          'Law and Legal Professions',
          'Academia and Research',
          'Journalism and Professional Writing',
          'Government and Public Policy',
          'Corporate Communications and PR',
          'Publishing and Editorial Services',
          'Education and Teaching',
          'Cultural and Literary Criticism',
          'International Relations and Diplomacy',
          'Professional Consulting and Analysis'
        ],
        universityPrograms: [
          'All university degree programs (required)',
          'Law school admission (required)',
          'Graduate school programs',
          'English Literature and Linguistics',
          'Philosophy and Critical Studies',
          'Political Science and International Relations',
          'Education and Teacher Training',
          'Communications and Journalism',
          'Pre-professional programs (medicine, dentistry)',
          'Honours and research-intensive programs'
        ],
        detailedInfo: {
          skills: [
            'University-level critical analysis and literary interpretation',
            'Advanced academic essay writing and research',
            'Complex textual analysis and argumentation',
            'Independent critical thinking and inquiry',
            'Sophisticated rhetorical and composition skills',
            'Advanced research methodology and citation',
            'Seminar discussion and presentation skills',
            'Cultural and historical literary analysis'
          ],
          importance: 'Provincial diploma exam course (30% of final grade) required for university admission. Develops sophisticated analytical and writing skills essential for academic success. Cannot be substituted with ELA 30-2 for university programs.',
          recommendedFor: 'Students planning university studies requiring advanced literary analysis and critical writing. Essential for competitive academic programs, law, education, and graduate school preparation.'
        }
      },
      {
        id: 'ela30-2',
        code: 'English Language Arts 30-2',
        name: 'ELA 30-2',
        credits: 5,
        description: 'English for college and career',
        prerequisites: ['ela20-2'], // Primary pathway from ELA 20-2
        // Note: Also accepts ELA 20-1 (students moving down from -1 stream)
        leadsTo: [],
        grade: 12,
        stream: 'general',
        diplomaExam: true,
        gridPosition: { row: 1, col: 2 }, // Second row, Grade 12
        careerPathways: [
          'Business and Administration Management',
          'Technical and Trade Supervision',
          'Healthcare and Human Services',
          'Education and Training Coordination',
          'Media Production and Communications',
          'Community Leadership and Development',
          'Emergency Services and Public Safety',
          'Tourism and Hospitality Management',
          'Entrepreneurship and Small Business Ownership',
          'Applied Technology and Innovation'
        ],
        universityPrograms: [
          'College diploma and degree programs',
          'Applied university degree programs',
          'Business and management programs',
          'Education and teacher assistant programs',
          'Health sciences and technology programs',
          'Creative arts and media production',
          'Adult education and continuing studies',
          'Professional development and certificates',
          'Some university programs (varies by institution)',
          'Community college transfer programs'
        ],
        detailedInfo: {
          skills: [
            'Advanced workplace communication and writing',
            'Critical thinking applied to practical contexts',
            'Professional presentation and public speaking',
            'Collaborative leadership and teamwork',
            'Applied research and information analysis',
            'Business and technical writing skills',
            'Community engagement and civic responsibility',
            'Media literacy and digital communication'
          ],
          importance: 'Provincial diploma exam course (30% of final grade) emphasizing practical communication skills. Accepted by college programs and some universities. Focuses on building confidence in verbal and written communication for career success.',
          recommendedFor: 'Students planning college programs, technical careers, or direct workforce entry. Good preparation for applied post-secondary education and careers requiring strong practical communication skills.'
        }
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
        nonStandardLeadsTo: ['social20-2'], // Can move down to -2 stream
        grade: 10,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 0, col: 0 }, // Top row (academic path), Grade 10
        careerPathways: [
          'Government and Public Administration',
          'Political Science and Policy Analysis',
          'International Relations and Diplomacy',
          'Law and Legal Studies',
          'Journalism and Political Commentary',
          'Non-Profit and Advocacy Organizations',
          'Research and Think Tanks',
          'Education and Teaching',
          'Business and Corporate Strategy',
          'Public Relations and Communications'
        ],
        universityPrograms: [
          'Political Science (recommended)',
          'International Relations and Global Studies',
          'Public Administration and Policy',
          'Law and Legal Studies',
          'History and Cultural Studies',
          'Philosophy and Ethics',
          'Economics and Development Studies',
          'Journalism and Communications',
          'Education and Teacher Training',
          'Business Administration and Management'
        ],
        detailedInfo: {
          skills: [
            'Critical analysis of globalization perspectives',
            'Research and inquiry into global issues',
            'Understanding of economic and cultural impacts',
            'Multiple perspective analysis and evaluation',
            'Historical and contemporary context analysis',
            'Citizenship skills in a globalizing world',
            'Critical thinking about global relationships',
            'Communication of complex social issues'
          ],
          importance: 'Explores multiple perspectives on globalization origins and impacts on lands, cultures, economies, human rights and quality of life. Develops academic skills for rigorous social studies analysis.',
          recommendedFor: 'Students planning university social sciences, political science, international relations, or careers requiring critical analysis of global issues and perspectives.'
        }
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
        diplomaExam: false,
        gridPosition: { row: 1, col: 0 }, // Second row (general path), Grade 10
        careerPathways: [
          'Community Development and Social Services',
          'Local Government and Municipal Services',
          'Non-Profit Organizations and Charities',
          'Human Resources and Personnel',
          'Customer Service and Public Relations',
          'Tourism and Cultural Services',
          'Healthcare and Social Support Services',
          'Education and Training Support',
          'Small Business and Entrepreneurship',
          'Media and Communications'
        ],
        universityPrograms: [
          'College diploma programs in Social Sciences',
          'Applied Social Work and Human Services',
          'Business and Management programs',
          'Tourism and Hospitality Management',
          'Community College Social Studies programs',
          'Applied Communication programs',
          'Human Resources and Personnel Management',
          'Public Administration certificates',
          'Adult education and continuing studies',
          'Some university programs (varies by institution)'
        ],
        detailedInfo: {
          skills: [
            'Understanding globalization impacts on daily life',
            'Practical analysis of global and local connections',
            'Community engagement and civic participation',
            'Problem-solving in local and global contexts',
            'Cultural awareness and diversity appreciation',
            'Basic research and information gathering',
            'Communication about social issues',
            'Collaborative work and teamwork skills'
          ],
          importance: 'Examines challenges presented by globalization to identities and cultures in Canada. Focuses on practical understanding of living in a globalizing world with adapted complexity.',
          recommendedFor: 'Students planning college programs, community-focused careers, or applied social sciences. Good foundation for understanding global-local connections in practical contexts.'
        }
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
        nonStandardLeadsTo: ['social30-2'], // Can move down to -2 stream
        grade: 11,
        stream: 'academic',
        diplomaExam: false,
        gridPosition: { row: 0, col: 1 }, // Top row, Grade 11
        careerPathways: [
          'International Relations and Foreign Service',
          'Government Policy and Public Administration',
          'Political Analysis and Research',
          'Diplomatic Corps and Embassy Work',
          'Intelligence and Security Services',
          'Non-Governmental Organizations (NGOs)',
          'International Business and Trade',
          'Journalism and Foreign Correspondence',
          'Academic Research and Teaching',
          'Legal and Constitutional Analysis'
        ],
        universityPrograms: [
          'Political Science and Government',
          'International Relations and Global Studies',
          'Public Policy and Administration',
          'Law and Constitutional Studies',
          'History and Area Studies',
          'Economics and International Development',
          'Philosophy and Political Theory',
          'Journalism and International Affairs',
          'Graduate programs in Political Science',
          'Diplomatic and Foreign Service training'
        ],
        detailedInfo: {
          skills: [
            'Advanced analysis of nationalism and internationalism',
            'Historical and contemporary political understanding',
            'Complex research and critical evaluation skills',
            'Multiple perspective analysis of national interests',
            'Understanding of foreign policy and global affairs',
            'Critical thinking about regional and international relations',
            'Advanced communication of political concepts',
            'Independent inquiry and investigation skills'
          ],
          importance: 'Examines historical and contemporary nationalism in Canada and globally. Explores origins of nationalism and influence on regional, international and global relations. Prepares for Social Studies 30-1.',
          recommendedFor: 'Students planning university political science, international relations, law, or careers requiring sophisticated analysis of nationalism, internationalism and global affairs.'
        }
      },
      {
        id: 'social20-2',
        code: 'Social Studies 20-2',
        name: 'Social Studies 20-2',
        credits: 5,
        description: 'Understandings of nationalism',
        prerequisites: ['social10-2'], // Primary pathway from Social Studies 10-2
        // Note: Also accepts Social Studies 10-1 (students moving down from -1 stream)
        leadsTo: ['social30-2'],
        grade: 11,
        stream: 'general',
        diplomaExam: false,
        gridPosition: { row: 1, col: 1 }, // Second row, Grade 11
        careerPathways: [
          'Public Administration and Civil Service',
          'Community Development and Social Planning',
          'Municipal Government and Local Politics',
          'Social Services and Human Resources',
          'Cultural and Heritage Organizations',
          'Immigration and Settlement Services',
          'Education and Training Coordination',
          'Non-Profit Management and Operations',
          'Tourism and Cultural Tourism',
          'Media and Community Communications'
        ],
        universityPrograms: [
          'Applied Social Sciences and Human Services',
          'Public Administration and Management',
          'Community Development programs',
          'Social Work and Human Services',
          'Business and Organizational Management',
          'Cultural Studies and Heritage programs',
          'Education and Adult Learning programs',
          'Applied Communication and Media',
          'College transfer programs to university',
          'Professional development certificates'
        ],
        detailedInfo: {
          skills: [
            'Practical understanding of nationalism concepts',
            'Applied analysis of national and international issues',
            'Community engagement and civic participation',
            'Problem-solving in national and global contexts',
            'Cultural and identity awareness',
            'Basic research and information synthesis',
            'Effective communication about political concepts',
            'Collaborative analysis and teamwork'
          ],
          importance: 'Provides understanding of nationalism concepts with adapted complexity. Builds foundation for Social Studies 30-2 while developing practical civic engagement skills.',
          recommendedFor: 'Students planning applied social science programs, community-focused careers, or public administration. Good preparation for Social Studies 30-2 and practical civic engagement.'
        }
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
        diplomaExam: true,
        gridPosition: { row: 0, col: 2 }, // Top row, Grade 12
        careerPathways: [
          'Law and Legal Practice',
          'Government Policy Development and Analysis',
          'Political Science Research and Academia',
          'International Relations and Diplomacy',
          'Constitutional and Human Rights Law',
          'Political Campaign Management and Strategy',
          'Think Tanks and Policy Research Institutes',
          'Journalism and Political Commentary',
          'Public Administration and Civil Service Leadership',
          'Non-Governmental Organizations (NGOs) and Advocacy'
        ],
        universityPrograms: [
          'Political Science (strongly recommended)',
          'Law and Legal Studies (required)',
          'International Relations and Global Affairs',
          'Public Policy and Administration',
          'Philosophy and Political Theory',
          'History and Constitutional Studies',
          'Economics and Political Economy',
          'Journalism and Political Communication',
          'Graduate programs in Political Science',
          'Professional programs requiring political analysis'
        ],
        detailedInfo: {
          skills: [
            'Advanced analysis of political ideologies and systems',
            'Critical evaluation of liberalism, socialism, capitalism, fascism',
            'Complex research and independent inquiry skills',
            'Understanding of political power and democratic institutions',
            'Advanced argumentation and debate skills',
            'Historical analysis of European influence since 1919',
            'Current affairs research and analysis',
            'Sophisticated political and economic reasoning'
          ],
          importance: 'Provincial diploma exam course (30% of final grade) exploring origins and complexities of ideologies. Analyzes principles of classical and modern liberalism and various political-economic systems. Strongly recommended for Political Science.',
          recommendedFor: 'Students planning university political science, law, international relations, or careers requiring sophisticated analysis of political ideologies, systems, and democratic institutions.'
        }
      },
      {
        id: 'social30-2',
        code: 'Social Studies 30-2',
        name: 'Social Studies 30-2',
        credits: 5,
        description: 'Understandings of ideologies',
        prerequisites: ['social20-2'], // Primary pathway from Social Studies 20-2
        // Note: Also accepts Social Studies 20-1 (students moving down from -1 stream)
        leadsTo: [],
        grade: 12,
        stream: 'general',
        diplomaExam: true,
        gridPosition: { row: 1, col: 2 }, // Second row, Grade 12
        careerPathways: [
          'Public Service and Government Administration',
          'Community Leadership and Development',
          'Social Services and Human Resources',
          'Local Government and Municipal Services',
          'Non-Profit Organizations and Charities',
          'Education and Training Coordination',
          'Cultural and Heritage Program Management',
          'Business and Organizational Management',
          'Media and Community Communications',
          'Tourism and Community Development'
        ],
        universityPrograms: [
          'Applied Social Sciences and Public Administration',
          'General Arts and Interdisciplinary Studies',
          'Business and Management programs',
          'Social Work and Human Services',
          'Education and Adult Learning programs',
          'Community Development and Planning',
          'Applied Communication and Media programs',
          'Cultural Studies and Heritage Management',
          'College transfer programs to university',
          'Professional development and continuing education'
        ],
        detailedInfo: {
          skills: [
            'Practical understanding of political ideologies and systems',
            'Applied analysis of democratic principles and institutions',
            'Community engagement and civic responsibility',
            'Problem-solving in political and social contexts',
            'Understanding of rights and freedoms in democracy',
            'Effective communication about political concepts',
            'Collaborative leadership and teamwork',
            'Applied research and information analysis'
          ],
          importance: 'Provincial diploma exam course (30% of final grade) focusing on practical understanding of ideologies and democratic citizenship. Covers similar content to 30-1 with adapted complexity and different teaching approaches.',
          recommendedFor: 'Students planning applied social science programs, public administration, community leadership roles, or careers requiring practical understanding of democratic systems and civic engagement.'
        }
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