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

// Groq API configuration
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant";

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
            aiModel: 'llama-3.1-8b-instant'
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
    
    // Build the analysis prompt
    const prompt = buildRealAnalysisPrompt(courseData, goalData);
    // Generated prompt
    
    // Make API call to Groq DeepSeek
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
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
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [GROQ DEBUG] API call failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Groq API call failed: ${response.status} ${response.statusText}`);
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
    
    // Store in memory for quick access
    const storageKey = `${courseData.course?.userId || 1}-${courseData.course?.id || 1}`;
    aiAnalysisStorage.set(storageKey, parsedAnalysis);
    
    // Save to database
    const saveResult = await saveAIAnalysisData(
      courseData.course?.userId || 1,
      courseData.course?.id || 1,
      'AI_ANALYSIS',
      parsedAnalysis,
      'llama-3.1-8b-instant',
      0.85
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
      aiModel: 'llama-3.1-8b-instant',
      confidence: 0.85,
      duration: duration
    };
    
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
      aiModel: 'llama-3.1-8b-instant',
      confidence: 0.5,
      isFallback: true
    };
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
