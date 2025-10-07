// ========================================
// GEMINI AI SERVICE
// ========================================
// Service for integrating with Google Gemini AI API
// Provides intelligent academic recommendations and predictions

import { GoogleGenerativeAI } from "@google/generative-ai";
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
import { buildRealAnalysisPrompt, parseRealAIResponse } from "../utils/aiResponseUtils.js";
// Initialize Google Generative AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash", // Using Gemini 2.5 Flash for better JSON formatting
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 16384, // Increased to prevent truncation
  }
});

// Cache for AI recommendations to avoid unnecessary API calls
const aiRecommendationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// In-memory storage for AI analysis (temporary solution)
export const aiAnalysisStorage = new Map();

/**
 * Clear AI analysis cache for a specific course or all courses
 */
export const clearAIAnalysisCache = (userId = null, courseId = null) => {
  if (userId && courseId) {
    // Clear specific course cache
    const storageKey = `${userId}-${courseId}`;
    aiAnalysisStorage.delete(storageKey);
    
    // Clear from recommendation cache
    for (const [key, value] of aiRecommendationCache.entries()) {
      if (value.data.userId === userId && value.data.courseId === courseId) {
        aiRecommendationCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    aiAnalysisStorage.clear();
    aiRecommendationCache.clear();
  }
};

/**
 * Generate a cache key for AI recommendations
 */
const generateCacheKey = (courseData, goalData, priorityLevel) => {
  const courseId = courseData.course?.id || 'unknown';
  const currentGPA = courseData.currentGPA || 0;
  const progress = courseData.progress || 0;
  const targetValue = goalData.targetValue || 'unknown';
  const gradesCount = courseData.grades?.length || 0;
  const activeSemesterTerm = courseData.activeSemesterTerm || 'MIDTERM'; // Include semester term in cache key
  
  return `${courseId}-${currentGPA}-${progress}-${targetValue}-${gradesCount}-${priorityLevel}-${activeSemesterTerm}-gemini-2.5-flash`;
};

/**
 * Check if cache entry is still valid
 */
const isCacheValid = (cacheEntry) => {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_DURATION;
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
      } catch (error) {
        console.warn('Failed to get database GPA, using fallback:', error);
        // Fallback to local calculation if database call fails
        currentGPAValue = calculateGPAFromPercentage(currentGrade);
      }
    } else {
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
    
    // Debug: Calculate input token usage
    const promptLength = prompt.length;
    const promptTokens = Math.ceil(promptLength / 4); // Rough estimate: 4 chars per token
    console.log(`   Prompt length: ${promptLength} characters`);
    console.log(`   Approximate input tokens: ${promptTokens}`);
    console.log(`   Max output tokens: ${model.generationConfig.maxOutputTokens}`);
    console.log(`   Total budget: ${promptTokens + model.generationConfig.maxOutputTokens} tokens`);
    
    let aiResponse;
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use Google Generative AI package
        const result = await model.generateContent(prompt);
        aiResponse = result.response.text();
        
        // Debug: Calculate approximate token usage
        const responseLength = aiResponse.length;
        const approximateTokens = Math.ceil(responseLength / 4); // Rough estimate: 4 chars per token
        console.log(`   Response length: ${responseLength} characters`);
        console.log(`   Approximate tokens: ${approximateTokens}`);
        console.log(`   Max tokens set: ${model.generationConfig.maxOutputTokens}`);
        console.log(`   Token usage: ${((approximateTokens / model.generationConfig.maxOutputTokens) * 100).toFixed(1)}%`);
        
        // Check if response was truncated (common issue with token limits)
        // More accurate truncation detection - only check for incomplete JSON structure
        const trimmedResponse = aiResponse.trim();
        
        // Remove markdown code blocks and extra whitespace for accurate detection
        const cleanResponse = trimmedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        
        const isTruncated = (
          // Response doesn't end with closing brace (after cleaning)
          (!cleanResponse.endsWith('}')) ||
          // Response starts with JSON but is clearly incomplete (missing closing braces)
          (cleanResponse.startsWith('{') && (cleanResponse.match(/\{/g) || []).length > (cleanResponse.match(/\}/g) || []).length) ||
          // Response ends abruptly without proper JSON structure
          (cleanResponse.includes('{') && !cleanResponse.includes('"predictedFinalGrade"'))
        );
        if (isTruncated) {
          console.warn(`Response length: ${aiResponse.length} characters`);
          console.warn(`Response ends with: "${aiResponse.slice(-50)}"`);
          console.warn(`Truncation reasons: cleanEndsWith('}')=${cleanResponse.endsWith('}')}, braceCount=${(cleanResponse.match(/\{/g) || []).length}/${(cleanResponse.match(/\}/g) || []).length}, hasPredictedFinalGrade=${cleanResponse.includes('"predictedFinalGrade"')}`);
          console.warn(`Clean response ends with: "${cleanResponse.slice(-30)}"`);
          
          // If this is the last attempt, we'll try to fix it in parsing
        } else {
            // Retry with a shorter prompt if we have attempts left
            // Use a shorter prompt for retry attempts
            const shorterPrompt = buildRealAnalysisPrompt(courseData, goalData, priorityLevel, true); // Pass true for shorter version
            
            const retryResult = await model.generateContent(shorterPrompt);
            aiResponse = retryResult.response.text();
            
            // Debug shorter response
            const shorterResponseLength = aiResponse.length;
            const shorterApproximateTokens = Math.ceil(shorterResponseLength / 4);
            
            // Check if the shorter prompt worked
            if (aiResponse.trim().endsWith('}')) {
              break;
            }
            continue;
          }
        
      } catch (error) {
        lastError = error;
        
        // Handle package-specific errors
        if (error.name === 'QuotaExceededError' || error.message?.includes('429')) {
          break; // Don't retry rate limit errors
        } else if (error.name === 'ServiceUnavailableError' || error.message?.includes('503')) {
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry
          } else {
            // Max retries reached, falling back to enhanced local AI analysis
          }
        } else if (error.name === 'PermissionDeniedError' || error.message?.includes('403')) {
          break; // Don't retry permission errors
        } else {
          // Other errors
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue; // Retry
          } else {
            // Max retries reached, falling back to local AI analysis
          }
        }
      }
      
      // Success, exit retry loop
      break;
    }
    
    // If all retries failed, use fallback
    if (!aiResponse) {
      return await getFallbackRecommendations(courseData, goalData);
    }
    
    // Parse the AI response into structured data
    const parsedAnalysis = parseRealAIResponse(aiResponse, courseData, goalData);
    
    // Final token usage summary
    const finalResponseLength = aiResponse.length;
    const finalTokens = Math.ceil(finalResponseLength / 4);
    
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
      aiModel: "gemini-2.5-flash",
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
    const storageKey = `${courseData.course?.userId || 1}-${courseData.course?.id || 1}-${courseData.activeSemesterTerm || 'MIDTERM'}`;
    aiAnalysisStorage.set(storageKey, result);

    // Set AI analysis data for real-time updates across components
    setAIAnalysisData(result);

    // Save to database for persistence
    try {
      const saveResult = await saveAIAnalysisData(
        result.userId,
        result.courseId,
        correctedAnalysis,
        'COURSE_ANALYSIS'
      );
      if (saveResult.success) {
        const action = saveResult.isUpdate ? 'updated' : 'saved';
        } else {
        }
    } catch (error) {
      // Continue with cached result even if database save fails
    }

    return result;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return getFallbackRecommendations(courseData, goalData);
  }
};


/**
 * Get AI recommendations from database
 */
export const getAIRecommendations = async (userId, courseId = null) => {
  try {
    
    // First check if we have stored AI analysis in memory
    const storageKey = `${userId}-${courseId}`;
    const storedAnalysis = aiAnalysisStorage.get(storageKey);
    
    if (storedAnalysis) {
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
      
      // Parse the analysis data to extract recommendations
      let analysisData;
      try {
        analysisData = typeof dbAnalysis.analysisData === 'string' 
          ? JSON.parse(dbAnalysis.analysisData) 
          : dbAnalysis.analysisData;
      } catch (parseError) {
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
    
    return [];
  } catch (error) {
    return [];
  }
};

// buildRealAnalysisPrompt is now imported from aiResponseUtils.js

// postProcessAIResponse is now imported from achievementProbabilityUtils.js


// parseRealAIResponse is now imported from aiResponseUtils.js

// calculateGPAFromPercentage, calculateCurrentGrade, and calculateRemainingWeight are now imported from utility modules

// buildRecommendationPrompt is now imported from aiResponseUtils.js

// parseAIResponse and determinePriority are now imported from aiResponseUtils.js
