// ========================================
// ANALYTICS SERVICE
// ========================================
// Service for calculating and processing analytics data

import { convertPercentageToGPA } from '../utils/gradeCalculations';

class AnalyticsService {
  /**
   * Calculate comprehensive analytics for a course
   * @param {Object} course - Course data
   * @param {Object} grades - Grades data
   * @param {Array} categories - Categories data
   * @param {Object} targetGrade - Target grade data
   * @returns {Object} Calculated analytics
   */
  calculateCourseAnalytics(course, grades, categories, targetGrade) {
    const allGrades = Object.values(grades).flat();
    const completedGrades = allGrades.filter(grade => 
      grade.score !== null && 
      grade.score !== undefined && 
      grade.score !== "" && 
      !isNaN(parseFloat(grade.score))
    );

    // Basic metrics
    const currentGrade = this.calculateCurrentGrade(course, grades, categories);
    const gradeTrend = this.calculateGradeTrend(completedGrades);
    const assignmentsCompleted = completedGrades.length;
    const assignmentsPending = allGrades.length - completedGrades.length;

    // Performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(
      completedGrades, 
      categories, 
      course, 
      targetGrade,
      grades
    );

    return {
      current_grade: currentGrade,
      grade_trend: gradeTrend,
      assignments_completed: assignmentsCompleted,
      assignments_pending: assignmentsPending,
      study_hours_logged: 0, // This would be tracked separately
      performance_metrics: performanceMetrics
    };
  }

  /**
   * Calculate current course grade
   */
  calculateCurrentGrade(course, grades, categories) {
    if (!categories || categories.length === 0) return 0;

    try {
      const hasAnyGrades = Object.values(grades).some(
        (categoryGrades) =>
          Array.isArray(categoryGrades) && categoryGrades.length > 0
      );

      if (!hasAnyGrades) return 0;

      // Simple calculation without importing GradeService to avoid circular dependencies
      // Calculate weighted average based on categories
      let totalWeight = 0;
      let weightedSum = 0;

      categories.forEach(category => {
        const categoryGrades = grades[category.id] || [];
        const completedGrades = categoryGrades.filter(grade => 
          grade.score !== null && 
          grade.score !== undefined && 
          grade.score !== "" && 
          !isNaN(parseFloat(grade.score))
        );

        if (completedGrades.length > 0) {
          const categoryAverage = completedGrades.reduce((sum, grade) => {
            let adjustedScore = grade.score;
            if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
              adjustedScore += grade.extraCreditPoints;
            }
            return sum + (adjustedScore / grade.maxScore) * 100;
          }, 0) / completedGrades.length;

          weightedSum += (categoryAverage * category.weight) / 100;
          totalWeight += category.weight;
        }
      });

      return totalWeight > 0 ? weightedSum : 0;
    } catch (error) {
      console.error('Error calculating current grade:', error);
      return 0;
    }
  }

  /**
   * Calculate grade trend (improving, declining, stable)
   */
  calculateGradeTrend(completedGrades) {
    if (completedGrades.length < 2) return 0;

    // Sort by date
    const sortedGrades = completedGrades
      .filter(grade => grade.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sortedGrades.length < 2) return 0;

    // Calculate percentage for each grade
    const percentages = sortedGrades.map(grade => {
      let adjustedScore = grade.score;
      if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
        adjustedScore += grade.extraCreditPoints;
      }
      return (adjustedScore / grade.maxScore) * 100;
    });

    // Calculate trend (comparing first half vs second half)
    const midPoint = Math.floor(percentages.length / 2);
    const firstHalf = percentages.slice(0, midPoint);
    const secondHalf = percentages.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;

    return secondHalfAvg - firstHalfAvg;
  }

  /**
   * Calculate comprehensive performance metrics
   */
  calculatePerformanceMetrics(completedGrades, categories, course, targetGrade, allGrades) {
    if (completedGrades.length === 0) {
      return {
        grade_trend: 0,
        study_efficiency: 0,
        assignment_completion_rate: 0,
        category_performance: {},
        time_management: {
          avg_study_hours_per_day: 0,
          most_productive_time: 'unknown',
          study_sessions_completed: 0
        },
        predictions: {
          final_grade_prediction: 0,
          gpa_trend: 'stable',
          at_risk_categories: []
        }
      };
    }

    // Calculate percentages
    const percentages = completedGrades.map(grade => {
      let adjustedScore = grade.score;
      if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
        adjustedScore += grade.extraCreditPoints;
      }
      return (adjustedScore / grade.maxScore) * 100;
    });

    // Basic statistics
    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const best = Math.max(...percentages);
    const worst = Math.min(...percentages);
    const standardDeviation = this.calculateStandardDeviation(percentages);

    // Study efficiency (based on consistency and improvement)
    const studyEfficiency = Math.max(0, 100 - standardDeviation);

    // Assignment completion rate
    const totalAssignments = Object.values(allGrades).flat().length;
    const completionRate = totalAssignments > 0 ? (completedGrades.length / totalAssignments) * 100 : 0;

    // Category performance
    const categoryPerformance = this.calculateCategoryPerformance(completedGrades, categories);

    // Predictions
    const predictions = this.calculatePredictions(
      completedGrades, 
      categories, 
      course, 
      targetGrade,
      average,
      standardDeviation
    );

    return {
      grade_trend: this.calculateGradeTrend(completedGrades),
      study_efficiency: studyEfficiency,
      assignment_completion_rate: completionRate,
      category_performance: categoryPerformance,
      time_management: {
        avg_study_hours_per_day: 0, // Would be tracked separately
        most_productive_time: 'evening', // Default assumption
        study_sessions_completed: completedGrades.length
      },
      predictions: predictions,
      statistics: {
        average,
        best,
        worst,
        standard_deviation: standardDeviation,
        total_assignments: totalAssignments,
        completed_assignments: completedGrades.length
      }
    };
  }

  /**
   * Calculate category performance
   */
  calculateCategoryPerformance(completedGrades, categories) {
    const categoryPerformance = {};

    categories.forEach(category => {
      const categoryGrades = completedGrades.filter(grade => grade.categoryId === category.id);
      
      if (categoryGrades.length > 0) {
        const percentages = categoryGrades.map(grade => {
          let adjustedScore = grade.score;
          if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
            adjustedScore += grade.extraCreditPoints;
          }
          return (adjustedScore / grade.maxScore) * 100;
        });

        categoryPerformance[category.name] = {
          average: percentages.reduce((sum, p) => sum + p, 0) / percentages.length,
          count: categoryGrades.length,
          weight: category.weight || 0
        };
      } else {
        categoryPerformance[category.name] = {
          average: 0,
          count: 0,
          weight: category.weight || 0
        };
      }
    });

    return categoryPerformance;
  }

  /**
   * Calculate predictions
   */
  calculatePredictions(completedGrades, categories, course, targetGrade, currentAverage, standardDeviation) {
    // Final grade prediction (simplified)
    const finalGradePrediction = currentAverage;

    // GPA trend
    let gpaTrend = 'stable';
    if (completedGrades.length >= 3) {
      const recentGrades = completedGrades.slice(-3);
      const olderGrades = completedGrades.slice(-6, -3);
      
      if (recentGrades.length >= 2 && olderGrades.length >= 2) {
        const recentAvg = recentGrades.reduce((sum, grade) => {
          let adjustedScore = grade.score;
          if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
            adjustedScore += grade.extraCreditPoints;
          }
          return sum + (adjustedScore / grade.maxScore) * 100;
        }, 0) / recentGrades.length;

        const olderAvg = olderGrades.reduce((sum, grade) => {
          let adjustedScore = grade.score;
          if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
            adjustedScore += grade.extraCreditPoints;
          }
          return sum + (adjustedScore / grade.maxScore) * 100;
        }, 0) / olderGrades.length;

        if (recentAvg > olderAvg + 5) gpaTrend = 'improving';
        else if (recentAvg < olderAvg - 5) gpaTrend = 'declining';
      }
    }

    // At-risk categories
    const atRiskCategories = [];
    categories.forEach(category => {
      const categoryGrades = completedGrades.filter(grade => grade.categoryId === category.id);
      if (categoryGrades.length > 0) {
        const percentages = categoryGrades.map(grade => {
          let adjustedScore = grade.score;
          if (grade.isExtraCredit && grade.extraCreditPoints && grade.extraCreditPoints > 0) {
            adjustedScore += grade.extraCreditPoints;
          }
          return (adjustedScore / grade.maxScore) * 100;
        });

        const categoryAverage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
        if (categoryAverage < 70 && category.weight >= 20) {
          atRiskCategories.push(category.name);
        }
      }
    });

    return {
      final_grade_prediction: finalGradePrediction,
      gpa_trend: gpaTrend,
      at_risk_categories: atRiskCategories
    };
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Generate study recommendations based on analytics
   */
  generateRecommendations(analytics, course, categories) {
    const recommendations = [];

    // Performance-based recommendations
    if (analytics.performance_metrics.predictions.at_risk_categories.length > 0) {
      recommendations.push({
        type: 'study_strategy',
        priority: 'high',
        title: 'Focus on At-Risk Categories',
        message: `Your performance in ${analytics.performance_metrics.predictions.at_risk_categories.join(', ')} needs attention. Consider spending more study time on these areas.`,
        action: 'study_focus',
        categories: analytics.performance_metrics.predictions.at_risk_categories
      });
    }

    // Trend-based recommendations
    if (analytics.performance_metrics.predictions.gpa_trend === 'declining') {
      recommendations.push({
        type: 'study_strategy',
        priority: 'high',
        title: 'Performance Declining',
        message: 'Your recent performance shows a declining trend. Consider reviewing your study methods or seeking additional help.',
        action: 'study_method_review'
      });
    }

    // Completion-based recommendations
    if (analytics.performance_metrics.assignment_completion_rate < 70) {
      recommendations.push({
        type: 'time_management',
        priority: 'medium',
        title: 'Improve Assignment Completion',
        message: `You've completed ${analytics.assignments_completed} out of ${analytics.assignments_completed + analytics.assignments_pending} assignments. Try to stay on top of your deadlines.`,
        action: 'deadline_management'
      });
    }

    // Efficiency recommendations
    if (analytics.performance_metrics.study_efficiency < 60) {
      recommendations.push({
        type: 'study_strategy',
        priority: 'medium',
        title: 'Improve Study Consistency',
        message: 'Your grade consistency could be improved. Consider developing a more structured study routine.',
        action: 'study_routine'
      });
    }

    // Goal-based recommendations
    if (course.targetGrade) {
      const currentGPA = convertPercentageToGPA(analytics.current_grade, course.gpaScale || "4.0");
      const targetGPA = parseFloat(course.targetGrade);
      
      if (currentGPA < targetGPA - 0.3) {
        recommendations.push({
          type: 'goal_achievement',
          priority: 'high',
          title: 'Goal Achievement Risk',
          message: `You're currently ${(targetGPA - currentGPA).toFixed(2)} points below your target GPA. Consider increasing study time or seeking additional support.`,
          action: 'goal_review'
        });
      }
    }

    return recommendations;
  }
}

export default new AnalyticsService();
