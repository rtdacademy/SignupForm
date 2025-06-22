import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import StandardMultipleChoiceQuestion from '../../../../components/assessments/StandardMultipleChoiceQuestion';

const BudgetingPersonalPlanning = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Budgeting and Personal Planning
        </h1>
        <p className="text-lg text-gray-600">
          Creating and managing personal budgets and financial plans
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">Financial Literacy</Badge>
          <Badge variant="outline">Lesson 4</Badge>
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
              Learn budget creation techniques
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Develop personal planning strategies
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Set and achieve financial goals
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Budgeting Fundamentals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            A budget is a plan for how you will spend your money over a specific period. 
            It helps you track income and expenses while working toward your financial goals.
          </p>
        </CardContent>
      </Card>

      {/* Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Assessment: Budgeting and Personal Planning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_04_budgeting_assessment
              </Badge>
            </div>
          )}

          <StandardMultipleChoiceQuestion
            courseId={courseId}
            cloudFunctionName="course3_04_budgeting_assessment"
            title="Lesson 4: Budgeting and Personal Planning"
            theme="green"
            onAttempt={(isCorrect) => {
              console.log('Budgeting assessment attempt:', isCorrect);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetingPersonalPlanning;