import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Feather, BookOpen, Users, BarChart } from 'lucide-react';

const IndigenousEducation = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">V. First Nations, Métis, and Inuit Education</h2>
      
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Feather className="h-5 w-5 text-purple-600" />
          FNMI Student Success Strategy
        </h3>
        
        <div className="space-y-4">
          <p className="leading-relaxed">
            RTD Academy recognizes the importance of supporting First Nations, Métis, and Inuit students 
            in their educational journey. As an online asynchronous school with a focus on mathematics and STEM 
            education, we are committed to creating inclusive learning environments that honor Indigenous 
            perspectives and support the unique needs of FNMI students. We believe our flexible online courses 
            have the unique opportunity to support equity for students in remote Indigenous communities by 
            providing access to quality STEM education regardless of geographic location.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                FNMI Student Demographics
              </h4>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Our FNMI student population represents an important demographic within our school community:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• Current FNMI student enrollment across multiple grade levels and courses</li>
                  <li>• Diverse geographic distribution, including both urban and rural communities</li>
                  <li>• Varying levels of access to local educational resources and supports</li>
                  <li>• Range of educational goals from diploma completion to post-secondary preparation</li>
                </ul>
                <p className="text-sm mt-2">
                  Our asynchronous, flexible learning model provides important educational opportunities for 
                  FNMI students who may face barriers in traditional educational settings, including geographic 
                  isolation, incompatible scheduling with cultural commitments, or the need for personalized learning approaches.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <BarChart className="h-4 w-4 text-purple-600" />
                FNMI Student Performance Analysis
              </h4>
              <div className="bg-gray-50 p-4 rounded space-y-3">
                <p className="text-sm">
                  Analysis of our FNMI student performance data has provided valuable insights:
                </p>
                <ul className="space-y-1 text-sm pl-4">
                  <li>• Successful course completion rates comparable to the general student population</li>
                  <li>• Strengths in self-paced learning and independence</li>
                  <li>• Opportunities for enhanced engagement through culturally responsive content</li>
                  <li>• Identified need for expanded support systems that acknowledge cultural contexts</li>
                </ul>
                <p className="text-sm mt-2">
                  These insights form the foundation of our commitment to continuous improvement 
                  in supporting FNMI student success, particularly in mathematics and STEM fields 
                  where Indigenous perspectives have historically been underrepresented.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              Indigenous Education Enhancement Strategies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h5 className="font-medium text-sm mb-2">1. Culturally Responsive Curriculum Integration</h5>
                <p className="text-sm">
                  Integrate Indigenous perspectives and ways of knowing into our mathematics and STEM curriculum 
                  by incorporating culturally relevant examples, problems, and applications. This includes 
                  highlighting Indigenous contributions to mathematics, science, and technology throughout history 
                  and in contemporary contexts. Our context-aware AI supports will be designed to recognize and 
                  respond to diverse cultural backgrounds and learning approaches.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h5 className="font-medium text-sm mb-2">2. Personalized Support Framework</h5>
                <p className="text-sm">
                  Establish a dedicated support framework for FNMI students that acknowledges the unique contexts 
                  and potential barriers they may face. This includes flexible scheduling that accommodates 
                  cultural and community commitments, personalized check-ins with culturally aware staff, and 
                  connection with support resources both within our school and in students' local communities.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Future Direction: Indigenous Community Partnerships</h4>
            <p className="text-sm text-yellow-700">
              A key area of focus for our future development is establishing meaningful partnerships with various Indigenous communities 
              across Alberta. We recognize that our online asynchronous model offers a significant opportunity to support 
              educational equity for students in remote areas who may have limited access to advanced STEM education. By working 
              directly with communities to understand their specific educational needs and contexts, we aim to create tailored 
              supports that respect Indigenous knowledge systems while providing high-quality mathematics and STEM instruction. 
              These partnerships will be approached with a commitment to reciprocity, respect, and genuine collaboration.
            </p>
          </div>
          
        </div>
      </Card>
      
      <Card className="p-6 bg-purple-50">
        <div className="flex items-start gap-3">
          <Feather className="h-5 w-5 text-purple-700 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 mb-1">Expected Outcomes</h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Increase FNMI student enrollment across all course offerings</li>
              <li>• Maintain high completion rates for FNMI students comparable to or exceeding the general student population</li>
              <li>• Enhance integration of Indigenous perspectives in mathematics and STEM curriculum</li>
              <li>• Create responsive and culturally appropriate support systems for FNMI students</li>
              <li>• Develop meaningful partnerships with Indigenous communities to support educational equity</li>
              <li>• Support more FNMI students in transitioning to post-secondary STEM education</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IndigenousEducation;