import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Alert, AlertDescription } from '../../../../../components/ui/alert';
import { Badge } from '../../../../../components/ui/badge';
import AIMultipleChoiceQuestion from '../../../../components/assessments/AIMultipleChoiceQuestion';
import AILongAnswerQuestion from '../../../../components/assessments/AILongAnswerQuestion';
import AIShortAnswerQuestion from '../../../../components/assessments/AIShortAnswerQuestion';
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';

const EconomicEnvironmentMoney = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          The Economic Environment and Your Money
        </h1>
        <p className="text-lg text-gray-600">
          Understanding how economic factors influence personal financial decisions
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
              Explain how economic indicators affect personal finances
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Understand the relationship between inflation and purchasing power
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Analyze how interest rates impact saving and borrowing decisions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Identify strategies to protect finances during economic changes
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Economic Indicators Section */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Key Economic Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Understanding the Economic Environment</h3>
            <p className="text-gray-700 leading-relaxed">
              The economy affects everyone's financial situation. Economic indicators provide insights 
              into the health of the economy and help predict changes that might impact your personal finances.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">📈 Gross Domestic Product (GDP)</h4>
              <p className="text-sm text-blue-800 mb-2">
                Measures the total value of all goods and services produced in a country
              </p>
              <p className="text-xs text-blue-700">
                <strong>Impact:</strong> Higher GDP often means more jobs and higher wages
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">📉 Unemployment Rate</h4>
              <p className="text-sm text-red-800 mb-2">
                Percentage of people actively looking for work but unable to find jobs
              </p>
              <p className="text-xs text-red-700">
                <strong>Impact:</strong> Higher unemployment can lead to reduced wages and job security
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">💰 Inflation Rate</h4>
              <p className="text-sm text-orange-800 mb-2">
                The rate at which prices for goods and services rise over time
              </p>
              <p className="text-xs text-orange-700">
                <strong>Impact:</strong> Reduces purchasing power; your money buys less over time
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">🏦 Interest Rates</h4>
              <p className="text-sm text-green-800 mb-2">
                The cost of borrowing money or the reward for saving money
              </p>
              <p className="text-xs text-green-700">
                <strong>Impact:</strong> Affects loan payments, mortgage rates, and savings returns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inflation Deep Dive */}
      <Card>
        <CardHeader>
          <CardTitle>📈 Understanding Inflation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Inflation:</strong> A general increase in prices and fall in the purchasing power of money. 
              When inflation occurs, each dollar you own buys a smaller percentage of a good or service.
            </AlertDescription>
          </Alert>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">Example: The Coffee Cup Scenario</h4>
            <div className="text-sm text-amber-800">
              <p className="mb-2">If a coffee costs $2.00 today and inflation is 3% annually:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Year 1: $2.00</li>
                <li>Year 2: $2.06</li>
                <li>Year 3: $2.12</li>
                <li>Year 5: $2.25</li>
                <li>Year 10: $2.69</li>
              </ul>
              <p className="mt-2 font-medium">Your $2.00 from today won't buy that same coffee in 10 years!</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Types of Inflation:</h4>
            <div className="space-y-3">
              <div className="border border-gray-200 p-3 rounded">
                <h5 className="font-medium text-blue-900">Demand-Pull Inflation</h5>
                <p className="text-sm text-gray-600">Occurs when demand for goods exceeds supply</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <h5 className="font-medium text-red-900">Cost-Push Inflation</h5>
                <p className="text-sm text-gray-600">Results from increased costs of production</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <h5 className="font-medium text-purple-900">Built-in Inflation</h5>
                <p className="text-sm text-gray-600">Adaptive expectations that prices will continue to rise</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interest Rates Impact */}
      <Card>
        <CardHeader>
          <CardTitle>🏦 How Interest Rates Affect Your Money</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-3">When Interest Rates Rise 📈</h4>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Savings accounts earn more money</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Bonds and CDs become more attractive</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Loans become more expensive</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Credit card debt costs more</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Mortgage payments increase</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">When Interest Rates Fall 📉</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Borrowing becomes cheaper</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Good time to refinance loans</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Easier to buy homes or cars</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Savings earn less money</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-600">✗</span>
                  <span>Fixed income investments pay less</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2">Strategic Response to Interest Rate Changes</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-purple-800">
              <div>
                <p className="font-medium mb-1">High Interest Rate Environment:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Focus on paying down variable-rate debt</li>
                  <li>Take advantage of high-yield savings</li>
                  <li>Consider locking in fixed rates</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Low Interest Rate Environment:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Consider refinancing existing loans</li>
                  <li>Good time for major purchases</li>
                  <li>Look for alternative investments</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Economic Cycles */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Economic Cycles and Personal Finance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3">The Four Phases of Economic Cycles:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 border border-green-200 rounded bg-green-50">
                <h5 className="font-medium text-green-900">📈 Expansion</h5>
                <p className="text-sm text-green-800 mt-1">
                  Economic growth, job creation, rising incomes
                </p>
                <p className="text-xs text-green-700 mt-2">
                  <strong>Your Strategy:</strong> Build emergency fund, invest in growth
                </p>
              </div>
              
              <div className="p-3 border border-orange-200 rounded bg-orange-50">
                <h5 className="font-medium text-orange-900">⚡ Peak</h5>
                <p className="text-sm text-orange-800 mt-1">
                  Maximum economic activity, full employment
                </p>
                <p className="text-xs text-orange-700 mt-2">
                  <strong>Your Strategy:</strong> Prepare for downturn, reduce debt
                </p>
              </div>

              <div className="p-3 border border-red-200 rounded bg-red-50">
                <h5 className="font-medium text-red-900">📉 Contraction/Recession</h5>
                <p className="text-sm text-red-800 mt-1">
                  Economic decline, job losses, reduced spending
                </p>
                <p className="text-xs text-red-700 mt-2">
                  <strong>Your Strategy:</strong> Preserve cash, avoid major purchases
                </p>
              </div>

              <div className="p-3 border border-blue-200 rounded bg-blue-50">
                <h5 className="font-medium text-blue-900">🌱 Trough</h5>
                <p className="text-sm text-blue-800 mt-1">
                  Economic low point, beginning of recovery
                </p>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>Your Strategy:</strong> Look for opportunities, careful investments
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question 1 */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Question 1: Economic Indicators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Test your understanding of key economic indicators and their impact.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_02_economic_environment_question1
              </Badge>
            </div>
          )}

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="course3_02_economic_environment_question1"
            cloudFunctionName="course3_02_economic_environment_question1"
            course={course}
            topic="Economic Indicators and Personal Finance"
            title="Economic Indicators and Personal Finance"
            theme="blue"
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

      {/* Question 2 */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Question 2: Inflation Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Apply your knowledge of inflation and purchasing power.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_02_economic_environment_question2
              </Badge>
            </div>
          )}

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="course3_02_economic_environment_question2"
            cloudFunctionName="course3_02_economic_environment_question2"
            course={course}
            topic="Inflation and Purchasing Power"
            title="Inflation and Purchasing Power"
            theme="amber"
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

      {/* Question 3 */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Question 3: Interest Rate Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Test your understanding of how to respond to interest rate changes.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_02_economic_environment_question3
              </Badge>
            </div>
          )}

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="course3_02_economic_environment_question3"
            cloudFunctionName="course3_02_economic_environment_question3"
            course={course}
            topic="Interest Rate Strategy and Financial Planning"
            title="Interest Rate Strategy and Financial Planning"
            theme="green"
            onCorrectAnswer={() => {
              console.log('Question 3: Correct answer!');
            }}
            onAttempt={(isCorrect) => {
              console.log('Question 3: Attempt made:', isCorrect);
            }}
            onComplete={() => {
              console.log('Question 3: Assessment completed');
            }}
          />
        </CardContent>
      </Card>

      {/* Question 4 */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Question 4: Economic Cycles and Strategy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Test your understanding of economic cycles and appropriate financial strategies for each phase.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_02_economic_environment_question4
              </Badge>
            </div>
          )}

          <StandardMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="course3_02_economic_environment_question4"
            cloudFunctionName="course3_02_economic_environment_question4"
            course={course}
            topic="Economic Cycles and Financial Strategy"
            title="Economic Cycles and Financial Strategy"
            theme="purple"
            onCorrectAnswer={() => {
              console.log('Question 4: Correct answer!');
            }}
            onAttempt={(isCorrect) => {
              console.log('Question 4: Attempt made:', isCorrect);
            }}
            onComplete={() => {
              console.log('Question 4: Assessment completed');
            }}
          />
        </CardContent>
      </Card>

      {/* Question 5: Long Answer Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Question 5: Economic Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Apply your understanding of economic concepts to analyze a real-world scenario.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_02_economic_environment_longAnswer
              </Badge>
            </div>
          )}

          <AILongAnswerQuestion
            courseId={courseId}
            assessmentId="course3_02_economic_environment_longAnswer"
            cloudFunctionName="course3_02_economic_environment_longAnswer"
            topic="Economic Environment and Personal Finance"
            theme="purple"
            onCorrectAnswer={() => {
              console.log('Question 5: Successful completion!');
            }}
            onAttempt={(isCorrect) => {
              console.log('Question 5: Attempt made:', isCorrect);
            }}
            onComplete={() => {
              console.log('Question 5: Assessment completed');
            }}
          />
        </CardContent>
      </Card>

      {/* Question 6: Economic Decision Making Short Answer */}
      <Card>
        <CardHeader>
          <CardTitle>💭 Question 6: Economic Decision Making</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Apply your knowledge of economic concepts to real-world personal finance situations.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course3_02_economic_environment_shortAnswer
              </Badge>
            </div>
          )}

          <AIShortAnswerQuestion
            cloudFunctionName="course3_02_economic_environment_shortAnswer"
            courseId={courseId}
            assessmentId="course3_02_economic_environment_shortAnswer"
            topic="Economic Decision Making"
            theme="green"
            onComplete={() => {
              console.log('Question 6: Assessment completed');
            }}
            onAttempt={(isCorrect) => {
              console.log('Question 6: Attempt made:', isCorrect);
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
                <li>• Economic indicators affect personal finances</li>
                <li>• Inflation reduces purchasing power over time</li>
                <li>• Interest rates impact saving and borrowing</li>
                <li>• Economic cycles create opportunities and risks</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Monitor economic indicators regularly</li>
                <li>• Adjust financial strategies to economic conditions</li>
                <li>• Learn about financial resources and tools</li>
                <li>• Develop inflation-protection strategies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EconomicEnvironmentMoney;