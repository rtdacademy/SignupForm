import React from 'react';
import { Card } from "../../../../../components/ui/card";
import { Shield, BarChart, CheckSquare, Clock, Laptop } from 'lucide-react';

const AcademicIntegrityInitiative = () => {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Academic Integrity Initiative</h3>
      
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          Enhancing Assessment Security in the Asynchronous Environment
        </h4>
        
        <div className="space-y-4">
          <p className="leading-relaxed">
            As an online asynchronous learning institution, RTD Academy faces unique challenges in maintaining 
            academic integrity. Our commitment to flexible, anytime learning creates specific considerations 
            for assessment security, particularly in the context of increasing AI tools that can compromise 
            traditional assessment approaches. Recent diploma exam results highlight these challenges, with 
            significant gaps between school-awarded grades and diploma exam performance (15.6% in Math 30-1 and 
            20.6% in Math 30-2). To address these challenges while preserving our core value of flexibility, 
            we are implementing a comprehensive assessment security initiative centered around Proctorio 
            remote proctoring technology.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <BarChart className="h-4 w-4 text-indigo-600" />
                Assessment Integrity Analysis
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Our data analysis has identified several key challenges in our asynchronous assessment environment:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• Significant gaps between school-awarded grades and diploma results (January 2025: 15.6% for Math 30-1, 20.6% for Math 30-2)</li>
                  <li>• Concerning performance in April diploma sessions (66.7% acceptable standard for Math 30-1, 59.1% for Math 30-2)</li>
                  <li>• Difficulty ensuring the identity of test-takers in fully online courses</li>
                  <li>• Limited ability to prevent unauthorized resources during examinations</li>
                  <li>• Scheduling challenges for supervised assessments in an asynchronous model</li>
                  <li>• Increasing sophistication of AI tools that can compromise traditional online assessments</li>
                </ul>
                <p className="text-sm mt-2">
                  These challenges compromise our ability to confidently assess student learning and 
                  potentially impact the value and recognition of our academic credentials.
                </p>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                Proctorio Implementation Strategy
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  RTD Academy is integrating Proctorio's comprehensive remote proctoring solution to address these challenges:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>Identity Verification:</strong> Multi-factor authentication including ID verification and face detection</li>
                  <li>• <strong>Environment Scanning:</strong> Review of testing area to ensure test security</li>
                  <li>• <strong>Browser Lockdown:</strong> Preventing access to unauthorized resources</li>
                  <li>• <strong>AI-Enabled Monitoring:</strong> Automated flagging of suspicious behaviors</li>
                  <li>• <strong>Recording and Review:</strong> Full exam session recording with post-exam integrity reports</li>
                  <li>• <strong>Flexible Scheduling:</strong> 24/7 availability preserving our anytime learning model</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Laptop className="h-4 w-4 text-indigo-600" />
              Implementation Approach
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">1. Accelerated Full Implementation</h6>
                <p className="text-sm">
                  Based on our diploma exam data analysis, we are fast-tracking Proctorio implementation across 
                  all courses as soon as possible, rather than using a phased approach. This urgent, comprehensive 
                  rollout will ensure consistent assessment integrity throughout our program. We are prioritizing 
                  rapid instructor training and technical preparation to enable immediate deployment across all courses.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">2. Customized Security Settings</h6>
                <p className="text-sm">
                  RTD Academy is developing course-specific security protocols within the Proctorio system, 
                  balancing security requirements with student experience. Security settings are tailored 
                  based on course level, content, and assessment type.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">3. Student Support Resources</h6>
                <p className="text-sm">
                  To ensure smooth implementation, we're creating comprehensive student resources including 
                  tutorial videos, practice assessments, and technical support protocols. Our goal is to 
                  make the proctored exam experience as straightforward as possible.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">4. Data Analysis and Continuous Improvement</h6>
                <p className="text-sm">
                  We're establishing a systematic approach to analyzing Proctorio data, allowing us to refine 
                  our assessment practices, identify potential integrity issues, and measure the impact on 
                  assessment outcomes over time.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              Expected Outcomes and Benefits
            </h5>
            <div className="bg-gray-50 p-4 rounded space-y-3">
              <p className="text-sm">
                Implementing Proctorio will provide significant benefits for our educational model:
              </p>
              <ul className="space-y-1 text-sm pl-4">
                <li>• <strong>Enhanced Assessment Validity:</strong> Greater confidence in the integrity of grades and assessments</li>
                <li>• <strong>Reduced School-Diploma Gap:</strong> Aim to reduce the 15-20% gap between school-awarded grades and diploma results</li>
              
                <li>• <strong>Maintained Asynchronous Flexibility:</strong> Students can still take assessments on their own schedule</li>
                <li>• <strong>Improved Preparation for Standardized Exams:</strong> Students gain experience with secure testing environments</li>
                <li>• <strong>Increased Credential Value:</strong> Enhanced reputation and recognition of RTD Academy's academic credentials</li>
                <li>• <strong>Data-Driven Improvements:</strong> Better insights into assessment practices and potential areas for instructional enhancement</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-indigo-50">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-indigo-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-indigo-900 mb-1">Integration with Education Plan Priorities</h4>
            <p className="text-sm text-indigo-800">
              The Proctorio implementation aligns with and supports multiple Education Plan priorities:
            </p>
            <ul className="space-y-1 text-sm text-indigo-800 mt-2">
              <li>• <strong>Student Growth & Achievement:</strong> More accurate assessment of student learning and better preparation for diploma exams</li>
              <li>• <strong>Teaching & Leading:</strong> Enhanced teacher confidence in assessment integrity and better data on student mastery</li>
              <li>• <strong>Learning Supports:</strong> Identification of potential knowledge gaps masked by academic integrity issues</li>
              <li>• <strong>Governance:</strong> Strengthened accountability and credibility with Alberta Education and stakeholders</li>
            </ul>
            <p className="text-sm text-indigo-800 mt-2">
              By implementing this comprehensive approach to assessment security, RTD Academy reinforces its commitment 
              to educational excellence while maintaining the flexibility and accessibility that defines our program.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default AcademicIntegrityInitiative;