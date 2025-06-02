const { onCall } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');

// This would require @babel/standalone to be installed in functions
// npm install @babel/standalone in the functions directory
let Babel;
try {
  Babel = require('@babel/standalone');
} catch (error) {
  logger.warn('Babel not installed in functions, JSX transformation will fail');
}

exports.transformJSXCode = onCall(async (request) => {
  try {
    const { jsxCode } = request.data;
    
    if (!jsxCode) {
      throw new Error('No JSX code provided');
    }
    
    if (!Babel) {
      throw new Error('Babel not available for JSX transformation');
    }
    
    logger.info('Starting JSX transformation...');
    
    // Transform JSX to React.createElement
    const result = Babel.transform(jsxCode, {
      presets: [
        ['react', { 
          runtime: 'classic',
          pragma: 'React.createElement'
        }]
      ],
      plugins: []
    });
    
    logger.info('JSX transformation completed successfully');
    
    return {
      success: true,
      transformedCode: result.code,
      originalCode: jsxCode
    };
    
  } catch (error) {
    logger.error('JSX transformation failed:', error);
    return {
      success: false,
      error: error.message,
      originalCode: request.data.jsxCode
    };
  }
});