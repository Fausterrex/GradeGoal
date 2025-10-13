// ========================================
// AI CONFIDENCE CALCULATION UTILITIES
// ========================================
// Utility functions for calculating AI analysis confidence scores
// Based on data quality, performance patterns, and analysis completeness

import { calculateCurrentGrade, calculateGPAFromPercentage } from "./achievementProbabilityUtils.js";

/**
 * Calculate confidence score for AI analysis based on multiple factors
 * @param {Object} courseData - Course data including grades, categories, etc.
 * @param {Object} goalData - Goal data including target value and type
 * @param {Object} aiResponse - AI response data
 * @param {Object} performancePatterns - Performance pattern analysis
 * @returns {number} Confidence score between 0.0 and 1.0
 */
export const calculateAIConfidence = (courseData, goalData, aiResponse, performancePatterns = null) => {
  console.log('🎯 [CONFIDENCE DEBUG] Starting confidence calculation');
  
  const factors = {
    dataQuality: calculateDataQualityScore(courseData),
    performanceConsistency: calculatePerformanceConsistencyScore(courseData),
    goalAchievability: calculateGoalAchievabilityScore(courseData, goalData),
    analysisCompleteness: calculateAnalysisCompletenessScore(aiResponse),
    historicalAccuracy: calculateHistoricalAccuracyScore(courseData),
    dataVolume: calculateDataVolumeScore(courseData)
  };
  
  console.log('🎯 [CONFIDENCE DEBUG] Individual factor scores:', factors);
  
  // Weighted average of all factors
  const weights = {
    dataQuality: 0.25,           // 25% - Quality of input data
    performanceConsistency: 0.20, // 20% - How consistent the performance is
    goalAchievability: 0.20,     // 20% - How achievable the goal is
    analysisCompleteness: 0.15,  // 15% - How complete the AI analysis is
    historicalAccuracy: 0.10,    // 10% - Historical prediction accuracy
    dataVolume: 0.10             // 10% - Amount of data available
  };
  
  const weightedScore = Object.keys(factors).reduce((total, key) => {
    return total + (factors[key] * weights[key]);
  }, 0);
  
  // Apply confidence modifiers based on special conditions
  const finalConfidence = applyConfidenceModifiers(weightedScore, courseData, goalData, factors);
  
  console.log('🎯 [CONFIDENCE DEBUG] Final confidence score:', finalConfidence);
  
  return Math.max(0.1, Math.min(1.0, finalConfidence)); // Clamp between 0.1 and 1.0
};

/**
 * Calculate data quality score based on completeness and accuracy
 */
export const calculateDataQualityScore = (courseData) => {
  const { grades, categories, currentGPA } = courseData;
  
  let score = 0.5; // Base score
  
  // Check for missing or invalid data
  if (!grades || !categories || !currentGPA) {
    return 0.2; // Very low confidence with missing core data
  }
  
  // Check data completeness
  const totalCategories = categories.length;
  const categoriesWithData = categories.filter(cat => {
    const categoryGrades = grades[cat.id] || [];
    return categoryGrades.length > 0;
  }).length;
  
  const dataCompleteness = totalCategories > 0 ? categoriesWithData / totalCategories : 0;
  score += dataCompleteness * 0.3;
  
  // Check for realistic GPA values
  const gpa = parseFloat(currentGPA);
  if (gpa >= 0 && gpa <= 4.0) {
    score += 0.2;
  }
  
  return Math.min(1.0, score);
};

/**
 * Calculate performance consistency score
 */
export const calculatePerformanceConsistencyScore = (courseData) => {
  const { grades, categories } = courseData;
  
  if (!grades || !categories) return 0.3;
  
  let totalVariance = 0;
  let categoryCount = 0;
  
  categories.forEach(category => {
    const categoryGrades = grades[category.id] || [];
    if (categoryGrades.length > 1) {
      const scores = categoryGrades.map(grade => grade.percentageScore || 0);
      const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
      totalVariance += variance;
      categoryCount++;
    }
  });
  
  if (categoryCount === 0) return 0.5; // No data to assess consistency
  
  const averageVariance = totalVariance / categoryCount;
  
  // Lower variance = higher consistency = higher confidence
  // Variance of 0-100: 0-25 = high consistency, 25-50 = medium, 50+ = low
  if (averageVariance <= 25) return 1.0;
  if (averageVariance <= 50) return 0.7;
  if (averageVariance <= 100) return 0.4;
  return 0.2;
};

/**
 * Calculate goal achievability score
 */
export const calculateGoalAchievabilityScore = (courseData, goalData) => {
  const { currentGPA } = courseData;
  const { targetValue, goalType } = goalData;
  
  if (!currentGPA || !targetValue) return 0.5;
  
  const currentGPAValue = parseFloat(currentGPA);
  let targetGPA;
  
  if (goalType === 'COURSE_GRADE') {
    // Convert percentage to GPA
    const targetPercentage = parseFloat(targetValue);
    targetGPA = calculateGPAFromPercentage(targetPercentage);
  } else {
    targetGPA = parseFloat(targetValue);
  }
  
  const gap = targetGPA - currentGPAValue;
  
  // Reasonable gaps get higher confidence
  if (gap <= 0) return 1.0; // Already achieved
  if (gap <= 0.5) return 0.9; // Very achievable
  if (gap <= 1.0) return 0.7; // Achievable with effort
  if (gap <= 1.5) return 0.5; // Challenging but possible
  if (gap <= 2.0) return 0.3; // Very difficult
  return 0.1; // Nearly impossible
};

/**
 * Calculate analysis completeness score
 */
export const calculateAnalysisCompletenessScore = (aiResponse) => {
  if (!aiResponse) return 0.2;
  
  let score = 0.2; // Base score
  
  // Check for key analysis components
  const requiredFields = [
    'predictedFinalGrade',
    'targetGoalAnalysis', 
    'topPriorityRecommendations',
    'focusIndicators'
  ];
  
  const presentFields = requiredFields.filter(field => aiResponse[field]);
  score += (presentFields.length / requiredFields.length) * 0.6;
  
  // Check for detailed recommendations
  if (aiResponse.topPriorityRecommendations && 
      aiResponse.topPriorityRecommendations.length >= 3) {
    score += 0.2;
  }
  
  return Math.min(1.0, score);
};

/**
 * Calculate historical accuracy score (placeholder for future implementation)
 */
export const calculateHistoricalAccuracyScore = (courseData) => {
  // This would ideally track historical prediction accuracy
  // For now, return a moderate score
  return 0.6;
};

/**
 * Calculate data volume score
 */
export const calculateDataVolumeScore = (courseData) => {
  const { grades, categories } = courseData;
  
  if (!grades || !categories) return 0.2;
  
  let totalAssessments = 0;
  categories.forEach(category => {
    const categoryGrades = grades[category.id] || [];
    totalAssessments += categoryGrades.length;
  });
  
  // More data = higher confidence
  if (totalAssessments >= 10) return 1.0;
  if (totalAssessments >= 7) return 0.8;
  if (totalAssessments >= 5) return 0.6;
  if (totalAssessments >= 3) return 0.4;
  if (totalAssessments >= 1) return 0.3;
  return 0.1;
};

/**
 * Apply confidence modifiers based on special conditions
 */
export const applyConfidenceModifiers = (baseScore, courseData, goalData, factors) => {
  let modifiedScore = baseScore;
  
  // Boost confidence for consistent high performers
  if (factors.performanceConsistency >= 0.8 && factors.dataQuality >= 0.7) {
    modifiedScore += 0.1;
  }
  
  // Reduce confidence for very new courses (low data volume)
  if (factors.dataVolume < 0.3) {
    modifiedScore -= 0.2;
  }
  
  // Reduce confidence for unrealistic goals
  if (factors.goalAchievability < 0.3) {
    modifiedScore -= 0.15;
  }
  
  // Boost confidence for well-established patterns
  if (factors.performanceConsistency >= 0.7 && factors.dataVolume >= 0.6) {
    modifiedScore += 0.05;
  }
  
  return Math.max(0.1, Math.min(1.0, modifiedScore));
};

/**
 * Get confidence level description
 */
export const getConfidenceLevel = (confidenceScore) => {
  if (confidenceScore >= 0.8) return 'HIGH';
  if (confidenceScore >= 0.6) return 'MEDIUM';
  return 'LOW';
};

/**
 * Get confidence explanation
 */
export const getConfidenceExplanation = (confidenceScore, factors) => {
  const level = getConfidenceLevel(confidenceScore);
  
  let explanation = `Confidence: ${level} (${Math.round(confidenceScore * 100)}%)`;
  
  if (factors.dataQuality < 0.5) {
    explanation += ' - Limited by data quality';
  }
  if (factors.dataVolume < 0.4) {
    explanation += ' - Based on limited assessment data';
  }
  if (factors.performanceConsistency < 0.5) {
    explanation += ' - Performance patterns are inconsistent';
  }
  if (factors.goalAchievability < 0.4) {
    explanation += ' - Goal may be challenging to achieve';
  }
  
  return explanation;
};


