import React from 'react';
import { Card } from "../../../../components/ui/card";

const LearningSupports = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Learning Supports</h3>
        
        {/* Context Section */}
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Support Systems Context</h4>
          <div className="prose max-w-none text-gray-600 space-y-4">
            <p>
              RTD Academy's approach to learning supports is evolving rapidly as we develop innovative 
              solutions for asynchronous education. Our data shows that timely, accessible support is 
              crucial for student success in an online environment, leading us to invest significantly 
              in both technological and human support systems.
            </p>
            <p>
              We are particularly excited about our upcoming AI-enhanced support system and new student portal, 
              currently in development. These systems will provide immediate, personalized assistance to students 
              while maintaining our commitment to the Socratic method. Rather than simply providing answers, 
              they will guide students through their learning process, supporting deeper understanding and 
              independent problem-solving skills.
            </p>
          </div>
        </div>

        {/* Current Support Systems */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Current Support Systems</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Support Effectiveness</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Progress Monitoring</p>
                    <p className="text-xl font-bold text-blue-600">8.62/10</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructor Support</p>
                    <p className="text-xl font-bold text-purple-600">8.36/10</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Key Support Features</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Custom early identification system for at-risk students</li>
                <li>• Weekly progress monitoring and communication</li>
                <li>• Flexible pacing options for diverse learning needs</li>
                <li>• Individualized learning plans for identified students</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technology Integration */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Technology-Enhanced Support</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Current Tools</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Custom learning management system</li>
                  <li>• Progress tracking software</li>
                  <li>• Interactive learning modules</li>
                  <li>• Communication platforms</li>
                </ul>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Impact on Learning</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Improved student engagement tracking</li>
                <li>• Enhanced communication efficiency</li>
                <li>• Better identification of learning gaps</li>
                <li>• More responsive support delivery</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Future Developments */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Future Support Innovations</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Upcoming Initiatives</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• New Student & Parent Portal System</li>
                  <li>• YourWay Schedule Maker Integration</li>
                  <li>• AI Chatbot Learning Assistants</li>
                  <li>• Enhanced Analytics for Support Targeting</li>
                  <li>• Expanded Communication Tools</li>
                </ul>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Enhanced Learning Support</h5>
              <p className="text-sm text-gray-600">
                Our new portal system represents a significant advancement in asynchronous learning support. 
                The integrated YourWay schedule maker, seamlessly connected with student gradebooks, 
                will enable personalized learning paths and improved progress tracking. This innovative 
                tool is just the beginning - we have a robust roadmap of features planned for the coming 
                year, all designed to enhance student success in the asynchronous learning environment.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LearningSupports;