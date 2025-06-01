const { onCall } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { getDatabase } = require('firebase-admin/database');

// This would require @babel/standalone to be installed in functions
let Babel;
try {
  Babel = require('@babel/standalone');
} catch (error) {
  logger.warn('Babel not installed in functions, JSX transformation will fail');
}

// Utility functions
const toComponentName = (title) => {
  return title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Section';
};

const extractImports = (code) => {
  const importRegex = /^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm;
  return code.match(importRegex) || [];
};

const cleanSectionCode = (code) => {
  let cleaned = code.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '');
  cleaned = cleaned.replace(/^export\s+default\s+.*?;?\s*$/gm, '');
  cleaned = cleaned.replace(/^export\s+\{[^}]*\};?\s*$/gm, '');
  cleaned = cleaned.replace(/^\s*\n/gm, '').trim();
  return cleaned;
};

const combineSections = (sections, sectionOrder, lessonTitle = 'Lesson') => {
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
    logger.info(`   - Has transformed code: ${!!section.code} (${section.code?.length || 0} chars)`);
    logger.info(`   - Has original code: ${!!section.originalCode} (${section.originalCode?.length || 0} chars)`);
    logger.info(`   - Using code: ${codeToUse.length} chars`);
    
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
  
  logger.info(`Generating main component: ${mainComponentName}`);
  logger.info(`Section components to include:`, sectionComponentNames);
  logger.info(`Total sections: ${sectionComponentNames.length}`);
  
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

  logger.info(`Final combined code generated:`);
  logger.info(`   - Total length: ${finalCode.length} characters`);
  logger.info(`   - Components: ${sectionComponentNames.length} sections + 1 main`);
  logger.info(`   - Main component: ${mainComponentName}`);
  
  // Debug: Show first 500 chars of final code
  logger.info(`Preview of final code:`, finalCode.substring(0, 500) + '...');

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

exports.manageCourseSection = onCall(async (request) => {
  try {
    const { 
      action, 
      courseId, 
      lessonPath, 
      sectionId,
      sectionData,
      lessonTitle,
      userEmail 
    } = request.data;

    if (!courseId || !lessonPath) {
      throw new Error('courseId and lessonPath are required');
    }

    const db = getDatabase();
    const lessonRef = db.ref(`courseDevelopment/${courseId}/${lessonPath}`);

    switch (action) {
      case 'loadLesson': {
        const snapshot = await lessonRef.get();
        if (!snapshot.exists()) {
          return {
            success: true,
            sections: [],
            sectionOrder: [],
            combinedCode: generateEmptyLesson(lessonTitle || 'Lesson')
          };
        }

        const data = snapshot.val();
        const sections = data.sections ? Object.values(data.sections) : [];
        const sectionOrder = data.sectionOrder || [];
        const combinedCode = data.mainComponent?.code || data.code || '';

        return {
          success: true,
          sections,
          sectionOrder,
          combinedCode,
          lastModified: data.lastModified,
          modifiedBy: data.modifiedBy
        };
      }

      case 'saveSection': {
        if (!sectionId || !sectionData) {
          throw new Error('sectionId and sectionData are required for saveSection');
        }

        // Get current lesson data
        const snapshot = await lessonRef.get();
        const currentData = snapshot.exists() ? snapshot.val() : {};
        
        // Transform JSX if needed
        let transformedCode = sectionData.originalCode;
        const containsJSX = sectionData.originalCode?.includes('<') && sectionData.originalCode?.includes('>');
        
        if (containsJSX && Babel) {
          logger.info('Transforming JSX for section:', sectionData.title);
          try {
            const result = Babel.transform(sectionData.originalCode, {
              presets: [
                ['react', { 
                  runtime: 'classic',
                  pragma: 'React.createElement'
                }]
              ]
            });
            transformedCode = result.code;
            logger.info('JSX transformation successful');
          } catch (transformError) {
            logger.error('JSX transformation failed:', transformError);
            throw new Error(`JSX transformation failed: ${transformError.message}`);
          }
        }

        // Update section data
        const updatedSection = {
          id: sectionId,
          title: sectionData.title,
          originalCode: sectionData.originalCode,
          code: transformedCode,
          lastModified: new Date().toISOString(),
          modifiedBy: userEmail || 'unknown'
        };

        // Update sections array
        const sections = currentData.sections ? Object.values(currentData.sections) : [];
        const sectionIndex = sections.findIndex(s => s.id === sectionId);
        
        if (sectionIndex >= 0) {
          sections[sectionIndex] = updatedSection;
        } else {
          sections.push(updatedSection);
        }

        const sectionOrder = currentData.sectionOrder || sections.map(s => s.id);
        if (!sectionOrder.includes(sectionId)) {
          sectionOrder.push(sectionId);
        }

        // Generate combined component
        const combinedCode = combineSections(sections, sectionOrder, lessonTitle);

        // Save to database atomically
        const lessonData = {
          lessonTitle: lessonTitle,
          lastModified: new Date().toISOString(),
          modifiedBy: userEmail || 'unknown',
          enabled: true,
          
          sections: sections.reduce((acc, section) => {
            acc[section.id] = section;
            return acc;
          }, {}),
          sectionOrder,
          
          mainComponent: {
            code: combinedCode,
            lastGenerated: new Date().toISOString()
          },
          
          code: combinedCode,
          originalCode: combinedCode
        };

        await lessonRef.set(lessonData);

        logger.info(`Section "${sectionData.title}" saved successfully`);

        return {
          success: true,
          sections,
          sectionOrder,
          combinedCode,
          updatedSection,
          message: `Section "${sectionData.title}" saved successfully`
        };
      }

      case 'createSection': {
        if (!sectionData) {
          throw new Error('sectionData is required for createSection');
        }

        const newSectionId = `section_${Date.now()}`;
        const newSection = {
          id: newSectionId,
          title: sectionData.title,
          originalCode: sectionData.originalCode || `// ${sectionData.title} Section\nconst ${toComponentName(sectionData.title)} = ({ course, courseId, isStaffView, devMode }) => {\n  return (\n    <div className="section-container mb-6">\n      <Card className="mb-6">\n        <CardHeader>\n          <CardTitle>${sectionData.title}</CardTitle>\n        </CardHeader>\n        <CardContent>\n          <p>Add your content here...</p>\n        </CardContent>\n      </Card>\n    </div>\n  );\n};\n\nexport default ${toComponentName(sectionData.title)};`,
          code: '',
          createdAt: new Date().toISOString(),
          modifiedBy: userEmail || 'unknown'
        };

        // Get current data and add new section
        const snapshot = await lessonRef.get();
        const currentData = snapshot.exists() ? snapshot.val() : {};
        const sections = currentData.sections ? Object.values(currentData.sections) : [];
        sections.push(newSection);

        const sectionOrder = currentData.sectionOrder || [];
        sectionOrder.push(newSectionId);

        // Generate combined component
        const combinedCode = combineSections(sections, sectionOrder, lessonTitle);

        // Save to database
        const lessonData = {
          ...currentData,
          sections: sections.reduce((acc, section) => {
            acc[section.id] = section;
            return acc;
          }, {}),
          sectionOrder,
          mainComponent: {
            code: combinedCode,
            lastGenerated: new Date().toISOString()
          },
          code: combinedCode,
          lastModified: new Date().toISOString(),
          modifiedBy: userEmail || 'unknown'
        };

        await lessonRef.set(lessonData);

        return {
          success: true,
          sections,
          sectionOrder,
          combinedCode,
          newSection,
          message: `Section "${sectionData.title}" created successfully`
        };
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    logger.error('Error in manageCourseSection:', error);
    return {
      success: false,
      error: error.message
    };
  }
});