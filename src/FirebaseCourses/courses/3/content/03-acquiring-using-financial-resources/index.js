import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import StandardMultipleChoiceQuestion from '../../../../components/assessments/StandardMultipleChoiceQuestion';

const AcquiringUsingFinancialResources = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Acquiring and Using Financial Resources
        </h1>
        <p className="text-lg text-gray-600">
          Understanding different types of financial resources and how to use them effectively
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">Financial Literacy</Badge>
          <Badge variant="outline">Lesson 3</Badge>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Identify different types of financial resources
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Develop resource acquisition strategies
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Learn effective resource usage techniques
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Types of Financial Resources */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Types of Financial Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💵 Personal Income</h4>
              <p className="text-sm text-blue-700">Employment, self-employment, investments</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">🏦 Credit & Loans</h4>
              <p className="text-sm text-green-700">Credit cards, personal loans, mortgages</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">💸 Government Benefits</h4>
              <p className="text-sm text-purple-700">Student aid, tax credits, social programs</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">👨‍👩‍👧‍👦 Family Support</h4>
              <p className="text-sm text-orange-700">Gifts, inheritance, family assistance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Assessment: Financial Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Test your understanding of acquiring and using financial resources.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_03_financial_resources_assessment
              </Badge>
            </div>
          )}

          <StandardMultipleChoiceQuestion
            courseId={courseId}
            cloudFunctionName="course3_03_financial_resources_assessment"
            title="Lesson 3: Acquiring and Using Financial Resources"
            theme="green"
            onAttempt={(isCorrect) => {
              console.log('Financial Resources Assessment attempt:', isCorrect);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AcquiringUsingFinancialResources;