#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Configuration for the generator
const CONFIG = {
  srcBasePath: path.join(__dirname, '..', 'src', 'FirebaseCourses', 'courses'),
  functionsBasePath: path.join(__dirname, '..', 'functions', 'courses'),
  functionsConfigPath: path.join(__dirname, '..', 'functions', 'courses-config'),
  functionsIndexPath: path.join(__dirname, '..', 'functions', 'index.js')
};

// Utility to prompt user for input
const promptUser = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

// Parse the input JSON configuration
const parseQuestionConfig = (input) => {
  try {
    const config = JSON.parse(input);
    
    // Validate required fields
    if (!config.courseId || !config.lessonPath || !config.lessonTitle || !config.questions) {
      throw new Error('Missing required fields: courseId, lessonPath, lessonTitle, or questions');
    }
    
    // Validate questions
    config.questions.forEach((q, index) => {
      if (!q.type) {
        throw new Error(`Question ${index + 1} missing type`);
      }
      if (q.type === 'multiple-choice' && (!q.question || !q.options || !q.correctAnswer)) {
        throw new Error(`Multiple choice question ${index + 1} missing required fields`);
      }
      if (q.type === 'ai-short-answer' && (!q.question || !q.expectedAnswers || !q.keyWords)) {
        throw new Error(`AI short answer question ${index + 1} missing required fields`);
      }
    });
    
    return config;
  } catch (error) {
    console.error('Error parsing configuration:', error.message);
    throw error;
  }
};

// Generate the frontend component
const generateFrontendComponent = (config) => {
  const componentName = config.lessonPath
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  return `import React from 'react';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const ${componentName} = ({ courseId, studentEmail }) => {
  const questions = ${JSON.stringify(config.questions.map((q, i) => ({
    ...q,
    title: q.title || \`\${config.lessonTitle} - Question \${i + 1}\`
  })), null, 2)};

  const handleComplete = (totalScore, results) => {
    console.log(\`Knowledge check completed with score: \${totalScore}%\`);
    // Add any completion logic here (e.g., navigation to next lesson)
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">${config.lessonTitle}</h1>
      
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="${config.lessonPath}"
        questions={questions}
        onComplete={handleComplete}
        theme="indigo"
      />
    </div>
  );
};

export default ${componentName};
`;
};

// Generate the backend assessments
const generateBackendAssessments = (config) => {
  const functionPrefix = `course${config.courseId}_${config.lessonPath.replace(/-/g, '_')}`;
  
  let imports = new Set();
  let exports = [];
  
  config.questions.forEach((question, index) => {
    const functionName = `${functionPrefix}_question${index + 1}`;
    
    if (question.type === 'multiple-choice') {
      imports.add("const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');");
      
      exports.push(`
exports.${functionName} = createStandardMultipleChoice({
  questions: [
    {
      questionText: "${question.question}",
      options: ${JSON.stringify(question.options.map((opt, i) => ({
        id: String.fromCharCode(97 + i),
        text: opt
      })))},
      correctOptionId: '${String.fromCharCode(97 + question.options.indexOf(question.correctAnswer))}',
      explanation: "${question.explanation || 'Correct answer explanation.'}",
      difficulty: "${question.difficulty || 'intermediate'}",
      topic: "${config.lessonTitle}"
    }
  ],
  pointsValue: ${question.points || 1},
  maxAttempts: 9999,
  showFeedback: true
});`);
    } else if (question.type === 'ai-short-answer') {
      imports.add("const { createAIShortAnswer } = require('../../../shared/assessment-types/ai-short-answer');");
      
      exports.push(`
exports.${functionName} = createAIShortAnswer({
  prompt: "Evaluate the student's response to: ${question.question}",
  expectedAnswers: ${JSON.stringify(question.expectedAnswers)},
  keyWords: ${JSON.stringify(question.keyWords)},
  pointsValue: ${question.points || 2},
  wordLimits: ${JSON.stringify(question.wordLimits || { min: 20, max: 150 })},
  activityType: "lesson",
  maxAttempts: 9999,
  showFeedback: true,
  enableAIChat: true,
  subject: "${config.lessonTitle}",
  topic: "${question.topic || 'Knowledge Check'}",
  fallbackQuestions: [
    {
      questionText: "${question.question}",
      expectedAnswer: "${question.expectedAnswers[0]}",
      sampleAnswer: "${question.sampleAnswer || question.expectedAnswers[0]}",
      acceptableAnswers: ${JSON.stringify(question.keyWords)},
      wordLimit: ${JSON.stringify(question.wordLimits || { min: 20, max: 150 })},
      difficulty: "${question.difficulty || 'intermediate'}"
    }
  ]
});`);
    }
  });
  
  return Array.from(imports).join('\n') + '\n' + exports.join('\n');
};

// Generate the cloud function exports
const generateCloudFunctionExports = (config) => {
  const functionPrefix = `course${config.courseId}_${config.lessonPath.replace(/-/g, '_')}`;
  const assessmentPath = `./courses/${config.courseId}/${config.lessonPath}/assessments`;
  
  return config.questions.map((_, index) => {
    const functionName = `${functionPrefix}_question${index + 1}`;
    return `exports.${functionName} = require('${assessmentPath}').${functionName};`;
  }).join('\n');
};

// Generate the gradebook configuration update
const generateGradebookConfig = (config) => {
  const itemId = `lesson_${config.lessonPath.replace(/-/g, '_')}`;
  const functionPrefix = `course${config.courseId}_${config.lessonPath.replace(/-/g, '_')}`;
  
  return {
    [itemId]: {
      title: config.lessonTitle,
      type: "lesson",
      contentPath: config.lessonPath,
      questions: config.questions.map((q, index) => ({
        questionId: `${functionPrefix}_question${index + 1}`,
        title: q.title || `${config.lessonTitle} - Question ${index + 1}`,
        points: q.points || (q.type === 'ai-short-answer' ? 2 : 1)
      }))
    }
  };
};

// Update the course-config.json file
const updateCourseConfig = async (courseId, gradebookUpdate) => {
  const configPath = path.join(CONFIG.functionsConfigPath, courseId.toString(), 'course-config.json');
  
  try {
    const configContent = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configContent);
    
    // Update gradebook.itemStructure
    if (!config.gradebook) {
      config.gradebook = { itemStructure: {} };
    }
    if (!config.gradebook.itemStructure) {
      config.gradebook.itemStructure = {};
    }
    
    // Merge the new item
    Object.assign(config.gradebook.itemStructure, gradebookUpdate);
    
    // Write back the updated config
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error updating course config:', error);
    return false;
  }
};

// Append cloud function exports to functions/index.js
const appendToFunctionsIndex = async (exports) => {
  try {
    const content = await fs.readFile(CONFIG.functionsIndexPath, 'utf8');
    
    // Check if exports already exist
    const exportLines = exports.split('\n');
    const alreadyExists = exportLines.every(line => content.includes(line));
    
    if (alreadyExists) {
      console.log('Cloud function exports already exist in functions/index.js');
      return true;
    }
    
    // Append new exports
    await fs.appendFile(CONFIG.functionsIndexPath, '\n\n// Generated slideshow questions\n' + exports);
    return true;
  } catch (error) {
    console.error('Error updating functions/index.js:', error);
    return false;
  }
};

// Main execution
const main = async () => {
  console.log('=== Slideshow Knowledge Check Generator ===\n');
  
  try {
    // Get configuration from user
    console.log('Please paste your question configuration JSON and press Enter twice when done:');
    
    let input = '';
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    for await (const line of rl) {
      if (line === '') {
        rl.close();
        break;
      }
      input += line + '\n';
    }
    
    // Parse configuration
    const config = parseQuestionConfig(input.trim());
    console.log(`\n✓ Parsed configuration for ${config.questions.length} questions`);
    
    // Create necessary directories
    const srcLessonPath = path.join(CONFIG.srcBasePath, config.courseId.toString(), 'content', config.lessonPath);
    const functionsLessonPath = path.join(CONFIG.functionsBasePath, config.courseId.toString(), config.lessonPath);
    
    await fs.mkdir(srcLessonPath, { recursive: true });
    await fs.mkdir(functionsLessonPath, { recursive: true });
    
    // Generate and write frontend component
    const frontendComponent = generateFrontendComponent(config);
    const frontendPath = path.join(srcLessonPath, 'index.js');
    await fs.writeFile(frontendPath, frontendComponent);
    console.log(`✓ Created frontend component: ${frontendPath}`);
    
    // Generate and write backend assessments
    const backendAssessments = generateBackendAssessments(config);
    const backendPath = path.join(functionsLessonPath, 'assessments.js');
    await fs.writeFile(backendPath, backendAssessments);
    console.log(`✓ Created backend assessments: ${backendPath}`);
    
    // Generate cloud function exports
    const cloudFunctionExports = generateCloudFunctionExports(config);
    await appendToFunctionsIndex(cloudFunctionExports);
    console.log(`✓ Updated cloud function exports in functions/index.js`);
    
    // Update course-config.json
    const gradebookConfig = generateGradebookConfig(config);
    await updateCourseConfig(config.courseId, gradebookConfig);
    console.log(`✓ Updated gradebook configuration in course-config.json`);
    
    console.log('\n✅ Slideshow knowledge check generated successfully!');
    console.log('\n📝 Summary:');
    console.log(`- Course ID: ${config.courseId}`);
    console.log(`- Lesson: ${config.lessonTitle}`);
    console.log(`- Questions: ${config.questions.length}`);
    console.log(`- Types: ${config.questions.filter(q => q.type === 'multiple-choice').length} MC, ${config.questions.filter(q => q.type === 'ai-short-answer').length} AI`);
    
    console.log('\n🚀 Next steps:');
    console.log('1. Deploy cloud functions: firebase deploy --only functions');
    console.log('2. Test the slideshow in your course');
    console.log('3. Verify gradebook calculations are working');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { parseQuestionConfig, generateFrontendComponent, generateBackendAssessments };