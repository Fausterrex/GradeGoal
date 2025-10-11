// ========================================
// PERFORMANCE ANALYSIS UTILITIES
// ========================================
// This file contains intelligent analysis functions for realistic AI predictions
// Based on actual performance patterns, not generic calculations

/**
 * Analyze user's performance patterns across different assessment types
 */
export const analyzePerformancePatterns = (grades, categories) => {
  const patterns = {
    overall: {
      averageScore: 0,
      totalAssessments: 0,
      consistency: 'UNKNOWN',
      trend: 'STABLE'
    },
    byCategory: {},
    predictions: {}
  };

  let totalScore = 0;
  let totalMaxScore = 0;
  let allScores = [];

  // Analyze each category
  categories.forEach(category => {
    const categoryGrades = grades[category.id] || [];
    const categoryPattern = {
      averageScore: 0,
      maxScore: 0,
      totalAssessments: categoryGrades.length,
      scores: [],
      consistency: 'UNKNOWN',
      trend: 'STABLE',
      isEmpty: categoryGrades.length === 0,
      hasMidtermAssessments: false,
      hasFinalTermAssessments: false,
      midtermCount: 0,
      finalTermCount: 0
    };

    if (categoryGrades.length > 0) {
      let categoryTotalScore = 0;
      let categoryTotalMaxScore = 0;
      
      categoryGrades.forEach(grade => {
        const score = parseFloat(grade.score) || 0;
        const maxScore = parseFloat(grade.maxScore) || 15; // Default max score
        
        // Track term-specific assessments
        if (grade.semesterTerm === 'MIDTERM') {
          categoryPattern.hasMidtermAssessments = true;
          categoryPattern.midtermCount++;
        } else if (grade.semesterTerm === 'FINAL_TERM') {
          categoryPattern.hasFinalTermAssessments = true;
          categoryPattern.finalTermCount++;
        }
        
        categoryTotalScore += score;
        categoryTotalMaxScore += maxScore;
        categoryPattern.scores.push(score);
        allScores.push(score);
        
        totalScore += score;
        totalMaxScore += maxScore;
      });

      categoryPattern.averageScore = categoryTotalScore;
      categoryPattern.maxScore = categoryTotalMaxScore;
      categoryPattern.averagePercentage = (categoryTotalScore / categoryTotalMaxScore) * 100;
      
      // Calculate consistency
      if (categoryPattern.scores.length >= 2) {
        const variance = calculateVariance(categoryPattern.scores);
        categoryPattern.consistency = variance < 2 ? 'HIGH' : variance < 5 ? 'MEDIUM' : 'LOW';
        categoryPattern.trend = calculateTrend(categoryPattern.scores);
      }
    }

    patterns.byCategory[category.id] = {
      ...categoryPattern,
      categoryName: category.name || category.categoryName,
      weight: category.weight || 0
    };
  });

  // Calculate overall patterns
  patterns.overall.totalAssessments = allScores.length;
  patterns.overall.averagePercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;
  
  if (allScores.length >= 2) {
    const variance = calculateVariance(allScores);
    patterns.overall.consistency = variance < 2 ? 'HIGH' : variance < 5 ? 'MEDIUM' : 'LOW';
    patterns.overall.trend = calculateTrend(allScores);
  }

  return patterns;
};

/**
 * Generate realistic predictions for upcoming assessments based on performance patterns
 */
export const generateRealisticPredictions = (patterns, categories, targetGPA, courseData = null) => {
  const predictions = {
    upcomingAssessments: [],
    predictedScores: {},
    confidence: 'MEDIUM',
    reasoning: ''
  };

  // Find categories that have upcoming assessments
  // Look for categories that have pending/upcoming assessments (not completed ones)
  const upcomingCategories = categories.filter(cat => {
    const pattern = patterns.byCategory[cat.id];
    if (!pattern) return false; // No pattern data, skip
    
    // Check if this category has upcoming assessments
    const categoryName = (cat.name || cat.categoryName || '').toLowerCase();
    
    // Only predict for common assessment types that typically have multiple assessments
    const hasUpcomingPotential = categoryName.includes('assignment') || 
                                categoryName.includes('exam') || 
                                categoryName.includes('project') ||
                                categoryName.includes('lab');
    
    if (!hasUpcomingPotential) return false;
    
    // If we have courseData, check for actual upcoming assessments
    if (courseData && courseData.grades) {
      const categoryGrades = courseData.grades[cat.id] || [];
      // Look for assessments that are not completed (no score or score is 0)
      const upcomingAssessments = categoryGrades.filter(grade => 
        grade.score === null || grade.score === undefined || grade.score === 0
      );
      
      // Only predict if there are actual upcoming assessments
      return upcomingAssessments.length > 0;
    }
    
    // Fallback: if no courseData, use the old logic
    return pattern.totalAssessments >= 1;
  });

  if (upcomingCategories.length === 0) {
    predictions.reasoning = 'No upcoming assessments detected. All categories have existing assessments.';
    return predictions;
  }

  // Calculate performance baseline from existing assessments
  const existingCategories = categories.filter(cat => 
    patterns.byCategory[cat.id]?.isEmpty === false
  );
  let baselineScore = 0;
  let baselineCount = 0;

  existingCategories.forEach(cat => {
    const pattern = patterns.byCategory[cat.id];
    if (pattern && pattern.scores.length > 0) {
      baselineScore += pattern.averagePercentage;
      baselineCount++;
    }
  });

  const averageBaseline = baselineCount > 0 ? baselineScore / baselineCount : 75; // Default 75%

  // Generate predictions for each upcoming category
  upcomingCategories.forEach(category => {
    const categoryPredictions = [];
    const categoryPattern = patterns.byCategory[category.id];
    
    // Get maxScore from upcoming assessments in this category
    let maxScoreToUse = null;
    
    if (courseData && courseData.grades) {
      const categoryGrades = courseData.grades[category.id] || [];
      // Look for upcoming assessments (not completed ones)
      const upcomingAssessments = categoryGrades.filter(grade => 
        grade.score === null || grade.score === undefined || grade.score === 0
      );
      
      if (upcomingAssessments.length > 0) {
        // Get maxScore from upcoming assessments
        const maxScores = upcomingAssessments.map(grade => grade.maxScore || grade.pointsPossible).filter(score => score > 0);
        if (maxScores.length > 0) {
          maxScoreToUse = Math.max(...maxScores);
        }
      }
    }
    
    // Fallback: get maxScore from existing assessments if no upcoming ones
    if (maxScoreToUse === null) {
      const categoryGrades = patterns.byCategory[category.id]?.scores || [];
      if (categoryGrades.length > 0) {
        maxScoreToUse = Math.max(...categoryGrades.map(grade => grade.maxScore));
      }
    }
    
    // If still no maxScore data, skip this category
    if (maxScoreToUse === null) {
      console.log(`Skipping predictions for ${category.name || category.categoryName} - no maxScore data available`);
      return;
    }
    
    // Determine number of assessments to predict (typically 1-3 per category)
    const assessmentCount = getTypicalAssessmentCount(category.name || category.categoryName);
    
    for (let i = 1; i <= assessmentCount; i++) {
      const predictedScore = generatePredictedScore(
        averageBaseline,
        patterns.overall.consistency,
        patterns.overall.trend,
        category.name || category.categoryName,
        maxScoreToUse // Pass actual maxScore to prediction function
      );
      categoryPredictions.push({
        assessmentName: `${category.name || category.categoryName} ${i}`,
        predictedScore: predictedScore.score,
        predictedMaxScore: maxScoreToUse, // Use actual maxScore from assessment data
        confidence: predictedScore.confidence,
        reasoning: predictedScore.reasoning
      });
    }

    predictions.predictedScores[category.id] = categoryPredictions;
    predictions.upcomingAssessments.push({
      categoryId: category.id,
      categoryName: category.name || category.categoryName,
      weight: category.weight || 0,
      predictedAssessments: categoryPredictions
    });
  });

  // Set overall confidence based on data quality
  if (patterns.overall.totalAssessments >= 5) {
    predictions.confidence = 'HIGH';
  } else if (patterns.overall.totalAssessments >= 2) {
    predictions.confidence = 'MEDIUM';
  } else {
    predictions.confidence = 'LOW';
  }

  // Generate more specific reasoning based on what was found
  const upcomingCount = upcomingCategories.length;
  const singleTermCount = upcomingCategories.filter(cat => {
    const pattern = patterns.byCategory[cat.id];
    return pattern && !pattern.isEmpty && 
           ((pattern.hasMidtermAssessments && !pattern.hasFinalTermAssessments) ||
            (pattern.hasFinalTermAssessments && !pattern.hasMidtermAssessments));
  }).length;
  
  let reasoning = `Based on your ${patterns.overall.consistency.toLowerCase()} consistency performance averaging ${averageBaseline.toFixed(2)}%`;
  
  if (upcomingCount > 0 && singleTermCount > 0) {
    reasoning += `, predictions generated for ${upcomingCount} categories with upcoming assessments and ${singleTermCount} categories with single-term assessments`;
  } else if (upcomingCount > 0) {
    reasoning += `, predictions generated for ${upcomingCount} categories with upcoming assessments`;
  } else if (singleTermCount > 0) {
    reasoning += `, predictions generated for ${singleTermCount} categories that could benefit from additional assessments`;
  } else {
    reasoning += `, no upcoming assessments detected`;
  }
  
  reasoning += `. These predictions assume you maintain similar performance patterns.`;
  
  predictions.reasoning = reasoning;

  return predictions;
};

/**
 * Generate a realistic score prediction based on performance patterns
 */
const generatePredictedScore = (baseline, consistency, trend, categoryName, maxScore) => {
  let baseScore = baseline;
  
  // Adjust based on consistency
  if (consistency === 'HIGH') {
    // High consistency = low variance, but if baseline is perfect (100%), maintain perfection
    if (baseline >= 100) {
      baseScore = maxScore; // Maintain perfect performance
    } else {
      baseScore += (Math.random() - 0.5) * 2; // ±1 point for high consistency
    }
  } else if (consistency === 'MEDIUM') {
    // Medium consistency = moderate variance
    baseScore += (Math.random() - 0.5) * 8; // ±4 points
  } else {
    // Low consistency = higher variance
    baseScore += (Math.random() - 0.5) * 12; // ±6 points
  }
  
  // Adjust based on trend
  if (trend === 'IMPROVING') {
    baseScore += 2; // Slight improvement
  } else if (trend === 'DECLINING') {
    baseScore -= 2; // Slight decline
  }
  
  // Category-specific adjustments
  if (categoryName.toLowerCase().includes('exam')) {
    baseScore -= 3; // Exams are typically harder
  } else if (categoryName.toLowerCase().includes('quiz')) {
    baseScore += 1; // Quizzes are typically easier
  }
  
  // Ensure score is within reasonable bounds based on actual maxScore
  const finalScore = Math.max(5, Math.min(maxScore, Math.round(baseScore)));
  
  // Determine confidence
  let confidence = 'MEDIUM';
  if (consistency === 'HIGH' && Math.abs(finalScore - baseline) <= 2) {
    confidence = 'HIGH';
  } else if (consistency === 'LOW' || Math.abs(finalScore - baseline) > 6) {
    confidence = 'LOW';
  }
  
  return {
    score: finalScore,
    confidence,
    reasoning: `Predicted based on ${consistency.toLowerCase()} consistency (${baseline.toFixed(2)}% average) with ${trend.toLowerCase()} trend`
  };
};

/**
 * Calculate variance in scores
 */
const calculateVariance = (scores) => {
  if (scores.length < 2) return 0;
  
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  return Math.sqrt(variance);
};

/**
 * Calculate trend in scores
 */
const calculateTrend = (scores) => {
  if (scores.length < 2) return 'STABLE';
  
  const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 1) return 'IMPROVING';
  if (difference < -1) return 'DECLINING';
  return 'STABLE';
};

/**
 * Get typical assessment count for a category
 */
const getTypicalAssessmentCount = (categoryName) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('exam')) return 1; // Usually 1 exam per term
  if (name.includes('quiz')) return 2; // Usually 2-3 quizzes
  if (name.includes('assignment')) return 2; // Usually 2-3 assignments
  if (name.includes('project')) return 1; // Usually 1 project
  
  return 2; // Default
};

/**
 * Generate consistency-based recommendations for users near their goals
 */
export const generateConsistencyRecommendations = (patterns, currentGPA, targetGPA) => {
  const gap = targetGPA - currentGPA;
  
  if (gap > 0.5) {
    // User is far from goal
    return {
      priority: 'HIGH',
      recommendations: [
        {
          title: 'Focus on Improving Performance',
          description: `You need to improve your average performance by ${(gap * 25).toFixed(2)}% to reach your target GPA.`,
          action: 'Focus on weaker categories and seek additional help.'
        }
      ]
    };
  } else if (gap > 0.1) {
    // User is close to goal
    return {
      priority: 'MEDIUM',
      recommendations: [
        {
          title: 'Maintain Consistent Performance',
          description: `You're very close to your target! Maintaining your current ${patterns.overall.consistency.toLowerCase()} consistency performance will likely achieve your goal.`,
          action: 'Keep up your current study habits and performance level.'
        },
        {
          title: 'Focus on Upcoming Assessments',
          description: 'Your upcoming assessments in empty categories will determine if you reach your target GPA.',
          action: 'Prepare thoroughly for upcoming assessments.'
        }
      ]
    };
  } else {
    // User has achieved or exceeded goal
    return {
      priority: 'LOW',
      recommendations: [
        {
          title: 'Maintain Excellence',
          description: 'You\'ve achieved your target GPA! Continue your excellent performance.',
          action: 'Keep up the great work and consider setting higher goals.'
        }
      ]
    };
  }
};
