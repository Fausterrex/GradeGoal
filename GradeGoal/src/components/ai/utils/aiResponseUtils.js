// ========================================
// AI RESPONSE UTILITIES
// ========================================
// Utility functions for AI response parsing, processing, and prompt building

import { calculateCurrentGrade, calculateGPAFromPercentage } from './achievementProbabilityUtils.js';

/**
 * Build comprehensive prompt for real AI analysis
 */
export const buildRealAnalysisPrompt = (courseData, goalData, priorityLevel, isShorter = false) => {
  const { course, grades, categories, currentGPA, progress, activeSemesterTerm } = courseData;
  const { targetValue, goalType } = goalData;

  console.log('🔍 [buildRealAnalysisPrompt] Course data:', courseData);
  console.log('🔍 [buildRealAnalysisPrompt] Active semester term:', activeSemesterTerm);
  console.log('🔍 [buildRealAnalysisPrompt] Grades:', grades);

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
- Current Semester Term: ${activeSemesterTerm || 'MIDTERM'} (${activeSemesterTerm === 'MIDTERM' ? 'Midterm Period' : 'Final Term Period'})
- Midterm Completed: ${course?.isMidtermCompleted ? 'Yes' : 'No'}

ASSESSMENT BREAKDOWN FOR CURRENT TERM (${activeSemesterTerm}):
${categories.map(cat => {
  const categoryGrades = grades[cat.id] || [];
  const currentTermGrades = categoryGrades.filter(grade => grade.semesterTerm === activeSemesterTerm);
  
  return `- ${cat.categoryName || cat.name} (${cat.weightPercentage || cat.weight}% weight):
    ${activeSemesterTerm} GRADES: ${currentTermGrades.length > 0 ? currentTermGrades.map(grade => 
      `${grade.percentageScore}% (${grade.pointsEarned}/${grade.pointsPossible} points)`
    ).join(', ') : 'No grades yet for this term'}`;
}).join('\n')}
  const completedCount = categoryGrades.filter(grade => 
    grade.score !== null && grade.score !== undefined && grade.score > 0
  ).length;
  const totalCount = categoryGrades.length;
  const averageGrade = categoryGrades.length > 0 ? 
    (categoryGrades.filter(grade => grade.score !== null && grade.score !== undefined && grade.score > 0)
     .reduce((sum, grade) => sum + (grade.percentage || 0), 0) / completedCount).toFixed(1) : 
    'No assessments yet';
  
  // Determine priority based on completion status and performance
  let priorityNote = '';
  if (totalCount === 0) {
    priorityNote = '⚠️  HIGH PRIORITY: Empty category - add assessments immediately! This has high impact on your GPA and needs focus to get perfect scores.';
  } else if (completedCount === totalCount) {
    // All assessments completed
    if (parseFloat(averageGrade) >= 80) {
      // Even with good performance, if there's only 1 assessment, suggest adding more for GPA improvement
      if (totalCount === 1) {
        priorityNote = '🟡 MEDIUM PRIORITY: Good performance (' + averageGrade + '% average) but consider adding more assessments to improve GPA';
      } else {
        priorityNote = '✅ LOW PRIORITY: All assessments completed with good performance (' + averageGrade + '% average)';
      }
    } else if (parseFloat(averageGrade) < 70) {
      priorityNote = '🔴 HIGH PRIORITY: All assessments completed but performance needs improvement (' + averageGrade + '% average)';
    } else {
      priorityNote = '🟡 MEDIUM PRIORITY: All assessments completed, room for improvement (' + averageGrade + '% average)';
    }
  } else {
    // Some assessments remaining - always MEDIUM priority
    priorityNote = '🟠 MEDIUM PRIORITY: Some assessments remaining - focus on upcoming ones to maintain/improve performance';
  }
  
  return '- ' + cat.categoryName + ': ' + cat.weight + '% weight\n' +
    '  Current Average: ' + averageGrade + '%\n' +
    '  Completed: ' + completedCount + '/' + totalCount + '\n' +
    '  Status: ' + (totalCount === 0 ? 'EMPTY CATEGORY - NO ASSESSMENTS ADDED' : 
           completedCount === totalCount ? 'ALL COMPLETED' : 'IN PROGRESS') + '\n' +
    '  ' + priorityNote + '\n';
}).join('')}

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

EMPTY CATEGORIES (CRITICAL FOR ANALYSIS):
${(() => {
  const emptyCategories = categories.filter(cat => {
    const categoryGrades = grades[cat.id] || [];
    return categoryGrades.length === 0;
  });
  
  if (emptyCategories.length > 0) {
    return emptyCategories.map(cat => `
- ${cat.categoryName}: ${cat.weight}% weight - NO ASSESSMENTS ADDED YET
  ⚠️  CRITICAL: This category represents ${cat.weight}% of the final grade but has no assessments!
  📋 RECOMMENDATION NEEDED: Provide specific guidance on:
     • How many assessments should be added to this category
     • What types of assessments are recommended (homework, quizzes, projects, etc.)
     • Target scores needed when assessments are added
     • Timeline for adding assessments
     • Impact on final grade calculation
`).join('');
  }
  return 'No empty categories - all categories have assessments';
})()}

TARGET GOAL:
- Target: ${targetValue} (${goalType})
- Priority Level: ${priorityLevel}
- Note: ${goalType === 'COURSE_GRADE' ? 'Target is a percentage grade (0-100%)' : 'Target is in GPA format (0.0-4.0 scale)'}

ANALYSIS REQUIREMENTS:
1. **PREDICTED FINAL GRADE**: Calculate the likely final grade based on current ${activeSemesterTerm} scores + remaining assessments
   - Focus on the CURRENT TERM (${activeSemesterTerm}) performance and predictions
   - Consider the current semester term context (${activeSemesterTerm === 'MIDTERM' ? 'Currently in Midterm Period' : 'Currently in Final Term Period'})
2. **ASSESSMENT GRADE RECOMMENDATIONS**: Specific score recommendations for each upcoming assessment in the ${activeSemesterTerm}
   - Focus on ${activeSemesterTerm} assessment recommendations only
   - Consider the academic calendar timing and preparation time available for the current term
3. **TARGET GOAL ANALYSIS**: Provide analysis of the target goal achievability:
   - Calculate the current weighted grade % for the ${activeSemesterTerm} period
   - Simulate perfect scores on all remaining ${activeSemesterTerm} assessments → compute maximum possible final grade % and GPA
   - Compare maximum possible vs target and provide analysis
   - Show clearly the minimum score required on each pending ${activeSemesterTerm} assessment to still reach the target
   - Use GPA-to-percentage mapping rules when target is GPA (e.g., "≥97% = 4.0")
   - Consider ${activeSemesterTerm} performance as the primary focus
4. **STATUS UPDATE**: Current academic status and progress summary for ${activeSemesterTerm}
   - Include ${activeSemesterTerm} completion status and its impact on planning
   - Provide ${activeSemesterTerm}-specific insights and recommendations
5. **FOCUS INDICATORS**: Identify which assessment categories need attention in the ${activeSemesterTerm} (e.g Assignments, Quizzes, Exams, Empty Categories)
   - Focus indicators for ${activeSemesterTerm} period only
   - Consider the academic calendar and timing of ${activeSemesterTerm} assessments
6. **SCORE PREDICTIONS**: Predict what scores are needed on upcoming ${activeSemesterTerm} assessments to reach the target
   - Provide ${activeSemesterTerm}-specific predictions only
   - Consider the learning curve and improvement potential for the current term
7. **EMPTY CATEGORIES ANALYSIS**: CRITICAL - If there are empty categories:
   - Explain that the course is NOT truly complete until all categories have assessments
   - Provide specific recommendations for each empty category
   - Calculate the impact of adding assessments to empty categories
   - Suggest appropriate assessment types and quantities for each semester term
   - Provide target scores needed for new assessments to maintain/achieve goals
   - Include empty categories in focusIndicators with HIGH priority
   - Add specific recommendations for each empty category in topPriorityRecommendations

CRITICAL DISTINCTION:
- **COMPLETED ASSESSMENTS**: Already graded - provide analysis of performance and areas for improvement
- **UPCOMING/PENDING ASSESSMENTS**: Not yet taken - provide PREPARATION strategies, study tips, and target scores
- **EMPTY CATEGORIES**: Categories with 0 assessments - HIGH PRIORITY for adding assessments
- DO NOT treat assessments marked as "UPCOMING - NOT YET TAKEN" as poor performance
- DO NOT assign HIGH priority to categories where all assessments are already completed
- For upcoming assessments, focus on preparation recommendations, not remediation

PRIORITY ASSIGNMENT RULES FOR COMPLETED ASSESSMENTS:
- **LOW PRIORITY**: Average score 80% or higher (e.g., 80%, 85%, 90%, 95%, 100%)
- **MEDIUM PRIORITY**: Average score 70-79% (e.g., 70%, 75%, 78%)
- **HIGH PRIORITY**: Average score below 70% (e.g., 60%, 65%, 68%)

EXAMPLES:
- Exam with 80% average = LOW PRIORITY (good performance)
- Quiz with 75% average = MEDIUM PRIORITY (room for improvement)
- Assignment with 65% average = HIGH PRIORITY (needs improvement)

7. **TOP PRIORITY RECOMMENDATIONS**: Provide exactly 5 most important recommendations with:
   - Mix of course-specific and general academic advice
   - Priority-based ordering (HIGH, MEDIUM, LOW)
   - Quick action buttons where applicable (e.g., "Add Study Session", "Review Notes", "Practice Problems")
   - Specific, actionable steps the student can take immediately
   - FOR UPCOMING ASSESSMENTS: Focus on preparation strategies (study plans, review materials, practice)
   - FOR COMPLETED ASSESSMENTS: Focus on improvement strategies based on actual performance
   - FOR EMPTY CATEGORIES: Provide specific guidance on adding assessments (types, quantities, target scores)
   - Clearly distinguish between "prepare for upcoming exam" vs "improve assignment quality" vs "add assessments to empty category"


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
    "exams": {"needsAttention": true/false, "reason": "explanation", "priority": "HIGH/MEDIUM/LOW"},
    "emptyCategories": [
      {
        "categoryName": "category name",
        "weight": "X%",
        "needsAttention": true,
        "reason": "This category has no assessments but represents X% of final grade",
        "priority": "HIGH/MEDIUM/LOW",
        "recommendations": [
          "Add X assessments to this category",
          "Target scores: X%+ on each assessment",
          "Timeline: Add within X weeks"
        ]
      }
    ]
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
      "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC/EMPTY_CATEGORY",
      "actionButton": {
        "text": "Quick action text",
        "action": "ACTION_TYPE",
        "enabled": true
      },
      "impact": "Expected impact on grade/performance"
    },
    {
      "title": "Add Assessments to [Category Name]",
      "description": "This category represents X% of your final grade but currently has no assessments. Add X assessments with target scores of X%+ to maintain your academic goals.",
      "priority": "HIGH/MEDIUM/LOW",
      "category": "EMPTY_CATEGORY",
      "actionButton": {
        "text": "Add Assessment",
        "action": "ADD_ASSESSMENT",
        "enabled": true
      },
      "impact": "Will complete course structure and allow accurate grade calculation"
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

  // Return shorter version if requested
  if (isShorter) {
    return `Course: ${course?.courseName || 'Unknown'} | Grade: ${currentGrade || 0}% | Target: ${targetValue}

${categories.map(cat => {
  const categoryGrades = grades[cat.id] || [];
  const avgScore = categoryGrades.length > 0 ? 
    (categoryGrades.reduce((sum, grade) => sum + (grade.percentageScore || 0), 0) / categoryGrades.length).toFixed(1) : 
    '0';
  
  return `${cat.categoryName || cat.name}: ${avgScore}%`;
}).join('\n')}

JSON:
{
  "predictedFinalGrade": {"percentage": "X%", "confidence": "HIGH/MEDIUM/LOW", "explanation": "brief"},
  "targetGoalAnalysis": {"achievable": true/false, "analysis": "brief", "confidence": "HIGH/MEDIUM/LOW"},
  "statusUpdate": {"currentStatus": "ON_TRACK/AT_RISK/EXCELLING", "progressSummary": "brief"},
  "topPriorityRecommendations": [
    {"title": "title", "description": "brief", "priority": "HIGH/MEDIUM/LOW", "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC"},
    {"title": "title", "description": "brief", "priority": "HIGH/MEDIUM/LOW", "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC"},
    {"title": "title", "description": "brief", "priority": "HIGH/MEDIUM/LOW", "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC"}
  ]
}`;
  }

  return prompt;
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
  console.log('🔍 [parseRealAIResponse] Raw AI response:', aiResponse);
  
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    console.log('🔍 [parseRealAIResponse] JSON match found:', !!jsonMatch);
    
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      console.log('🔍 [parseRealAIResponse] Extracted JSON string:', jsonStr.substring(0, 200) + '...');
      
      // Try to fix common JSON issues before parsing
      let fixedJsonStr = jsonStr;
      
      // Fix trailing commas in arrays and objects
      fixedJsonStr = fixedJsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix missing quotes around keys
      fixedJsonStr = fixedJsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      
      // Fix single quotes to double quotes
      fixedJsonStr = fixedJsonStr.replace(/'/g, '"');
      
      // Fix control characters and quotes in JSON strings
      try {
        // First, try to parse as-is to see if it works
        JSON.parse(fixedJsonStr);
      } catch (parseError) {
        console.log('🔧 [parseRealAIResponse] Detected JSON issues, attempting to fix...');
        console.log('🔧 [parseRealAIResponse] Parse error:', parseError.message);
        
        // Fix control characters (newlines, tabs, etc.) in string values
        fixedJsonStr = fixedJsonStr.replace(/"([^"]*[\r\n\t][^"]*)"/g, (match, content) => {
          // Escape control characters
          const escapedContent = content
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/\f/g, '\\f')
            .replace(/\b/g, '\\b');
          return `"${escapedContent}"`;
        });
        
        // Fix unescaped quotes in string values
        // Pattern: "text with "quotes" inside"
        fixedJsonStr = fixedJsonStr.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, (match, p1, p2, p3) => {
          // Escape quotes in the middle part
          const escapedMiddle = p2.replace(/"/g, '\\"');
          return `"${p1}${escapedMiddle}${p3}"`;
        });
        
        // Pattern: "text with "quotes" at end"
        fixedJsonStr = fixedJsonStr.replace(/"([^"]*)"([^"]*)":/g, (match, p1, p2) => {
          // Escape quotes in the second part
          const escapedSecond = p2.replace(/"/g, '\\"');
          return `"${p1}${escapedSecond}":`;
        });
      }
      
      // Fix truncated JSON by completing incomplete structures
      // Check if JSON ends abruptly and try to complete it
      if (!fixedJsonStr.trim().endsWith('}')) {
        console.log('🔧 [parseRealAIResponse] Detected truncated JSON, attempting to complete...');
        
        // Count opening and closing braces to see what's missing
        const openBraces = (fixedJsonStr.match(/\{/g) || []).length;
        const closeBraces = (fixedJsonStr.match(/\}/g) || []).length;
        const openBrackets = (fixedJsonStr.match(/\[/g) || []).length;
        const closeBrackets = (fixedJsonStr.match(/\]/g) || []).length;
        
        // Complete missing closing braces/brackets
        let completion = '';
        for (let i = 0; i < (openBraces - closeBraces); i++) {
          completion += '}';
        }
        for (let i = 0; i < (openBrackets - closeBrackets); i++) {
          completion += ']';
        }
        
        // If the last field is incomplete, try to complete it
        if (fixedJsonStr.includes('"schedule": "') && !fixedJsonStr.includes('"schedule": "', fixedJsonStr.lastIndexOf('"schedule": "'))) {
          // Find the last incomplete schedule field and complete it
          const lastScheduleIndex = fixedJsonStr.lastIndexOf('"schedule": "');
          if (lastScheduleIndex !== -1) {
            const beforeSchedule = fixedJsonStr.substring(0, lastScheduleIndex);
            const afterSchedule = fixedJsonStr.substring(lastScheduleIndex);
            const scheduleMatch = afterSchedule.match(/"schedule": "([^"]*)/);
            if (scheduleMatch) {
              const incompleteSchedule = scheduleMatch[1];
              // Complete the schedule field with a reasonable default
              const completedSchedule = incompleteSchedule + 'Focus on current term assessments and maintain good performance.';
              fixedJsonStr = beforeSchedule + afterSchedule.replace(
                /"schedule": "[^"]*/, 
                `"schedule": "${completedSchedule}"`
              );
            }
          }
        }
        
        fixedJsonStr += completion;
        console.log('🔧 [parseRealAIResponse] Completed truncated JSON');
      }
      
      console.log('🔧 [parseRealAIResponse] Attempting to fix JSON...');
      
      const parsed = JSON.parse(fixedJsonStr);
      console.log('✅ [parseRealAIResponse] Successfully parsed AI response after fixes');
      return parsed;
    } else {
      console.warn('❌ [parseRealAIResponse] No JSON found in AI response, using fallback parsing');
    }
  } catch (error) {
    console.warn('❌ [parseRealAIResponse] Failed to parse AI response as JSON:', error);
    console.warn('Using fallback parsing');
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

  // Analyze categories to determine proper focus indicators
  const focusIndicators = {};
  const emptyCategories = [];
  
  if (courseData.categories && Array.isArray(courseData.categories)) {
    courseData.categories.forEach(category => {
      const categoryName = (category.categoryName || category.name).toLowerCase();
      const categoryGrades = courseData.grades[category.id] || [];
      const hasGrades = categoryGrades.length > 0;
      const completedGrades = categoryGrades.filter(grade => 
        grade.score !== null && grade.score !== undefined && grade.score > 0
      );
      
      // Calculate percentage for each completed grade if not available
      const completedGradesWithPercentage = completedGrades.map(grade => {
        let percentage = grade.percentage;
        if (!percentage && grade.score !== undefined && grade.maxScore !== undefined) {
          percentage = (grade.score / grade.maxScore) * 100;
        }
        return { ...grade, calculatedPercentage: percentage || 0 };
      });
      
      const averageGrade = completedGradesWithPercentage.length > 0 ? 
        completedGradesWithPercentage.reduce((sum, grade) => sum + (grade.calculatedPercentage || 0), 0) / completedGradesWithPercentage.length : 0;
      
      console.log(`🔍 [Fallback Parsing] Category: ${categoryName}`, {
        hasGrades,
        categoryGrades: categoryGrades.length,
        completedGrades: completedGrades.length,
        averageGrade: averageGrade.toFixed(1),
        grades: categoryGrades.map(g => ({ 
          name: g.assessmentName, 
          percentage: g.percentage, 
          score: g.score,
          maxScore: g.maxScore,
          isCompleted: g.score !== null && g.score !== undefined && g.score > 0
        })),
        completedGradesDetails: completedGradesWithPercentage.map(g => ({ 
          name: g.assessmentName, 
          percentage: g.percentage, 
          calculatedPercentage: g.calculatedPercentage,
          score: g.score,
          maxScore: g.maxScore
        }))
      });
      
      if (!hasGrades) {
        // Empty category - should be HIGH priority
        emptyCategories.push({
          categoryName: category.categoryName || category.name,
          weight: `${category.weight}%`,
          needsAttention: true,
          reason: `This category has no assessments but represents ${category.weight}% of final grade and needs attention when assessments are added because it has high impact on your GPA and needs focus to get perfect scores.`,
          priority: "HIGH",
          recommendations: [
            `Add ${Math.max(2, Math.ceil(category.weight / 20))} assessments to this category`,
            `Target scores: 85%+ on each assessment`,
            `Timeline: Add within 2 weeks`
          ]
        });
      } else {
        // Category with assessments - analyze performance and completion status
        const totalCount = categoryGrades.length;
        const completedCount = categoryGrades.filter(grade => 
          grade.score !== null && grade.score !== undefined && grade.score > 0
        ).length;
        
        let needsAttention = false;
        let reason = "";
        let priority = "LOW";
        
        if (completedCount < totalCount) {
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
          // Good performance (≥80%) - check if only 1 assessment
          if (totalCount === 1) {
            needsAttention = true;
            reason = `Good performance in ${categoryName} (${averageGrade.toFixed(1)}%) but consider adding more assessments to improve GPA.`;
            priority = "MEDIUM";
          } else {
            needsAttention = false;
            reason = `Good performance in ${categoryName} (${averageGrade.toFixed(1)}%). Keep it up!`;
            priority = "LOW";
          }
        }
        
        console.log(`🔍 [Fallback Parsing] Priority Assignment for ${categoryName}:`, {
          averageGrade: averageGrade.toFixed(1),
          completedCount,
          totalCount,
          needsAttention,
          priority,
          reason
        });
        
        focusIndicators[categoryName] = { needsAttention, reason, priority };
      }
    });
  }

  return {
    focusIndicators: {
      ...focusIndicators,
      emptyCategories: emptyCategories
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

