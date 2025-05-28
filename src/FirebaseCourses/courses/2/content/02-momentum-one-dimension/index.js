import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Alert, AlertDescription } from '../../../../../components/ui/alert';
import { Badge } from '../../../../../components/ui/badge';
import AIMultipleChoiceQuestion from '../../../../components/assessments/AIMultipleChoiceQuestion';

const MomentumOneDimension = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Momentum in One Dimension
        </h1>
        <p className="text-lg text-gray-600">
          Understanding momentum and its conservation in linear motion
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary">Physics 30</Badge>
          <Badge variant="outline">Unit 1: Momentum & Impulse</Badge>
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
              Define momentum and identify its units (kg·m/s)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Calculate momentum using the formula p = mv
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Apply conservation of momentum to simple collisions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              Analyze the relationship between impulse and momentum change
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Theory Section */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Momentum Theory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">What is Momentum?</h3>
            <p className="text-gray-700 leading-relaxed">
              Momentum is a vector quantity that describes the motion of an object. It depends on both 
              the object's mass and velocity. The more massive an object or the faster it moves, 
              the greater its momentum.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Momentum Formula</h4>
            <div className="text-center">
              <p className="text-2xl font-mono font-bold text-blue-800">p = mv</p>
              <p className="text-sm text-blue-700 mt-2">
                where p = momentum (kg·m/s), m = mass (kg), v = velocity (m/s)
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Key Properties of Momentum:</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Momentum is a vector quantity (has both magnitude and direction)</li>
              <li>Units: kilogram-meters per second (kg·m/s)</li>
              <li>Momentum can be positive or negative depending on direction</li>
              <li>Total momentum of a system is conserved in the absence of external forces</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Examples & Applications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Example 1: Car Momentum</h4>
              <p className="text-sm text-green-800">
                A 1200 kg car traveling at 25 m/s<br/>
                p = mv = 1200 kg × 25 m/s = <strong>30,000 kg·m/s</strong>
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">Example 2: Baseball</h4>
              <p className="text-sm text-purple-800">
                A 0.15 kg baseball thrown at 40 m/s<br/>
                p = mv = 0.15 kg × 40 m/s = <strong>6 kg·m/s</strong>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Real-World Applications:</h4>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div>🚗 <strong>Vehicle Safety:</strong> Crumple zones increase collision time, reducing force</div>
              <div>🏈 <strong>Sports:</strong> Football tackles demonstrate momentum transfer</div>
              <div>🚀 <strong>Space Travel:</strong> Rocket propulsion uses conservation of momentum</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conservation of Momentum */}
      <Card>
        <CardHeader>
          <CardTitle>⚖️ Conservation of Momentum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Law of Conservation of Momentum:</strong> In a closed system with no external forces, 
              the total momentum before an interaction equals the total momentum after the interaction.
            </AlertDescription>
          </Alert>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-2">Mathematical Expression</h4>
            <div className="text-center">
              <p className="text-xl font-mono font-bold text-orange-800">p₁ᵢ + p₂ᵢ = p₁f + p₂f</p>
              <p className="text-sm text-orange-700 mt-2">
                Initial momentum of object 1 + Initial momentum of object 2 = 
                Final momentum of object 1 + Final momentum of object 2
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Types of Collisions:</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-3 rounded">
                <h5 className="font-medium text-blue-900">Elastic Collision</h5>
                <p className="text-sm text-gray-600">Both momentum and kinetic energy are conserved</p>
              </div>
              <div className="border border-gray-200 p-3 rounded">
                <h5 className="font-medium text-red-900">Inelastic Collision</h5>
                <p className="text-sm text-gray-600">Momentum is conserved, but kinetic energy is not</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Section */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Practice with AI-Generated Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Test your understanding with AI-generated momentum problems. Each question is tailored 
            to your learning level and provides detailed explanations.
          </p>

          {devMode && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                Function: course2_02_momentum_one_dimension_aiQuestion
              </Badge>
            </div>
          )}

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="momentum_1d_lesson_practice"
            cloudFunctionName="course2_02_momentum_one_dimension_aiQuestion"
            course={course}
            topic="Momentum in One Dimension"
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
                <li>• Momentum = mass × velocity</li>
                <li>• Units are kg·m/s</li>
                <li>• Momentum is conserved in collisions</li>
                <li>• Direction matters (vector quantity)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Practice calculation problems</li>
                <li>• Study momentum in 2D (next lesson)</li>
                <li>• Explore impulse-momentum theorem</li>
                <li>• Complete the unit assignment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MomentumOneDimension;