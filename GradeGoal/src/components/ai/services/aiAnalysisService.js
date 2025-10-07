// ========================================
// AI ANALYSIS SERVICE
// ========================================
// Service to manage AI analysis data across components

import { getAIRecommendations } from "./geminiService";
import { saveAIAnalysisData, loadAIAnalysisFromDatabase } from "./aiDatabaseService";
// Store for AI analysis data
let aiAnalysisData = null;
let aiAnalysisListeners = [];

/**
 * Get current AI analysis data
 */
export const getCurrentAIAnalysis = () => {
  return aiAnalysisData;
};

/**
 * Clear AI analysis data
 */
export const clearAIAnalysisData = () => {
  aiAnalysisData = null;
  // Notify listeners that data was cleared
  aiAnalysisListeners.forEach(listener => listener(null));
};

/**
 * Set AI analysis data and notify listeners
 */
export const setAIAnalysisData = (data) => {
  aiAnalysisData = data;
  aiAnalysisListeners.forEach(listener => listener(data));
};


/**
 * Subscribe to AI analysis data changes
 */
export const subscribeToAIAnalysis = (listener) => {
  aiAnalysisListeners.push(listener);
  return () => {
    aiAnalysisListeners = aiAnalysisListeners.filter(l => l !== listener);
  };
};

/**
 * Get focus indicators for a specific category
 */
export const getFocusIndicatorForCategory = (categoryName) => {
  if (!aiAnalysisData || !aiAnalysisData.content || !categoryName) {
    return null;
  }
  
  try {
    const content = typeof aiAnalysisData.content === 'string' 
      ? JSON.parse(aiAnalysisData.content) 
      : aiAnalysisData.content;
    
    // Try both singular and plural forms
    const categoryKey = categoryName.toLowerCase();
    const pluralKey = categoryKey + 's';
    
    // First check standard focus indicators
    const standardIndicator = content.focusIndicators?.[categoryKey] || 
                             content.focusIndicators?.[pluralKey];
    
    if (standardIndicator) {
      return standardIndicator;
    }
    
    // Then check empty categories
    if (content.focusIndicators?.emptyCategories && Array.isArray(content.focusIndicators.emptyCategories)) {
      const emptyCategoryIndicator = content.focusIndicators.emptyCategories.find(
        emptyCat => emptyCat.categoryName.toLowerCase() === categoryKey || 
                   emptyCat.categoryName.toLowerCase() === pluralKey
      );
      if (emptyCategoryIndicator) {
        // Convert empty category format to standard focus indicator format
        return {
          needsAttention: emptyCategoryIndicator.needsAttention,
          reason: emptyCategoryIndicator.reason,
          priority: emptyCategoryIndicator.priority,
          recommendations: emptyCategoryIndicator.recommendations,
          isEmptyCategory: true
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing focus indicators:', error);
    return null;
  }
};

/**
 * Get score prediction for a specific assessment
 */
export const getScorePredictionForAssessment = (assessmentName, categoryName) => {
  if (!aiAnalysisData || !aiAnalysisData.content || !categoryName) {
    return null;
  }
  
  try {
    const content = typeof aiAnalysisData.content === 'string' 
      ? JSON.parse(aiAnalysisData.content) 
      : aiAnalysisData.content;
    
    // Try both singular and plural forms
    const categoryKey = categoryName.toLowerCase();
    const pluralKey = categoryKey + 's';
    
    const categoryPredictions = content.scorePredictions?.[categoryKey] || 
                               content.scorePredictions?.[pluralKey];
    
    if (!categoryPredictions) return null;
    
    const result = {
      neededScore: categoryPredictions.neededScore,
      confidence: categoryPredictions.confidence,
      reasoning: `You need to get ${categoryPredictions.neededScore} on this assessment to achieve your target GPA. This will help you reach your academic goal.`
    };
    
    return result;
  } catch (error) {
    console.error('Error parsing score predictions:', error);
    return null;
  }
};

/**
 * Get achievement probability data from global aiAnalysisData
 */
export const getAchievementProbability = () => {
  if (!aiAnalysisData || !aiAnalysisData.content) {
    return null;
  }
  
  return getAchievementProbabilityFromData(aiAnalysisData);
};

/**
 * Get achievement probability data from provided analysis data
 */
export const getAchievementProbabilityFromData = (analysisData) => {
  
  if (!analysisData || !analysisData.content) {
    return null;
  }
  
  try {
    const content = typeof analysisData.content === 'string' 
      ? JSON.parse(analysisData.content) 
      : analysisData.content;
    
    
    // Check for new enhanced structure first
    if (content.targetGoalProbability) {
      return content.targetGoalProbability;
    }
    
    // Fallback to old structure
    if (content.achievementProbability) {
      return content.achievementProbability;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Load AI analysis data for a course (enhanced version that handles both database and generation)
 */
export const loadAIAnalysisForCourse = async (userId, courseId, forceRefresh = false) => {
  try {
    
    // If force refresh is requested, clear cache first
    if (forceRefresh) {
      const { clearAIAnalysisCache } = await import('./geminiService');
      clearAIAnalysisCache(userId, courseId);
    }
    
    // First, check if we have cached analysis data in memory
    if (aiAnalysisData && aiAnalysisData.userId === userId && aiAnalysisData.courseId === courseId && !forceRefresh) {
      return aiAnalysisData;
    }
    
    // Try to load from database first
    const dbAnalysisData = await loadAIAnalysisFromDatabase(userId, courseId);
    if (dbAnalysisData) {
      setAIAnalysisData(dbAnalysisData);
      
      // Also store in memory for getAIRecommendations to find
      const storageKey = `${userId}-${courseId}`;
      const { aiAnalysisStorage } = await import('./geminiService');
      aiAnalysisStorage.set(storageKey, dbAnalysisData);
      
      return dbAnalysisData;
    }
    
    // If no analysis exists in database, clear any cached data for this course
    clearAIAnalysisData();
    return null;
  } catch (error) {
    return null;
  }
};
