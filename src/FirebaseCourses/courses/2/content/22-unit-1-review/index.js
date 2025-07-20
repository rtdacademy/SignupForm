import React from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const Unit1Review = ({ courseId = 'default', AIAccordion, onAIAccordionContent }) => {
  return (
    <LessonContent
      lessonId="lesson_22_unit_1_review"
      title="Unit 1 Review - Momentum and Impulse"
      metadata={{ estimated_time: '90 minutes' }}
    >
      <TextSection>
        <div className="lesson-header mb-8">
          
          <p className="text-lg text-gray-600">
            This review covers Unit 1 concepts including momentum conservation, collisions, and impulse. 
            Use this content to reinforce your understanding before the exam.
          </p>
        </div>

        {/* AI-Enhanced Content Sections */}
        {AIAccordion ? (
          <div className="my-8">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item value="review-objectives" title="Review Objectives and Learning Outcomes" onAskAI={onAIAccordionContent}>
                <div className="review-objectives bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4">What You Should Master</h2>
                  <ul className="list-disc list-inside space-y-2 text-blue-700">
                    <li>Apply conservation of momentum to various collision scenarios</li>
                    <li>Calculate impulse and relate it to changes in momentum</li>
                    <li>Analyze elastic and inelastic collisions in one and two dimensions</li>
                    <li>Solve complex momentum problems involving multiple objects</li>
                    <li>Apply momentum concepts to real-world situations</li>
                  </ul>
                  
                  <div className="mt-4 p-4 bg-white rounded border border-blue-300">
                    <h3 className="font-semibold text-blue-800 mb-2">Key Skills Assessment</h3>
                    <p className="text-blue-700 text-sm mb-2">
                      By the end of this review, you should confidently be able to:
                    </p>
                    <ul className="text-blue-600 text-sm space-y-1">
                      <li>• Set up momentum conservation equations for any collision type</li>
                      <li>• Distinguish between elastic and inelastic collisions</li>
                      <li>• Apply impulse-momentum theorem to force-time problems</li>
                      <li>• Break 2D collision problems into x and y components</li>
                      <li>• Analyze explosion problems starting from zero momentum</li>
                    </ul>
                  </div>
                </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          <div className="review-objectives bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Review Objectives</h2>
            <ul className="list-disc list-inside space-y-2 text-blue-700">
              <li>Apply conservation of momentum to various collision scenarios</li>
              <li>Calculate impulse and relate it to changes in momentum</li>
              <li>Analyze elastic and inelastic collisions in one and two dimensions</li>
              <li>Solve complex momentum problems involving multiple objects</li>
              <li>Apply momentum concepts to real-world situations</li>
            </ul>
          </div>
        )}

        {/* Key Concepts Section */}
        {AIAccordion ? (
          <div className="my-8">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item value="key-concepts" title="Essential Formulas and Key Concepts" onAskAI={onAIAccordionContent}>
                <div className="key-concepts">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Concepts to Remember</h2>
                  
                  <div className="concept-boxes grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Momentum</h3>
                      <p className="text-gray-600 mb-2">p = mv</p>
                      <p className="text-sm text-gray-500">Momentum is mass times velocity. It's a vector quantity that depends on both how much stuff is moving (mass) and how fast it's moving (velocity).</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Units: kg⋅m/s | Direction matters!
                      </div>
                    </div>
                    
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Impulse</h3>
                      <p className="text-gray-600 mb-2">J = FΔt = Δp</p>
                      <p className="text-sm text-gray-500">Impulse equals force times time, and equals change in momentum. This connects forces to momentum changes.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Units: N⋅s = kg⋅m/s | Same as momentum units!
                      </div>
                    </div>
                    
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Conservation of Momentum</h3>
                      <p className="text-gray-600 mb-2">p₁ᵢ + p₂ᵢ = p₁f + p₂f</p>
                      <p className="text-sm text-gray-500">Total momentum before equals total momentum after. This is your most powerful problem-solving tool.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Works in ALL isolated systems | No external forces
                      </div>
                    </div>
                    
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Elastic vs Inelastic</h3>
                      <p className="text-gray-600 mb-2">Elastic: KE conserved</p>
                      <p className="text-gray-600 mb-2">Inelastic: KE not conserved</p>
                      <p className="text-sm text-gray-500">Momentum is always conserved in collisions, but kinetic energy is only conserved in elastic collisions.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Perfect elastic: billiard balls | Perfectly inelastic: objects stick together
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-2">Quick Reference - Problem Types</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-yellow-700">Before → After Problems:</p>
                        <p className="text-yellow-600">Use p₁ᵢ + p₂ᵢ = p₁f + p₂f</p>
                      </div>
                      <div>
                        <p className="font-medium text-yellow-700">Force × Time Problems:</p>
                        <p className="text-yellow-600">Use J = FΔt = Δp</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          <div className="key-concepts mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Concepts to Remember</h2>
            
            <div className="concept-boxes grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Momentum</h3>
                <p className="text-gray-600 mb-2">p = mv</p>
                <p className="text-sm text-gray-500">Momentum is mass times velocity. It's a vector quantity.</p>
              </div>
              
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Impulse</h3>
                <p className="text-gray-600 mb-2">J = FΔt = Δp</p>
                <p className="text-sm text-gray-500">Impulse equals force times time, and equals change in momentum.</p>
              </div>
              
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Conservation of Momentum</h3>
                <p className="text-gray-600 mb-2">p₁ᵢ + p₂ᵢ = p₁f + p₂f</p>
                <p className="text-sm text-gray-500">Total momentum before equals total momentum after.</p>
              </div>
              
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Elastic vs Inelastic</h3>
                <p className="text-gray-600 mb-2">Elastic: KE conserved</p>
                <p className="text-gray-600 mb-2">Inelastic: KE not conserved</p>
                <p className="text-sm text-gray-500">Momentum is always conserved in collisions.</p>
              </div>
            </div>
          </div>
        )}

        <div className="problem-types mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Common Problem Types</h2>
          
          <div className="space-y-4">
            <div className="problem-type bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">1D Collisions</h3>
              <p className="text-yellow-700">Objects moving along a straight line before and after collision.</p>
            </div>
            
            <div className="problem-type bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">2D Collisions</h3>
              <p className="text-green-700">Objects moving in a plane - requires vector analysis.</p>
            </div>
            
            <div className="problem-type bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Explosions</h3>
              <p className="text-purple-700">Objects initially at rest that separate - momentum starts at zero.</p>
            </div>
            
            <div className="problem-type bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Impulse Applications</h3>
              <p className="text-red-700">Force over time problems - sports, impacts, continuous forces.</p>
            </div>
          </div>
        </div>

        {/* Exam Tips Section */}
        {AIAccordion ? (
          <div className="my-8">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item value="exam-tips" title="Exam Success Tips and Problem-Solving Strategy" onAskAI={onAIAccordionContent}>
                <div className="exam-tips bg-green-50 p-6 rounded-lg border border-green-200">
                  <h2 className="text-xl font-semibold text-green-800 mb-4">Exam Success Tips</h2>
                  <ul className="list-disc list-inside space-y-2 text-green-700">
                    <li>Always define your coordinate system and positive directions</li>
                    <li>Draw before and after diagrams for collision problems</li>
                    <li>Remember that momentum is a vector - consider direction</li>
                    <li>Check if energy is conserved (elastic) or not (inelastic)</li>
                    <li>Use conservation of momentum as your primary tool</li>
                    <li>Break 2D problems into x and y components</li>
                    <li>Pay attention to units and significant figures</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-white rounded border border-green-300">
                    <h3 className="font-semibold text-green-800 mb-3">Step-by-Step Problem-Solving Strategy</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p className="font-medium text-green-700">Identify the System</p>
                          <p className="text-green-600 text-sm">What objects are involved? Are there external forces?</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <p className="font-medium text-green-700">Draw and Define</p>
                          <p className="text-green-600 text-sm">Sketch before/after, choose coordinate system, define positive directions</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <p className="font-medium text-green-700">Apply Conservation Laws</p>
                          <p className="text-green-600 text-sm">Momentum always conserved; energy only in elastic collisions</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          <p className="font-medium text-green-700">Solve and Check</p>
                          <p className="text-green-600 text-sm">Solve algebraically first, then substitute numbers. Check units and reasonableness</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
                    <h4 className="font-semibold text-yellow-800 mb-2">Common Mistakes to Avoid</h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Forgetting that momentum is a vector (direction matters!)</li>
                      <li>• Using energy conservation in inelastic collisions</li>
                      <li>• Not breaking 2D problems into components</li>
                      <li>• Mixing up before and after velocities</li>
                      <li>• Forgetting to check if your answer makes physical sense</li>
                    </ul>
                  </div>
                </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          <div className="exam-tips bg-green-50 p-6 rounded-lg border border-green-200 mb-8">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Exam Success Tips</h2>
            <ul className="list-disc list-inside space-y-2 text-green-700">
              <li>Always define your coordinate system and positive directions</li>
              <li>Draw before and after diagrams for collision problems</li>
              <li>Remember that momentum is a vector - consider direction</li>
              <li>Check if energy is conserved (elastic) or not (inelastic)</li>
              <li>Use conservation of momentum as your primary tool</li>
              <li>Break 2D problems into x and y components</li>
              <li>Pay attention to units and significant figures</li>
            </ul>
          </div>
        )}
      </TextSection>

      <SlideshowKnowledgeCheck
        title="Unit 1 Review - Momentum and Impulse Practice"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q1a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q1b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q2'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q3a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q3b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q4a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q4b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q5'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q6'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q7'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q8'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q9a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q9b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q10'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q11'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q12'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q13a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q13b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q14'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q15'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q16'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_22_unit1_q17'
          }
        ]}
        courseId={courseId}
        lessonPath="lesson_22_unit_1_review"
        onAIAccordionContent={onAIAccordionContent}
      />

      <LessonSummary
        points={[
          "Momentum p = mv is conserved in all collisions and explosions",
          "Impulse J = FΔt = Δp connects force, time, and momentum change",
          "Conservation of momentum: total momentum before = total momentum after",
          "Elastic collisions conserve both momentum and kinetic energy",
          "Inelastic collisions conserve momentum but not kinetic energy",
          "2D problems require vector analysis using x and y components",
          "Explosions start with zero total momentum",
          "Problem-solving strategy: define coordinates, draw diagrams, apply conservation laws"
        ]}
      />
    </LessonContent>
  );
};

export default Unit1Review;