import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

const GradebookContext = createContext();

// Helper function to get category weights
const getCategoryWeight = (type) => {
  const weights = {
    lesson: 15,
    assignment: 35,
    exam: 35,
    project: 15,
    lab: 0
  };
  return weights[type] || 15;
};


export const useGradebook = () => {
  const context = useContext(GradebookContext);
  if (!context) {
    throw new Error('useGradebook must be used within a GradebookProvider');
  }
  return context;
};

export const GradebookProvider = ({ children, course }) => {
  // Extract gradebook data from course prop
  const gradebook = course?.Gradebook || null;
  const assessments = course?.Assessments || {};
  
  // State for loading courseConfig if not provided
  const [loadedCourseConfig, setLoadedCourseConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);
  
  // Look for course config data that contains gradebook structure
  const providedCourseConfig = course?.courseConfig || course?.courseDetails?.courseConfig || null;
  const courseConfig = providedCourseConfig || loadedCourseConfig;
  
  // Load courseConfig if not provided and we have a courseId
  useEffect(() => {
    const loadCourseConfig = async () => {
      if (providedCourseConfig || configLoading || loadedCourseConfig) return;
      
      const courseId = course?.CourseID || course?.courseId;
      if (!courseId) return;
      
      try {
        setConfigLoading(true);
        console.log("🔄 Loading course config for course ID:", courseId);
        
        const functions = getFunctions();
        const getCourseConfig = httpsCallable(functions, 'getCourseConfigV2');
        
        const result = await getCourseConfig({ courseId: courseId.toString() });
        
        if (result.data.success) {
          console.log("✅ Course config loaded successfully:", result.data.courseConfig);
          setLoadedCourseConfig(result.data.courseConfig);
        } else {
          console.error("❌ Failed to load course config:", result.data.error || result.data.message);
        }
      } catch (error) {
        console.error("❌ Error loading course config:", error);
      } finally {
        setConfigLoading(false);
      }
    };
    
    loadCourseConfig();
  }, [course?.CourseID, course?.courseId, providedCourseConfig, configLoading, loadedCourseConfig]);
  
  // Calculate derived values
  const gradebookData = useMemo(() => {
    // Always create a gradebook structure, even if no student data exists yet
    const hasStudentData = gradebook && Object.keys(gradebook).length > 0;
    
    // Initialize from course config gradebook structure
    const initializeFromCourseConfig = () => {
      console.log("🔍 Initializing gradebook from course config:", courseConfig);
      
      if (!courseConfig?.gradebook?.itemStructure) {
        console.log("⚠️ No course config gradebook structure found");
        return {
          summary: {
            totalPoints: 0,
            possiblePoints: 0,
            percentage: 0,
            isPassing: false,
            passingGrade: 60,
            status: 'active',
            lastUpdated: Date.now()
          },
          categories: {},
          items: {},
          assessments: {},
          hasData: false
        };
      }

      const gradebookStructure = courseConfig.gradebook.itemStructure;
      const categories = {};
      const items = {};
      let totalPossiblePoints = 0;
      let totalEarnedPoints = 0;

      console.log("📊 Processing gradebook items:", Object.keys(gradebookStructure));

      // Process each item from the course config gradebook structure
      Object.entries(gradebookStructure).forEach(([itemId, itemConfig]) => {
        const itemType = itemConfig.type || 'lesson';
        
        // Calculate totalPoints automatically from question points
        const itemQuestions = itemConfig.questions || [];
        const calculatedTotalPoints = itemQuestions.reduce((sum, question) => sum + (question.points || 0), 0);
        const itemTotalPoints = calculatedTotalPoints;
        
        console.log(`📋 Item ${itemId}: ${itemQuestions.length} questions, ${itemTotalPoints} total points`);
        
        // Initialize category if not exists
        if (!categories[itemType]) {
          categories[itemType] = {
            categoryWeight: getCategoryWeight(itemType),
            earned: 0,
            possible: 0,
            percentage: 0,
            items: [],
            totalWeight: 0,
            useIndividualWeights: false,
            weightedScore: 0
          };
        }

        // Check if student has attempted any questions for this item
        let earnedPoints = 0;
        let totalAttempts = 0;
        let lastAttemptTime = null;

        itemQuestions.forEach(question => {
          const questionData = assessments[question.questionId];
          if (questionData) {
            earnedPoints += questionData.score || 0;
            totalAttempts += questionData.attempts || 0;
            if (questionData.lastAttempt && (!lastAttemptTime || questionData.lastAttempt > lastAttemptTime)) {
              lastAttemptTime = questionData.lastAttempt;
            }
          }
        });

        const itemPercentage = itemTotalPoints > 0 ? Math.round((earnedPoints / itemTotalPoints) * 100) : 0;

        // Add to items
        items[itemId] = {
          attempts: totalAttempts,
          bestScore: earnedPoints,
          courseStructureItemId: itemId,
          estimatedTime: 0,
          lastAttempt: lastAttemptTime,
          maxScore: itemTotalPoints,
          required: true,
          score: earnedPoints,
          status: earnedPoints > 0 ? 'completed' : 'not_started',
          timeSpent: 0,
          title: itemConfig.title,
          type: itemType,
          unitId: 'main_unit',
          weight: 0,
          contentPath: itemConfig.contentPath,
          questions: itemQuestions
        };

        // Add to category
        categories[itemType].items.push({
          id: itemId,
          maxScore: itemTotalPoints,
          percentage: itemPercentage,
          score: earnedPoints,
          title: itemConfig.title,
          type: itemType,
          weight: 0
        });

        categories[itemType].earned += earnedPoints;
        categories[itemType].possible += itemTotalPoints;
        
        totalEarnedPoints += earnedPoints;
        totalPossiblePoints += itemTotalPoints;
      });

      // Calculate category percentages
      Object.keys(categories).forEach(categoryType => {
        const category = categories[categoryType];
        category.percentage = category.possible > 0 ? Math.round((category.earned / category.possible) * 100) : 0;
        category.weightedScore = (category.percentage * category.categoryWeight) / 100;
        
        console.log(`📊 Category ${categoryType}: ${category.earned}/${category.possible} points (${category.percentage}%)`);
      });

      const overallPercentage = totalPossiblePoints > 0 ? Math.round((totalEarnedPoints / totalPossiblePoints) * 100) : 0;
      const passingGrade = courseConfig.globalSettings?.passingGrade || 60;

      // Calculate and log final totals for verification
      const calculatedCategoryTotals = {};
      Object.entries(categories).forEach(([type, category]) => {
        calculatedCategoryTotals[type] = category.possible;
      });

      console.log("✅ Gradebook initialized:", {
        totalEarnedPoints,
        totalPossiblePoints,
        overallPercentage,
        categoriesCount: Object.keys(categories).length,
        itemsCount: Object.keys(items).length,
        calculatedCategoryTotals,
        passingGrade
      });

      return {
        summary: {
          totalPoints: totalEarnedPoints,
          possiblePoints: totalPossiblePoints,
          percentage: overallPercentage,
          isPassing: overallPercentage >= passingGrade,
          passingGrade: passingGrade,
          status: 'active',
          lastUpdated: Date.now(),
          totalWeight: Object.values(categories).reduce((sum, cat) => sum + cat.categoryWeight, 0),
          weightedScore: Object.values(categories).reduce((sum, cat) => sum + cat.weightedScore, 0)
        },
        categories,
        items,
        assessments,
        hasData: true
      };
    };

    // If we have student gradebook data, use it; otherwise initialize from course config
    if (!hasStudentData) {
      return initializeFromCourseConfig();
    }

    // Get assessment details for each gradebook item
    const enrichedItems = {};
    Object.entries(gradebook.items || {}).forEach(([itemId, item]) => {
      enrichedItems[itemId] = {
        ...item,
        assessmentData: assessments[itemId] || null
      };
    });

    return {
      summary: gradebook.summary || null,
      categories: gradebook.categories || {},
      items: enrichedItems,
      assessments: assessments,
      hasData: true,
      
      // Helper functions
      getItemById: (itemId) => enrichedItems[itemId] || null,
      getAssessmentById: (assessmentId) => assessments[assessmentId] || null,
      getCategoryItems: (categoryType) => {
        const category = gradebook.categories?.[categoryType];
        return category?.items || [];
      }
    };
  }, [gradebook, assessments, courseConfig, configLoading]);

  return (
    <GradebookContext.Provider value={gradebookData}>
      {children}
    </GradebookContext.Provider>
  );
};