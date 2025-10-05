// ========================================
// AI RESPONSE UTILITIES
// ========================================
// Utility functions for AI response parsing, processing, and prompt building

import { calculateCurrentGrade, calculateGPAFromPercentage } from './achievementProbabilityUtils.js';
import { 
  analyzePerformancePatterns, 
  generateRealisticPredictions, 
  generateConsistencyRecommendations 
} from './performanceAnalysisUtils.js';

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
      `${grade.percentageScore}% (${grade.pointsEarned}/${grade.pointsPossible} points)`
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
   - NOT best possible grade if user attains perfect score
   - AI prediction based on user's performance on previous assessments
   - Consider learning curve, improvement trends, and realistic performance patterns
   - Provide realistic predictions, not optimistic "perfect score" scenarios

4. **TARGET GOAL ANALYSIS**: Provide analysis of the target goal achievability:
   - Calculate current weighted grade % for the ${activeSemesterTerm} period
   - Simulate realistic improvement scenarios (not perfect scores)
   - Show minimum realistic scores needed on remaining assessments
   - Use GPA-to-percentage mapping rules when target is GPA (e.g., "≥97% = 4.0")
   - Consider ${activeSemesterTerm} performance as the primary focus

5. **STATUS UPDATE**: Current academic status and progress summary for ${activeSemesterTerm}
   - Include ${activeSemesterTerm} completion status and its impact on planning
   - Provide ${activeSemesterTerm}-specific insights and recommendations

6. **FOCUS INDICATORS**: Identify which assessment categories need attention:
   - MIDTERM: Focus on current performance and completion status
   - FINAL TERM: Focus on empty categories and upcoming assessments
   - Provide term-specific, contextually appropriate indicators

7. **TOP PRIORITY RECOMMENDATIONS**: Provide exactly 4 most important recommendations with:
   - Mix of course-specific and general academic advice
   - PRIORITIZE course-specific recommendations (if 2-3 course-specific exist, prioritize them)
   - Priority-based ordering (HIGH, MEDIUM, LOW)
   - Quick action buttons where applicable (e.g., "Add Study Session", "Review Notes", "Practice Problems")
   - Specific, actionable steps the student can take immediately
   - FOR UPCOMING ASSESSMENTS: Focus on preparation strategies (study plans, review materials, practice)
   - FOR COMPLETED ASSESSMENTS: Focus on improvement strategies based on actual performance
   - FOR EMPTY CATEGORIES: Provide specific guidance on adding assessments (types, quantities, target scores)
   - Clearly distinguish between "prepare for upcoming exam" vs "improve assignment quality" vs "add assessments to empty category"
   - DO NOT provide recommendations for non-existent upcoming assessments

IMPORTANT: 
- Current GPA: ${currentGPA} (0.0-4.0 scale)
- Current Course Grade: ${currentGrade}% (0-100% scale)
- Target: ${targetValue} (${goalType === 'COURSE_GRADE' ? 'percentage grade 0-100%' : 'GPA scale 0.0-4.0'})
- Provide analysis based on realistic improvement potential
- If target is percentage (0-100%), compare with current course percentage (${currentGrade}%), not GPA
- Always base analysis on WEIGHTED PERCENTAGES of assessments (not just unweighted averages).
- When goalType is GPA, always map the final percentage to GPA using the provided rule (e.g., "97% and above = 4.0").
- Provide clear analysis of achievability with specific reasoning

RESPONSE FORMAT (JSON - MUST BE VALID JSON):
{
  "predictedFinalGrade": {
    "percentage": "X%",
    "gpa": "X.X",
    "confidence": "HIGH",
    "explanation": "Brief explanation"
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
  console.log('🔍 [parseRealAIResponse] Raw AI response:', aiResponse);
  
  try {
    // Try to extract JSON from the response - handle markdown code blocks
    let jsonStr = aiResponse;
    
    // Remove markdown code blocks if present
    if (jsonStr.includes('```json')) {
      const codeBlockMatch = jsonStr.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
        console.log('🔍 [parseRealAIResponse] Extracted from markdown code block');
      }
    } else {
      // Fallback to regex extraction
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonStr = jsonMatch[0];
        console.log('🔍 [parseRealAIResponse] Extracted JSON via regex');
      }
    }
    
    console.log('🔍 [parseRealAIResponse] JSON string length:', jsonStr.length);
    console.log('🔍 [parseRealAIResponse] JSON preview:', jsonStr.substring(0, 200) + '...');
    
    // Check if we have valid JSON structure
    if (!jsonStr.startsWith('{') || !jsonStr.includes('"predictedFinalGrade"')) {
      console.warn('⚠️ [parseRealAIResponse] Invalid JSON structure, using fallback');
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
        
        fixedJsonStr += completion;
        console.log('🔧 [parseRealAIResponse] Completed truncated JSON');
      }
      
      console.log('🔧 [parseRealAIResponse] Attempting to fix JSON...');
      
      const parsed = JSON.parse(fixedJsonStr);
      console.log('✅ [parseRealAIResponse] Successfully parsed AI response after fixes');
      return parsed;
    } catch (error) {
      console.warn('❌ [parseRealAIResponse] Failed to parse AI response as JSON:', error);
      
      // Try to extract just the essential parts using regex
      try {
        console.log('🔧 [parseRealAIResponse] Attempting to extract essential parts...');
        
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
          console.log('✅ [parseRealAIResponse] Successfully parsed with minimal JSON approach');
          return parsedResponse;
        }
      } catch (minimalError) {
        console.log('🔧 [parseRealAIResponse] Minimal JSON approach failed:', minimalError.message);
      }
      
      console.warn('Using fallback parsing');
    }
  } catch (error) {
    console.warn('❌ [parseRealAIResponse] Failed to parse AI response as JSON:', error);
    console.warn('Using fallback parsing');
  }

  // Generate intelligent fallback recommendations with realistic predictions
  console.log('🔄 [Fallback] Generating intelligent fallback recommendations');
  
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
  const predictions = generateRealisticPredictions(patterns, courseData.categories, targetGPA);
  const consistencyRecs = generateConsistencyRecommendations(patterns, currentGPA, targetGPA);
  
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
      averagePredictedScore: `${(categoryPredictions.reduce((sum, p) => sum + p.predictedScore, 0) / categoryPredictions.length).toFixed(1)}/${categoryPredictions[0]?.predictedMaxScore || 15}`,
      confidence: predictions.confidence
    };
    
    assessmentRecommendations[categoryName.toLowerCase()] = {
      recommendedScore: `${Math.round(categoryPredictions.reduce((sum, p) => sum + p.predictedScore, 0) / categoryPredictions.length)}/15`,
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
        actionButton: {
          text: "View Details",
          action: "VIEW_ANALYSIS",
          enabled: true
        },
        impact: rec.action
      })),
      ...(predictions.upcomingAssessments.length > 0 ? [{
        title: "Prepare for Upcoming Assessments",
        description: `You have ${predictions.upcomingAssessments.length} categories with upcoming assessments. Based on your performance patterns, realistic predictions have been generated.`,
        priority: "HIGH",
        category: "UPCOMING_ASSESSMENTS",
        actionButton: {
          text: "View Predictions",
          action: "VIEW_PREDICTIONS",
          enabled: true
        },
        impact: "Will help you prepare effectively for upcoming assessments"
      }] : [])
    ],
    studyStrategy: {
      focus: patterns.overall.consistency === 'HIGH' ? "Maintain consistency" : "Improve consistency",
      schedule: patterns.overall.trend === 'IMPROVING' ? "Continue current schedule" : "Increase study time",
      tips: [
        `Your ${patterns.overall.consistency.toLowerCase()} consistency is ${patterns.overall.consistency === 'HIGH' ? 'excellent' : 'good'}`,
        `Performance trend is ${patterns.overall.trend.toLowerCase()}`,
        "Focus on upcoming assessments in empty categories"
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