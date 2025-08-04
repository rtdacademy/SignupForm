/**
 * Course Items Utility Functions
 * 
 * Creates enriched course items by combining course structure, gradebook data, and schedule data.
 * This utility ensures consistent data across all components that need course item information.
 */

/**
 * Create enriched course items by combining course structure, gradebook, and schedule data
 * @param {Object} course - The complete course object
 * @param {Array} unitsList - Array of course units with items
 * @returns {Array} - Array of enriched course items with gradebook and schedule data
 */
export const createEnrichedCourseItems = (course, unitsList = []) => {
  const items = [];
  const gradebookItems = course?.Gradebook?.items || {};
  const scheduleUnits = course?.ScheduleJSON?.units || [];
  
  // Create a lookup map for schedule data
  const scheduleMap = {};
  scheduleUnits.forEach(unit => {
    if (unit.items && Array.isArray(unit.items)) {
      unit.items.forEach(scheduleItem => {
        if (scheduleItem.itemId && scheduleItem.date) {
          scheduleMap[scheduleItem.itemId] = scheduleItem.date;
        }
      });
    }
  });
  
  unitsList.forEach(unit => {
    if (unit.items && Array.isArray(unit.items)) {
      unit.items.forEach(courseItem => {
        // Skip items without itemId
        if (!courseItem || !courseItem.itemId) {
          console.warn('🔍 CourseItemsUtils: Skipping course item without itemId:', courseItem);
          return;
        }
        
        // Start with the original course item
        const enrichedItem = { ...courseItem };
        
        // Try to find matching gradebook data with ID format fallbacks
        let gradebookItem = null;
        let matchedGradebookKey = null;
        
        // Try original itemId first
        if (gradebookItems[courseItem.itemId]) {
          gradebookItem = gradebookItems[courseItem.itemId];
          matchedGradebookKey = courseItem.itemId;
        }
        // Try with underscores instead of hyphens
        else if (!gradebookItem) {
          const underscoreId = courseItem.itemId.replace(/-/g, '_');
          if (gradebookItems[underscoreId]) {
            gradebookItem = gradebookItems[underscoreId];
            matchedGradebookKey = underscoreId;
          }
        }
        // Try with hyphens instead of underscores
        else if (!gradebookItem) {
          const hyphenId = courseItem.itemId.replace(/_/g, '-');
          if (gradebookItems[hyphenId]) {
            gradebookItem = gradebookItems[hyphenId];
            matchedGradebookKey = hyphenId;
          }
        }
        // Try removing course prefix (e.g., "2l1_3" -> "l1_3")
        else if (!gradebookItem && courseItem.itemId.match(/^\d+/)) {
          const withoutPrefix = courseItem.itemId.replace(/^\d+/, '');
          if (gradebookItems[withoutPrefix]) {
            gradebookItem = gradebookItems[withoutPrefix];
            matchedGradebookKey = withoutPrefix;
          }
        }
        
        // Add gradebook data if found
        if (gradebookItem) {
          enrichedItem.score = gradebookItem.score || 0;
          enrichedItem.total = gradebookItem.total || 0;
          enrichedItem.percentage = gradebookItem.percentage || 0;
          enrichedItem.attempted = gradebookItem.attempted || 0;
          enrichedItem.source = gradebookItem.source || 'unknown';
          enrichedItem.completed = gradebookItem.completed || false;
          enrichedItem.strategy = gradebookItem.strategy;
          enrichedItem.sessionId = gradebookItem.sessionId;
          enrichedItem.examItemId = gradebookItem.examItemId;
          enrichedItem.sessionsCount = gradebookItem.sessionsCount || 0;
          enrichedItem.completedSessionsCount = gradebookItem.completedSessionsCount || 0;
          enrichedItem.sessionStatus = gradebookItem.sessionStatus;
          enrichedItem.sessionProgress = gradebookItem.sessionProgress || 0;
          enrichedItem.hasGradebookData = true;
          enrichedItem.matchedGradebookKey = matchedGradebookKey;
        } else {
          // No gradebook data found
          enrichedItem.score = 0;
          enrichedItem.total = 0;
          enrichedItem.percentage = 0;
          enrichedItem.attempted = 0;
          enrichedItem.source = 'none';
          enrichedItem.completed = false;
          enrichedItem.sessionsCount = 0;
          enrichedItem.completedSessionsCount = 0;
          enrichedItem.sessionStatus = null;
          enrichedItem.sessionProgress = 0;
          enrichedItem.hasGradebookData = false;
          enrichedItem.matchedGradebookKey = null;
        }
        
        // Add schedule data if available
        const scheduledDate = scheduleMap[courseItem.itemId];
        if (scheduledDate) {
          enrichedItem.scheduledDate = scheduledDate;
          enrichedItem.hasScheduleData = true;
          
          // Calculate overdue status and days
          const dueDate = new Date(scheduledDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          dueDate.setHours(0, 0, 0, 0);
          
          const diffDays = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            enrichedItem.isOverdue = true;
            enrichedItem.daysSinceDue = Math.abs(diffDays);
            enrichedItem.daysUntilDue = null;
          } else {
            enrichedItem.isOverdue = false;
            enrichedItem.daysSinceDue = null;
            enrichedItem.daysUntilDue = diffDays;
          }
        } else {
          enrichedItem.scheduledDate = null;
          enrichedItem.hasScheduleData = false;
          enrichedItem.isOverdue = false;
          enrichedItem.daysSinceDue = null;
          enrichedItem.daysUntilDue = null;
        }
        
        items.push(enrichedItem);
      });
    }
  });
  
  return items;
};

/**
 * Get course units list from course data
 * @param {Object} course - The course object
 * @returns {Array} - Array of course units
 */
export const getCourseUnitsList = (course) => {
  // First priority: check courseDetails course-config courseStructure (database-driven from backend config)
  if (course?.courseDetails?.['course-config']?.courseStructure?.units) {
    return course.courseDetails['course-config'].courseStructure.units;
  }
  
  // First priority alternate: check courseDetails course-config gradebook courseStructure (for server-side configs)
  else if (course?.courseDetails?.['course-config']?.gradebook?.courseStructure?.units) {
    return course.courseDetails['course-config'].gradebook.courseStructure.units;
  }
  
  // Second priority: check gradebook courseStructure (legacy database path)
  else if (course?.Gradebook?.courseStructure?.units) {
    return course.Gradebook.courseStructure.units;
  }
  
  // Third priority: check gradebook courseConfig courseStructure (alternate teacher view path)
  else if (course?.Gradebook?.courseConfig?.courseStructure?.units) {
    return course.Gradebook.courseConfig.courseStructure.units;
  }
  
  // Fourth priority: check direct courseStructure path (legacy JSON file approach)
  else if (course?.courseStructure?.structure) {
    return course.courseStructure.structure;
  }
  else if (course?.courseStructure?.units) {
    return course.courseStructure.units;
  }
  
  // Fifth priority: check ScheduleJSON.units (may contain course structure)
  else if (course?.ScheduleJSON?.units) {
    return course.ScheduleJSON.units;
  }
  
  // Sixth priority: check Gradebook.metadata for course structure
  else if (course?.Gradebook?.metadata?.courseStructure?.units) {
    return course.Gradebook.metadata.courseStructure.units;
  }
  
  return [];
};

/**
 * Create enriched course items from course object (single source of truth)
 * @param {Object} course - The complete course object
 * @returns {Array} - Array of enriched course items with gradebook and schedule data
 */
export const createAllCourseItems = (course) => {
  const unitsList = getCourseUnitsList(course);
  const enrichedItems = createEnrichedCourseItems(course, unitsList);
  
  return enrichedItems;
};