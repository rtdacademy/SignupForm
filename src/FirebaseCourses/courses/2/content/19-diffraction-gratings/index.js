import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const DiffractionGratings = ({ course, courseId = '2', onPrepopulateMessage, createAskAIButton, createAskAIButtonFromElement,
AIAccordion, onAIAccordionContent }) => {
  // Note: Manual dropdown states removed - now using AIAccordion
  
  // Animation states for Poisson's bright spot
  const [showWaves, setShowWaves] = useState(true);
  const [showInterference, setShowInterference] = useState(true);
  const [animationTime, setAnimationTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [diskSize, setDiskSize] = useState(30); // radius of disk
  
  // Animation effect
  React.useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationTime(prev => prev + 0.1);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <LessonContent
      lessonId="lesson_19_diffraction_gratings"
      title="Lesson 12 - Diffraction Gratings"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection>
        {/* AI-Enhanced Content Sections */}
        {AIAccordion ? (
          <div className="my-8">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item
                value="poisson-spot"
                title="Poisson's Bright Spot"
                theme="purple"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  Thomas Young published the results from his double-slit experiment in 
                  1807 which put the wave theory of light on a firm footing. However, 
                  Newton's reputation and his corpuscular theory of light that Young had 
                  challenged was accepted until more than ten years later when, in 1819, 
                  Augustin Fresnel presented to the French Academy a wave theory of light 
                  that predicted interference and diffraction effects. (Refer to Pearson pages 691 to 692.)
                </p>
                
                <p className="text-gray-700 mb-4">
                  Almost immediately after Fresnel introduced his wave theory, Simeon 
                  Poisson (1781–1840) pointed out what appeared as a counter-intuitive 
                  inference: that according to Fresnel's wave theory, if light from a point 
                  source were to fall on a solid disk, then light diffracted around the edges 
                  should constructively interfere at the center of the shadow. In other words, 
                  a bright spot should appear in the center of the shadow. That prediction 
                  seemed very unlikely. After attempting the experiment and failing to 
                  demonstrate the existence of a bright spot, Poisson claimed that he had 
                  refuted Fresnel's theory.
                </p>
                
                <p className="text-gray-700 mb-4">
                  But when the experiment was redone by François Arago in 1818, the bright 
                  spot was seen at the very center of the shadow! This was strong evidence 
                  for the wave theory and it was ironically referred to as Poisson's Bright Spot. 
                  To the right is a photograph of the shadow cast by a coin using a (nearly) 
                  point source of light (a laser in this case). The bright spot is clearly visible 
                  at the center. Note that there are also bright and dark fringes beyond the 
                  shadow. These resemble the interference fringes of a double slit. Indeed, 
                  they are due to interference of waves diffracted around different parts of 
                  the disk, and the whole is referred to as a diffraction pattern.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">Historical Significance:</h4>
                  <p className="text-green-900 text-sm">
                    Poisson's bright spot provided crucial evidence for the wave theory of light. 
                    What was intended as a criticism of Fresnel's theory became one of its strongest 
                    confirmations, demonstrating the power of wave interference and diffraction effects.
                  </p>
                </div>
                
                {/* Poisson's Bright Spot Video Demonstration */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h5 className="text-center font-semibold text-gray-800 mb-4">Poisson's Bright Spot - Experimental Demonstration</h5>
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <iframe 
                      width="560" 
                      height="315" 
                      src="https://www.youtube.com/embed/TM9alPcOMcU?si=iArsu5UlN6yoegnh" 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      referrerPolicy="strict-origin-when-cross-origin" 
                      allowFullScreen
                      className="w-full h-full rounded"
                    ></iframe>
                  </div>
                  <p className="text-sm text-gray-700 text-center">
                    See Poisson's bright spot in action! This video shows the actual experimental setup and results 
                    that confirmed Fresnel's wave theory and revolutionized our understanding of light.
                  </p>
                </div>
                
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="diffraction-gratings"
                title="Diffraction Gratings"
                theme="blue"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  A large number of equally spaced parallel slits is called a diffraction grating. (Refer to 
                  Pearson pages 692 to 694.) Gratings are often made by ruling very fine lines on glass 
                  with a diamond tip. The spaces in between the lines serve as slits. Gratings containing 
                  more than 10,000 slits per centimetre are common today.
                </p>
                
                <p className="text-gray-700 mb-4">
                  A double slit apparatus produces an interference pattern where the fringes tend to be 
                  broad and relatively undefined. Diffraction gratings produce very sharp and well defined 
                  bright fringes and dark fringes. Check out the video clip called P30 L12 Diffraction 
                  interference in D2L. The video shows how different colours (i.e. wavelengths) of light 
                  are diffracted by different amounts.
                </p>
                
                <p className="text-gray-700 mb-4">
                  A similar derivation like the one demonstrated for the double slit apparatus in Lesson 11 
                  produces the same equations for finding the angle and location of nodes and anti-nodes.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Diffraction Grating Equations:</h4>
                  <div className="space-y-2">
                    <div className="text-center">
                      <BlockMath math="d\sin \theta = n\lambda \quad \text{(constructive interference, } n = 1, 2, 3, \text{...)}" />
                    </div>
                    <div className="text-center">
                      <BlockMath math="d\sin \theta = (n - \frac{1}{2})\lambda \quad \text{(destructive interference, } n = 1, 2, 3, \text{...)}" />
                    </div>
                    <div className="text-center">
                      <BlockMath math="x = \frac{n\lambda L}{d} \quad \text{(constructive interference, } n = 1, 2, 3, \text{...)}" />
                    </div>
                    <div className="text-center">
                      <BlockMath math="x = \frac{(n - \frac{1}{2})\lambda L}{d} \quad \text{(destructive interference, } n = 1, 2, 3, \text{...)}" />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-blue-900 font-medium">where:</p>
                    <ul className="list-disc pl-6 text-sm text-blue-900 space-y-1 mt-2">
                      <li>λ = wavelength (m)</li>
                      <li>θ = angle from central line to fringe</li>
                      <li>n = order of fringe</li>
                      <li>L = distance from slits to screen (m)</li>
                      <li>x = distance from central bright fringe to nth fringe (m)</li>
                      <li>d = distance between slits (m)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Important Note on Slit Separation:</h4>
                  <p className="text-yellow-900 text-sm mb-3">
                    The main difference in calculating variables between double slit problems and diffraction 
                    gratings is the way that slit separation is reported for diffraction gratings. Say, for 
                    example, a diffraction grating has 5000 lines/cm. To find the distance d between the 
                    lines requires two steps:
                  </p>
                  
                  <ol className="list-decimal pl-6 space-y-3 text-sm text-yellow-900">
                    <li>
                      <span className="font-medium">Calculate the number of lines per metre:</span>
                      <div className="mt-2">
                        <BlockMath math="\frac{5000 \text{ lines}}{\text{cm}} \times \frac{100 \text{ cm}}{\text{m}} = 500,000 \frac{\text{lines}}{\text{m}}" />
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">To find d, simply invert lines/m to obtain m/line:</span>
                      <div className="mt-2">
                        <BlockMath math="d = \frac{1}{500,000 \frac{\text{lines}}{\text{m}}} = 2.0 \times 10^{-6} \text{ m}" />
                      </div>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-green-800 mb-2">Key Advantages of Diffraction Gratings:</h4>
                  <ul className="text-sm text-green-900 space-y-1">
                    <li>• Produce very sharp and well-defined bright fringes</li>
                    <li>• Create distinct separation of different wavelengths (colors)</li>
                    <li>• More precise than double slit apparatus for spectral analysis</li>
                    <li>• Can contain thousands of slits per centimeter for high resolution</li>
                  </ul>
                </div>
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="example1"
                title="Example 1 - Finding Wavelength from Angle"
                theme="green"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A monochromatic light source shines on a diffraction grating of 10,000 lines/cm and
                  produces a first order antinode 40.5° off the centre line. What is the wavelength of the
                  light?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>θ = 40.5°</li>
                        <li>n = 1</li>
                        <li>Grating: 10,000 lines/cm</li>
                        <li>λ = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 1: Calculate d</span>
                      <p className="text-sm text-gray-600 mt-1">Convert lines/cm to lines/m:</p>
                      <div className="my-3">
                        <BlockMath math="\frac{10,000 \text{ lines}}{\text{cm}} \times \frac{100 \text{ cm}}{\text{m}} = 1,000,000 \frac{\text{lines}}{\text{m}}" />
                      </div>
                      <p className="text-sm text-gray-600">Find the spacing:</p>
                      <div className="my-3">
                        <BlockMath math="d = \frac{1}{1,000,000 \frac{\text{lines}}{\text{m}}} = 1.0 \times 10^{-6} \text{ m}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Use the diffraction grating equation</span>
                      <div className="my-3">
                        <BlockMath math="d\sin \theta = n\lambda" />
                      </div>
                      <p className="text-sm text-gray-600">Solving for λ:</p>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{d\sin \theta}{n}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{1.0 \times 10^{-6} \text{ m} \times \sin(40.5°)}{1}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 1.0 \times 10^{-6} \text{ m} \times 0.649" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 6.49 \times 10^{-7} \text{ m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 649 \text{ nm}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The wavelength is <span className="font-bold">649 nm</span>
                    </p>
                  </div>
                </div>
              </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="example2"
                title="Example 2 - Finding Wavelength from Screen Position"
                theme="green"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A monochromatic light source shines on a diffraction grating of 10,000 lines/cm and
                  produces a first order antinode 65 cm off the centre line on a screen 100 cm away.
                  What is the wavelength of the light?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>x = 0.65 m</li>
                        <li>L = 1.00 m</li>
                        <li>n = 1</li>
                        <li>Grating: 10,000 lines/cm</li>
                        <li>λ = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 1: Calculate d</span>
                      <div className="my-3">
                        <BlockMath math="d = \frac{1}{1,000,000 \frac{\text{lines}}{\text{m}}} = 1.0 \times 10^{-6} \text{ m}" />
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> The requirement to use x = nλL/d requires that either θ &lt; 10° 
                        or x &lt;&lt; L. In this case x is quite large compared to L, so we must first calculate θ 
                        from the geometry and then use d sin θ = nλ.
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate the angle from geometry</span>
                      <div className="my-3">
                        <BlockMath math="\tan \theta = \frac{x}{L} = \frac{65 \text{ cm}}{100 \text{ cm}} = 0.65" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\theta = \tan^{-1}(0.65) = 33.0°" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Use the diffraction grating equation</span>
                      <div className="my-3">
                        <BlockMath math="d\sin \theta = n\lambda" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{d\sin \theta}{n}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{1.0 \times 10^{-6} \text{ m} \times \sin(33.0°)}{1}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 1.0 \times 10^{-6} \text{ m} \times 0.544" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 5.44 \times 10^{-7} \text{ m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 544 \text{ nm}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The wavelength is <span className="font-bold">544 nm</span>
                    </p>
                  </div>
                </div>
              </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          // Fallback to manual accordion if AIAccordion not available
          <div className="my-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">AIAccordion component not available. Please check the implementation.</p>
          </div>
        )}
      </TextSection>

      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="19-diffraction-gratings"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        title="Diffraction Gratings - Knowledge Check"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_19_green_light_grating'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_second_order_minimum'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_yellow_light_spacing'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_frequency_third_order'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_spectral_orders_red'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_water_trough_fringes'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_cd_player_laser'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_bright_dark_bands'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_frequency_measurement'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_grating_change'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_distance_change'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_19_frequency_change'
          }
        ]}
        courseId={courseId}
        lessonPath="lesson_19_diffraction_gratings"
      />

      <LessonSummary
        points={[
          "Poisson's bright spot appears at the center of a circular shadow, confirming wave theory of light",
          "Diffraction gratings contain thousands of equally spaced slits, producing sharp interference patterns",
          "Same equations as double slit: d sin θ = nλ for maxima, but with much sharper, brighter fringes",
          "Grating spacing d is calculated by inverting lines per unit length (e.g., 5000 lines/cm = d = 2.0 × 10⁻⁶ m)",
          "Different wavelengths diffract at different angles, allowing gratings to separate white light into colors",
          "For large angles or when x is comparable to L, use geometry to find θ first, then apply d sin θ = nλ",
          "Diffraction gratings are more precise than double slits for spectral analysis and wavelength measurement",
          "Higher line density (more lines/cm) produces greater angular separation between wavelengths"
        ]}
      />
    </LessonContent>
  );
};

export default DiffractionGratings;