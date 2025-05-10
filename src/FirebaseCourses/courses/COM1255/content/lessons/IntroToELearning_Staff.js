import React, { useState, useEffect } from 'react';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import MultipleChoiceQuestion from '../../../../components/assessments/MultipleChoiceQuestion';
import DynamicQuestionExample from '../../../../components/assessments/DynamicQuestionExample';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent } from '../../../../../components/ui/card';
import { Label } from '../../../../../components/ui/label';
import { getDatabase, ref, set, get } from 'firebase/database';
import { FaSave, FaCog, FaDatabase, FaThumbsUp } from 'react-icons/fa';

/**
 * Staff view of the "What is E-Learning?" lesson
 * Contains the same content as the student view but with additional admin controls
 */
const IntroToELearningStaff = ({ courseId = '1', devMode = true }) => {
  // Define questions here directly in the component (identical to student view)
  // When updating questions, make sure to update both files
  const questions = [
    {
      id: "q1",
      text: "Which of the following is NOT typically considered a benefit of E-Learning?",
      options: [
        { id: "a", text: "Learning at your own pace" },
        { id: "b", text: "Access to educational resources from anywhere" },
        { id: "c", text: "Reduced need for self-discipline" },
        { id: "d", text: "Immediate feedback on assessments" }
      ],
      correctOptionId: "c",
      explanation: "E-Learning actually requires more self-discipline than traditional classroom learning since students must manage their own time and learning schedule without direct supervision."
    },
    {
      id: "q2", 
      text: "E-Learning has transformed education by providing:",
      options: [
        { id: "a", text: "Only video-based content" },
        { id: "b", text: "Flexibility, accessibility, and personalization" },
        { id: "c", text: "Lower quality educational materials" },
        { id: "d", text: "Less effective assessment methods" }
      ],
      correctOptionId: "b",
      explanation: "E-Learning provides flexibility in when and where learning occurs, accessibility to a wide range of resources, and personalization of the learning experience."
    }
  ];

  // Staff admin functionality
  const [dynamicBankExists, setDynamicBankExists] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if dynamic question bank exists
  useEffect(() => {
    const checkDynamicBank = async () => {
      try {
        const db = getDatabase();
        const bankRef = ref(db, `courses/${courseId}/questionBanks/dynamic_questions`);
        const snapshot = await get(bankRef);
        setDynamicBankExists(snapshot.exists());
      } catch (error) {
        console.error("Error checking dynamic bank:", error);
      }
    };
    
    checkDynamicBank();
  }, [courseId]);

  // Save questions to database
  const handleSaveQuestions = async () => {
    try {
      const db = getDatabase();
      const bankRef = ref(db, `courses/${courseId}/questionBanks/intro_questions`);
      
      // First ensure the question bank exists
      await set(bankRef, {
        name: 'Introduction Questions',
        type: 'standard',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      });
      
      // Then save each question
      for (const question of questions) {
        const questionRef = ref(db, `courses/${courseId}/questionBanks/intro_questions/questions/${question.id}`);
        await set(questionRef, {
          stem: question.text,
          options: question.options,
          correctOptionId: question.correctOptionId,
          explanation: question.explanation,
          created: new Date().toISOString()
        });
      }
      
      showSuccess("Questions saved to database successfully!");
    } catch (error) {
      console.error("Error saving questions:", error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  // Initialize dynamic question bank
  const handleInitializeDynamicBank = async () => {
    try {
      const db = getDatabase();
      const bankRef = ref(db, `courses/${courseId}/questionBanks/dynamic_questions`);
      
      await set(bankRef, {
        name: 'Dynamic Questions',
        type: 'dynamic',
        created: new Date().toISOString(),
        settings: {
          defaultTemplate: 'addition'
        }
      });
      
      setDynamicBankExists(true);
      showSuccess("Dynamic question bank initialized!");
    } catch (error) {
      console.error("Error creating dynamic bank:", error);
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  // Helper to show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setActionSuccess(true);
    setTimeout(() => setActionSuccess(false), 3000);
  };

  return (
    <LessonContent
      lessonId="lesson_intro_elearning"
      title="What is E-Learning? (Staff View)"
      metadata={{ estimated_time: '30 minutes' }}
    >
      {/* Staff Controls Banner */}
      <div className="bg-blue-50 p-4 mb-6 rounded-md border border-blue-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaCog className="text-blue-700 mr-2" />
            <h2 className="font-bold text-blue-800">Staff Controls</h2>
          </div>
          <div className="flex space-x-2">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSaveQuestions}
            >
              <FaDatabase className="mr-2" /> Save Questions to Database
            </Button>
            
            {!dynamicBankExists && (
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleInitializeDynamicBank}
              >
                <FaDatabase className="mr-2" /> Initialize Dynamic Questions
              </Button>
            )}
          </div>
        </div>
        
        {actionSuccess && (
          <div className="mt-3 p-2 bg-green-100 text-green-800 rounded flex items-center">
            <FaThumbsUp className="mr-2" /> 
            {successMessage}
          </div>
        )}
        
        {errorMessage && (
          <div className="mt-3 p-2 bg-red-100 text-red-800 rounded">
            {errorMessage}
          </div>
        )}
        
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-1">AI-Assisted Question Editing</h3>
              <p className="text-sm text-gray-600">
                Edit questions directly in the IntroToELearning.js and IntroToELearning_Staff.js 
                files. Then click "Save Questions to Database" to update.
              </p>
              <div className="mt-2 text-xs bg-yellow-50 p-2 rounded">
                <p className="font-medium">File Paths:</p>
                <ul className="pl-5 list-disc">
                  <li>src/FirebaseCourses/courses/COM1255/content/lessons/IntroToELearning.js</li>
                  <li>src/FirebaseCourses/courses/COM1255/content/lessons/IntroToELearning_Staff.js</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <h3 className="font-medium mb-1">Working with Dynamic Questions</h3>
              <p className="text-sm text-gray-600 mb-2">
                Dynamic questions generate unique parameters for each student based on templates in 
                questionGenerator.js.
              </p>
              <Label className="text-xs">Template Files:</Label>
              <div className="text-xs bg-gray-50 p-2 rounded">
                src/FirebaseCourses/utils/questionGenerator.js
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Regular lesson content - identical to student view */}
      <TextSection title="What is E-Learning?">
        <p className="mb-4">
          E-Learning refers to the process of learning that takes place through digital technologies
          and the internet. It encompasses a wide range of learning activities, from
          accessing educational content online to participating in virtual classrooms
          and collaborative learning environments.
        </p>
        <p className="mb-4">
          E-Learning has transformed education by providing flexibility, accessibility,
          and personalization that traditional classroom learning often cannot match.
        </p>
      </TextSection>

      <MediaSection
        type="image"
        src="https://placehold.co/800x450?text=E-Learning+Illustration"
        alt="Illustration of E-Learning concepts"
        caption="E-Learning connects students to educational resources across distances"
      />

      <TextSection title="Benefits of E-Learning">
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Flexibility:</strong> Learn at your own pace and on your own schedule</li>
          <li><strong>Accessibility:</strong> Access course materials from anywhere with an internet connection</li>
          <li><strong>Personalization:</strong> Customize your learning path based on your needs and preferences</li>
          <li><strong>Resource Variety:</strong> Engage with diverse multimedia content and interactive activities</li>
          <li><strong>Immediate Feedback:</strong> Receive instant assessment results and progress tracking</li>
        </ul>
      </TextSection>

      <div className="my-8">
        <h3 className="text-xl font-medium mb-4">Check Your Understanding</h3>

        {/* Staff Question Controls */}
        <div className="bg-yellow-50 mb-4 p-3 rounded-md border border-yellow-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-yellow-800">Staff Question Controls</h4>
            <span className="text-sm text-yellow-700">{questions.length} questions defined</span>
          </div>
          <p className="text-sm text-yellow-600">
            These questions are defined in the component source code. Edit directly in the files and 
            click "Save Questions to Database" above to update.
          </p>
        </div>

        {/* Render questions with admin info */}
        {questions.map((question, index) => (
          <div key={question.id} className="mb-10">
            <div className="bg-blue-50 p-2 rounded-md mb-2">
              <div className="flex justify-between">
                <span className="text-blue-800 font-medium">Question {index + 1} (ID: {question.id})</span>
                <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">
                  Correct Answer: {question.correctOptionId.toUpperCase()}
                </span>
              </div>
            </div>
            <MultipleChoiceQuestion
              questionId={question.id}
              questionText={question.text}
              options={question.options}
              correctOptionId={question.correctOptionId}
              explanation={question.explanation}
            />
          </div>
        ))}

        {/* Dynamic Question with Staff Controls */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Dynamic Math Problem</h3>
            {!dynamicBankExists && (
              <Button 
                size="sm"
                className="bg-purple-600"
                onClick={handleInitializeDynamicBank}
              >
                Initialize Dynamic Bank
              </Button>
            )}
          </div>
          
          <DynamicQuestionExample
            courseId={courseId}
            assessmentId="intro_dynamic_question"
          />
          
          {dynamicBankExists && (
            <div className="mt-3 bg-blue-50 p-3 rounded-md border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-1">Dynamic Question Info</h4>
              <p className="text-sm text-blue-700">
                This question is generated uniquely for each student. The question template and parameters 
                are defined in questionGenerator.js.
              </p>
              <div className="mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-700 border-blue-300"
                  onClick={() => window.open(`/firebase-admin#/database/courses/${courseId}/questionBanks/dynamic_questions`, '_blank')}
                >
                  View in Database
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <LessonSummary
        points={[
          "E-Learning uses digital technologies to deliver educational content and experiences",
          "Key benefits include flexibility, accessibility, and personalization",
          "E-Learning continues to evolve with advancements in technology",
          "Success in E-Learning requires good time management and self-discipline"
        ]}
      />
    </LessonContent>
  );
};

export default IntroToELearningStaff;