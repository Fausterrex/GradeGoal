// ========================================
// AI RESPONSE UTILITIES
// ========================================
// Utility functions for AI response parsing, processing, and prompt building

import { calculateCurrentGrade, calculateGPAFromPercentage } from "./achievementProbabilityUtils.js";
import { 
  analyzePerformancePatterns, 
  generateRealisticPredictions
} from "./performanceAnalysisUtils.js";
/**
 * Build comprehensive prompt for real AI analysis
 */
export const buildRealAnalysisPrompt = (courseData, goalData, priorityLevel, isShorter = false) => {
  const { course, grades, categories, currentGPA, progress, activeSemesterTerm } = courseData;
  const { targetValue, goalType } = goalData;

  // Calculate current performance metrics
  const currentGrade = calculateCurrentGrade(grades, categories);
  const remainingWeight = calculateRemainingWeight(categories);
  const targetGrade = parseFloat(targetValue);

  // Return shorter version if requested
  if (isShorter) {
    return `Course: ${course?.courseName || 'Unknown'} | Current GPA: ${currentGPA} | Target: ${targetValue} | Term: ${activeSemesterTerm}

Categories: ${categories.map(cat => {
  const categoryGrades = grades[cat.id] || [];
  const avgScore = categoryGrades.length > 0 ? 
    (categoryGrades.reduce((sum, grade) => sum + (grade.percentageScore || 0), 0) / categoryGrades.length).toFixed(1) : 
    '0';
  return `${cat.categoryName || cat.name}: ${avgScore}%`;
}).join(', ')}

Empty categories: ${categories.filter(cat => (grades[cat.id] || []).length === 0).map(cat => cat.categoryName || cat.name).join(', ') || 'None'}

Provide JSON analysis:
{
  "predictedFinalGrade": {"percentage": "X%", "gpa": "X.X", "confidence": "HIGH/MEDIUM/LOW", "explanation": "brief"},
  "targetGoalAnalysis": {"achievable": true/false, "analysis": "brief", "confidence": "HIGH/MEDIUM/LOW"},
  "statusUpdate": {"currentStatus": "ON_TRACK/AT_RISK/EXCELLING", "progressSummary": "brief"},
  "focusIndicators": {
    "assignments": {"needsAttention": true/false, "reason": "brief", "priority": "HIGH/MEDIUM/LOW"},
    "quizzes": {"needsAttention": true/false, "reason": "brief", "priority": "HIGH/MEDIUM/LOW"},
    "exams": {"needsAttention": true/false, "reason": "brief", "priority": "HIGH/MEDIUM/LOW"},
    "emptyCategories": []
  },
  "topPriorityRecommendations": [
    {"title": "title", "description": "brief", "priority": "HIGH/MEDIUM/LOW", "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC"},
    {"title": "title", "description": "brief", "priority": "HIGH/MEDIUM/LOW", "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC"},
    {"title": "title", "description": "brief", "priority": "HIGH/MEDIUM/LOW", "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC"},
    {"title": "title", "description": "brief", "priority": "HIGH/MEDIUM/LOW", "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC"}
  ]
}`;
  }

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
      `${grade.percentageScore}% (${grade.pointsEarned}/${grade.pointsPossible} points, maxScore: ${grade.maxScore || grade.pointsPossible})`
    ).join(', ') : 'No grades yet for this term'}`;
}).join('\n')}

TARGET GOAL:
- Target: ${targetValue} (${goalType})
- Priority Level: ${priorityLevel}
- Note: ${goalType === 'COURSE_GRADE' ? 'Target is a percentage grade (0-100%)' : 'Target is in GPA format (0.0-4.0 scale)'}

ANALYSIS REQUIREMENTS:
1. **ACCURATE SUCCESS PROBABILITY**: Calculate realistic success probability considering:
   - Current ${activeSemesterTerm} performance and remaining potential
   - Empty categories for future assessments (if midterm is done, focus on final term potential)
   - Best possible GPA should be realistic (max 4.0) and consider actual improvement potential
   - If midterm is completed, factor in final term improvement potential (typically 0.5-1.0 GPA points max)

2. **TERM-SPECIFIC CATEGORY INDICATORS**: Provide DIFFERENT indicators for midterm vs final term:
   - MIDTERM indicators: Based on current midterm performance and completion status
   - FINAL TERM indicators: Prioritize empty categories and upcoming assessments
   - If midterm is marked as done, final term indicators should focus on future potential
   - Each term should have distinct, contextually appropriate indicators

3. **GRADE PREDICTIONS FOR UPCOMING ASSESSMENTS**: 
   - Base predictions on user's actual performance patterns and consistency
   - If user has consistently achieved perfect scores, maintain that expectation
   - Consider learning curve, improvement trends, and realistic performance patterns
   - Provide predictions that reflect the user's demonstrated performance level

4. **TARGET GOAL ANALYSIS**: Provide analysis of the target goal achievability:
   - Calculate current weighted grade % for the ${activeSemesterTerm} period
   - Simulate scenarios based on user's demonstrated performance patterns
   - If user consistently achieves perfect scores, factor that into achievability calculations
   - Show minimum scores needed on remaining assessments based on actual performance trends
   - Use GPA-to-percentage mapping rules when target is GPA (e.g., "≥97% = 4.0")
   - Consider ${activeSemesterTerm} performance as the primary focus

5. **STATUS UPDATE**: Current academic status and progress summary for ${activeSemesterTerm}
   - Include ${activeSemesterTerm} completion status and its impact on planning
   - Provide ${activeSemesterTerm}-specific insights and recommendations

6. **FOCUS INDICATORS**: Identify which assessment categories need attention based on ACTUAL USER PERFORMANCE:
   - Analyze each category: ${categories.map(cat => cat.categoryName || cat.name).join(', ')}
   - Focus on categories where user performance is below target or inconsistent
   - Identify categories that need immediate attention vs those performing well
   - Provide category-specific insights based on actual performance patterns
   - MIDTERM: Focus on current performance and completion status
   - FINAL TERM: Focus on empty categories and upcoming assessments
   - Provide term-specific, contextually appropriate indicators

7. **TOP PRIORITY RECOMMENDATIONS**: Provide exactly 4 most important recommendations based on ACTUAL PERFORMANCE ANALYSIS:
   - Analyze user's performance patterns across all categories: ${categories.map(cat => cat.categoryName || cat.name).join(', ')}
   - PRIORITIZE recommendations based on actual performance gaps and improvement opportunities
   - Focus on categories where user needs immediate attention or can improve significantly
   - Mix of course-specific and general academic advice
   - Priority-based ordering (HIGH, MEDIUM, LOW)
   - Specific, actionable steps the student can take immediately
   - FOR UPCOMING ASSESSMENTS: Focus on preparation strategies (study plans, review materials, practice)
   - FOR COMPLETED ASSESSMENTS: Focus on improvement strategies based on actual performance
   - FOR CONSISTENT PERFECT PERFORMERS: Include recommendations to maintain consistency and excellence
   - If user consistently achieves perfect scores, recommend strategies to maintain that level of performance
   - DO NOT recommend adding assessments - students cannot control what assessments professors assign
   - Focus only on improving performance on existing and upcoming assessments
   - Clearly distinguish between "prepare for upcoming exam" vs "improve assignment quality"
   - DO NOT provide recommendations for non-existent upcoming assessments
   - NO ACTION BUTTONS: Do not include actionButton fields in recommendations
   - PERFORMANCE-BASED RECOMMENDATIONS: Base recommendations on actual performance data:
     * If user has perfect scores (100%) in all completed assessments, focus on maintaining excellence
     * If user has inconsistent performance, focus on specific weak areas
     * If user has upcoming assessments, provide specific preparation strategies
     * If user is already exceeding targets, provide advanced strategies for continued excellence
     * Avoid generic study advice - provide specific, data-driven recommendations
     * Consider the user's actual performance patterns, not theoretical scenarios
   - ACTIONABLE RECOMMENDATIONS REQUIREMENTS:
     * Provide specific steps: "Spend 2 hours daily reviewing [specific topic]" not "review key concepts"
     * Include timeframes: "Study for 30 minutes before each quiz" not "practice regularly"
     * Mention specific resources: "Use textbook Chapter 5 exercises" not "review materials"
     * Give concrete actions: "Create flashcards for formulas" not "memorize important information"
     * Include measurable goals: "Aim for 90% on next assignment" not "improve performance"
     * Provide study techniques: "Use Pomodoro technique for 25-minute study sessions" not "study effectively"
   - CRITICAL: ONLY recommend for categories that have upcoming/pending assessments (no grade yet)
   - DO NOT recommend for categories where all assessments are completed
   - Check the assessment data: only provide recommendations for categories with assessments that have no score or are marked as upcoming

IMPORTANT: 
- Current GPA: ${currentGPA} (0.0-4.0 scale)
- Current Course Grade: ${currentGrade}% (0-100% scale)
- Target: ${targetValue} (${goalType === 'COURSE_GRADE' ? 'percentage grade 0-100%' : 'GPA scale 0.0-4.0'})
- Provide analysis based on user's demonstrated performance patterns and consistency
- If user consistently achieves perfect scores, factor that into success probability calculations
- If target is percentage (0-100%), compare with current course percentage (${currentGrade}%), not GPA
- Always base analysis on WEIGHTED PERCENTAGES of assessments (not just unweighted averages).
- When goalType is GPA, always map the final percentage to GPA using the provided rule (e.g., "97% and above = 4.0").
- Provide clear analysis of achievability with specific reasoning
- For consistent perfect performers, success probability should reflect their demonstrated excellence

RESPONSE FORMAT (JSON - MUST BE VALID JSON):
{
  "predictedFinalGrade": {
    "percentage": "X%",
    "gpa": "X.X",
    "confidence": "HIGH",
    "explanation": "Brief explanation"
  },
  "assessmentGradeRecommendations": {
    ${categories.map(cat => `"${cat.categoryName || cat.name}": {"recommendedScore": "X%", "reasoning": "explanation", "priority": "HIGH/MEDIUM/LOW"}`).join(',\n    ')}
  },
  "targetGoalAnalysis": {
    "achievable": true/false,
    "analysis": "Detailed analysis of target goal achievability",
    "factors": ["weighted grade calculations", "remaining assessment weights", "max achievable grade vs target"],
    "confidence": "HIGH/MEDIUM/LOW",
    "explanation": "Step-by-step showing weighted grade math, minimum scores required, and achievability analysis"
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
    ${categories.map(cat => `"${cat.categoryName || cat.name}": {"needsAttention": true/false, "reason": "explanation", "priority": "HIGH/MEDIUM/LOW"}`).join(',\n    ')}
  },
  "scorePredictions": {
    ${categories.map(cat => `"${cat.categoryName || cat.name}": {"neededScore": "X%", "confidence": "HIGH/MEDIUM/LOW"}`).join(',\n    ')}
  },
  "topPriorityRecommendations": [
    {
      "title": "Specific recommendation title",
      "description": "Detailed explanation of the recommendation",
      "priority": "HIGH/MEDIUM/LOW",
      "category": "COURSE_SPECIFIC/GENERAL_ACADEMIC",
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

EXAMPLES OF GOOD ACTIONABLE RECOMMENDATIONS:
- "Spend 45 minutes daily reviewing Database normalization concepts using Chapter 8 exercises"
- "Create flashcards for SQL query syntax and practice 20 minutes before each quiz"
- "Schedule 2-hour study sessions on weekends focusing on weak areas identified in Assignment 3"
- "Use Pomodoro technique: 25 minutes study, 5 minutes break, repeat 4 times daily"
- "Aim for 85% on next quiz by practicing past quiz questions for 30 minutes daily"
- "Join study group meetings every Tuesday and Thursday from 7-8 PM"

EXAMPLES OF BAD GENERIC RECOMMENDATIONS (DO NOT USE):
- "Focus on reviewing and practicing key concepts" (too vague)
- "Study more effectively" (no specific actions)
- "Improve your performance" (no measurable steps)
- "Review course materials" (no timeframe or specific resources)
- "Practice regularly" (no concrete actions)

EXAMPLES FOR PERFECT PERFORMERS (100% in all completed assessments):
- "Maintain your 100% streak by continuing your current 2-hour daily study routine"
- "Prepare for upcoming Quiz 6 by reviewing Chapters 9-10 for 45 minutes daily"
- "Consider tutoring classmates in Database concepts to reinforce your mastery"
- "Set goal to complete extra credit assignment by [specific date]"

EXAMPLES FOR IMPROVEMENT OPPORTUNITIES:
- "Focus on SQL JOIN operations where you scored 70% - practice 30 minutes daily using textbook exercises"
- "Improve Assignment performance by spending 1 hour daily on weak topics identified in feedback"

CRITICAL RECOMMENDATION FILTERING RULES:
- BEFORE generating ANY recommendation, check if the category has upcoming/pending assessments
- If a category has NO upcoming assessments (all assessments completed), DO NOT generate recommendations for it
- Only generate recommendations for categories that have assessments with no score or marked as upcoming
- Example: If "Exam" category has all assessments completed, DO NOT recommend "Improve Exam Performance"
- Example: If "Laboratory Activity" has upcoming assessments, DO recommend "Enhance Laboratory Activity Performance"

MANDATORY FILTERING PROCESS:
1. For each category in the assessment data, check if there are any assessments with:
   - score === null OR score === undefined OR score === 0
   - status === 'PENDING' OR status === 'UPCOMING' OR status === null
2. If NO such assessments exist in a category, that category should get NO recommendations
3. If such assessments exist in a category, that category can get recommendations
4. NEVER generate recommendations for categories where all assessments have scores > 0

EXAMPLES OF WHAT NOT TO RECOMMEND:
- DO NOT recommend "Focus on achieving at least 90% in the final Exam" if there are NO upcoming exams
- DO NOT recommend for categories where all assessments are completed
- DO NOT recommend for categories with no pending/upcoming assessments
- ONLY recommend for categories that actually have assessments without grades or marked as upcoming

SPECIFIC EXAMPLE FOR CURRENT CASE:
- If "Exam" category has assessments: [Exam 3: 25/25, Exam 4: 25/25] (all completed with scores)
- And "Laboratory Activity" category has assessments: [Lab 4: 25/25, Lab 5: no score yet]
- Then: DO NOT recommend "Improve Exam Performance" (all exams completed)
- Then: DO recommend "Enhance Laboratory Activity Performance" (Lab 5 has no score)

CRITICAL JSON FORMATTING REQUIREMENTS:
1. Your response MUST be ONLY valid JSON - no markdown, no explanations, no code blocks
2. Start with { and end with } - no extra text before or after
3. Ensure all strings are properly quoted and escaped
4. No trailing commas in arrays or objects
5. All property names must be in double quotes
6. Do not include \`\`\`json or \`\`\` markers

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
 * Parse real AI response into structured data
 */
export const parseRealAIResponse = (aiResponse, courseData, goalData) => {
  try {
    // Try to extract JSON from the response - handle markdown code blocks
    let jsonStr = aiResponse;
    
    // Remove markdown code blocks if present
    if (jsonStr.includes('```json')) {
      const codeBlockMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
        }
    } else {
      // Fallback to regex extraction
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonStr = jsonMatch[0];
        }
    }
    
    // Check if we have valid JSON structure
    if (!jsonStr.startsWith('{') || !jsonStr.includes('"predictedFinalGrade"')) {
      return getFallbackRecommendations(courseData, goalData);
    }
      
      // Try to fix common JSON issues before parsing
      let fixedJsonStr = jsonStr;
      
    try {
      // Fix trailing commas in arrays and objects
      fixedJsonStr = fixedJsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix missing quotes around keys
      fixedJsonStr = fixedJsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      
      // Fix single quotes to double quotes (but be careful with apostrophes in text)
      // Only replace single quotes that are used as string delimiters, not apostrophes in text
      fixedJsonStr = fixedJsonStr.replace(/([{,]\s*)'([^']*)':/g, '$1"$2":');
      
      // Fix control characters and quotes in JSON strings
      try {
        // First, try to parse as-is to see if it works
        JSON.parse(fixedJsonStr);
      } catch (parseError) {
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
        
        // Fix unescaped quotes in string values - more comprehensive approach
        // This is the main issue causing JSON parsing failures
        fixedJsonStr = fixedJsonStr.replace(/"([^"]*(?:"[^"]*)*)"/g, (match, content) => {
          // If the content has unescaped quotes, fix them
          if (content.includes('"') && !content.includes('\\"')) {
            // Escape unescaped quotes
            content = content.replace(/"/g, '\\"');
          }
          return `"${content}"`;
        });
      }
      
      // Fix truncated JSON by completing incomplete structures
      // Check if JSON ends abruptly and try to complete it
      if (!fixedJsonStr.trim().endsWith('}')) {
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
        
        fixedJsonStr += completion;
        }
      
      const parsed = JSON.parse(fixedJsonStr);
      return parsed;
    } catch (error) {
      // Try to extract just the essential parts using regex
      try {
        // Extract key sections using regex patterns
        const predictedFinalGradeMatch = jsonStr.match(/"predictedFinalGrade":\s*\{[^}]*\}/);
        const recommendationsMatch = jsonStr.match(/"topPriorityRecommendations":\s*\[[^\]]*\]/);
        const focusIndicatorsMatch = jsonStr.match(/"focusIndicators":\s*\{[^}]*\}/);
        
        if (predictedFinalGradeMatch && recommendationsMatch) {
          // Build a minimal valid JSON with just the essential parts
          const minimalJson = `{
            "predictedFinalGrade": ${predictedFinalGradeMatch[0].split(':')[1]},
            "topPriorityRecommendations": ${recommendationsMatch[0].split(':')[1]},
            "focusIndicators": ${focusIndicatorsMatch ? focusIndicatorsMatch[0].split(':')[1] : '{}'}
          }`;
          
          const parsedResponse = JSON.parse(minimalJson);
          return parsedResponse;
        }
      } catch (minimalError) {
        }
      
      console.warn('Using fallback parsing');
    }
  } catch (error) {
    console.warn('Using fallback parsing');
  }

  // Generate intelligent fallback recommendations with realistic predictions
  const currentGrade = calculateCurrentGrade(courseData.grades, courseData.categories);
  const currentGPA = parseFloat(courseData.currentGPA) || 0;
  
  let targetGPA;
  if (goalData.goalType === 'COURSE_GRADE') {
    const targetPercentage = parseFloat(goalData.targetValue) || 100;
    targetGPA = calculateGPAFromPercentage(targetPercentage);
  } else {
    targetGPA = parseFloat(goalData.targetValue) || 4.0;
  }
  
  // Analyze performance patterns for realistic predictions
  const patterns = analyzePerformancePatterns(courseData.grades, courseData.categories);
  const predictions = generateRealisticPredictions(patterns, courseData.categories, targetGPA, courseData);
  
  // Generate simple consistency recommendations based on performance
  const consistencyRecs = {
    priority: currentGPA >= targetGPA ? 'LOW' : 'MEDIUM',
    recommendations: currentGPA >= targetGPA ? [
      {
        title: 'Maintain Excellence',
        description: 'You\'ve achieved your target GPA! Continue your excellent performance.',
        action: 'Keep up the great work and consider setting higher goals.'
      }
    ] : [
      {
        title: 'Focus on Improvement',
        description: 'Continue working on areas that need improvement to reach your target GPA.',
        action: 'Focus on upcoming assessments and maintain consistent performance.'
      }
    ]
  };
  
  const gpaGap = targetGPA - currentGPA;
  const achievable = gpaGap <= 1.0;

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
      
      console.log({
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
        // Empty category - note it but don't recommend adding assessments
        // Students cannot control what assessments professors assign
        console.log(`Category ${category.categoryName || category.name} is empty - this is noted but no action recommended`);
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
        
        console.log({
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

  // Build realistic score predictions for empty categories
  const scorePredictions = {};
  const assessmentRecommendations = {};
  
  Object.keys(predictions.predictedScores).forEach(categoryId => {
    const categoryPredictions = predictions.predictedScores[categoryId];
    const categoryName = courseData.categories.find(cat => cat.id === categoryId)?.name || 'Unknown';
    
    scorePredictions[categoryName.toLowerCase()] = {
      predictedScores: categoryPredictions.map(pred => ({
        assessment: pred.assessmentName,
        predictedScore: `${pred.predictedScore}/${pred.predictedMaxScore}`,
        confidence: pred.confidence,
        reasoning: pred.reasoning
      })),
      averagePredictedScore: `${(categoryPredictions.reduce((sum, p) => sum + p.predictedScore, 0) / categoryPredictions.length).toFixed(1)}/${categoryPredictions[0]?.predictedMaxScore}`,
      confidence: predictions.confidence
    };
    
    assessmentRecommendations[categoryName.toLowerCase()] = {
      recommendedScore: `${Math.round(categoryPredictions.reduce((sum, p) => sum + p.predictedScore, 0) / categoryPredictions.length)}/${categoryPredictions[0]?.predictedMaxScore}`,
      reasoning: `Based on your ${patterns.overall.consistency.toLowerCase()} consistency performance, these are realistic predictions for upcoming ${categoryName.toLowerCase()}.`,
      priority: categoryPredictions.length > 0 ? "HIGH" : "MEDIUM"
    };
  });

  return {
    predictedFinalGrade: {
      percentage: `${(typeof currentGrade === 'number' ? currentGrade : parseFloat(currentGrade) || 0).toFixed(1)}%`,
      gpa: `${(typeof currentGPA === 'number' ? currentGPA : parseFloat(currentGPA) || 0).toFixed(2)}`,
      confidence: predictions.confidence,
      explanation: `Based on current performance patterns and realistic predictions for upcoming assessments`
    },
    assessmentGradeRecommendations: assessmentRecommendations,
    scorePredictions: scorePredictions,
    targetGoalAnalysis: {
      achievable: achievable,
      analysis: `Target goal ${achievable ? 'is achievable' : 'may be challenging'} based on current performance patterns`,
      factors: [
        `Current GPA: ${currentGPA}`,
        `Target GPA: ${targetGPA}`,
        `Gap: ${(typeof gpaGap === 'number' ? gpaGap : parseFloat(gpaGap) || 0).toFixed(2)}`,
        `Performance Consistency: ${patterns.overall.consistency}`,
        `Upcoming Assessments: ${predictions.upcomingAssessments.length}`
      ],
      confidence: predictions.confidence,
      explanation: `Analysis based on ${patterns.overall.totalAssessments} completed assessments and realistic predictions for ${predictions.upcomingAssessments.length} upcoming assessment categories.`
    },
    topPriorityRecommendations: [
      ...consistencyRecs.recommendations.map(rec => ({
        title: rec.title,
        description: rec.description,
        priority: consistencyRecs.priority,
        category: "PERFORMANCE_ANALYSIS",
        impact: rec.action
      })),
      ...(predictions.upcomingAssessments.length > 0 ? [{
        title: "Prepare for Upcoming Assessments",
        description: `You have ${predictions.upcomingAssessments.length} categories with upcoming assessments. Based on your performance patterns, realistic predictions have been generated.`,
        priority: "HIGH",
        category: "UPCOMING_ASSESSMENTS",
        impact: "Will help you prepare effectively for upcoming assessments"
      }] : [])
    ],
    studyStrategy: {
      focus: patterns.overall.consistency === 'HIGH' ? "Maintain consistency" : "Improve consistency",
      schedule: patterns.overall.trend === 'IMPROVING' ? "Continue current schedule" : "Increase study time",
      tips: [
        `Your ${patterns.overall.consistency.toLowerCase()} consistency is ${patterns.overall.consistency === 'HIGH' ? 'excellent' : 'good'}`,
        `Performance trend is ${patterns.overall.trend.toLowerCase()}`,
        "Focus on improving performance on upcoming assessments"
      ]
    },
    realisticPredictions: predictions
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
    
    // Filter recommendations for categories with no upcoming assessments
    if (parsed.topPriorityRecommendations && Array.isArray(parsed.topPriorityRecommendations)) {
      console.log('🔍 [RECOMMENDATION FILTER DEBUG] Filtering recommendations based on upcoming assessments');
      
      // Get categories with upcoming assessments
      const categoriesWithUpcoming = new Set();
      if (courseData.categories && Array.isArray(courseData.categories)) {
        courseData.categories.forEach(category => {
          const categoryGrades = courseData.grades[category.id] || [];
          const hasUpcoming = categoryGrades.some(grade => 
            grade.score === null || grade.score === undefined || grade.score === 0 ||
            grade.status === 'PENDING' || grade.status === 'UPCOMING' || grade.status === null
          );
          if (hasUpcoming) {
            categoriesWithUpcoming.add(category.categoryName || category.name);
          }
        });
      }
      
      console.log('🔍 [RECOMMENDATION FILTER DEBUG] Categories with upcoming assessments:', Array.from(categoriesWithUpcoming));
      
      // Filter recommendations
      const originalCount = parsed.topPriorityRecommendations.length;
      parsed.topPriorityRecommendations = parsed.topPriorityRecommendations.filter(rec => {
        const title = rec.title || '';
        const description = rec.description || '';
        
        // Check if recommendation is for a category with no upcoming assessments
        const isForExam = title.toLowerCase().includes('exam') || description.toLowerCase().includes('exam');
        const isForCategoryWithoutUpcoming = Array.from(categoriesWithUpcoming).some(categoryName => 
          title.toLowerCase().includes(categoryName.toLowerCase()) || 
          description.toLowerCase().includes(categoryName.toLowerCase())
        );
        
        // Keep general recommendations and recommendations for categories with upcoming assessments
        const shouldKeep = !isForExam || categoriesWithUpcoming.has('Exam') || isForCategoryWithoutUpcoming;
        
        if (!shouldKeep) {
          console.log('🚫 [RECOMMENDATION FILTER DEBUG] Filtering out recommendation:', rec.title);
        }
        
        return shouldKeep;
      });
      
      console.log('🔍 [RECOMMENDATION FILTER DEBUG] Filtered recommendations:', {
        originalCount,
        filteredCount: parsed.topPriorityRecommendations.length,
        removed: originalCount - parsed.topPriorityRecommendations.length
      });
    }
    
    // Post-process the AI response to fix probability calculations
    const { postProcessAIResponse } = await import('./achievementProbabilityUtils.js');
    const correctedParsed = postProcessAIResponse(parsed, courseData, goalData);
    
    // Check if the AI response is missing prediction data and generate it
    if (!correctedParsed.scorePredictions && !correctedParsed.realisticPredictions) {
      console.log('🔍 [PARSE DEBUG] AI response missing prediction data, generating fallback predictions');
      
      // Import utility functions for generating predictions
      const { 
        analyzePerformancePatterns, 
        generateRealisticPredictions, 
        generateConsistencyRecommendations 
      } = await import('./performanceAnalysisUtils.js');
      
      // Analyze performance patterns
      const patterns = analyzePerformancePatterns(courseData.grades, courseData.categories);
      
      // Generate realistic predictions
      const predictions = generateRealisticPredictions(patterns, courseData.categories, 
        goalData.goalType === 'COURSE_GRADE' ? 
          calculateGPAFromPercentage(parseFloat(goalData.targetValue) || 100) : 
          parseFloat(goalData.targetValue) || 4.0, 
        courseData
      );
      
      // Add the generated predictions to the response
      correctedParsed.realisticPredictions = predictions;
      correctedParsed.scorePredictions = predictions.predictedScores;
      
      console.log('🔍 [PARSE DEBUG] Generated fallback predictions:', {
        upcomingAssessments: predictions.upcomingAssessments.length,
        predictedScores: Object.keys(predictions.predictedScores).length,
        confidence: predictions.confidence
      });
    }
    
    return {
      courseId: courseData.course.id,
      userId: courseData.course.userId,
      recommendationType: 'AI_ANALYSIS',
      title: `AI Analysis for ${courseData.course.courseName}`,
      content: JSON.stringify(correctedParsed),
      priority: determinePriority(correctedParsed),
      aiGenerated: true,
      generatedAt: new Date().toISOString(),
      ...correctedParsed
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