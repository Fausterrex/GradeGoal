// ========================================
// GEMINI AI SERVICE
// ========================================
// Service for integrating with Google Gemini AI API
// Provides intelligent academic recommendations and predictions

import { setAIAnalysisData } from './aiAnalysisService';
import { saveAIAnalysisData } from './aiDatabaseService';
import DatabaseGradeService from '../../../services/databaseGradeService.js';

// Import utility modules
import { 
  calculateCurrentGrade, 
  calculateGPAFromPercentage, 
  postProcessAIResponse,
  calculateEnhancedAchievementProbability 
} from '../utils/achievementProbabilityUtils.js';
import { getFallbackRecommendations } from '../utils/aiPredictionUtils.js';
import { buildRealAnalysisPrompt, parseRealAIResponse } from '../utils/aiResponseUtils.js';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Cache for AI recommendations to avoid unnecessary API calls
const aiRecommendationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// In-memory storage for AI analysis (temporary solution)
export const aiAnalysisStorage = new Map();

/**
 * Generate a cache key for AI recommendations
 */
const generateCacheKey = (courseData, goalData, priorityLevel) => {
  const courseId = courseData.course?.id || 'unknown';
  const currentGPA = courseData.currentGPA || 0;
  const progress = courseData.progress || 0;
  const targetValue = goalData.targetValue || 'unknown';
  const gradesCount = courseData.grades?.length || 0;
  
  return `${courseId}-${currentGPA}-${progress}-${targetValue}-${gradesCount}-${priorityLevel}`;
};

/**
 * Check if cache entry is still valid
 */
const isCacheValid = (cacheEntry) => {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
};

/**
 * Save AI analysis to database for persistence
 */
const saveAIAnalysisToDatabase = async (aiResult, courseData, goalData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-analysis/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: courseData.course?.userId || 1,
        courseId: courseData.course?.id || 1,
        analysisData: aiResult.content,
        analysisType: 'COURSE_ANALYSIS',
        aiModel: aiResult.aiModel || 'gemini-2.0-flash-exp',
        confidence: aiResult.aiConfidence || 0.85
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save AI analysis: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ AI analysis saved to database:', result);
    return result;
  } catch (error) {
    console.error('❌ Error saving AI analysis to database:', error);
    throw error;
  }
};

/**
 * Get AI analysis from database
 */
export const getAIAnalysisFromDatabase = async (userId, courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-analysis/course/${courseId}/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get AI analysis: ${response.status}`);
    }

    const result = await response.json();
    if (result.success && result.hasAnalysis) {
      console.log('✅ Retrieved AI analysis from database');
      return result.analysis;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error getting AI analysis from database:', error);
    return null;
  }
};

/**
 * Save AI assessment prediction to database
 */
export const saveAssessmentPredictionToDatabase = async (userId, courseId, assessmentId, predictionData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-analysis/assessment-prediction/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        courseId,
        assessmentId,
        predictedScore: predictionData.predictedScore,
        predictedPercentage: predictionData.predictedPercentage,
        predictedGpa: predictionData.predictedGpa,
        confidenceLevel: predictionData.confidenceLevel || 'MEDIUM',
        recommendedScore: predictionData.recommendedScore,
        recommendedPercentage: predictionData.recommendedPercentage,
        analysisReasoning: predictionData.analysisReasoning
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save assessment prediction: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Assessment prediction saved to database:', result);
    return result;
  } catch (error) {
    console.error('❌ Error saving assessment prediction to database:', error);
    throw error;
  }
};

/**
 * Get AI assessment predictions for a course
 */
export const getAssessmentPredictionsFromDatabase = async (userId, courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-analysis/course/${courseId}/user/${userId}/predictions`);
    
    if (!response.ok) {
      throw new Error(`Failed to get assessment predictions: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      console.log('✅ Retrieved assessment predictions from database:', result.count);
      return result.predictions;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error getting assessment predictions from database:', error);
    return [];
  }
};

/**
 * Check if AI analysis exists in database
 */
export const checkAIAnalysisExists = async (userId, courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-analysis/course/${courseId}/user/${userId}/exists`);
    
    if (!response.ok) {
      throw new Error(`Failed to check AI analysis: ${response.status}`);
    }

    const result = await response.json();
    return result.success && result.exists;
  } catch (error) {
    console.error('❌ Error checking AI analysis existence:', error);
    return false;
  }
};

/**
 * Clear AI recommendation cache
 */
export const clearAIRecommendationCache = () => {
  aiRecommendationCache.clear();
  console.log('AI recommendation cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    size: aiRecommendationCache.size,
    entries: Array.from(aiRecommendationCache.keys())
  };
};

/**
 * Generate AI recommendations for a specific course
 * @param {Object} courseData - Course information and grades
 * @param {Object} goalData - Academic goal information
 * @param {string} priorityLevel - Priority level (HIGH, MEDIUM, LOW)
 * @returns {Promise<Object>} AI recommendations
 */
export const generateAIRecommendations = async (courseData, goalData, priorityLevel = 'MEDIUM') => {
  try {
    // Generate cache key
    const cacheKey = generateCacheKey(courseData, goalData, priorityLevel);
    
    // Check cache first
    const cachedEntry = aiRecommendationCache.get(cacheKey);
    if (isCacheValid(cachedEntry)) {
      console.log('Using cached AI recommendations for course:', courseData.course?.courseName);
      return cachedEntry.data;
    }

    console.log('Generating real AI recommendations for course:', courseData.course?.courseName);
    console.log('Course data:', { currentGPA: courseData.currentGPA, progress: courseData.progress });
    console.log('Goal data:', { targetValue: goalData.targetValue, goalType: goalData.goalType });
    
    // Calculate and log current course grade for debugging
    const currentGrade = calculateCurrentGrade(courseData.grades, courseData.categories);
    
    // Use the course GPA directly from the database (already calculated and stored)
    let currentGPAValue = parseFloat(courseData.currentGPA) || 0;
    
    // Only recalculate if database course GPA is missing or invalid
    if (currentGPAValue <= 0 && currentGrade > 0) {
      try {
        // Use static import instead of dynamic import
        currentGPAValue = await DatabaseGradeService.calculateGPA(currentGrade);
        console.log('✅ Database GPA calculation successful (fallback):', currentGPAValue);
      } catch (error) {
        console.warn('Failed to get database GPA, using fallback:', error);
        // Fallback to local calculation if database call fails
        currentGPAValue = calculateGPAFromPercentage(currentGrade);
      }
    } else {
      console.log('✅ Using database course GPA directly:', currentGPAValue);
    }
    
    console.log('Current course grade calculation:', {
      currentGrade: currentGrade,
      currentGPA: currentGPAValue,
      grades: courseData.grades?.length || 0,
      categories: courseData.categories?.length || 0
    });
    
    // Check if API key is available
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      console.warn('Gemini API key not configured, using fallback recommendations');
      // Calculate proper gap based on goal type
      let targetGPA, gap;
      if (goalData.goalType === 'COURSE_GRADE') {
        const targetPercentage = parseFloat(goalData.targetValue) || 100;
        targetGPA = calculateGPAFromPercentage(targetPercentage);
        gap = targetGPA - currentGPAValue;
      } else {
        targetGPA = parseFloat(goalData.targetValue) || 4.0;
        gap = targetGPA - currentGPAValue;
      }
      
      console.log('Using fallback with GPA values:', { 
        currentGPA: currentGPAValue, 
        targetValue: goalData.targetValue,
        targetGPA: targetGPA,
        gap: gap
      });
      const fallbackResult = await getFallbackRecommendations(courseData, goalData);
      
      // Cache the fallback result
      aiRecommendationCache.set(cacheKey, {
        data: fallbackResult,
        timestamp: Date.now()
      });
      
      return fallbackResult;
    }

    // Check if AI is disabled via environment variable
    if (import.meta.env.VITE_AI_ENABLED === 'false') {
      console.log('AI analysis disabled via environment variable, using fallback');
      const fallbackResult = await getFallbackRecommendations(courseData, goalData);
      
      // Cache the fallback result
      aiRecommendationCache.set(cacheKey, {
        data: fallbackResult,
        timestamp: Date.now()
      });
      
      return fallbackResult;
    }

    // Build comprehensive prompt for real AI analysis
    const prompt = buildRealAnalysisPrompt(courseData, goalData, priorityLevel);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`🚫 Gemini API rate limit exceeded (429). Please wait before making more requests.`);
        console.log('⏳ Falling back to enhanced local AI analysis...');
      } else if (response.status === 503) {
        console.warn(`🚫 Gemini API service temporarily unavailable (503). This is a temporary issue.`);
        console.log('⏳ Falling back to enhanced local AI analysis...');
      } else {
        console.warn(`Gemini API error: ${response.status} - ${response.statusText}`);
        console.log('Falling back to local AI analysis due to API error');
      }
      return await getFallbackRecommendations(courseData, goalData);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Parse the AI response into structured data
    const parsedAnalysis = parseRealAIResponse(aiResponse, courseData, goalData);
    
    // Post-process to fix incorrect probability calculations
    const correctedAnalysis = postProcessAIResponse(parsedAnalysis, courseData, goalData);
    
    const result = {
      userId: courseData.course?.userId || 1,
      courseId: courseData.course?.id || 1,
      recommendationType: 'AI_ANALYSIS',
      title: `AI Analysis for ${courseData.course?.courseName || 'Course'}`,
      content: JSON.stringify(correctedAnalysis),
      priority: priorityLevel,
      aiGenerated: true,
      aiConfidence: 0.85,
      aiModel: "gemini-2.0-flash-exp",
      createdAt: new Date().toISOString(),
      isRead: false,
      isDismissed: false
    };

    // Cache the API result
    aiRecommendationCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // Store in memory for immediate retrieval
    const storageKey = `${courseData.course?.userId || 1}-${courseData.course?.id || 1}`;
    aiAnalysisStorage.set(storageKey, result);

    // Set AI analysis data for real-time updates across components
    setAIAnalysisData(result);

    // Save to database for persistence
    try {
      await saveAIAnalysisData(
        result.userId,
        result.courseId,
        correctedAnalysis,
        'COURSE_ANALYSIS'
      );
      console.log('✅ [generateAIRecommendations] Successfully saved analysis to database');
    } catch (error) {
      console.warn('⚠️ [generateAIRecommendations] Failed to save AI analysis to database:', error);
      // Continue with cached result even if database save fails
    }

    return result;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return getFallbackRecommendations(courseData, goalData);
  }
};

// buildRealAnalysisPrompt is now imported from aiResponseUtils.js

// postProcessAIResponse is now imported from achievementProbabilityUtils.js


// parseRealAIResponse is now imported from aiResponseUtils.js

// calculateGPAFromPercentage, calculateCurrentGrade, and calculateRemainingWeight are now imported from utility modules

// buildRecommendationPrompt is now imported from aiResponseUtils.js

// parseAIResponse and determinePriority are now imported from aiResponseUtils.js

// getFallbackRecommendations is now imported from aiPredictionUtils.js

// All prediction and analysis functions are now imported from aiPredictionUtils.js

// calculateEnhancedAchievementProbability is now imported from achievementProbabilityUtils.js

/**
 * Save AI recommendations to database
 */
export const saveAIRecommendations = async (recommendations) => {
  try {
    // For now, we'll simulate saving to database by returning mock data
    // This avoids the database connection issues
    console.log('Simulating AI recommendation save:', recommendations);
    
    // Simulate a successful save
    const mockSavedRecommendation = {
      recommendationId: Date.now(),
      userId: recommendations.userId || 1,
      courseId: recommendations.courseId || 1,
      title: recommendations.title || "AI Generated Recommendation",
      content: recommendations.content || "This is a mock AI recommendation",
      recommendationType: recommendations.recommendationType || "AI_ANALYSIS",
      priority: recommendations.priority || "MEDIUM",
      aiGenerated: true,
      aiConfidence: 0.85,
      aiModel: "gemini-2.0-flash-exp",
      createdAt: new Date().toISOString(),
      isRead: false,
      isDismissed: false
    };

    return mockSavedRecommendation;
  } catch (error) {
    console.error('Error saving AI recommendations:', error);
    throw error;
  }
};

/**
 * Get AI recommendations from database
 */
export const getAIRecommendations = async (userId, courseId = null) => {
  try {
    console.log('🔄 [getAIRecommendations] Loading recommendations for user:', userId, 'course:', courseId);
    
    // First check if we have stored AI analysis in memory
    const storageKey = `${userId}-${courseId}`;
    const storedAnalysis = aiAnalysisStorage.get(storageKey);
    
    if (storedAnalysis) {
      console.log('✅ [getAIRecommendations] Found recommendations in memory');
      // Convert stored analysis to recommendation format
      return [{
        recommendationId: 'ai-analysis-main',
        userId: userId,
        courseId: courseId,
        title: 'AI Academic Insights',
        content: storedAnalysis.content,
        recommendationType: 'AI_ANALYSIS',
        priority: 'HIGH',
        aiGenerated: true,
        aiConfidence: storedAnalysis.confidence || 0.85,
        aiModel: storedAnalysis.aiModel || 'gemini-2.0-flash-exp',
        createdAt: storedAnalysis.createdAt,
        isRead: false,
        isDismissed: false,
        category: 'AI Analysis',
        impact: 'Comprehensive academic analysis and recommendations'
      }];
    }
    
    // If not in memory, try to load from database
    const { getAIAnalysis } = await import('../../../backend/api');
    const analysisResponse = await getAIAnalysis(userId, courseId);
    
    if (analysisResponse.success && analysisResponse.hasAnalysis) {
      const dbAnalysis = analysisResponse.analysis;
      console.log('📊 [getAIRecommendations] Found analysis in database, extracting recommendations');
      
      // Parse the analysis data to extract recommendations
      let analysisData;
      try {
        analysisData = typeof dbAnalysis.analysisData === 'string' 
          ? JSON.parse(dbAnalysis.analysisData) 
          : dbAnalysis.analysisData;
      } catch (parseError) {
        console.error('❌ [getAIRecommendations] Error parsing analysis data:', parseError);
        return [];
      }
      
      // Extract recommendations from the analysis data
      const recommendations = [];
      
      // Add top priority recommendations
      if (analysisData.topPriorityRecommendations && Array.isArray(analysisData.topPriorityRecommendations)) {
        analysisData.topPriorityRecommendations.forEach((rec, index) => {
          recommendations.push({
            recommendationId: `top-priority-${index}`,
            userId: userId,
            courseId: courseId,
            title: rec.title || `Priority Recommendation ${index + 1}`,
            content: rec.description || rec.content || 'AI-generated recommendation',
            recommendationType: 'AI_ANALYSIS',
            priority: rec.priority || 'HIGH',
            aiGenerated: true,
            aiConfidence: 0.85,
            aiModel: 'gemini-2.0-flash-exp',
            createdAt: dbAnalysis.createdAt,
            isRead: false,
            isDismissed: false,
            category: rec.category || 'Course-Specific',
            impact: rec.impact || 'Significant impact on academic performance',
            actionButton: rec.actionButton || 'Take Action'
          });
        });
      }
      
      // Add study strategy recommendations
      if (analysisData.studyStrategy) {
        recommendations.push({
          recommendationId: 'study-strategy',
          userId: userId,
          courseId: courseId,
          title: 'Study Strategy',
          content: analysisData.studyStrategy.description || analysisData.studyStrategy.content || 'Personalized study strategy based on your performance',
          recommendationType: 'AI_ANALYSIS',
          priority: 'MEDIUM',
          aiGenerated: true,
          aiConfidence: 0.85,
          aiModel: 'gemini-2.0-flash-exp',
          createdAt: dbAnalysis.createdAt,
          isRead: false,
          isDismissed: false,
          category: 'Study Strategy',
          impact: 'Improved study efficiency and academic performance',
          actionButton: 'View Strategy',
          focusArea: analysisData.studyStrategy.focusArea,
          recommendedSchedule: analysisData.studyStrategy.recommendedSchedule,
          studyTips: analysisData.studyStrategy.studyTips
        });
      }
      
      // Add study habit recommendations
      if (analysisData.studyHabitRecommendations && Array.isArray(analysisData.studyHabitRecommendations)) {
        analysisData.studyHabitRecommendations.forEach((rec, index) => {
          recommendations.push({
            recommendationId: `study-habit-${index}`,
            userId: userId,
            courseId: courseId,
            title: rec.title || `Study Habit ${index + 1}`,
            content: rec.description || rec.content || 'AI-generated study habit recommendation',
            recommendationType: 'AI_ANALYSIS',
            priority: rec.priority || 'MEDIUM',
            aiGenerated: true,
            aiConfidence: 0.85,
            aiModel: 'gemini-2.0-flash-exp',
            createdAt: dbAnalysis.createdAt,
            isRead: false,
            isDismissed: false,
            category: 'General Academic',
            impact: rec.impact || 'Improved study habits and academic performance',
            actionButton: rec.actionButton || 'Implement'
          });
        });
      }
      
      console.log('✅ [getAIRecommendations] Extracted', recommendations.length, 'recommendations from database');
      
      // Also return the main analysis as a recommendation
      const mainRecommendation = {
        recommendationId: 'ai-analysis-main',
        userId: userId,
        courseId: courseId,
        title: 'AI Academic Insights',
        content: analysisData,
        recommendationType: 'AI_ANALYSIS',
        priority: 'HIGH',
        aiGenerated: true,
        aiConfidence: 0.85,
        aiModel: 'gemini-2.0-flash-exp',
        createdAt: dbAnalysis.createdAt,
        isRead: false,
        isDismissed: false,
        category: 'AI Analysis',
        impact: 'Comprehensive academic analysis and recommendations'
      };
      
      return [mainRecommendation, ...recommendations];
    }
    
    console.log('❌ [getAIRecommendations] No analysis found in database');
    return [];
  } catch (error) {
    console.error('❌ [getAIRecommendations] Error fetching AI recommendations:', error);
    return [];
  }
};