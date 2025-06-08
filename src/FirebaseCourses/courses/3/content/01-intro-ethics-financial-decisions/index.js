import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Alert, AlertDescription } from '../../../../../components/ui/alert';
import { Badge } from '../../../../../components/ui/badge';
import AIMultipleChoiceQuestion from '../../../../components/assessments/AIMultipleChoiceQuestion';

const IntroEthicsFinancialDecisions = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Introduction and Ethics in Financial Decision Making
        </h1>
        <p className="text-lg text-gray-600">
          Exploring ethical considerations and foundational concepts in personal finance
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">Financial Literacy</Badge>
          <Badge variant="outline">Unit 1: Financial Fundamentals</Badge>
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
              Define financial literacy and its importance in personal life
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Identify key ethical principles in financial decision-making
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Recognize common ethical dilemmas in personal finance
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Apply ethical frameworks to financial scenarios
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Financial Literacy Basics */}
      <Card>
        <CardHeader>
          <CardTitle>📚 What is Financial Literacy?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Definition</h3>
            <p className="text-gray-700 leading-relaxed">
              Financial literacy is the ability to understand and effectively use various financial skills, 
              including personal financial management, budgeting, and investing. It encompasses the knowledge 
              and skills needed to make informed and effective decisions with all of your financial resources.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Core Components of Financial Literacy</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <p className="font-medium text-blue-800">💰 Budgeting & Planning</p>
                <p className="text-sm text-blue-700">Managing income and expenses</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">📈 Investing</p>
                <p className="text-sm text-blue-700">Growing wealth over time</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">🏦 Banking</p>
                <p className="text-sm text-blue-700">Managing accounts and credit</p>
              </div>
              <div>
                <p className="font-medium text-blue-800">🛡️ Risk Management</p>
                <p className="text-sm text-blue-700">Insurance and protection</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question 1 */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Question 1: Financial Literacy Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Test your understanding of financial literacy fundamentals.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_01_intro_ethics_financial_decisions_aiQuestion
              </Badge>
            </div>
          )}

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="course3_01_intro_ethics_financial_decisions_question1"
            cloudFunctionName="course3_01_intro_ethics_financial_decisions_aiQuestion"
            course={course}
            topic="Financial Literacy Fundamentals"
            theme="green"
            onCorrectAnswer={() => {
              console.log('Question 1: Correct answer!');
            }}
            onAttempt={(isCorrect) => {
              console.log('Question 1: Attempt made:', isCorrect);
            }}
            onComplete={() => {
              console.log('Question 1: Assessment completed');
            }}
          />
        </CardContent>
      </Card>

      {/* Ethics Section */}
      <Card>
        <CardHeader>
          <CardTitle>⚖️ Ethics in Financial Decision Making</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Financial Ethics:</strong> The moral principles that guide our financial decisions 
              and behaviors, considering not just personal benefit but also the impact on others and society.
            </AlertDescription>
          </Alert>

          <div>
            <h4 className="font-semibold mb-3">Key Ethical Principles:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-900 mb-2">🤝 Honesty & Integrity</h5>
                <p className="text-sm text-green-800">
                  Being truthful in financial dealings, avoiding fraud, and keeping commitments
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h5 className="font-semibold text-purple-900 mb-2">⚖️ Fairness</h5>
                <p className="text-sm text-purple-800">
                  Considering the rights and interests of all parties affected by financial decisions
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h5 className="font-semibold text-orange-900 mb-2">🎯 Responsibility</h5>
                <p className="text-sm text-orange-800">
                  Taking accountability for financial decisions and their consequences
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-900 mb-2">🔍 Transparency</h5>
                <p className="text-sm text-blue-800">
                  Being open and clear about financial information and intentions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question 2 */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Question 2: Ethical Decision Making</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Apply ethical principles to real-world financial scenarios.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_01_intro_ethics_financial_decisions_aiQuestion
              </Badge>
            </div>
          )}

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="course3_01_intro_ethics_financial_decisions_question2"
            cloudFunctionName="course3_01_intro_ethics_financial_decisions_aiQuestion"
            course={course}
            topic="Financial Ethics and Decision Making"
            theme="purple"
            onCorrectAnswer={() => {
              console.log('Question 2: Correct answer!');
            }}
            onAttempt={(isCorrect) => {
              console.log('Question 2: Attempt made:', isCorrect);
            }}
            onComplete={() => {
              console.log('Question 2: Assessment completed');
            }}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Remember:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Financial literacy empowers better decisions</li>
                <li>• Ethics guide responsible financial behavior</li>
                <li>• Consider all stakeholders in financial choices</li>
                <li>• Use frameworks for complex decisions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Reflect on your financial values</li>
                <li>• Practice ethical decision-making</li>
                <li>• Learn about economic environments</li>
                <li>• Begin developing financial goals</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntroEthicsFinancialDecisions;