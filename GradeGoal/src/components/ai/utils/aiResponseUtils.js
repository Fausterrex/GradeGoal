// ========================================
// AI RESPONSE UTILITIES
// ========================================
// Utility functions for AI response parsing, processing, and prompt building

import { calculateCurrentGrade, calculateGPAFromPercentage } from './achievementProbabilityUtils.js';

/**
 * Build comprehensive prompt for real AI analysis
 */
export const buildRealAnalysisPrompt = (courseData, goalData, priorityLevel) => {
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

COMPLETED ASSESSMENTS:
${(() => {
  // Handle both array and object formats for grades
  let gradesArray = [];
  if (Array.isArray(grades)) {
    gradesArray = grades;
  } else if (typeof grades === 'object') {
    gradesArray = Object.values(grades).flat();
  }
  
  if (gradesArray.length > 0) {
    const completedGrades = gradesArray.filter(grade => 
      // An assessment is completed if it has a score > 0 OR explicitly marked as completed
      // This handles cases where someone might legitimately score 0 but still completed it
      (grade.score > 0) || 
      (grade.isCompleted === true) || 
      (grade.status === 'COMPLETED') ||
      // Check if percentage is explicitly set (indicates grading occurred)
      (grade.percentage !== undefined && grade.percentage !== null)
    );
    
    if (completedGrades.length > 0) {
      return completedGrades.map(grade => `
- ${grade.assessmentName || grade.name || 'Assessment'}: ${grade.score}/${grade.maxScore} (${grade.percentage || 0}%)
  Category: ${grade.categoryName || grade.category?.name || 'Unknown'}
  Due: ${grade.dueDate || 'Not specified'}
  Status: COMPLETED
`).join('');
    }
  }
  return 'No completed assessments yet';
})()}

UPCOMING/PENDING ASSESSMENTS:
${(() => {
  // Handle both array and object formats for grades
  let gradesArray = [];
  if (Array.isArray(grades)) {
    gradesArray = grades;
  } else if (typeof grades === 'object') {
    gradesArray = Object.values(grades).flat();
  }
  
  if (gradesArray.length > 0) {
    const upcomingGrades = gradesArray.filter(grade => 
      // An assessment is upcoming/pending if:
      // 1. Score is 0 AND no explicit completion markers
      // 2. OR explicitly marked as pending/upcoming
      (grade.score === 0 && 
       grade.isCompleted !== true && 
       grade.status !== 'COMPLETED' &&
       grade.percentage === undefined) ||
      (grade.status === 'PENDING') ||
      (grade.status === 'UPCOMING')
    );
    
    if (upcomingGrades.length > 0) {
      return upcomingGrades.map(grade => `
- ${grade.assessmentName || grade.name || 'Assessment'}: ${grade.maxScore} points possible
  Category: ${grade.categoryName || grade.category?.name || 'Unknown'}
  Due: ${grade.dueDate || 'Not specified'}
  Status: UPCOMING - NOT YET TAKEN
  FOCUS: This assessment needs preparation, not remediation!
`).join('');
    }
  }
  return 'No upcoming assessments - all assessments completed';
})()}

TARGET GOAL:
- Target: ${targetValue} (${goalType})
- Priority Level: ${priorityLevel}
- Note: ${goalType === 'COURSE_GRADE' ? 'Target is a percentage grade (0-100%)' : 'Target is in GPA format (0.0-4.0 scale)'}

ANALYSIS REQUIREMENTS:
1. **PREDICTED FINAL GRADE**: Calculate the likely final grade based on current scores + remaining assessments
2. **ASSESSMENT GRADE RECOMMENDATIONS**: Specific score recommendations for each upcoming assessment
3. **TARGET GOAL ANALYSIS**: Provide analysis of the target goal achievability:
   - Calculate the current weighted grade %.
   - Simulate perfect scores on all remaining assessments → compute maximum possible final grade % and GPA.
   - Compare maximum possible vs target and provide analysis.
   - Show clearly the minimum score required on each pending assessment to still reach the target.
   - Use GPA-to-percentage mapping rules when target is GPA (e.g., "≥97% = 4.0").
4. **STATUS UPDATE**: Current academic status and progress summary
5. **FOCUS INDICATORS**: Identify which assessment categories need attention (Assignments, Quizzes, Exams)
6. **SCORE PREDICTIONS**: Predict what scores are needed on upcoming assessments to reach the target

CRITICAL DISTINCTION:
- **COMPLETED ASSESSMENTS**: Already graded - provide analysis of performance and areas for improvement
- **UPCOMING/PENDING ASSESSMENTS**: Not yet taken - provide PREPARATION strategies, study tips, and target scores
- DO NOT treat assessments marked as "UPCOMING - NOT YET TAKEN" as poor performance
- For upcoming assessments, focus on preparation recommendations, not remediation

7. **TOP PRIORITY RECOMMENDATIONS**: Provide exactly 3-5 most important recommendations with:
   - Mix of course-specific and general academic advice
   - Priority-based ordering (HIGH, MEDIUM, LOW)
   - Quick action buttons where applicable (e.g., "Add Study Session", "Review Notes", "Practice Problems")
   - Specific, actionable steps the student can take immediately
   - FOR UPCOMING ASSESSMENTS: Focus on preparation strategies (study plans, review materials, practice)
   - FOR COMPLETED ASSESSMENTS: Focus on improvement strategies based on actual performance
   - Clearly distinguish between "prepare for upcoming exam" vs "improve assignment quality"


IMPORTANT: 
- Current GPA: ${currentGPA} (0.0-4.0 scale)
- Current Course Grade: ${currentGrade}% (0-100% scale)
- Target: ${targetValue} (${goalType === 'COURSE_GRADE' ? 'percentage grade 0-100%' : 'GPA scale 0.0-4.0'})
- Provide analysis based on realistic improvement potential
- If target is percentage (0-100%), compare with current course percentage (${currentGrade}%), not GPA
- Always base analysis on WEIGHTED PERCENTAGES of assessments (not just unweighted averages).
- When goalType is GPA, always map the final percentage to GPA using the provided rule (e.g., "97% and above = 4.0").
- Provide clear analysis of achievability with specific reasoning



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
  "targetGoalAnalysis": {
    "achievable": true/false,
    "analysis": "Detailed analysis of target goal achievability",
    "factors": ["weighted grade calculations", "remaining assessment weights", "max achievable grade vs target"],
    "confidence": "HIGH/MEDIUM/LOW",
    "explanation": "Step-by-step showing weighted grade math, minimum scores required, and achievability analysis"
  }
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
  "topPriorityRecommendations": [
    {
      "title": "Specific recommendation title",
      "description": "Detailed explanation of the recommendation",
      "priority": "HIGH/MEDIUM/LOW",
      "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC",
      "actionButton": {
        "text": "Quick action text",
        "action": "ACTION_TYPE",
        "enabled": true
      },
      "impact": "Expected impact on grade/performance"
    }
  ],
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
export const buildRecommendationPrompt = (courseData, goalData, priorityLevel) => {
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
  "targetGoalAnalysis": {
    "achievable": true/false,
    "analysis": "detailed analysis of achievability",
    "requiredGrades": "what grades are needed",
    "recommendations": "specific advice"
  },
  "statusUpdate": {
    "currentStatus": "current performance status",
    "trend": "improving/declining/stable",
    "keyInsights": ["insight1", "insight2", "insight3"]
  },
  "topPriorityRecommendations": [
    {
      "title": "Specific recommendation title",
      "description": "Detailed explanation of the recommendation",
      "priority": "HIGH/MEDIUM/LOW",
      "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC",
      "actionButton": {
        "text": "Quick action text",
        "action": "ACTION_TYPE",
        "enabled": true
      },
      "impact": "Expected impact on grade/performance"
    }
  ]
}

Focus on:
1. Realistic predictions based on current performance
2. Actionable recommendations with quick action buttons
3. Specific grade targets for remaining assessments
4. Study strategies tailored to the student's current situation
5. Honest assessment of goal achievability
6. Mix of course-specific and general academic advice
7. Priority-based ordering (HIGH, MEDIUM, LOW)

Be encouraging but realistic. Provide specific, actionable advice with immediate next steps.`;
};

/**
 * Parse real AI response into structured data
 */
export const parseRealAIResponse = (aiResponse, courseData, goalData) => {
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
  // Provide basic analysis without probability calculation
  const currentGPA = parseFloat(courseData.currentGPA) || 0;
  let targetGPA;
  
  if (goalData.goalType === 'COURSE_GRADE') {
    // Target is a percentage (e.g., 100), convert to GPA for comparison
    const targetPercentage = parseFloat(goalData.targetValue) || 100;
    targetGPA = calculateGPAFromPercentage(targetPercentage);
  } else {
    // Target is already a GPA (e.g., 4.0)
    targetGPA = parseFloat(goalData.targetValue) || 4.0;
  }
  
  const gpaGap = targetGPA - currentGPA;
  const achievable = gpaGap <= 0.5; // Simple achievability check

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
    targetGoalAnalysis: {
      achievable: achievable,
      analysis: `Target goal ${achievable ? 'is achievable' : 'may be challenging'} based on current performance`,
      factors: [`Current GPA: ${currentGPA}`, `Target GPA: ${targetGPA}`, `Gap: ${gpaGap.toFixed(2)}`],
      confidence: achievable ? "HIGH" : "MEDIUM",
      explanation: `Based on current performance and remaining assessments`
    },
    topPriorityRecommendations: [
      {
        title: "Prepare for Upcoming Exams",
        description: "Create a study plan for upcoming exams. Focus on understanding key concepts and practicing problems rather than cramming.",
        priority: "HIGH",
        category: "COURSE_SPECIFIC",
        actionButton: {
          text: "Create Study Plan",
          action: "ADD_STUDY_SESSION",
          enabled: true
        },
        impact: "Critical for achieving target grade"
      },
      {
        title: "Review Course Materials",
        description: "Systematically review lecture notes, textbook chapters, and practice materials for upcoming assessments.",
        priority: "HIGH",
        category: "COURSE_SPECIFIC",
        actionButton: {
          text: "Review Notes",
          action: "REVIEW_NOTES",
          enabled: true
        },
        impact: "Essential preparation for success"
      },
      {
        title: "Practice Problem Solving",
        description: "Work through practice problems and past examples to build confidence for upcoming assessments.",
        priority: "MEDIUM",
        category: "COURSE_SPECIFIC",
        actionButton: {
          text: "Practice Problems",
          action: "PRACTICE_PROBLEMS",
          enabled: true
        },
        impact: "Builds competency and confidence"
      },
      {
        title: "Establish Study Schedule",
        description: "Set up a regular study schedule leading up to assessment dates to ensure adequate preparation time.",
        priority: "MEDIUM",
        category: "GENERAL_ACADEMIC",
        actionButton: {
          text: "Set Schedule",
          action: "SET_REMINDER",
          enabled: true
        },
        impact: "Ensures consistent preparation"
      }
    ],
    studyStrategy: {
      focus: "Exam preparation",
      schedule: "2-3 hours daily",
      tips: ["Active recall", "Spaced repetition", "Practice problems"]
    }
  };
};

/**
 * Parse the AI response into structured data
 */
export const parseAIResponse = async (aiResponse, courseData, goalData) => {
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
      return await getFallbackRecommendations(courseData, goalData);
    }
};

/**
 * Determine priority based on AI analysis
 */
export const determinePriority = (analysis) => {
  if (analysis.targetGoalAnalysis && !analysis.targetGoalAnalysis.achievable) {
    return 'HIGH';
  }
  if (analysis.predictedFinalGrade && analysis.predictedFinalGrade.confidence === 'LOW') {
    return 'HIGH';
  }
  return 'MEDIUM';
};

/**
 * Import getFallbackRecommendations from aiPredictionUtils
 * This is a circular dependency, so we'll handle it in the main service
 */
export const getFallbackRecommendations = null; // Will be set by main service
