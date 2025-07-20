import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Target, BookOpen } from 'lucide-react';

const CourseOutline = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // For now, we'll handle Physics 30 (courseId = 2)
  // This can be expanded for other courses later
  const courseOutlines = {
    '2': {
      title: 'Physics 30',
      fullTitle: 'Physics 30 - Advanced Physics Concepts',
      description: 'Physics 30 explores advanced concepts in mechanics, waves, electricity, magnetism, and modern physics. Students will develop problem-solving skills and mathematical modeling abilities while investigating momentum, circular motion, electromagnetic radiation, and quantum phenomena.',
      units: [
        {
          number: 1,
          title: 'Momentum and Optics',
          topics: [
            'Momentum in One Dimension',
            'Momentum in Two Dimensions', 
            'Impulse and Momentum Change',
            'Conservation of Momentum',
            'Introduction to Light',
            'Reflection of Light',
            'Curved Mirrors',
            'Refraction of Light',
            'Optics and Lenses',
            'Interference and Diffraction'
          ]
        },
        {
          number: 2,
          title: 'Electric and Magnetic Fields',
          topics: [
            'Electrostatics',
            'Coulomb\'s Law',
            'Electric Fields',
            'Electric Potential',
            'Electric Current',
            'Magnetic Fields',
            'Electromagnetic Induction'
          ]
        },
        {
          number: 3,
          title: 'Atomic Physics and Modern Physics',
          topics: [
            'Early Atomic Models',
            'Photoelectric Effect',
            'Bohr Model',
            'Quantum Mechanics',
            'Nuclear Physics',
            'Particle Physics'
          ]
        }
      ],
      assessment: {
        assignments: '20%',
        labs: '20%',
        exams: '60%',
      },
      prerequisites: ['Physics 20', 'Math 20-1 or Math 20-2'],
      duration: '1 semester (125 hours)',
      credits: '5 credits'
    }
  };

  const courseData = courseOutlines[courseId];

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The requested course outline is not available.</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{courseData.title}</h1>
          <p className="text-lg text-gray-600 mt-2">{courseData.fullTitle}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Course Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <BookOpen className="text-blue-600 mr-2" size={24} />
            <h2 className="text-xl font-semibold">Course Description</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">{courseData.description}</p>
        </div>

        {/* Course Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Course Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <FileText className="text-blue-600 mr-2" size={24} />
              <h2 className="text-xl font-semibold">Course Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-800">Duration:</span>
                <span className="ml-2 text-gray-600">{courseData.duration}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Credits:</span>
                <span className="ml-2 text-gray-600">{courseData.credits}</span>
              </div>
              <div>
                <span className="font-medium text-gray-800">Prerequisites:</span>
                <div className="ml-2 text-gray-600">
                  {courseData.prerequisites.map((prereq, index) => (
                    <div key={index}>• {prereq}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assessment */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Target className="text-blue-600 mr-2" size={24} />
              <h2 className="text-xl font-semibold">Assessment Breakdown</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(courseData.assessment).map(([type, percentage]) => (
                <div key={type} className="flex justify-between">
                  <span className="font-medium text-gray-800 capitalize">{type}:</span>
                  <span className="text-gray-600">{percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-6">
            <Calendar className="text-blue-600 mr-2" size={24} />
            <h2 className="text-xl font-semibold">Course Units</h2>
          </div>
          <div className="space-y-6">
            {courseData.units.map((unit, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Unit {unit.number}: {unit.title}
                  </h3>
                  <span className="text-sm text-gray-500 mt-1 sm:mt-0">{unit.duration}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  {unit.topics.map((topic, topicIndex) => (
                    <li key={topicIndex}>{topic}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseOutline;