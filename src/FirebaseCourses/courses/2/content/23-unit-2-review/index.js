import React from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const Unit2Review = ({ courseId = 'default', AIAccordion, onAIAccordionContent }) => {
  return (
    <LessonContent
      lessonId="lesson_23_unit_2_review"
      title="Unit 2 Review - Optics and Wave Properties of Light"
      metadata={{ estimated_time: '90 minutes' }}
    >
      <TextSection>
        <div className="lesson-header mb-8">
          
          <p className="text-lg text-gray-600">
            This review covers Unit 2 concepts including reflection, refraction, mirrors, lenses, and wave properties of light. 
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
                    <li>Apply laws of reflection to plane and curved mirrors</li>
                    <li>Calculate image positions and characteristics using mirror and lens equations</li>
                    <li>Apply Snell's law to refraction problems</li>
                    <li>Analyze total internal reflection and critical angles</li>
                    <li>Solve interference and diffraction problems using wave properties</li>
                    <li>Apply polarization concepts to real-world situations</li>
                  </ul>
                  
                  <div className="mt-4 p-4 bg-white rounded border border-blue-300">
                    <h3 className="font-semibold text-blue-800 mb-2">Key Skills Assessment</h3>
                    <p className="text-blue-700 text-sm mb-2">
                      By the end of this review, you should confidently be able to:
                    </p>
                    <ul className="text-blue-600 text-sm space-y-1">
                      <li>• Draw accurate ray diagrams for mirrors and lenses</li>
                      <li>• Apply sign conventions correctly for real vs virtual images</li>
                      <li>• Calculate critical angles and identify total internal reflection</li>
                      <li>• Solve double-slit and diffraction grating problems</li>
                      <li>• Determine image characteristics (size, orientation, type)</li>
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
              <li>Apply laws of reflection to plane and curved mirrors</li>
              <li>Calculate image positions and characteristics using mirror and lens equations</li>
              <li>Apply Snell's law to refraction problems</li>
              <li>Analyze total internal reflection and critical angles</li>
              <li>Solve interference and diffraction problems using wave properties</li>
              <li>Apply polarization concepts to real-world situations</li>
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
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Law of Reflection</h3>
                      <p className="text-gray-600 mb-2">θᵢ = θᵣ</p>
                      <p className="text-sm text-gray-500">Angle of incidence equals angle of reflection, measured from the normal. Both angles are measured from the perpendicular to the surface.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Critical for plane mirrors and curved mirrors | Always holds true
                      </div>
                    </div>
                    
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Snell's Law</h3>
                      <p className="text-gray-600 mb-2">n₁sin θ₁ = n₂sin θ₂</p>
                      <p className="text-sm text-gray-500">Relates angles and indices of refraction at an interface. Describes how light bends when changing media.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        n = c/v | Light bends toward normal in denser medium
                      </div>
                    </div>
                    
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Mirror/Lens Equation</h3>
                      <p className="text-gray-600 mb-2">1/f = 1/dₒ + 1/dᵢ</p>
                      <p className="text-sm text-gray-500">Relates focal length, object distance, and image distance. Universal equation for curved mirrors and thin lenses.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        f &gt; 0 for concave mirrors/converging lenses | f &lt; 0 for convex mirrors/diverging lenses
                      </div>
                    </div>
                    
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Magnification</h3>
                      <p className="text-gray-600 mb-2">M = -dᵢ/dₒ = hᵢ/hₒ</p>
                      <p className="text-sm text-gray-500">Negative for real images (inverted), positive for virtual images (upright). Tells us size and orientation.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        |M| &gt; 1: enlarged | |M| &lt; 1: reduced | Sign tells orientation
                      </div>
                    </div>
                    
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Double Slit Interference</h3>
                      <p className="text-gray-600 mb-2">dsin θ = mλ</p>
                      <p className="text-sm text-gray-500">For constructive interference (bright fringes). m = 0, ±1, ±2... for order of maximum.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Central maximum at m = 0 | Equal spacing for small angles
                      </div>
                    </div>
                    
                    <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Diffraction Grating</h3>
                      <p className="text-gray-600 mb-2">dsin θ = mλ</p>
                      <p className="text-sm text-gray-500">Where d = 1/(lines per meter) for gratings. Same formula as double slit but many more slits create sharper, brighter maxima.</p>
                      <div className="mt-2 text-xs text-gray-400">
                        More lines = sharper peaks | Disperses white light into spectra
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-2">Critical Optics Relationships</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-yellow-700">Index of Refraction:</p>
                        <p className="text-yellow-600">n = c/v (speed relationship)</p>
                      </div>
                      <div>
                        <p className="font-medium text-yellow-700">Critical Angle:</p>
                        <p className="text-yellow-600">sin θc = n₂/n₁ (for TIR)</p>
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
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Law of Reflection</h3>
                <p className="text-gray-600 mb-2">θᵢ = θᵣ</p>
                <p className="text-sm text-gray-500">Angle of incidence equals angle of reflection, measured from the normal.</p>
              </div>
              
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Snell's Law</h3>
                <p className="text-gray-600 mb-2">n₁sin θ₁ = n₂sin θ₂</p>
                <p className="text-sm text-gray-500">Relates angles and indices of refraction at an interface.</p>
              </div>
              
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Mirror Equation</h3>
                <p className="text-gray-600 mb-2">1/f = 1/dₒ + 1/dᵢ</p>
                <p className="text-sm text-gray-500">Relates focal length, object distance, and image distance.</p>
              </div>
              
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Magnification</h3>
                <p className="text-gray-600 mb-2">M = -dᵢ/dₒ = hᵢ/hₒ</p>
                <p className="text-sm text-gray-500">Negative for real images, positive for virtual images.</p>
              </div>
              
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Double Slit</h3>
                <p className="text-gray-600 mb-2">dsin θ = mλ</p>
                <p className="text-sm text-gray-500">For constructive interference (bright fringes).</p>
              </div>
              
              <div className="concept-box bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Diffraction Grating</h3>
                <p className="text-gray-600 mb-2">dsin θ = mλ</p>
                <p className="text-sm text-gray-500">Where d = 1/(lines per meter) for gratings.</p>
              </div>
            </div>
          </div>
        )}

        <div className="problem-types mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Common Problem Types</h2>
          
          <div className="space-y-4">
            <div className="problem-type bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Reflection Problems</h3>
              <p className="text-yellow-700">Plane mirrors, curved mirrors, multiple reflections, and image characteristics.</p>
            </div>
            
            <div className="problem-type bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Refraction & TIR</h3>
              <p className="text-green-700">Snell's law, critical angles, total internal reflection, and prisms.</p>
            </div>
            
            <div className="problem-type bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Mirrors & Lenses</h3>
              <p className="text-purple-700">Image formation, magnification, focal lengths, and ray diagrams.</p>
            </div>
            
            <div className="problem-type bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Wave Interference</h3>
              <p className="text-red-700">Double slits, diffraction gratings, interference patterns, and wavelength calculations.</p>
            </div>
            
            <div className="problem-type bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-800 mb-2">Polarization & Color</h3>
              <p className="text-indigo-700">Polarizing filters, color appearance, and electromagnetic radiation.</p>
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
                    <li>Always draw ray diagrams for mirror and lens problems</li>
                    <li>Remember sign conventions: real images have negative dᵢ, virtual have positive</li>
                    <li>Check if angles are measured from normal or surface</li>
                    <li>For gratings, convert lines/cm to lines/m before calculating d</li>
                    <li>Remember that n = c/v for calculating indices of refraction</li>
                    <li>Use small angle approximations when sin θ ≈ tan θ ≈ θ</li>
                    <li>Check units carefully - wavelengths often given in nm, distances in cm or m</li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-white rounded border border-green-300">
                    <h3 className="font-semibold text-green-800 mb-3">Step-by-Step Problem-Solving Strategy</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p className="font-medium text-green-700">Identify the Optics Type</p>
                          <p className="text-green-600 text-sm">Reflection, refraction, lens/mirror, or wave interference?</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <p className="font-medium text-green-700">Draw Ray Diagrams</p>
                          <p className="text-green-600 text-sm">Sketch the setup, mark focal points, and trace key rays</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <p className="font-medium text-green-700">Apply Sign Conventions</p>
                          <p className="text-green-600 text-sm">Real images: negative dᵢ, Virtual images: positive dᵢ</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          <p className="font-medium text-green-700">Solve and Verify</p>
                          <p className="text-green-600 text-sm">Use appropriate formulas, check units, verify physical reasonableness</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-yellow-100 rounded border border-yellow-300">
                    <h4 className="font-semibold text-yellow-800 mb-2">Common Mistakes to Avoid</h4>
                    <ul className="text-yellow-700 text-sm space-y-1">
                      <li>• Confusing angle measurements (from normal vs from surface)</li>
                      <li>• Wrong sign conventions for image distances</li>
                      <li>• Forgetting to convert units (nm to m, lines/cm to lines/m)</li>
                      <li>• Not drawing ray diagrams to visualize the problem</li>
                      <li>• Mixing up constructive vs destructive interference conditions</li>
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
              <li>Always draw ray diagrams for mirror and lens problems</li>
              <li>Remember sign conventions: real images have negative dᵢ, virtual have positive</li>
              <li>Check if angles are measured from normal or surface</li>
              <li>For gratings, convert lines/cm to lines/m before calculating d</li>
              <li>Remember that n = c/v for calculating indices of refraction</li>
              <li>Use small angle approximations when sin θ ≈ tan θ ≈ θ</li>
              <li>Check units carefully - wavelengths often given in nm, distances in cm or m</li>
            </ul>
          </div>
        )}
      </TextSection>

      <SlideshowKnowledgeCheck
        title="Unit 2 Review - Optics and Light Practice"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q1'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q2'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q3'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q4'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q5a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q5b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q6a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q6b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q7a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q7b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q8a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q8b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q9'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q10'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q11a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q12a'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q12b'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q13'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q14'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q15'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q16'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q17'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_23_unit2_q18'
          }
        ]}
        courseId={courseId}
        lessonPath="lesson_23_unit_2_review"
        onAIAccordionContent={onAIAccordionContent}
      />

      <LessonSummary
        points={[
          "Law of reflection: angle of incidence equals angle of reflection",
          "Snell's law relates angles and indices of refraction: n₁sin θ₁ = n₂sin θ₂",
          "Mirror and lens equation: 1/f = 1/dₒ + 1/dᵢ relates focal length and distances",
          "Magnification M = -dᵢ/dₒ determines image size and orientation",
          "Total internal reflection occurs when light goes from dense to less dense medium",
          "Constructive interference in double slits: dsin θ = mλ for bright fringes",
          "Diffraction gratings spread light into spectra using the same formula",
          "Ray diagrams are essential for solving mirror and lens problems"
        ]}
      />
    </LessonContent>
  );
};

export default Unit2Review;
