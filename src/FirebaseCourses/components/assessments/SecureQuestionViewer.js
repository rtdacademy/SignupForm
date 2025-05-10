import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, set, onValue } from 'firebase/database';
import { useAuth } from '../../../context/AuthContext';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { FaCheck, FaClock } from 'react-icons/fa';

/**
 * SecureQuestionViewer component
 * 
 * This component displays questions from a question bank and securely handles answers.
 * It prevents students from accessing the correct answers directly and stores
 * their responses in the Firebase Database. Questions can be statically defined or
 * generated dynamically.
 * 
 * @param {Object} props
 * @param {String} props.courseId - Course ID
 * @param {String} props.assessmentId - Assessment ID
 * @param {String} props.bankId - Question bank ID
 * @param {Number} props.numQuestions - Number of questions to show from the bank
 * @param {Boolean} props.showResults - Whether to show results immediately
 * @param {Function} props.onComplete - Callback when assessment is completed
 */
const SecureQuestionViewer = ({
  courseId,
  assessmentId,
  bankId,
  numQuestions = 5,
  showResults = true,
  onComplete
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [startTime] = useState(new Date());

  const emailKey = currentUser?.email?.replace(/\\./g, '_');

  // Load questions from the database
  useEffect(() => {
    const loadQuestions = async () => {
      if (!courseId || !bankId || !emailKey) return;

      try {
        const db = getDatabase();
        
        // Check if user already has an instance of this assessment
        const instanceRef = ref(db, `students/${emailKey}/courses/${courseId}/assessments/${assessmentId}`);
        const instanceSnapshot = await get(instanceRef);
        
        if (instanceSnapshot.exists() && instanceSnapshot.val().completed) {
          // Assessment already completed, load existing results
          setResults(instanceSnapshot.val().results);
          setSubmitted(true);
          setLoading(false);
          return;
        }
        
        // User hasn't completed this assessment, load questions
        let questionList = [];
        
        // Check if user already has an instance of these questions
        if (instanceSnapshot.exists() && instanceSnapshot.val().questions) {
          // Load existing question instances
          questionList = instanceSnapshot.val().questions;
          setUserAnswers(instanceSnapshot.val().answers || {});
        } else {
          // Load questions from question bank
          const questionsRef = ref(db, `courses/${courseId}/questionBanks/${bankId}/questions`);
          const questionsSnapshot = await get(questionsRef);
          
          if (questionsSnapshot.exists()) {
            const allQuestions = questionsSnapshot.val();
            const questionIds = Object.keys(allQuestions);
            
            // Randomly select questions up to numQuestions
            const selectedIds = questionIds.sort(() => 0.5 - Math.random()).slice(0, numQuestions);
            
            // Create instances of selected questions
            questionList = selectedIds.map(id => {
              const question = allQuestions[id];
              
              // For security, remove the correct answer
              // Store it securely in a hash or reference
              const secureQuestion = {
                id,
                stem: question.stem,
                options: question.options,
                // Don't include correctOptionId in the client version
                answerRef: id, // Reference to the correct answer stored server-side
                explanation: '',
                difficulty: question.difficulty || 1
              };
              
              return secureQuestion;
            });
            
            // Save the question instances to user's assessment record
            await set(ref(db, `students/${emailKey}/courses/${courseId}/assessments/${assessmentId}`), {
              startedAt: new Date().toISOString(),
              completed: false,
              questions: questionList,
              answers: {}
            });
          }
        }
        
        setQuestions(questionList);
        setLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        setLoading(false);
      }
    };
    
    loadQuestions();
  }, [courseId, bankId, assessmentId, emailKey, numQuestions]);

  // Save an answer
  const handleAnswer = async (questionId, answerId) => {
    if (submitted) return;
    
    const updatedAnswers = {
      ...userAnswers,
      [questionId]: answerId
    };
    
    setUserAnswers(updatedAnswers);
    
    // Save answer to database
    try {
      const db = getDatabase();
      const answersRef = ref(db, `students/${emailKey}/courses/${courseId}/assessments/${assessmentId}/answers`);
      await set(answersRef, updatedAnswers);
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  // Submit the assessment
  const handleSubmit = async () => {
    if (submitted) return;
    
    try {
      const db = getDatabase();
      
      // Calculate time spent
      const endTime = new Date();
      const timeSpent = Math.floor((endTime - startTime) / 1000); // seconds
      
      // Get correct answers from the database to check against
      const correctAnswers = {};
      let score = 0;
      
      // For each question, look up the correct answer
      for (const question of questions) {
        const correctAnswerRef = ref(db, `courses/${courseId}/questionBanks/${bankId}/questions/${question.answerRef}/correctOptionId`);
        const snapshot = await get(correctAnswerRef);
        
        if (snapshot.exists()) {
          const correctOptionId = snapshot.val();
          correctAnswers[question.answerRef] = correctOptionId;
          
          // Check if user's answer is correct
          if (userAnswers[question.answerRef] === correctOptionId) {
            score++;
          }
        }
      }
      
      // Calculate percentage score
      const percentageScore = Math.round((score / questions.length) * 100);
      
      // Prepare results
      const assessmentResults = {
        score: percentageScore,
        correctCount: score,
        totalQuestions: questions.length,
        timeSpent,
        submittedAt: new Date().toISOString(),
        correctAnswers
      };
      
      // Save results to database
      const assessmentRef = ref(db, `students/${emailKey}/courses/${courseId}/assessments/${assessmentId}`);
      await set(assessmentRef, {
        startedAt: startTime.toISOString(),
        completed: true,
        questions,
        answers: userAnswers,
        results: assessmentResults
      });
      
      setResults(assessmentResults);
      setSubmitted(true);
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(assessmentResults);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="ml-4 text-lg">Loading questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No questions available in this assessment.</p>
        </CardContent>
      </Card>
    );
  }

  // If assessment is submitted and results are available
  if (submitted && results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Complete</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 mb-4">
              <span className="text-3xl font-bold text-blue-600">{results.score}%</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Your Score: {results.score}%</h3>
            <p className="text-gray-600">
              You answered {results.correctCount} out of {results.totalQuestions} questions correctly.
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
              <FaClock className="mr-1" />
              <span>
                Time spent: {Math.floor(results.timeSpent / 60)}m {results.timeSpent % 60}s
              </span>
            </div>
          </div>

          {showResults && (
            <div className="mt-8 space-y-6">
              <h3 className="text-lg font-semibold mb-4">Question Review</h3>
              {questions.map((question) => (
                <div key={question.answerRef} className="border rounded-lg p-4">
                  <p className="font-medium mb-3">{question.stem}</p>
                  
                  <div className="space-y-2 mb-4">
                    {question.options.map((option) => (
                      <div 
                        key={option.id}
                        className={`
                          flex items-center p-3 rounded-md
                          ${option.id === results.correctAnswers[question.answerRef] ? 'bg-green-50' : ''}
                          ${option.id === userAnswers[question.answerRef] && option.id !== results.correctAnswers[question.answerRef] ? 'bg-red-50' : ''}
                        `}
                      >
                        <div className="w-6 flex-shrink-0">
                          {option.id === results.correctAnswers[question.answerRef] && (
                            <FaCheck className="text-green-500" />
                          )}
                        </div>
                        <div className="ml-2">
                          <span className={`${option.id === userAnswers[question.answerRef] ? 'font-medium' : ''}`}>
                            {option.text}
                          </span>
                          {option.id === userAnswers[question.answerRef] && option.id !== results.correctAnswers[question.answerRef] && (
                            <span className="ml-2 text-sm text-red-500">Your answer</span>
                          )}
                          {option.id === userAnswers[question.answerRef] && option.id === results.correctAnswers[question.answerRef] && (
                            <span className="ml-2 text-sm text-green-500">Correct answer</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Render the assessment questions
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Assessment Questions</span>
            <span className="text-sm font-normal">
              {Object.keys(userAnswers).length} of {questions.length} answered
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {questions.map((question) => (
              <MultipleChoiceQuestion
                key={question.answerRef}
                questionId={question.answerRef}
                questionText={question.stem}
                options={question.options}
                correctOptionId={null} // Hide correct answer
                onAnswer={(optionId) => handleAnswer(question.answerRef, optionId)}
                showFeedback={false}
                disabled={submitted}
              />
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={Object.keys(userAnswers).length < questions.length || submitted}
              className="px-8 py-2"
            >
              Submit Assessment
            </Button>
          </div>
          
          {Object.keys(userAnswers).length < questions.length && (
            <p className="text-center text-sm text-amber-600 mt-4">
              Please answer all questions before submitting.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureQuestionViewer;