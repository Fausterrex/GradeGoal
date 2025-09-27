// ========================================
// AI HELPER UTILITIES
// ========================================
// Utility functions for AI integration and data processing

/**
 * Calculate enhanced achievement probability using AI insights
 * @param {Object} courseData - Course information
 * @param {Object} goalData - Goal information
 * @param {Object} aiAnalysis - AI analysis results
 * @returns {number} Achievement probability percentage
 */
export const calculateEnhancedAchievementProbability = (courseData, goalData, aiAnalysis) => {
  const { currentGPA, progress } = courseData;
  const { targetValue } = goalData;
  
  // If goal is already achieved, return 100% immediately
  if (currentGPA >= targetValue) {
    return 100;
  }
  
  if (!aiAnalysis || !aiAnalysis.targetGoalProbability) {
    // Fallback to basic calculation using the improved gpaConversionUtils function
    const { calculateAchievementProbability } = require('../../course/academic_goal/gpaConversionUtils');
    return calculateAchievementProbability(currentGPA, targetValue, progress || 0);
  }

  const { achievable, probability } = aiAnalysis.targetGoalProbability;
  
  if (!achievable) {
    return 0;
  }

  // Extract probability percentage from string
  const probabilityMatch = probability.match(/(\d+)%/);
  const probabilityValue = probabilityMatch ? parseInt(probabilityMatch[1]) : 50;
  
  // Don't penalize based on course progress - AI should be more optimistic
  // Instead, use progress as a confidence booster
  const progressBonus = Math.min(progress / 100, 1) * 0.1; // Up to 10% bonus
  const adjustedProbability = Math.min(probabilityValue + (progressBonus * 100), 100);
  
  return Math.max(adjustedProbability, 0);
};

// All unused helper functions have been removed
// Only calculateEnhancedAchievementProbability is kept as it's used in aiAnalysisService.js
