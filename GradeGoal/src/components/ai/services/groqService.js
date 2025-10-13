// ========================================
// GROQ DEEPSEEK AI SERVICE
// ========================================
// Service for integrating with Groq DeepSeek AI API
// Provides intelligent academic recommendations and predictions

import { setAIAnalysisData } from "./aiAnalysisService";
import { saveAIAnalysisData } from "./aiDatabaseService";
import DatabaseGradeService from "../../services/databaseGradeService.js";
// Import utility modules
import { 
  calculateCurrentGrade, 
  calculateGPAFromPercentage, 
  postProcessAIResponse
} from "../utils/achievementProbabilityUtils.js";
import { getFallbackRecommendations } from "../utils/aiPredictionUtils.js";
import { buildRealAnalysisPrompt, parseAIResponse } from "../utils/aiResponseUtils.js";
import { 
  calculateAIConfidence, 
  getConfidenceLevel, 
  getConfidenceExplanation,
  calculateDataQualityScore,
  calculatePerformanceConsistencyScore,
  calculateGoalAchievabilityScore,
  calculateAnalysisCompletenessScore,
  calculateDataVolumeScore
} from "../utils/confidenceCalculationUtils.js";
import { trackAIResponse, trackAIError, trackAIPrediction } from "./performanceTrackingService.js";

// Groq API configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
// Valid Groq models: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b-32768, gemma-7b-it
const MODEL_NAME = import.meta.env.VITE_AI_MODEL || "llama-3.1-8b-instant";

// Cache for AI recommendations to avoid unnecessary API calls
const aiRecommendationCache = new Map();

/**
 * Check if Groq API is properly configured
 */
export const isGroqConfigured = () => {
  return !!GROQ_API_KEY && GROQ_API_KEY.trim() !== '';
};

/**
 * Get AI recommendations for a specific course
 */
export const getAIRecommendations = async (userId, courseId) => {
  const storageKey = `${userId}-${courseId}`;
  
  // Getting AI recommendations
  
  // Check memory storage first
  const storedAnalysis = aiAnalysisStorage.get(storageKey);
  if (storedAnalysis) {
    // Memory storage check
    
    // Convert stored analysis to recommendation format
    // Found analysis in memory, converting to recommendation format
    return {
      success: true,
      recommendations: [{
        recommendationId: 'ai-analysis-main',
        userId: userId,
        courseId: courseId,
        title: 'AI Academic Insights',
        content: storedAnalysis.content || JSON.stringify(storedAnalysis),
        priority: 'HIGH',
        aiGenerated: true,
        recommendationType: 'AI_ANALYSIS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiConfidence: storedAnalysis.aiConfidence || 0.85,
        aiModel: 'llama-3.1-8b-instant'
      }]
    };
  }
  
  // If not in memory, try to load from database
  try {
    const response = await fetch(`${API_BASE_URL}/api/recommendations/user/${userId}/course/${courseId}/ai-analysis`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.recommendations && data.recommendations.length > 0) {
        console.log('✅ [RECOMMENDATIONS DEBUG] Found analysis in database, converting to recommendation format');
        return {
          success: true,
          recommendations: data.recommendations.map(rec => ({
            ...rec,
            aiModel: MODEL_NAME
          }))
        };
      }
    }
  } catch (error) {
    console.error('❌ [RECOMMENDATIONS DEBUG] Error loading from database:', error);
  }
  
  console.log('❌ [RECOMMENDATIONS DEBUG] No analysis found in memory or database');
  return {
    success: false,
    recommendations: []
  };
};

/**
 * Generate AI recommendations using Groq DeepSeek
 */
export const generateAIRecommendations = async (courseData, goalData) => {
  const startTime = Date.now();
  
  try {
    // Starting AI analysis with Groq
    // Course data prepared
    
    // Block AI analysis for completed courses
    if (courseData.course?.isCompleted) {
      console.warn('⚠️ [GROQ DEBUG] AI analysis blocked - course is completed');
      throw new Error('AI analysis is not available for completed courses');
    }
    
    // Check if Groq is configured
    if (!isGroqConfigured()) {
      console.warn('⚠️ [GROQ DEBUG] Groq API key not configured, using fallback recommendations');
      return await getFallbackRecommendations(courseData, goalData);
    }
    
    // Validate model name for Groq API
    const validGroqModels = [
      'llama-3.1-8b-instant',
      'llama-3.1-70b-versatile', 
      'mixtral-8x7b-32768',
      'gemma-7b-it'
    ];
    
    if (!validGroqModels.includes(MODEL_NAME)) {
      console.warn(`⚠️ [GROQ DEBUG] Invalid model '${MODEL_NAME}' for Groq API. Using fallback model 'llama-3.1-8b-instant'`);
      const fallbackModel = 'llama-3.1-8b-instant';
      return await generateWithModel(courseData, goalData, fallbackModel);
    }
    
    // Generate with the validated model
    return await generateWithModel(courseData, goalData, MODEL_NAME);
  } catch (error) {
    console.error('❌ [GROQ DEBUG] Error in generateAIRecommendations:', error);
    
    // Return fallback recommendations on error
    const fallbackResult = await getFallbackRecommendations(courseData, goalData);
    return {
      success: false,
      error: error.message,
      analysis: fallbackResult,
      userId: courseData.course?.userId || 1,
      courseId: courseData.course?.id || 1,
      aiModel: MODEL_NAME,
      confidence: 0.3, // Lower confidence for fallback
      isFallback: true
    };
  }
};

/**
 * Generate AI recommendations with a specific model
 */
const generateWithModel = async (courseData, goalData, modelName) => {
  const startTime = Date.now();
  
  try {
    // Build the analysis prompt
    const prompt = buildRealAnalysisPrompt(courseData, goalData);
    // Generated prompt
    
    // Track API call start time
    const apiStartTime = performance.now();
    
    // Make API call to Groq
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI academic advisor specializing in student performance analysis and goal achievement. Provide accurate, data-driven insights and recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.95,
        stream: false
      })
    });
    
    // Track response time
    const apiEndTime = performance.now();
    trackAIResponse(apiStartTime, apiEndTime, modelName);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GROQ DEBUG] API call failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Track the error
      const error = new Error(`Groq API call failed: ${response.status} ${response.statusText}`);
      trackAIError(error, modelName, 'API_CALL_FAILED');
      throw error;
    }
    
    const data = await response.json();
    // Received response from Groq
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ [GROQ DEBUG] Invalid response structure:', data);
      throw new Error('Invalid response structure from Groq API');
    }
    
    const aiResponse = data.choices[0].message.content;
    // AI response received
    
    // Parse the AI response
    const parsedAnalysis = await parseAIResponse(aiResponse, courseData, goalData);
    // Parsed analysis successfully
    
    // Calculate confidence score based on data quality and analysis
    const confidenceScore = calculateAIConfidence(courseData, goalData, parsedAnalysis);
    const confidenceLevel = getConfidenceLevel(confidenceScore);
    const confidenceExplanation = getConfidenceExplanation(confidenceScore, {
      dataQuality: calculateDataQualityScore(courseData),
      performanceConsistency: calculatePerformanceConsistencyScore(courseData),
      goalAchievability: calculateGoalAchievabilityScore(courseData, goalData),
      analysisCompleteness: calculateAnalysisCompletenessScore(parsedAnalysis),
      dataVolume: calculateDataVolumeScore(courseData)
    });
    
    console.log('🎯 [CONFIDENCE DEBUG] Calculated confidence:', {
      score: confidenceScore,
      level: confidenceLevel,
      explanation: confidenceExplanation
    });
    
    // Track successful prediction
    const predictionData = {
      predictedGrade: parsedAnalysis.predictedFinalGrade?.percentage || 'N/A',
      predictedGPA: parsedAnalysis.predictedFinalGrade?.gpa || 'N/A',
      confidence: parsedAnalysis.targetGoalProbability?.confidence || 'MEDIUM'
    };
    
    // Note: We'll track actual outcomes when students complete courses
    // For now, we track the prediction itself
    trackAIPrediction(
      predictionData.predictedGrade,
      'PENDING_ACTUAL_OUTCOME', // Will be updated when actual grade is known
      modelName,
      confidenceScore
    );
    
    // Store in memory for quick access
    const storageKey = `${courseData.course?.userId || 1}-${courseData.course?.id || 1}`;
    aiAnalysisStorage.set(storageKey, parsedAnalysis);
    
    // Save to database with calculated confidence
    const saveResult = await saveAIAnalysisData(
      courseData.course?.userId || 1,
      courseData.course?.id || 1,
      'AI_ANALYSIS',
      parsedAnalysis,
      modelName,
      confidenceScore
    );
    
    // Database save completed
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    // Total analysis time calculated
    
    return {
      success: true,
      analysis: parsedAnalysis,
      userId: courseData.course?.userId || 1,
      courseId: courseData.course?.id || 1,
      aiModel: modelName,
      confidence: confidenceScore,
      confidenceLevel: confidenceLevel,
      confidenceExplanation: confidenceExplanation,
      duration: duration
    };
    
  } catch (error) {
    console.error('❌ [GROQ DEBUG] Error in generateWithModel:', error);
    throw error; // Re-throw to be handled by the calling function
  }
};

/**
 * Clear AI analysis cache
 */
export const clearAIAnalysisCache = (userId, courseId) => {
  const storageKey = `${userId}-${courseId}`;
  aiAnalysisStorage.delete(storageKey);
    // Cleared AI analysis cache
};

// Memory storage for AI analysis data
const aiAnalysisStorage = new Map();

// Export the storage for use in other modules
export { aiAnalysisStorage };

// API base URL (you may need to adjust this based on your backend)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
