import React, { useState, useEffect } from 'react';
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';
// useProgress removed - completion tracking is now handled automatically

const CoursePrerequisitesAndRequirements = ({ courseId, itemId, activeItem }) => {
  // markCompleted removed - completion tracking is now handled automatically
  const [activeSection, setActiveSection] = useState('importance');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState({
    question1: false,
    question2: false,
    question3: false
  });
  const [questionResults, setQuestionResults] = useState({
    question1: null,
    question2: null,
    question3: null
  });

  // Interactive Math Directory State
  const [mathDirectoryStep, setMathDirectoryStep] = useState('pathway'); // 'pathway', 'goal', 'prereq', 'recommendation'
  const [selectedPathway, setSelectedPathway] = useState('');
  const [selectedGoalCourse, setSelectedGoalCourse] = useState('');
  const [prerequisiteStatus, setPrerequisiteStatus] = useState({
    course: '',
    status: '', // 'finished' or 'currently-taking'
    grade: ''
  });

  // Interactive Science Directory State
  const [scienceDirectoryStep, setScienceDirectoryStep] = useState('pathway'); // 'pathway', 'goal', 'prereq', 'recommendation'
  const [selectedSciencePathway, setSelectedSciencePathway] = useState('');
  const [selectedScienceGoalCourse, setSelectedScienceGoalCourse] = useState('');
  const [sciencePrerequisiteStatus, setSciencePrerequisiteStatus] = useState({
    course: '',
    status: '', // 'finished' or 'currently-taking'
    grade: ''
  });

  const handleQuestionComplete = (questionNumber) => {
    setQuestionsCompleted(prev => ({
      ...prev,
      [`question${questionNumber}`]: true
    }));
  };

  const allQuestionsCompleted = questionsCompleted.question1 && questionsCompleted.question2 && questionsCompleted.question3;

  // Track completion when all questions are answered
  useEffect(() => {
    if (allQuestionsCompleted) {
      const lessonItemId = itemId || activeItem?.itemId;
      if (lessonItemId) {
        markCompleted(lessonItemId);
      }
    }
  }, [allQuestionsCompleted, markCompleted, itemId, activeItem?.itemId]);

  // Math Course Data
  const mathCourseData = {
    '-1': {
      'math31': {
        name: 'Math 31',
        description: 'Calculus and vectors for advanced study',
        prerequisites: ['math30-1'],
        directPrereqs: [
          { 
            id: 'math30-1', 
            name: 'Math 30-1', 
            options: [
              { status: 'finished', thresholds: { good: 65, caution: 50, repeat: 0 } },
              { status: 'currently-taking', thresholds: { caution: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math30-1': {
        name: 'Math 30-1',
        description: 'Pre-calculus preparing for university mathematics',
        prerequisites: ['math30-2', 'math20-1'],
        directPrereqs: [
          { 
            id: 'math30-2', 
            name: 'Math 30-2', 
            options: [
              { status: 'finished', thresholds: { good: 80, caution: 50, repeat: 0 } }
            ]
          },
          { 
            id: 'math20-1', 
            name: 'Math 20-1', 
            options: [
              { status: 'finished', thresholds: { good: 65, caution: 50, repeat: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math20-1': {
        name: 'Math 20-1',
        description: 'Academic pathway leading to Math 30-1',
        prerequisites: ['math10c', 'math20-2'],
        directPrereqs: [
          { 
            id: 'math10c', 
            name: 'Math 10C', 
            options: [
              { status: 'finished', thresholds: { good: 65, caution: 50, repeat: 40 } }
            ]
          },
          { 
            id: 'math20-2', 
            name: 'Math 20-2', 
            options: [
              { status: 'finished', thresholds: { good: 80, consider302: 50, repeat: 40 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math10c': {
        name: 'Math 10C',
        description: 'Foundation mathematics for academic pathways',
        prerequisites: ['math9', 'math15'],
        directPrereqs: [
          { 
            id: 'math9', 
            name: 'Math 9', 
            options: [
              { status: 'finished', thresholds: { good: 65, caution: 40, consider103: 0 } }
            ]
          },
          { 
            id: 'math15', 
            name: 'Math 15', 
            options: [
              { status: 'finished', thresholds: { good: 65, caution: 50, repeat: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math15': {
        name: 'Math 15',
        description: 'Review of middle school skills',
        prerequisites: ['math9'],
        directPrereqs: [
          { 
            id: 'math9', 
            name: 'Math 9', 
            options: [
              { status: 'finished', thresholds: { good: 40, consider103: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      }
    },
    '-2': {
      'math30-2': {
        name: 'Math 30-2',
        description: 'Applied mathematics for various post-secondary paths',
        prerequisites: ['math20-2', 'math20-1'],
        directPrereqs: [
          { 
            id: 'math20-2', 
            name: 'Math 20-2', 
            options: [
              { status: 'finished', thresholds: { good: 65, caution: 50, repeat: 0 } }
            ]
          },
          { 
            id: 'math20-1', 
            name: 'Math 20-1', 
            options: [
              { status: 'finished', thresholds: { good: 50, take202: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math20-2': {
        name: 'Math 20-2',
        description: 'Applied pathway leading to Math 30-2',
        prerequisites: ['math10c'],
        directPrereqs: [
          { 
            id: 'math10c', 
            name: 'Math 10C', 
            options: [
              { status: 'finished', thresholds: { good: 50, repeat: 40, consider15: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math10c': {
        name: 'Math 10C',
        description: 'Foundation mathematics for applied pathways',
        prerequisites: ['math9', 'math15'],
        directPrereqs: [
          { 
            id: 'math9', 
            name: 'Math 9', 
            options: [
              { status: 'finished', thresholds: { good: 65, caution: 40, consider103: 0 } }
            ]
          },
          { 
            id: 'math15', 
            name: 'Math 15', 
            options: [
              { status: 'finished', thresholds: { good: 65, caution: 50, repeat: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math15': {
        name: 'Math 15',
        description: 'Review of middle school skills',
        prerequisites: ['math9'],
        directPrereqs: [
          { 
            id: 'math9', 
            name: 'Math 9', 
            options: [
              { status: 'finished', thresholds: { good: 40, consider103: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      }
    },
    '-3': {
      'math30-3': {
        name: 'Math 30-3',
        description: 'Workplace mathematics for immediate employment',
        prerequisites: ['math20-3', 'math20-2'],
        directPrereqs: [
          { 
            id: 'math20-3', 
            name: 'Math 20-3', 
            options: [
              { status: 'finished', thresholds: { good: 50, repeat: 0 } }
            ]
          },
          { 
            id: 'math20-2', 
            name: 'Math 20-2', 
            options: [
              { status: 'finished', thresholds: { good: 50, take203: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math20-3': {
        name: 'Math 20-3',
        description: 'Workplace pathway for practical applications',
        prerequisites: ['math10-3', 'math10c'],
        directPrereqs: [
          { 
            id: 'math10-3', 
            name: 'Math 10-3', 
            options: [
              { status: 'finished', thresholds: { good: 50, repeat: 0 } }
            ]
          },
          { 
            id: 'math10c', 
            name: 'Math 10C', 
            options: [
              { status: 'finished', thresholds: { good: 50, take103: 0 } }
            ]
          },
          { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
        ]
      },
      'math10-3': {
        name: 'Math 10-3',
        description: 'Workplace mathematics foundation',
        prerequisites: [],
        directPrereqs: [
          { id: 'none', name: 'No prerequisite required', recommendedGrade: null }
        ]
      }
    }
  };

  // Science Course Data
  const scienceCourseData = {
    'science10': {
      name: 'Science 10',
      description: 'Foundation science course for all pathways',
      prerequisites: [],
      directPrereqs: [
        { id: 'none', name: 'No prerequisite required', recommendedGrade: null }
      ]
    },
    'physics20': {
      name: 'Physics 20',
      description: 'Mechanics, waves, and thermodynamics',
      prerequisites: ['science10'],
      directPrereqs: [
        { 
          id: 'science10', 
          name: 'Science 10', 
          options: [
            { status: 'finished', thresholds: { good: 65, caution: 50, repeat: 0 } }
          ]
        },
        { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
      ]
    },
    'physics30': {
      name: 'Physics 30',
      description: 'Advanced physics including electromagnetism and modern physics',
      prerequisites: ['physics20'],
      directPrereqs: [
        { 
          id: 'physics20', 
          name: 'Physics 20', 
          options: [
            { status: 'finished', thresholds: { good: 65, caution: 50, repeat: 0 } }
          ]
        },
        { id: 'none', name: 'I haven\'t taken this prerequisite', recommendedGrade: null }
      ]
    }
  };

  const resetMathDirectory = () => {
    setMathDirectoryStep('pathway');
    setSelectedPathway('');
    setSelectedGoalCourse('');
    setPrerequisiteStatus({ course: '', status: '', grade: '' });
  };

  // Helper function to get courses in progression order
  const getCoursesInOrder = (pathway) => {
    const progressionOrder = {
      '-1': ['math15', 'math10c', 'math20-1', 'math30-1', 'math31'],
      '-2': ['math15', 'math10c', 'math20-2', 'math30-2'],
      '-3': ['math10-3', 'math20-3', 'math30-3']
    };
    
    return progressionOrder[pathway]
      .filter(courseId => mathCourseData[pathway][courseId])
      .map(courseId => ({
        id: courseId,
        ...mathCourseData[pathway][courseId]
      }));
  };

  // Science helper functions
  const resetScienceDirectory = () => {
    setScienceDirectoryStep('pathway');
    setSelectedSciencePathway('');
    setSelectedScienceGoalCourse('');
    setSciencePrerequisiteStatus({ course: '', status: '', grade: '' });
  };

  const getScienceCoursesInOrder = () => {
    const progressionOrder = ['science10', 'physics20', 'physics30'];
    return progressionOrder.map(courseId => ({
      id: courseId,
      ...scienceCourseData[courseId]
    }));
  };

  const getClickableScienceCoursesInOrder = () => {
    const clickableOrder = ['physics20', 'physics30'];
    return clickableOrder.map(courseId => ({
      id: courseId,
      ...scienceCourseData[courseId]
    }));
  };

  const handleSciencePathwaySelection = (pathway) => {
    setSelectedSciencePathway(pathway);
    setScienceDirectoryStep('goal');
  };

  const handleScienceGoalCourseSelection = (courseId) => {
    setSelectedScienceGoalCourse(courseId);
    setScienceDirectoryStep('prereq');
  };

  const handleSciencePrerequisiteSelection = (course, status, grade) => {
    setSciencePrerequisiteStatus({ course, status, grade });
    setScienceDirectoryStep('recommendation');
  };

  const handlePathwaySelection = (pathway) => {
    setSelectedPathway(pathway);
    setMathDirectoryStep('goal');
  };

  const handleGoalCourseSelection = (courseId) => {
    setSelectedGoalCourse(courseId);
    setMathDirectoryStep('prereq');
  };

  const handlePrerequisiteSelection = (course, status, grade) => {
    setPrerequisiteStatus({ course, status, grade });
    setMathDirectoryStep('recommendation');
  };

  const getRecommendation = () => {
    const goalCourse = mathCourseData[selectedPathway][selectedGoalCourse];
    const { course, status, grade } = prerequisiteStatus;
    
    // Handle Math 10-3 special case (no prerequisites)
    if (selectedGoalCourse === 'math10-3' && status === 'no-prereq') {
      return {
        status: 'ready',
        title: 'Ready to Enroll! ✅',
        message: 'Math 10-3 has no prerequisites - you can enroll immediately!',
        recommendation: 'This course is designed to provide foundational workplace math skills and is perfect for students starting fresh.',
        action: 'You can enroll with confidence',
        color: 'bg-green-50 border-green-200 text-green-800'
      };
    }
    
    // Handle missing prerequisite
    if (course === 'none') {
      return {
        status: 'missing-prereq',
        title: 'Missing Prerequisite',
        message: `You need to complete a prerequisite before taking ${goalCourse.name}.`,
        recommendation: `Choose one of the available prerequisite options and complete it before enrolling in ${goalCourse.name}.`,
        action: 'Complete prerequisite course first',
        color: 'bg-red-50 border-red-200 text-red-800'
      };
    }

    // Handle currently taking prerequisite
    if (status === 'currently-taking') {
      if (selectedGoalCourse === 'math31' && course === 'math30-1') {
        return {
          status: 'caution',
          title: 'Proceed with Caution ⚠️',
          message: 'You are currently taking Math 30-1 while wanting to enroll in Math 31.',
          recommendation: 'Some skills from Math 30-1 may not be taught before they are needed in Math 31. You may find the course challenging.',
          action: 'Proceed with caution - consider waiting until Math 30-1 is complete',
          color: 'bg-yellow-50 border-yellow-200 text-orange-800'
        };
      }
    }

    // Handle finished prerequisites with grade-based recommendations
    if (status === 'finished' && grade !== 'in-progress') {
      const userGrade = parseInt(grade.split('-')[0] || grade.replace('Below ', '').replace('%', '')) || 0;
      
      // Get specific recommendations based on course and prerequisite combination
      const recommendation = getSpecificRecommendation(selectedGoalCourse, course, userGrade, selectedPathway, grade);
      return recommendation;
    }

    // Default fallback
    return {
      status: 'unknown',
      title: 'Unable to Generate Recommendation',
      message: 'Please review your selections and try again.',
      recommendation: 'Contact academic advising for personalized guidance.',
      action: 'Review selections or contact advising',
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    };
  };

  const getSpecificRecommendation = (goalCourse, prereqCourse, userGrade, pathway, gradeRange) => {
    // Math 31 recommendations
    if (goalCourse === 'math31' && prereqCourse === 'math30-1') {
      if (userGrade >= 65) {
        return {
          status: 'ready',
          title: 'Ready to Enroll! ✅',
          message: `Great! Your Math 30-1 grade of ${gradeRange} is above the recommended 65%.`,
          recommendation: 'You have a strong foundation for Math 31 (Calculus).',
          action: 'You can enroll with confidence',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      } else if (userGrade >= 50) {
        return {
          status: 'caution',
          title: 'Proceed with Caution ⚠️',
          message: `Your Math 30-1 grade of ${gradeRange} is below the recommended 65%.`,
          recommendation: 'Math 31 is very challenging. Consider upgrading Math 30-1 or getting additional support.',
          action: 'Proceed with caution or consider upgrading',
          color: 'bg-yellow-50 border-yellow-200 text-orange-800'
        };
      } else {
        return {
          status: 'repeat',
          title: 'Consider Repeating Math 30-1 📚',
          message: `Your Math 30-1 grade of ${gradeRange} is significantly below the recommended 65%.`,
          recommendation: 'We strongly recommend repeating Math 30-1 before attempting Math 31.',
          action: 'Repeat Math 30-1 first',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      }
    }

    // Math 30-1 recommendations
    if (goalCourse === 'math30-1') {
      if (prereqCourse === 'math30-2') {
        if (userGrade >= 80) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 30-2 grade of ${gradeRange} is excellent (80%+).`,
            recommendation: 'Note that Math 30-1 is significantly more algebraically challenging than 30-2, but you should be able to handle it.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else if (userGrade >= 50) {
          return {
            status: 'caution',
            title: 'Proceed with Caution ⚠️',
            message: `Your Math 30-2 grade of ${gradeRange} meets the minimum, but Math 30-1 is much more challenging.`,
            recommendation: 'Math 30-1 requires strong algebra skills. Consider additional preparation or tutoring.',
            action: 'Proceed with caution and extra support',
            color: 'bg-yellow-50 border-yellow-200 text-orange-800'
          };
        } else {
          return {
            status: 'upgrade',
            title: 'Consider Upgrading First 📚',
            message: `Your Math 30-2 grade of ${gradeRange} is below 50%.`,
            recommendation: 'We recommend re-taking Math 30-2 or taking Math 20-1 before attempting Math 30-1.',
            action: 'Re-take Math 30-2 or take Math 20-1',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      } else if (prereqCourse === 'math20-1') {
        if (userGrade >= 65) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 20-1 grade of ${gradeRange} meets the recommended 65%.`,
            recommendation: 'You have the right foundation for Math 30-1.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else if (userGrade >= 50) {
          return {
            status: 'caution',
            title: 'Proceed with Caution ⚠️',
            message: `Your Math 20-1 grade of ${gradeRange} is below the recommended 65%.`,
            recommendation: 'Consider reviewing Math 20-1 concepts or consider taking Math 30-2 instead.',
            action: 'Proceed with caution or consider Math 30-2',
            color: 'bg-yellow-50 border-yellow-200 text-orange-800'
          };
        } else {
          return {
            status: 'repeat',
            title: 'Consider Repeating Math 20-1 📚',
            message: `Your Math 20-1 grade of ${gradeRange} is below 50%.`,
            recommendation: 'We recommend repeating Math 20-1 before attempting Math 30-1.',
            action: 'Repeat Math 20-1 first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      }
    }

    // Math 20-1 recommendations
    if (goalCourse === 'math20-1') {
      if (prereqCourse === 'math10c') {
        if (userGrade >= 65) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 10C grade of ${gradeRange} meets the recommended 65%.`,
            recommendation: 'You have a good foundation for Math 20-1.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else if (userGrade >= 50) {
          return {
            status: 'caution',
            title: 'Proceed with Caution ⚠️',
            message: `Your Math 10C grade of ${userGrade}% is below the recommended 65%.`,
            recommendation: 'Consider reviewing Math 10C concepts or consider Math 20-2 pathway instead.',
            action: 'Proceed with caution or consider Math 20-2',
            color: 'bg-yellow-50 border-yellow-200 text-orange-800'
          };
        } else if (userGrade >= 40) {
          return {
            status: 'repeat',
            title: 'Consider Repeating Math 10C 📚',
            message: `Your Math 10C grade of ${userGrade}% is below 50%.`,
            recommendation: 'We recommend repeating Math 10C before attempting Math 20-1.',
            action: 'Repeat Math 10C first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        } else {
          return {
            status: 'pathway-change',
            title: 'Consider Different Pathway 🔄',
            message: `Your Math 10C grade of ${userGrade}% is below 40%.`,
            recommendation: 'Consider Math 15 to review middle school skills or Math 10-3 pathway.',
            action: 'Consider Math 15 or Math 10-3 pathway',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      } else if (prereqCourse === 'math20-2') {
        if (userGrade >= 80) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 20-2 grade of ${gradeRange} is excellent (80%+).`,
            recommendation: 'You should be able to handle Math 20-1, though it will be more challenging.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else if (userGrade >= 50) {
          return {
            status: 'consider-alt',
            title: 'Consider Math 30-2 Instead 🤔',
            message: `Your Math 20-2 grade of ${userGrade}% suggests the -2 pathway might be better.`,
            recommendation: 'Consider Math 30-2 as your next course instead of Math 20-1.',
            action: 'Consider Math 30-2 pathway instead',
            color: 'bg-blue-50 border-blue-200 text-blue-800'
          };
        } else if (userGrade >= 40) {
          return {
            status: 'repeat',
            title: 'Consider Repeating Math 20-2 📚',
            message: `Your Math 20-2 grade of ${userGrade}% is below 50%.`,
            recommendation: 'We recommend repeating Math 20-2 before attempting Math 20-1.',
            action: 'Repeat Math 20-2 first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        } else {
          return {
            status: 'pathway-change',
            title: 'Consider -3 Pathway 🔄',
            message: `Your Math 20-2 grade of ${userGrade}% is below 40%.`,
            recommendation: 'Consider the Math -3 pathway which may be more suitable.',
            action: 'Consider Math -3 pathway',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      }
    }

    // Math 30-2 recommendations (-2 pathway)
    if (goalCourse === 'math30-2') {
      if (prereqCourse === 'math20-2') {
        if (userGrade >= 65) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 20-2 grade of ${userGrade}% meets the recommended 65%.`,
            recommendation: 'You have a good foundation for Math 30-2.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else if (userGrade >= 50) {
          return {
            status: 'caution',
            title: 'Proceed with Caution ⚠️',
            message: `Your Math 20-2 grade of ${userGrade}% is below the recommended 65%.`,
            recommendation: 'Consider reviewing Math 20-2 concepts before starting Math 30-2.',
            action: 'Proceed with caution and extra preparation',
            color: 'bg-yellow-50 border-yellow-200 text-orange-800'
          };
        } else {
          return {
            status: 'repeat',
            title: 'Consider Repeating Math 20-2 📚',
            message: `Your Math 20-2 grade of ${userGrade}% is below 50%.`,
            recommendation: 'We recommend repeating Math 20-2 before attempting Math 30-2.',
            action: 'Repeat Math 20-2 first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      } else if (prereqCourse === 'math20-1') {
        if (userGrade >= 50) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 20-1 grade of ${userGrade}% is sufficient for Math 30-2.`,
            recommendation: 'Math 20-1 provides a strong foundation for Math 30-2.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else {
          return {
            status: 'take-prereq',
            title: 'Take Math 20-2 First 📚',
            message: `Your Math 20-1 grade of ${userGrade}% is below 50%.`,
            recommendation: 'We recommend taking Math 20-2 before attempting Math 30-2.',
            action: 'Take Math 20-2 first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      }
    }

    // Math 20-2 recommendations
    if (goalCourse === 'math20-2' && prereqCourse === 'math10c') {
      if (userGrade >= 50) {
        return {
          status: 'ready',
          title: 'Ready to Enroll! ✅',
          message: `Your Math 10C grade of ${userGrade}% meets the recommended 50%.`,
          recommendation: 'You have sufficient foundation for Math 20-2.',
          action: 'You can enroll with confidence',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      } else if (userGrade >= 40) {
        return {
          status: 'repeat',
          title: 'Consider Repeating Math 10C 📚',
          message: `Your Math 10C grade of ${userGrade}% is below 50%.`,
          recommendation: 'We recommend repeating Math 10C before attempting Math 20-2.',
          action: 'Repeat Math 10C first',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      } else {
        return {
          status: 'pathway-change',
          title: 'Consider Different Options 🔄',
          message: `Your Math 10C grade of ${userGrade}% is below 40%.`,
          recommendation: 'Consider Math 15 to review middle school skills or Math 10-3 pathway.',
          action: 'Consider Math 15 or Math 10-3 pathway',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      }
    }

    // Math 10C recommendations for -1 and -2 pathways
    if (goalCourse === 'math10c' && prereqCourse === 'math9') {
      if (userGrade >= 65) {
        return {
          status: 'ready',
          title: 'Ready to Enroll! ✅',
          message: `Your Math 9 grade of ${gradeRange} meets the recommended 65%.`,
          recommendation: 'You have a good foundation for Math 10C.',
          action: 'You can enroll with confidence',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      } else if (userGrade >= 40) {
        return {
          status: 'caution',
          title: 'Proceed with Caution ⚠️',
          message: `Your Math 9 grade of ${userGrade}% is below 65%.`,
          recommendation: 'Consider Math 15 to review middle school skills before Math 10C.',
          action: 'Consider taking Math 15 first',
          color: 'bg-yellow-50 border-yellow-200 text-orange-800'
        };
      } else {
        return {
          status: 'pathway-change',
          title: 'Consider Math 10-3 Pathway 🔄',
          message: `Your Math 9 grade of ${userGrade}% is below 40%.`,
          recommendation: 'Consider Math 10-3 pathway which may be more suitable.',
          action: 'Consider Math 10-3 pathway',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      }
    }

    // Math 10C from Math 15 recommendations
    if (goalCourse === 'math10c' && prereqCourse === 'math15') {
      if (userGrade >= 65) {
        return {
          status: 'ready',
          title: 'Ready to Enroll! ✅',
          message: `Your Math 15 grade of ${gradeRange} meets the recommended 65%.`,
          recommendation: 'Math 15 has prepared you well for Math 10C.',
          action: 'You can enroll with confidence',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      } else if (userGrade >= 50) {
        return {
          status: 'caution',
          title: 'Proceed with Caution ⚠️',
          message: `Your Math 15 grade of ${userGrade}% is between 50-64%.`,
          recommendation: 'Consider reviewing Math 15 concepts before starting Math 10C, or seek additional support.',
          action: 'Proceed with caution and extra preparation',
          color: 'bg-yellow-50 border-yellow-200 text-orange-800'
        };
      } else {
        return {
          status: 'repeat',
          title: 'Consider Repeating Math 15 📚',
          message: `Your Math 15 grade of ${userGrade}% is below 50%.`,
          recommendation: 'We recommend repeating Math 15 to strengthen your foundation before attempting Math 10C.',
          action: 'Repeat Math 15 first',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      }
    }

    // Math 15 recommendations
    if (goalCourse === 'math15' && prereqCourse === 'math9') {
      if (userGrade >= 40) {
        return {
          status: 'ready',
          title: 'Ready to Enroll! ✅',
          message: `Your Math 9 grade of ${userGrade}% is sufficient for Math 15.`,
          recommendation: 'Math 15 will help you review and strengthen middle school math skills.',
          action: 'You can enroll with confidence',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      } else {
        return {
          status: 'pathway-change',
          title: 'Consider Math 10-3 🔄',
          message: `Your Math 9 grade of ${userGrade}% is below 40%.`,
          recommendation: 'Consider starting with Math 10-3 which has no prerequisites.',
          action: 'Consider Math 10-3 pathway',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      }
    }

    // Math 30-3 recommendations (-3 pathway)  
    if (goalCourse === 'math30-3') {
      if (prereqCourse === 'math20-3') {
        if (userGrade >= 50) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 20-3 grade of ${gradeRange} meets the requirement.`,
            recommendation: 'You have the foundation needed for Math 30-3.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else {
          return {
            status: 'repeat',
            title: 'Consider Repeating Math 20-3 📚',
            message: `Your Math 20-3 grade of ${userGrade}% is below 50%.`,
            recommendation: 'We recommend repeating Math 20-3 before attempting Math 30-3.',
            action: 'Repeat Math 20-3 first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      } else if (prereqCourse === 'math20-2') {
        if (userGrade >= 50) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 20-2 grade of ${userGrade}% is sufficient for Math 30-3.`,
            recommendation: 'You can transition from the -2 pathway to complete Math 30-3.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else {
          return {
            status: 'take-prereq',
            title: 'Take Math 20-3 First 📚',
            message: `Your Math 20-2 grade of ${userGrade}% is below 50%.`,
            recommendation: 'We recommend taking Math 20-3 before attempting Math 30-3.',
            action: 'Take Math 20-3 first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      }
    }

    // Math 20-3 recommendations
    if (goalCourse === 'math20-3') {
      if (prereqCourse === 'math10-3') {
        if (userGrade >= 50) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 10-3 grade of ${gradeRange} meets the requirement.`,
            recommendation: 'You have the foundation needed for Math 20-3.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else {
          return {
            status: 'repeat',
            title: 'Consider Repeating Math 10-3 📚',
            message: `Your Math 10-3 grade of ${userGrade}% is below 50%.`,
            recommendation: 'We recommend repeating Math 10-3 before attempting Math 20-3.',
            action: 'Repeat Math 10-3 first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      } else if (prereqCourse === 'math10c') {
        if (userGrade >= 50) {
          return {
            status: 'ready',
            title: 'Ready to Enroll! ✅',
            message: `Your Math 10C grade of ${userGrade}% is sufficient for Math 20-3.`,
            recommendation: 'You can transition from 10C to the workplace pathway.',
            action: 'You can enroll with confidence',
            color: 'bg-green-50 border-green-200 text-green-800'
          };
        } else {
          return {
            status: 'take-prereq',
            title: 'Take Math 10-3 First 📚',
            message: `Your Math 10C grade of ${userGrade}% is below 50%.`,
            recommendation: 'We recommend taking Math 10-3 before attempting Math 20-3.',
            action: 'Take Math 10-3 first',
            color: 'bg-red-50 border-red-200 text-red-800'
          };
        }
      }
    }

    // Math 10-3 has no prerequisites, so it should always be ready
    if (goalCourse === 'math10-3') {
      return {
        status: 'ready',
        title: 'Ready to Enroll! ✅',
        message: 'Math 10-3 has no prerequisites.',
        recommendation: 'This course is designed to provide foundational workplace math skills.',
        action: 'You can enroll with confidence',
        color: 'bg-green-50 border-green-200 text-green-800'
      };
    }

    // Default fallback for unhandled combinations
    return {
      status: 'review',
      title: 'Review Recommended',
      message: `Based on your ${prereqCourse} grade of ${gradeRange}.`,
      recommendation: 'Please contact academic advising for personalized guidance.',
      action: 'Contact academic advising',
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    };
  };

  const getScienceRecommendation = () => {
    const goalCourse = scienceCourseData[selectedScienceGoalCourse];
    const { course, status, grade } = sciencePrerequisiteStatus;
    
    // Handle Science 10 special case (no prerequisites)
    if (selectedScienceGoalCourse === 'science10') {
      return {
        status: 'ready',
        title: 'Ready to Enroll! ✅',
        message: 'Science 10 has no prerequisites - you can enroll immediately!',
        recommendation: 'This course provides the foundation for all science pathways and is required for Physics 20.',
        action: 'You can enroll with confidence',
        color: 'bg-green-50 border-green-200 text-green-800'
      };
    }
    
    // Handle missing prerequisite
    if (course === 'none') {
      return {
        status: 'missing-prereq',
        title: 'Missing Prerequisite',
        message: `You need to complete a prerequisite before taking ${goalCourse.name}.`,
        recommendation: `Choose one of the available prerequisite options and complete it before enrolling in ${goalCourse.name}.`,
        action: 'Complete prerequisite course first',
        color: 'bg-red-50 border-red-200 text-red-800'
      };
    }

    // Handle currently taking prerequisite
    if (status === 'currently-taking') {
      return {
        status: 'caution',
        title: 'Proceed with Caution ⚠️',
        message: `You are currently taking ${course.toUpperCase()} while wanting to enroll in ${goalCourse.name}.`,
        recommendation: `Some concepts from ${course.toUpperCase()} may not be taught before they are needed in ${goalCourse.name}. You may find the course challenging.`,
        action: 'Proceed with caution - consider waiting until prerequisite is complete',
        color: 'bg-yellow-50 border-yellow-200 text-orange-800'
      };
    }

    // Handle finished prerequisites with grade-based recommendations
    if (status === 'finished' && grade !== 'in-progress') {
      const userGrade = parseInt(grade.split('-')[0] || grade.replace('Below ', '').replace('%', '')) || 0;
      
      // Get specific recommendations based on course and prerequisite combination
      const recommendation = getScienceSpecificRecommendation(selectedScienceGoalCourse, course, userGrade, grade);
      return recommendation;
    }

    // Default fallback
    return {
      status: 'unknown',
      title: 'Unable to Generate Recommendation',
      message: 'Please review your selections and try again.',
      recommendation: 'Contact academic advising for personalized guidance.',
      action: 'Review selections or contact advising',
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    };
  };

  const getScienceSpecificRecommendation = (goalCourse, prereqCourse, userGrade, gradeRange) => {
    // Physics 20 recommendations
    if (goalCourse === 'physics20' && prereqCourse === 'science10') {
      if (userGrade >= 65) {
        return {
          status: 'ready',
          title: 'Ready to Enroll! ✅',
          message: `Great! Your Science 10 grade of ${gradeRange} meets the recommended 65%.`,
          recommendation: 'You have a strong foundation for Physics 20.',
          action: 'You can enroll with confidence',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      } else if (userGrade >= 50) {
        return {
          status: 'caution',
          title: 'Proceed with Caution ⚠️',
          message: `Your Science 10 grade of ${gradeRange} is between 50-64%.`,
          recommendation: 'Physics 20 requires strong science foundations. Consider additional preparation or consider Science 20 instead.',
          action: 'Proceed with caution or consider Science 20',
          color: 'bg-yellow-50 border-yellow-200 text-orange-800'
        };
      } else {
        return {
          status: 'repeat',
          title: 'Consider Repeating Science 10 📚',
          message: `Your Science 10 grade of ${gradeRange} is below 50%.`,
          recommendation: 'We recommend repeating Science 10 to build a stronger foundation before attempting Physics 20.',
          action: 'Repeat Science 10 first',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      }
    }

    // Physics 30 recommendations
    if (goalCourse === 'physics30' && prereqCourse === 'physics20') {
      if (userGrade >= 65) {
        return {
          status: 'ready',
          title: 'Ready to Enroll! ✅',
          message: `Great! Your Physics 20 grade of ${gradeRange} meets the recommended 65%.`,
          recommendation: 'You have a strong foundation for Physics 30.',
          action: 'You can enroll with confidence',
          color: 'bg-green-50 border-green-200 text-green-800'
        };
      } else if (userGrade >= 50) {
        return {
          status: 'caution',
          title: 'Proceed with Caution ⚠️',
          message: `Your Physics 20 grade of ${gradeRange} is between 50-64%.`,
          recommendation: 'Physics 30 is very challenging. Consider additional preparation or consider Science 30 instead.',
          action: 'Proceed with caution or consider Science 30',
          color: 'bg-yellow-50 border-yellow-200 text-orange-800'
        };
      } else {
        return {
          status: 'repeat',
          title: 'Consider Repeating Physics 20 📚',
          message: `Your Physics 20 grade of ${gradeRange} is below 50%.`,
          recommendation: 'We recommend repeating Physics 20 before attempting Physics 30 or taking Science 20 instead.',
          action: 'Repeat Physics 20 or take Science 20',
          color: 'bg-red-50 border-red-200 text-red-800'
        };
      }
    }

    // Default fallback for unhandled combinations
    return {
      status: 'review',
      title: 'Review Recommended',
      message: `Based on your ${prereqCourse} grade of ${gradeRange}.`,
      recommendation: 'Please contact academic advising for personalized guidance.',
      action: 'Contact academic advising',
      color: 'bg-gray-50 border-gray-200 text-gray-800'
    };
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Course Prerequisites & Academic Requirements</h1>
        <p className="text-xl mb-6">Understand the importance of prerequisites and navigate Alberta Education's course pathways</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Learn why prerequisites matter for academic success, explore Alberta's 
            math and science course pathways, and understand what to do if you're missing required background knowledge.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'importance', label: 'Why Prerequisites Matter' },
            { id: 'math-flowchart', label: 'Math Course Pathways' },
            { id: 'science-flowchart', label: 'Science Course Pathways' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Why Prerequisites Matter Section */}
      {activeSection === 'importance' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎯 Why Course Prerequisites Matter</h2>
            <p className="text-gray-600 mb-6">
              Prerequisites ensure you have the foundational knowledge and skills needed to succeed in your next course. 
              They're not arbitrary barriers—they're your pathway to academic success.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📚 Building Strong Academic Foundations</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">✅ Benefits of Meeting Prerequisites</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Confidence:</strong> You'll understand concepts and feel prepared</li>
                    <li>• <strong>Better Grades:</strong> Strong foundation leads to better performance</li>
                    <li>• <strong>Reduced Stress:</strong> Less struggle with basic concepts</li>
                    <li>• <strong>Faster Progress:</strong> More time for new learning, not catching up</li>
                    <li>• <strong>Enjoyment:</strong> Learning is more enjoyable when you're prepared</li>
                  </ul>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">🎯 Recommended Grades Matter</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    While you might technically be able to enroll with a lower grade, recommended minimums exist for good reasons:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• <strong>Demonstrate concept mastery:</strong> Higher grades show you understand core concepts thoroughly</li>
                    <li>• <strong>Ensure student safety:</strong> Some courses require solid understanding for lab work and procedures</li>
                    <li>• <strong>Build strong foundations:</strong> Better preparation leads to success in advanced courses</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">⚠️ Risks of Missing Prerequisites</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• <strong>Academic Struggle:</strong> Constantly playing catch-up</li>
                    <li>• <strong>Lower Grades:</strong> Gaps in knowledge affect performance</li>
                    <li>• <strong>Increased Stress:</strong> Overwhelming workload and confusion</li>
                    <li>• <strong>Time Loss:</strong> May need to repeat the course</li>
                    <li>• <strong>Confidence Issues:</strong> Feeling lost and discouraged</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">🤔 What If You Don't Meet Prerequisites?</h4>
                  <div className="text-sm text-gray-700 space-y-3">
                    <div>
                      <p className="font-medium mb-1">Option 1: Upgrade First</p>
                      <p>Take the prerequisite course or improve your grade before proceeding.</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Option 2: Alternative Pathway</p>
                      <p>Consider a different course sequence that better matches your preparation.</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Note for adult students who have paid tuition</p>
                      <p>You can take any of the high school courses, even if you are missing the prerequisite.  However, please be aware that you may need to spend additional time reviewing to be successful. If you are unsure which course to take, you may email academic advising for a placement test.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-purple-800">💡 RTD Academy's Recommendation</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Before Enrolling, Ask Yourself:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Do I understand the prerequisite material?</li>
                  <li>• Did I achieve the recommended grade or higher?</li>
                  <li>• Am I prepared to commit extra study time if needed?</li>
                  <li>• Do I have access to academic support resources?</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">RTD Academy Support:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Academic advisors to discuss your pathway</li>
                  <li>• Tutoring and additional support resources</li>
                  <li>• Flexible pacing to accommodate different backgrounds</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Math Course Directory */}
      {activeSection === 'math-flowchart' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🎯 Interactive Math Course Directory</h2>
            <p className="text-gray-600 mb-6">
              Get personalized recommendations for your math pathway. Answer a few questions to see if you're ready for your goal course.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            {/* Step 1: Pathway Selection */}
            {mathDirectoryStep === 'pathway' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-800">🎯 Step 1: Which math pathway are you interested in?</h3>
                <p className="text-sm text-gray-700 mb-6">Alberta Education offers three math pathways. Choose the one that aligns with your goals:</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handlePathwaySelection('-1')}
                    className="bg-white border-2 border-blue-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="font-bold text-blue-800 mb-2">Academic</div>
                    <div className="text-sm text-gray-600 mb-2">Math -1 pathway for university programs requiring calculus</div>
                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Engineering, Math, Physics, Computer Science</div>
                  </button>
                  
                  <button
                    onClick={() => handlePathwaySelection('-2')}
                    className="bg-white border-2 border-green-300 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="font-bold text-green-800 mb-2">Applied</div>
                    <div className="text-sm text-gray-600 mb-2">Math -2 pathway for university programs not requiring calculus</div>
                    <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Nursing, Business, Education, Social Sciences</div>
                  </button>
                  
                  <button
                    onClick={() => handlePathwaySelection('-3')}
                    className="bg-white border-2 border-orange-300 rounded-lg p-4 hover:border-orange-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="font-bold text-orange-800 mb-2">Workplace</div>
                    <div className="text-sm text-gray-600 mb-2">Math -3 pathway for trades school or direct workforce entry</div>
                    <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Skilled Trades, Construction, Service Industries</div>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Goal Course Selection */}
            {mathDirectoryStep === 'goal' && selectedPathway && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-800">📚 Step 2: What math course is your goal?</h3>
                <p className="text-sm text-gray-700 mb-6">Select the math course you want to take from the {selectedPathway === '-1' ? 'Academic' : selectedPathway === '-2' ? 'Applied' : 'Workplace'} pathway. Courses are shown in progression order:</p>
                
                {/* Course Progression Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">📈 Course Progression Path</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {getCoursesInOrder(selectedPathway).map((course, index) => (
                      <div key={course.id} className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                          {course.name}
                        </span>
                        {index < getCoursesInOrder(selectedPathway).length - 1 && (
                          <span className="mx-2 text-gray-400">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Course Selection Grid */}
                <div className="space-y-3">
                  {getCoursesInOrder(selectedPathway).map((course, index) => (
                    <button
                      key={course.id}
                      onClick={() => handleGoalCourseSelection(course.id)}
                      className="w-full bg-white border-2 border-blue-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-bold text-blue-800">{course.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{course.description}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setMathDirectoryStep('pathway')}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                >
                  ← Back to pathway selection
                </button>
              </div>
            )}

            {/* Step 3: Prerequisite Status */}
            {mathDirectoryStep === 'prereq' && selectedGoalCourse && selectedPathway && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-800">
                  📋 Step 3: Prerequisite for {mathCourseData[selectedPathway][selectedGoalCourse].name}
                </h3>
                
                {/* Special handling for Math 10-3 (no prerequisites) */}
                {selectedGoalCourse === 'math10-3' ? (
                  <div>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 rounded-full p-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-green-800">No Prerequisites Required! ✅</h4>
                      </div>
                      <p className="text-green-700 mb-4">
                        <strong>Math 10-3</strong> has no prerequisites. Any student can enroll in this course regardless of their previous math background.
                      </p>
                      <p className="text-green-600 text-sm">
                        This course is designed to provide foundational workplace math skills and is perfect for students who want to start fresh or build confidence in mathematics.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handlePrerequisiteSelection('none', 'no-prereq', 'ready')}
                      className="w-full bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition-all font-semibold text-lg"
                    >
                      ✅ Continue - I'm Ready to Enroll in Math 10-3
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-base text-gray-700 mb-6">
                      {mathCourseData[selectedPathway][selectedGoalCourse].name} has multiple prerequisite options. 
                      Select the one that applies to your situation:
                    </p>

                    <div className="space-y-6">
                      {mathCourseData[selectedPathway][selectedGoalCourse].directPrereqs.map((prereq) => (
                        <div key={prereq.id}>
                          {prereq.id === 'none' ? (
                            <button
                              onClick={() => handlePrerequisiteSelection(prereq.id, '', '')}
                              className="w-full bg-white border-2 border-red-300 rounded-lg p-4 hover:border-red-500 transition-all text-left"
                            >
                              <div className="font-semibold text-red-800">{prereq.name}</div>
                            </button>
                          ) : (
                        <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                          <div className="font-semibold mb-4 text-gray-800">{prereq.name}</div>
                          
                          {/* Status Options */}
                          {prereq.options && prereq.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="mb-4 p-3 bg-gray-50 rounded-lg">
                              <div className="font-medium mb-2 text-gray-700">
                                {option.status === 'finished' ? '✅ I have completed this course' : '⏳ I am currently taking this course'}
                              </div>
                              
                              {option.status === 'finished' && (
                                <div>
                                  <div className="text-sm text-gray-600 mb-3">Select your final grade:</div>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {['90-100%', '80-89%', '70-79%', '65-69%', '60-64%', '50-59%', '40-49%', 'Below 40%'].map((gradeRange) => (
                                      <button
                                        key={gradeRange}
                                        onClick={() => handlePrerequisiteSelection(prereq.id, option.status, gradeRange)}
                                        className="bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded px-3 py-2 text-sm transition-all"
                                      >
                                        {gradeRange}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {option.status === 'currently-taking' && (
                                <button
                                  onClick={() => handlePrerequisiteSelection(prereq.id, option.status, 'in-progress')}
                                  className="bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded px-4 py-2 text-sm transition-all"
                                >
                                  Select this option
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                    </div>

                    <button
                      onClick={() => setMathDirectoryStep('goal')}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      ← Back to course selection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Recommendation */}
            {mathDirectoryStep === 'recommendation' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-800">🎯 Your Personalized Recommendation</h3>
                
                {(() => {
                  const recommendation = getRecommendation();
                  return (
                    <div className={`rounded-lg border-2 p-6 ${recommendation.color}`}>
                      <h4 className="text-xl font-bold mb-3">{recommendation.title}</h4>
                      <p className="mb-4">{recommendation.message}</p>
                      <p className="mb-4">{recommendation.recommendation}</p>
                      
                      <div className="bg-white/50 rounded-lg p-3 mb-4">
                        <p className="font-semibold">Next Action: {recommendation.action}</p>
                      </div>

                      {recommendation.status === 'recommend-upgrade' && (
                        <div className="bg-white/70 rounded-lg p-3 text-sm">
                          <p className="font-semibold">💬 Need Help?</p>
                          <p>Contact RTD Academy's academic advisors to discuss upgrading options and create a personalized pathway plan.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="mt-6">
                  <button
                    onClick={resetMathDirectory}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold"
                  >
                    ← Try Different Course
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Math Pathway Career Opportunities */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">🎯 Math Pathway Career Opportunities</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Math -1 Pathway (Academic)</h4>
                <p className="text-sm text-gray-700 mb-2">University programs requiring advanced math (calculus)</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Engineering (all fields)</li>
                  <li>• Mathematics and statistics</li>
                  <li>• Physics and astronomy</li>
                  <li>• Computer science</li>
                  <li>• Economics and finance</li>
                  <li>• Architecture</li>
                  <li>• Medicine</li>
                  <li>• Actuarial science</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Math -2 Pathway (Applied)</h4>
                <p className="text-sm text-gray-700 mb-2">University programs not requiring calculus</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Nursing and health sciences</li>
                  <li>• Biology and life sciences</li>
                  <li>• Psychology and social sciences</li>
                  <li>• Business administration</li>
                  <li>• Education and teaching</li>
                  <li>• Liberal arts and humanities</li>
                  <li>• Communications and media</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-2">Math -3 Pathway (Workplace)</h4>
                <p className="text-sm text-gray-700 mb-2">Trades school or direct workforce entry</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Skilled trades (carpentry, plumbing, electrical)</li>
                  <li>• Heavy equipment operation</li>
                  <li>• Automotive and mechanics</li>
                  <li>• Culinary arts and food service</li>
                  <li>• Personal care and cosmetology</li>
                  <li>• Retail and customer service</li>
                  <li>• Construction and manufacturing</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center italic">
              Note: Students can transition between pathways with appropriate upgrading. Use the interactive directory above for personalized pathway recommendations.
            </p>
            <p className="mt-2 text-xs text-gray-600 text-center font-medium bg-yellow-50 border border-yellow-200 rounded p-3">
              <strong>Important Disclaimer:</strong> Students must contact their desired post-secondary institution to ensure the math course they are taking meets the specific admission requirements for their chosen program.
            </p>
          </div>
        </section>
      )}

      {/* Science Course Pathways Section */}
      {activeSection === 'science-flowchart' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🔬 Interactive Science Course Directory</h2>
            <p className="text-gray-600 mb-6">
              Get personalized recommendations for your science pathway. Focus on Physics courses which have specific prerequisites and mathematical requirements.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6">
            {/* Interactive Science Course Directory */}
            {scienceDirectoryStep === 'pathway' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-800">🎯 Step 1: Choose Your Science Pathway</h3>
                <p className="text-base text-gray-700 mb-6">
                  Select your desired science pathway. Currently, we have the Physics pathway available, which focuses on mechanics, waves, electricity, and modern physics.
                </p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => handleSciencePathwaySelection('physics')}
                    className="w-full bg-white border-2 border-green-300 rounded-lg p-6 hover:border-green-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-100 text-green-800 rounded-full w-12 h-12 flex items-center justify-center text-xl">
                            🔬
                          </div>
                          <div>
                            <div className="font-bold text-green-800 text-lg">Physics Path</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Science 10 → Physics 20 → Physics 30
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Focus on mechanics, waves, electricity, magnetism, and modern physics
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-blue-500">
                      <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm text-blue-700">
                      <strong>Coming Soon:</strong> Additional science pathways including Chemistry and Biology will be available in future updates.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {scienceDirectoryStep === 'goal' && selectedSciencePathway && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-800">📚 Step 2: What science course is your goal?</h3>
                <p className="text-base text-gray-700 mb-6">Select the science course you want to take. Courses are shown in progression order:</p>
                
                {/* Course Progression Display */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">📈 Physics Course Progression Path</h4>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {getScienceCoursesInOrder().map((course, index) => (
                      <div key={course.id} className="flex items-center">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                          {course.name}
                        </span>
                        {index < getScienceCoursesInOrder().length - 1 && (
                          <span className="mx-2 text-gray-400">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Course Selection Grid */}
                <div className="space-y-3">
                  {getClickableScienceCoursesInOrder().map((course, index) => (
                    <button
                      key={course.id}
                      onClick={() => handleScienceGoalCourseSelection(course.id)}
                      className="w-full bg-white border-2 border-green-300 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                              {index + 2}
                            </div>
                            <div>
                              <div className="font-bold text-green-800">{course.name}</div>
                              <div className="text-sm text-gray-600 mt-1">{course.description}</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-green-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Prerequisite Status */}
            {scienceDirectoryStep === 'prereq' && selectedScienceGoalCourse && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-800">
                  📋 Step 3: Prerequisite for {scienceCourseData[selectedScienceGoalCourse].name}
                </h3>
                
                {/* Special handling for Science 10 (no prerequisites) */}
                {selectedScienceGoalCourse === 'science10' ? (
                  <div>
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 rounded-full p-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-green-800">No Prerequisites Required! ✅</h4>
                      </div>
                      <p className="text-green-700 mb-4">
                        <strong>Science 10</strong> has no prerequisites. Any student can enroll in this course.
                      </p>
                      <p className="text-green-600 text-sm">
                        This course provides the foundation for all science pathways and is required for specialized Grade 11 sciences.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleSciencePrerequisiteSelection('none', 'no-prereq', 'ready')}
                      className="w-full bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition-all font-semibold text-lg"
                    >
                      ✅ Continue - I'm Ready to Enroll in Science 10
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-base text-gray-700 mb-6">
                      {scienceCourseData[selectedScienceGoalCourse].name} has prerequisite options. 
                      Select the one that applies to your situation:
                    </p>

                    <div className="space-y-6">
                      {scienceCourseData[selectedScienceGoalCourse].directPrereqs.map((prereq) => (
                        <div key={prereq.id}>
                          {prereq.id === 'none' ? (
                            <button
                              onClick={() => handleSciencePrerequisiteSelection(prereq.id, '', '')}
                              className="w-full bg-white border-2 border-red-300 rounded-lg p-4 hover:border-red-500 transition-all text-left"
                            >
                              <div className="font-semibold text-red-800">{prereq.name}</div>
                            </button>
                          ) : (
                            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                              <div className="font-semibold mb-4 text-gray-800">{prereq.name}</div>
                              
                              {/* Status Options */}
                              {prereq.options && prereq.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="mb-4 p-3 bg-gray-50 rounded-lg">
                                  <div className="font-medium mb-2 text-gray-700">
                                    {option.status === 'finished' ? '✅ I have completed this course' : '⏳ I am currently taking this course'}
                                  </div>
                                  
                                  {option.status === 'finished' && (
                                    <div>
                                      <div className="text-sm text-gray-600 mb-3">Select your final grade:</div>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {['90-100%', '80-89%', '70-79%', '65-69%', '60-64%', '50-59%', '40-49%', 'Below 40%'].map((gradeRange) => (
                                          <button
                                            key={gradeRange}
                                            onClick={() => handleSciencePrerequisiteSelection(prereq.id, option.status, gradeRange)}
                                            className="bg-green-100 hover:bg-green-200 border border-green-300 rounded px-3 py-2 text-sm transition-all"
                                          >
                                            {gradeRange}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {option.status === 'currently-taking' && (
                                    <button
                                      onClick={() => handleSciencePrerequisiteSelection(prereq.id, option.status, 'in-progress')}
                                      className="bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded px-4 py-2 text-sm transition-all"
                                    >
                                      Select this option
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setScienceDirectoryStep('goal')}
                      className="mt-4 text-green-600 hover:text-green-800 text-sm"
                    >
                      ← Back to course selection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Recommendation */}
            {scienceDirectoryStep === 'recommendation' && (
              <div>
                <h3 className="text-xl font-semibold mb-4 text-green-800">🎯 Step 4: Your Personalized Recommendation</h3>
                
                {(() => {
                  const recommendation = getScienceRecommendation();
                  return (
                    <div className={`rounded-lg border-2 p-6 ${recommendation.color}`}>
                      <h4 className="text-xl font-bold mb-3">{recommendation.title}</h4>
                      <p className="mb-4">{recommendation.message}</p>
                      <p className="mb-4">{recommendation.recommendation}</p>
                      
                      <div className="bg-white/50 rounded-lg p-3 mb-4">
                        <p className="font-semibold">Next Action: {recommendation.action}</p>
                      </div>

                      {recommendation.status === 'repeat' && (
                        <div className="bg-white/70 rounded-lg p-3 text-sm">
                          <p className="font-semibold">💬 Need Help?</p>
                          <p>Contact RTD Academy's academic advisors to discuss upgrading options and create a personalized pathway plan.</p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="mt-6">
                  <button
                    onClick={resetScienceDirectory}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all font-semibold"
                  >
                    ← Try Different Course
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Assessment Section */}
      {activeSection === 'assessment' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check: Prerequisites & Academic Planning</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of course prerequisites and academic pathway planning with these scenario-based questions.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
              {/* Question Progress Indicator */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentQuestionIndex
                          ? 'bg-indigo-600 scale-125'
                          : questionResults[`question${index + 1}`] === 'correct'
                          ? 'bg-green-500'
                          : questionResults[`question${index + 1}`] === 'incorrect'
                          ? 'bg-red-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to question ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Question Display */}
              <div className="relative">
                {currentQuestionIndex === 0 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_05_course_prerequisites_question1"
                    title="Scenario: Missing Math Prerequisites"
                    theme="indigo"
                    onAttempt={(isCorrect) => {
                      handleQuestionComplete(1);
                      setQuestionResults(prev => ({...prev, question1: isCorrect ? 'correct' : 'incorrect'}));
                    }}
                  />
                )}
                
                {currentQuestionIndex === 1 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_05_course_prerequisites_question2"
                    title="Scenario: Physics Prerequisites Decision"
                    theme="indigo"
                    onAttempt={(isCorrect) => {
                      handleQuestionComplete(2);
                      setQuestionResults(prev => ({...prev, question2: isCorrect ? 'correct' : 'incorrect'}));
                    }}
                  />
                )}
                
                {currentQuestionIndex === 2 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_05_course_prerequisites_question3"
                    title="Scenario: Academic Pathway Planning"
                    theme="indigo"
                    onAttempt={(isCorrect) => {
                      handleQuestionComplete(3);
                      setQuestionResults(prev => ({...prev, question3: isCorrect ? 'correct' : 'incorrect'}));
                    }}
                  />
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentQuestionIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of 3
                </div>

                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(2, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === 2}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentQuestionIndex === 2
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
          </div>
        </section>
      )}

      {/* Summary Section - Only show when all questions are completed */}
      {allQuestionsCompleted && (
        <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">🎉 Prerequisites Mastery Complete!</h2>
          
          <div className="text-center mb-6">
            <p className="text-lg mb-4">
              You now understand the importance of course prerequisites and can navigate Alberta's educational pathways confidently.
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
              <p className="text-base">
                Use this knowledge to make informed academic decisions and set yourself up for success in your chosen courses.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">What You've Mastered:</h3>
              <ul className="space-y-2 text-purple-100">
                <li>✅ Why prerequisites matter for academic success</li>
                <li>✅ Alberta's mathematics course pathways and requirements</li>
                <li>✅ Science course sequences and critical physics prerequisites</li>
                <li>✅ How to handle missing prerequisites effectively</li>
                <li>✅ Making informed decisions about course readiness</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Your Action Items:</h3>
              <div className="space-y-2 text-purple-100">
                <p>1. 📊 Review your transcript for prerequisite courses</p>
                <p>2. 🎯 Identify any gaps in your preparation</p>
                <p>3. 📞 Contact academic advisors for pathway planning</p>
                <p>4. 📚 Consider upgrading courses if needed</p>
                <p>5. 🗓️ Plan your course sequence strategically</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default CoursePrerequisitesAndRequirements;