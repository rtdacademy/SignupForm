import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Users, MessageSquare, Building, GraduationCap } from 'lucide-react';

const StakeholderEngagement = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">II. Stakeholder Engagement Process</h2>
      
      <Card className="p-6">
        <p className="text-lg leading-relaxed mb-6">
          RTD Academy's stakeholder engagement process is central to our continuous improvement efforts. We actively 
          seek and respond to feedback from students, parents, partner schools, and Alberta Education to ensure our 
          programs meet the evolving needs of our learning community.
        </p>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student and Parent Engagement
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Registration Process Enhancement</h4>
            <p className="text-sm leading-relaxed mb-2">
              We have continuously refined our registration process based on stakeholder feedback, making it more 
              streamlined and user-friendly. Our custom schedule generator has received particularly positive feedback 
              from families, who appreciate how easy it is to create personalized learning schedules that accommodate 
              their unique circumstances.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Technology and Communication Innovations</h4>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Pre-assessment Tools:</strong> New registration tools include ability assessments that help 
                  families understand appropriate course placement and determine their student type classification</li>
              <li>• <strong>Central Messaging System:</strong> We've implemented a comprehensive messaging platform directly 
                  connected to our database, revolutionizing school-wide communication and enabling better tracking of 
                  all interactions with students and families</li>
              <li>• <strong>Parent Portal Development:</strong> Currently developing a parent portal system that will provide 
                  families with detailed, at-a-glance information about their child's progress and school activities</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Enhanced Email Communication</h4>
            <p className="text-sm leading-relaxed">
              Through SendGrid API integration, we've significantly increased our communication capacity. Teachers can now:
            </p>
            <ul className="space-y-1 text-sm mt-2">
              <li>• Create and share common email templates</li>
              <li>• Send communications to multiple families simultaneously</li>
              <li>• Ensure every student and parent receives at least one detailed progress email each week</li>
              <li>• Maintain personalized support while increasing efficiency</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education Partner Collaboration
          </h3>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              We maintain a positive and collaborative relationship with Alberta Education and the field services 
              team, regularly seeking their feedback on our processes and educational approaches.
            </p>
            <p className="text-sm leading-relaxed">
              This ongoing dialogue ensures our programs align with provincial standards while maintaining our 
              innovative approach to online education. The field services team's insights have been instrumental 
              in refining our administrative processes and educational delivery methods.
            </p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Community School Partnerships
          </h3>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              Many primary schools across Alberta, both public and independent, have expressed appreciation for 
              our programs and the flexibility they provide their students. Our partnerships extend to:
            </p>
            <ul className="space-y-1 text-sm">
              <li>• Urban schools seeking specialized math support</li>
              <li>• Rural schools with limited STEM resources</li>
              <li>• Independent schools requiring flexible programming</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              Small communities with reduced staffing have particularly valued our program, as it ensures their 
              families receive quality mathematics and STEM education regardless of local resource constraints.
            </p>
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Feedback Integration Process
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium mb-2">Collection Methods</h4>
            <ul className="text-sm space-y-1">
              <li>• Registration feedback surveys</li>
              <li>• Course completion evaluations</li>
              <li>• Parent satisfaction surveys</li>
              <li>• Partner school consultations</li>
              <li>• Regular check-ins with Alberta Education</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium mb-2">Analysis & Implementation</h4>
            <ul className="text-sm space-y-1">
              
              <li>• Technology enhancement priorities</li>
              <li>• Process improvement initiatives</li>
              <li>• Curriculum adjustments</li>
              <li>• Communication strategy updates</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded">
            <h4 className="font-medium mb-2">Continuous Improvement</h4>
            <ul className="text-sm space-y-1">
              <li>• Regular software updates</li>
              <li>• Enhanced support systems</li>
              <li>• Expanded course offerings</li>
              <li>• Improved accessibility features</li>
              <li>• Strengthened partnerships</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-blue-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Looking Forward</h4>
            <p className="text-sm text-blue-800">
              Our stakeholder engagement process continues to evolve. The implementation of our central messaging 
              system and upcoming parent portal represents a significant step forward in our commitment to transparent, 
              effective communication. These tools will enable us to better understand and respond to stakeholder needs 
              while maintaining the personalized support that defines RTD Academy's approach to online education.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default StakeholderEngagement;