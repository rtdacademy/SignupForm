import React from 'react';
import { Card } from "../../../../components/ui/card";

const PlanAlignment = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Education Plan Alignment</h3>
        
        {/* Overview Section */}
        <div className="mb-8 bg-blue-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-blue-900 mb-3">Plan Implementation Overview</h4>
          <div className="prose max-w-none text-gray-600 space-y-4">
            <p>
              Our 2023-24 results demonstrate substantial progress toward the core outcomes outlined 
              in our Education Plan. With 1,294 course enrollments and an overall completion rate 
              of 77.78%, our asynchronous learning model continues to provide accessible, high-quality 
              STEM education while addressing identified areas for improvement.
            </p>
          </div>
        </div>

        {/* Outcome 1 Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Outcome 1: Student Achievement and Communication
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Key Achievements</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Communication platform rated 8.53/10</li>
                  <li>• Course material quality: 8.49/10</li>
                  <li>• Instructor support: 8.36/10</li>
                  <li>• Math 30-1 diploma results improved to 60.9%</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Strategy Effectiveness</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Weekly communication strategy showing positive results</li>
                  <li>• Individualized learning plans proving effective</li>
                  <li>• Professional development enhancing teaching quality</li>
                  <li>• Online community building fostering engagement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome 2 Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Outcome 2: Retention and Early Support
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Progress Indicators</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Overall completion rate: 77.78%</li>
                  <li>• Technology courses: 90-100% completion</li>
                  <li>• Early identification system implemented</li>
                  <li>• Support systems showing positive impact</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Areas for Enhancement</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Data analytics capabilities expansion</li>
                  <li>• Support system refinements needed</li>
                  <li>• Digital literacy program expansion</li>
                  <li>• Peer mentoring implementation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Outcome 3 Section */}
        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Outcome 3: Stakeholder Communication
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Communication Impact</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 89% student satisfaction rate</li>
                  <li>• 90% parent satisfaction rate</li>
                  <li>• Custom software successfully implemented</li>
                  <li>• Weekly reports consistently delivered</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Future Enhancements</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Interactive features development</li>
                  <li>• Expanded orientation offerings</li>
                  <li>• Advanced communication training</li>
                  <li>• Survey response rate improvement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Future Direction */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Strategic Priorities</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Immediate Focus Areas</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Mathematics 10C performance improvement</li>
                  <li>• At-risk student support enhancement</li>
                  <li>• Communication software refinement</li>
                  <li>• Parent engagement expansion</li>
                </ul>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 mb-2">Long-term Development</h5>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• AI-enhanced learning support</li>
                  <li>• Expanded course offerings</li>
                  <li>• Advanced analytics implementation</li>
                  <li>• Comprehensive student portal development</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlanAlignment;