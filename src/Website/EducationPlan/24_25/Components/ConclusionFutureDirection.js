import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Compass, BarChart3, Lightbulb, GraduationCap, Laptop } from 'lucide-react';

const ConclusionFutureDirection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">VIII. Conclusion & Future Direction</h2>
      
      <Card className="p-6">
        <p className="text-lg leading-relaxed mb-6">
          As RTD Academy completes the third year of our three-year education plan, we reflect on our 
          journey as Alberta's leading online mathematics and STEM education provider while setting 
          our vision for the future. This plan represents both the culmination of our current cycle 
          and a bridge to our next planning horizon, embracing the challenges and opportunities unique 
          to asynchronous online education.
        </p>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              Three-Year Progress Summary
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="mb-3">
                Over the past three years, RTD Academy has substantially grown its reach and impact, 
                now serving 1,435 unique students with 2,903 course enrollments across Alberta. 
                Key achievements during this cycle include:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Expanded Course Offerings:</strong> Growth in both student numbers and course 
                    diversity, with particular strength in advanced mathematics courses like Mathematics 31 
                    (86.33% average grade).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Student Satisfaction Excellence:</strong> Achieving 89% student satisfaction and 
                    90% parent satisfaction rates, demonstrating the effectiveness of our asynchronous model.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Diploma Examination Success:</strong> Reached 100% acceptable standard achievement 
                    for Mathematics 30-1 and 30-2 in January 2025, showing strong content mastery while identifying 
                    opportunity areas in reducing school-awarded to diploma result gaps.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">•</span>
                  <span>
                    <strong>Support System Evolution:</strong> Progressive enhancement of our early warning 
                    system from manual tracking to data analytics-driven approaches, improving our capacity 
                    to identify and support at-risk students.
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600" />
              Key Initiatives for Future Success
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Assessment Integrity Enhancement
                </h4>
                <p className="text-sm text-blue-700">
                  Our Proctorio implementation initiative addresses the identified gap between school-awarded 
                  grades and diploma exam results. By integrating secure assessment technology across all courses, 
                  we aim to reduce these gaps to match or exceed provincial averages, enhancing both the validity 
                  of our assessments and the preparedness of our students for external evaluations.
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                  <Laptop className="h-4 w-4" />
                  Context-Aware AI Integration
                </h4>
                <p className="text-sm text-purple-700">
                  Building upon our commitment to personalized learning, we will implement context-aware 
                  artificial intelligence systems that adapt to individual student needs. This technology will 
                  provide just-in-time support when students struggle with concepts, recognize diverse learning 
                  styles and cultural contexts, and create truly responsive educational experiences that evolve 
                  with each student interaction.
                </p>
              </div>
              
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <h4 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  Expanded Educational Access
                </h4>
                <p className="text-sm text-emerald-700">
                  We will leverage our asynchronous model to further expand access to quality STEM education, 
                  particularly for underserved populations. This includes developing partnerships with Indigenous 
                  communities to support educational equity in remote areas, creating more targeted support for 
                  various student types, and enhancing our course offerings based on identified provincial gaps 
                  and workforce needs.
                </p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Data-Driven Instruction
                </h4>
                <p className="text-sm text-red-700">
                  Our enhanced data analytics capabilities will drive continuous improvement in instructional 
                  approaches. By systematically analyzing student performance patterns, we will identify specific 
                  concept areas where students struggle most and refine course content accordingly. This approach 
                  will be particularly focused on gateway courses like Mathematics 10C and Mathematics 20-2 where 
                  our data shows the most significant opportunity for improvement.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
            <h3 className="text-lg font-semibold mb-3 text-indigo-900">Looking Forward: The Next Three-Year Cycle</h3>
            <p className="text-indigo-800 mb-3">
              As we conclude this three-year education plan, we are already laying the groundwork for our next cycle. 
              The data, insights, and progress achieved during this period provide a strong foundation upon which 
              to build our future direction. Our unique position as an online asynchronous mathematics and STEM 
              education provider allows us to be responsive to Alberta's evolving educational landscape while 
              maintaining our commitment to excellence, accessibility, and innovation.
            </p>
            <p className="text-indigo-800">
              RTD Academy will continue to leverage its distinctive strengths — flexibility, specialized mathematics 
              expertise, and personalized learning approaches — while addressing identified areas for growth. With 
              our focus on assessment integrity, AI-enhanced learning supports, and expanded access initiatives, we 
              are well-positioned to further our mission of providing high-quality, accessible asynchronous education 
              that empowers students to excel in mathematics and STEM across Alberta and beyond.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConclusionFutureDirection;