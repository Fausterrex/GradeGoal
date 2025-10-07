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
 * Generate realistic predictions for empty categories based on performance patterns
 */
export const generateRealisticPredictions = (patterns, categories, targetGPA) => {
  const predictions = {
    upcomingAssessments: [],
    predictedScores: {},
    confidence: 'MEDIUM',
    reasoning: ''
  };

  // Find categories that could benefit from additional assessments
  // This includes completely empty categories AND categories with only one term's assessments
  const emptyCategories = categories.filter(cat => {
    const pattern = patterns.byCategory[cat.id];
    if (!pattern) return true; // Category has no data at all
    
    // Completely empty category
    if (pattern.isEmpty) return true;
    
    // Category with assessments in only one term (could benefit from more assessments)
    // This is more realistic - most courses have assessments in both terms
    if (pattern.hasMidtermAssessments && !pattern.hasFinalTermAssessments) return true;
    if (pattern.hasFinalTermAssessments && !pattern.hasMidtermAssessments) return true;
    
    // Category with very few assessments (could benefit from more)
    if (pattern.totalAssessments <= 1) return true;
    
    return false;
  });

  if (emptyCategories.length === 0) {
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

  // Generate predictions for each empty category
  emptyCategories.forEach(category => {
    const categoryPredictions = [];
    const categoryPattern = patterns.byCategory[category.id];
    
    // Determine number of assessments to predict (typically 1-3 per category)
    const assessmentCount = getTypicalAssessmentCount(category.name || category.categoryName);
    
    for (let i = 1; i <= assessmentCount; i++) {
      const predictedScore = generatePredictedScore(
        averageBaseline,
        patterns.overall.consistency,
        patterns.overall.trend,
        category.name || category.categoryName
      );
      categoryPredictions.push({
        assessmentName: `${category.name || category.categoryName} ${i}`,
        predictedScore: predictedScore.score,
        predictedMaxScore: 15, // Standard max score
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
  const emptyCount = emptyCategories.filter(cat => patterns.byCategory[cat.id]?.isEmpty).length;
  const singleTermCount = emptyCategories.filter(cat => {
    const pattern = patterns.byCategory[cat.id];
    return pattern && !pattern.isEmpty && 
           ((pattern.hasMidtermAssessments && !pattern.hasFinalTermAssessments) ||
            (pattern.hasFinalTermAssessments && !pattern.hasMidtermAssessments));
  }).length;
  
  let reasoning = `Based on your ${patterns.overall.consistency.toLowerCase()} consistency performance averaging ${averageBaseline.toFixed(1)}%`;
  
  if (emptyCount > 0 && singleTermCount > 0) {
    reasoning += `, predictions generated for ${emptyCount} empty categories and ${singleTermCount} categories with single-term assessments`;
  } else if (emptyCount > 0) {
    reasoning += `, predictions generated for ${emptyCount} empty categories`;
  } else if (singleTermCount > 0) {
    reasoning += `, predictions generated for ${singleTermCount} categories that could benefit from additional assessments`;
  }
  
  reasoning += `. These predictions assume you maintain similar performance patterns.`;
  
  predictions.reasoning = reasoning;

  return predictions;
};

/**
 * Generate a realistic score prediction based on performance patterns
 */
const generatePredictedScore = (baseline, consistency, trend, categoryName) => {
  let baseScore = baseline;
  
  // Adjust based on consistency
  if (consistency === 'HIGH') {
    // High consistency = smaller variance
    baseScore += (Math.random() - 0.5) * 4; // ±2 points
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
  
  // Ensure score is within reasonable bounds
  const finalScore = Math.max(5, Math.min(15, Math.round(baseScore)));
  
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
    reasoning: `Predicted based on ${consistency.toLowerCase()} consistency (${baseline.toFixed(1)}% average) with ${trend.toLowerCase()} trend`
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
          description: `You need to improve your average performance by ${(gap * 25).toFixed(1)}% to reach your target GPA.`,
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
