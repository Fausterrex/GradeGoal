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
    
    return content.focusIndicators?.[categoryKey] || 
           content.focusIndicators?.[pluralKey] || 
           null;
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
 * Get achievement probability data
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
  
  try {
    const content = typeof aiAnalysisData.content === 'string' 
      ? JSON.parse(aiAnalysisData.content) 
      : aiAnalysisData.content;
    
    console.log('🎯 [getAchievementProbability] Parsed content keys:', Object.keys(content));
    
    // Check for new enhanced structure first
    if (content.targetGoalProbability) {
      console.log('🎯 [getAchievementProbability] Found targetGoalProbability:', content.targetGoalProbability);
      console.log('🎯 [getAchievementProbability] Probability value:', content.targetGoalProbability.probability);
      return content.targetGoalProbability;
    }
    
    // Fallback to old structure
    if (content.achievementProbability) {
      console.log('🎯 [getAchievementProbability] Found achievementProbability (fallback):', content.achievementProbability);
      return content.achievementProbability;
    }
    
    console.log('🎯 [getAchievementProbability] No probability data found in content');
    return null;
  } catch (error) {
    console.error('🎯 [getAchievementProbability] Error parsing achievement probability:', error);
    return null;
  }
};

/**
 * Load AI analysis data for a course (enhanced version that handles both database and generation)
 */
export const loadAIAnalysisForCourse = async (userId, courseId) => {
  try {
    console.log('🔄 [loadAIAnalysisForCourse] Loading AI analysis for user:', userId, 'course:', courseId);
    
    // First, check if we have cached analysis data in memory
    if (aiAnalysisData && aiAnalysisData.userId === userId && aiAnalysisData.courseId === courseId) {
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
    
    // If no analysis exists in database, generate new one
    console.log('🤖 [loadAIAnalysisForCourse] No existing analysis found, generating new analysis...');
    const recommendations = await getAIRecommendations(userId, courseId);
    if (recommendations && recommendations.length > 0) {
      const analysisData = recommendations[0]; // Get the first (most recent) analysis
      
      // Save to database for future use
      try {
        await saveAIAnalysisData(
          userId, 
          courseId, 
          analysisData.content, 
          'COURSE_ANALYSIS'
        );
        console.log('💾 [loadAIAnalysisForCourse] Saved new analysis to database');
      } catch (saveError) {
        console.warn('⚠️ [loadAIAnalysisForCourse] Failed to save analysis to database:', saveError);
        // Continue with in-memory data even if save fails
      }
      
      setAIAnalysisData(analysisData);
      return analysisData;
    }
    
    console.log('❌ [loadAIAnalysisForCourse] No analysis data available');
    return null;
  } catch (error) {
    console.error('❌ [loadAIAnalysisForCourse] Error loading AI analysis:', error);
    return null;
  }
};
