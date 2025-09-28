// ========================================
// AI DATABASE SERVICE
// ========================================
// Service for AI analysis database operations

import { saveAIAnalysis, getAIAnalysis, checkAIAnalysisExists } from '../../../backend/api';

/**
 * Save AI analysis data to database
 */
export const saveAIAnalysisData = async (userId, courseId, analysisData, analysisType = 'COURSE_ANALYSIS') => {
  try {
    console.log('💾 [saveAIAnalysisData] Saving analysis to database for user:', userId, 'course:', courseId);
    
    const response = await saveAIAnalysis(
      userId,
      courseId,
      analysisData,
      analysisType,
      'gemini-2.0-flash-exp',
      0.85
    );
    
    if (response.success) {
      console.log('✅ [saveAIAnalysisData] Successfully saved analysis to database');
      return true;
    } else {
      console.error('❌ [saveAIAnalysisData] Failed to save analysis:', response.error);
      return false;
    }
  } catch (error) {
    console.error('❌ [saveAIAnalysisData] Error saving analysis to database:', error);
    return false;
  }
};

/**
 * Load AI analysis data from database only
 */
export const loadAIAnalysisFromDatabase = async (userId, courseId) => {
  try {
    
    // Check if analysis exists in database
    const existsResponse = await checkAIAnalysisExists(userId, courseId);
    if (existsResponse.success && existsResponse.exists) {
      const analysisResponse = await getAIAnalysis(userId, courseId);
      
      if (analysisResponse.success && analysisResponse.hasAnalysis) {
        const dbAnalysis = analysisResponse.analysis;
        const analysisData = {
          userId: dbAnalysis.userId,
          courseId: dbAnalysis.courseId,
          content: dbAnalysis.analysisData, // This is already JSON string from database
          analysisType: dbAnalysis.analysisType,
          aiModel: dbAnalysis.aiModel,
          confidence: dbAnalysis.aiConfidence,
          createdAt: dbAnalysis.createdAt,
          updatedAt: dbAnalysis.updatedAt
        };
        
        return analysisData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ [loadAIAnalysisForCourse] Error loading AI analysis:', error);
    return null;
  }
};
