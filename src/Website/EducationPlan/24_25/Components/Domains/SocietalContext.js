import React from 'react';
import { Card } from "../../../../../components/ui/card";
import { Globe, Users, BookOpen, LineChart } from 'lucide-react';

const SocietalContext = () => {
  return (
    <section className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Domain 5: Local and Societal Context</h3>
      
      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-emerald-600" />
         Expand Access to Quality STEM Education
        </h4>
        
        <div className="space-y-4">
          <p className="leading-relaxed">
            RTD Academy serves a diverse student population across Alberta, with our asynchronous model providing 
            accessibility to high-quality mathematics and STEM education regardless of geographic location, personal 
            circumstances, or traditional educational barriers. Our analysis of current enrollment patterns and 
            societal trends reveals significant opportunities to further expand equitable access to STEM education.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                Student Demographic Analysis
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Our student population reflects the diversity of Alberta, with several notable patterns:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>Geographic Distribution:</strong> Students from both urban centers and rural communities across Alberta</li>
                  <li>• <strong>Student Categories:</strong> Diverse mix of primary students, non-primary students enhancing their education, and adult learners pursuing academic advancement</li>
                  <li>• <strong>Learning Needs:</strong> Students with various learning preferences and circumstances that benefit from flexible, asynchronous delivery</li>
                  <li>• <strong>Course Selection:</strong> High demand for upper-level mathematics and STEM courses, particularly from non-primary students seeking specialized instruction</li>
                </ul>
                <p className="text-sm mt-2">
                  This diverse enrollment pattern demonstrates the significant role RTD Academy plays in expanding 
                  educational access for students who may face barriers to traditional in-person STEM education due 
                  to geographic, scheduling, or other constraints.
                </p>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-emerald-600" />
                Alberta STEM Education Landscape
              </h5>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Analysis of Alberta's broader educational context reveals several important trends:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• <strong>Rural Access Challenges:</strong> Many rural schools struggle to offer comprehensive advanced mathematics and STEM courses</li>
                  <li>• <strong>Teacher Shortages:</strong> Provincial shortages of qualified mathematics and sciences teachers in many regions</li>
                  <li>• <strong>Digital Transformation:</strong> Increasing importance of digital literacy and technology skills across all sectors</li>
                  <li>• <strong>Economic Shifts:</strong> Growing demand for STEM-trained professionals in Alberta's evolving economy</li>
                </ul>
                <p className="text-sm mt-2">
                  These factors create both an opportunity and responsibility for RTD Academy to expand our reach and 
                  impact, particularly for underserved communities and student populations who may otherwise face 
                  limited access to quality STEM education.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h5 className="font-medium mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              Expanded Access Strategies
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">1. Enhanced Course Offerings</h6>
                <p className="text-sm">
                  Expand our course catalog based on analysis of high-performing subjects and identified gaps in 
                  provincial availability. This includes development of new courses in applied mathematics, 
                  computer science, and data science to meet evolving workforce needs, while ensuring all courses 
                  maintain our high standards for asynchronous delivery and student engagement.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">2. Targeted Outreach Program</h6>
                <p className="text-sm">
                  Develop specific outreach initiatives for underrepresented groups in STEM fields, including rural 
                  students, FNMI students, and female students in advanced mathematics. This will include partnership 
                  programs with small rural schools, targeted information sessions for specific communities, and 
                  showcasing diverse STEM role models through our course content.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">3. Context-Aware AI Implementation</h6>
                <p className="text-sm">
                  Leverage our developing context-aware AI systems to provide more personalized and culturally 
                  responsive learning experiences. These AI systems will be designed to recognize and adapt to 
                  diverse learning styles, cultural contexts, and background knowledge, ensuring that all students 
                  receive support that is relevant to their specific circumstances and needs.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h6 className="font-medium text-sm mb-2">4. School Partnership Framework</h6>
                <p className="text-sm">
                  Establish a formal partnership framework with schools across Alberta to supplement their 
                  in-person offerings with our specialized online courses. This will include coordinated scheduling, 
                  shared progress monitoring, and integrated assessment strategies to ensure students receive a 
                  cohesive educational experience that combines the strengths of both learning environments.
                </p>
              </div>
            </div>
          </div>
          
        </div>
      </Card>
      
      <Card className="p-6 bg-emerald-50">
        <div className="flex items-start gap-3">
          <Globe className="h-5 w-5 text-emerald-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-emerald-900 mb-1">Expected Outcomes</h4>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• Increase enrollment diversity across geographic regions and demographic groups</li>
              <li>• Expand successful completion rates among traditionally underrepresented groups in STEM</li>
              <li>• Establish formal partnerships with schools in rural and remote communities</li>
              <li>• Successfully implement context-aware AI that adapts to diverse student backgrounds</li>
              <li>• Increase student engagement with real-world applications of STEM concepts</li>
              <li>• Strengthen RTD Academy's role in addressing provincial STEM education gaps</li>
            </ul>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SocietalContext;