# Prompt for Processing Remaining Course Lessons

Please help me create questions.json files for multiple Physics course lessons. For each lesson directory provided, you need to:

1. Read the assessments.js file in the lesson directory
2. Extract all question configurations (look for patterns like `course2_XX_questionY`)
3. Create a questions.json file in the same directory with the extracted questions

## Format for questions.json:
```json
[
  {
    "questionId": "course2_XX_questionY",
    "title": "Descriptive Question Title",
    "points": 1
  }
]
```

## Instructions:
- Extract the questionId from the assessmentConfigs object in assessments.js
- Create a descriptive title based on the questionText from the question pool
- All questions typically have 1 point value (but verify in the assessmentConfigs)
- Save the JSON file in the same directory as the assessments.js file

## Lessons to Process:

### From /functions/courses/2b/:
1. 55-photoelectric-effect
2. 49-early-atomic-models
3. 50-cathode-rays
4. 51-rutherford-atom
5. 25-electrostatics
6. 26-coulombs-law
7. 29-electric-fields
8. 30-electric-potential
9. 31-parallel-plates
10. 32-electric-current
11. 36-magnetic-fields
12. 37-magnetic-forces-particles
13. 38-motor-effect
14. 40-generator-effect
15. 42-electromagnetic-radiation
16. 46-unit-3-review
17. 47-unit-4-review

### From /functions/courses/2c/:
1. 54-lab-plancks-constant
2. 56-lab-millikans-oil-drop
3. 57-light-spectra-excitation
4. 58-lab-marshmallow-speed-light
5. 60-bohr-model
6. 61-compton-effect
7. 62-wave-particle-nature
8. 64-quantum-mechanics
9. 66-nuclear-physics
10. 67-radioactivity
11. 68-lab-half-life
12. 70-particle-physics
13. 71-quarks
14. 74-unit-5-review
15. 75-unit-6-review

## Example of what to do:

For lesson directory `/functions/courses/2b/55-photoelectric-effect/`:
1. Read `/functions/courses/2b/55-photoelectric-effect/assessments.js`
2. Find all question configurations in assessmentConfigs
3. Create `/functions/courses/2b/55-photoelectric-effect/questions.json` with the extracted data

Please process each lesson one by one, confirming each file creation before moving to the next.