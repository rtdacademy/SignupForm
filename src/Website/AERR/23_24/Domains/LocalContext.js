import React from 'react';
import { Card } from "../../../../components/ui/card";

const LocalContext = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Local Context</h3>
        
        {/* Mission Context */}
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Educational Context</h4>
          <div className="prose max-w-none text-gray-600 space-y-4">
            <p>
              In 2023-24, RTD Academy has continued to address the significant need for flexible, 
              asynchronous high school courses in Alberta following the closure of Alberta Distance 
              Learning Centre (ADLC). With 1,294 individual course enrollments this year, our 
              growth demonstrates the increasing demand for accessible, high-quality online STEM education.
            </p>
          </div>
        </div>

        {/* Technology and Innovation */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Technology Innovation</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Custom Learning Systems</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Advanced learning management system</li>
                  <li>• Individualized scheduling software</li>
                  <li>• Automated progress tracking</li>
                  <li>• AI-enhanced support systems (in development)</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Student Support</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Real-time progress monitoring</li>
                  <li>• Interactive learning tools</li>
                  <li>• Personalized learning paths</li>
                  <li>• Immediate feedback systems</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Community Impact */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Community Access</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Breaking Barriers</h5>
                <p className="text-sm text-gray-600">
                  Our flexible, asynchronous model continues to make advanced mathematics and STEM 
                  education accessible to students across Alberta, particularly benefiting those in 
                  remote and First Nations communities where access to specialized courses may be limited.
                </p>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Educational Impact</h5>
                <p className="text-sm text-gray-600">
                  By providing free access through non-primary distance education grants, we ensure 
                  that quality STEM education remains accessible to all students, regardless of their 
                  socio-economic background or geographical location.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Flexibility */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Meeting Diverse Needs</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Flexible Learning Options</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Self-paced course completion</li>
                  <li>• Year-round enrollment options</li>
                  <li>• Complementary course offerings</li>
                  <li>• Advanced study opportunities</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Future Development</h5>
                <p className="text-sm text-gray-600">
                  As we continue to evolve, we are developing enhanced support systems, including 
                  AI-assisted learning tools and expanded course offerings, to better serve our 
                  diverse student population and meet the growing demand for online STEM education.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LocalContext;