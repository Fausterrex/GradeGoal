// ========================================
// AI ANALYSIS SERVICE
// ========================================
// Service to manage AI analysis data across components

import { getAIRecommendations } from "./groqService";
import { saveAIAnalysisData, loadAIAnalysisFromDatabase } from "./aiDatabaseService";

// GPA conversion function that matches the database CalculateGPA() function
const calculateGPAFromPercentage = (percentage) => {
  if (percentage >= 95.5) return 4.00;
  if (percentage >= 89.5) return 3.50;
  if (percentage >= 83.5) return 3.00;
  if (percentage >= 77.5) return 2.50;
  if (percentage >= 71.5) return 2.00;
  if (percentage >= 65.5) return 1.50;
  if (percentage >= 59.5) return 1.00;
  return 0.00; // Below 59.5% = R (Remedial/Fail) - represented as 0.00 in frontend
};
// Store for AI analysis data
let aiAnalysisData = null;
let aiAnalysisListeners = [];

/**
 * Get current AI analysis data
 */
export const getCurrentAIAnalysis = () => {
  return aiAnalysisData;
};

/**
 * Clear AI analysis data
 */
export const clearAIAnalysisData = () => {
  aiAnalysisData = null;
  // Notify listeners that data was cleared
  aiAnalysisListeners.forEach(listener => listener(null));
};

/**
 * Clear AI analysis cache for a specific course
 */
export const clearAIAnalysisCacheForCourse = (userId, courseId) => {
  // Clear the global cache
  aiAnalysisData = null;
  aiAnalysisListeners.forEach(listener => listener(null));
  
  // Also clear the Groq service cache
  import('./groqService').then(({ clearAIAnalysisCache }) => {
    clearAIAnalysisCache(userId, courseId);
  });
};

/**
 * Set AI analysis data and notify listeners
 */
export const setAIAnalysisData = (data) => {
  aiAnalysisData = data;
  aiAnalysisListeners.forEach(listener => listener(data));
};


/**
 * Subscribe to AI analysis data changes
 */
export const subscribeToAIAnalysis = (listener) => {
  aiAnalysisListeners.push(listener);
  return () => {
    aiAnalysisListeners = aiAnalysisListeners.filter(l => l !== listener);
  };
};

/**
 * Get score prediction for a specific assessment
 */
export const getScorePredictionForAssessment = (assessmentName, categoryName) => {
  if (!aiAnalysisData || !aiAnalysisData.content || !categoryName) {
    console.log('🔍 [ASSESSMENT PREDICTION DEBUG] No AI analysis data or category name:', { 
      hasAiAnalysisData: !!aiAnalysisData, 
      hasContent: !!aiAnalysisData?.content, 
      categoryName 
    });
    return null;
  }
  
  try {
    const content = typeof aiAnalysisData.content === 'string' 
      ? JSON.parse(aiAnalysisData.content) 
      : aiAnalysisData.content;
    
    // Looking for prediction for assessment
    
    // Try different key formats
    const categoryKey = categoryName.toLowerCase();
    const pluralKey = categoryKey + 's';
    const exactKey = categoryName; // Try exact case match
    const exactPluralKey = categoryName + 's';
    
    // First, try to find in realisticPredictions format (this is what dashboard uses)
    if (content.realisticPredictions && content.realisticPredictions.predictedScores) {
      const categoryPredictions = content.realisticPredictions.predictedScores[categoryKey] || 
                                 content.realisticPredictions.predictedScores[pluralKey] ||
                                 content.realisticPredictions.predictedScores[exactKey] ||
                                 content.realisticPredictions.predictedScores[exactPluralKey];
      
      // Found realisticPredictions for category
      
      if (categoryPredictions && categoryPredictions.length > 0) {
        // Find prediction that matches the assessment name
        const prediction = categoryPredictions.find(pred => 
          pred.assessment && pred.assessment.toLowerCase().includes(assessmentName.toLowerCase())
        );
        if (prediction) {
          // Found matching realisticPrediction
          return {
            predictedScore: prediction.predictedScore,
            confidence: prediction.confidence,
            reasoning: prediction.reasoning || `AI predicts you'll get ${prediction.predictedScore} on this assessment.`
          };
        }
      }
    }
    
    // Fallback to scorePredictions format
    
    const categoryPredictions = content.scorePredictions?.[exactKey] ||
                               content.scorePredictions?.[exactPluralKey] ||
                               content.scorePredictions?.[categoryKey] || 
                               content.scorePredictions?.[pluralKey];
    
    if (!categoryPredictions) {
      return null;
    }
    
    // Apply the same perfect performance override logic as the dashboard
    let finalNeededScore = categoryPredictions.neededScore;
    let finalConfidence = categoryPredictions.confidence;
    
    // Check if user has perfect performance in this category (same logic as AIPredictions.jsx)
    if (aiAnalysisData.grades && aiAnalysisData.categories) {
      const category = aiAnalysisData.categories.find(cat => 
        (cat.categoryName || cat.name).toLowerCase() === categoryName.toLowerCase()
      );
      
      if (category && aiAnalysisData.grades[category.id]) {
        const categoryGrades = aiAnalysisData.grades[category.id];
        const completedGrades = categoryGrades.filter(grade => 
          grade.score !== null && grade.score !== undefined && grade.score > 0
        );
        
        if (completedGrades.length > 0) {
          const averageScore = completedGrades.reduce((sum, grade) => sum + grade.score, 0) / completedGrades.length;
          const averageMaxScore = completedGrades.reduce((sum, grade) => sum + (grade.maxScore || grade.pointsPossible), 0) / completedGrades.length;
          const averagePercentage = (averageScore / averageMaxScore) * 100;
          
          // Category performance check
          
          // If user has perfect performance (100%) in this category, override AI prediction
          if (averagePercentage >= 100) {
            finalNeededScore = '100%';
            finalConfidence = 'HIGH';
            // Overriding AI prediction to 100% due to perfect average performance
          } else if (averagePercentage >= 90) {
            // If user has high performance, boost the prediction
            const currentPercentage = parseFloat(finalNeededScore.replace('%', ''));
            if (currentPercentage < 95) {
              finalNeededScore = '95%';
              // Boosting AI prediction to 95% due to high average performance
            }
          }
        }
      }
    }
    
    const result = {
      neededScore: finalNeededScore,
      confidence: finalConfidence,
      reasoning: `You need to get ${finalNeededScore} on this assessment to achieve your target GPA. This will help you reach your academic goal.`
    };
    
    // Returning corrected score prediction
    return result;
  } catch (error) {
    console.error('Error parsing score predictions:', error);
    return null;
  }
};

/**
 * Get achievement probability data from provided analysis data
 */
export const getAchievementProbabilityFromData = (analysisData) => {
  
  if (!analysisData || !analysisData.content) {
    return null;
  }
  
  try {
    const content = typeof analysisData.content === 'string' 
      ? JSON.parse(analysisData.content) 
      : analysisData.content;
    
    
    // Check for new enhanced structure first
    if (content.targetGoalProbability) {
      return content.targetGoalProbability;
    }
    
    // Fallback to old structure
    if (content.achievementProbability) {
      return content.achievementProbability;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Load AI analysis data for a course (enhanced version that handles both database and generation)
 */
export const loadAIAnalysisForCourse = async (userId, courseId, forceRefresh = false) => {
  try {
    
    // If force refresh is requested, clear cache first
    if (forceRefresh) {
      const { clearAIAnalysisCache } = await import('./groqService');
      clearAIAnalysisCache(userId, courseId);
    }
    
    // First, check if we have cached analysis data in memory
    if (aiAnalysisData && aiAnalysisData.userId === userId && aiAnalysisData.courseId === courseId && !forceRefresh) {
      return aiAnalysisData;
    }
    
    // Try to load from database first
    const dbAnalysisData = await loadAIAnalysisFromDatabase(userId, courseId);
    if (dbAnalysisData) {
      setAIAnalysisData(dbAnalysisData);
      
      // Also store in memory for getAIRecommendations to find (use same key format)
      const storageKey = `${userId}-${courseId}`;
      const { aiAnalysisStorage } = await import('./groqService');
      aiAnalysisStorage.set(storageKey, dbAnalysisData);
      
      return dbAnalysisData;
    }
    
    // If no analysis exists in database, clear any cached data for this course
    clearAIAnalysisData();
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Get achievement probability data for display
 */
export const getAchievementProbability = () => {
  if (!aiAnalysisData) {
    return null;
  }
  
  // Try to extract data from content field first (AI analysis data)
  let content = null;
  if (aiAnalysisData.content) {
    try {
      content = typeof aiAnalysisData.content === 'string' 
        ? JSON.parse(aiAnalysisData.content) 
        : aiAnalysisData.content;
      // Parsed content successfully
    } catch (error) {
      console.error('Error parsing AI analysis content:', error);
    }
  }
  
  // Extract probability data from AI analysis
  let probability = 0;
  let confidence = 'MEDIUM';
  let factors = [];
  let bestPossibleGPA = null;
  
  if (content) {
    // Try different possible field names for probability
    probability = content.successProbability || 
                 content.probability || 
                 content.targetGoalProbability?.probability ||
                 content.achievementProbability?.probability || 0;
    
    confidence = content.confidence || 
                 content.targetGoalProbability?.confidence ||
                 content.achievementProbability?.confidence || 'MEDIUM';
    
    factors = content.factors || 
              content.targetGoalProbability?.factors ||
              content.achievementProbability?.factors || [];
    
    // Get best possible GPA from post-processed analysis (prioritize this over cached values)
    if (content.targetGoalProbability && content.targetGoalProbability.bestPossibleGPA) {
      bestPossibleGPA = content.targetGoalProbability.bestPossibleGPA;
    } else if (content.bestPossibleGPA) {
      bestPossibleGPA = content.bestPossibleGPA;
    } else if (content.predictedFinalGrade && content.predictedFinalGrade.gpa) {
      bestPossibleGPA = content.predictedFinalGrade.gpa;
    }
  }
  
  // Fallback to direct properties if content parsing failed
  if (!probability && !bestPossibleGPA) {
    probability = aiAnalysisData.successProbability || aiAnalysisData.probability || 0;
    confidence = aiAnalysisData.confidence || 'MEDIUM';
    factors = aiAnalysisData.factors || [];
    
    if (aiAnalysisData.bestPossibleGPA) {
      bestPossibleGPA = aiAnalysisData.bestPossibleGPA;
    } else if (aiAnalysisData.predictedFinalGrade && aiAnalysisData.predictedFinalGrade.gpa) {
      bestPossibleGPA = aiAnalysisData.predictedFinalGrade.gpa;
    }
  }
  
  // Calculate best possible GPA based on actual performance and upcoming assessments
  if (!bestPossibleGPA) {
    const currentGPA = parseFloat(aiAnalysisData.currentGPA) || 0;
    
    // Use the same calculation as the assessment card's GPA Impact Analysis
    // This ensures consistency between the dashboard and individual assessment predictions
    if (aiAnalysisData.grades && aiAnalysisData.categories) {
      // Calculate what the GPA would be with perfect scores on remaining assessments only
      const maxPossibleGrade = calculateMaxPossibleGrade(aiAnalysisData.grades, aiAnalysisData.categories);
      bestPossibleGPA = calculateGPAFromPercentage(maxPossibleGrade).toFixed(2);
    } else {
      // Fallback calculation
      const hasUpcomingAssessments = aiAnalysisData.upcomingAssessments && aiAnalysisData.upcomingAssessments.length > 0;
      if (hasUpcomingAssessments) {
        bestPossibleGPA = Math.min(4.0, currentGPA + 0.1).toFixed(2); // More conservative increase
      } else {
        bestPossibleGPA = currentGPA.toFixed(2);
      }
    }
  }
  
  const result = {
    probability: probability,
    confidence: confidence,
    factors: factors,
    bestPossibleGPA: bestPossibleGPA
  };
  
  // Returning achievement probability
  return result;
};

