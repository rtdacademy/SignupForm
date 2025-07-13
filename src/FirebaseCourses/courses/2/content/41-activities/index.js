import React, { useState } from 'react';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const Activities = ({ courseId }) => {
  const [activeStation, setActiveStation] = useState(1);

  const stations = [
    {
      id: 1,
      name: "Conductors in magnetic fields (the motor effect)",
      videoId: "F1PWnu01IQg",
      description: "In this apparatus, you will find a retort stand with a copper wire hanging between two magnets. A power supply with a current-limiting-resistor is attached to the top of the apparatus.",
      questions: [
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station1_q1',
          title: 'Question 1: Motor Effect Observation'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station1_q2',
          title: 'Question 2: Fleming\'s Left-Hand Rule'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station1_q3',
          title: 'Question 3: Current Direction Reversal'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station1_q4',
          title: 'Question 4: Magnetic Field Strength'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station1_q5',
          title: 'Question 5: Motor Effect Applications'
        }
      ]
    },
    {
      id: 2,
      name: "Solenoids – induced current",
      videoId: "Hh58afwzHfA",
      description: "In this apparatus, a solenoid is hooked up to a galvanometer. You will also find a neodymium magnet attached to a steel nail on the table. Note: For this station you are not trying to work with the hand rule. Rather you are working with the general principle of induction. Press down on the far left button of the galvanometer.",
      questions: [
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station2_q1',
          title: 'Question 1: Galvanometer Function'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station2_q2',
          title: 'Question 2: Magnet Insertion Effect'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station2_q3',
          title: 'Question 3: Magnet Removal Effect'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station2_q4',
          title: 'Question 4: Faraday\'s Law'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station2_q5',
          title: 'Question 5: Stationary Magnet'
        }
      ]
    },
    {
      id: 3,
      name: "Swinging aluminum paddles",
      videoId: "0b0V0impJ_E",
      description: "In this apparatus, there are two aluminum \"paddles\" that can swing between the magnetic field produced by two powerful magnets. One aluminum paddle is solid while the other is like a comb with multiple prongs.",
      questions: [
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station3_q1',
          title: 'Question 1: Aluminum Magnetic Properties'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station3_q2',
          title: 'Question 2: Solid Paddle Behavior'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station3_q3',
          title: 'Question 3: Faraday\'s and Lenz\'s Laws'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station3_q4',
          title: 'Question 4: Comb Paddle Effect'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station3_q5',
          title: 'Question 5: Non-conductive Material'
        }
      ]
    },
    {
      id: 4,
      name: "The vertical tubes",
      videoId: "M856bqqbZcM",
      description: "In this apparatus, you will find a long hollow copper tube and two aluminum cylinders.",
      questions: [
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station4_q1',
          title: 'Question 1: Magnet Descent Observation'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station4_q2',
          title: 'Question 2: Law of Electromagnetic Induction'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station4_q3',
          title: 'Question 3: Lenz\'s Law Application'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station4_q4',
          title: 'Question 4: Non-magnetic Object Comparison'
        },
        {
          type: 'multiple-choice',
          questionId: 'course2_41_station4_q5',
          title: 'Question 5: Real-world Applications'
        }
      ]
    }
  ];

  const currentStation = stations.find(s => s.id === activeStation);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Electromagnetism Activities</h1>
      
      {/* Station Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {stations.map((station) => (
          <button
            key={station.id}
            onClick={() => setActiveStation(station.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeStation === station.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Station {station.id}
          </button>
        ))}
      </div>

      {/* Station Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4">{currentStation?.name || 'Loading...'}</h2>
        
        {currentStation?.description && (
          <p className="text-gray-700 mb-6">{currentStation.description}</p>
        )}

        {/* Video Section */}
        {currentStation?.videoId && (
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Watch the Demonstration</h3>
            <div className="relative pb-[56.25%] h-0 overflow-hidden max-w-full bg-black rounded-lg">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${currentStation.videoId}?si=AAodv0P_K3_ad94i`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* Questions Section */}
        {currentStation && currentStation.questions && currentStation.questions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Answer the Questions</h3>
            <SlideshowKnowledgeCheck
              courseId={courseId}
              lessonPath="41-activities"
              questions={currentStation.questions}
              theme="indigo"
            />
          </div>
        )}

        {/* Placeholder for incomplete stations */}
        {currentStation && !currentStation.videoId && currentStation.id > 1 && (
          <p className="text-gray-500 italic">Content for this station will be added soon.</p>
        )}
      </div>
    </div>
  );
};

export default Activities;