import React from 'react';
import { Card } from "../../../../components/ui/card";

const GovernanceDomain = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Governance & Resource Management</h3>
        
        {/* Board Structure Section */}
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Board Leadership</h4>
          <div className="prose max-w-none text-gray-600 space-y-4">
            <p>
              RTD Academy's Board of Directors brings diverse expertise in education, finance, and business 
              management to guide our strategic direction and ensure accountability.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900">Board Members</h5>
                <ul className="text-sm text-gray-600 space-y-2 mt-2">
                  <li><span className="font-medium">Nikki Allen</span> - Board Chair</li>
                  <li><span className="font-medium">Danielle Wilson</span> - Treasurer</li>
                  <li><span className="font-medium">Candace Perras</span> - Director</li>
                  <li><span className="font-medium">Sherry Haarstad</span> - Director</li>
                  <li><span className="font-medium">Toni-Lee Hazlett</span> - Director</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900">Key Responsibilities</h5>
                <ul className="text-sm text-gray-600 space-y-2 mt-2">
                  <li>Strategic oversight and direction</li>
                  <li>Financial accountability</li>
                  <li>Policy development and review</li>
                  <li>Educational quality assurance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Performance Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Financial Performance 2023-24</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Revenue Sources</h5>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-xl font-bold text-blue-600">$623,804</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Grant Funding</p>
                      <p className="text-lg font-semibold text-blue-600">$601,300</p>
                      <p className="text-xs text-gray-500">96.4% of revenue</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tuition Income</p>
                      <p className="text-lg font-semibold text-purple-600">$22,504</p>
                      <p className="text-xs text-gray-500">3.6% of revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Major Expenditures</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Educational Staff: $480,839 (76.3% of expenses)</li>
                  <li>• Technology & Systems: $98,099 (15.6% of expenses)</li>
                  <li>• Professional Services: $14,265 (2.3% of expenses)</li>
                  <li>• Professional Development: $8,996 (1.4% of expenses)</li>
                  <li>• Other Operating Expenses: $27,747 (4.4% of expenses)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Management Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Resource Management</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Financial Controls</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Implementation of Xero accounting system</li>
                  <li>• Enhanced transaction documentation</li>
                  <li>• Regular financial reconciliation</li>
                  <li>• Multi-level approval processes</li>
                  <li>• Transparent expense tracking</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Investment Priorities</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Enhanced learning management system</li>
                  <li>• Staff professional development</li>
                  <li>• Technology infrastructure upgrades</li>
                  <li>• Student support systems</li>
                  <li>• Communication platform improvements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Accountability Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Accountability & Compliance</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Oversight Measures</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Monthly financial reviews</li>
                  <li>• Regular board meetings</li>
                  <li>• Annual independent audit</li>
                  <li>• Alberta Education compliance</li>
                  <li>• Transparent reporting practices</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Strategic Governance</h5>
                <p className="text-sm text-gray-600">
                  Our governance structure ensures alignment between operational decisions and strategic goals, 
                  with regular review and adjustment of policies to maintain educational excellence and 
                  fiscal responsibility.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Statement Link */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Financial Documentation</h4>
          <p className="text-sm text-gray-600">
            For detailed financial information, please view our complete audited financial statements:
          </p>
          <a 
            href="https://rtdacademy.sharepoint.com/:f:/s/RTDMathAcademy/Ep-6WVc_xu5PjrvcgB76gGYBUxrF3BHnY015dg_U6Dv0Ag?e=wGP8Lp" 
            className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
            target="_blank" 
            rel="noopener noreferrer"
          >
            View Audited Financial Statements 2023-24
          </a>
        </div>
      </Card>
    </div>
  );
};

export default GovernanceDomain;