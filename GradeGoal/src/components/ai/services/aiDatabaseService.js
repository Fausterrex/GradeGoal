import { saveAIAnalysis, getAIRecommendationsForCourse, markRecommendationAsRead, dismissRecommendation } from '../../../backend/api';

/**
 * Save AI analysis data to recommendations table
 */
export const saveAIAnalysisData = async (userId, courseId, analysisData, analysisType = 'COURSE_ANALYSIS') => {
  try {
    console.log('💾 [saveAIAnalysisData] Saving analysis to recommendations table for user:', userId, 'course:', courseId);
    
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
      console.log(`✅ [saveAIAnalysisData] Successfully ${action} analysis to recommendations table`);
      return { success: true, isUpdate: response.isUpdate };
    } else {
      console.error('❌ [saveAIAnalysisData] Failed to save analysis:', response.error);
      return { success: false, error: response.error };
    }
  } catch (error) {
    console.error('❌ [saveAIAnalysisData] Error saving analysis to recommendations table:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load AI analysis data from recommendations table
 */
export const loadAIAnalysisFromDatabase = async (userId, courseId) => {
  try {
    console.log('📖 [loadAIAnalysisFromDatabase] Loading AI recommendations for user:', userId, 'course:', courseId);
    
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
      
      console.log('✅ [loadAIAnalysisFromDatabase] Successfully loaded AI recommendation');
      return analysisData;
    }
    
    console.log('ℹ️ [loadAIAnalysisFromDatabase] No AI recommendations found');
    return null;
  } catch (error) {
    console.error('❌ [loadAIAnalysisFromDatabase] Error loading AI recommendations:', error);
    return null;
  }
};

/**
 * Mark AI recommendation as read
 */
export const markAIRecommendationAsRead = async (recommendationId) => {
  try {
    console.log('📖 [markAIRecommendationAsRead] Marking recommendation as read:', recommendationId);
    
    const response = await markRecommendationAsRead(recommendationId);
    
    if (response.success) {
      console.log('✅ [markAIRecommendationAsRead] Successfully marked as read');
      return true;
    } else {
      console.error('❌ [markAIRecommendationAsRead] Failed to mark as read:', response.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [markAIRecommendationAsRead] Error marking as read:', error);
    return false;
  }
};

/**
 * Dismiss AI recommendation
 */
export const dismissAIRecommendation = async (recommendationId) => {
  try {
    console.log('❌ [dismissAIRecommendation] Dismissing recommendation:', recommendationId);
    
    const response = await dismissRecommendation(recommendationId);
    
    if (response.success) {
      console.log('✅ [dismissAIRecommendation] Successfully dismissed');
      return true;
    } else {
      console.error('❌ [dismissAIRecommendation] Failed to dismiss:', response.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [dismissAIRecommendation] Error dismissing:', error);
    return false;
  }
};
