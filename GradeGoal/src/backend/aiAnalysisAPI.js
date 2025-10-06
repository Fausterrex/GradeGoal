// ========================================
// AI ANALYSIS API
// ========================================
// Centralized API functions for AI-related operations
// Handles AI recommendations, analysis, and predictions

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");

// ========================================
// AI RECOMMENDATIONS
// ========================================

/**
 * Save AI analysis to recommendations table
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @param {Object} analysisData - Analysis data
 * @param {string} analysisType - Type of analysis (default: 'COURSE_ANALYSIS')
 * @param {string} aiModel - AI model used (default: 'gemini-2.0-flash-exp')
 * @param {number} confidence - Confidence level (default: 0.85)
 * @returns {Promise<Object>} Save result
 */
export async function saveAIAnalysis(userId, courseId, analysisData, analysisType = 'COURSE_ANALYSIS', aiModel = 'gemini-2.0-flash-exp', confidence = 0.85) {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/save-ai-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      courseId,
      analysisData: analysisData, // Pass as object, not string
      aiModel,
      confidence
    }),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to save AI analysis with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get AI recommendations for a user
 * @param {number} userId - User ID
 * @returns {Promise<Object>} AI recommendations data
 */
export async function getAIRecommendations(userId) {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/user/${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to get AI recommendations with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get AI recommendations for a specific course
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course-specific AI recommendations
 */
export async function getAIRecommendationsForCourse(userId, courseId) {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/user/${userId}/course/${courseId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to get AI recommendations for course with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Mark recommendation as read
 * @param {number} recommendationId - Recommendation ID
 * @returns {Promise<Object>} Mark as read result
 */
export async function markRecommendationAsRead(recommendationId) {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/${recommendationId}/mark-read`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to mark recommendation as read with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Dismiss recommendation
 * @param {number} recommendationId - Recommendation ID
 * @returns {Promise<Object>} Dismiss result
 */
export async function dismissRecommendation(recommendationId) {
  const response = await fetch(`${API_BASE_URL}/api/recommendations/${recommendationId}/dismiss`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to dismiss recommendation with status ${response.status}`
    );
  }
  
  return response.json();
}

// ========================================
// LEGACY AI ANALYSIS FUNCTIONS
// ========================================

/**
 * Get AI analysis from database (legacy function - now redirects to recommendations)
 * @deprecated Use getAIRecommendationsForCourse instead
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} AI analysis data
 */
export async function getAIAnalysis(userId, courseId) {
  // Redirect to recommendations table
  return await getAIRecommendationsForCourse(userId, courseId);
}

/**
 * Check if AI analysis exists (legacy function - now checks recommendations)
 * @deprecated Use getAIRecommendationsForCourse instead
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Analysis existence check result
 */
export async function checkAIAnalysisExists(userId, courseId) {
  try {
    const response = await getAIRecommendationsForCourse(userId, courseId);
    return {
      success: true,
      exists: response.success && response.recommendations && response.recommendations.length > 0
    };
  } catch (error) {
    return {
      success: false,
      exists: false,
      error: error.message
    };
  }
}

// ========================================
// AI ASSESSMENT PREDICTIONS
// ========================================

/**
 * Save AI assessment prediction
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @param {number} assessmentId - Assessment ID
 * @param {number} predictedScore - Predicted score
 * @param {number} predictedPercentage - Predicted percentage
 * @param {number} predictedGpa - Predicted GPA
 * @param {number} confidenceLevel - Confidence level
 * @param {number} recommendedScore - Recommended score
 * @param {number} recommendedPercentage - Recommended percentage
 * @param {string} analysisReasoning - Analysis reasoning
 * @returns {Promise<Object>} Save prediction result
 */
export async function saveAIAssessmentPrediction(userId, courseId, assessmentId, predictedScore, predictedPercentage, predictedGpa, confidenceLevel, recommendedScore, recommendedPercentage, analysisReasoning) {
  const response = await fetch(`${API_BASE_URL}/api/ai-analysis/assessment-prediction/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      courseId,
      assessmentId,
      predictedScore,
      predictedPercentage,
      predictedGpa,
      confidenceLevel,
      recommendedScore,
      recommendedPercentage,
      analysisReasoning
    }),
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to save AI assessment prediction with status ${response.status}`
    );
  }
  
  return response.json();
}

/**
 * Get AI assessment predictions for a course
 * @param {number} userId - User ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Assessment predictions data
 */
export async function getAIAssessmentPredictions(userId, courseId) {
  const response = await fetch(`${API_BASE_URL}/api/ai-analysis/course/${courseId}/user/${userId}/predictions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to get AI assessment predictions with status ${response.status}`
    );
  }
  
  return response.json();
}
