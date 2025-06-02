const { onCall } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { getDatabase } = require('firebase-admin/database');

exports.debugLesson = onCall(async (request) => {
  try {
    const { courseId, lessonPath } = request.data;
    
    const db = getDatabase();
    const lessonRef = db.ref(`courseDevelopment/${courseId}/${lessonPath}`);
    const snapshot = await lessonRef.get();
    
    if (!snapshot.exists()) {
      return { success: false, error: 'Lesson not found' };
    }
    
    const data = snapshot.val();
    
    logger.info('=== LESSON DEBUG INFO ===');
    logger.info('Lesson Path:', lessonPath);
    logger.info('Has mainComponent:', !!data.mainComponent);
    logger.info('Has sections:', !!data.sections);
    logger.info('Section count:', data.sections ? Object.keys(data.sections).length : 0);
    logger.info('Section order:', data.sectionOrder);
    
    if (data.sections) {
      Object.keys(data.sections).forEach(sectionId => {
        const section = data.sections[sectionId];
        logger.info(`Section ${sectionId}:`, {
          title: section.title,
          hasOriginalCode: !!section.originalCode,
          hasTransformedCode: !!section.code,
          originalLength: section.originalCode?.length || 0,
          transformedLength: section.code?.length || 0
        });
      });
    }
    
    if (data.mainComponent) {
      logger.info('Main component length:', data.mainComponent.code?.length || 0);
      logger.info('Main component preview:', data.mainComponent.code?.substring(0, 200) + '...');
    }
    
    return {
      success: true,
      debug: {
        hasMainComponent: !!data.mainComponent,
        hasSections: !!data.sections,
        sectionCount: data.sections ? Object.keys(data.sections).length : 0,
        sectionOrder: data.sectionOrder,
        mainComponentLength: data.mainComponent?.code?.length || 0,
        sections: data.sections ? Object.keys(data.sections).map(id => ({
          id,
          title: data.sections[id].title,
          originalLength: data.sections[id].originalCode?.length || 0,
          transformedLength: data.sections[id].code?.length || 0
        })) : []
      }
    };
    
  } catch (error) {
    logger.error('Debug error:', error);
    return { success: false, error: error.message };
  }
});