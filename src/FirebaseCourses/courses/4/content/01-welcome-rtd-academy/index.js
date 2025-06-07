import React from 'react';
import { AIMultipleChoiceQuestion, AILongAnswerQuestion } from '../../../../components/assessments';

const WelcometoRTDAcademy = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Welcome to RTD Academy</h1>
        <p className="text-gray-600 mb-6">Introduction to RTD Academy, mission, and learning environment</p>
      </section>

      {/* Course Introduction Content */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">About RTD Academy</h2>
        <div className="prose max-w-none">
          <p className="mb-4">
            Welcome to RTD Academy, where we believe every student deserves access to high-quality education 
            tailored to their unique learning needs. Our academy combines traditional educational excellence 
            with innovative technology to create a personalized learning experience.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
          <p className="mb-4">
            To provide flexible, engaging, and comprehensive education that empowers students to achieve 
            their academic goals while developing critical thinking skills and preparing for future success.
          </p>
          
          <h3 className="text-xl font-semibold mb-2">What Makes RTD Academy Different</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Personalized learning paths designed for individual student needs</li>
            <li>AI-powered assessment tools that provide instant feedback</li>
            <li>Expert instructors available for support and guidance</li>
            <li>Flexible scheduling that works with your lifestyle</li>
            <li>Interactive content that makes learning engaging and effective</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">Your Learning Journey</h3>
          <p className="mb-4">
            Throughout your time at RTD Academy, you'll engage with various types of assessments and activities 
            designed to help you master the material. These include multiple-choice questions, long-answer 
            assessments, interactive labs, and real-world problem-solving scenarios.
          </p>
        </div>
      </section>

      {/* Sample AI Long Answer Assessment */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Reflection Activity</h2>
        <p className="text-gray-600 mb-4">
          Take a moment to reflect on your educational goals and learning preferences. 
          This assessment will help you think about what you hope to achieve at RTD Academy.
        </p>
        
        <AILongAnswerQuestion
          courseId={courseId}
          assessmentId="welcome_reflection"
          cloudFunctionName="course4_01_welcome_rtd_academy_aiLongAnswer"
          topic="Educational Goals and Learning Preferences"
          theme="blue"
        />
      </section>
    </div>
  );
};

export default WelcometoRTDAcademy;