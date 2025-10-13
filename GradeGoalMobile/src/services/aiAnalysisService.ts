// AI Analysis Service for Mobile App
// Fetches real AI analysis data from the backend database

import { getApiConfig } from '../config/environment';

// Get API configuration from environment
const apiConfig = getApiConfig();
const API_BASE_URL = apiConfig.baseURL.replace('/api', ''); // Remove /api suffix since we add it in each endpoint

// Debug logging for API configuration
console.log('🔧 [DEBUG] AI Analysis Service API Configuration:', {
  baseURL: apiConfig.baseURL,
  apiBaseURL: API_BASE_URL,
  platform: require('react-native').Platform.OS
});

export interface AIAnalysisResult {
  success: boolean;
  hasAnalysis: boolean;
  analysis?: {
    analysisData: any;
    createdAt: string;
    updatedAt: string;
    aiConfidence: number;
    aiModel: string;
    confidence: number;
  };
  error?: string;
}

export interface AIAnalysisExistsResult {
  success: boolean;
  exists: boolean;
  error?: string;
}

/**
 * Check if AI analysis exists for a course
 */
export async function checkAIAnalysisExists(userId: number, courseId: number): Promise<AIAnalysisExistsResult> {
  const url = `${API_BASE_URL}/api/recommendations/user/${userId}/course/${courseId}/ai-analysis`;
  console.log('🔍 [DEBUG] Checking AI analysis exists:', { userId, courseId, url });
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 [DEBUG] AI analysis check response:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });
    
    if (!response.ok) {
      console.warn(`AI analysis check API returned ${response.status}`);
      return {
        success: false,
        exists: false,
        error: `HTTP ${response.status}`
      };
    }
    
    const data = await response.json();
    console.log('🔍 [DEBUG] AI analysis check data:', data);
    
    return {
      success: true,
      exists: data.success && data.recommendations && data.recommendations.length > 0
    };
  } catch (error) {
    console.error('❌ [ERROR] Error checking AI analysis existence:', error);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get AI analysis for a course
 */
export async function getAIAnalysis(userId: number, courseId: number): Promise<AIAnalysisResult> {
  const url = `${API_BASE_URL}/api/recommendations/user/${userId}/course/${courseId}/ai-analysis`;
  console.log('🔍 [DEBUG] Getting AI analysis:', { userId, courseId, url });
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 [DEBUG] AI analysis response:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });
    
    if (!response.ok) {
      console.warn(`AI analysis API returned ${response.status}`);
      return {
        success: false,
        hasAnalysis: false,
        error: `HTTP ${response.status}`
      };
    }
    
    const data = await response.json();
    console.log('🔍 [DEBUG] AI analysis data:', data);
    
    if (data.success && data.recommendations && data.recommendations.length > 0) {
      // Get the most recent AI analysis
      const latestAnalysis = data.recommendations[0];
      console.log('🔍 [DEBUG] Latest analysis:', latestAnalysis);
      
      return {
        success: true,
        hasAnalysis: true,
        analysis: {
          analysisData: latestAnalysis.content,
          createdAt: latestAnalysis.createdAt,
          updatedAt: latestAnalysis.updatedAt,
          aiConfidence: latestAnalysis.aiConfidence || 0.85,
          aiModel: latestAnalysis.aiModel || 'llama-3.1-8b-instant',
          confidence: latestAnalysis.aiConfidence || 0.7
        }
      };
    }
    
    console.log('🔍 [DEBUG] No AI analysis found');
    return {
      success: true,
      hasAnalysis: false
    };
  } catch (error) {
    console.error('❌ [ERROR] Error fetching AI analysis:', error);
    return {
      success: false,
      hasAnalysis: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract achievement probability from AI analysis data
 */
export function getAchievementProbabilityFromData(analysisData: any): number | null {
  try {
    if (!analysisData) return null;
    
    console.log('🔍 [DEBUG] Extracting probability from:', typeof analysisData, analysisData);
    
    // Try to extract probability from various possible formats
    if (typeof analysisData === 'object') {
      // Check for direct probability field
      if (analysisData.achievementProbability !== undefined) {
        return analysisData.achievementProbability;
      }
      
      // Check for success rate field
      if (analysisData.successRate !== undefined) {
        return analysisData.successRate;
      }
      
      // Check for confidence field
      if (analysisData.confidence !== undefined) {
        return analysisData.confidence * 100; // Convert to percentage
      }
      
      // Check for targetGoalProbability structure (from actual data)
      if (analysisData.targetGoalProbability && analysisData.targetGoalProbability.probability) {
        const probability = analysisData.targetGoalProbability.probability;
        if (typeof probability === 'string' && probability.includes('%')) {
          return parseFloat(probability.replace('%', ''));
        } else if (typeof probability === 'number') {
          return probability;
        }
      }
      
      // Check for probability in nested structure
      if (analysisData.analysis && analysisData.analysis.achievementProbability !== undefined) {
        return analysisData.analysis.achievementProbability;
      }
      
      // Check for probability in recommendations
      if (analysisData.recommendations && Array.isArray(analysisData.recommendations)) {
        const rec = analysisData.recommendations[0];
        if (rec && rec.achievementProbability !== undefined) {
          return rec.achievementProbability;
        }
      }
    }
    
    // If it's a string, try to parse it
    if (typeof analysisData === 'string') {
      try {
        const parsed = JSON.parse(analysisData);
        return getAchievementProbabilityFromData(parsed);
      } catch {
        // If parsing fails, return null
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting achievement probability:', error);
    return null;
  }
}

/**
 * Get user progress with GPA data
 */
export async function getUserProgressWithGPAs(userId: number): Promise<any> {
  const url = `${API_BASE_URL}/api/user-progress/${userId}/with-gpas`;
  console.log('🔍 [DEBUG] Getting user progress with GPAs:', { userId, url });
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 [DEBUG] User progress response:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 [DEBUG] User progress data:', data);
    return data;
  } catch (error) {
    console.error('❌ [ERROR] Error fetching user progress:', error);
    // Return fallback data instead of throwing error
    return {
      currentLevel: 1,
      totalPoints: 0,
      streakDays: 0,
      semesterGpa: 0.00,
      cumulativeGpa: 0.00
    };
  }
}

/**
 * Get course analytics from database
 */
export async function getCourseAnalytics(userId: number, courseId: number): Promise<any[]> {
  const url = `${API_BASE_URL}/api/database-calculations/user/${userId}/analytics/${courseId}`;
  console.log('🔍 [DEBUG] Getting course analytics:', { userId, courseId, url });
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('🔍 [DEBUG] Course analytics response:', { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });
    
    if (!response.ok) {
      console.warn(`Course analytics API returned ${response.status}, using fallback data`);
      return [];
    }
    
    const data = await response.json();
    console.log('🔍 [DEBUG] Course analytics data:', data);
    return data;
  } catch (error) {
    console.error('❌ [ERROR] Error fetching course analytics:', error);
    // Return empty array instead of throwing error
    return [];
  }
}

export function getBestPossibleGPAFromData(analysisData: any): number | null {
  try {
    if (!analysisData) return null;
    
    console.log('🔍 [DEBUG] Extracting bestPossibleGPA from:', typeof analysisData, analysisData);
    
    if (typeof analysisData === 'object') {
      // Check for direct bestPossibleGPA field
      if (analysisData.bestPossibleGPA) {
        const bestPossibleGPA = analysisData.bestPossibleGPA;
        if (typeof bestPossibleGPA === 'string') {
          return parseFloat(bestPossibleGPA);
        } else if (typeof bestPossibleGPA === 'number') {
          return bestPossibleGPA;
        }
      }
      
      // Check for nested bestPossibleGPA structure
      if (analysisData.achievementProbability && analysisData.achievementProbability.bestPossibleGPA) {
        const bestPossibleGPA = analysisData.achievementProbability.bestPossibleGPA;
        if (typeof bestPossibleGPA === 'string') {
          return parseFloat(bestPossibleGPA);
        } else if (typeof bestPossibleGPA === 'number') {
          return bestPossibleGPA;
        }
      }
      
      // Check for targetGoalProbability structure (from actual data)
      if (analysisData.targetGoalProbability && analysisData.targetGoalProbability.bestPossibleGPA) {
        const bestPossibleGPA = analysisData.targetGoalProbability.bestPossibleGPA;
        if (typeof bestPossibleGPA === 'string') {
          return parseFloat(bestPossibleGPA);
        } else if (typeof bestPossibleGPA === 'number') {
          return bestPossibleGPA;
        }
      }
      
      // Check for bestPossibleGPA in recommendations
      if (analysisData.recommendations && Array.isArray(analysisData.recommendations)) {
        for (const rec of analysisData.recommendations) {
          if (rec.bestPossibleGPA) {
            const bestPossibleGPA = rec.bestPossibleGPA;
            if (typeof bestPossibleGPA === 'string') {
              return parseFloat(bestPossibleGPA);
            } else if (typeof bestPossibleGPA === 'number') {
              return bestPossibleGPA;
            }
          }
        }
      }
    }
    
    // If it's a string, try to parse it
    if (typeof analysisData === 'string') {
      try {
        const parsed = JSON.parse(analysisData);
        return getBestPossibleGPAFromData(parsed);
      } catch {
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting best possible GPA:', error);
    return null;
  }
}
