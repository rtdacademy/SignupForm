import React from 'react';
import { Card } from "../../../../../components/ui/card";
import { HeartPulse, AlertTriangle, Sparkles, ArrowUpRight, BellRing } from 'lucide-react';

const LearningSupports = () => {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Domain 3: Learning Supports</h3>
      
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-red-600" />
          Enhance Early Identification and Support Systems
        </h4>
        
        <div className="space-y-4">
          <p className="leading-relaxed">
            Our data analysis identifies a significant number of students categorized as 'behind' or 'inactive', 
            representing an opportunity to improve our early identification and intervention systems. 
            Additionally, with a concerning number of withdrawn students across all courses, we recognize the need to 
            strengthen our support mechanisms to better retain students facing challenges in the 
            online learning environment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Current Support System Analysis
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Our current data reveals several key insights regarding student support needs:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>At-Risk Identification Rate:</strong> Currently identifying a majority of at-risk students within the first few weeks</li>
                  <li>• <strong>Retention of Identified Students:</strong> Many identified at-risk students successfully complete their courses, though improvement is needed</li>
                  <li>• <strong>Withdrawal Patterns:</strong> Highest withdrawal rates observed in Adult Students and Non-Primary Students</li>
                  <li>• <strong>Course-Specific Challenges:</strong> Mathematics 10C and Mathematics 20-2 show the highest percentage of students falling behind</li>
                </ul>
                <p className="text-sm mt-2">
                  These findings indicate opportunities to strengthen our early identification system and enhance 
                  our intervention strategies, particularly for Adult Students and students in challenging gateway 
                  mathematics courses.
                </p>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <BellRing className="h-4 w-4 text-red-600" />
                Early Warning System Development
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Our early warning system has evolved through three years of implementation, with increasing 
                  sophistication in identifying at-risk students:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>Year 1 (2022-23):</strong> Manual tracking of student progress through teacher monitoring</li>
                  <li>• <strong>Year 2 (2023-24):</strong> Semi-automated system based on login frequency and assignment completion</li>
                  <li>• <strong>Year 3 (2024-25):</strong> Enhanced data analytics incorporating multiple risk factors</li>
                </ul>
                <p className="text-sm mt-2">
                  While we've made significant progress, our current identification rate indicates room for 
                  improvement. Our retention rate for identified students suggests that our intervention 
                  strategies, while effective, can be further enhanced to better support students facing challenges.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-red-600" />
              Support System Enhancement Strategies
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">1. Advanced Early Identification System</h6>
                <p className="text-sm">
                  Implement a more sophisticated early warning system that incorporates machine learning to analyze 
                  student interaction patterns, assignment submission timing, and content engagement metrics. This 
                  system will aim to identify at-risk students within the first 10 days of enrollment, allowing for 
                  earlier intervention.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">2. Personalized Support Protocols</h6>
                <p className="text-sm">
                  Develop student-type-specific support protocols based on our data analysis of completion rates 
                  across different student categories. For example, create specific intervention strategies for 
                  Adult Students that address their unique challenges, such as balancing work commitments with 
                  academic responsibilities.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">3. Context-Aware AI Learning Support</h6>
                <p className="text-sm">
                  We are actively developing and implementing context-aware artificial intelligence systems 
                  integrated directly into our course content. These AI systems will provide personalized help 
                  with mathematics problems, adapt to student learning patterns, and offer just-in-time support 
                  when students struggle with specific concepts. This technology goes beyond traditional tutoring 
                  to provide intelligent assistance that grows more effective the more students interact with it.
                </p>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => window.openAIPreview && window.openAIPreview()}
                    className="flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                  >
                    <span className="mr-1">Preview AI Integration</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">4. Expanded Peer-to-Peer Support Network</h6>
                <p className="text-sm">
                  Create an opt-in peer mentoring program that pairs experienced students with new enrollees. 
                  This system will provide additional support through peer guidance, while offering leadership 
                  opportunities for successful students who can share their strategies for success in our 
                  asynchronous environment.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
              Implementation Framework
            </h5>
            <div className="bg-gray-50 p-4 rounded space-y-3">
              <p className="text-sm">
                Our learning support enhancements will be implemented through a phased approach:
              </p>
              <ol className="space-y-1 text-sm pl-4 list-decimal">
                <li>
                  <strong>Phase 1 (Immediate):</strong> Refine early warning triggers based on current year data analysis and 
                  implement more frequent check-in protocols for students showing early signs of disengagement.
                </li>
                <li>
                  <strong>Phase 2 (2-3 months):</strong> Develop and launch the enhanced digital literacy support program and 
                  student-type-specific intervention protocols.
                </li>
                <li>
                  <strong>Phase 3 (3-5 months):</strong> Implement the advanced data analytics system for early identification 
                  and establish the peer mentoring network.
                </li>
                <li>
                  <strong>Phase 4 (Ongoing):</strong> Continuous evaluation and refinement of all support systems based on 
                  effectiveness data and student feedback.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-red-50">
        <div className="flex items-start gap-3">
          <HeartPulse className="h-5 w-5 text-red-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">Expected Outcomes</h4>
            <ul className="space-y-1 text-sm text-red-800">
              <li>• Significantly increase early identification rate of at-risk students by end of 2025/26</li>
              <li>• Improve retention rate of identified at-risk students through enhanced intervention strategies</li>
              <li>• Substantially reduce withdrawal rates overall, with particular focus on Adult Students</li>
              <li>• Increase the percentage of students reporting that they "feel supported" in our learning environment</li>
              
              <li>• Successfully implement context-aware AI support across all mathematics courses</li>
              <li>• Demonstrate measurable improvement in student learning outcomes through AI-enhanced content</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default LearningSupports;