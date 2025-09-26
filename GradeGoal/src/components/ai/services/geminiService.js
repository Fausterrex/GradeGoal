// ========================================
// GEMINI AI SERVICE
// ========================================
// Service for integrating with Google Gemini AI API
// Provides intelligent academic recommendations and predictions

import { setAIAnalysisData } from './aiAnalysisService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key-here';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Cache for AI recommendations to avoid unnecessary API calls
const aiRecommendationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// In-memory storage for AI analysis (temporary solution)
const aiAnalysisStorage = new Map();

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
    const response = await fetch(`${API_BASE_URL}/ai-analysis/course/${courseId}/user/${userId}/exists`);
    
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
    console.log('Current course grade calculation:', {
      currentGrade: currentGrade,
      grades: courseData.grades?.length || 0,
      categories: courseData.categories?.length || 0
    });
    
    // Check if API key is available
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      console.warn('Gemini API key not configured, using fallback recommendations');
      console.log('Using fallback with GPA values:', { 
        currentGPA: courseData.currentGPA, 
        targetValue: goalData.targetValue,
        gap: parseFloat(goalData.targetValue) - parseFloat(courseData.currentGPA)
      });
      const fallbackResult = getFallbackRecommendations(courseData, goalData);
      
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
      const fallbackResult = getFallbackRecommendations(courseData, goalData);
      
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
      } else {
        console.warn(`Gemini API error: ${response.status} - ${response.statusText}`);
        console.log('Falling back to local AI analysis due to API error');
      }
      return getFallbackRecommendations(courseData, goalData);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // Parse the AI response into structured data
    const parsedAnalysis = parseRealAIResponse(aiResponse, courseData, goalData);
    
    const result = {
      userId: courseData.course?.userId || 1,
      courseId: courseData.course?.id || 1,
      recommendationType: 'AI_ANALYSIS',
      title: `AI Analysis for ${courseData.course?.courseName || 'Course'}`,
      content: JSON.stringify(parsedAnalysis),
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

    // Save to database for persistence (temporarily disabled)
    // try {
    //   await saveAIAnalysisToDatabase(result, courseData, goalData);
    // } catch (error) {
    //   console.warn('Failed to save AI analysis to database:', error);
    //   // Continue with cached result even if database save fails
    // }

    return result;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return getFallbackRecommendations(courseData, goalData);
  }
};

/**
 * Build comprehensive prompt for real AI analysis
 */
const buildRealAnalysisPrompt = (courseData, goalData, priorityLevel) => {
  const { course, grades, categories, currentGPA, progress } = courseData;
  const { targetValue, goalType } = goalData;

  // Calculate current performance metrics
  const currentGrade = calculateCurrentGrade(grades, categories);
  const remainingWeight = calculateRemainingWeight(categories);
  const targetGrade = parseFloat(targetValue);

  return `You are an advanced AI academic advisor analyzing a student's performance in ONE SPECIFIC COURSE ONLY. Provide a comprehensive analysis with specific focus areas and predictions for this course.

IMPORTANT: You are analyzing ONLY the course "${course?.courseName || 'Unknown'}" (ID: ${course?.id || 'N/A'}). Do NOT consider data from other courses.

COURSE INFORMATION:
- Course: ${course?.courseName || 'Unknown'} (${course?.courseCode || 'N/A'})
- Course ID: ${course?.id || 'N/A'}
- Credits: ${course?.credits || 'N/A'}
- Current Progress: ${progress || 0}%
- Current GPA: ${currentGPA || 0}
- Current Course Grade: ${currentGrade || 0}%

ASSESSMENT BREAKDOWN:
${categories.map(cat => `
- ${cat.categoryName}: ${cat.weight}% weight
  Current Average: ${cat.averageGrade || 'No grades yet'}
  Completed: ${cat.completedCount || 0}/${cat.totalCount || 0}
  Status: ${cat.completedCount === cat.totalCount ? 'COMPLETE' : 'IN PROGRESS'}
`).join('')}

CURRENT GRADES:
${(() => {
  // Handle both array and object formats for grades
  let gradesArray = [];
  if (Array.isArray(grades)) {
    gradesArray = grades;
  } else if (typeof grades === 'object') {
    gradesArray = Object.values(grades).flat();
  }
  
  if (gradesArray.length > 0) {
    return gradesArray.map(grade => `
- ${grade.assessmentName || grade.name || 'Assessment'}: ${grade.score}/${grade.maxScore} (${grade.percentage}%)
  Category: ${grade.categoryName || grade.category?.name || 'Unknown'}
  Due: ${grade.dueDate || 'Not specified'}
  Status: ${grade.score === 0 ? 'PENDING' : 'COMPLETED'}
`).join('');
  }
  return 'No grades available yet';
})()}

UPCOMING ASSESSMENTS:
${(() => {
  // Handle both array and object formats for grades
  let gradesArray = [];
  if (Array.isArray(grades)) {
    gradesArray = grades;
  } else if (typeof grades === 'object') {
    gradesArray = Object.values(grades).flat();
  }
  
  if (gradesArray.length > 0) {
    return gradesArray.filter(grade => grade.score === 0).map(grade => `
- ${grade.assessmentName || grade.name || 'Assessment'}: ${grade.maxScore} points possible
  Category: ${grade.categoryName || grade.category?.name || 'Unknown'}
  Due: ${grade.dueDate || 'Not specified'}
  PREDICTION NEEDED: What score do they need to reach their target?
`).join('');
  }
  return 'No upcoming assessments';
})()}

TARGET GOAL:
- Target: ${targetValue} (${goalType})
- Priority Level: ${priorityLevel}
- Note: ${goalType === 'COURSE_GRADE' ? 'Target is a percentage grade (0-100%)' : 'Target is in GPA format (0.0-4.0 scale)'}

ANALYSIS REQUIREMENTS:
1. **PREDICTED FINAL GRADE**: Calculate the likely final grade based on current scores + remaining assessments
2. **ASSESSMENT GRADE RECOMMENDATIONS**: Specific score recommendations for each upcoming assessment
3. **TARGET GOAL PROBABILITY**: Calculate the probability of reaching the target goal (0-100%)
4. **STATUS UPDATE**: Current academic status and progress summary
5. **STUDY HABIT RECOMMENDATIONS**: Personalized study strategies and habits
6. **FOCUS INDICATORS**: Identify which assessment categories need attention (Assignments, Quizzes, Exams)
7. **SCORE PREDICTIONS**: Predict what scores are needed on upcoming assessments to reach the target

CRITICAL: The student has good grades so far. Calculate what they need on remaining assessments to reach their target. If they need a perfect score on Quiz 2 to get close to their target, predict that and explain why it's achievable.

IMPORTANT: 
- Current GPA: ${currentGPA} (0.0-4.0 scale)
- Current Course Grade: ${currentGrade}% (0-100% scale)
- Target: ${targetValue} (${goalType === 'COURSE_GRADE' ? 'percentage grade 0-100%' : 'GPA scale 0.0-4.0'})
- Calculate probability based on realistic improvement potential
- If target is percentage (0-100%), compare with current course percentage (${currentGrade}%), not GPA

CALCULATION EXAMPLE:
- If student has 96% current grade and needs 100% target
- They need only 4% improvement - this is very achievable!
- If they get perfect score on remaining assessments, they can reach target
- Calculate probability based on how close they are to target, not how far

RESPONSE FORMAT (JSON):
{
  "predictedFinalGrade": {
    "percentage": "X%",
    "gpa": "X.X",
    "confidence": "HIGH/MEDIUM/LOW",
    "explanation": "Based on current performance and remaining assessments"
  },
  "assessmentGradeRecommendations": {
    "assignments": {"recommendedScore": "X%", "reasoning": "explanation", "priority": "HIGH/MEDIUM/LOW"},
    "quizzes": {"recommendedScore": "X%", "reasoning": "explanation", "priority": "HIGH/MEDIUM/LOW"},
    "exams": {"recommendedScore": "X%", "reasoning": "explanation", "priority": "HIGH/MEDIUM/LOW"}
  },
  "targetGoalProbability": {
    "probability": "X%",
    "factors": ["factor1", "factor2", "factor3"],
    "confidence": "HIGH/MEDIUM/LOW",
    "explanation": "Why this probability is realistic"
  },
  "statusUpdate": {
    "currentStatus": "ON_TRACK/AT_RISK/EXCELLING",
    "progressSummary": "Current academic standing and performance",
    "keyAchievements": ["achievement1", "achievement2"],
    "areasOfConcern": ["concern1", "concern2"]
  },
  "studyHabitRecommendations": {
    "dailyHabits": ["habit1", "habit2", "habit3"],
    "weeklyStrategies": ["strategy1", "strategy2"],
    "examPreparation": ["prep1", "prep2", "prep3"],
    "timeManagement": "specific time management advice"
  },
  "focusIndicators": {
    "assignments": {"needsAttention": true/false, "reason": "explanation", "priority": "HIGH/MEDIUM/LOW"},
    "quizzes": {"needsAttention": true/false, "reason": "explanation", "priority": "HIGH/MEDIUM/LOW"},
    "exams": {"needsAttention": true/false, "reason": "explanation", "priority": "HIGH/MEDIUM/LOW"}
  },
  "scorePredictions": {
    "assignments": {"neededScore": "X%", "confidence": "HIGH/MEDIUM/LOW"},
    "quizzes": {"neededScore": "X%", "confidence": "HIGH/MEDIUM/LOW"},
    "exams": {"neededScore": "X%", "confidence": "HIGH/MEDIUM/LOW"}
  },
  "recommendations": {
    "assignments": "specific advice",
    "quizzes": "specific advice", 
    "exams": "specific advice"
  },
  "studyStrategy": {
    "focus": "primary focus area",
    "schedule": "recommended study schedule",
    "tips": ["tip1", "tip2", "tip3"]
  }
}

Provide a detailed, actionable analysis that helps the student understand exactly what they need to do to reach their target goal.

REMEMBER: This analysis is ONLY for the course "${course?.courseName || 'Unknown'}" (ID: ${course?.id || 'N/A'}). Do not reference or consider any other courses in your analysis.`;
};

/**
 * Parse real AI response into structured data
 */
const parseRealAIResponse = (aiResponse, courseData, goalData) => {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse AI response as JSON, using fallback parsing');
  }

  // Fallback parsing if JSON extraction fails
  // Calculate realistic probability based on current vs target GPA
  const currentGPA = parseFloat(courseData.currentGPA) || 0;
  const targetGPA = parseFloat(goalData.targetValue) || 4.0;
  const gpaGap = targetGPA - currentGPA;
  
  let probability = 50; // Default
  if (gpaGap <= 0) {
    probability = 100; // Already achieved or exceeded
  } else if (gpaGap <= 0.3) {
    probability = 85; // Small gap, high probability
  } else if (gpaGap <= 0.5) {
    probability = 70; // Moderate gap, good probability
  } else if (gpaGap <= 1.0) {
    probability = 45; // Large gap, moderate probability
  } else {
    probability = 20; // Very large gap, low probability
  }

  return {
    focusIndicators: {
      assignments: { needsAttention: true, reason: "Focus on improving assignment quality", priority: "MEDIUM" },
      quizzes: { needsAttention: true, reason: "Maintain current quiz performance", priority: "LOW" },
      exams: { needsAttention: true, reason: "Critical for reaching target GPA", priority: "HIGH" }
    },
    scorePredictions: {
      assignments: { neededScore: "85%", confidence: "MEDIUM" },
      quizzes: { neededScore: "90%", confidence: "HIGH" },
      exams: { neededScore: "80%", confidence: "MEDIUM" }
    },
    achievementProbability: {
      probability: `${probability}%`,
      factors: [`Current GPA: ${currentGPA}`, `Target GPA: ${targetGPA}`, `Gap: ${gpaGap.toFixed(2)}`],
      confidence: probability >= 70 ? "HIGH" : probability >= 40 ? "MEDIUM" : "LOW"
    },
    recommendations: {
      assignments: "Focus on understanding requirements and following rubrics closely",
      quizzes: "Continue current study habits, focus on key concepts",
      exams: "Intensive preparation needed, review all course materials"
    },
    studyStrategy: {
      focus: "Exam preparation",
      schedule: "2-3 hours daily",
      tips: ["Active recall", "Spaced repetition", "Practice problems"]
    }
  };
};

/**
 * Calculate current grade based on completed assessments
 */
const calculateCurrentGrade = (grades, categories) => {
  if (!grades || categories.length === 0) return 0;
  
  // Handle both array and object formats for grades
  let gradesArray = [];
  if (Array.isArray(grades)) {
    gradesArray = grades;
  } else if (typeof grades === 'object') {
    // Convert object format to array
    gradesArray = Object.values(grades).flat();
  }
  
  if (gradesArray.length === 0) return 0;
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  categories.forEach(category => {
    const categoryGrades = gradesArray.filter(g => g.categoryName === category.categoryName);
    if (categoryGrades.length > 0) {
      const categoryAverage = categoryGrades.reduce((sum, g) => sum + g.percentage, 0) / categoryGrades.length;
      totalWeightedScore += (categoryAverage * category.weight / 100);
      totalWeight += category.weight;
    }
  });
  
  return totalWeight > 0 ? totalWeightedScore : 0;
};

/**
 * Calculate remaining weight for incomplete categories
 */
const calculateRemainingWeight = (categories) => {
  return categories.reduce((total, cat) => {
    const completedWeight = (cat.completedCount / cat.totalCount) * cat.weight;
    return total + (cat.weight - completedWeight);
  }, 0);
};

/**
 * Build the prompt for Gemini AI
 */
const buildRecommendationPrompt = (courseData, goalData, priorityLevel) => {
  const { course, grades, categories, currentGPA, progress } = courseData;
  const { targetValue, goalType } = goalData;

  return `You are an AI academic advisor for a student management system. Analyze the following course data and provide comprehensive recommendations.

COURSE INFORMATION:
- Course: ${course.courseName} (${course.courseCode})
- Current GPA: ${currentGPA.toFixed(2)}
- Progress: ${progress}%
- Target Goal: ${targetValue} ${goalType}
- Priority Level: ${priorityLevel}

ASSESSMENT CATEGORIES:
${categories.map(cat => 
  `- ${cat.categoryName}: ${cat.weightPercentage}% weight`
).join('\n')}

CURRENT GRADES:
${Object.keys(grades).map(categoryId => {
  const category = categories.find(c => c.id === categoryId);
  const categoryGrades = grades[categoryId] || [];
  return `- ${category?.categoryName || 'Unknown'}: ${categoryGrades.map(grade => 
    `${grade.percentageScore}% (${grade.pointsEarned}/${grade.pointsPossible} points)`
  ).join(', ') || 'No grades yet'}`;
}).join('\n')}

Please provide a comprehensive analysis in the following JSON format:
{
  "predictedFinalGrade": {
    "percentage": "predicted percentage",
    "gpa": "predicted GPA",
    "confidence": "confidence level (HIGH/MEDIUM/LOW)",
    "reasoning": "explanation of prediction"
  },
  "assessmentRecommendations": [
    {
      "category": "category name",
      "recommendedGrade": "recommended grade percentage",
      "reasoning": "why this grade is needed",
      "priority": "HIGH/MEDIUM/LOW"
    }
  ],
  "targetGoalProbability": {
    "achievable": true/false,
    "probability": "percentage chance",
    "requiredGrades": "what grades are needed",
    "recommendations": "specific advice"
  },
  "statusUpdate": {
    "currentStatus": "current performance status",
    "trend": "improving/declining/stable",
    "keyInsights": ["insight1", "insight2", "insight3"]
  },
  "studyHabits": [
    {
      "habit": "specific study habit",
      "reasoning": "why this helps",
      "priority": "HIGH/MEDIUM/LOW"
    }
  ]
}

Focus on:
1. Realistic predictions based on current performance
2. Actionable recommendations
3. Specific grade targets for remaining assessments
4. Study strategies tailored to the student's current situation
5. Honest assessment of goal achievability

Be encouraging but realistic. Provide specific, actionable advice.`;
};

/**
 * Parse the AI response into structured data
 */
const parseAIResponse = (aiResponse, courseData, goalData) => {
  try {
    // Extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      courseId: courseData.course.id,
      userId: courseData.course.userId,
      recommendationType: 'AI_ANALYSIS',
      title: `AI Analysis for ${courseData.course.courseName}`,
      content: JSON.stringify(parsed),
      priority: determinePriority(parsed),
      aiGenerated: true,
      generatedAt: new Date().toISOString(),
      ...parsed
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return getFallbackRecommendations(courseData, goalData);
  }
};

/**
 * Determine priority based on AI analysis
 */
const determinePriority = (analysis) => {
  if (analysis.targetGoalProbability && !analysis.targetGoalProbability.achievable) {
    return 'HIGH';
  }
  if (analysis.predictedFinalGrade && analysis.predictedFinalGrade.confidence === 'LOW') {
    return 'HIGH';
  }
  return 'MEDIUM';
};

/**
 * Enhanced fallback recommendations when AI fails
 */
const getFallbackRecommendations = (courseData, goalData) => {
  const { currentGPA, progress, grades, categories } = courseData;
  const { targetValue, goalType } = goalData;

  // Calculate current course grade from actual grades
  const currentGrade = calculateCurrentGrade(grades, categories);
  
  // Convert target value to number for proper comparison
  const targetGPA = parseFloat(targetValue) || 4.0;
  const currentGPAValue = parseFloat(currentGPA) || 0;
  const gpaGap = targetGPA - currentGPAValue;
  
  console.log('🎯 Enhanced fallback calculation:', {
    currentGPA: currentGPAValue,
    currentGrade: currentGrade,
    targetGPA: targetGPA,
    goalType: goalType,
    gap: gpaGap,
    progress: progress,
    gradesCount: Array.isArray(grades) ? grades.length : Object.keys(grades).length,
    categoriesCount: categories?.length || 0
  });
  
  // Calculate realistic probability based on GPA gap
  let probability = 50; // Default
  let confidence = "MEDIUM";
  let status = "Needs improvement";
  
  if (gpaGap <= 0) {
    probability = 100;
    confidence = "HIGH";
    status = "Goal achieved!";
  } else if (gpaGap <= 0.3) {
    probability = 85;
    confidence = "HIGH";
    status = "Excellent progress";
  } else if (gpaGap <= 0.5) {
    probability = 70;
    confidence = "HIGH";
    status = "Good progress";
  } else if (gpaGap <= 1.0) {
    probability = 45;
    confidence = "MEDIUM";
    status = "Moderate progress";
  } else {
    probability = 25;
    confidence = "LOW";
    status = "Challenging goal";
  }

  // Generate intelligent focus indicators based on actual course data
  const focusIndicators = generateIntelligentFocusIndicators(categories, grades, gpaGap);
  const scorePredictions = generateIntelligentScorePredictions(categories, gpaGap, confidence);
  const recommendations = generateIntelligentRecommendations(categories, gpaGap, currentGrade);
  
  // Calculate predicted final grade
  const predictedFinalGrade = calculatePredictedFinalGrade(currentGrade, categories, grades, gpaGap);
  
  // Generate assessment grade recommendations
  const assessmentGradeRecommendations = generateAssessmentGradeRecommendations(categories, gpaGap, confidence);
  
  // Generate status update
  const statusUpdate = generateStatusUpdate(currentGPAValue, targetGPA, progress, gpaGap);
  
  // Generate study habit recommendations
  const studyHabitRecommendations = generateStudyHabitRecommendations(gpaGap, confidence);

  const fallbackResult = {
    courseId: courseData.course.id,
    userId: courseData.course.userId,
    recommendationType: 'AI_ANALYSIS',
    title: `Enhanced Analysis for ${courseData.course.courseName}`,
    content: JSON.stringify({
      predictedFinalGrade,
      assessmentGradeRecommendations,
      targetGoalProbability: {
        probability: `${probability}%`,
        factors: [
          `Current GPA: ${currentGPAValue}`,
          `Target GPA: ${targetGPA}`,
          `Gap: ${gpaGap.toFixed(2)}`,
          `Course Progress: ${progress}%`,
          `Current Grade: ${currentGrade}%`
        ],
        confidence: confidence,
        explanation: `Based on current performance and remaining assessments`
      },
      statusUpdate,
      studyHabitRecommendations,
      focusIndicators,
      scorePredictions,
      recommendations,
      studyStrategy: {
        focus: gpaGap > 0.5 ? "Intensive exam preparation" : "Maintain current performance",
        schedule: gpaGap > 0.5 ? "3-4 hours daily" : "2-3 hours daily",
        tips: ["Active recall", "Practice problems", "Regular review", "Seek help when needed"]
      }
    }),
    priority: gpaGap > 0.5 ? 'HIGH' : 'MEDIUM',
    aiGenerated: false,
    generatedAt: new Date().toISOString()
  };

  // Set AI analysis data for real-time updates across components
  setAIAnalysisData(fallbackResult);

  return fallbackResult;
};

/**
 * Generate intelligent focus indicators based on actual course data
 */
const generateIntelligentFocusIndicators = (categories, grades, gpaGap) => {
  const indicators = {};
  
  if (!categories || categories.length === 0) {
    return {
      assignments: { needsAttention: gpaGap > 0.3, reason: "Focus on maintaining high scores", priority: gpaGap > 0.5 ? "HIGH" : "MEDIUM" },
      quizzes: { needsAttention: gpaGap > 0.3, reason: "Consistent performance needed", priority: gpaGap > 0.5 ? "HIGH" : "MEDIUM" },
      exams: { needsAttention: gpaGap > 0.2, reason: "Critical for reaching target GPA", priority: "HIGH" }
    };
  }
  
  categories.forEach(category => {
    const categoryName = (category.categoryName || category.name).toLowerCase();
    const categoryGrades = grades[category.id] || [];
    const hasGrades = categoryGrades.length > 0;
    const averageGrade = hasGrades ? categoryGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / categoryGrades.length : 0;
    
    let needsAttention = false;
    let reason = "";
    let priority = "MEDIUM";
    
    if (!hasGrades) {
      needsAttention = true;
      reason = `No grades yet in ${categoryName}. This category is worth ${category.weight}% of your final grade.`;
      priority = "HIGH";
    } else if (averageGrade < 70) {
      needsAttention = true;
      reason = `Average grade in ${categoryName} is ${averageGrade.toFixed(1)}%. Need improvement to reach target.`;
      priority = "HIGH";
    } else if (averageGrade < 80) {
      needsAttention = true;
      reason = `Average grade in ${categoryName} is ${averageGrade.toFixed(1)}%. Room for improvement.`;
      priority = "MEDIUM";
    } else {
      needsAttention = false;
      reason = `Good performance in ${categoryName} (${averageGrade.toFixed(1)}%). Keep it up!`;
      priority = "LOW";
    }
    
    indicators[categoryName] = { needsAttention, reason, priority };
  });
  
  return indicators;
};

/**
 * Generate intelligent score predictions based on course data
 */
const generateIntelligentScorePredictions = (categories, gpaGap, confidence) => {
  const predictions = {};
  
  if (!categories || categories.length === 0) {
    return {
      assignments: { neededScore: `${Math.min(95, 85 + gpaGap * 10)}%`, confidence: confidence },
      quizzes: { neededScore: `${Math.min(95, 90 + gpaGap * 5)}%`, confidence: confidence },
      exams: { neededScore: `${Math.min(95, 80 + gpaGap * 10)}%`, confidence: confidence }
    };
  }
  
  categories.forEach(category => {
    const categoryName = (category.categoryName || category.name).toLowerCase();
    const weight = category.weight || 0;
    
    // Calculate needed score based on category weight and GPA gap
    let neededScore = 85;
    if (weight >= 40) { // High weight categories (like exams)
      neededScore = Math.min(95, 80 + gpaGap * 15);
    } else if (weight >= 30) { // Medium weight categories
      neededScore = Math.min(95, 85 + gpaGap * 10);
    } else { // Lower weight categories
      neededScore = Math.min(95, 90 + gpaGap * 5);
    }
    
    predictions[categoryName] = { 
      neededScore: `${neededScore}%`, 
      confidence: confidence 
    };
  });
  
  return predictions;
};

/**
 * Generate intelligent recommendations based on course data
 */
const generateIntelligentRecommendations = (categories, gpaGap, currentGrade) => {
  const recommendations = {};
  
  if (!categories || categories.length === 0) {
    return {
      assignments: "Maintain current high performance on assignments",
      quizzes: "Focus on consistent quiz performance", 
      exams: "Prepare thoroughly for upcoming exams"
    };
  }
  
  categories.forEach(category => {
    const categoryName = (category.categoryName || category.name).toLowerCase();
    const weight = category.weight || 0;
    
    let recommendation = "";
    
    if (weight >= 40) { // High weight categories
      recommendation = gpaGap > 0.5 
        ? `Focus intensively on ${categoryName} - they're worth ${weight}% of your grade and critical for reaching your target.`
        : `Maintain strong performance in ${categoryName} - they're worth ${weight}% of your grade.`;
    } else if (weight >= 30) { // Medium weight categories
      recommendation = gpaGap > 0.3
        ? `Consistent performance in ${categoryName} is important (${weight}% of grade).`
        : `Keep up the good work in ${categoryName} (${weight}% of grade).`;
    } else { // Lower weight categories
      recommendation = `Continue performing well in ${categoryName} (${weight}% of grade).`;
    }
    
    recommendations[categoryName] = recommendation;
  });
  
  return recommendations;
};

/**
 * Calculate predicted final grade based on current performance and remaining assessments
 */
const calculatePredictedFinalGrade = (currentGrade, categories, grades, gpaGap) => {
  // Calculate weighted average of completed assessments
  let completedWeight = 0;
  let totalWeightedGrade = 0;
  
  if (categories && categories.length > 0) {
    categories.forEach(category => {
      const categoryGrades = grades[category.id] || [];
      if (categoryGrades.length > 0) {
        const categoryAverage = categoryGrades.reduce((sum, grade) => {
          const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
          return sum + percentage;
        }, 0) / categoryGrades.length;
        
        totalWeightedGrade += (categoryAverage * category.weight) / 100;
        completedWeight += category.weight;
      }
    });
  }
  
  // Estimate final grade based on current performance and remaining weight
  const remainingWeight = 100 - completedWeight;
  const estimatedFinalGrade = totalWeightedGrade + (currentGrade * remainingWeight / 100);
  
  // Convert to GPA
  const estimatedGPA = Math.max(0, Math.min(4.0, (estimatedFinalGrade - 60) * 0.1 + 1.0));
  
  let confidence = "MEDIUM";
  if (gpaGap <= 0.3) confidence = "HIGH";
  else if (gpaGap > 0.8) confidence = "LOW";
  
  return {
    percentage: `${Math.round(estimatedFinalGrade)}%`,
    gpa: estimatedGPA.toFixed(2),
    confidence: confidence,
    explanation: `Based on current performance (${currentGrade}%) and remaining assessments`
  };
};

/**
 * Generate assessment grade recommendations for each category
 */
const generateAssessmentGradeRecommendations = (categories, gpaGap, confidence) => {
  const recommendations = {};
  
  if (!categories || categories.length === 0) {
    return {
      assignments: { recommendedScore: "85%", reasoning: "Maintain strong performance", priority: "MEDIUM" },
      quizzes: { recommendedScore: "80%", reasoning: "Consistent effort needed", priority: "MEDIUM" },
      exams: { recommendedScore: "90%", reasoning: "Critical for reaching target", priority: "HIGH" }
    };
  }
  
  categories.forEach(category => {
    const categoryName = (category.categoryName || category.name).toLowerCase();
    const categoryGrades = grades[category.id] || [];
    const hasGrades = categoryGrades.length > 0;
    
    let recommendedScore = "85%";
    let reasoning = "Maintain current performance";
    let priority = "MEDIUM";
    
    if (!hasGrades) {
      recommendedScore = gpaGap > 0.5 ? "90%" : "85%";
      reasoning = `No grades yet. This category is worth ${category.weight}% of your final grade.`;
      priority = "HIGH";
    } else {
      const averageGrade = categoryGrades.reduce((sum, grade) => {
        const percentage = grade.percentage || ((grade.score / grade.maxScore) * 100);
        return sum + percentage;
      }, 0) / categoryGrades.length;
      
      if (averageGrade < 70) {
        recommendedScore = "85%";
        reasoning = `Current average is ${averageGrade.toFixed(1)}%. Need significant improvement.`;
        priority = "HIGH";
      } else if (averageGrade < 80) {
        recommendedScore = "85%";
        reasoning = `Current average is ${averageGrade.toFixed(1)}%. Room for improvement.`;
        priority = "MEDIUM";
      } else {
        recommendedScore = "90%";
        reasoning = `Good performance (${averageGrade.toFixed(1)}%). Keep it up!`;
        priority = "LOW";
      }
    }
    
    recommendations[categoryName] = { recommendedScore, reasoning, priority };
  });
  
  return recommendations;
};

/**
 * Generate status update based on current performance
 */
const generateStatusUpdate = (currentGPA, targetGPA, progress, gpaGap) => {
  let currentStatus = "ON_TRACK";
  let progressSummary = "Good academic progress";
  const keyAchievements = [];
  const areasOfConcern = [];
  
  if (gpaGap <= 0) {
    currentStatus = "EXCELLING";
    progressSummary = "Outstanding performance! You've exceeded your target.";
    keyAchievements.push("Target GPA achieved", "Strong academic performance");
  } else if (gpaGap <= 0.3) {
    currentStatus = "ON_TRACK";
    progressSummary = "Excellent progress toward your target GPA.";
    keyAchievements.push("Close to target GPA", "Consistent performance");
  } else if (gpaGap <= 0.5) {
    currentStatus = "ON_TRACK";
    progressSummary = "Good progress, but more effort needed to reach target.";
    keyAchievements.push("Steady improvement");
    areasOfConcern.push("Need to maintain high performance");
  } else {
    currentStatus = "AT_RISK";
    progressSummary = "Challenging target. Significant improvement needed.";
    areasOfConcern.push("Large GPA gap to close", "Need excellent performance on remaining assessments");
  }
  
  if (progress < 50) {
    areasOfConcern.push("Course still in early stages");
  }
  
  return {
    currentStatus,
    progressSummary,
    keyAchievements,
    areasOfConcern
  };
};

/**
 * Generate study habit recommendations based on performance gap
 */
const generateStudyHabitRecommendations = (gpaGap, confidence) => {
  const dailyHabits = [];
  const weeklyStrategies = [];
  const examPreparation = [];
  let timeManagement = "";
  
  if (gpaGap > 0.5) {
    // Intensive study needed
    dailyHabits.push("2-3 hours of focused study", "Review previous day's material", "Practice problems daily");
    weeklyStrategies.push("Complete all assignments early", "Attend all office hours", "Form study groups");
    examPreparation.push("Start studying 2 weeks early", "Create comprehensive study guides", "Practice with past exams");
    timeManagement = "Dedicate 4-5 hours daily to academic work. Use time-blocking techniques.";
  } else if (gpaGap > 0.2) {
    // Moderate improvement needed
    dailyHabits.push("1-2 hours of study", "Review lecture notes", "Complete homework on time");
    weeklyStrategies.push("Stay ahead of assignments", "Ask questions in class", "Review material weekly");
    examPreparation.push("Start studying 1 week early", "Focus on weak areas", "Practice active recall");
    timeManagement = "Maintain 2-3 hours daily study time. Use the Pomodoro technique.";
  } else {
    // Maintain current performance
    dailyHabits.push("1 hour of review", "Stay organized", "Complete assignments promptly");
    weeklyStrategies.push("Maintain current study habits", "Help classmates when possible", "Stay engaged in class");
    examPreparation.push("Review material 3-5 days before", "Maintain current study routine", "Get adequate rest");
    timeManagement = "Continue current study schedule. Focus on consistency.";
  }
  
  return {
    dailyHabits,
    weeklyStrategies,
    examPreparation,
    timeManagement
  };
};

/**
 * Calculate enhanced achievement probability using AI insights
 */
export const calculateEnhancedAchievementProbability = (courseData, goalData, aiAnalysis) => {
  const { currentGPA, progress } = courseData;
  const { targetValue } = goalData;
  
  // If goal is already achieved, return 100% immediately
  if (currentGPA >= targetValue) {
    return 100;
  }
  
  if (!aiAnalysis || !aiAnalysis.targetGoalProbability) {
    // Fallback to basic calculation using the improved gpaConversionUtils function
    const { calculateAchievementProbability } = require('../../course/academic_goal/gpaConversionUtils');
    return calculateAchievementProbability(currentGPA, targetValue, progress || 0);
  }

  const { achievable, probability } = aiAnalysis.targetGoalProbability;
  
  if (!achievable) {
    return 0;
  }

  // Extract probability percentage from string
  const probabilityMatch = probability.match(/(\d+)%/);
  const probabilityValue = probabilityMatch ? parseInt(probabilityMatch[1]) : 50;
  
  // Don't penalize based on course progress - AI should be more optimistic
  // Instead, use progress as a confidence booster
  const progressBonus = Math.min(progress / 100, 1) * 0.1; // Up to 10% bonus
  const adjustedProbability = Math.min(probabilityValue + (progressBonus * 100), 100);
  
  return Math.max(adjustedProbability, 0);
};

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
    console.log('Fetching AI recommendations for user:', userId, 'course:', courseId);
    
    // Check if we have stored AI analysis for this course
    const storageKey = `${userId}-${courseId}`;
    const storedAnalysis = aiAnalysisStorage.get(storageKey);
    
    if (storedAnalysis) {
      console.log('✅ Found stored AI analysis:', storedAnalysis.title);
      return [storedAnalysis];
    }
    
    // If no stored analysis, return empty array
    console.log('No AI analysis found for this course');
    return [];
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    return [];
  }
};