import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Calendar, BookOpen, Laptop, DollarSign } from 'lucide-react';

const SchoolProfile = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">School Profile</h2>
      
      {/* Introduction */}
      <Card className="p-6">
        <p className="text-lg leading-relaxed">
          RTD Academy, founded in September 2022, is an innovative online school based in Alberta, specializing in high school Math and STEM courses. Our core mission is to provide high-quality, accessible education that empowers students to excel in these critical disciplines. With over three years of operational experience, we have evolved from a startup to serving over 1,400 unique students across Alberta.
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          One of our unique features is the asynchronous format of our courses. This allows students to maintain flexible schedules and timelines, accommodating their varied learning needs and lifestyles. We believe in empowering our students through autonomy, encouraging them to take control of their educational journeys.
        </p>
        <p className="mt-4 text-lg leading-relaxed">
          At RTD Academy, our courses are much more than just online textbooks. They are interactive, designed to engage students actively and deepen their understanding of the subject matter. Our students are supported online by dedicated Alberta Math teachers, ensuring they have access to expert guidance whenever they need it.
        </p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            About RTD Academy
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Founded</p>
              <p className="font-medium">September 2022</p>
            </div>
       
            <div>
              <p className="text-sm text-gray-600">Learning Model</p>
              <p className="font-medium">Asynchronous, Self-Paced</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Service Area</p>
              <p className="font-medium">Province-wide (Alberta)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Years of Operation</p>
              <p className="font-medium">3 years (2022-present)</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Laptop className="h-5 w-5" />
            Unique Features
          </h3>
          <ul className="space-y-2 text-sm">
            <li>• Year-round enrollment opportunities</li>
            <li>• Flexible scheduling and pacing</li>
            <li>• Interactive online course materials</li>
            <li>• Expert Alberta-certified math teachers</li>
            <li>• Custom learning management system</li>
            <li>• Comprehensive solution-based learning</li>
            <li>• Individualized student support</li>
            <li>• Diploma exam preparation program</li>
            <li>• Accessible from anywhere in Alberta</li>
          </ul>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Educational Focus & Offerings</h3>
        <div className="space-y-4">
          <p className="leading-relaxed">
            RTD Academy offers comprehensive high school mathematics and STEM education, covering all levels from Math 10 through Math 31 (Calculus). Our curriculum is designed to meet Alberta Education standards while providing flexibility for diverse learning needs.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Mathematics Courses</h4>
              <ul className="space-y-1 text-sm">
                <li>• Mathematics 10C, 10-3</li>
                <li>• Mathematics 20-1, 20-2, 20-3</li>
                <li>• Mathematics 30-1, 30-2, 30-3</li>
                <li>• Mathematics 31 (Calculus)</li>
                <li>• Competencies in Math 15</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">STEM Courses</h4>
              <ul className="space-y-1 text-sm">
                <li>• Physics 20</li>
                <li>• Computer Science & Programming</li>
                <li>• Technology Integration</li>
                <li>• Future STEM offerings in development</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Funding Model & Accessibility
        </h3>
        <div className="space-y-3">
          <p className="leading-relaxed">
            RTD Academy is mainly funded through the non-primary distance education grant, which enables us to offer our courses for free to students. This reflects our commitment to making quality STEM education accessible to all students, regardless of their socio-economic backgrounds.
          </p>
        </div>
      </Card>
      
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Three-Year Planning Context</h4>
            <p className="text-sm text-blue-800">
              This education plan represents the third and final year of our current planning cycle, 
              marking a transition period as we prepare for our next three-year cycle. Our substantial growth from 
              startup to serving over 1,400 students demonstrates the increasing demand for flexible, high-quality 
              online STEM education across Alberta. This plan builds upon three years of operational insights, 
              stakeholder feedback, and continuous improvement to guide our strategic direction.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              As we move forward, we are continuously striving to improve our offerings and services, building on the 
              feedback and insights gained from our stakeholders. Our Education Plan outlines our strategic priorities, 
              measures, and initiatives to achieve our vision of being Alberta's premier online provider of mathematics 
              and STEM education.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SchoolProfile;