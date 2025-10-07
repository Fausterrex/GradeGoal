// ========================================
// AI PREDICTION UTILITIES
// ========================================
// Utility functions for AI predictions, recommendations, and analysis

import { calculateCurrentGrade, calculateGPAFromPercentage } from "./achievementProbabilityUtils.js";
import DatabaseGradeService from "../../services/databaseGradeService.js";
/**
 * Enhanced fallback recommendations when AI fails
 */
export const getFallbackRecommendations = async (courseData, goalData) => {
  const { currentGPA, progress, grades, categories } = courseData;
  const { targetValue, goalType } = goalData;

  // Calculate current course grade from actual grades for debugging
  const currentGrade = calculateCurrentGrade(grades, categories);
  
  console.log({
    gradesCount: grades.length ? grades.length : Object.keys(grades).length,
    categoriesCount: categories?.length || 0
  });
  
  // Use the course GPA directly from the database (already calculated and stored)
  let currentGPAValue = parseFloat(currentGPA) || 0;
  // Only recalculate if database course GPA is missing or invalid
  if (currentGPAValue <= 0 && currentGrade > 0) {
    try {
      // Use static import instead of dynamic import
      currentGPAValue = await DatabaseGradeService.calculateGPA(currentGrade);
    } catch (error) {
      // Fallback to local calculation if database call fails
      currentGPAValue = calculateGPAFromPercentage(currentGrade);
      }
  } else {
    }
  
  // Handle different goal types - convert target value appropriately
  let targetGPA, gpaGap;
  
  if (goalType === 'COURSE_GRADE') {
    // Target is a percentage (e.g., 100), convert to GPA for comparison
    const targetPercentage = parseFloat(targetValue) || 100;
    targetGPA = calculateGPAFromPercentage(targetPercentage);
    gpaGap = targetGPA - currentGPAValue;
    } else {
    // Target is already a GPA (e.g., 4.0)
    targetGPA = parseFloat(targetValue) || 4.0;
    gpaGap = targetGPA - currentGPAValue;
  }
  
  console.log({
    gradesCount: grades.length ? grades.length : Object.keys(grades).length,
    categoriesCount: categories?.length || 0
  });
  
  // Calculate realistic probability based on GPA gap
  let probability = 50; // Default
  let confidence = "MEDIUM";
  let status = "Needs improvement";
  
  // Use realistic assessment-based probability calculation
  const { calculateRealisticAchievementProbability } = await import('./achievementProbabilityUtils.js');
  const realisticResult = calculateRealisticAchievementProbability(currentGPA, targetGPA, categories, grades);
  probability = realisticResult.probability || realisticResult; // Handle both object and number returns
  
  // Set confidence and status based on probability
  if (probability >= 90) {
    confidence = "HIGH";
    status = "Excellent chance of success";
  } else if (probability >= 70) {
    confidence = "HIGH";
    status = "Good chance of success";
  } else if (probability >= 50) {
    confidence = "MEDIUM";
    status = "Moderate chance of success";
  } else if (probability >= 30) {
    confidence = "MEDIUM";
    status = "Challenging but possible";
  } else if (probability >= 10) {
    confidence = "LOW";
    status = "Difficult to achieve";
  } else {
    confidence = "LOW";
    status = "Very difficult to achieve";
  }

  // Generate intelligent focus indicators based on actual course data
  const focusIndicators = generateIntelligentFocusIndicators(categories, grades, gpaGap);
  const scorePredictions = generateIntelligentScorePredictions(categories, gpaGap, confidence);
  const recommendations = generateIntelligentRecommendations(categories, gpaGap, currentGrade);
  
  // Calculate predicted final grade
  const predictedFinalGrade = calculatePredictedFinalGrade(currentGrade, categories, grades, gpaGap);
  
  // Generate assessment grade recommendations
  const assessmentGradeRecommendations = generateAssessmentGradeRecommendations(categories, grades, gpaGap, confidence);
  
  // Generate status update
  const statusUpdate = generateStatusUpdate(currentGPAValue, targetGPA, progress, gpaGap);
  
  // Generate study habit recommendations
  const studyHabitRecommendations = generateStudyHabitRecommendations(gpaGap, confidence);

  return {
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
    const totalCount = categoryGrades.length;
    const completedCount = categoryGrades.filter(grade => 
      grade.score !== null && grade.score !== undefined && grade.score > 0
    ).length;
    const averageGrade = hasGrades ? categoryGrades.reduce((sum, grade) => sum + (grade.percentage || 0), 0) / categoryGrades.length : 0;
    
    let needsAttention = false;
    let reason = "";
    let priority = "MEDIUM";
    
    if (totalCount === 0) {
      needsAttention = true;
      reason = `No assessments yet in ${categoryName}. This category is worth ${category.weight}% of your final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.`;
      priority = "HIGH";
    } else if (completedCount < totalCount) {
      // Has assessments remaining - always MEDIUM priority
      needsAttention = true;
      reason = `${categoryName} has ${totalCount - completedCount} assessment(s) remaining. Focus on upcoming ones to maintain/improve performance.`;
      priority = "MEDIUM";
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
      recommendation = gpaGap > 0.5 ? `Focus intensively on ${categoryName} - they're worth ${weight}% of your grade and critical for reaching your target.` : `Maintain strong performance in ${categoryName} - they're worth ${weight}% of your grade.`;
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
const generateAssessmentGradeRecommendations = (categories, grades, gpaGap, confidence) => {
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