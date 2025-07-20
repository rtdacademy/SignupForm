//const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');
const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
// This determines which default settings are used from course-config.json
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ===== SLIDESHOW KNOWLEDGE CHECK ASSESSMENTS =====

// Question 1: Distance vs Time Analysis
const createDistanceVsTimeQuestion = () => {
  return {
    questionText: `**Instructions:** Use the data table below to sketch a distance vs. time graph on paper to determine the line of best fit and calculate the slope.

| Time (s) | Distance (m) |
|----------|--------------|
| 0        | 0            |
| 1        | 2.1          |
| 2        | 3.9          |
| 3        | 6.2          |
| 4        | 7.8          |
| 5        | 10.1         |

**💡 Hint:** Slope = Δy/Δx = (y₂ - y₁)/(x₂ - x₁)

What is the slope of the line of best fit?`,
    options: [
      { 
        id: 'a', 
        text: `2.0 m/s`, 
        feedback: "Correct! Using the line of best fit through the data points, the slope is approximately 2.0 m/s." 
      },
      { 
        id: 'b', 
        text: `1.5 m/s`, 
        feedback: "This is too low. Make sure you're using the line of best fit, not just connecting two specific points." 
      },
      { 
        id: 'c', 
        text: `2.5 m/s`, 
        feedback: "This is too high. The line of best fit should minimize the distance to all data points." 
      },
      { 
        id: 'd', 
        text: `10.1 m/s`, 
        feedback: "This is the final distance value, not the slope. Slope = rise/run, not just the y-value." 
      }
    ],
    correctOptionId: 'a',
    explanation: `To find the slope: 1) Plot the points on a distance vs. time graph, 2) Draw the line of best fit, 3) Calculate slope using two points on the line: slope = (10.1 - 0)/(5 - 0) ≈ 2.0 m/s`,
    difficulty: "intermediate",
    topic: "Graphing Analysis"
  };
};


// Question 2: Force vs Acceleration Analysis
const createForceVsAccelerationQuestion = () => {
  return {
    questionText: `**Instructions:** Use the data table below to sketch a force vs. acceleration graph on paper to determine the line of best fit and calculate the slope.

| Force (N) | Acceleration (m/s²) |
|-----------|-------------------|
| 10        | 2.0               |
| 20        | 4.1               |
| 30        | 5.9               |
| 40        | 8.2               |
| 50        | 9.8               |

**💡 Hint:** F = ma, so slope = Δa/ΔF = 1/m

What is the slope of the line of best fit, and what does it represent?`,
    options: [
      { 
        id: 'a', 
        text: `0.2 s²/m (represents 1/mass)`, 
        feedback: "Correct! The slope is 0.2 s²/m, which represents 1/mass. Since F = ma, then a = F/m, so slope = 1/m = 1/5 kg = 0.2 s²/m." 
      },
      { 
        id: 'b', 
        text: `5.0 kg (represents mass)`, 
        feedback: "The mass is 5.0 kg, but the slope of the a vs F graph is 1/mass = 0.2 s²/m." 
      },
      { 
        id: 'c', 
        text: `0.5 m/s² per N`, 
        feedback: "This calculation is incorrect. Check your slope calculation using the line of best fit." 
      },
      { 
        id: 'd', 
        text: `2.0 N·s²/m`, 
        feedback: "This is not the correct slope. Remember slope = rise/run = Δy/Δx." 
      }
    ],
    correctOptionId: 'a',
    explanation: `From F = ma, we get a = F/m. The slope of an acceleration vs. force graph is Δa/ΔF = 1/m. Using the line of best fit: slope = (9.8 - 2.0)/(50 - 10) = 7.8/40 = 0.195 ≈ 0.2 s²/m, representing 1/mass.`,
    difficulty: "intermediate",
    topic: "Physics Graphing"
  };
};


// Question 3: Velocity vs Time Analysis
const createVelocityVsTimeQuestion = () => {
  return {
    questionText: `**Instructions:** Use the data table below to sketch a velocity vs. time graph on paper to determine the line of best fit and calculate the slope.

| Time (s) | Velocity (m/s) |
|----------|----------------|
| 0        | 5.0            |
| 2        | 11.1           |
| 4        | 17.0           |
| 6        | 22.8           |
| 8        | 29.2           |

**💡 Hint:** Slope of v vs t graph = Δv/Δt = acceleration

What is the slope of the line of best fit, and what does it represent?`,
    options: [
      { 
        id: 'a', 
        text: `3.0 m/s² (represents acceleration)`, 
        feedback: "Correct! The slope is approximately 3.0 m/s², which represents the acceleration of the object." 
      },
      { 
        id: 'b', 
        text: `29.2 m/s (represents final velocity)`, 
        feedback: "This is the final velocity value, not the slope. Slope = rise/run." 
      },
      { 
        id: 'c', 
        text: `24.2 m/s (represents change in velocity)`, 
        feedback: "This is the total change in velocity, but slope requires dividing by the change in time." 
      },
      { 
        id: 'd', 
        text: `8.0 s (represents time interval)`, 
        feedback: "This is the time interval, not the slope. Remember slope = Δy/Δx." 
      }
    ],
    correctOptionId: 'a',
    explanation: `For a velocity vs. time graph, the slope represents acceleration. Using the line of best fit: slope = Δv/Δt = (29.2 - 5.0)/(8 - 0) = 24.2/8 = 3.025 ≈ 3.0 m/s².`,
    difficulty: "intermediate",
    topic: "Kinematics Graphing"
  };
};


// Question 4: Current vs Voltage Analysis
const createCurrentVsVoltageQuestion = () => {
  return {
    questionText: `**Instructions:** Use the data table below to sketch a current vs. voltage graph on paper to determine the line of best fit and calculate the slope.

| Voltage (V) | Current (A) |
|-------------|-------------|
| 0           | 0           |
| 2           | 0.19        |
| 4           | 0.41        |
| 6           | 0.58        |
| 8           | 0.82        |
| 10          | 0.98        |

**💡 Hint:** V = IR, so I = V/R, slope = 1/R

What is the slope of the line of best fit, and what does it represent?`,
    options: [
      { 
        id: 'a', 
        text: `0.10 A/V (represents 1/resistance)`, 
        feedback: "Correct! The slope is 0.10 A/V, which represents 1/resistance (conductance). From Ohm's law V = IR, so I = V/R, making the slope 1/R." 
      },
      { 
        id: 'b', 
        text: `10 Ω (represents resistance)`, 
        feedback: "The resistance is 10 Ω, but the slope of the I vs V graph is 1/resistance = 0.10 A/V." 
      },
      { 
        id: 'c', 
        text: `0.98 A (represents maximum current)`, 
        feedback: "This is the maximum current value in the table, not the slope." 
      },
      { 
        id: 'd', 
        text: `9.8 V/A (represents resistance)`, 
        feedback: "This calculation is incorrect. The slope should be ΔI/ΔV, not ΔV/ΔI." 
      }
    ],
    correctOptionId: 'a',
    explanation: `From Ohm's law V = IR, we get I = V/R. The slope of a current vs. voltage graph is ΔI/ΔV = 1/R. Using the line of best fit: slope = (0.98 - 0)/(10 - 0) = 0.098 ≈ 0.10 A/V, representing 1/resistance (conductance).`,
    difficulty: "intermediate",
    topic: "Electrical Circuits"
  };
};


// Export assessment configurations for master function
const assessmentConfigs = {
  'course2_06_graphing_techniques_question1': {
    questions: [
      createDistanceVsTimeQuestion()
    ],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 2,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_06_graphing_techniques_question2': {
    questions: [
      createForceVsAccelerationQuestion()
    ],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 2,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_06_graphing_techniques_question3': {
    questions: [
      createVelocityVsTimeQuestion()
    ],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 2,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_06_graphing_techniques_question4': {
    questions: [
      createCurrentVsVoltageQuestion()
    ],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 2,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  }
};

exports.assessmentConfigs = assessmentConfigs;