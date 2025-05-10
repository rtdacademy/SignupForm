import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set } from 'firebase/database';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  generateQuestionInstance, 
  questionTemplates 
} from '../../utils/questionGenerator';

/**
 * DynamicQuestionExample component
 * 
 * This component demonstrates how to use the questionGenerator to create
 * dynamically generated questions that are secure and unique per student.
 */
const DynamicQuestionExample = ({ courseId, assessmentId }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showingExplanation, setShowingExplanation] = useState(false);

  const emailKey = currentUser?.email?.replace(/\./g, '_');

  // Load or generate question on component mount
  useEffect(() => {
    const loadOrGenerateQuestion = async () => {
      if (!courseId || !assessmentId || !emailKey) return;
      
      try {
        const db = getDatabase();
        const questionPath = `students/${emailKey}/courses/${courseId}/dynamicQuestions/${assessmentId}`;
        const questionRef = ref(db, questionPath);
        const snapshot = await get(questionRef);
        
        let questionData;
        
        if (snapshot.exists()) {
          // Question already exists for this student
          questionData = snapshot.val();
          setQuestion(questionData);
          
          // Check if already answered
          if (questionData.answered) {
            setSubmitted(true);
            setSelectedOption(questionData.selectedOptionId);
            setIsCorrect(questionData.isCorrect);
          }
        } else {
          // Generate a new question instance
          // For demonstration, we'll use the addition template
          const template = questionTemplates.addition;
          
          // Create a seed using student email and assessment id for deterministic generation
          const seed = {
            studentId: emailKey,
            assessmentId,
            timestamp: Date.now() // Optional: remove for truly deterministic questions
          };
          
          // Generate a specific instance of the question
          questionData = generateQuestionInstance(template, seed);
          
          // Save question instance to database (but not the correct answer!)
          const secureQuestionData = {
            ...questionData,
            // Store answer hash instead of actual answer for verification later
            answerHash: hashAnswer(questionData.correctAnswer.toString()),
            // Remove actual answer from client-side data
            correctAnswer: null,
            correctOptionId: null,
          };
          
          // Save to database
          await set(questionRef, secureQuestionData);
          
          // Keep the full question with answers in memory but remove sensitive data from saved state
          delete questionData.correctAnswer;
          setQuestion(questionData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading or generating question:', error);
        setLoading(false);
      }
    };
    
    loadOrGenerateQuestion();
  }, [courseId, assessmentId, emailKey]);

  // Simple hash function (for demo only - use a real crypto hash in production)
  const hashAnswer = (answer) => {
    // In production, use a real crypto hash with salt
    let hash = 0;
    for (let i = 0; i < answer.length; i++) {
      const char = answer.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

  // Handle option selection
  const handleOptionSelect = (optionId) => {
    if (submitted) return;
    setSelectedOption(optionId);
  };

  // Handle answer submission
  const handleSubmit = async () => {
    if (!selectedOption || submitted || !question) return;
    
    try {
      // For the demo, we'll verify client-side which isn't secure
      // In production, the verification would be done server-side
      const db = getDatabase();
      
      // Get the full question with correct answer from the database
      const questionPath = `courses/${courseId}/questionBanks/dynamicQuestions/${assessmentId}`;
      const questionRef = ref(db, questionPath);
      
      // In a real app, we'd verify server-side with Firebase Functions
      // For this demo, we'll fetch the correct answer from the database
      // Normally, this would be secured via Firebase security rules
      const snapshot = await get(questionRef);
      
      // Get selected option value
      const selectedValue = question.options.find(opt => opt.id === selectedOption).value;
      
      // Simple verification (for demo only)
      // In production, use a secure server-side function with the answer hash
      const correctOptionId = question.options.find(opt => 
        hashAnswer(opt.value.toString()) === question.answerHash
      )?.id;
      
      const correct = selectedOption === correctOptionId;
      
      // Update database with results
      const resultPath = `students/${emailKey}/courses/${courseId}/dynamicQuestions/${assessmentId}`;
      const resultRef = ref(db, resultPath);
      
      await set(resultRef, {
        ...question,
        answered: true,
        answeredAt: new Date().toISOString(),
        selectedOptionId: selectedOption,
        isCorrect: correct
      });
      
      setSubmitted(true);
      setIsCorrect(correct);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };
  
  // Show explanation after answering
  const handleShowExplanation = () => {
    setShowingExplanation(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-4">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return <div>Error loading question.</div>;
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Dynamic Question Example</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{question.stem}</h3>
          
          <div className="space-y-3">
            {question.options.map((option) => (
              <div 
                key={option.id}
                className={`
                  flex items-center p-4 rounded-md border cursor-pointer transition-colors
                  ${submitted && option.id === selectedOption ? (isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : ''}
                  ${option.id === selectedOption && !submitted ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                  ${!submitted ? 'hover:bg-gray-50' : ''}
                `}
                onClick={() => handleOptionSelect(option.id)}
              >
                <div className="w-6 h-6 flex items-center justify-center rounded-full border mr-3 flex-shrink-0">
                  {option.id === selectedOption && (
                    <div className={`w-4 h-4 rounded-full ${submitted ? (isCorrect ? 'bg-green-500' : 'bg-red-500') : 'bg-blue-500'}`}></div>
                  )}
                </div>
                <span>{option.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="w-full"
          >
            Submit Answer
          </Button>
        ) : (
          <div className="space-y-4">
            <div className={`p-4 rounded-md ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-medium">
                {isCorrect 
                  ? 'Correct! Well done!' 
                  : 'Incorrect. Try again next time.'}
              </p>
            </div>
            
            {!showingExplanation && (
              <Button
                variant="outline"
                onClick={handleShowExplanation}
                className="w-full"
              >
                Show Explanation
              </Button>
            )}
            
            {showingExplanation && (
              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium mb-2">Explanation</h4>
                <p>
                  This question was generated dynamically with unique parameters for you.
                  The correct answer is stored securely to prevent cheating.
                  In a full implementation, multiple questions would be generated with varying
                  difficulty levels.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DynamicQuestionExample;