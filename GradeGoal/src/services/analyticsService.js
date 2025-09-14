// ========================================
// ANALYTICS SERVICE
// ========================================
// This service fetches and processes user analytics data including grade trends
// to enhance goal progress calculations and predictions

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? "" : "http://localhost:8080");

class AnalyticsService {
  /**
   * Fetch user analytics data for a specific course
   * @param {number} userId - User ID
   * @param {number} courseId - Course ID (optional, null for overall analytics)
   * @returns {Promise<Object>} Analytics data including grade trend
   */
  static async getUserAnalytics(userId, courseId = null) {
    try {
      const url = courseId 
        ? `${API_BASE_URL}/api/analytics/user/${userId}?courseId=${courseId}`
        : `${API_BASE_URL}/api/analytics/user/${userId}`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return {
        currentGrade: 0,
        gradeTrend: 0,
        assignmentsCompleted: 0,
        assignmentsPending: 0,
        studyHoursLogged: 0,
        performanceMetrics: {}
      };
    }
  }

  /**
   * Get the latest grade trend for a course
   * @param {number} userId - User ID
   * @param {number} courseId - Course ID
   * @returns {Promise<number>} Grade trend value (-1.0 to 1.0)
   */
  static async getGradeTrend(userId, courseId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/analytics/user/${userId}/trend?courseId=${courseId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch grade trend: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching grade trend:', error);
      return 0;
    }
  }

  /**
   * Calculate trend-based achievement probability
   * @param {number} currentValue - Current grade/progress
   * @param {number} targetValue - Target grade/progress
   * @param {number} gradeTrend - Grade trend (-1.0 to 1.0)
   * @param {string} goalType - Type of goal
   * @param {Date} targetDate - Target completion date
   * @returns {number} Enhanced achievement probability (0-100)
   */
  static calculateTrendBasedProbability(currentValue, targetValue, gradeTrend, goalType, targetDate) {
    if (!targetValue || targetValue <= 0) return 0;
    if (currentValue >= targetValue) return 100;
    if (currentValue <= 0) return 0;

    // Base probability from current progress
    const baseProgress = (currentValue / targetValue) * 100;
    
    // Trend factor (trend influence on probability)
    const trendFactor = gradeTrend * 15; // 15% influence from trend
    
    // Time factor
    let timeFactor = 1;
    if (targetDate) {
      const now = new Date();
      const target = new Date(targetDate);
      const totalDays = Math.max((target - now) / (1000 * 60 * 60 * 24), 1);
      const daysElapsed = Math.max(365 - totalDays, 0);
      
      if (totalDays > 0) {
        timeFactor = Math.min(daysElapsed / 365, 1);
      }
    }

    // Goal type modifiers
    let modifier = 1;
    switch (goalType) {
      case 'COURSE_GRADE':
        modifier = 1.1;
        break;
      case 'SEMESTER_GPA':
        modifier = 1.0;
        break;
      case 'CUMMULATIVE_GPA':
        modifier = 0.9;
        break;
    }

    // Calculate enhanced probability
    let probability = baseProgress + trendFactor;
    probability *= modifier;
    
    // Apply time factor as bonus
    if (targetDate) {
      const timeBonus = timeFactor * 0.1;
      probability += timeBonus * 100;
    }

    // Ensure realistic bounds
    const minimumProbability = Math.min(baseProgress * 0.7, 50);
    probability = Math.max(probability, minimumProbability);

    return Math.min(Math.max(probability, 0), 100);
  }

  /**
   * Determine enhanced goal status based on trend
   * @param {number} currentValue - Current grade/progress
   * @param {number} targetValue - Target grade/progress
   * @param {number} gradeTrend - Grade trend (-1.0 to 1.0)
   * @param {boolean} isAchieved - Whether goal is already achieved
   * @param {boolean} isCloseToGoal - Whether close to goal
   * @param {boolean} isOnTrack - Whether on track
   * @returns {string} Enhanced status
   */
  static getTrendBasedStatus(currentValue, targetValue, gradeTrend, isAchieved, isCloseToGoal, isOnTrack) {
    if (isAchieved) {
      return 'achieved';
    }
    
    if (isCloseToGoal) {
      return 'close_to_goal';
    }
    
    if (isOnTrack) {
      if (gradeTrend > 0.2) {
        return 'improving'; // Strong positive trend
      } else if (gradeTrend < -0.1) {
        return 'at_risk'; // Declining trend
      } else {
        return 'on_track'; // Stable trend
      }
    }
    
    if (gradeTrend > 0.3) {
      return 'improving'; // Strong improvement despite low progress
    } else if (gradeTrend < -0.2) {
      return 'declining'; // Strong decline
    } else {
      return 'needs_improvement';
    }
  }

  /**
   * Predict final grade based on current trend
   * @param {number} currentGrade - Current grade
   * @param {number} gradeTrend - Grade trend per week
   * @param {number} daysRemaining - Days until completion
   * @returns {number} Predicted final grade
   */
  static predictFinalGrade(currentGrade, gradeTrend, daysRemaining) {
    const weeksRemaining = Math.max(daysRemaining / 7, 0);
    const predictedChange = gradeTrend * weeksRemaining;
    return Math.max(0, Math.min(4.0, currentGrade + predictedChange));
  }

  /**
   * Get trend-based recommendations
   * @param {number} gradeTrend - Grade trend (-1.0 to 1.0)
   * @param {string} status - Current goal status
   * @returns {Array} Array of recommendation strings
   */
  static getTrendBasedRecommendations(gradeTrend, status) {
    const recommendations = [];
    
    if (gradeTrend > 0.3) {
      recommendations.push("🎉 Excellent progress! Keep up the momentum!");
    } else if (gradeTrend > 0.1) {
      recommendations.push("📈 Good improvement! You're on the right track.");
    } else if (gradeTrend < -0.2) {
      recommendations.push("⚠️ Grade declining. Consider reviewing study strategies.");
    } else if (gradeTrend < -0.1) {
      recommendations.push("📉 Slight decline. Focus on areas needing improvement.");
    } else {
      recommendations.push("📊 Stable performance. Consider setting higher goals.");
    }
    
    switch (status) {
      case 'at_risk':
        recommendations.push("🚨 At risk of not meeting goal. Consider extra study time.");
        break;
      case 'improving':
        recommendations.push("💪 Great momentum! Maintain this pace to reach your goal.");
        break;
      case 'declining':
        recommendations.push("🔄 Time to reassess. Consider seeking help or adjusting study methods.");
        break;
    }
    
    return recommendations;
  }

  /**
   * Get trend color scheme for UI
   * @param {number} gradeTrend - Grade trend (-1.0 to 1.0)
   * @returns {Object} Color scheme object
   */
  static getTrendColorScheme(gradeTrend) {
    if (gradeTrend > 0.2) {
      return {
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-500',
        icon: '📈'
      };
    } else if (gradeTrend > 0.1) {
      return {
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-500',
        icon: '📊'
      };
    } else if (gradeTrend < -0.2) {
      return {
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-500',
        icon: '📉'
      };
    } else if (gradeTrend < -0.1) {
      return {
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-500',
        icon: '⚠️'
      };
    } else {
      return {
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-500',
        icon: '➡️'
      };
    }
  }

  /**
   * Calculate course analytics for a specific course
   * @param {Object} course - Course object
   * @param {Object} grades - Grades object
   * @param {Array} categories - Categories array
   * @param {number} targetGrade - Target grade
   * @returns {Object} Course analytics data
   */
  static calculateCourseAnalytics(course, grades, categories, targetGrade) {
    try {
      // Calculate current grade
      let currentGrade = 0;
      let totalWeight = 0;
      let assignmentsCompleted = 0;
      let assignmentsPending = 0;

      // Calculate category averages and counts
      categories.forEach(category => {
        const categoryGrades = grades[category.id] || [];
        const categoryWeight = category.weightPercentage || category.weight || 0;
        
        if (categoryGrades.length > 0) {
          // Calculate category average
          const categoryTotal = categoryGrades.reduce((sum, grade) => {
            if (grade.score !== null && grade.score !== undefined && !isNaN(parseFloat(grade.score))) {
              return sum + parseFloat(grade.score);
            }
            return sum;
          }, 0);
          
          const categoryAverage = categoryTotal / categoryGrades.length;
          currentGrade += (categoryAverage * categoryWeight) / 100;
          assignmentsCompleted += categoryGrades.length;
        } else {
          assignmentsPending += 1; // Assume 1 pending per category without grades
        }
        
        totalWeight += categoryWeight;
      });

      // Normalize current grade if total weight is not 100%
      if (totalWeight > 0 && totalWeight !== 100) {
        currentGrade = (currentGrade / totalWeight) * 100;
      }

      // Calculate grade trend (simplified - would normally compare with previous data)
      const gradeTrend = 0; // This would be calculated from historical data

      // Calculate performance metrics
      const performanceMetrics = {
        currentGrade: currentGrade,
        targetGrade: targetGrade || 0,
        assignmentsCompleted: assignmentsCompleted,
        assignmentsPending: assignmentsPending,
        completionRate: assignmentsCompleted / (assignmentsCompleted + assignmentsPending) * 100,
        gradeTrend: gradeTrend
      };

      return {
        current_grade: currentGrade,
        grade_trend: gradeTrend,
        assignments_completed: assignmentsCompleted,
        assignments_pending: assignmentsPending,
        study_hours_logged: 0,
        performance_metrics: performanceMetrics
      };
    } catch (error) {
      console.error('Error calculating course analytics:', error);
      return {
        current_grade: 0,
        grade_trend: 0,
        assignments_completed: 0,
        assignments_pending: 0,
        study_hours_logged: 0,
        performance_metrics: {}
      };
    }
  }

  /**
   * Generate smart recommendations based on analytics data
   * @param {Object} userAnalytics - User analytics data
   * @param {Object} course - Course object
   * @param {Array} categories - Categories array
   * @returns {Array} Array of recommendation objects
   */
  static generateRecommendations(userAnalytics, course, categories) {
    try {
      const recommendations = [];
      
      if (!userAnalytics) {
        return recommendations;
      }

      const currentGrade = userAnalytics.current_grade || 0;
      const gradeTrend = userAnalytics.grade_trend || 0;
      const assignmentsCompleted = userAnalytics.assignments_completed || 0;
      const assignmentsPending = userAnalytics.assignments_pending || 0;

      // Grade trend based recommendations
      if (gradeTrend > 0.2) {
        recommendations.push({
          id: 'trend-excellent',
          type: 'performance',
          priority: 'low',
          title: 'Excellent Progress!',
          message: `Your grades are improving by ${gradeTrend.toFixed(2)} points per week. Keep up the great work!`,
          action: 'maintain_momentum'
        });
      } else if (gradeTrend < -0.1) {
        recommendations.push({
          id: 'trend-declining',
          type: 'study_strategy',
          priority: 'high',
          title: 'Performance Declining',
          message: `Your grades are declining by ${Math.abs(gradeTrend).toFixed(2)} points per week. Consider reviewing your study methods.`,
          action: 'study_method_review'
        });
      }

      // Assignment completion recommendations
      const totalAssignments = assignmentsCompleted + assignmentsPending;
      if (totalAssignments > 0) {
        const completionRate = (assignmentsCompleted / totalAssignments) * 100;
        
        if (completionRate < 50) {
          recommendations.push({
            id: 'completion-very-low',
            type: 'time_management',
            priority: 'high',
            title: 'Low Assignment Completion',
            message: `Only ${completionRate.toFixed(0)}% of assignments completed. Focus on completing pending work.`,
            action: 'deadline_management'
          });
        } else if (completionRate < 75) {
          recommendations.push({
            id: 'completion-low',
            type: 'time_management',
            priority: 'medium',
            title: 'Moderate Assignment Completion',
            message: `${completionRate.toFixed(0)}% completion rate. Try to stay on top of assignments.`,
            action: 'deadline_management'
          });
        }
      }

      // Grade level recommendations
      if (currentGrade > 0) {
        if (currentGrade < 60) {
          recommendations.push({
            id: 'grade-failing',
            type: 'study_strategy',
            priority: 'high',
            title: 'Failing Grade Alert',
            message: `Current grade is ${currentGrade.toFixed(1)}%. Immediate action needed to improve performance.`,
            action: 'urgent_study_focus'
          });
        } else if (currentGrade < 70) {
          recommendations.push({
            id: 'grade-poor',
            type: 'study_strategy',
            priority: 'high',
            title: 'Poor Performance',
            message: `Current grade is ${currentGrade.toFixed(1)}%. Focus on improving study strategies.`,
            action: 'study_method_review'
          });
        } else if (currentGrade >= 90) {
          recommendations.push({
            id: 'grade-excellent',
            type: 'performance',
            priority: 'low',
            title: 'Excellent Performance',
            message: `Outstanding work! Current grade is ${currentGrade.toFixed(1)}%. Keep maintaining this level.`,
            action: 'maintain_performance'
          });
        }
      }

      // Category-specific recommendations
      categories.forEach(category => {
        const categoryWeight = category.weightPercentage || category.weight || 0;
        
        if (categoryWeight > 30) { // High weight categories
          recommendations.push({
            id: `category-high-weight-${category.id}`,
            type: 'study_strategy',
            priority: 'medium',
            title: `Focus on ${category.name}`,
            message: `${category.name} is worth ${categoryWeight}% of your grade. Prioritize this category.`,
            action: 'study_focus',
            categories: [category.name]
          });
        }
      });

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }
}

export default AnalyticsService;