import React from 'react';
import { Card } from "../../../../../components/ui/card";
import { Megaphone, BarChart, Shield, FileText } from 'lucide-react';

const Governance = () => {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Domain 4: Governance</h3>
      
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-blue-600" />
          Strengthen Communication with Stakeholders
        </h4>
        
        <div className="space-y-4">
          <p className="leading-relaxed">
            As an online asynchronous school, RTD Academy faces unique challenges in maintaining effective 
            communication with stakeholders. Our analysis of stakeholder feedback and engagement patterns 
            reveals both strengths in our current approach and opportunities for further enhancement to 
            ensure that all stakeholders remain well-informed and engaged in student success.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-600" />
                Current Communication Analysis
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Our current stakeholder communication systems show several patterns:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>Weekly Email Updates:</strong> High open rates among primary and parent recipients, with room for improvement among non-primary students</li>
                  <li>• <strong>Parent Communication:</strong> Currently relying primarily on email communication as our parent portal is still in development</li>
                  <li>• <strong>Primary School Collaboration:</strong> Varying levels of engagement with the schools of our non-primary students</li>
                  <li>• <strong>Student Feedback Response Rate:</strong> Varies significantly across different student categories</li>
                  <li>• <strong>Board Reporting:</strong> Regular, structured reporting with opportunities for more data-driven insights</li>
                </ul>
                <p className="text-sm mt-2">
                  These findings indicate that while our communication foundations are solid, significant opportunities exist 
                  to create more targeted, engaging, and consistent communication across all stakeholder groups, 
                  particularly for non-primary students and their families.
                </p>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Stakeholder Communication Framework
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Our governance approach centers on a comprehensive communication framework that addresses the 
                  unique needs of each stakeholder group:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>Students:</strong> Direct course updates, intervention alerts, and personalized progress reports</li>
                  <li>• <strong>Parents/Guardians:</strong> Regular progress summaries, early warning notifications, and learning resource access through structured email communication</li>
                  <li>• <strong>Partner Schools:</strong> Consistent updates on student progress, collaborative intervention planning, and shared resource coordination</li>
                  <li>• <strong>Board Members:</strong> Comprehensive data dashboards, monthly trend reports, and strategic outcome tracking</li>
                  <li>• <strong>Alberta Education:</strong> Compliance reporting, outcome achievement documentation, and assurance framework alignment</li>
                </ul>
                <p className="text-sm mt-2">
                  Our goal is to ensure all communication is timely, relevant, actionable, and supports 
                  student success while meeting governance requirements.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Communication Enhancement Strategies
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">1. Custom Communication Software Enhancement</h6>
                <p className="text-sm">
                  Further develop our proprietary communication platform to enable more granular targeting of 
                  messages based on student type, course enrollment, academic status, and engagement level. 
                  This will allow us to provide more relevant information to each stakeholder while reducing 
                  communication fatigue from unnecessary messages.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">2. Dashboard Innovation</h6>
                <p className="text-sm">
                  Redesign our stakeholder dashboards to provide more intuitive, visual representations of student 
                  progress and engagement. These dashboards will be tailored to different stakeholder needs, with 
                  parent dashboards focusing on individual student progress and board dashboards highlighting 
                  school-wide trends and strategic goal achievement.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">3. Systematic Feedback Collection</h6>
                <p className="text-sm">
                  Implement a more systematic approach to collecting stakeholder feedback through strategic 
                  pulse surveys, focus groups, and automated feedback collection integrated into key interactions. 
                  This will provide continuous insight into communication effectiveness and stakeholder needs, 
                  allowing for ongoing refinement of our approach.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">4. Enhanced Orientation Process</h6>
                <p className="text-sm">
                  Develop a more comprehensive orientation program for all stakeholders that clearly outlines 
                  communication channels, expectations, and resources. This will include virtual orientation 
                  sessions, detailed guides, and follow-up check-ins to ensure all stakeholders know how to 
                  access and utilize available communication tools.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </Card>
      
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start gap-3">
          <Megaphone className="h-5 w-5 text-blue-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Expected Outcomes</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Successfully develop and implement a robust parent portal to enhance parent engagement</li>
              <li>• Improve stakeholder satisfaction with communication clarity and relevance</li>
              <li>• Enhance response rates to stakeholder surveys across all student categories</li>
              <li>• Increase the percentage of parents who report feeling "well-informed" about their student's progress</li>
              <li>• Establish more effective communication channels with partner schools for non-primary students</li>
              <li>• Establish data-driven decision making at all levels of governance</li>
              <li>• Create more transparent reporting on strategic goal achievement to all stakeholders</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default Governance;