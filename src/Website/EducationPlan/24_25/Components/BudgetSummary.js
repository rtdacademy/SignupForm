import React from 'react';
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { ExternalLink, DollarSign, TrendingUp, FileSpreadsheet, AlertCircle, Bot, Shield } from "lucide-react";

const BudgetSummary = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Budget Summary</h2>
      
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Resource Allocation
            </h3>
            <p className="text-gray-700 mb-4">
              RTD Academy's budget is carefully aligned with our educational priorities to ensure 
              optimal resource allocation for student success. Our budget supports key initiatives 
              across all five assurance domains.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Current Budget Document
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Access our detailed budget allocation and financial planning documents:
            </p>
            <Button 
              variant="outline" 
              className="flex items-center"
              onClick={() => window.open('https://rtdacademy.sharepoint.com/:x:/s/RTDAdministration/EZPieglu71pNkvycYpAgnsEBIJmb9rHKLvNnZkBQXUHQbQ?e=Gm3Iqb', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View 2024-25 Budget Document
            </Button>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Strategic Budget Priorities Aligned with Education Plan Goals
            </h3>
            
            {/* Critical Priority Initiatives */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-2 flex items-center text-red-800">
                <AlertCircle className="w-4 h-4 mr-2" />
                Critical Priority Initiatives
              </h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <Shield className="w-4 h-4 mr-2 mt-1 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold">Proctorio Implementation</p>
                    <p className="text-xs text-gray-700">Full deployment across all courses to enhance assessment integrity and reduce school-diploma grade gaps</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Bot className="w-4 h-4 mr-2 mt-1 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold">Context-Aware AI Learning Support</p>
                    <p className="text-xs text-gray-700">Major technology investment for personalized learning across all mathematics courses</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Student Achievement</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• "Rock the Diploma" preparation program</li>
                  <li>• Enhanced support for Math 10C & Math 20-2</li>
                  <li>• Data analysis tools and performance tracking</li>
                  <li>• Personalized learning pathway development</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Teaching & Leading</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Professional development for asynchronous teaching</li>
                  <li>• Multimedia learning materials development</li>
                  <li>• Teacher collaboration platforms</li>
                  <li>• Instructional innovation initiatives</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Learning Supports</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Machine learning early warning system</li>
                  <li>• AI-powered student support systems</li>
                  <li>• Peer mentoring program</li>
                  <li>• Adult student retention initiatives</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Governance & Communication</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Parent portal development</li>
                  <li>• Communication platform enhancements</li>
                  <li>• Dashboard and analytics tools</li>
                  <li>• Stakeholder feedback systems</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">STEM Access & Equity</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Applied mathematics and computer science courses</li>
                  <li>• Rural and remote school partnerships</li>
                  <li>• Targeted outreach programs</li>
                  <li>• FNMI student support framework</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Technology Infrastructure</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Remote proctoring systems</li>
                  <li>• AI platform deployment and maintenance</li>
                  <li>• Analytics and reporting platforms</li>
                  <li>• Security and privacy enhancements</li>
                </ul>
              </div>
            </div>
          </div>


          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> The budget is reviewed quarterly by the Board of Directors 
              to ensure alignment with educational priorities and responsiveness to emerging needs. 
              Budget allocations directly support the achievement of our Education Plan goals and 
              measurable performance targets.
            </p>
          </div>
          
        </div>
      </Card>
    </section>
  );
};

export default BudgetSummary;