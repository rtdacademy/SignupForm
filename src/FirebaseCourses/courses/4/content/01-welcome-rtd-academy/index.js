import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const WelcometoRTDAcademy = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [interactiveAnswers, setInteractiveAnswers] = useState({});
  
  // Drag and Drop Assessment State
  const [draggedItem, setDraggedItem] = useState(null);
  const [matches, setMatches] = useState({});
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleInteractiveAnswer = (questionId, answer) => {
    setInteractiveAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Drag and Drop Assessment Data
  const assessmentTerms = [
    { id: 'asynchronous', term: 'Asynchronous Learning' },
    { id: 'lms', term: 'LMS' },
    { id: 'yourway', term: 'YourWay Portal' },
    { id: 'rolling', term: 'Rolling Enrollment' },
    { id: 'pasi', term: 'PASI' },
    { id: 'proctoring', term: 'Exam Proctoring' },
    { id: 'digital_citizenship', term: 'Digital Citizenship' },
    { id: 'academic_integrity', term: 'Academic Integrity' }
  ];

  const assessmentDefinitions = [
    { 
      id: 'asynchronous', 
      definition: 'Learning that doesn\'t require students to be online at the same time as instructors',
      dropZone: 'zone1'
    },
    { 
      id: 'lms', 
      definition: 'Learning Management System - your digital classroom for accessing content and submitting work',
      dropZone: 'zone2'
    },
    { 
      id: 'yourway', 
      definition: 'Personal academic dashboard for schedules, registration, and RTD Academy services',
      dropZone: 'zone3'
    },
    { 
      id: 'rolling', 
      definition: 'Continuous enrollment throughout the year, not limited to semester start dates',
      dropZone: 'zone4'
    },
    { 
      id: 'pasi', 
      definition: 'Provincial Approach to Student Information - Alberta\'s student record system',
      dropZone: 'zone5'
    },
    { 
      id: 'proctoring', 
      definition: 'Supervised exam monitoring using webcam and secondary device for security',
      dropZone: 'zone6'
    },
    { 
      id: 'digital_citizenship', 
      definition: 'Using technology safely, respectfully, and responsibly in online learning environments',
      dropZone: 'zone7'
    },
    { 
      id: 'academic_integrity', 
      definition: 'Honest and ethical behavior in all coursework and assessments',
      dropZone: 'zone8'
    }
  ];

  // Drag and Drop Functions
  const handleDragStart = (e, term) => {
    setDraggedItem(term);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, definition) => {
    e.preventDefault();
    if (draggedItem) {
      setMatches(prev => ({
        ...prev,
        [definition.id]: draggedItem
      }));
      setDraggedItem(null);
    }
  };

  const checkAssessment = () => {
    let correctCount = 0;
    assessmentDefinitions.forEach(def => {
      if (matches[def.id] && matches[def.id].id === def.id) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setAssessmentCompleted(true);
  };

  const resetAssessment = () => {
    setMatches({});
    setAssessmentCompleted(false);
    setScore(0);
    setDraggedItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to RTD Math Academy</h1>
        <p className="text-xl mb-6">Your gateway to flexible, high-quality online education in Math, Physics, and STEM</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objective:</strong> Understand what RTD Math Academy is, how asynchronous learning works, 
            and what tools and expectations will guide your success.
          </p>
        </div>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
    </div>
  );
};

export default WelcometoRTDAcademy;