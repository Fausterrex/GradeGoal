// ========================================
// AI ANALYSIS SERVICE
// ========================================
// Service to manage AI analysis data across components

import { getAIRecommendations } from './geminiService';

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
  if (!aiAnalysisData || !aiAnalysisData.content) return null;
  
  try {
    const content = typeof aiAnalysisData.content === 'string' 
      ? JSON.parse(aiAnalysisData.content) 
      : aiAnalysisData.content;
    
    
    // Check for new enhanced structure first
    if (content.targetGoalProbability) {
      return content.targetGoalProbability;
    }
    
    // Fallback to old structure
    return content.achievementProbability || null;
  } catch (error) {
    console.error('Error parsing achievement probability:', error);
    return null;
  }
};

/**
 * Load AI analysis data for a course
 */
export const loadAIAnalysisForCourse = async (userId, courseId) => {
  try {
    const recommendations = await getAIRecommendations(userId, courseId);
    if (recommendations && recommendations.length > 0) {
      const analysisData = recommendations[0]; // Get the first (most recent) analysis
      setAIAnalysisData(analysisData);
      return analysisData;
    }
    return null;
  } catch (error) {
    console.error('Error loading AI analysis:', error);
    return null;
  }
};
