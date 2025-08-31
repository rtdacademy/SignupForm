/**
 * Assessment Mapping for Course 5 (Introduction to Data Science)
 * 
 * This file maps assessment IDs to their corresponding file paths.
 * Used by the universal assessment function to dynamically load assessment configurations.
 * 
 * Format: 'assessmentId': 'relative/path/to/assessments'
 * Note: Paths are relative to the /functions/courses/5/ directory
 */

module.exports = {
  // Lesson 01: Introduction to Data Science
  'course5_01_introduction_knowledge_check': '01_data_science_introduction_overview/assessments',
  'course5_01_introduction_applications': '01_data_science_introduction_overview/assessments',

  // Lesson 02: Python Programming Basics
  'course5_02_python_syntax': '02_data_science_python_basics/assessments',
  'course5_02_python_data_structures': '02_data_science_python_basics/assessments',
  'course5_02_python_functions': '02_data_science_python_basics/assessments',

  // Lesson 03: Statistics Review
  'course5_03_statistics_descriptive': '03_data_science_statistics_review/assessments',
  'course5_03_statistics_probability': '03_data_science_statistics_review/assessments',

  // Assignment 04: Unit 1 Assignment: Data Analysis Project
  'course5_04_assignment_data_exploration': '04_data_science_unit1_assignment/assessments',
  'course5_04_assignment_analysis': '04_data_science_unit1_assignment/assessments',

  // Lesson 05: Introduction to Pandas
  'course5_05_pandas_dataframes': '05_data_science_pandas_introduction/assessments',
  'course5_05_pandas_operations': '05_data_science_pandas_introduction/assessments',

  // Lesson 06: Data Cleaning and Preprocessing
  'course5_06_cleaning_missing_data': '06_data_science_data_cleaning/assessments',
  'course5_06_cleaning_outliers': '06_data_science_data_cleaning/assessments',

  // Lesson 07: Data Visualization with Matplotlib
  'course5_07_visualization_plots': '07_data_science_visualization_basics/assessments',
  'course5_07_visualization_customization': '07_data_science_visualization_basics/assessments',

  // Lab 08: Lab: Data Manipulation with Pandas
  'course5_08_lab_data_import': '08_data_science_pandas_lab/assessments',
  'course5_08_lab_transformation': '08_data_science_pandas_lab/assessments',

  // Quiz 09: Unit 2 Quiz
  'course5_09_quiz_question1': '09_data_science_unit2_quiz/assessments',
  'course5_09_quiz_question2': '09_data_science_unit2_quiz/assessments',
  'course5_09_quiz_question3': '09_data_science_unit2_quiz/assessments',

  // Lesson 10: Machine Learning Fundamentals
  'course5_10_ml_types': '10_data_science_ml_fundamentals/assessments',
  'course5_10_ml_workflow': '10_data_science_ml_fundamentals/assessments',

  // Exam 11: Final Exam
  'course5_11_exam_section1': '11_data_science_final_exam/assessments',
  'course5_11_exam_section2': '11_data_science_final_exam/assessments',
  'course5_11_exam_section3': '11_data_science_final_exam/assessments',

};
