import { saveAIAnalysis, getAIRecommendationsForCourse, markRecommendationAsRead, dismissRecommendation } from "../../../backend/api";
/**
 * Save AI analysis data to recommendations table
 */
export const saveAIAnalysisData = async (userId, courseId, analysisData, analysisType = 'COURSE_ANALYSIS') => {
  try {
    const response = await saveAIAnalysis(
      userId,
      courseId,
      analysisData,
      analysisType,
      'gemini-2.0-flash-exp',
      0.85
    );
    if (response.success) {
      const action = response.isUpdate ? 'updated' : 'saved';
      return { success: true, isUpdate: response.isUpdate };
    } else {
      return { success: false, error: response.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Load AI analysis data from recommendations table
 */
export const loadAIAnalysisFromDatabase = async (userId, courseId) => {
  try {
    const response = await getAIRecommendationsForCourse(userId, courseId);
    
    if (response.success && response.recommendations && response.recommendations.length > 0) {
      // Get the most recent AI analysis recommendation
      const latestRecommendation = response.recommendations[0];
      
      const analysisData = {
        userId: latestRecommendation.userId,
        courseId: latestRecommendation.courseId,
        content: latestRecommendation.content, // This is the JSON string from recommendations table
        analysisType: latestRecommendation.recommendationType,
        aiModel: latestRecommendation.aiModel,
        confidence: latestRecommendation.aiConfidence,
        createdAt: latestRecommendation.createdAt,
        updatedAt: latestRecommendation.createdAt, // Recommendations don't have updatedAt
        recommendationId: latestRecommendation.recommendationId,
        title: latestRecommendation.title,
        priority: latestRecommendation.priority,
        isRead: latestRecommendation.isRead,
        isDismissed: latestRecommendation.isDismissed
      };
      
      return analysisData;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Mark AI recommendation as read
 */
export const markAIRecommendationAsRead = async (recommendationId) => {
  try {
    const response = await markRecommendationAsRead(recommendationId);
    
    if (response.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

/**
 * Dismiss AI recommendation
 */
export const dismissAIRecommendation = async (recommendationId) => {
  try {
    const response = await dismissRecommendation(recommendationId);
    
    if (response.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};
