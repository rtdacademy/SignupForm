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

      {/* Theory Section */}
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

          <div>
            <h4 className="font-semibold mb-2">Why Financial Literacy Matters:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Helps avoid financial mistakes and debt traps</li>
              <li>Enables better long-term financial planning</li>
              <li>Improves quality of life and reduces financial stress</li>
              <li>Builds confidence in financial decision-making</li>
              <li>Protects against financial fraud and scams</li>
            </ul>
          </div>
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

          <div>
            <h4 className="font-semibold mb-2">Common Ethical Dilemmas:</h4>
            <div className="space-y-3">
              <div className="border border-gray-200 p-3 rounded">
                <h5 className="font-medium text-red-900">Credit and Debt</h5>
                <p className="text-sm text-gray-600">Taking on debt you cannot afford vs. meeting immediate needs</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <h5 className="font-medium text-red-900">Investment Choices</h5>
                <p className="text-sm text-gray-600">Investing in companies that may harm society vs. maximizing returns</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <h5 className="font-medium text-red-900">Tax Obligations</h5>
                <p className="text-sm text-gray-600">Minimizing taxes legally vs. contributing to public services</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practical Applications */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Real-World Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">Ethical Financial Decision Framework:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                <p><strong>Identify the Issue:</strong> What financial decision needs to be made?</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                <p><strong>Consider All Stakeholders:</strong> Who will be affected by this decision?</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                <p><strong>Apply Ethical Principles:</strong> What do honesty, fairness, and responsibility suggest?</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
                <p><strong>Evaluate Consequences:</strong> What are the short and long-term impacts?</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">5</span>
                <p><strong>Make and Review:</strong> Decide and learn from the outcome</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-green-50 rounded">
              <div>🏠 <strong>Home Buying:</strong> Considering affordability vs. desired features</div>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <div>🎓 <strong>Education Loans:</strong> Balancing education goals with debt burden</div>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <div>💳 <strong>Credit Cards:</strong> Managing convenience vs. debt risk</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Section */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Test Your Understanding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Apply what you've learned about financial ethics with this AI-generated scenario-based question.
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
            assessmentId="ethics_intro_practice"
            cloudFunctionName="course3_01_intro_ethics_financial_decisions_aiQuestion"
            course={course}
            topic="Ethics in Financial Decision Making"
            theme="green"
            onCorrectAnswer={() => {
              console.log('Correct answer!');
            }}
            onAttempt={(isCorrect) => {
              console.log('Attempt made:', isCorrect);
            }}
            onComplete={() => {
              console.log('Assessment completed');
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