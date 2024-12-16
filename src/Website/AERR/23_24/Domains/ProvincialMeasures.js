import React from 'react';
import { Card } from "../../../../components/ui/card";

const ProvincialMeasures = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Provincial Measures Context</h3>
        
        {/* Context Section */}
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Measures Overview</h4>
          <div className="prose max-w-none text-gray-600 space-y-4">
            <p>
              As a non-primary asynchronous school specializing in high school mathematics and STEM courses, 
              RTD Academy's reporting context differs from traditional schools. While some standard provincial 
              measures don't directly apply to our unique model, we maintain comprehensive tracking of student 
              success and engagement through various metrics that align with provincial requirements.
            </p>
          </div>
        </div>

        {/* Student Learning Engagement */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Student Learning Engagement</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Key Metrics</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Platform engagement rating: 8.53/10</li>
                  <li>• Workload manageability: 77.1% positive</li>
                  <li>• Focus and attention: 68.6% positive</li>
                  <li>• Course completion rate: 77.78%</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Evidence</h5>
                <p className="text-sm text-gray-600">
                  Our comprehensive survey results and course completion data demonstrate strong 
                  student engagement in our asynchronous learning environment, with particularly 
                  high ratings for platform usability and course material quality.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Education Quality */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Education Quality</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Quality Indicators</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Course material quality: 8.49/10</li>
                  <li>• Instructor support: 8.36/10</li>
                  <li>• Lesson clarity: 8.54/10</li>
                  <li>• Overall satisfaction: 89% positive</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Implementation</h5>
                <p className="text-sm text-gray-600">
                  High ratings across our quality metrics, combined with strong academic performance 
                  in diploma examinations, demonstrate our commitment to maintaining excellent 
                  educational standards in an online environment.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Citizenship */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Citizenship Development</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Key Competencies</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Independent learning skills</li>
                  <li>• Digital citizenship</li>
                  <li>• Time management</li>
                  <li>• Self-advocacy</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Development</h5>
                <p className="text-sm text-gray-600">
                  Our asynchronous learning environment actively develops crucial citizenship skills 
                  through student responsibility, digital literacy, and independent learning practices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parental Involvement */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Parental Involvement</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Engagement Methods</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Weekly progress updates</li>
                  <li>• Parent portal access</li>
                  <li>• Course orientation meetings</li>
                  <li>• Regular communication channels</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Satisfaction</h5>
                <p className="text-sm text-gray-600">
                  Parent satisfaction rates of 90% demonstrate the effectiveness of our 
                  communication and involvement strategies, with particularly positive feedback 
                  on our progress monitoring and communication systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProvincialMeasures;