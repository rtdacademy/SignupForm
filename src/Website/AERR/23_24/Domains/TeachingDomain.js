import React from 'react';
import { Card } from "../../../../components/ui/card";

const TeachingDomain = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Teaching & Leading</h3>
        
        {/* Context Section */}
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Teaching Quality Context</h4>
          <div className="prose max-w-none text-gray-600 space-y-4">
  <p>
    As an asynchronous online school, RTD Academy's approach to teaching excellence emerges from 
    our collaborative development of innovative solutions. Our teachers are actively involved in 
    the creation and refinement of our custom software and processes, leading to deep engagement 
    and continuous learning about effective asynchronous education. This hands-on involvement 
    ensures that our technological solutions are deeply rooted in practical teaching experience 
    and real student needs.
  </p>
  <p>
    A key learning in our journey has been the critical importance of robust communication 
    structures. With our staff distributed across Alberta, we've developed detailed procedures 
    and protocols to ensure seamless collaboration and consistent educational delivery. The 
    dedication of our teachers to this evolving process reflects their deep commitment to our 
    vision of providing equitable, high-quality education throughout Alberta. Their drive to 
    innovate and adapt continues to push the boundaries of what's possible in asynchronous 
    learning.
  </p>
</div>
        </div>

        {/* Education Quality Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Education Quality Measures</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-500">Student Satisfaction Metrics</h5>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Course Material Quality</p>
                    <p className="text-xl font-bold text-blue-600">8.49/10</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructor Support</p>
                    <p className="text-xl font-bold text-purple-600">8.36/10</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Analysis</h5>
              <p className="text-sm text-gray-600">
                High satisfaction rates across teaching quality metrics indicate the effectiveness of our 
                specialized approach to online instruction. Course material quality and instructor 
                support scores show strong student approval of our teaching methods.
              </p>
            </div>
          </div>
        </div>

        {/* Professional Development Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Professional Development Initiatives</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Key Achievements</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Custom software development training completed</li>
                  <li>• Wolfram Alpha technology integration implemented</li>
                  <li>• Asynchronous teaching methodologies enhanced</li>
                  <li>• AI integration training initiated</li>
                </ul>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Impact on Teaching</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Improved course completion rates through better engagement</li>
                <li>• Enhanced ability to identify and support at-risk students</li>
                <li>• More effective asynchronous communication strategies</li>
                <li>• Integration of advanced technological tools in instruction</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Teaching Innovation Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Teaching Innovation & Technology</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Platform Effectiveness</p>
                <p className="text-xl font-bold text-green-600">8.53/10</p>
                <p className="text-xs text-gray-500">Student Rating</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Lesson Clarity</p>
                <p className="text-xl font-bold text-blue-600">8.54/10</p>
                <p className="text-xs text-gray-500">Student Rating</p>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Future Initiatives</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• AI chatbot integration for enhanced student support</li>
                <li>• Expanded custom software capabilities</li>
                <li>• Advanced analytics for personalized instruction</li>
                <li>• Enhanced interactive content development</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeachingDomain;