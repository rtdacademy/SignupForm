import React from 'react';
import { Card } from "../../../../../components/ui/card";
import { Users, BookOpen, Award, GraduationCap, Lightbulb } from 'lucide-react';

const TeachingLeading = () => {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Domain 2: Teaching & Leading</h3>
      
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-purple-600" />
         Strengthen Instructional Approaches in Online Learning
        </h4>
        
        <div className="space-y-4">
          <p className="leading-relaxed">
            RTD Academy's asynchronous teaching model presents unique opportunities and challenges for 
            instruction. With our current data showing a 77.6% overall course completion rate and an 
            average grade of 89.2%, we have evidence of the effectiveness of our model. However, we recognize 
            the opportunity to further enhance our instructional approaches to better serve the diverse needs 
            of our 1,435 unique students.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-purple-600" />
                Asynchronous Teaching Model Analysis
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Our three-year experience with asynchronous online teaching has provided valuable insights 
                  into effective instructional practices. The data shows varying success rates across different 
                  student types:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>Home Education Students:</strong> 84.1% completion rate</li>
                  <li>• <strong>Non-Primary Students:</strong> 78.2% completion rate</li>
                  <li>• <strong>Summer School Students:</strong> 76.9% completion rate</li>
                  <li>• <strong>Adult Students:</strong> 72.4% completion rate</li>
                </ul>
                <p className="text-sm">
                  These differences highlight the need for tailored instructional approaches that address the unique 
                  challenges and circumstances of each student group, while maintaining the flexibility of our 
                  asynchronous model.
                </p>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                Teaching Quality Indicators
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Survey results from our 2023-24 academic year indicate high satisfaction with teaching quality:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>Student Satisfaction:</strong> 89% express satisfaction with teacher support</li>
                  <li>• <strong>Parent Satisfaction:</strong> 90% report satisfaction with teaching quality</li>
                  <li>• <strong>Response Time:</strong> Average 6.2 hours for teacher response to student inquiries</li>
                  <li>• <strong>Quality of Feedback:</strong> 85% of students rate teacher feedback as "helpful" or "very helpful"</li>
                </ul>
                <p className="text-sm">
                  While these indicators are positive, our goal is to further enhance teaching effectiveness 
                  through ongoing professional development and improved instructional resources.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              Instructional Enhancement Strategies
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">1. Specialized Professional Development</h6>
                <p className="text-sm">
                  Implement a comprehensive professional development program focused specifically on asynchronous 
                  online teaching methodologies. This includes training in effective feedback strategies, digital 
                  content creation, and engaging diverse learners in the online environment.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">2. Enhanced Instructional Content</h6>
                <p className="text-sm">
                  Develop more interactive and engaging course materials using multimedia elements, simulations, 
                  and adaptive learning technologies. Focus particularly on improving content for courses with 
                  lower completion rates and average grades (Math 10C and Math 20-2).
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">3. Personalized Instructional Approaches</h6>
                <p className="text-sm">
                  Implement differentiated instructional strategies based on student type and learning preferences. 
                  This includes creating tailored support materials for Adult Students (who have the lowest 
                  completion rates) and expanding successful approaches used with Home Education Students (who have 
                  the highest completion rates).
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">4. Teacher Collaboration and Knowledge-Sharing</h6>
                <p className="text-sm">
                  Establish structured opportunities for teachers to share effective practices, collaborate on 
                  content development, and engage in peer observation of instructional materials. Create a 
                  repository of successful teaching strategies and exemplary student interactions for reference.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Leadership Development
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">1. Instructional Leadership Enhancement</h6>
                <p className="text-sm">
                  Strengthen the instructional leadership capacity of our administrative team through 
                  specialized training in online educational leadership, data-informed decision making, 
                  and supporting teacher development in the asynchronous environment.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">2. Teacher Leadership Opportunities</h6>
                <p className="text-sm">
                  Create formal teacher leadership roles in content development, mentoring, and innovative 
                  instructional design. Establish a teacher advisory council to provide input on instructional 
                  policies and initiatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-purple-50">
        <div className="flex items-start gap-3">
          <GraduationCap className="h-5 w-5 text-purple-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 mb-1">Expected Outcomes</h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Increase overall course completion rate from 77.6% to 82% by end of 2025-26</li>
              <li>• Improve Adult Student completion rate from 72.4% to 77% by end of 2025-26</li>
              <li>• Maintain high satisfaction rates with teaching quality (≥90%)</li>
              <li>• Reduce average response time to student inquiries from 6.2 to 5 hours</li>
              <li>• Develop and implement at least one significant instructional innovation in each course</li>
              <li>• Create a comprehensive repository of effective teaching strategies for asynchronous math instruction</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default TeachingLeading;