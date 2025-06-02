const { onValueWritten } = require('firebase-functions/v2/database');
const { logger } = require('firebase-functions');
const { getDatabase } = require('firebase-admin/database');

// This would require @babel/standalone to be installed in functions
let Babel;
try {
  Babel = require('@babel/standalone');
} catch (error) {
  logger.warn('Babel not installed in functions, JSX transformation will fail');
}

// Note: We define our own utility functions since they're not exported from manageCourseSection

// Utility functions from manageCourseSection
const extractImports = (code) => {
  const importRegex = /^import\s+.*?from\s+['"]\[^'"]+['"'];?\s*$/gm;
  return code.match(importRegex) || [];
};

const cleanSectionCode = (code) => {
  let cleaned = code.replace(/^import\s+.*?from\s+['"]\[^'"]+['"'];?\s*$/gm, '');
  cleaned = cleaned.replace(/^export\s+default\s+.*?;?\s*$/gm, '');
  cleaned = cleaned.replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*\n/gm, '').trim();
  return cleaned;
};

const combineSectionsLocal = (sections, sectionOrder, lessonTitle = 'Lesson') => {
  if (!sections || sections.length === 0) {
    return generateEmptyLesson(lessonTitle);
  }

  const orderedSections = sectionOrder
    .map(id => sections.find(s => s.id === id))
    .filter(Boolean);

  if (orderedSections.length === 0) {
    return generateEmptyLesson(lessonTitle);
  }

  // Default imports
  const allImports = new Set([
    `import React, { useState, useEffect } from 'react';`,
    `import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';`,
    `import { Alert, AlertDescription } from '../../../../components/ui/alert';`,
    `import { Badge } from '../../../../components/ui/badge';`
  ]);

  // Extract imports from sections
  orderedSections.forEach(section => {
    if (section.originalCode) {
      const sectionImports = extractImports(section.originalCode);
      sectionImports.forEach(imp => allImports.add(imp));
    }
  });

  // Generate section components
  const sectionComponents = orderedSections.map((section, index) => {
    const componentName = toComponentName(section.title);
    const codeToUse = section.code || section.originalCode || '';
    const cleanedCode = cleanSectionCode(codeToUse);
    
    logger.info(`Processing section ${index + 1}/${orderedSections.length}: "${section.title}" -> ${componentName}`);
    
    if (!cleanedCode.includes(`const ${componentName}`) && !cleanedCode.includes(`function ${componentName}`)) {
      logger.info(`   - Creating wrapper component for incomplete section`);
      return `
const ${componentName} = ({ course, courseId, isStaffView, devMode }) => {
  return React.createElement('div', { className: 'section-container mb-6' },
    React.createElement(Card, { className: 'mb-6' },
      React.createElement(CardHeader, null,
        React.createElement(CardTitle, null, '${section.title}')
      ),
      React.createElement(CardContent, null,
        React.createElement('p', null, 'Section content goes here...')
      )
    )
  );
};`;
    } else {
      logger.info(`   - Using existing component definition`);
      return cleanedCode;
    }
  });

  // Main component
  const mainComponentName = toComponentName(lessonTitle.replace('Section', '')) || 'LessonComponent';
  const sectionComponentNames = orderedSections.map(section => toComponentName(section.title));
  
  const mainComponent = `
const ${mainComponentName} = ({ course, courseId, isStaffView, devMode }) => {
  const sectionElements = [
${sectionComponentNames.map(name => `    React.createElement(${name}, { 
      key: '${name}',
      course: course, 
      courseId: courseId, 
      isStaffView: isStaffView, 
      devMode: devMode 
    })`).join(',\n')}
  ];

  return React.createElement('div', { className: 'lesson-container' },
    React.createElement('div', { className: 'lesson-header mb-8' },
      React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, '${lessonTitle}'),
      devMode && React.createElement(Badge, { variant: 'outline', className: 'mt-2' },
        'Multi-Section Lesson • ${sectionComponentNames.length} sections'
      )
    ),
    React.createElement('div', { className: 'lesson-sections space-y-6' }, 
      ...sectionElements
    )
  );
};`;

  const finalCode = `${Array.from(allImports).join('\n')}

${sectionComponents.join('\n\n')}

${mainComponent}

export default ${mainComponentName};`;

  return finalCode;
};

const generateEmptyLesson = (lessonTitle) => {
  const componentName = toComponentName(lessonTitle.replace('Section', '')) || 'EmptyLesson';
  
  return `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Alert, AlertDescription } from '../../../../components/ui/alert';

const ${componentName} = ({ course, courseId, isStaffView, devMode }) => {
  return (
    <div className="lesson-container">
      <div className="lesson-header mb-8">
        <h1 className="text-3xl font-bold text-gray-900">${lessonTitle}</h1>
      </div>
      
      <Alert>
        <AlertDescription>
          This lesson has no sections yet. {isStaffView ? 'Use the code editor to add sections and content.' : 'Content is being developed.'}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ${componentName};`;
};

const toComponentName = (title) => {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Section';
};

/**
 * Database trigger that automatically transforms JSX when originalCode is updated
 * Triggers on: /courseDevelopment/{courseId}/{lessonPath}/sections/{sectionId}/originalCode
 */
exports.autoTransformSectionCode = onValueWritten({
  ref: '/courseDevelopment/{courseId}/{lessonPath}/sections/{sectionId}/originalCode',
  region: 'us-central1',
  memory: '1GiB',
  concurrency: 20
}, async (event) => {
  const { courseId, lessonPath, sectionId } = event.params;
  
  logger.info(`🔄 Auto-transform triggered for section: ${courseId}/${lessonPath}/${sectionId}`);
  
  // Get the new originalCode value
  const originalCode = event.data.after.val();
  const previousCode = event.data.before.val();
  
  // Skip if no real change (avoid infinite loops)
  if (originalCode === previousCode) {
    logger.info('⏭️ No change in originalCode, skipping transformation');
    return null;
  }
  
  if (!originalCode) {
    logger.info('⏭️ originalCode is empty, skipping transformation');
    return null;
  }
  
  try {
    const db = getDatabase();
    const lessonRef = db.ref(`courseDevelopment/${courseId}/${lessonPath}`);
    const sectionRef = db.ref(`courseDevelopment/${courseId}/${lessonPath}/sections/${sectionId}`);
    
    // Transform JSX if it contains JSX syntax
    let transformedCode = originalCode;
    const containsJSX = originalCode.includes('<') && originalCode.includes('>');
    
    if (containsJSX && Babel) {
      logger.info('🔧 Transforming JSX code...');
      try {
        const result = Babel.transform(originalCode, {
          presets: [
            ['react', { 
              runtime: 'classic',
              pragma: 'React.createElement'
            }]
          ]
        });
        transformedCode = result.code;
        logger.info('✅ JSX transformation successful');
      } catch (transformError) {
        logger.error('❌ JSX transformation failed:', transformError);
        // Continue with original code if transformation fails
      }
    }
    
    // Update the section's transformed code
    await sectionRef.child('code').set(transformedCode);
    await sectionRef.child('lastModified').set(new Date().toISOString());
    await sectionRef.child('autoTransformed').set(true);
    
    logger.info('📝 Updated section with transformed code');
    
    // Get all sections to regenerate combined lesson
    const lessonSnapshot = await lessonRef.get();
    const lessonData = lessonSnapshot.val();
    
    if (lessonData && lessonData.sections) {
      const sections = Object.values(lessonData.sections);
      const sectionOrder = lessonData.sectionOrder || [];
      const lessonTitle = lessonData.lessonTitle || 'Lesson';
      
      // Generate new combined code
      const combinedCode = combineSectionsLocal(sections, sectionOrder, lessonTitle);
      
      // Update the lesson with new combined code
      await lessonRef.update({
        code: combinedCode,
        originalCode: combinedCode,
        mainComponent: {
          code: combinedCode,
          lastGenerated: new Date().toISOString(),
          autoGenerated: true
        },
        lastModified: new Date().toISOString(),
        modifiedBy: 'auto-transform-trigger'
      });
      
      logger.info('🔄 Regenerated combined lesson code');
    }
    
    logger.info(`✅ Auto-transform completed for ${courseId}/${lessonPath}/${sectionId}`);
    
  } catch (error) {
    logger.error('❌ Auto-transform failed:', error);
    
    // Attempt to set error flag on the section
    try {
      const db = getDatabase();
      const sectionRef = db.ref(`courseDevelopment/${courseId}/${lessonPath}/sections/${sectionId}`);
      await sectionRef.update({
        transformError: error.message,
        lastTransformAttempt: new Date().toISOString()
      });
    } catch (updateError) {
      logger.error('Failed to update section with error info:', updateError);
    }
  }
  
  return null;
});