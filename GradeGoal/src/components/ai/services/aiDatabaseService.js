import { saveAIAnalysis, getAIRecommendationsForCourse, markRecommendationAsRead, dismissRecommendation } from "../../../backend/api";
/**
 * Save AI analysis data to recommendations table
 */
export const saveAIAnalysisData = async (userId, courseId, analysisType, analysisData, aiModel = import.meta.env.VITE_AI_MODEL || 'llama-3.1-8b-instant', confidence = null) => {
  const startTime = performance.now();
  console.log('💾 [DB DEBUG] Starting AI analysis database save');
  // Calculate confidence if not provided
  const finalConfidence = confidence !== null ? confidence : 0.7; // Default fallback
  
  console.log('💾 [DB DEBUG] Save parameters:', {
    userId,
    courseId,
    analysisType,
    analysisDataKeys: Object.keys(analysisData || {}),
    analysisDataSize: JSON.stringify(analysisData || {}).length,
    confidence: finalConfidence
  });
  
  try {
    console.log('📡 [DB DEBUG] Calling saveAIAnalysis API...');
    const apiCallStart = performance.now();
    const response = await saveAIAnalysis(
      userId,
      courseId,
      analysisData,
      analysisType,
      aiModel,
      finalConfidence
    );
    const apiCallTime = performance.now() - apiCallStart;
    console.log('📡 [DB DEBUG] API call took:', apiCallTime.toFixed(2), 'ms');
    console.log('📡 [DB DEBUG] API response:', response);
    
    if (response.success) {
      const action = response.isUpdate ? 'updated' : 'saved';
      console.log(`✅ [DB DEBUG] Database save successful (${action})`);
      console.log('✅ [DB DEBUG] Total database save time:', (performance.now() - startTime).toFixed(2), 'ms');
      return { success: true, isUpdate: response.isUpdate };
    } else {
      console.error('❌ [DB DEBUG] Database save failed:', response.error);
      console.log('❌ [DB DEBUG] Total database save time (failed):', (performance.now() - startTime).toFixed(2), 'ms');
      return { success: false, error: response.error };
    }
  } catch (error) {
    console.error('❌ [DB DEBUG] Database save error:', error);
    console.error('❌ [DB DEBUG] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    console.log('❌ [DB DEBUG] Total database save time (error):', (performance.now() - startTime).toFixed(2), 'ms');
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
