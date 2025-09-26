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

/**
 * Format AI recommendations for display
 * @param {Object} recommendations - Raw AI recommendations
 * @returns {Object} Formatted recommendations
 */
export const formatAIRecommendations = (recommendations) => {
  if (!recommendations || typeof recommendations !== 'object') {
    return {
      predictedFinalGrade: null,
      assessmentRecommendations: [],
      targetGoalProbability: null,
      statusUpdate: null,
      studyHabits: []
    };
  }

  return {
    predictedFinalGrade: recommendations.predictedFinalGrade || null,
    assessmentRecommendations: recommendations.assessmentRecommendations || [],
    targetGoalProbability: recommendations.targetGoalProbability || null,
    statusUpdate: recommendations.statusUpdate || null,
    studyHabits: recommendations.studyHabits || []
  };
};

/**
 * Get priority color scheme for AI recommendations
 * @param {string} priority - Priority level
 * @returns {Object} Color scheme object
 */
export const getPriorityColorScheme = (priority) => {
  const schemes = {
    HIGH: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      badge: 'bg-red-100 text-red-700'
    },
    MEDIUM: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700'
    },
    LOW: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600',
      badge: 'bg-green-100 text-green-700'
    }
  };

  return schemes[priority] || schemes.MEDIUM;
};

/**
 * Validate AI recommendation data
 * @param {Object} recommendation - Recommendation object
 * @returns {boolean} Whether the recommendation is valid
 */
export const validateAIRecommendation = (recommendation) => {
  if (!recommendation || typeof recommendation !== 'object') {
    return false;
  }

  const requiredFields = ['courseId', 'userId', 'title', 'content'];
  return requiredFields.every(field => recommendation.hasOwnProperty(field));
};

/**
 * Extract key insights from AI analysis
 * @param {Object} aiAnalysis - AI analysis object
 * @returns {Array} Array of key insights
 */
export const extractKeyInsights = (aiAnalysis) => {
  const insights = [];

  if (aiAnalysis?.predictedFinalGrade?.reasoning) {
    insights.push(aiAnalysis.predictedFinalGrade.reasoning);
  }

  if (aiAnalysis?.targetGoalProbability?.recommendations) {
    insights.push(aiAnalysis.targetGoalProbability.recommendations);
  }

  if (aiAnalysis?.statusUpdate?.keyInsights) {
    insights.push(...aiAnalysis.statusUpdate.keyInsights);
  }

  return insights;
};

/**
 * Calculate AI confidence score
 * @param {Object} aiAnalysis - AI analysis object
 * @returns {number} Confidence score (0-100)
 */
export const calculateAIConfidence = (aiAnalysis) => {
  if (!aiAnalysis) return 0;

  let confidence = 50; // Base confidence

  // Adjust based on predicted final grade confidence
  if (aiAnalysis.predictedFinalGrade?.confidence) {
    const gradeConfidence = {
      'HIGH': 90,
      'MEDIUM': 70,
      'LOW': 50
    };
    confidence = gradeConfidence[aiAnalysis.predictedFinalGrade.confidence] || 50;
  }

  // Adjust based on goal probability
  if (aiAnalysis.targetGoalProbability?.achievable) {
    confidence += 10;
  }

  // Adjust based on status trend
  if (aiAnalysis.statusUpdate?.trend === 'improving') {
    confidence += 10;
  } else if (aiAnalysis.statusUpdate?.trend === 'declining') {
    confidence -= 10;
  }

  return Math.max(0, Math.min(100, confidence));
};

/**
 * Generate AI summary for quick overview
 * @param {Object} aiAnalysis - AI analysis object
 * @returns {string} Summary text
 */
export const generateAISummary = (aiAnalysis) => {
  if (!aiAnalysis) return 'No AI analysis available';

  const { predictedFinalGrade, targetGoalProbability, statusUpdate } = aiAnalysis;

  let summary = '';

  if (predictedFinalGrade) {
    summary += `Predicted final grade: ${predictedFinalGrade.percentage || 'N/A'} `;
  }

  if (targetGoalProbability) {
    summary += `Goal achievement: ${targetGoalProbability.probability || 'N/A'} `;
  }

  if (statusUpdate) {
    summary += `Status: ${statusUpdate.currentStatus || 'Unknown'} `;
  }

  return summary.trim() || 'AI analysis completed';
};

/**
 * Check if AI analysis is recent (within last 7 days)
 * @param {string} generatedAt - ISO timestamp
 * @returns {boolean} Whether analysis is recent
 */
export const isRecentAIAnalysis = (generatedAt) => {
  if (!generatedAt) return false;
  
  const analysisDate = new Date(generatedAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return analysisDate > sevenDaysAgo;
};

/**
 * Get AI recommendation type display name
 * @param {string} type - Recommendation type
 * @returns {string} Display name
 */
export const getRecommendationTypeDisplayName = (type) => {
  const typeMap = {
    'AI_ANALYSIS': 'AI Analysis',
    'PREDICTED_GRADE': 'Grade Prediction',
    'ASSESSMENT_RECOMMENDATION': 'Assessment Advice',
    'GOAL_PROBABILITY': 'Goal Probability',
    'STATUS_UPDATE': 'Status Update',
    'STUDY_HABITS': 'Study Habits'
  };

  return typeMap[type] || type;
};

/**
 * Sort AI recommendations by priority and date
 * @param {Array} recommendations - Array of recommendations
 * @returns {Array} Sorted recommendations
 */
export const sortAIRecommendations = (recommendations) => {
  if (!Array.isArray(recommendations)) return [];

  const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  return recommendations.sort((a, b) => {
    // First by priority
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;

    // Then by date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};

/**
 * Filter AI recommendations by type
 * @param {Array} recommendations - Array of recommendations
 * @param {string} type - Recommendation type to filter by
 * @returns {Array} Filtered recommendations
 */
export const filterAIRecommendationsByType = (recommendations, type) => {
  if (!Array.isArray(recommendations)) return [];
  if (!type) return recommendations;

  return recommendations.filter(rec => rec.recommendationType === type);
};

/**
 * Get AI recommendation statistics
 * @param {Array} recommendations - Array of recommendations
 * @returns {Object} Statistics object
 */
export const getAIRecommendationStats = (recommendations) => {
  if (!Array.isArray(recommendations)) {
    return {
      total: 0,
      unread: 0,
      highPriority: 0,
      recent: 0
    };
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    total: recommendations.length,
    unread: recommendations.filter(rec => !rec.isRead).length,
    highPriority: recommendations.filter(rec => rec.priority === 'HIGH').length,
    recent: recommendations.filter(rec => 
      new Date(rec.createdAt) > sevenDaysAgo
    ).length
  };
};
