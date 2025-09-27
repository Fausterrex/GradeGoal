// ========================================
// AI ANALYSIS SERVICE
// ========================================
// Service to manage AI analysis data across components

import { getAIRecommendations } from './geminiService';
import { saveAIAnalysisData, loadAIAnalysisFromDatabase } from './aiDatabaseService';

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
  console.log('🗑️ [clearAIAnalysisData] Clearing AI analysis data');
  aiAnalysisData = null;
  // Notify listeners that data was cleared
  aiAnalysisListeners.forEach(listener => listener(null));
};

/**
 * Set AI analysis data and notify listeners
 */
export const setAIAnalysisData = (data) => {
  console.log('🔧 setAIAnalysisData called with:', {
    hasData: !!data,
    hasContent: !!data?.content,
    contentType: typeof data?.content,
    dataKeys: data ? Object.keys(data) : 'no data'
  });
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
  console.log('🎯 [getAchievementProbability] Starting calculation...');
  console.log('🎯 [getAchievementProbability] AI Analysis Data:', {
    hasData: !!aiAnalysisData,
    hasContent: !!aiAnalysisData?.content,
    contentType: typeof aiAnalysisData?.content,
    dataKeys: aiAnalysisData ? Object.keys(aiAnalysisData) : 'no data'
  });
  
  if (!aiAnalysisData || !aiAnalysisData.content) {
    console.log('🎯 [getAchievementProbability] No AI analysis data available');
    return null;
  }
  
  return getAchievementProbabilityFromData(aiAnalysisData);
};

/**
 * Get achievement probability data from provided analysis data
 */
export const getAchievementProbabilityFromData = (analysisData) => {
  console.log('🎯 [getAchievementProbabilityFromData] Starting calculation...');
  console.log('🎯 [getAchievementProbabilityFromData] Analysis Data:', {
    hasData: !!analysisData,
    hasContent: !!analysisData?.content,
    contentType: typeof analysisData?.content,
    dataKeys: analysisData ? Object.keys(analysisData) : 'no data'
  });
  
  if (!analysisData || !analysisData.content) {
    console.log('🎯 [getAchievementProbabilityFromData] No analysis data available');
    return null;
  }
  
  try {
    const content = typeof analysisData.content === 'string' 
      ? JSON.parse(analysisData.content) 
      : analysisData.content;
    
    console.log('🎯 [getAchievementProbabilityFromData] Parsed content keys:', Object.keys(content));
    
    // Check for new enhanced structure first
    if (content.targetGoalProbability) {
      console.log('🎯 [getAchievementProbabilityFromData] Found targetGoalProbability:', content.targetGoalProbability);
      console.log('🎯 [getAchievementProbabilityFromData] Probability value:', content.targetGoalProbability.probability);
      return content.targetGoalProbability;
    }
    
    // Fallback to old structure
    if (content.achievementProbability) {
      console.log('🎯 [getAchievementProbabilityFromData] Found achievementProbability (fallback):', content.achievementProbability);
      return content.achievementProbability;
    }
    
    console.log('🎯 [getAchievementProbabilityFromData] No probability data found in content');
    return null;
  } catch (error) {
    console.error('🎯 [getAchievementProbabilityFromData] Error parsing achievement probability:', error);
    return null;
  }
};

/**
 * Load AI analysis data for a course (enhanced version that handles both database and generation)
 */
export const loadAIAnalysisForCourse = async (userId, courseId, forceRefresh = false) => {
  try {
    console.log('🔄 [loadAIAnalysisForCourse] Loading AI analysis for user:', userId, 'course:', courseId);
    
    // If force refresh is requested, clear cache first
    if (forceRefresh) {
      const { clearAIAnalysisCache } = await import('./geminiService');
      clearAIAnalysisCache(userId, courseId);
      console.log('🔄 [loadAIAnalysisForCourse] Cache cleared for fresh analysis');
    }
    
    // First, check if we have cached analysis data in memory
    if (aiAnalysisData && aiAnalysisData.userId === userId && aiAnalysisData.courseId === courseId && !forceRefresh) {
      console.log('✅ [loadAIAnalysisForCourse] Using cached analysis data');
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
    console.log('❌ [loadAIAnalysisForCourse] No existing analysis found in database');
    clearAIAnalysisData();
    return null;
  } catch (error) {
    console.error('❌ [loadAIAnalysisForCourse] Error loading AI analysis:', error);
    return null;
  }
};
