import React from 'react';
import MultipleChoiceQuestion from './index';

/**
 * Example usage of the MultipleChoiceQuestion component
 */
const MultipleChoiceQuestionExample = () => {
  // Example callback functions
  const handleCorrectAnswer = () => {
    console.log("The student answered correctly!");
    // You could award points, unlock next content, etc.
  };
  
  const handleAttempt = (isCorrect) => {
    console.log("Student made an attempt, correct:", isCorrect);
    // You could track analytics, etc.
  };
  
  const handleComplete = () => {
    console.log("Student has used all attempts");
    // You could show a hint, move them to the next question, etc.
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Multiple Choice Questions</h2>
      
      {/* Basic Example with Blue Theme */}
      <div className="mb-10">
        <h3 className="text-xl font-medium mb-3">Basic Example (Blue Theme)</h3>
        <MultipleChoiceQuestion 
          courseId="COM1255"
          assessmentId="example_mc_question_1"
          cloudFunctionName="COM1255_IntroToELearningQ1"
          title="E-Learning Benefits"
          onCorrectAnswer={handleCorrectAnswer}
          onAttempt={handleAttempt}
          onComplete={handleComplete}
        />
      </div>
      
      {/* Green Theme Example */}
      <div className="mb-10">
        <h3 className="text-xl font-medium mb-3">Green Theme</h3>
        <MultipleChoiceQuestion 
          courseId="COM1255"
          assessmentId="example_mc_question_2"
          cloudFunctionName="COM1255_IntroToELearningQ1"
          title="Learning Styles Question"
          theme="green"
          maxAttempts={2}
        />
      </div>
      
      {/* Purple Theme with Custom Class Names */}
      <div className="mb-10">
        <h3 className="text-xl font-medium mb-3">Purple Theme (With Custom Classes)</h3>
        <MultipleChoiceQuestion 
          courseId="COM1255"
          assessmentId="example_mc_question_3"
          cloudFunctionName="COM1255_IntroToELearningQ1"
          title="Educational Technology"
          theme="purple"
          questionClassName="border-2"
          optionsClassName="grid grid-cols-1 md:grid-cols-2 gap-2 space-y-0"
          showRegenerate={false}
        />
      </div>
      
      {/* Amber Theme with No Retry */}
      <div className="mb-10">
        <h3 className="text-xl font-medium mb-3">Amber Theme (No Retry Allowed)</h3>
        <MultipleChoiceQuestion 
          courseId="COM1255"
          assessmentId="example_mc_question_4"
          cloudFunctionName="COM1255_IntroToELearningQ1"
          title="Educational Assessment"
          theme="amber"
          allowRetry={false}
        />
      </div>
    </div>
  );
};

export default MultipleChoiceQuestionExample;