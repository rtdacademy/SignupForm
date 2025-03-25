import React from 'react';
import { Card } from "../../../../components/ui/card";

const StudentGrowth = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Student Growth & Achievement</h3>

         {/* Context Section */}
         <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Context and Progress</h4>
          <div className="prose max-w-none text-gray-600 space-y-4">
            <p>
              As one of Alberta's few fully asynchronous schools offering year-round enrollment, 
              our steady improvement in student outcomes reflects our growing understanding of 
              remote learning dynamics. The unique challenge of motivating and supporting students 
              we may never meet in person has driven significant innovations in our approach.
            </p>
            <p>
              Our completion rates and diploma results must be viewed within this distinctive 
              context. The primary challenge has been developing effective systems to maintain 
              student motivation and proactively identify concerns in an asynchronous environment. 
              In response, we've made substantial investments in:
            </p>
            <ul className="text-sm space-y-2 mt-2">
              <li>Custom software solutions specifically designed for asynchronous learning</li>
              <li>Enhanced communication structures and early warning systems</li>
              <li>Proactive student engagement and support mechanisms</li>
            </ul>
            <p className="text-sm font-medium text-blue-800 mt-4">
              These systematic improvements, combined with our growing expertise in asynchronous 
              education, provide strong indicators that our positive trends will continue.
            </p>
          </div>
        </div>
        
        {/* Diploma Exam Results Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Diploma Examination Results</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-500">Math 30-1 Results</h5>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Acceptable Standard</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-blue-600">60.9%</p>
                      <p className="text-xs text-green-600">+25%</p>
                    </div>
                    <p className="text-xs text-gray-500">vs Provincial: 81.5%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Standard of Excellence</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl font-bold text-purple-600">16.7%</p>
                      <p className="text-xs text-green-600">+2.7%</p>
                    </div>
                    <p className="text-xs text-gray-500">vs Provincial: 22.6%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Year-Over-Year Analysis</h5>
              <p className="text-sm text-gray-600">
                Significant improvement in acceptable standard achievement, rising from 
                36% to 60.9%. Excellence standard showed modest growth from 14% to 16.7%. 
                While still below provincial averages, the strong positive trend demonstrates 
                the effectiveness of our enhanced support strategies.
              </p>
            </div>
          </div>
        </div>

        {/* Academic Achievement Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Academic Achievement</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Overall Math Average</h5>
                <p className="text-xl font-bold text-blue-600">77.88%</p>
                <p className="text-sm text-gray-600">Across all mathematics courses</p>
              </div>
              <div className="mt-4 space-y-2">
              
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Math 31</span>
                  <span className="text-sm font-medium text-green-600">84.40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Math 30-3</span>
                  <span className="text-sm font-medium text-red-600">52.00%</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Course Performance Summary</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                
                <li>• Consistent achievement in advanced courses (Math 31)</li>
                <li>• Core courses (Math 10C, 20-1, 30-1) showing steady performance</li>
                <li>• Identified need for additional support in Math 30-3</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Course Completion Section */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Course Completion and Retention</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Overall Completion Rate</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-green-600">77.78%</p>
                  <p className="text-xs text-green-600">+8.33%</p>
                </div>
                <p className="text-xs text-gray-500">Improved from 69.45% previous year</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Technology Course Completion</p>
                <p className="text-xl font-bold text-blue-600">90-100%</p>
                <p className="text-xs text-gray-500">Consistently high performance</p>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-500 mb-2">Success Factors</h5>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Improved asynchronous learning support</li>
                <li>• Enhanced communication systems</li>
                <li>• Flexible pacing options</li>
                <li>• Early identification of at-risk students</li>
                <li>• Personalized intervention strategies</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StudentGrowth;