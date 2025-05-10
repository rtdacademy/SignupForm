import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import MultipleChoiceQuestion from '../../../../components/assessments/MultipleChoiceQuestion';

const MidtermExam = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 minutes
  const [answers, setAnswers] = useState({});
  
  const questions = [
    {
      id: "q1",
      questionText: "Which of the following is a key characteristic of e-learning?",
      options: [
        { id: "a", text: "Always requires synchronous participation" },
        { id: "b", text: "Limited to text-based materials" },
        { id: "c", text: "Provides flexibility in time and location" },
        { id: "d", text: "Requires minimal self-discipline" }
      ],
      correctOptionId: "c"
    },
    {
      id: "q2",
      questionText: "What is a primary challenge of e-learning for students?",
      options: [
        { id: "a", text: "Too much direct supervision" },
        { id: "b", text: "Requiring self-discipline and time management" },
        { id: "c", text: "Limited content availability" },
        { id: "d", text: "Excessive social interaction" }
      ],
      correctOptionId: "b"
    },
    // More questions would be added here
  ];
  
  const handleStartExam = () => {
    setExamStarted(true);
    // In a real implementation, we would start a timer here
  };
  
  const handleAnswer = (questionId, answerId) => {
    setAnswers({
      ...answers,
      [questionId]: answerId
    });
  };
  
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleSubmit = () => {
    // In a real implementation, this would submit answers for grading
    alert("Exam submitted!");
    setExamStarted(false);
  };
  
  if (!examStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Midterm Examination</CardTitle>
          <CardDescription>
            Test your understanding of e-learning principles and technologies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Exam Information</h3>
              <ul className="space-y-2 text-blue-700">
                <li>Time Limit: 60 minutes</li>
                <li>Number of Questions: {questions.length}</li>
                <li>Question Types: Multiple choice</li>
                <li>Passing Score: 70%</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-md">
              <h3 className="font-medium text-amber-800 mb-2">Important Notes</h3>
              <ul className="space-y-2 text-amber-700">
                <li>Once started, the exam timer cannot be paused</li>
                <li>You may navigate between questions</li>
                <li>All questions must be answered before submission</li>
                <li>Ensure you have a stable internet connection</li>
              </ul>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                size="lg" 
                onClick={handleStartExam}
                className="px-8"
              >
                Start Exam
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
          <div className="text-lg font-medium text-red-600">
            Time Remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        </CardHeader>
        <CardContent>
          <MultipleChoiceQuestion
            questionId={questions[currentQuestion].id}
            questionText={questions[currentQuestion].questionText}
            options={questions[currentQuestion].options}
            correctOptionId={null} // Hide correct answer during exam
            selectedOptionId={answers[questions[currentQuestion].id]}
            onSelect={(answerId) => handleAnswer(questions[currentQuestion].id, answerId)}
            showExplanation={false}
          />
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentQuestion === questions.length - 1 ? (
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit}
                >
                  Submit Exam
                </Button>
              ) : (
                <Button 
                  variant="default"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-3">Question Navigator</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, index) => (
              <Button
                key={q.id}
                variant={index === currentQuestion ? "default" : answers[q.id] ? "outline" : "secondary"}
                className={`w-10 h-10 p-0 ${answers[q.id] ? "border-green-500" : ""}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MidtermExam;