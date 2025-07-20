import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Compass, Lightbulb, HeartHandshake, Heart } from 'lucide-react';

const FoundationalStatements = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">III. Vision, Mission, and Values</h2>
      
      <Card className="p-6">
        <p className="text-lg leading-relaxed">
          As we enter the third year of our three-year plan, RTD Academy continues to refine and strengthen our foundational 
          statements. These statements guide our decisions, shape our culture, and define our aspirations as an 
          online educational institution focused on mathematics and STEM excellence.
        </p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-600" />
            Vision
          </h3>
          <div className="space-y-3">
            <p className="text-blue-700 font-medium text-lg border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
              To be Alberta's premier online provider of mathematics and STEM education, 
              empowering all students to reach their full potential through accessible,
              flexible, and high-quality learning experiences.
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Our vision represents what we aspire to become: the leading online educational institution 
              for mathematics and STEM in Alberta. We aim to lead not just in enrollment numbers, but in 
              educational quality, student support, and innovative approaches to online learning.
            </p>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-600" />
            Mission
          </h3>
          <div className="space-y-3">
            <p className="text-amber-700 font-medium text-lg border-l-4 border-amber-500 pl-4 py-2 bg-amber-50">
              Providing high-quality, accessible asynchronous education that empowers students to 
              excel in mathematics and STEM while accommodating their diverse learning needs and circumstances.
            </p>
            <p className="text-sm text-gray-600 mt-4">
              Our mission defines our purpose and how we intend to achieve our vision. We are committed to 
              delivering exceptional educational experiences that are accessible to all students regardless 
              of their location, schedule constraints, or previous educational experiences. Through our 
              asynchronous model, we remove traditional barriers to learning, opening doors for more students 
              to succeed in critical STEM disciplines.
            </p>
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-green-600" />
          Core Values
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Accessibility</h4>
            </div>
            <p className="text-sm">
              We believe quality education should be available to all students regardless of geographic location, 
              scheduling constraints, or previous educational experiences. Our asynchronous model and commitment 
              to removing barriers ensures all students can access excellent STEM education.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Flexibility</h4>
            </div>
            <p className="text-sm">
              We recognize that students have diverse needs, learning styles, and life circumstances. Our 
              flexible approach allows students to learn at their own pace, on their own schedule, while still 
              receiving the support they need to succeed.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Excellence</h4>
            </div>
            <p className="text-sm">
              We are committed to maintaining the highest standards in curriculum development, teaching practices, 
              and student support. We continuously improve our courses and systems based on educational research, 
              student outcomes, and stakeholder feedback.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Innovation</h4>
            </div>
            <p className="text-sm">
              We embrace innovation in both technology and pedagogy. From our custom learning management system to our 
              interactive course materials, we continuously seek better ways to engage students and enhance learning 
              in the online environment.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Support</h4>
            </div>
            <p className="text-sm">
              We believe that personalized support is essential in the online learning environment. Our dedicated 
              teachers provide timely feedback, encouragement, and assistance to ensure all students have the 
              resources they need to overcome challenges and achieve their goals.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold">Integrity</h4>
            </div>
            <p className="text-sm">
              We operate with transparency, honesty, and ethical responsibility in all aspects of our work. We honor 
              our commitments to students, parents, partner schools, and Alberta Education, ensuring that our practices 
              align with our stated values and mission.
            </p>
          </div>
        </div>
      </Card>
      
      <Card className="p-6 bg-blue-50">
        <div className="flex items-start gap-3">
          <Compass className="h-5 w-5 text-blue-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Alignment with Alberta Education Framework</h4>
            <p className="text-sm text-blue-800">
              Our foundational statements align with Alberta Education's vision of inspired, engaged, and capable 
              learners. Our focus on accessible, high-quality mathematics and STEM education supports provincial 
              goals of developing critical thinkers prepared for future success in an increasingly technology-driven 
              world. As we enter the third year of our three-year plan, these statements continue to guide our 
              strategic priorities and operational decisions.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default FoundationalStatements;